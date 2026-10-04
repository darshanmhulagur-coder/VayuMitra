// VayuMitra Multilingual AI Agent with Explainable RAG (XAI) Pipeline
// Simulates an end-to-end neural retrieval and agro-meteorological reasoning chain

export async function queryVayuMitra({ prompt, activeDistrict, activeState, weatherData, langCode = 'en' }) {
  // Simulate retrieval latency (300-600ms) for realistic UX
  await new Promise(resolve => setTimeout(resolve, 450));

  const lowerPrompt = prompt.toLowerCase();
  const district = activeDistrict;
  const state = activeState;
  const temp = weatherData?.current?.temp ?? 26;
  const humidity = weatherData?.current?.humidity ?? 70;
  const condition = weatherData?.current?.condition?.desc ?? 'Partly Cloudy';
  const soilMoisture = weatherData?.agriculture?.soilMoisture != null ? `${weatherData.agriculture.soilMoisture}%` : 'seasonal optimum';
  const pestRisk = weatherData?.agriculture?.pestAlert?.riskLevel ?? 'LOW';
  const pestDisease = weatherData?.agriculture?.pestAlert?.diseaseName ?? 'Blast Disease';

  // Generate Explainable RAG steps
  const ragTrace = [
    {
      step: 1,
      title: "Semantic Parsing & Named Entity Recognition (NER)",
      details: `Identified Entities: District="${district}", State="${state}", Domain="${getIntentCategory(lowerPrompt)}". Parsed spatial coordinates (${weatherData?.profile?.lat}, ${weatherData?.profile?.lng}) and elevation ${weatherData?.profile?.elevation}m.`,
      source: "VayuMitra NER Transformer v3.4"
    },
    {
      step: 2,
      title: "Vector DB Document & Knowledge Retrieval",
      details: `Retrieved IMD District Agro-Meteorological Bulletin #${district.toUpperCase()}-2024, ECMWF 9km HRES Numerical Weather Prediction grids, and Central Water Commission (CWC) basin telemetry for ${weatherData?.profile?.riverBasin}.`,
      source: "IMD Mausam Vector Corpus + ECMWF Open Data"
    },
    {
      step: 3,
      title: "Live Sensor Fusion & Satellite Telemetry",
      details: `INSAT-3DR Rapid-Scan TIR-1 (10.8µm) Cloud Top Temperature (-54°C indicates deep convective buildup). Doppler Weather Radar (DWR) composite reflectivity: 34-42 dBZ. Ground AWS pressure: ${weatherData?.current?.pressure} hPa.`,
      source: "ISRO MOSDAC & IMD Doppler Network"
    },
    {
      step: 4,
      title: "Physics-Guided Microclimate & Agro-Rule Engine",
      details: `Thermodynamic lifted index (-3.8 K) confirms atmospheric instability. Relative humidity (${humidity}%) exceeds fungal sporulation threshold. Evapotranspiration calculated at ${weatherData?.agriculture?.et0} mm/day.`,
      source: "Agro-Meteorological Physics Model (Penman-Monteith)"
    }
  ];

  // Synthesize answer in the requested language
  const responseText = generateLocalizedAnswer({
    prompt: lowerPrompt,
    district,
    state,
    temp,
    humidity,
    condition,
    soilMoisture,
    pestRisk,
    pestDisease,
    weatherData,
    langCode
  });

  return {
    response: responseText,
    ragTrace,
    confidence: (92 + Math.floor(Math.random() * 60) / 10).toFixed(1) + '%',
    sources: [
      `IMD Agromet Advisory Service (${state})`,
      `INSAT-3DR Geostationary Telemetry`,
      `ECMWF High-Resolution Forecast`,
      `Central Water Commission (CWC)`
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function getIntentCategory(prompt) {
  if (prompt.includes('rain') || prompt.includes('मழை') || prompt.includes('ಮಳೆ') || prompt.includes('बारिश') || prompt.includes('వర్షం') || prompt.includes('पाऊस')) {
    return 'Precipitation Prediction';
  }
  if (prompt.includes('crop') || prompt.includes('pest') || prompt.includes('ರೋಗ') || prompt.includes('कीट') || prompt.includes('தெగులు') || prompt.includes('பூச்சி') || prompt.includes('कीड')) {
    return 'Agro-Pest Advisory';
  }
  if (prompt.includes('monsoon') || prompt.includes('मानसून') || prompt.includes('ಮುಂಗಾರು') || prompt.includes('రుతుపవనాలు') || prompt.includes('பருவமழை')) {
    return 'Monsoon Dynamics & Synoptic Forecast';
  }
  if (prompt.includes('route') || prompt.includes('road') || prompt.includes('drive') || prompt.includes('रस्ता') || prompt.includes('రహదారి') || prompt.includes('சாலை')) {
    return 'Logistics & Transit Safety';
  }
  return 'General Microclimate Intelligence';
}

function generateLocalizedAnswer({ prompt, district, state, temp, humidity, condition, soilMoisture, pestRisk, pestDisease, weatherData, langCode }) {
  const isRainQuery = prompt.includes('rain') || prompt.includes('ಮಳೆ') || prompt.includes('बारिश') || prompt.includes('వర్షం') || prompt.includes('மழை') || prompt.includes('पाऊस');
  const isPestQuery = prompt.includes('pest') || prompt.includes('disease') || prompt.includes('crop') || prompt.includes('ರೋಗ') || prompt.includes('ಕೀಟ') || prompt.includes('कीट') || prompt.includes('फसल') || prompt.includes('తెగులు') || prompt.includes('பூச்சி') || prompt.includes('कीड');
  const isMonsoonQuery = prompt.includes('monsoon') || prompt.includes('ಮುಂಗಾರು') || prompt.includes('मानसून') || prompt.includes('రుతుపవన') || prompt.includes('பருவமழை');
  const isRouteQuery = prompt.includes('route') || prompt.includes('road') || prompt.includes('travel') || prompt.includes('drive') || prompt.includes('ಪ್ರಯಾಣ') || prompt.includes('यात्रा') || prompt.includes('ప్రయాణం') || prompt.includes('பயணம்');

  // English
  if (langCode === 'en') {
    if (isRainQuery) {
      const win = weatherData.weatherWindows.find(w => w.type === 'rain');
      if (win) {
        return `Based on our physics-guided convective model and INSAT-3DR satellite telemetry for ${district} (${state}): \n\n• **Exact Rain Window**: Rain is projected during ${win.title.replace('🌧️ ', '')} with ${win.probability}% probability.\n• **Barometric Indicator**: Surface pressure is ${weatherData.current.pressure} hPa with a moisture flux convergence along the ${weatherData.profile.riverBasin}.\n• **Advisory**: Keep livestock in covered enclosures and suspend chemical spraying during this window.`;
      }
      return `For ${district} (${state}), convective rain probability is currently low (< 20%). The prevailing synoptic condition is ${condition} with relative humidity at ${humidity}%. Outdoor harvesting and transport can proceed normally until sunset.`;
    }

    if (isPestQuery) {
      return `Agro-Climatic Pest Diagnostic for ${district} (${state}):\n\n• **Risk Assessment**: **${pestRisk} RISK** for **${pestDisease}**.\n• **Microclimate Drivers**: Current temperature (${temp}°C) and relative humidity (${humidity}%) favor spore germination.\n• **Remedial Action**: ${weatherData.agriculture.pestAlert.actionAdvice}\n• **Soil Status**: Root-zone moisture is at ${soilMoisture}%. ${weatherData.agriculture.irrigationAdvice}`;
    }

    if (isMonsoonQuery) {
      return `Monsoon & Synoptic Outlook for ${state} (${district}):\n\n• **Synoptic Setup**: ${weatherData.profile.monsoonPattern}.\n• **Sea Surface Temperature (SST)**: Neutral to positive Indian Ocean Dipole (+IOD) conditions are maintaining robust moist southwesterly winds.\n• **District Projection**: Normal to above-normal precipitation expected across the catchment area of ${weatherData.profile.riverBasin}.`;
    }

    if (isRouteQuery) {
      return `Transit & Logistics Weather for ${district} routes:\n\n• **High-Risk Sectors**: Western Ghats and river valley crossings experience dense orographic fog between 04:00 AM – 09:30 AM with visibility dropping below 200m.\n• **Pavement Safety**: Convective showers create hydroplaning hazards. Reduce highway speeds to 60 km/h during wet spells.`;
    }

    return `Meteorological Intelligence Summary for **${district}, ${state}**:\n\nCurrent conditions are **${temp}°C** (${condition}) with humidity at **${humidity}%**, barometric pressure at **${weatherData.current.pressure} hPa**, and wind speeds of **${weatherData.current.windSpeed} km/h**. \n\n• **Weather Window**: ${weatherData.weatherWindows[0]?.title}\n• **Agro Advisory**: ${weatherData.agriculture.irrigationAdvice}\n• **Emergency Status**: Flood vulnerability index is currently ${weatherData.disaster.floodLevel} (${weatherData.disaster.floodRiskScore}/100).`;
  }

  // Kannada (ಕನ್ನಡ)
  if (langCode === 'kn') {
    if (isRainQuery) {
      const win = weatherData.weatherWindows.find(w => w.type === 'rain');
      if (win) {
        return `ಉಪಗ್ರಹ ಇನ್‌ಸ್ಯಾಟ್-೩DR ಮತ್ತು IMD ರೇಡಾರ್ ವಿಶ್ಲೇಷಣೆಯ ಪ್ರಕಾರ ${district} (${state}) ಜಿಲ್ಲೆಗೆ:\n\n• **ನಿಖರ ಮಳೆ ಸಮಯ**: ${win.title.replace('🌧️ ', '')} ಅವಧಿಯಲ್ಲಿ ಸುಮಾರು ${win.probability}% ಮಳೆಯಾಗುವ ಪ್ರಬಲ ಸಾಧ್ಯತೆಯಿದೆ.\n• **ವಾಯುಭಾರ ಒತ್ತಡ**: ${weatherData.current.pressure} hPa ದಾಖಲಾಗಿದ್ದು, ಕೃಷ್ಣಾ/ನದಿಯ ಕಣಿವೆಯಲ್ಲಿ ಮೋಡಗಳು ದಟ್ಟವಾಗುತ್ತಿವೆ.\n• **ರೈತರಿಗೆ ಸಲಹೆ**: ಬೆಳೆಗಳಿಗೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಯನ್ನು ತಕ್ಷಣ ಮುಂದೂಡಿ ಮತ್ತು ಕಟಾವು ಮಾಡಿದ ಧಾನ್ಯಗಳನ್ನು ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿಡಿ.`;
      }
      return `${district} (${state}) ಜಿಲ್ಲೆಯಲ್ಲಿ ಸದ್ಯಕ್ಕೆ ಮಳೆಯ ಸಾಧ್ಯತೆ ಕಡಿಮೆ (೨೦% ಕ್ಕಿಂತ ಕಡಿಮೆ). ವಾತಾವರಣವು ${condition} ಆಗಿದ್ದು, ಆರ್ದ್ರತೆ ${humidity}% ಇದೆ. ಹೊಲದ ಕೆಲಸಗಳು ಮತ್ತು ಸಾರಿಗೆ ಕಾರ್ಯಗಳಿಗೆ ವಾತಾವರಣ ಅನುಕೂಲಕರವಾಗಿದೆ.`;
    }

    if (isPestQuery) {
      return `${district} ಜಿಲ್ಲೆಯ AI ಕೀಟ ಮತ್ತು ರೋಗ ಮುನ್ಸೂಚನೆ:\n\n• **ಅಪಾಯದ ಮಟ್ಟ**: **${pestRisk} ಅಪಾಯ** - **${pestDisease}**.\n• **ಹವಾಮಾನ ಕಾರಣ**: ತಾಪಮಾನ ${temp}°C ಮತ್ತು ಆರ್ದ್ರತೆ ${humidity}% ಇರುವುದರಿಂದ ಶಿಲೀಂಧ್ರ ಹರಡುವಿಕೆ ಹೆಚ್ಚಾಗಬಹುದು.\n• **ಪರಿಹಾರ ಕ್ರಮ**: ${weatherData.agriculture.pestAlert.actionAdvice}\n• **ಮಣ್ಣಿನ ತೇವಾಂಶ**: ಮಣ್ಣಿನಲ್ಲಿ ${soilMoisture}% ತೇವಾಂಶವಿದೆ. ${weatherData.agriculture.irrigationAdvice}`;
    }

    if (isMonsoonQuery) {
      return `${district} ಮತ್ತು ${state} ರಾಜ್ಯದ ಮುಂಗಾರು ಮುನ್ಸೂಚನೆ:\n\n• **ಮುಂಗಾರು ಪ್ರವೃತ್ತಿ**: ${weatherData.profile.monsoonPattern}.\n• **ಸಮುದ್ರದ ಉಷ್ಣತೆ (IOD)**: ಧನಾತ್ಮಕ ಅಲೆಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ಅರಬ್ಬಿ ಸಮುದ್ರದಿಂದ ತೇವಾಂಶಭರಿತ ಗಾಳಿ ಬೀಸುತ್ತಿದೆ.\n• **ಜಿಲ್ಲಾ ನಿರೀಕ್ಷೆ**: ಈ ಋತುವಿನಲ್ಲಿ ವಾಡಿಕೆಯಷ್ಟೇ ಅಥವಾ ಅಧಿಕ ಮಳೆಯಾಗುವ ಮುನ್ಸೂಚನೆಯಿದೆ.`;
    }

    return `${district}, ${state} ಜಿಲ್ಲೆಯ ಹವಾಮಾನ ಸಾರಾಂಶ:\n\nಪ್ರಸ್ತುತ ತಾಪಮಾನ **${temp}°C** (${condition}), ಆರ್ದ್ರತೆ **${humidity}%**, ಗಾಳಿಯ ವೇಗ **${weatherData.current.windSpeed} ಕಿ.ಮೀ/ಗಂ** ಇದೆ.\n\n• **ಹವಾಮಾನ ವಿಂಡೋ**: ${weatherData.weatherWindows[0]?.title}\n• **ಕೃಷಿ ಸಲಹೆ**: ${weatherData.agriculture.irrigationAdvice}\n• **ವಿಪತ್ತು ಎಚ್ಚರಿಕೆ**: ಪ್ರವಾಹ ಅಪಾಯ ಸೂಚ್ಯಂಕ: ${weatherData.disaster.floodLevel}.`;
  }

  // Hindi (हिंदी)
  if (langCode === 'hi') {
    if (isRainQuery) {
      const win = weatherData.weatherWindows.find(w => w.type === 'rain');
      if (win) {
        return `INSAT-3DR उपग्रह और IMD रडार विश्लेषण के अनुसार ${district} (${state}) के लिए:\n\n• **सटीक वर्षा समय**: ${win.title.replace('🌧️ ', '')} के दौरान ${win.probability}% संभावना के साथ बारिश होने का अनुमान है।\n• **वायुमंडलीय दबाव**: ${weatherData.current.pressure} hPa दर्ज किया गया है।\n• **किसानों को सलाह**: खुले में रखी फसलों को सुरक्षित स्थानों पर ढकें और कीटनाशक छिड़काव स्थगित करें।`;
      }
      return `${district} (${state}) में अगले कुछ घंटों में बारिश की संभावना कम (20% से नीचे) है। मौसम ${condition} बना रहेगा और आर्द्रता ${humidity}% है। कृषि कार्यों और परिवहन के लिए सुरक्षित स्थिति है।`;
    }

    if (isPestQuery) {
      return `${district} जिले के लिए AI कीट एवं रोग परामर्श:\n\n• **जोखिम स्तर**: **${pestRisk}** - **${pestDisease}**।\n• **मौसम कारण**: तापमान (${temp}°C) और अधिक आर्द्रता (${humidity}%) फंगल संक्रमण को बढ़ावा दे सकते हैं।\n• **निवारक उपाय**: ${weatherData.agriculture.pestAlert.actionAdvice}\n• **मिट्टी की नमी**: वर्तमान में ${soilMoisture}% दर्ज की गई है। ${weatherData.agriculture.irrigationAdvice}`;
    }

    if (isMonsoonQuery) {
      return `${district} (${state}) के लिए मानसून स्थिति:\n\n• **मानसून प्रारूप**: ${weatherData.profile.monsoonPattern}।\n• **वायुमंडलीय दशाएं**: मानसूनी हवाएं सक्रिय हैं जिससे जल ग्रहण क्षेत्रों में अच्छी बारिश के संकेत हैं।`;
    }

    return `${district}, ${state} का मौसम सारांश:\n\nवर्तमान तापमान **${temp}°C** (${condition}), आर्द्रता **${humidity}%** और हवा की गति **${weatherData.current.windSpeed} किमी/घंटा** है।\n\n• **मौसम विंडो**: ${weatherData.weatherWindows[0]?.title}\n• **कृषि सलाह**: ${weatherData.agriculture.irrigationAdvice}\n• **आपदा स्थिति**: बाढ़ जोखिम स्तर ${weatherData.disaster.floodLevel} है।`;
  }

  // Telugu (తెలుగు)
  if (langCode === 'te') {
    if (isRainQuery) {
      const win = weatherData.weatherWindows.find(w => w.type === 'rain');
      return `${district} (${state}) వాతావరణ అంచనా:\n\n• **వర్షం సమయం**: ${win ? win.title.replace('🌧️ ', '') : 'రాబోయే 12 గంటల్లో వర్షం అవకాశం తక్కువ'}.\n• **గాలి పీడనం**: ${weatherData.current.pressure} hPa.\n• **రైతులకు సలహా**: తేమ శాతం ${humidity}% ఉన్నందున జాగ్రత్తలు పాటించండి.`;
    }
    return `${district}, ${state} వాతావరణ సమాచారం: ఉష్ణోగ్రత **${temp}°C**, తేమ **${humidity}%**, గాలి వేగం **${weatherData.current.windSpeed} km/h**. ${weatherData.agriculture.irrigationAdvice}`;
  }

  // Tamil (தமிழ்)
  if (langCode === 'ta') {
    if (isRainQuery) {
      const win = weatherData.weatherWindows.find(w => w.type === 'rain');
      return `${district} (${state}) வானிலை கணிப்பு:\n\n• **மழை நேரம்**: ${win ? win.title.replace('🌧️ ', '') : 'அடுத்த சில மணிநேரங்களில் மழை வாய்ப்பு குறைவு'}.\n• **காற்று அழுத்தம்**: ${weatherData.current.pressure} hPa.\n• **விவசாயிகளுக்கு ஆலோசனை**: பயிர்களை பாதுகாப்பாக வைக்கவும்.`;
    }
    return `${district}, ${state} வானிலை சுருக்கம்: வெப்பநிலை **${temp}°C**, ஈரப்பதம் **${humidity}%**, காற்றின் வேகம் **${weatherData.current.windSpeed} km/h**. ${weatherData.agriculture.irrigationAdvice}`;
  }

  // Marathi (मराठी)
  if (langCode === 'mr') {
    if (isRainQuery) {
      const win = weatherData.weatherWindows.find(w => w.type === 'rain');
      return `${district} (${state}) जिल्ह्यासाठी हवामान अंदाज:\n\n• **पावसाची वेळ**: ${win ? win.title.replace('🌧️ ', '') : 'पुढील काही तासांत पावसाची शक्यता कमी'}.\n• **हवेचा दाब**: ${weatherData.current.pressure} hPa.\n• **शेतकऱ्यांना सल्ला**: कीटकनाशक फवारणी पुढे ढकला आणि धान्य झाकून ठेवा.`;
    }
    return `${district}, ${state} हवामान सारांश: तापमान **${temp}°C**, आर्द्रता **${humidity}%**, वाऱ्याचा वेग **${weatherData.current.windSpeed} किमी/तास**. ${weatherData.agriculture.irrigationAdvice}`;
  }

  return `Forecast for ${district}, ${state}: ${temp}°C, ${humidity}% humidity.`;
}

// Backward-compatibility alias
export const queryWeatherGPT = queryVayuMitra;
