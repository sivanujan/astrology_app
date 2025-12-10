import { PredictionResult } from './predictionRules';
import { SIGN_LORDS, NAKSHATRAS } from './constants';

export interface OrchestratorResponse {
    intent: string;
    primary_analysis: {
        key_planet: string;
        status: string;
        dasa_verdict: string;
    };
    model_consensus: string;
    final_answer_tamil: string;
    final_answer_english: string;
    reasoning: string;
    bava_analysis_report?: {
        lagna_summary: string;
        house_predictions: Array<{
            house_number: number;
            title: string;
            status: string;
            analysis: string;
            guruji_rule_applied: string;
        }>;
        final_verdict: string;
    };
}

const OPENROUTER_API_KEY = "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";

const FREE_MODELS = [
    "google/gemini-2.0-flash-exp:free", // Primary: Latest experimental
    "google/gemini-exp-1206:free", // Secondary: Reliable experimental
    "google/gemini-2.0-flash-thinking-exp:free", // Tertiary: Deep thinking
    "mistralai/mistral-7b-instruct:free", // Fallback: Non-Google option
];

const HOUSE_KARAKAS = {
    1: "Sun (Self, Vitality)",
    2: "Jupiter (Wealth, Speech)",
    3: "Mars (Courage, Siblings)",
    4: "Moon (Mother, Comforts)",
    5: "Jupiter (Children, Intelligence)",
    6: "Mars/Saturn (Disease, Enemies)",
    7: "Venus (Spouse, Partnership)",
    8: "Saturn (Longevity, Struggles)",
    9: "Sun/Jupiter (Father, Fortune)",
    10: "Sun/Saturn (Career, Authority)",
    11: "Jupiter (Gains, Elder Siblings)",
    12: "Saturn (Loss, Moksha)"
};

const HOUSE_NAMES_TA = [
    "சுயம் & ஆரோக்கியம் (Self & Health)",
    "குடும்பம் & தனம் (Family & Wealth)",
    "சகோதரர்கள் & தைரியம் (Siblings & Courage)",
    "தாயார் & சுகம் (Mother & Comforts)",
    "குழந்தைகள் & புத்தி (Children & Intelligence)",
    "நோய் & எதிரிகள் (Disease & Enemies)",
    "திருமணம் & கூட்டாளி (Marriage & Partnership)",
    "ஆயுள் & மறைவு (Longevity & Mysteries)",
    "தந்தை & பாக்கியம் (Father & Fortune)",
    "தொழில் (Career)",
    "லாபம் & நண்பர்கள் (Gains & Friends)",
    "இழப்பு & மோட்சம் (Loss & Liberation)"
];

const HOUSE_NAMES_EN = [
    "Self & Health",
    "Family & Wealth",
    "Siblings & Courage",
    "Mother & Comforts",
    "Children & Intelligence",
    "Disease & Enemies",
    "Marriage & Partnership",
    "Longevity & Mysteries",
    "Father & Fortune",
    "Career",
    "Gains & Friends",
    "Loss & Liberation"
];

