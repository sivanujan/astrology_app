/**
 * Mega-Prompt Builder
 * 
 * Builds comprehensive AI prompts with ALL chart details
 * for generating detailed Dasa/Bhukti predictions
 */

import { ComprehensiveChartData } from '../types/enhancedDasaTypes';
import { getTamilNakshatraName } from './nakshatraCalculator';
import { getYogaDescriptionInTamil } from './yogaDetection';
import { getSubathuvamExplanationInTamil } from './comprehensiveSubathuvam';
import { getTransitDescriptionInTamil } from './transitCalculator';

/**
 * Build comprehensive Tamil prompt with ALL chart data
 */
export function buildComprehensiveTamilPrompt(data: ComprehensiveChartData): string {
    const { dasaTimeline, dasaLord, bhuktiLord, nextBhuktiLord } = data;

    let prompt = `நீங்கள் ஆதித்ய குருஜி கொள்கைகளைப் பின்பற்றும் வேத ஜோதிட நிபுணர்.

════════════════════════════════════════
📅 தசை/புக்தி காலம்
════════════════════════════════════════

தற்போதைய தசை: ${dasaTimeline.mahaDasa.planet} மகா தசை
தற்போதைய புக்தி: ${dasaTimeline.currentBhukti.planet} அந்தர் தசை
புக்தி ஆரம்பம்: ${formatDate(dasaTimeline.currentBhukti.startDate)}
புக்தி முடிவு: ${formatDate(dasaTimeline.currentBhukti.endDate)}
காலம்: ${dasaTimeline.currentBhukti.durationMonths} மாதங்கள்

`;

    if (nextBhuktiLord) {
        prompt += `அடுத்த புக்தி: ${dasaTimeline.nextBhukti!.planet} அந்தர் தசை
அடுத்த ஆரம்பம்: ${formatDate(dasaTimeline.nextBhukti!.startDate)}
அடுத்த முடிவு: ${formatDate(dasaTimeline.nextBhukti!.endDate)}

`;
    }

    prompt += `════════════════════════════════════════
🌟 தசா நாதன் விவரங்கள் (${dasaLord.name})
════════════════════════════════════════

கிரகம்: ${dasaLord.name}
ராசி: ${dasaLord.sign}
வீடு: ${dasaLord.house}வது
நிலை: ${getDignityTamil(dasaLord.dignity)}
டிகிரி: ${dasaLord.degree.toFixed(2)}°
அதிபத்தியம்: ${dasaLord.rulesHouses.join(', ')} வது வீடுகள்
சேர்க்கை: ${dasaLord.conjunctions.map(c => c.planet).join(', ') || 'இல்லை'}
பார்வைகள்: ${dasaLord.aspects.map(a => `${a.planet} (${a.fromHouse}வது வீட்டிலிருந்து)`).join(', ') || 'இல்லை'}
நட்சத்திரம்: ${getTamilNakshatraName(dasaLord.nakshatra)} (பாதம் ${dasaLord.nakshatraPada})

════════════════════════════════════════
🌙 புக்தி நாதன் விவரங்கள் (${bhuktiLord.name})
════════════════════════════════════════

கிரகம்: ${bhuktiLord.name}
ராசி: ${bhuktiLord.sign}
வீடு: ${bhuktiLord.house}வது
நிலை: ${getDignityTamil(bhuktiLord.dignity)}
டிகிரி: ${bhuktiLord.degree.toFixed(2)}°
அதிப்தியம்: ${bhuktiLord.rulesHouses.join(', ')} வது வீடுகள்
சேர்க்கை: ${bhuktiLord.conjunctions.map(c => c.planet).join(', ') || 'இல்லை'}
பார்வைகள்: ${bhuktiLord.aspects.map(a => `${a.planet} (${a.fromHouse}வது வீட்டிலிருந்து)`).join(', ') || 'இல்லை'}
நட்சத்திரம்: ${getTamilNakshatraName(bhuktiLord.nakshatra)} (பாதம் ${bhuktiLord.nakshatraPada})

`;

    if (nextBhuktiLord) {
        prompt += `════════════════════════════════════════
🔮 அடுத்த புக்தி நாதன் (${nextBhuktiLord.name})
════════════════════════════════════════

கிரகம்: ${nextBhuktiLord.name}
ராசி: ${nextBhuktiLord.sign}
வீடு: ${nextBhuktiLord.house}வது
நிலை: ${getDignityTamil(nextBhuktiLord.dignity)}
டிகிரி: ${nextBhuktiLord.degree.toFixed(2)}°
அதிபத்தியம்: ${nextBhuktiLord.rulesHouses.join(', ')} வது வீடுகள்

`;
    }

    prompt += `════════════════════════════════════════
🔗 கிரக உறவுகள்
════════════════════════════════════════

தசா-புக்தி உறவு: புக்தி நாதன் தசா நாதனிடமிருந்து ${data.planetaryRelationships.dasaBhukti}
இயற்கை நட்பு: ${getFriendshipTamil(data.planetaryRelationships.naturalFriendship)}
தற்காலிக நட்பு: ${getFriendshipTamil(data.planetaryRelationships.temporalFriendship)}

════════════════════════════════════════
🏠 அனைத்து வீட்டு அதிபதிகள்
════════════════════════════════════════

`;

    for (const house of data.allHouseLords) {
        prompt += `${house.houseNumber}வது அதிபதி: ${house.lord} → ${house.lordHouse}வது வீட்டில் (${house.lordSign}, ${getDignityTamil(house.lordDignity)})\n`;
    }

    prompt += `
════════════════════════════════════════
✨ யோகங்கள் (பலம்)
════════════════════════════════════════

`;

    if (data.yogas.length > 0) {
        for (const yoga of data.yogas) {
            prompt += `${yoga.name} (${yoga.strength}/100): ${getYogaDescriptionInTamil(yoga)}\n`;
        }
    } else {
        prompt += `குறிப்பிடத்தக்க யோகங்கள் இல்லை\n`;
    }

    prompt += `
════════════════════════════════════════
🌍 தற்போதைய கோச்சாரங்கள்
════════════════════════════════════════

`;

    for (const transit of data.currentTransits) {
        prompt += `${getTransitDescriptionInTamil(transit)}\n`;
    }

    prompt += `
════════════════════════════════════════
⚖️ சுபத்துவம்/பாபத்துவம் விரிவான பகுப்பாய்வு
════════════════════════════════════════

மொத்த மதிப்பெண்: ${data.subathuvamAnalysis.overallSubathuvamScore}/100

சுப கிரகங்கள்:
`;

    for (const planet of data.subathuvamAnalysis.subhaPlanets) {
        prompt += `  ${planet.planet}: ${planet.score}/100\n`;
        for (const reason of planet.reasons) {
            prompt += `    - ${reason}\n`;
        }
    }

    prompt += `
பாப கிரகங்கள்:
`;

    for (const planet of data.subathuvamAnalysis.paapaPlanets) {
        prompt += `  ${planet.planet}: ${planet.score}/100\n`;
        for (const reason of planet.reasons) {
            prompt += `    - ${reason}\n`;
        }
    }

    prompt += `
சுப சேர்க்கைகள்: ${data.subathuvamAnalysis.subhaConjunctions.join(', ') || 'இல்லை'}
பாப சேர்க்கைகள்: ${data.subathuvamAnalysis.paapaConjunctions.join(', ') || 'இல்லை'}

════════════════════════════════════════
📋 கணிப்பு வடிவம் (கட்டாய முறை)
════════════════════════════════════════

**1. தற்போதைய காலம் (${dasaLord.name}-${bhuktiLord.name}):**
   📅 காலம்: ${formatDate(dasaTimeline.currentBhukti.startDate)} → ${formatDate(dasaTimeline.currentBhukti.endDate)}
   
   🎯 இப்போது என்ன நடக்கிறது:
   - தொழில்/வேலை:
   - பணம்/வருமானம்:
   - திருமணம்/உறவுகள்:
   - உடல்நலம்:
   - குழந்தைகள்/படிப்பு:
   - சொத்து/வாகனம்:
   
   ✅ நல்ல பலன்கள்:
   - எந்த பலன்கள்?
   - ஏன் இந்த பலன்கள்?
   
   ⚠️ சவால்கள்:
   - என்ன கவனம் தேவை?
   
   📍 குறிப்பிட்ட நிகழ்வுகள்:
   - எப்போது என்ன நடக்கும்?
   
   ⏰ சிறந்த மாதங்கள்:
   
   ❌ கடினமான மாதங்கள்:

`;

    if (nextBhuktiLord) {
        prompt += `**2. அடுத்த காலம் (${dasaLord.name}-${nextBhuktiLord.name}):**
   📅 காலம்: ${formatDate(dasaTimeline.nextBhukti!.startDate)} → ${formatDate(dasaTimeline.nextBhukti!.endDate)}
   
   🔮 என்ன நடக்கும்:
   - எந்த மாற்றங்கள்?
   
   📊 ஒப்பீடு:
   - தற்போதுவுடன் ஒப்பிடும்போது:
     - என்ன சிறப்பாக இருக்கும்?
     - என்ன மோசமாக இருக்கும்?
   
   💡 தயாரிப்பு:
   - இப்போதே என்ன செய்ய வேண்டும்?
   
   📍 ஆரம்ப கணிப்புகள்:
   - முதல் ஆண்டு:
   - இரண்டாவது ஆண்டு:

`;
    }

    prompt += `**3. விரிவான நேரம்:**

   தற்போதைய புக்தியில்:
   ⏰ ஆரம்ப கட்டம் (முதல் 1/3):
   ⏰ நடு கட்டம் (2/3):
   ⏰ இறுதி கட்டம் (கடைசி 1/3):
   
`;

    if (nextBhuktiLord) {
        prompt += `   அடுத்த புக்தியில்:
   ⏰ முதல் ஆண்டு:
   ⏰ இரண்டாவது ஆண்டு:
   ⏰ இறுதி ஆண்டு:
   
`;
    }

    prompt += `
════════════════════════════════════════
⚠️ கட்டாய விதிகள்
════════════════════════════════════════

✅ சுபத்துவம்/பாபத்துவம் மதிப்பெண்களை பயன்படுத்தவும்
✅ யோகங்களின் தாக்கத்தை விளக்கவும்
✅ கோச்சார பலன்களை கணக்கில் வையுங்கள்
✅ குறிப்பிட்ட தேதிகள் மற்றும் மாதங்களை கூறுங்கள்
✅ நடைமுறை ஆலோசனைகளை வழங்குங்கள்
❌ பொதுவான "இந்த தசை..." விளக்கங்கள் வேண்டாம்
❌ எந்த தவறான தகவலும் வேண்டாம்

விரிவான, குறிப்பிட்ட, நடைமுறை கணிப்பு தமிழில் கொடுங்கள்.`;

    return prompt;
}

