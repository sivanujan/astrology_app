// Lagna Identification Algorithm
// Calculates most likely Lagna based on user answers

import { Question, LAGNA_QUESTIONS } from './lagnaQuestions';

export interface LagnaResult {
    lagna: string;
    score: number;
    confidence: number;
    breakdown: {
        physical: number;
        personality: number;
        lifeEvents: number;
    };
}

export interface IdentificationResult {
    primary: LagnaResult;
    secondary: LagnaResult | null;
    tertiary: LagnaResult | null;
    allScores: LagnaResult[];
    recommendation: string;
}

const LAGNAS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const LAGNA_TAMIL_NAMES: Record<string, string> = {
    'Aries': 'மேஷம்',
    'Taurus': 'ரிஷபம்',
    'Gemini': 'மிதுனம்',
    'Cancer': 'கடகம்',
    'Leo': 'சிம்மம்',
    'Virgo': 'கன்னி',
    'Libra': 'துலாம்',
    'Scorpio': 'விருச்சிகம்',
    'Sagittarius': 'தனுசு',
    'Capricorn': 'மகரம்',
    'Aquarius': 'கும்பம்',
    'Pisces': 'மீனம்'
};

export function identifyLagna(
    answers: Record<string, string>,
    language: 'en' | 'ta' = 'en'
): IdentificationResult {
    // Initialize scores for all Lagnas
    const lagnaScores: Record<string, {
        total: number;
        physical: number;
        personality: number;
        lifeEvents: number;
    }> = {};

    LAGNAS.forEach(lagna => {
        lagnaScores[lagna] = {
            total: 0,
            physical: 0,
            personality: 0,
            lifeEvents: 0
        };
    });

    // Calculate scores based on answers
    LAGNA_QUESTIONS.forEach(question => {
        const answerId = answers[question.id];
        if (!answerId) return;

        const selectedOption = question.options.find(opt => opt.id === answerId);
        if (!selectedOption) return;

        // Add points to matching Lagnas
        selectedOption.lagnas.forEach(lagnaOption => {
            lagnaOption.lagna.forEach(lagna => {
                const points = lagnaOption.points * question.weight;
                lagnaScores[lagna].total += points;

                // Categorize by question type
                if (question.category === 'physical') {
                    lagnaScores[lagna].physical += points;
                } else if (question.category === 'personality') {
                    lagnaScores[lagna].personality += points;
                } else if (question.category === 'lifeEvents') {
                    lagnaScores[lagna].lifeEvents += points;
                }
            });
        });
    });

    // Convert to array and sort
    const results: LagnaResult[] = LAGNAS.map(lagna => {
        const scores = lagnaScores[lagna];
        const maxPossibleScore = calculateMaxPossibleScore();
        const confidence = Math.min(100, Math.round((scores.total / maxPossibleScore) * 100));

        return {
            lagna,
            score: Math.round(scores.total),
            confidence,
            breakdown: {
                physical: Math.round(scores.physical),
                personality: Math.round(scores.personality),
                lifeEvents: Math.round(scores.lifeEvents)
            }
        };
    }).sort((a, b) => b.score - a.score);

    const primary = results[0];
    const secondary = results[1].score > 0 ? results[1] : null;
    const tertiary = results[2].score > 0 ? results[2] : null;

    // Generate recommendation
    const recommendation = generateRecommendation(primary, secondary, language);

    return {
        primary,
        secondary,
        tertiary,
        allScores: results,
        recommendation
    };
}

function calculateMaxPossibleScore(): number {
    // Calculate theoretical maximum score if all answers match one Lagna
    let maxScore = 0;
    LAGNA_QUESTIONS.forEach(question => {
        const maxPointsForQuestion = Math.max(
            ...question.options.map(opt =>
                Math.max(...opt.lagnas.map(l => l.points))
            )
        );
        maxScore += maxPointsForQuestion * question.weight;
    });
    return maxScore;
}

function generateRecommendation(
    primary: LagnaResult,
    secondary: LagnaResult | null,
    language: 'en' | 'ta'
): string {
    if (language === 'ta') {
        if (primary.confidence >= 75) {
            return `உங்கள் லக்னம் ${LAGNA_TAMIL_NAMES[primary.lagna]} ஆக இருக்கலாம் (${primary.confidence}% நம்பிக்கை). துல்லியமான பலன்களுக்கு, சரியான பிறந்த நேரத்தை பயன்படுத்தவும்.`;
        } else if (primary.confidence >= 60) {
            const alt = secondary ? ` அல்லது ${LAGNA_TAMIL_NAMES[secondary.lagna]}` : '';
            return `உங்கள் லக்னம் ${LAGNA_TAMIL_NAMES[primary.lagna]}${alt} ஆக இருக்கலாம். இது மதிப்பீடு மட்டுமே (${primary.confidence}% நம்பிக்கை). சரியான பிறந்த நேரம் அவசியம்.`;
        } else {
            return `உங்கள் பதில்களின் அடிப்படையில், உங்கள் லக்னத்தை துல்லியமாக கண்டறிய முடியவில்லை. சரியான பிறந்த நேரத்தை பயன்படுத்தவும்.`;
        }
    } else {
        if (primary.confidence >= 75) {
            return `Your Lagna is most likely ${primary.lagna} (${primary.confidence}% confidence). For accurate predictions, please use exact birth time.`;
        } else if (primary.confidence >= 60) {
            const alt = secondary ? ` or ${secondary.lagna}` : '';
            return `Your Lagna might be ${primary.lagna}${alt}. This is an estimate (${primary.confidence}% confidence). Exact birth time is recommended.`;
        } else {
            return `Based on your answers, we cannot accurately determine your Lagna. Please try to find your exact birth time for better results.`;
        }
    }
}

export function getLagnaName(lagna: string, language: 'en' | 'ta' = 'en'): string {
    return language === 'ta' ? LAGNA_TAMIL_NAMES[lagna] : lagna;
}

// Estimate birth time based on Lagna (rough approximation)
export function estimateBirthTime(lagna: string, birthDate: Date, latitude: number, longitude: number): {
    approximateTime: string;
    timeRange: { start: string; end: string };
    disclaimer: string;
} {
    // Each Lagna rises for approximately 2 hours
    // This is a rough approximation - actual calculation would require complex astronomy

    const lagnaIndex = LAGNAS.indexOf(lagna);
    const hoursInDay = 24;
    const lagnaRiseDuration = 2; // Approximate hours each Lagna rises

    // Rough estimate: each Lagna rises for 2 hours starting from sunrise
    // This is VERY approximate and should include heavy disclaimer

    const sunriseHour = 6; // Approximate, varies by location
    const startHour = sunriseHour + (lagnaIndex * lagnaRiseDuration) % 24;
    const endHour = (startHour + lagnaRiseDuration) % 24;

    const formatTime = (hour: number) => {
        const h = Math.floor(hour) % 24;
        const m = Math.round((hour - Math.floor(hour)) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return {
        approximateTime: formatTime(startHour + 1), // Middle of range
        timeRange: {
            start: formatTime(startHour),
            end: formatTime(endHour)
        },
        disclaimer: 'This is a ROUGH approximation based on Lagna. Actual birth time can only be determined with precision instruments or birth records. Use this estimate with caution.'
    };
}

export default identifyLagna;
