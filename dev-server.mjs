import net from 'net';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getCertificate } from '@vitejs/plugin-basic-ssl';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  const PORT = 3000;
  const ALT_PORT = 5173;

  // Obtain SSL certificate for HTTPS support
  const certData = await getCertificate(path.join(__dirname, '.ssl'));

  // Create Vite in middleware mode
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: true
    },
    appType: 'spa'
  });

  // Universal TTS Audio Handler
  const handleTTS = async (req, res) => {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const text = urlObj.searchParams.get('q');
      const lang = urlObj.searchParams.get('tl') || 'en';

      if (!text) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing text query parameter (q)');
        return;
      }

      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
      
      const ttsResponse = await fetch(googleTtsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS upstream error: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();

      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      });

      res.end(Buffer.from(audioBuffer));
    } catch (err) {
      console.warn("TTS Error:", err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  };

  // High-accuracy Network Time Handler (Asia/Kolkata)
  const handleTime = async (req, res) => {
    const now = new Date();
    res.writeHead(200, { 
      'Content-Type': 'application/json', 
      'Access-Control-Allow-Origin': '*' 
    });
    res.end(JSON.stringify({ 
      iso: now.toISOString(), 
      timestamp: now.getTime() 
    }));
  };

  const app = (req, res) => {
    if (req.url && req.url.startsWith('/api/tts')) {
      handleTTS(req, res);
      return;
    }
    if (req.url && req.url.startsWith('/api/time')) {
      handleTime(req, res);
      return;
    }
    vite.middlewares(req, res);
  };

  const httpServer = http.createServer(app);
  const httpsServer = https.createServer({ key: certData, cert: certData }, app);

  function createDualServer(port) {
    const server = net.createServer((socket) => {
      socket.once('data', (buffer) => {
        // 0x16 is the TLS handshake record byte
        if (buffer[0] === 0x16) {
          httpsServer.emit('connection', socket);
        } else {
          httpServer.emit('connection', socket);
        }
        socket.unshift(buffer);
      });
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`\n🚀 WeatherGPT Dual Server listening on port ${port}:`);
      console.log(`  👉 HTTP:  http://localhost:${port}/   (or http://127.0.0.1:${port}/)`);
      console.log(`  👉 HTTPS: https://localhost:${port}/  (or https://127.0.0.1:${port}/)\n`);
    });

    return server;
  }

  // Listen on both port 3000 and 5173
  createDualServer(PORT);
  createDualServer(ALT_PORT);
}

start().catch(err => {
  console.error("Server start error:", err);
  process.exit(1);
});
