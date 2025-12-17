
const OPENROUTER_API_KEY = "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";

const testData = {
    intent: "Comprehensive House Analysis",
    primary_analysis: {
        key_planet: "Sun",
        status: "Good",
        dasa_verdict: "Positive"
    },
    model_consensus: "Good chart",
    final_answer_tamil: "Initial Tamil",
    final_answer_english: "Initial English",
    reasoning: "Reasoning",
    bava_analysis_report: {
        lagna_summary: "Lagna is Leo. Sun is strong.",
        house_predictions: [
            {
                house_number: 1,
                title: "Self & Health",
                status: "Strong",
                analysis: "First house is excellent. You will have good health.",
                guruji_rule_applied: "Lagna lord in Kendra"
            }
        ],
        final_verdict: "Overall a great life."
    }
};

async function translateAnalysisReport(englishResponse: any) {
    if (!englishResponse.bava_analysis_report) {
        return englishResponse;
    }

    const report = englishResponse.bava_analysis_report;
    const prompt = `
    You are an expert Tamil translator and Astrologer.
    Translate the following astrological analysis from English to Tamil.
    
    CRITICAL INSTRUCTIONS:
    1. Keep the JSON structure EXACTLY the same.
    2. Translate 'analysis', 'guruji_rule_applied', 'lagna_summary', and 'final_verdict' values to Tamil.
    3. Maintain astrological nuances (e.g., "Lagna" -> "லக்னம்", "Aspect" -> "பார்வை").
    4. Use the following House Titles in Tamil for the 'title' field based on house_number:
       1: "சுயம் & ஆரோக்கியம்"

    INPUT JSON:
    ${JSON.stringify(report, null, 2)}

    OUTPUT JSON ONLY.
    `;

    console.log("Sending request to OpenRouter...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://astrology-app.com",
                "X-Title": "Astrology App",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [{ "role": "user", "content": prompt }],
                "temperature": 0.3,
                "response_format": { "type": "json_object" }
            })
        });

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", JSON.stringify(data, null, 2));

        let translationRaw = data.choices?.[0]?.message?.content;

        if (translationRaw) {
            if (translationRaw.includes('```json')) {
                translationRaw = translationRaw.replace(/```json/g, '').replace(/```/g, '');
            }
            const translatedReport = JSON.parse(translationRaw);
            console.log("Translation Successful:", JSON.stringify(translatedReport, null, 2));
        } else {
            console.error("No content in response");
        }

    } catch (error) {
        console.error("Translation Error:", error);
    }
}

translateAnalysisReport(testData);
