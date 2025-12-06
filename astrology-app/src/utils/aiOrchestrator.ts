import { PredictionResult } from './predictionRules';
import { SIGN_LORDS } from './constants';

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
}

const OPENROUTER_API_KEY = "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";

// List of free models to try in order of preference
const FREE_MODELS = [
    "google/gemini-2.0-flash-exp:free", // High quality, fast
    "google/gemini-2.0-flash-thinking-exp:free", // Good for logic
    "mistralai/mistral-7b-instruct:free", // Reliable fallback
    "microsoft/phi-3-mini-128k-instruct:free", // Very fast
    "meta-llama/llama-3-8b-instruct:free", // If available
    "huggingfaceh4/zephyr-7b-beta:free", // Classic free model
];

export const queryAstrologyOrchestrator = async (
    question: string,
    chartData: any,
    language: 'en' | 'ta'
): Promise<OrchestratorResponse> => {

    // 1. Intent Classification
    let intent = "General Prediction";
    const qLower = question.toLowerCase();
    if (qLower.includes("marriage") || qLower.includes("wedding") || qLower.includes("spouse") || qLower.includes("love") || qLower.includes("திருமணம்")) {
        intent = "Marriage Timing";
    } else if (qLower.includes("job") || qLower.includes("career") || qLower.includes("work") || qLower.includes("business") || qLower.includes("வேலை")) {
        intent = "Career/Job";
    }

    // 2. Prepare Context
    const context = prepareContext(chartData, intent);

    // 3. Construct Prompt
    const systemPrompt = `
    Act as Vedic Astrologer Aditya Guruji. 
    You are an advanced AI Logic Engine responsible for answering user questions by synthesizing precise astrological calculations.
    
    Input Data:
    ${JSON.stringify(context, null, 2)}

    Key Rules:
    - **CRITICAL**: Distinguish between "Planets in 7th House" and "7th Lord".
    - If Subathuvam score is > 50%, the planet is STRONG and BENEFIC.
    - If Pavathuvam score is high, the planet is WEAK/MALEFIC.
    - Rahu in 7th or with 7th Lord = Love/Inter-caste Marriage.
    - Saturn in 10th or aspecting 10th = Service/Labor/Hard work.
    - Sun connected to 10th + Jupiter aspect = Govt Job.
    
    Task:
    Answer the user's question: "${question}"
    
    Output Requirements:
    - Provide the answer in BOTH Tamil and English.
    - If the user asks in Tamil, prioritize the Tamil response.
    - Ensure the "7th Lord" is correctly identified from the Input Data.
    
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
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "Astrology App"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: question }
                    ],
                    response_format: { type: "json_object" }
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
                // If JSON parse fails, we might want to try another model or just return error
                // Usually if one model fails to output JSON, others might too if prompt is bad, 
                // but let's try next just in case.
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

const prepareContext = (data: any, intent: string) => {
    // Extract relevant data based on intent
    const { planets, ascendant, subathuvamScores, currentDasa } = data;

    // Calculate House Lords
    const ascSignIndex = ascendant.signIndex; // 0-11
    const getLord = (houseNum: number) => {
        const signIndex = (ascSignIndex + houseNum - 1) % 12;
        return SIGN_LORDS[signIndex];
    };

    const houseLords = {
        Lord_1: getLord(1),
        Lord_5: getLord(5),
        Lord_7: getLord(7),
        Lord_9: getLord(9),
        Lord_10: getLord(10),
    };

    // Simplified context object
    return {
        Lagna: ascendant.sign,
        HouseLords: houseLords,
        CurrentDasa: currentDasa ? `${currentDasa.maha.planet} - ${currentDasa.bhukti?.planet}` : "Unknown",
        SubathuvamScores: subathuvamScores,
        KeyPlanets: planets.map((p: any) => ({
            name: p.name,
            sign: p.sign,
            house: (p.signIndex - ascendant.signIndex + 12) % 12 + 1,
            is_7th_lord: p.name === houseLords.Lord_7,
            is_10th_lord: p.name === houseLords.Lord_10
        }))
    };
};