export async function queryAstrologyOrchestrator(
    userQuery: string,
    chartData: any,
    language: 'en' | 'ta' = 'en',
    apiKey?: string // Optional user-provided key
): Promise<OrchestratorResponse> {

    // 1. Intent Classification
    let intent = "General Prediction";
    let isComprehensiveAnalysis = false;

    const qLower = userQuery.toLowerCase();
    if (qLower.includes("marriage") || qLower.includes("wedding") || qLower.includes("spouse") || qLower.includes("love") || qLower.includes("திருமணம்")) {
        intent = "Marriage Timing";
    } else if (qLower.includes("job") || qLower.includes("career") || qLower.includes("work") || qLower.includes("business") || qLower.includes("வேலை")) {
        intent = "Career/Job";
    } else if (qLower.includes("full") || qLower.includes("complete") || qLower.includes("detailed") || qLower.includes("comprehensive") || qLower.includes("all") || qLower.includes("everything") || qLower.includes("முழு") || qLower.includes("விரிவான")) {
        intent = "Comprehensive House Analysis";
        isComprehensiveAnalysis = true;
    }

    // 2. Prepare Context
    const context = prepareContext(chartData, intent, isComprehensiveAnalysis);

    // 3. Construct Prompt
    let systemPrompt = "";

    if (isComprehensiveAnalysis) {
        // Bava-by-Bava Analysis Prompt
        systemPrompt = `
You are an expert Vedic Astrologer following Aditya Guruji's System. 
Task: Perform a "Bava-by-Bava" (House-by-House) Analysis of the user's chart. Do not skip any house. Analyze strictly in the order of 1 to 12.

Input Data (User's Chart):
${JSON.stringify(context, null, 2)}

The Analysis Protocol (Execute Step-by-Step):

For EVERY HOUSE (1 to 12), you must apply this Guruji Audit Logic:

Step A: The House (Bava): Is the house occupied by a Benefic (Jupiter, Venus, Mercury, Waxing Moon) or Malefic?
Rule: Benefics increase the house's life. Malefics (Saturn/Mars/Rahu) destroy it unless they have Subathuvam.

Step B: The Lord (Adhipathi): Where is the Lord placed? Is he strong (Kendra/Trikona) or weak (6/8/12)?
Rule: If the Lord is hidden in 6/8/12, that relationship/result suffers.

Step C: The Karaka (Significator): Is the natural Karaka for that house strong? (e.g., Sun for 9th, Moon for 4th).

Step D: The Verdict: Combine A + B + C.
- Strong: "Excellent results."
- Mixed: "Average results."
- Weak (Pavathuvam): "Struggle/Denial of result."

Execution Loop (Internal Thought Process):
1. Analyze Lagna (1st): Check Lagna Lord strength & Aspects on Lagna. (Key: Health, Status).
2. Analyze 2nd House: Check 2nd Lord & Occupants. (Key: Family, Speech, Wealth).
3. Analyze 3rd House: Check 3rd Lord & Mars. (Key: Courage, Siblings).
4. Analyze 4th House: Check 4th Lord, Moon, Mercury. (Key: Mother, House, Education).
5. Analyze 5th House: Check 5th Lord, Jupiter. (Key: Children, Poorva Punya).
6. Analyze 6th House: Check 6th Lord, Saturn/Mars. (Key: Debt, Disease, Enemies).
7. Analyze 7th House: Check 7th Lord, Venus. (Key: Marriage, Spouse).
8. Analyze 8th House: Check 8th Lord, Saturn. (Key: Longevity, Struggles).
9. Analyze 9th House: Check 9th Lord, Sun. (Key: Father, Fortune).
10. Analyze 10th House: Check 10th Lord, Sun/Saturn. (Key: Career, Authority).
11. Analyze 11th House: Check 11th Lord. (Key: Profit, Elder Siblings).
12. Analyze 12th House: Check 12th Lord. (Key: Loss, Sleep, Foreign Travel).

Required Output Format (JSON):
{
    "intent": "Comprehensive House Analysis",
    "primary_analysis": {
        "key_planet": "Lagna Lord name",
        "status": "Strength of Lagna Lord",
        "dasa_verdict": "Current Dasa verdict"
    },
    "model_consensus": "Brief overall summary",
    "final_answer_tamil": "முழுமையான பாவக பகுப்பாய்வு கீழே உள்ளது.",
    "final_answer_english": "Complete house-by-house analysis is provided below.",
    "reasoning": "Overall chart strength assessment",
    "bava_analysis_report": {
        "lagna_summary": "Your Lagna is [Lagna]. Lagna Lord [Planet] is in [House] with [Strength].",
        "house_predictions": [
            {
                "house_number": 1,
                "title": "${language === 'ta' ? HOUSE_NAMES_TA[0] : HOUSE_NAMES_EN[0]}",
                "status": "Strong/Weak/Moderate",
                "analysis": "Detailed analysis in ${language === 'ta' ? 'Tamil' : 'English'}",
                "guruji_rule_applied": "Specific Guruji rule used"
            }
            // ... Repeat for all 12 houses
        ],
        "final_verdict": "Overall chart assessment"
    }
}
`;
    } else {
        // Standard Master Prediction Prompt
        systemPrompt = `
Role & Persona:
You are an expert Vedic Astrologer modeled after the teachings of Aditya Guruji. You do not give generic answers. You analyze the specific Subathuvam (Beneficence), Pavathuvam (Maleficence), and Sookshma (Intricacy) strengths of the planets provided in the input to generate a precise prediction.

Input Data (Context):
${JSON.stringify(context, null, 2)}

Prediction Logic (The "Guruji" Rules):
1. Lagna First: Always check the Lagna Lord's strength first. If the Lagna Lord is weak (in 6, 8, 12 or debilitated without cancellation), check the Rasi Lord. If both are weak, the prediction must be cautious.
2. Subathuvam Check: Before predicting a negative event (Dosha), check for Subathuvam. Does a natural benefic (Jupiter, Venus, Mercury, Waxing Moon) aspect the afflicted planet? If yes, the evil effect is cancelled or reduced.
3. Dasa Judgment: Is the current Dasa Lord a functional benefic for this specific Lagna? (e.g., For Leo Lagna, Saturn is a functional malefic. His Dasa will be stressful unless he has obtained Subathuvam).
4. Transit (Gocharam): Use transit results (like Ashtama Shani or Guru Peyarchi) only as a secondary delivery mechanism. The Dasa determines if it happens; Transit determines when.

Task:
Generate a detailed "Life Prediction Report" for the user answering their specific question: "${userQuery}"

Output Requirements:
- Provide the answer in BOTH Tamil and English.
- If the user asks in Tamil, prioritize the Tamil response.
- Do NOT give generic advice. Use the specific planetary strengths provided.

Output Format (JSON):
{
    "intent": "${intent}",
    "primary_analysis": {
        "key_planet": "Name of planet relevant to question",
        "status": "Subathuva (Score%) or Pavathuva",
        "dasa_verdict": "Favorable/Unfavorable"
    },
    "model_consensus": "Brief summary of the analysis",
    "final_answer_tamil": "Answer in Tamil",
    "final_answer_english": "Answer in English",
    "reasoning": "Explanation of why this answer was chosen based on rules."
}
`;
    }

    // 4. Try Models with Fallback
    let lastError = null;

    for (const model of FREE_MODELS) {
        try {
            console.log(`Attempting with model: ${model}`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "Vedic AI Astrologer"
                },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "system", "content": systemPrompt },
                        { "role": "user", "content": userQuery }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4000
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`Model ${model} failed: ${response.status} - ${errorText}`);
                lastError = new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
                continue; // Try next model
            }

            const data = await response.json();

            if (!data.choices || data.choices.length === 0) {
                console.warn(`Model ${model} returned no choices.`);
                continue;
            }

            const content = data.choices[0].message.content;

            try {
                return JSON.parse(content);
            } catch (e) {
                console.error(`Failed to parse JSON from ${model}`, content);
                continue;
            }

        } catch (error) {
            console.error(`Network error with ${model}:`, error);
            lastError = error;
            continue;
        }
    }

    // If all models fail
    console.error("All models failed.", lastError);
    throw lastError || new Error("All available AI models failed to respond.");
};

