// Pan-India Real-Time Climate Emergencies, Seasonal Disasters & Current Affairs Database
// Covers critical States and Districts across Floods, Extreme Summer Heatwaves, Cloudbursts, and Winter Anomalies

export const NATIONAL_EMERGENCY_ALERTS = [
  // 1. FLOOD ACCIDENTS & RIVER BASIN SPATE (Rainy / Monsoonal Floods)
  {
    id: 'flood-assam-dibrugarh',
    category: 'FLOOD',
    type: '🌊 FLASH FLOOD RED ALERT',
    severity: 'RED',
    season: 'Monsoon / Rainy',
    state: 'Assam',
    district: 'Dibrugarh',
    headline: 'Brahmaputra in spate: 14 embankments damaged, 85,000 hectares submerged',
    details: 'Brahmaputra river flowing 1.82m above danger level at Dibrugarh ghat. SDRF rescue boats deployed across low-lying river islands (chars). 4 Relief camps opened in peripheral taluks.',
    precautions: 'Evacuate riverbank settlements; livestock shifted to elevated highlands. Waterborne disease prophylaxis active.',
    helpline: '0373-2312999 (Dibrugarh EOC)',
    impactScore: 92
  },
  {
    id: 'flood-kerala-wayanad',
    category: 'LANDSLIDE_FLOOD',
    type: '🚨 LANDSLIDE & DEBRIS SURGE',
    severity: 'RED',
    season: 'Monsoon / Rainy',
    state: 'Kerala',
    district: 'Wayanad',
    headline: 'High hill debris flow alert: Chooralmala & Meppadi sectors on high alert',
    details: 'Torrential downpour (>280mm in 24h) triggered localized slope displacement. Banasura Sagar dam shutter #2 opened. Ban on night vehicle travel through Thamarassery Ghat pass.',
    precautions: 'Immediate relocation from landslide-prone tea estate gullies. Avoid ghat road travel after 6 PM.',
    helpline: '04936-204151 (Wayanad Control)',
    impactScore: 96
  },
  {
    id: 'flood-karnataka-belagavi',
    category: 'FLOOD',
    type: '🌊 DAM DISCHARGE SURGE',
    severity: 'ORANGE',
    season: 'Monsoon / Rainy',
    state: 'Karnataka',
    district: 'Belagavi',
    headline: 'Krishna & Malaprabha overflow: 22 low-lying bridges submerged in Chikkodi',
    details: 'Heavy catchment rainfall in Western Ghats prompted 1.85 lakh cusecs water release from Koyna and Almatti dams. Doodhganga and Vedganga river barrages submerged.',
    precautions: 'Do not cross submerged bridges or causeways. Farmers advised to move sugarcane harvest pumps to higher banks.',
    helpline: '0831-2407290 (Belagavi EOC)',
    impactScore: 84
  },
  {
    id: 'flood-himachal-mandi',
    category: 'CLOUDBURST_FLOOD',
    type: '⚠️ CLOUDBURST FLASH FLOOD',
    severity: 'RED',
    season: 'Monsoon / Rainy',
    state: 'Himachal Pradesh',
    district: 'Mandi',
    headline: 'Beas river fury: NH-21 blocked, cloudburst reported near Pandoh reservoir',
    details: 'Flash flood torrents triggered by localized cloudburst. Massive silt deposit on Chandigarh-Manali national highway. Pandoh dam gates opened to discharge 95,000 cusecs.',
    precautions: 'Avoid riverbed camping and riverside photography. Follow SDRF traffic diversion bulletins.',
    helpline: '01905-226201 (Mandi Disaster Cell)',
    impactScore: 91
  },
  {
    id: 'flood-bihar-supaul',
    category: 'FLOOD',
    type: '🌊 KOSI EMBANKMENT ALERT',
    severity: 'RED',
    season: 'Monsoon / Rainy',
    state: 'Bihar',
    district: 'Supaul',
    headline: 'Kosi River swells beyond 3.6 lakh cusecs: 42 villages inundated',
    details: 'Continuous cloudbursts in Nepal catchment areas pushed Kosi river to extreme flood stage at Birpur Barrage. Embankments on round-the-clock surveillance by water resources division.',
    precautions: 'Move to designated flood relief shelters with potable water storage and essential medicines.',
    helpline: '06473-222201 (Supaul Flood Control)',
    impactScore: 89
  },
  {
    id: 'flood-maharashtra-raigad',
    category: 'FLOOD',
    type: '🌊 COASTAL RIVER INUNDATION',
    severity: 'ORANGE',
    season: 'Monsoon / Rainy',
    state: 'Maharashtra',
    district: 'Raigad',
    headline: 'Savitri & Kundalika rivers breach warning marks: Mahad market submerged',
    details: 'Arabian Sea high tide (4.6m) combined with 210mm catchment rainfall caused backwater surge. NDRF unit staged at Mahad city center.',
    precautions: 'Suspend ground-floor commercial activity in low-lying bazaars. Stay alert for siren alerts.',
    helpline: '02141-222118 (Raigad EOC)',
    impactScore: 85
  },

  // 2. EXTREME SUMMER HEATWAVES (Highest Temperatures & Severe Loo)
  {
    id: 'heat-rajasthan-churu',
    category: 'HEATWAVE',
    type: '🔥 SEVERE HEATWAVE RED ALERT',
    severity: 'RED',
    season: 'Summer',
    state: 'Rajasthan',
    district: 'Churu',
    headline: 'Mercury touches 49.6°C: Desert furnace condition with scorching Loo winds',
    details: 'Intense dry continental winds from Thar desert pushing surface temperatures to dangerous thresholds. Dew point collapsed to 8°C. Hospitals opened dedicated ORS heat wards.',
    precautions: 'Strict prohibition of outdoor farm labor between 11:30 AM – 04:30 PM. Maintain electrolyte and hydration intake.',
    helpline: '01562-250100 (Churu Emergency)',
    impactScore: 95
  },
  {
    id: 'heat-delhi-nct',
    category: 'HEATWAVE',
    type: '🔥 URBAN HEAT DOME SPIKE',
    severity: 'RED',
    season: 'Summer',
    state: 'Delhi (NCT)',
    district: 'New Delhi',
    headline: 'Urban Heat Island peak: 48.9°C in peripheral belts, power grid load spike',
    details: 'Severe heatwave conditions persisting across NCR. Ground pavement temperatures exceeding 56°C. High ozone pollution accompanied by thermal stress.',
    precautions: 'Avoid non-essential transit in unshaded areas. Check vulnerable elderly and children for heat stroke symptoms.',
    helpline: '1077 (Delhi Disaster Control)',
    impactScore: 90
  },
  {
    id: 'heat-odisha-jharsuguda',
    category: 'HEATWAVE',
    type: '🔥 HUMID HEATWAVE RED ZONE',
    severity: 'RED',
    season: 'Summer',
    state: 'Odisha',
    district: 'Jharsuguda',
    headline: 'Wet-bulb thermal stress exceeds threshold: 46.8°C with high coastal humidity',
    details: 'Dangerous heat index (feels like 54°C). Western Odisha coal and industrial belt experiencing severe thermal inversion. Schools and colleges ordered closed.',
    precautions: 'Wet curtains and cross-ventilation advised. Avoid strenuous exertion during afternoon heat peak.',
    helpline: '06645-272900 (Jharsuguda EOC)',
    impactScore: 88
  },
  {
    id: 'heat-telangana-ramagundam',
    category: 'HEATWAVE',
    type: '🔥 SUNSTROKE RED ALERT',
    severity: 'ORANGE',
    season: 'Summer',
    state: 'Telangana',
    district: 'Peddapalli',
    headline: 'Godavari valley heat trap: Temperatures cross 46.4°C in Ramagundam',
    details: 'Persistent dry high-pressure cell over Deccan plateau preventing cloud development. Severe heatwave advisory issued by IMD Hyderabad.',
    precautions: 'Use wet cotton cloths over head and neck when commuting. Avoid direct sunlight exposure.',
    helpline: '08728-255100 (Peddapalli Control)',
    impactScore: 83
  },

  // 3. WINTER EXTREMES & DENSE FOG ACCIDENTS (Winter Season)
  {
    id: 'winter-up-kanpur',
    category: 'COLD_FOG',
    type: '❄️ SUPER DENSE FOG & HIGHWAY ACCIDENT RISK',
    severity: 'ORANGE',
    season: 'Winter',
    state: 'Uttar Pradesh',
    district: 'Kanpur Nagar',
    headline: 'Zero-visibility radiation fog: Expressway speed limits enforced, flights diverted',
    details: 'Surface visibility dropped below 15 meters along Agra-Lucknow expressway. Multiple multi-vehicle collisions reported during early morning transit hours. Night temp: 4.2°C.',
    precautions: 'Highway vehicles must maintain 30 km/h with hazard blinkers on. Avoid travel between 02:00 AM – 09:00 AM.',
    helpline: '0512-2303100 (Kanpur EOC)',
    impactScore: 86
  },
  {
    id: 'winter-punjab-bathinda',
    category: 'COLD_WAVE',
    type: '❄️ GROUND FROST & SEVERE COLD WAVE',
    severity: 'RED',
    season: 'Winter',
    state: 'Punjab',
    district: 'Bathinda',
    headline: 'Mercury plummets to 1.6°C: Ground frost damages mustard and rabi crops',
    details: 'Severe arctic blast from Western Disturbances swept Malwa belt. Ice crystals formed on vegetation. Agricultural departments advise light nighttime irrigation to protect seedlings.',
    precautions: 'Burn agricultural residue in windward field edges for frost smoke shielding. Shelter livestock from northern gale.',
    helpline: '0164-2211000 (Bathinda EOC)',
    impactScore: 88
  },
  {
    id: 'winter-ladakh-kargil',
    category: 'COLD_WAVE',
    type: '❄️ ARCTIC FREEZE & AVALANCHE WATCH',
    severity: 'RED',
    season: 'Winter',
    state: 'Ladakh',
    district: 'Kargil',
    headline: 'Sub-zero freeze at -16.4°C: Suru river banks freeze, Zojila pass blocked',
    details: 'Extreme Himalayan winter blizzard and sub-zero temperatures. High altitude avalanche advisory issued by DGRE for Drass and Kargil-Leh highway.',
    precautions: 'Residents must maintain heating reserves and avoid steep avalanche chute terrain.',
    helpline: '01985-232222 (Kargil Disaster Cell)',
    impactScore: 94
  },

  // 4. CYCLONES & SEVERE TROPICAL STORMS
  {
    id: 'cyclone-wb-south24',
    category: 'CYCLONE',
    type: '🌀 SEVERE CYCLONIC STORM WATCH',
    severity: 'RED',
    season: 'Post-Monsoon',
    state: 'West Bengal',
    district: 'South 24 Parganas',
    headline: 'Bay of Bengal Depression intensifies: 115 km/h squalls threaten Sundarbans',
    details: 'Deep depression over Central Bay of Bengal upgraded to Severe Cyclonic Storm. Tidal waves up to 3.5m above astronomical tide expected at Kakdwip and Sagar Island.',
    precautions: 'Total suspension of trawler fishing operations. Evacuate mud embankment houses to concrete cyclone shelters.',
    helpline: '033-24791000 (South 24 Parganas Control)',
    impactScore: 97
  }
];

// Helper to get alerts for a specific season or state
export function getAlertsBySeason(seasonName) {
  if (!seasonName || seasonName === 'All') return NATIONAL_EMERGENCY_ALERTS;
  return NATIONAL_EMERGENCY_ALERTS.filter(a => a.season.toLowerCase().includes(seasonName.toLowerCase()));
}