/**
 * Build comprehensive English prompt
 */
export function buildComprehensiveEnglishPrompt(data: ComprehensiveChartData): string {
    const { dasaTimeline, dasaLord, bhuktiLord, nextBhuktiLord } = data;

    let prompt = `You are a Vedic Astrology expert following Aditya Guruji's principles.

════════════════════════════════════════
📅 DASA/BHUKTI TIMELINE
════════════════════════════════════════

CURRENT DASA: ${dasaTimeline.mahaDasa.planet} Maha Dasa
CURRENT BHUKTI: ${dasaTimeline.currentBhukti.planet} Antar Dasa
BHUKTI START: ${formatDate(dasaTimeline.currentBhukti.startDate)}
BHUKTI END: ${formatDate(dasaTimeline.currentBhukti.endDate)}
DURATION: ${dasaTimeline.currentBhukti.durationMonths} months

`;

    if (nextBhuktiLord) {
        prompt += `NEXT BHUKTI: ${dasaTimeline.nextBhukti!.planet} Antar Dasa
NEXT START: ${formatDate(dasaTimeline.nextBhukti!.startDate)}
NEXT END: ${formatDate(dasaTimeline.nextBhukti!.endDate)}

`;
    }

    prompt += `════════════════════════════════════════
🌟 DASA LORD DETAILS (${dasaLord.name})
════════════════════════════════════════

Planet: ${dasaLord.name}
Sign: ${dasaLord.sign}
House: ${dasaLord.house}th
Dignity: ${dasaLord.dignity}
Degree: ${dasaLord.degree.toFixed(2)}°
Rules Houses: ${dasaLord.rulesHouses.join(', ')}
Conjunct: ${dasaLord.conjunctions.map(c => c.planet).join(', ') || 'None'}
Aspected By: ${dasaLord.aspects.map(a => `${a.planet} from ${a.fromHouse}th house`).join(', ') || 'None'}
Nakshatra: ${dasaLord.nakshatra} (Pada ${dasaLord.nakshatraPada})

════════════════════════════════════════
🌙 BHUKTI LORD DETAILS (${bhuktiLord.name})
════════════════════════════════════════

Planet: ${bhuktiLord.name}
Sign: ${bhuktiLord.sign}
House: ${bhuktiLord.house}th
Dignity: ${bhuktiLord.dignity}
Degree: ${bhuktiLord.degree.toFixed(2)}°
Rules Houses: ${bhuktiLord.rulesHouses.join(', ')}
Conjunct: ${bhuktiLord.conjunctions.map(c => c.planet).join(', ') || 'None'}
Aspected By: ${bhuktiLord.aspects.map(a => `${a.planet} from ${a.fromHouse}th house`).join(', ') || 'None'}
Nakshatra: ${bhuktiLord.nakshatra} (Pada ${bhuktiLord.nakshatraPada})

`;

    if (nextBhuktiLord) {
        prompt += `════════════════════════════════════════
🔮 NEXT BHUKTI LORD DETAILS (${nextBhuktiLord.name})
════════════════════════════════════════

Planet: ${nextBhuktiLord.name}
Sign: ${nextBhuktiLord.sign}
House: ${nextBhuktiLord.house}th
Dignity: ${nextBhuktiLord.dignity}
Degree: ${nextBhuktiLord.degree.toFixed(2)}°
Rules Houses: ${nextBhuktiLord.rulesHouses.join(', ')}

`;
    }

    prompt += `════════════════════════════════════════
🔗 PLANETARY RELATIONSHIPS
════════════════════════════════════════

Dasa-Bhukti Relationship: Bhukti lord ${data.planetaryRelationships.dasaBhukti} Dasa lord
Natural Friendship: ${data.planetaryRelationships.naturalFriendship}
Temporal Friendship: ${data.planetaryRelationships.temporalFriendship}

════════════════════════════════════════
🏠 ALL HOUSE LORDS
════════════════════════════════════════

`;

    for (const house of data.allHouseLords) {
        prompt += `${house.houseNumber}st/nd/rd/th Lord: ${house.lord} in ${house.lordHouse}th house (${house.lordSign}, ${house.lordDignity})\n`;
    }

    prompt += `
════════════════════════════════════════
✨ YOGAS PRESENT (Strength)
════════════════════════════════════════

`;

    if (data.yogas.length > 0) {
        for (const yoga of data.yogas) {
            prompt += `${yoga.name} (${yoga.strength}/100): ${yoga.description}\n`;
        }
    } else {
        prompt += `No significant yogas detected\n`;
    }

    prompt += `
════════════════════════════════════════
🌍 CURRENT TRANSITS
════════════════════════════════════════

`;

    for (const transit of data.currentTransits) {
        prompt += `${transit.planet}: ${transit.currentSign} (${transit.currentHouse}th house) - ${transit.effect}\n  ${transit.description}\n`;
    }

    prompt += `
════════════════════════════════════════
⚖️ SUBATHUVAM/PAVATHUVAM ANALYSIS
════════════════════════════════════════

Overall Score: ${data.subathuvamAnalysis.overallSubathuvamScore}/100

SUBHA (BENEFIC) PLANETS:
`;

    for (const planet of data.subathuvamAnalysis.subhaPlanets) {
        prompt += `  ${planet.planet}: ${planet.score}/100\n`;
        for (const reason of planet.reasons) {
            prompt += `    - ${reason}\n`;
        }
    }

    prompt += `
PAAPA (MALEFIC) PLANETS:
`;

    for (const planet of data.subathuvamAnalysis.paapaPlanets) {
        prompt += `  ${planet.planet}: ${planet.score}/100\n`;
        for (const reason of planet.reasons) {
            prompt += `    - ${reason}\n`;
        }
    }

    prompt += `
Benefic Conjunctions: ${data.subathuvamAnalysis.subhaConjunctions.join(', ') || 'None'}
Malefic Conjunctions: ${data.subathuvamAnalysis.paapaConjunctions.join(', ') || 'None'}

════════════════════════════════════════
📋 PREDICTION FORMAT (MANDATORY)
════════════════════════════════════════

**1. CURRENT PERIOD (${dasaLord.name}-${bhuktiLord.name}):**
   📅 Duration: ${formatDate(dasaTimeline.currentBhukti.startDate)} → ${formatDate(dasaTimeline.currentBhukti.endDate)}
   
   🎯 What's Happening NOW:
   - Career/Profession:
   - Money/Income:
   - Marriage/Relationships:
   - Health:
   - Children/Education:
   - Property/Vehicles:
   
   ✅ Good Results:
   - What results?
   - Why these results?
   
   ⚠️ Challenges:
   - What to be careful about?
   
   📍 Specific Events:
   - When will what happen?
   
   ⏰ Best Months:
   
   ❌ Difficult Months:

`;

    if (nextBhuktiLord) {
        prompt += `**2. NEXT PERIOD (${dasaLord.name}-${nextBhuktiLord.name}):**
   📅 Duration: ${formatDate(dasaTimeline.nextBhukti!.startDate)} → ${formatDate(dasaTimeline.nextBhukti!.endDate)}
   
   🔮 What Will Happen:
   - What changes?
   
   📊 Comparison:
   - Compared to current period:
     - What will be better?
     - What will be worse?
   
   💡 Preparation:
   - What to do now?
   
   📍 Early Predictions:
   - First year:
   - Second year:

`;
    }

    prompt += `**3. DETAILED TIMING:**

   CURRENT PERIOD:
   ⏰ Early Phase (first 1/3):
   ⏰ Middle Phase (2/3):
   ⏰ Final Phase (last 1/3):
   
`;

    if (nextBhuktiLord) {
        prompt += `   NEXT PERIOD:
   ⏰ First Year:
   ⏰ Second Year:
   ⏰ Final Year:
   
`;
    }

    prompt += `
════════════════════════════════════════
⚠️ MANDATORY RULES
════════════════════════════════════════

✅ Use Subathuvam/Pavathuvam scores
✅ Explain yoga impacts
✅ Consider transit effects
✅ Give specific dates and months
✅ Provide practical advice
❌ No generic "this Dasa..." statements
❌ No incorrect information

Provide detailed, specific, practical predictions.`;

    return prompt;
}

/**
 * Helper: Format date
 */
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Helper: Get dignity in Tamil
 */
function getDignityTamil(dignity: string): string {
    const tamil: Record<string, string> = {
        'Exalted': 'உச்சம்',
        'Debilitated': 'நீசம்',
        'Own': 'சொந்த வீடு',
        'Friend': 'நண்பன் வீடு',
        'Enemy': 'எதிரி வீடு',
        'Neutral': 'சமம்',
    };
    return tamil[dignity] || dignity;
}

/**
 * Helper: Get friendship in Tamil
 */
function getFriendshipTamil(friendship: string): string {
    const tamil: Record<string, string> = {
        'Friend': 'நண்பன்',
        'Enemy': 'எதிரி',
        'Neutral': 'சமம்',
    };
    return tamil[friendship] || friendship;
}
