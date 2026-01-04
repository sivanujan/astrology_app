
import { predictionService } from '../services/predictionService';

const OPENROUTER_API_KEY = "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"; // Access via Env Var in prod
const FREE_MODEL = "google/gemini-2.0-flash-exp:free";
const PAID_MODEL = "google/gemini-2.0-flash-001"; // Or Pro if verified

interface DailyForecastInput {
    date: Date;
    dasaLord: string;
    bhuktiLord: string;
    antaramLord?: string;
    dasaStatus: 'Good' | 'Bad' | 'Neutral' | 'Excellent' | 'Danger';
    transitStatus: 'Good' | 'Bad' | 'Neutral' | 'Excellent' | 'Danger';
    starRating: number;
    keyTransits: string[];
    taraBala: { score: number; type: string };
    verdict: string;
}

const callAIWithFallback = async (prompt: string, language: 'en' | 'ta'): Promise<string> => {

    // 1. Try Free Model
    try {
        console.log(`[DailyForecastAI] Attempting FREE model: ${FREE_MODEL}`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": FREE_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": `You are an expert Vedic Astrologer. Generate a concise 3-4 sentence daily horoscope prediction in ${language === 'ta' ? 'TAMIL' : 'ENGLISH'}. Focus on the balance between Dasa and Transit. Avoid jargon, give actionable advice.`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) return text.trim();
        } else {
            console.warn(`[DailyForecastAI] Free model failed: ${response.status}`);
        }
    } catch (e) {
        console.warn(`[DailyForecastAI] Free model error:`, e);
    }

    // 2. Fallback to Paid Model
    try {
        console.log(`[DailyForecastAI] Fallback to PAID model: ${PAID_MODEL}`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                // "HTTP-Referer": "https://siva-astro.com", // Optional
            },
            body: JSON.stringify({
                "model": PAID_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": `You are an expert Vedic Astrologer. Generate a concise 3-4 sentence daily horoscope prediction in ${language === 'ta' ? 'TAMIL' : 'ENGLISH'}. Focus on the balance between Dasa and Transit. Avoid jargon, give actionable advice.`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (response.ok) {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) return text.trim();
        }
    } catch (e) {
        console.error(`[DailyForecastAI] Paid model error:`, e);
    }

    return ""; // Failed
};

export const getOrGenerateDailyForecast = async (
    userId: string,
    data: DailyForecastInput,
    language: 'en' | 'ta' = 'en'
): Promise<string> => {
    // 1. Check Cache
    const dateStr = data.date.toDateString(); // "Tue Dec 30 2025"
    // Use Dasa-Bhukti-Antaram as context
    const contextKey = `${data.dasaLord}-${data.bhuktiLord}-${data.antaramLord || ''}`;

    // Pass contextKey to getStoredDailyForecast
    const cached = await predictionService.getStoredDailyForecast(userId, dateStr, language, contextKey);

    if (cached && cached.length > 10) {
        console.log(`[DailyForecastAI] Cache hit for ${dateStr} (${language}) [${contextKey}]`);
        return cached;
    }

    // 2. Construct Prompt
    const prompt = `
    Date: ${data.date.toLocaleDateString()}
    Dasa Context: Running ${data.dasaLord} Dasa, ${data.bhuktiLord} Bhukti${data.antaramLord ? `, ${data.antaramLord} Antaram` : ''}. Dasa Status: ${data.dasaStatus}.
    Transit (Gocharam) Context: Transit Score ${data.starRating}/5. Status: ${data.transitStatus}.
    Key Influences: ${data.keyTransits.join(', ')}.
    Moon/Tara Bala: ${data.taraBala.type} (Score: ${data.taraBala.score}).
    Final Verdict: ${data.verdict}.

    Based on this data, write a balanced natural language prediction. 
    - Mention if Dasa supports Transit or vice versa.
    - Mention specific good/bad influences from the list.
    - Give a health/career/money tip.
    - KEEP IT SHORT (max 50 words).
    `;

    // 3. Call AI
    const prediction = await callAIWithFallback(prompt, language);

    // 4. Save to Cache if successful
    if (prediction && prediction.length > 10) {
        // Pass contextKey to saveDailyForecast
        await predictionService.saveDailyForecast(userId, dateStr, prediction, language, contextKey);
    }

    return prediction || data.verdict; // Fallback to simple verdict if AI fails
};
