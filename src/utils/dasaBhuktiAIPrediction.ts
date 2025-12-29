import { getHousesRuledByPlanet } from './houseLordship';
import { calculateSubathuvamPavathuvam } from './subathuvam';

export interface DasaAIContext {
    planet: string;
    housesRuled: number[];
    houseSignifications: { [key: number]: string };
    subathuvamStatus: 'Subha' | 'Paapa' | 'Neutral';
    subathuvamScore: number;
    subathuvamReason: string;
    currentHouse: number;
    currentSign: string;
    degree: number;
    aspectingPlanets: string[];
    ascendant: string;
    ascendantLord: string;
    periodType: string;
    mahaDasa?: string;
}

const HOUSE_SIGNIFICATIONS: { [key: number]: { en: string, ta: string } } = {
    1: { en: 'Self, Personality, Health', ta: 'தன்மை, ஆளுமை, உடல்நலம்' },
    2: { en: 'Family, Wealth, Speech', ta: 'குடும்பம், செல்வம், பேச்சு' },
    3: { en: 'Courage, Siblings, Communication', ta: 'தைரியம், உடன்பிறந்தோர், தொடர்பு' },
    4: { en: 'Mother, Property, Happiness', ta: 'தாய், சொத்து, மகிழ்ச்சி' },
    5: { en: 'Children, Education, Intelligence', ta: 'குழந்தைகள், கல்வி, அறிவு' },
    6: { en: 'Enemies, Diseases, Debts', ta: 'எதிரிகள், நோய்கள், கடன்கள்' },
    7: { en: 'Marriage, Partnership, Business', ta: 'திருமணம், கூட்டாளி, வணிகம்' },
    8: { en: 'Longevity, Sudden Events, Transformation', ta: 'ஆயுள், திடீர் நிகழ்வுகள், மாற்றம்' },
    9: { en: 'Fortune, Father, Religion', ta: 'அதிர்ஷ்டம், தந்தை, மதம்' },
    10: { en: 'Career, Status, Authority', ta: 'தொழில், அந்தஸ்து, அதிகாரம்' },
    11: { en: 'Gains, Friends, Aspirations', ta: 'ஆதாயம், நண்பர்கள், ஆசைகள்' },
    12: { en: 'Losses, Foreign, Spirituality', ta: 'இழப்புகள், வெளிநாடு, ஆன்மீகம்' }
};

const SIGNS: { [key: number]: string } = {
    0: 'Aries', 1: 'Taurus', 2: 'Gemini', 3: 'Cancer',
    4: 'Leo', 5: 'Virgo', 6: 'Libra', 7: 'Scorpio',
    8: 'Sagittarius', 9: 'Capricorn', 10: 'Aquarius', 11: 'Pisces'
};

export function buildDasaAIContext(
    planet: string,
    chart: any,
    periodType: string,
    mahaDasa?: string
): DasaAIContext {
    // Find planet in chart
    const planetData = chart.planets.find((p: any) => p.name === planet);

    if (!planetData) {
        throw new Error(`Planet ${planet} not found in chart`);
    }

    // Get houses ruled by this planet
    const housesRuled = getHousesRuledByPlanet(planet, chart);

    // Calculate Subathuvam using function that calculates for all planets
    const allSubathuvamResults = calculateSubathuvamPavathuvam(chart.planets);
    const subathuvam = allSubathuvamResults[planet] || { subathuvam: 0, pavathuvam: 0 };

    // Determine Subathuvam status
    let subathuvamStatus: 'Subha' | 'Paapa' | 'Neutral' = 'Neutral';
    let subathuvamReason = '';

    if (subathuvam.subathuvam > 0) {
        subathuvamStatus = 'Subha';
        subathuvamReason = `Good planetary associations (Score: +${subathuvam.subathuvam})`;
    } else if (subathuvam.pavathuvam > 0) {
        subathuvamStatus = 'Paapa';
        subathuvamReason = `Afflicted by malefics (Score: -${subathuvam.pavathuvam})`;
    }

    // Get aspecting planets
    const aspectingPlanets = chart.planets
        .filter((p: any) => {
            if (p.name === planet) return false;
            // Simple aspect logic - can be enhanced
            const houseDiff = Math.abs(planetData.house - p.house);
            return houseDiff === 6 || houseDiff === 7 || houseDiff === 8;
        })
        .map((p: any) => p.name);

    // Calculate house from signIndex
    const currentHouse = ((planetData.signIndex - chart.ascendant.signIndex + 12) % 12) + 1;
    const currentSign = SIGNS[planetData.signIndex];

    // Get ascendant info
    const ascendant = SIGNS[chart.ascendant.signIndex];
    const ascendantLordMap: { [key: string]: string } = {
        'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
        'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
    };
    const ascendantLord = ascendantLordMap[ascendant];

    const totalScore = subathuvam.subathuvam - subathuvam.pavathuvam;

    return {
        planet,
        housesRuled,
        houseSignifications: Object.fromEntries(
            housesRuled.map(h => [h, HOUSE_SIGNIFICATIONS[h].en])
        ),
        subathuvamStatus,
        subathuvamScore: totalScore,
        subathuvamReason,
        currentHouse,
        currentSign,
        degree: planetData.degree,
        aspectingPlanets,
        ascendant,
        ascendantLord,
        periodType,
        mahaDasa
    };
}

