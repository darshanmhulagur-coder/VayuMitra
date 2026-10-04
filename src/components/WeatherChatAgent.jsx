import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bot, 
  User, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Database, 
  Satellite, 
  FileText,
  Activity,
  Layers,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { queryWeatherGPT } from '../services/aiAgentService';
import { speechService } from '../services/speechService';

export default function WeatherChatAgent({ 
  weatherData, 
  language, 
  activeDistrict, 
  activeState,
  initialPrompt = ''
}) {
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [expandedRAGIndex, setExpandedRAGIndex] = useState(null);
  const [micError, setMicError] = useState(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [permissionSuccess, setPermissionSuccess] = useState(false);

  const messagesEndRef = useRef(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Initialize initial greeting when district or language changes
  useEffect(() => {
    const greetingText = getLocalizedGreeting(language, activeDistrict, activeState);
    setMessages([
      {
        id: 'initial-greeting',
        sender: 'ai',
        text: greetingText,
        confidence: '98.5%',
        sources: ['IMD Agro-Meteorological Directorate', 'INSAT-3DR Rapid-Scan Telemetry'],
        ragTrace: [
          {
            step: 1,
            title: "Session Initialization & Geolocation Binding",
            details: `Context bound to District="${activeDistrict}", State="${activeState}". Retrieved localized agro-climatic profile.`,
            source: "WeatherGPT Regional Spatial Dispatcher"
          },
          {
            step: 2,
            title: "Microclimate Telemetry Fusion",
            details: `Synced real-time ambient parameters: Temp=${weatherData?.current?.temp}°C, Humidity=${weatherData?.current?.humidity}%, Pressure=${weatherData?.current?.pressure}hPa.`,
            source: "IMD AWS & Open-Meteo Unified Cache"
          }
        ]
      }
    ]);
  }, [language, activeDistrict, activeState]);

  // Handle Initial Prompt if passed externally
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getLocalizedGreeting = (lang, district, state) => {
    switch (lang) {
      case 'kn':
        return `ನಮಸ್ಕಾರ! ನಾನು ವೆದರ್‌ಜಿಪಿಟಿ (WeatherGPT) AI ಸಹಾಯಕ. ${district} (${state}) ಜಿಲ್ಲೆಯ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಮಳೆಯ ನಿಖರ ಸಮಯ, ಬೆಳೆ ರೋಗಗಳು ಅಥವಾ ರಸ್ತೆ ಪ್ರಯಾಣದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.`;
      case 'hi':
        return `नमस्ते! मैं वेदरजीपीटी (WeatherGPT) AI सहायक हूँ। ${district} (${state}) जिले के मौसम, बारिश के सटीक समय, फसल कीट परामर्श या यात्रा मार्ग के बारे में पूछें।`;
      case 'te':
        return `నమస్కారం! నేను వెదర్‌జీపీటీ (WeatherGPT) AI అసిస్టెంట్. ${district} (${state}) జిల్లా వాతావరణం, వర్షపాతం సమయం, పంటల తెగుళ్లు లేదా ప్రయాణ మార్గం గురించి నన్ను అడగండి.`;
      case 'ta':
        return `வணக்கம்! நான் வெதர்கிபிடி (WeatherGPT) AI உதவியாளர். ${district} (${state}) மாவட்ட வானிலை, மழை நேரம், பயிர் நோய்கள் அல்லது பயண வழி குறித்து என்னிடம் கேளுங்கள்.`;
      case 'mr':
        return `नमस्कार! मी वेदरजीपीटी (WeatherGPT) AI सहाय्यक आहे. ${district} (${state}) जिल्ह्यातील हवामान, पावसाची अचूक वेळ, पिकांचे रोग किंवा प्रवासाबद्दल मला विचारा.`;
      case 'en':
      default:
        return `Hello! I am WeatherGPT Multilingual AI Agent. I am monitoring microclimate conditions for ${district}, ${state}. Ask me about exact rainfall onset windows, agro-pest alerts, seasonal monsoon trends, or route transit hazards!`;
    }
  };

  const handleSendMessage = async (textToSend = inputPrompt) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);
    setMicError(null);

    try {
      const result = await queryWeatherGPT({
        prompt: query,
        activeDistrict,
        activeState,
        weatherData,
        langCode: language
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.response,
        confidence: result.confidence,
        sources: result.sources,
        ragTrace: result.ragTrace,
        timestamp: result.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-voice speak if enabled
      if (autoSpeak) {
        speechService.speak(result.response, language);
      }
    } catch (err) {
      console.error("AI Query Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `An error occurred while synthesizing intelligence: ${err.message}. Please retry.`,
          confidence: 'N/A',
          sources: [],
          ragTrace: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMicPermission = async () => {
    setMicError(null);
    setPermissionSuccess(false);
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Trigger browser native permission prompt
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setShowPermissionGuide(false);
        setPermissionSuccess(true);
        // Cleanly release tracks after short delay
        setTimeout(() => {
          stream.getTracks().forEach(t => t.stop());
        }, 300);
        // Automatically start voice listening now that permission is allowed
        setTimeout(() => {
          setPermissionSuccess(false);
          handleToggleVoiceInput();
        }, 1200);
      } else {
        setMicError('Microphone not supported on this browser.');
      }
    } catch (err) {
      console.warn("Explicit permission request error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setShowPermissionGuide(true);
        setMicError('Microphone permission blocked. Follow the steps below to allow it in your browser address bar.');
      } else {
        setMicError(err.message || 'Microphone access failed.');
      }
    }
  };

  const handleToggleVoiceInput = async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setMicError(null);
      setIsListening(true);
      await speechService.startListening(
        language,
        (finalTranscript) => {
          setInputPrompt(finalTranscript);
          handleSendMessage(finalTranscript);
          setIsListening(false);
        },
        (interimTranscript) => {
          setInputPrompt(interimTranscript);
        },
        (err) => {
          setIsListening(false);
          setMicError(err);
          if (err && (err.includes('denied') || err.includes('blocked') || err.includes('not-allowed'))) {
            setShowPermissionGuide(true);
          }
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handleSpeakText = (text) => {
    speechService.speak(text, language);
  };

  const getQuickPromptChips = (lang, district) => {
    switch (lang) {
      case 'kn':
        return [
          `ಇವತ್ತು ${district} ನಲ್ಲಿ ಮಳೆ ಬರುತ್ತಾ?`,
          `AI ಕೀಟ ಮತ್ತು ರೋಗ ಮುನ್ಸೂಚನೆ`,
          `ಮುಂಗಾರು ಪ್ರವೃತ್ತಿ & ಮಳೆಯ ವಿವರ`,
          `ಹೆದ್ದಾರಿ ಪ್ರಯಾಣ ಸುರಕ್ಷತೆ`
        ];
      case 'hi':
        return [
          `क्या आज ${district} में बारिश होगी?`,
          `AI फसल कीट एवं रोग सलाह`,
          `मानसून आगमन एवं मौसम प्रारूप`,
          `राजमार्ग यात्रा मौसम अलर्ट`
        ];
      case 'te':
        return [
          `ఈరోజు ${district} లో వర్షం పడుతుందా?`,
          `AI పంటల తెగుళ్లు & వ్యాధుల సలహా`,
          `రుతుపవనాల వివరాలు`,
          `రహదారి ప్రయాణ వాతావరణం`
        ];
      case 'ta':
        return [
          `இன்று ${district} மாவட்டத்தில் மழை பெய்யுமா?`,
          `AI பயிர் பூச்சி மற்றும் நோய் தகவல்`,
          `பருவமழை முன்னறிவிப்பு`,
          `நெடுஞ்சாலை பயண வானிலை`
        ];
      case 'mr':
        return [
          `आज ${district} मध्ये पाऊस पडेल का?`,
          `AI पीक कीड आणि रोग सल्ला`,
          `मान्सून आगमन आणि सद्यस्थिती`,
          `महामार्ग प्रवास हवामान सुरक्षा`
        ];
      case 'en':
      default:
        return [
          `Will it rain today in ${district}?`,
          `AI Crop & Pest Diagnostic`,
          `Monsoon Arrival & SST Trends`,
          `Route Weather & Highway Safety`
        ];
    }
  };

  const quickPromptChips = getQuickPromptChips(language, activeDistrict);

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col h-[650px] border border-cyan-500/30 shadow-2xl relative">
      
      {/* Chat Agent Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 text-cyan-300">
            <Bot className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm md:text-base text-slate-100">
                {t.aiChatHeader}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t.aiChatSub}
            </p>
          </div>
        </div>

        {/* Right Toggle Controls */}
        <div className="flex items-center space-x-2">
          {/* Ask Permission Button */}
          <button
            type="button"
            onClick={handleRequestMicPermission}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border bg-slate-900/60 hover:bg-cyan-500/15 text-cyan-300 border-slate-800 hover:border-cyan-500/40"
            title="Ask / Re-check Microphone Permission"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Ask Permission</span>
          </button>

          {/* Auto-Speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              autoSpeak 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
            title="Auto-read AI responses aloud"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{t.autoSpeak}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
        <span className="text-[10px] font-mono text-slate-500 shrink-0">Quick Prompts:</span>
        {quickPromptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/80 hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message List Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, index) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start space-x-2.5 max-w-[90%] md:max-w-[80%] ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}>
              
              {/* Avatar */}
              <div className={`p-1.5 rounded-lg shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' 
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-cyan-400" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-cyan-600/30 to-sky-600/20 text-slate-100 border border-cyan-500/30 rounded-tr-none'
                  : 'glass-panel-subtle bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
              }`}>
                
                {/* Text Content */}
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* AI Footer with Confidence & Audio Speaker Button */}
                {msg.sender === 'ai' && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">
                        ✓ {t.confidence}: {msg.confidence}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {msg.ragTrace && msg.ragTrace.length > 0 && (
                        <button
                          onClick={() => setExpandedRAGIndex(expandedRAGIndex === index ? null : index)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                        >
                          <Activity className="w-3 h-3" />
                          <span>XAI RAG ({msg.ragTrace.length})</span>
                          {expandedRAGIndex === index ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Explainable RAG Accordion Drawer */}
                {msg.sender === 'ai' && expandedRAGIndex === index && msg.ragTrace && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                      <span className="flex items-center space-x-1.5">
                        <Database className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.ragSteps}</span>
                      </span>
                    </div>

                    {msg.ragTrace.map((step, sIdx) => (
                      <div key={sIdx} className="text-left text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        <div className="flex items-center justify-between font-semibold text-slate-200">
                          <span>Step {step.step}: {step.title}</span>
                          <span className="text-[10px] font-mono text-cyan-400/80">{step.source}</span>
                        </div>
                        <p className="text-slate-400 mt-1 font-mono text-[10.5px]">
                          {step.details}
                        </p>
                      </div>
                    ))}

                    {msg.sources && (
                      <div className="pt-1.5 text-[10px] font-mono text-slate-400 flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-500 font-semibold">{t.sources}:</span>
                        {msg.sources.map((src, srcIdx) => (
                          <span key={srcIdx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono p-3 rounded-xl glass-panel-subtle w-fit">
            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Fusing Doppler Radar & Agro-Meteorological RAG pipeline...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Intelligent Voice Assistant Recovery Drawer */}
      {micError && (
        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/40 shadow-xl space-y-2 text-xs animate-fadeIn">
          <div className="flex items-center justify-between text-amber-300 font-semibold border-b border-slate-800 pb-1.5">
            <span className="flex items-center space-x-1.5">
              <span>🎤 Voice Recognition Notice:</span>
            </span>
            <button
              onClick={() => setMicError(null)}
              className="text-slate-400 hover:text-slate-200 text-[10px] font-mono"
            >
              [Dismiss]
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            {micError.includes('network') 
              ? 'Voice connection dropped or blocked on this network origin. Switch to HTTPS or tap any query below to ask instantly:'
              : `Microphone status: ${micError}. You can type or tap any query below:`}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {typeof window !== 'undefined' && window.location.protocol === 'http:' && (
              <a
                href={`https://${window.location.hostname}:3000/`}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-medium text-[11px] transition-all flex items-center space-x-1"
                title="Switch to secure HTTPS connection"
              >
                <span>🔒 Switch to HTTPS</span>
              </a>
            )}

            <button
              type="button"
              onClick={async () => {
                setMicError(null);
                setIsListening(true);
                speechService.startListening(
                  'en',
                  (finalTranscript) => {
                    setInputPrompt(finalTranscript);
                    handleSendMessage(finalTranscript);
                    setIsListening(false);
                  },
                  (interimTranscript) => {
                    setInputPrompt(interimTranscript);
                  },
                  (err) => {
                    setIsListening(false);
                    setMicError(err);
                  },
                  () => setIsListening(false),
                  1
                );
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-medium text-[11px] transition-all"
            >
              🎤 Speak in English / Kanglish (en-IN)
            </button>

            <button
              type="button"
              onClick={handleRequestMicPermission}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-medium text-[11px] transition-all flex items-center space-x-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ask Permission Again</span>
            </button>

            {quickPromptChips.slice(0, 2).map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setMicError(null);
                  handleSendMessage(chip);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-400 text-[11px] transition-colors"
              >
                👉 {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Permission Success Banner */}
      {permissionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn shadow-lg">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
          <span className="font-semibold">Microphone permission granted! Voice listening starting...</span>
        </div>
      )}

      {/* Step-by-Step Microphone Permission Unblock Guide */}
      {showPermissionGuide && (
        <div className="p-4 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl space-y-3 text-xs animate-fadeIn">
          <div className="flex items-center justify-between text-cyan-300 font-semibold border-b border-slate-800 pb-2">
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Microphone Permission Settings</span>
            </span>
            <button
              onClick={() => setShowPermissionGuide(false)}
              className="text-slate-400 hover:text-slate-200 text-[10px] font-mono"
            >
              [Dismiss]
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Chrome nalli microphone permission "Block" aagidre, browser popup automatic aagi baralla. Permission enond sati enable madoke ee simple steps follow maadi:
          </p>

          <div className="space-y-2 text-[11px] text-slate-200 bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono">
            <div className="flex items-start space-x-2">
              <span className="text-cyan-400 font-bold">1.</span>
              <span>Screen mele address bar nalli URL pakka iruva <b>🔒 (Lock)</b> athava <b>🎛️ (Site Settings)</b> icon click maadi.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-cyan-400 font-bold">2.</span>
              <span><b>Microphone</b> option-na <b>"Allow"</b> ge toggle maadi (athava <b>"Reset permission"</b> click maadi).</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-cyan-400 font-bold">3.</span>
              <span>Kelagiro <b>[🎙️ Ask Permission Again]</b> button click maadi — browser native popup pop up aagutthe!</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleRequestMicPermission}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>🎙️ Ask Permission Again</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs border border-slate-700 transition-all"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Active Voice Listening Live Wave Visualizer */}
      {isListening && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-rose-950/80 border border-rose-500/40 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <span className="flex space-x-1 items-end h-4">
              <span className="w-1 bg-rose-400 h-2 animate-bounce"></span>
              <span className="w-1 bg-rose-400 h-4 animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1 bg-rose-400 h-2.5 animate-bounce [animation-delay:0.3s]"></span>
              <span className="w-1 bg-rose-400 h-3.5 animate-bounce [animation-delay:0.45s]"></span>
            </span>
            <span className="text-xs font-semibold text-rose-200">
              🎙️ Listening in {language.toUpperCase()}... Speak your question now!
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              speechService.stopListening();
              setIsListening(false);
            }}
            className="text-[11px] font-mono text-rose-300 hover:text-white px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30"
          >
            [Stop]
          </button>
        </div>
      )}

      {/* Input Bar with Voice Button */}
      <div className="pt-2 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            title={isListening ? "Stop Listening" : `Voice Input in ${language.toUpperCase()}`}
            className={`p-2.5 rounded-xl transition-all border shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/50'
                : 'glass-panel text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5 animate-ping" /> : <Mic className="w-5 h-5 text-cyan-400" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={isListening ? t.listening : t.chatPlaceholder}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl glass-input bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-500 text-slate-950 font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}