const getNakshatra = (longitude: number): string => {
    const nakshatraSpan = 13.3333333333;
    const index = Math.floor(longitude / nakshatraSpan);
    return NAKSHATRAS[index % 27];
};

const getFunctionalNature = (planetName: string, lagnaSignIndex: number): string => {
    // Find which houses this planet owns
    const ownedHouses: number[] = [];
    SIGN_LORDS.forEach((lord, index) => {
        if (lord === planetName) {
            // Calculate house number relative to Lagna
            const houseNum = (index - lagnaSignIndex + 12) % 12 + 1;
            ownedHouses.push(houseNum);
        }
    });

    if (ownedHouses.some(h => [1, 5, 9].includes(h))) return "Functional Benefic (Trine Lord)";
    if (ownedHouses.some(h => [3, 6, 11].includes(h))) return "Functional Malefic (3/6/11 Lord)";
    return "Neutral/Mixed";
};

const prepareContext = (data: any, intent: string, isComprehensive: boolean = false) => {
    const { planets, ascendant, subathuvamScores, currentDasa } = data;

    const ascSignIndex = ascendant.signIndex;
    const moon = planets.find((p: any) => p.name === 'Moon');
    const lagnaLord = SIGN_LORDS[ascSignIndex];
    const rasiLord = moon ? SIGN_LORDS[moon.signIndex] : "Unknown";

    // Calculate House Lords
    const getLord = (houseNum: number) => {
        const signIndex = (ascSignIndex + houseNum - 1) % 12;
        return SIGN_LORDS[signIndex];
    };

    const houseLords = {
        Lord_1: getLord(1),
        Lord_2: getLord(2),
        Lord_3: getLord(3),
        Lord_4: getLord(4),
        Lord_5: getLord(5),
        Lord_6: getLord(6),
        Lord_7: getLord(7),
        Lord_8: getLord(8),
        Lord_9: getLord(9),
        Lord_10: getLord(10),
        Lord_11: getLord(11),
        Lord_12: getLord(12),
    };

    // Calculate which planets are in which houses
    const houseOccupants: Record<number, string[]> = {};
    for (let i = 1; i <= 12; i++) {
        houseOccupants[i] = [];
    }

    planets.forEach((p: any) => {
        const house = (p.signIndex - ascSignIndex + 12) % 12 + 1;
        houseOccupants[house].push(p.name);
    });

    const baseContext = {
        Lagna: ascendant.sign,
        LagnaLord: {
            name: lagnaLord,
            strength: subathuvamScores[lagnaLord]?.totalScore || 0,
            status: subathuvamScores[lagnaLord]?.totalScore > 50 ? "Strong (Subathuvam)" : "Weak"
        },
        Rasi: moon ? moon.sign : "Unknown",
        RasiLord: {
            name: rasiLord,
            strength: subathuvamScores[rasiLord]?.totalScore || 0
        },
        Star: moon ? getNakshatra(moon.longitude) : "Unknown",
        CurrentDasa: currentDasa ? {
            lord: currentDasa.maha.planet,
            functional_nature: getFunctionalNature(currentDasa.maha.planet, ascSignIndex),
            bhukti: currentDasa.bhukti?.planet
        } : "Unknown",
        HouseLords: houseLords,
        SubathuvamScores: subathuvamScores,
        KeyPlanets: planets.map((p: any) => ({
            name: p.name,
            sign: p.sign,
            house: (p.signIndex - ascendant.signIndex + 12) % 12 + 1,
            star: getNakshatra(p.longitude),
            is_7th_lord: p.name === houseLords.Lord_7,
            is_10th_lord: p.name === houseLords.Lord_10
        }))
    };

    // Add comprehensive house data if needed
    if (isComprehensive) {
        return {
            ...baseContext,
            HouseOccupants: houseOccupants,
            HouseKarakas: HOUSE_KARAKAS
        };
    }

    return baseContext;
};