// Basic in-memory cache to prevent duplicate requests (deduplication)
const PREDICTION_CACHE = new Map<string, string>();

export async function generateDasaBhuktiPrediction(
    context: DasaAIContext,
    language: 'en' | 'ta',
    nextContext?: DasaAIContext,
    // NEW: Additional params for comprehensive analysis
    fullChartData?: any,  // Complete chart data for Phase 1-3 integration
    userId?: string,      // User ID for database storage
    dasaPeriod?: any,     // Dasa period details
    bhuktiPeriod?: any,   // Bhukti period details
    nextBhuktiPeriod?: any // Next bhukti period details
): Promise<string> {

    // ============================================================
    // PHASE 3: CHECK DATABASE CACHE FIRST
    // ============================================================

    if (userId && fullChartData && dasaPeriod && bhuktiPeriod) {
        try {
            // Import services dynamically to avoid circular dependencies
            const { gatherComprehensiveChartData } = await import('./comprehensiveChartAnalysis');
            const { findCachedPrediction, generateChartHash, savePrediction } = await import('../services/predictionStorageService');
            const { buildComprehensiveTamilPrompt, buildComprehensiveEnglishPrompt } = await import('./megaPromptBuilder');

            // Gather comprehensive chart data
            const comprehensiveData = gatherComprehensiveChartData(
                fullChartData.birthDetails || {},
                fullChartData.planets || [],
                fullChartData.houses || [],
                dasaPeriod,
                bhuktiPeriod,
                nextBhuktiPeriod
            );

            const chartHash = generateChartHash(comprehensiveData);

            // Check for cached prediction
            console.log('[AI] Checking cache for chart hash:', chartHash);
            const cached = await findCachedPrediction(userId, chartHash);

            if (cached) {
                console.log('[AI] ✅ Cache HIT! Returning cached prediction');
                return language === 'ta' ? cached.prediction.tamil : cached.prediction.english;
            }

            console.log('[AI] ❌ Cache MISS. Generating new prediction...');

            // ============================================================
            // PHASE 2: BUILD COMPREHENSIVE MEGA-PROMPT
            // ============================================================

            const megaPrompt = language === 'ta'
                ? buildComprehensiveTamilPrompt(comprehensiveData)
                : buildComprehensiveEnglishPrompt(comprehensiveData);

            console.log('[AI] Mega-prompt built. Length:', megaPrompt.length, 'characters');

            // ============================================================
            // AI GENERATION WITH PAID MODELS
            // ============================================================

            const PREFERRED_MODELS = [
                "deepseek/deepseek-chat",      // Primary - ultra-cheap
                "openai/gpt-4o-mini",          // Backup - accurate
                "google/gemini-pro-1.5",       // Fallback - Tamil support
            ];

            const OPENROUTER_KEYS = [
                "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",
                "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"
            ];

            let result = '';
            let usedModel = '';

            // Try OpenRouter with model rotation
            for (const key of OPENROUTER_KEYS) {
                for (const model of PREFERRED_MODELS) {
                    if (result) break; // Already got result

                    try {
                        console.log(`[AI] Trying ${model} with key ...${key.slice(-4)}`);

                        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${key}`,
                                'Content-Type': 'application/json',
                                'HTTP-Referer': window.location.href,
                                'X-Title': 'Astrology App - Comprehensive Dasa Predictions'
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: [{
                                    role: 'user',
                                    content: megaPrompt
                                }],
                                temperature: 0.7,
                                max_tokens: 2000, // Increased for comprehensive predictions
                            })
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.choices?.[0]?.message?.content) {
                                result = data.choices[0].message.content;
                                usedModel = model;
                                console.log(`[AI] ✅ Success with ${model}`);
                                break;
                            }
                        } else if (response.status === 429) {
                            console.warn(`[AI] Rate limited on ${model}, trying next key`);
                            break; // Try next key
                        } else {
                            console.warn(`[AI] ${model} failed with status ${response.status}`);
                        }

                        // Small delay between attempts
                        await new Promise(r => setTimeout(r, 500));

                    } catch (error) {
                        console.error(`[AI] Error with ${model}:`, error);
                    }
                }

                if (result) break; // Got result, exit key loop
            }

            if (!result) {
                throw new Error('All AI models exhausted. Please try again in an hour.');
            }

            // ============================================================
            // PHASE 3: SAVE TO DATABASE
            // ============================================================

            console.log('[AI] Saving prediction to database...');

            // Generate both Tamil and English if only one was requested
            let tamilPrediction = result;
            let englishPrediction = result;

            if (language === 'ta') {
                // We have Tamil, optionally generate English later
                englishPrediction = result; // For now, same
            } else {
                // We have English, optionally generate Tamil later
                tamilPrediction = result; // For now, same
            }

            try {
                const predictionId = await savePrediction(
                    userId,
                    comprehensiveData,
                    tamilPrediction,
                    englishPrediction,
                    usedModel
                );

                console.log('[AI] ✅ Prediction saved with ID:', predictionId);
            } catch (saveError) {
                console.error('[AI] Failed to save prediction:', saveError);
                // Continue anyway - user still gets the prediction
            }

            return result;

        } catch (error) {
            console.error('[AI] Error in comprehensive prediction flow:', error);
            // Fall back to basic prediction below
            console.warn('[AI] Falling back to basic prediction mode...');
        }
    }

    // ============================================================
    // FALLBACK: BASIC PREDICTION (Original Logic)
    // ============================================================

    console.log('[AI] Using basic prediction mode (no cache/comprehensive data)');

    // 1. Check in-memory cache (user-specific)
    const cacheKey = `${userId || 'anonymous'}-${context.planet}-${context.periodType}-${language}-${nextContext?.planet || 'none'}`;
    if (PREDICTION_CACHE.has(cacheKey)) {
        console.log('[AI] Using in-memory cached prediction');
        return PREDICTION_CACHE.get(cacheKey)!;
    }

    const GOOGLE_API_KEY = "AIzaSyBJTVK7y4U7Sb9V1oslE2uG_2t2ERq4Tdo";

    // OpenRouter Configuration (Paid Models - $5 Credit)
    const PREFERRED_MODELS = [
        "deepseek/deepseek-chat",
        "openai/gpt-4o-mini",
        "google/gemini-pro-1.5",
    ];

    const OPENROUTER_KEYS = [
        "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",
        "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"
    ];

    // Build the basic prompt (original logic)
    const prompt = language === 'ta'
        ? buildTamilPrompt(context, nextContext, dasaPeriod)
        : buildEnglishPrompt(context, nextContext, dasaPeriod);

    let result = '';

    // 1. Try Google Gemini Direct (Primary)
    try {
        console.log('[AI] Trying Google Gemini API (Primary)...');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                result = data.candidates[0].content.parts[0].text;
            }
        } else {
            console.warn('[AI] Google API failed/exhausted (Status ' + response.status + '), trying OpenRouter fallback...');
        }
    } catch (error) {
        console.warn('[AI] Google API error:', error);
    }

    // 2. Fallback: Rotate Keys and Models (OpenRouter)
    if (!result) {
        console.log('[AI] Starting OpenRouter Failover Strategy...');

        for (const key of OPENROUTER_KEYS) {
            for (const model of PREFERRED_MODELS) {
                try {
                    // Skip if key/model seems invalid (basic check)
                    if (!key || !model) continue;

                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': window.location.href, // Required by OpenRouter
                            'X-Title': 'Astrology App' // Required by OpenRouter
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [{
                                role: 'user',
                                content: prompt
                            }],
                            temperature: 0.7,
                            max_tokens: 3500  // Increased for comprehensive predictions
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices?.[0]?.message?.content) {
                            result = data.choices[0].message.content;
                            break; // Success! Break model loop
                        }
                    }

                    // If 429 (Rate Limit), break inner loop to switch API KEY immediately
                    if (response.status === 429) {
                        console.warn(`[AI] Key ...${key.slice(-4)} Rate Limited (429). Switching keys.`);
                        break; // Move to next key
                    }

                    console.warn(`[AI] OpenRouter ${model} failed: ${response.status}`);
                    // Small delay to avoid hammering
                    await new Promise(r => setTimeout(r, 500));
                } catch (err) {
                    console.error('[AI] OpenRouter Request Error:', err);
                }
            }
            if (result) break; // Break key loop if success
        }
    }

    // Cache and return
    if (result) {
        PREDICTION_CACHE.set(cacheKey, result);
        return result;
    }

    // Final fallback message
    return language === 'ta'
        ? 'கணிப்பை உருவாக்க முடியவில்லை. சேவை தற்காலிகமாக கிடைக்கவில்லை.'
        : 'Unable to generate prediction. Service temporarily unavailable.';
}

function getHouseLordshipDesc(context: DasaAIContext): string {
    return context.housesRuled
        .map(h => `${h}th house (${context.houseSignifications[h]})`)
        .join(' and ');
}

function buildEnglishPrompt(context: DasaAIContext, nextContext?: DasaAIContext, dasaPeriod?: any): string {
    const periodDesc = context.mahaDasa
        ? `${context.mahaDasa} Maha Dasha - ${context.planet} Bhukti`
        : `${context.planet} ${context.periodType}`;

    const houseLordshipDesc = getHouseLordshipDesc(context);

    let basePrompt = `You are a Vedic Astrology expert following Aditya Guruji's principles.

Chart Context:
- Ascendant: ${context.ascendant}
- Ascendant Lord: ${context.ascendantLord}
- Current Period: **${periodDesc}**
${nextContext ? `- Next Bhukti: ${nextContext.planet}` : ''}

${context.planet} - Current Bhukti Analysis:
1. House Lordship: Rules Houses ${houseLordshipDesc}
2. Subathuvam:
   Status: ${context.subathuvamStatus} (${context.subathuvamStatus === 'Subha' ? 'Good' : context.subathuvamStatus === 'Paapa' ? 'Afflicted' : 'Neutral'})
   Score: ${context.subathuvamScore}/100
   Reason: ${context.subathuvamReason}
3. Placement:
   In ${context.currentHouse}th house (${context.currentSign})
   Aspected by: ${context.aspectingPlanets.join(', ') || 'None'}
`;

    if (nextContext) {
        const nextHouseLordshipDesc = getHouseLordshipDesc(nextContext);
        basePrompt += `
UPCOMING PERIOD (${nextContext.planet} Bhukti):
1. House Lordship: Rules ${nextHouseLordshipDesc}
2. Strength: ${nextContext.subathuvamStatus} (Score: ${nextContext.subathuvamScore}/100)
3. Placement: ${nextContext.currentHouse}th house (${nextContext.currentSign})
`;
    }

    basePrompt += `
MANDATORY PREDICTION FORMAT:

**1. CURRENT PERIOD (${context.mahaDasa || context.planet}-${context.planet}):**
   📅 What is happening RIGHT NOW in life?
   
   🎯 Life Areas Affected:
   ${context.housesRuled.includes(1) || context.housesRuled.includes(10) ? '- 🏢 Career/Profession: (What is happening? What to expect?)' : ''}
   ${context.housesRuled.includes(2) || context.housesRuled.includes(11) ? '- 💰 Money/Income: (Financial situation?)' : ''}
   ${context.housesRuled.includes(7) ? '- 💑 Marriage/Relationships: (How is partnership?)' : ''}
   ${context.housesRuled.includes(6) || context.housesRuled.includes(8) ? '- ⚕️ Health: (What to watch for?)' : ''}
   ${context.housesRuled.includes(5) || context.housesRuled.includes(9) ? '- 📚 Children/Education: (Progress expected?)' : ''}
   ${context.housesRuled.includes(4) || context.housesRuled.includes(12) ? '- 🏠 Property/Vehicles: (Good time to buy/sell?)' : ''}
   
   ${context.subathuvamStatus === 'Subha' ? `
   ✅ Good Results:
   - What results you will receive?
   - Why these results? (Which house causes this?)
   ` : `
   ⚠️ Challenges:
   - What problems may arise?
   - Why these challenges? (Which house causes this?)
   `}
   
   📍 Specific Events Expected:
   - What major events can you expect in this Bhukti?
   
   ⚠️ Warnings:
   - What areas need caution?

`;

    if (nextContext) {
        basePrompt += `**2. NEXT PERIOD (${context.mahaDasa || nextContext.planet}-${nextContext.planet}):**
   📅 Start Date: [Mention next Bhukti start date]
   
   🔮 What Will Happen:
   - Compared to current ${context.planet} Bhukti, how will it be?
   - Better or worse than current period?
   
   📊 Which Life Areas Affected:
   ${nextContext.housesRuled.includes(1) || nextContext.housesRuled.includes(10) ? '- Career: (Changes expected?)' : ''}
   ${nextContext.housesRuled.includes(2) || nextContext.housesRuled.includes(11) ? '- Money: (Income increase/decrease?)' : ''}
   ${nextContext.housesRuled.includes(7) ? '- Relationships: (Better/Problems?)' : ''}
   
   💡 What to Prepare For:
   - What should you do NOW to prepare?
   
   🎯 Opportunities or Problems:
   - ${nextContext.subathuvamStatus === 'Subha' ? 'What opportunities will come?' : 'What problems to face?'}

`;
    }

    basePrompt += `**3. TIMING:**

   In Current ${context.planet} Bhukti:
   ⏰ When Exactly Results Will Come:
   - Early Phase (first 1/3): What to expect?
   - Middle Phase (2/3): When best results?
   - Final Phase (last 1/3): What changes?
   
   📅 Best Months vs Difficult Months:
   - Which months to make important decisions?
   - Which months to wait and watch?

${nextContext ? `
   In Next ${nextContext.planet} Bhukti:
   ⏰ When Results Will Come:
   - First Year: What to expect?
   - Second Year: When best results?
   - Final Year: What preparation needed?
` : ''}

MANDATORY RULES:
✅ Follow format: CURRENT PERIOD, NEXT PERIOD, TIMING
✅ Focus ONLY on specific ${context.planet} Bhukti predictions
✅ Be practical with examples
✅ Mention specific months when possible
❌ Avoid general ${context.mahaDasa || context.planet} Dasha statements

Be specific, practical, and encouraging. Use bullet points.`;
    return basePrompt;
}

function buildTamilPrompt(context: DasaAIContext, nextContext?: DasaAIContext, dasaPeriod?: any): string {
    const periodDesc = context.mahaDasa
        ? `${context.mahaDasa} மகா தசை - ${context.planet} புக்தி`
        : `${context.planet} ${context.periodType}`;

    const houseLordshipDesc = getHouseLordshipDesc(context);
    const statusTamil = context.subathuvamStatus === 'Subha' ? 'சுபத்துவம்' :
        context.subathuvamStatus === 'Paapa' ? 'பாபத்துவம்' : 'நடுநிலை';

    // Get current date for context
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleDateString('ta-IN', { month: 'long' });

    let basePrompt = `நீங்கள் ஆதித்ய குருஜி கொள்கைகளைப் பின்பற்றும் வேத ஜோதிட நிபுணர்.

⚠️ **தற்போதைய தேதி: ${currentMonth} ${currentYear}**
⚠️ **CRITICAL: ${currentYear}-க்கு முன்பான மாதங்களை குறிப்பிட வேண்டாம்! எப்போதும் எதிர்கால தேதிகளை மட்டும் கூறவும்!**

ஜாதக விவரங்கள்:
- லக்னம்: ${context.ascendant}
- லக்னாதிபதி: ${context.ascendantLord}
- தற்போதைய காலம்: **${periodDesc}**
${nextContext ? `- அடுத்து வரும் புக்தி: ${nextContext.planet}` : ''}

⚠️ **மிக முக்கியம் - தசா காலம் எல்லை:**
${dasaPeriod?.startDate && dasaPeriod?.endDate ? `
- தற்போதைய ${context.mahaDasa || context.planet} ${context.periodType}
- **காலம்: ${dasaPeriod.startDate} முதல் ${dasaPeriod.endDate} வரை**

🔴🔴🔴 **CRITICAL DEADLINE WARNING:** 🔴🔴🔴
**${dasaPeriod.endDate}-க்கு பிறகு இந்த தசா முடிவடைகிறது!**
**இந்த தேதிக்கு பிறகு எந்த கணிப்பும் கூற வேண்டாம்!**
**உதாரணம்: End date ஜனவரி 2026 என்றால், பிப்ரவரி 2026, மார்ச் 2026 prediction கூட கூடாது!**

${(() => {
                try {
                    const endDate = new Date(dasaPeriod.endDate);
                    const endYear = endDate.getFullYear();
                    const endMonth = endDate.getMonth() + 1;
                    return `⛔ **${endYear}-${endMonth < 10 ? '0' + endMonth : endMonth} மற்றும் அதற்கு பிறகான எந்த மாதங்களும் கூறக்கூடாது!** ⛔`;
                } catch (e) {
                    return '';
                }
            })()}
` : `
-தற்போதைய ${context.mahaDasa || context.planet} ${context.periodType} **[காலம் குறிக்கப்படவில்லை]**
- **இந்த தசா காலத்திற்குள் மட்டும் பலன்களை கூறவும்!**
`}

🎯 **ஆதித்ய குருஜி முறை:**
இந்த கணிப்பு ஆதித்ய குருஜி அவர்களின் principles-ஐ பின்பற்றி எழுதப்பட வேண்டும்:
- **சுபத்துவம்/பாபத்துவம்** மதிப்பெண்ணை அடிப்படையாக கொள்ளவும்
- **வீட்டு அதிபத்தியம்** சார்ந்த specific பலன்கள் கூறவும்
- **நடைமுறை, நேரடியான** மொழியில் எழுதவும் (சுருக்கமாக அல்லபெரிய வாக்கியங்கள் இல்லாமல்)
- **கால அட்டவணை** தெளிவாக குறிப்பிடவும்

${context.planet} - தற்போதைய புக்தி பகுப்பாய்வு:
1. வீட்டு அதிபத்தியம்: ${houseLordshipDesc} வீடுகளுக்கு அதிபதி
2. சுபத்துவம்: ${statusTamil} (மதிப்பெண்: ${context.subathuvamScore}/100)
   காரணம்: ${context.subathuvamReason}
3. இடம்: ${context.currentHouse}வது வீட்டில் ${context.currentSign} ராசியில்
4. பார்வைகள்: ${context.aspectingPlanets.join(', ') || 'இல்லை'}

🔴 **மிக முக்கியம் - சுபத்துவம் மதிப்பெண் புரிந்துகொள்ளல்:**
${context.subathuvamScore >= 90 ? `
✅✅✅ **${context.subathuvamScore}/100 = MAXIMUM வலிமை! (90-100 வரம்பு)**
**பலன்களின் தீவிரம்: ${Math.round((context.subathuvamScore / 100) * 100)}% நல்ல பலன்கள்!**

- இந்த score-ல், **அனைத்து செயல்களும் மிக சிறப்பாக** நடக்கும்!
- ${context.housesRuled.includes(6) ? '**6வது வீட்டு அதிபதி:** எதிரிகள் முழுமையாக தோற்கடிக்கப்படுவார்கள், கடன்கள் விரைவில் தீரும், நோய்கள் முற்றிலும் குணமாகும்!' : ''}
- ${context.housesRuled.includes(7) ? '**7வது வீட்டு அதிபதி:** திருமணம்/வணிக கூட்டாண்மை அதிக வெற்றி, ஒத்துழைப்பு 100%!' : ''}
- ${context.housesRuled.includes(8) ? '**8வது வீட்டு அதிபதி:** தீவிர அதிர்ஷ்டம், எதிர்பாராத பெரிய லாபம், ஆழ்ந்த ஞானம் கிடைக்கும்!' : ''}
- **எல்லா பகுதிகளிலும் ${Math.round((context.subathuvamScore / 100) * 10)}/10 வெற்றி விகிதம்!**
` : context.subathuvamScore >= 80 ? `
✅✅ **${context.subathuvamScore}/100 = மிக நல்ல வலிமை! (80-89 வரம்பு)**
**பலன்களின் தீவிரம்: ${Math.round((context.subathuvamScore / 100) * 100)}% நல்ல பலன்கள்!**

- இந்த score-ல், **பெரும்பாலான செயல்கள் வெற்றி** பெறும்!
- ${context.housesRuled.includes(6) ? '**6வது வீட்டு அதிபதி:** எதிரிகளை வெல்லலாம், கடன்கள் படிப்படியாக தீரும், உடல்நலம் நன்றாக இருக்கும்!' : ''}
- ${context.housesRuled.includes(7) ? '**7வது வீட்டு அதிபதி:** திருமணம்/கூட்டாண்மை நல்ல முறையில், சிறிய சவால்கள் மட்டும்!' : ''}
- ${context.housesRuled.includes(8) ? '**8வது வீட்டு அதிபதி:** நல்ல அதிர்ஷ்டம், எதிர்பாராத உதவி, ஆராய்ச்சியில் வெற்றி!' : ''}
- **வெற்றி விகிதம்: ${Math.round((context.subathuvamScore / 100) * 10)}/10**
` : context.subathuvamScore >= 70 ? `
✅ **${context.subathuvamScore}/100 = நல்ல வலிமை (70-79 வரம்பு)**
**பலன்களின் தீவிரம்: ${Math.round((context.subathuvamScore / 100) * 100)}% நல்ல, ${Math.round(((100 - context.subathuvamScore) / 100) * 100)}% சவால்**

- இந்த score-ல், **நல்ல பலன்கள் அதிகம், ஆனால் சில சவால்களும் உண்டு**
- வெற்றி கிடைக்கும், ஆனால் **முயற்சி தேவை**
- **வெற்றி விகிதம்: 7/10**
` : context.subathuvamScore >= 60 ? `
⚡ **${context.subathuvamScore}/100 = மிதமான வலிமை (60-69 வரம்பு)**
**பலன்களின் தீவிரம்: ${Math.round((context.subathuvamScore / 100) * 100)}% நல்ல, ${Math.round(((100 - context.subathuvamScore) / 100) * 100)}% சவால்**

- இந்த score-ல், **நல்லதும் கெட்டதும் சமமாக**
- **கடின உழைப்பு அவசியம்** - எளிதில் எதுவும் வராது
- **வெற்றி விகிதம்: 6/10**
` : context.subathuvamScore >= 50 ? `
⚠️ **${context.subathuvamScore}/100 = நடுநிலை வலிமை (50-59 வரம்பு)**
**பலன்களின் தீவிரம்: ${Math.round((context.subathuvamScore / 100) * 100)}% நல்ல, ${Math.round(((100 - context.subathuvamScore) / 100) * 100)}% சவால்**

- இந்த score-ல், **சவால்கள் சற்று அதிகம்**
- **மிக கவனமாக இருக்க வேண்டும்**
- **வெற்றி விகிதம்: 5/10**
` : `
🔴 **${context.subathuvamScore}/100 = குறைந்த வலிமை (0-49 வரம்பு)**
**பலன்களின் தீவிரம்: ${Math.round((context.subathuvamScore / 100) * 100)}% நல்ல, ${Math.round(((100 - context.subathuvamScore) / 100) * 100)}% சவால்**

- இந்த score-ல், **சவால்கள் மிக அதிகம்**
- **மிக எச்சரிக்கையாக இருக்க வேண்டும்**, அவசர முடிவுகள் தவிர்க்க வேண்டும்
- **வெற்றி விகிதம்: ${Math.round((context.subathuvamScore / 100) * 10)}/10**
`}

**⚠️ AI-க்கு அறிவுறுத்தல்:** ${context.subathuvamScore}/100 score-க்கு ஏற்ப, **அதே விகிதத்தில் நல்ல/கெட்ட பலன்களை** கூறவும்!
- 90-100 = 90-100% நல்ல விஷயங்கள் மட்டுமே!
- 80-89 = 80-89% நல்ல விஷயங்கள், 10-20% சவால்கள்
- 70-79 = 70-79% நல்ல விஷயங்கள், 20-30% சவால்கள்
- மற்றும் பல...

`;

    if (nextContext) {
        const nextHouseDesc = getHouseLordshipDesc(nextContext);
        const nextStatus = nextContext.subathuvamStatus === 'Subha' ? 'சுபத்துவம்' : 'பாபத்துவம்';

        basePrompt += `
அடுத்து வரப்போகும் புக்தி (${nextContext.planet}):
1. அதிபத்தியம்: ${nextHouseDesc} வீடுகளுக்கு அதிபதி
2. வலிமை: ${nextStatus} (மதிப்பெண்: ${nextContext.subathuvamScore}/100)
3. இடம்: ${nextContext.currentHouse}வது வீட்டில்
`;
    }

    basePrompt += `
கணிப்பு எழுத வேண்டிய கட்டாய முறை:

**1. தற்போதைய காலம் (${context.mahaDasa || context.planet}-${context.planet}):**
   📅 இப்போது நடப்பது என்ன?
   
   🎯 வாழ்க்கை பகுதிகள்:
   ${context.housesRuled.includes(1) || context.housesRuled.includes(10) ? '- 🏢 தொழில்/வேலை: (என்ன நடக்கிறது? எதிர்பார்க்கலாம்?)' : ''}
   ${context.housesRuled.includes(2) || context.housesRuled.includes(11) ? '- 💰 பணம்/வருமானம்: (நிதி நிலை எப்படி?)' : ''}
   ${context.housesRuled.includes(7) ? '- 💑 திருமணம்/உறவுகள்: (கூட்டாளியுடன் உறவு?)' : ''}
   ${context.housesRuled.includes(6) || context.housesRuled.includes(8) ? '- ⚕️ உடல்நலம்: (கவனிக்க வேண்டிய விஷயங்கள்?)' : ''}
   ${context.housesRuled.includes(5) || context.housesRuled.includes(9) ? '- 📚 பிள்ளைகள்/படிப்பு: (என்ன முன்னேற்றம்?)' : ''}
   ${context.housesRuled.includes(4) || context.housesRuled.includes(12) ? '- 🏠 சொத்து/வாகனம்: (வாங்க/விற்க சாதகமா?)' : ''}
   
   ${context.subathuvamScore >= 80 ? `
   ✅ **நல்ல பலன்கள் (சுபத்துவம் ${context.subathuvamScore}/100 - மிக சிறந்தது!):**
   - ${context.housesRuled.includes(6) ? '6வது வீட்டு அதிபதி என்றாலும், உயர் சுபத்துவம் இருப்பதால் **எதிரிகளை வெல்லலாம், கடன்கள் தீரும், நோய்கள் குணமாகும்**!' : ''}
   - ${context.housesRuled.includes(8) ? '8வது வீட்டு அதிபதி என்றாலும், உயர் சுபத்துவம் இருப்பதால் **தற்செயல் லாபம், ஆராய்ச்சியில் வெற்றி, மறைமுக உதவி** கிடைக்கும்!' : ''}
   - எந்த வீட்டு அதிபதியாக இருந்தாலும், **80+ சுபத்துவம் = சிறந்த பலன்கள் மட்டுமே!**
   ` : context.subathuvamScore >= 50 ? `
   ⚡ **கலவையான பலன்கள்:**
   - நடுநிலை வலிமை - நல்லதும் சவாலும் சேர்ந்து
   ` : `
   ⚠️ **சவால்கள்:**
   - குறைந்த சுபத்துவம் - எச்சரிக்கையாக இருக்க வேண்டும்
   `}
   
   📍 குறிப்பிட்ட நிகழ்வுகள்:
   - இந்த புக்தியில் என்ன முக்கிய நிகழ்வுகள் எதிர்பார்க்கலாம்?
   
   ⚠️ எச்சரிக்கைகள்:
   - என்னென்ன விஷயங்களில் கவனமாக இருக்க வேண்டும்?

`;

    if (nextContext) {
        const nextStatusTamil = nextContext.subathuvamStatus === 'Subha' ? 'சுபத்துவம்' : 'பாபத்துவம்';

        basePrompt += `**2. அடுத்த காலம் (${context.mahaDasa || nextContext.planet}-${nextContext.planet}):**
   📅 எப்போது ஆரம்பம்: [அடுத்த புக்தி start date கூறவும்]
   
   🔮 என்ன நடக்கும்:
   - தற்போதைய ${context.planet} புக்தியுடன் ஒப்பிடும்போது எப்படி?
   - ${nextContext.subathuvamScore > context.subathuvamScore ? 'சிறப்பாக இருக்கும்!' : nextContext.subathuvamScore < context.subathuvamScore ? 'சவாலாக இருக்கும்!' : 'ஒரே மாதிரி இருக்கும்!'}
   
   📊 எந்த பகுதிகள் பாதிக்கும்:
   ${nextContext.housesRuled.includes(1) || nextContext.housesRuled.includes(10) ? '- தொழில்: (மாற்றம் வருமா?)' : ''}
   ${nextContext.housesRuled.includes(2) || nextContext.housesRuled.includes(11) ? '- பணம்: (வருமானம் அதிகமா/குறையுமா?)' : ''}
   ${nextContext.housesRuled.includes(7) ? '- உறவுகள்: (சிறப்பாக/பிரச்சினை?)' : ''}
   
   💡 தயாரிப்பு:
   - இப்போதே என்ன செய்து தயாராக வேண்டும்?
   
   🎯 வாய்ப்புகள் அல்லது பிரச்சினைகள்:
   - ${nextStatusTamil === 'சுபத்துவம்' ? 'என்ன வாய்ப்புகள் வரும்?' : 'என்ன பிரச்சினைகளை எதிர்கொள்ள வேண்டும்?'}

`;
    }

    basePrompt += `**3. நேரம் (TIMING):**

   ⚠️ **முக்கியம்: தற்போது ${currentMonth} ${currentYear}. ${currentYear}-க்கு முன்பான மாதங்களை கூற வேண்டாம்!**
   ${dasaPeriod?.endDate ? `
   🔴 **END DATE: ${dasaPeriod.endDate} - இதற்கு பிறகு கணிப்பு கூடாது!**
   ${(() => {
                try {
                    const endDate = new Date(dasaPeriod.endDate);
                    const endYear = endDate.getFullYear();
                    const endMonth = endDate.getMonth() + 1;
                    const monthNames = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
                    return `⛔ **கடைசி மாதம்: ${monthNames[endMonth - 1]} ${endYear} - இதற்கு பிறகு எதுவும் கூறக்கூடாது!** ⛔`;
                } catch (e) {
                    return '';
                }
            })()}
   ` : ''}

   தற்போதைய ${context.planet} புக்தியில்:
   ⏰ எப்போது பலன்கள் கிடைக்கும்:
   - அடுத்த சில மாதங்களில்: (உதாரணம்: ${currentYear} ${['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'][(currentDate.getMonth() + 2) % 12]} அல்லது ${currentYear + 1} ஜனவரி)
   - நடு கட்டத்தில்: எப்போது சிறந்த பலன்கள்?
   - இறுதி கட்டத்தில்: என்ன மாற்றங்கள்?
   
   📅 சிறந்த மாதங்கள் vs கடினமான மாதங்கள்:
   - **எதிர்கால மாதங்களை மட்டும்** (${currentYear} ${currentMonth}-க்கு பிறகு) குறிப்பிடவும்!
   - எந்த மாதங்களில் முக்கிய முடிவுகள் எடுக்கலாம்?

${nextContext ? `
   அடுத்த ${nextContext.planet} புக்தியில்:
   ⏰ எப்போது பலன்கள் வரும்:
   - முதல் ஆண்டு: (${currentYear + 1} அல்லது அதற்கு பிறகு)
   - இரண்டாவது ஆண்டு: சிறந்த பலன்கள் எப்போது?
   - இறுதி ஆண்டு: என்ன தயாரிப்பு தேவை?
` : ''}

கட்டாய விதிகள்:
✅ தற்போது ${currentMonth} ${currentYear} - இதற்கு முன்பான மாதங்களை கூற வேண்டாம்!
✅ சுபத்துவம் 80-100 = மிக சிறந்த பலன்கள் (வீடு எதுவாக இருந்தாலும்!)
✅ சுபத்துவம் 50-79 = நடுநிலை பலன்கள்
✅ சுபத்துவம் 0-49 = சவால்கள்
✅ குறிப்பிட்ட ${context.planet} புக்தி பலன்களை மட்டும் கூறவும்
❌ பொதுவான ${context.mahaDasa || context.planet} தசை பலன்கள் வேண்டாம்
❌ ${currentYear}-க்கு முன்பான தேதிகள் வேண்டாம்!

தெளிவான, விரிவான, நடைமுறை முறையில் தமிழில் கொடுங்கள்.`;
    return basePrompt;
}
