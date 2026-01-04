import { TransitPositions } from './predictionRules';
import { calculatePlanetaryPositions, calculateDashaPeriods, getCurrentDasha, calculateYogas, DashaPeriod, DASHA_YEARS, DASHA_ORDER } from './astrology';
import { translations, TAMIL_NAKSHATRAS } from './translations';
import { NAKSHATRAS, SIGN_LORDS } from './constants';

export interface GocharamResult {
    planet: string;
    status: 'Excellent' | 'Good' | 'Moderate' | 'Difficult' | 'Sade Sati' | 'Ashtama' | 'Ardhastama';
    description: string;
    isFavorable: boolean;
    aspects?: string[];
}

export interface DayForecast {
    date: Date;
    dateString: string;
    dasaLord: string;
    bhuktiLord: string;
    antaramLord: string; // Added for advanced prediction context
    starRating: number; // 0 to 5
    verdict: string;
    prediction: string;
    keyFactors: string[];
    // New Advanced Fields
    extended?: {
        dasa: {
            period: string;
            score: number;
            effect: string;
            beneficLevel: number; // 1-100
            dasa: string;
            bhukti: string;
            antaram: string;
            sookshma: string;
            prana: string;
        };
        transit: {
            score: number;
            moonHouse: number;
            keyTransits: string[];
        };
        totalScore: number;
        lifeAreas: {
            career: number;
            finance: number;
            health: number;
            relationships: number;
        };
        luckyTime: string;
        color: string;
        dos: string[];
        donts: string[];
        tithi: string;
        yoga: string;
        unluckyTime: string;
        nakshatra: string;
        tara: string;
    };
}

// ... existing helper ...
const getHouse = (fromSign: number, toSign: number): number => {
    return (toSign - fromSign + 12) % 12 + 1;
};

// --- CONSTANTS ---

const PLANET_TRANSIT_RULES: Record<string, { good: number[], neutral: number[], bad: number[] }> = {
    Sun: { good: [3, 6, 10, 11], neutral: [1, 2, 4, 7, 8, 9], bad: [5, 12] },
    Moon: { good: [1, 3, 6, 7, 10, 11], neutral: [2, 5, 9], bad: [4, 8, 12] },
    Mars: { good: [3, 6, 10, 11], neutral: [1, 2], bad: [4, 5, 7, 8, 9, 12] },
    Mercury: { good: [1, 2, 4, 6, 8, 10, 11], neutral: [3, 5, 7, 9], bad: [12] },
    Jupiter: { good: [1, 2, 5, 7, 9, 11], neutral: [3, 4, 6, 10], bad: [8, 12] },
    Venus: { good: [1, 2, 3, 4, 5, 8, 9, 11, 12], neutral: [6, 7], bad: [10] },
    Saturn: { good: [3, 6, 11], neutral: [2, 10], bad: [1, 4, 5, 7, 8, 9, 12] },
    Rahu: { good: [3, 6, 11], neutral: [2, 8], bad: [1, 4, 5, 7, 9, 12] },
    Ketu: { good: [3, 6, 11], neutral: [2, 8], bad: [1, 4, 5, 7, 9, 12] }
};

const TRANSIT_WEIGHTS: Record<string, number> = {
    Moon: 0.40,
    Jupiter: 0.15,
    Saturn: 0.15,
    Sun: 0.10,
    Mars: 0.05,
    Mercury: 0.05,
    Venus: 0.05,
    Rahu: 0.05 // Ketu implicitly same
};

// --- HELPERS ---

// Simplified Functional Nature Helper
const getPlanetNature = (planet: string, lagnaSign: number): 'Benefic' | 'Malefic' | 'Neutral' => {
    // Basic Rule: Lords of 1, 5, 9 are Benefic. Lords of 6, 8, 12 are Malefic.
    // This is simple. For detailed "Aditya Guruji" logic we would need more, but this suffices for the forecast engine baseline.
    const lords = SIGN_LORDS;
    const housesOwned: number[] = [];
    lords.forEach((lord, index) => {
        if (lord === planet) housesOwned.push(getHouse(lagnaSign, index));
    });

    if (housesOwned.some(h => [1, 5, 9].includes(h))) return 'Benefic';
    if (housesOwned.some(h => [6, 8, 12].includes(h))) return 'Malefic';
    return 'Neutral';
};

// Deep Dasa Calculation (Antaram -> Sookshma -> Prana)
const calculateDeepDasha = (antaramPeriod: DashaPeriod, targetDate: Date): { sookshma: string, prana: string } => {
    // Generate Sookshmas for this Antaram
    const sookshmaDuration = antaramPeriod.durationYears;
    let current = new Date(antaramPeriod.startDate);
    const startIndex = DASHA_ORDER.indexOf(antaramPeriod.planet);

    let sookshmaPlanet = '';
    let sookshmaStart = new Date();
    let sookshmaEnd = new Date();
    let sookshmaDur = 0;

    for (let i = 0; i < 9; i++) {
        const p = DASHA_ORDER[(startIndex + i) % 9];
        const dur = sookshmaDuration * (DASHA_YEARS[p] / 120);
        const end = new Date(current.getTime() + dur * 365.2425 * 24 * 3600 * 1000); // approx

        if (targetDate >= current && targetDate <= end) {
            sookshmaPlanet = p;
            sookshmaStart = current;
            sookshmaEnd = end;
            sookshmaDur = dur;
            break;
        }
        current = end;
    }

    if (!sookshmaPlanet) return { sookshma: 'Unknown', prana: 'Unknown' };

    // Generate Pranas for this Sookshma
    current = new Date(sookshmaStart);
    const sookshmaIndex = DASHA_ORDER.indexOf(sookshmaPlanet);
    let pranaPlanet = '';

    for (let i = 0; i < 9; i++) {
        const p = DASHA_ORDER[(sookshmaIndex + i) % 9];
        const dur = sookshmaDur * (DASHA_YEARS[p] / 120);
        const end = new Date(current.getTime() + dur * 365.2425 * 24 * 3600 * 1000);

        if (targetDate >= current && targetDate <= end) {
            pranaPlanet = p;
            break;
        }
        current = end;
    }

    return { sookshma: sookshmaPlanet, prana: pranaPlanet };
};


// Helper for Tara Bala (Star Strength) with Name
const calculateTaraBala = (dailyMoonLong: number, birthMoonLong: number, lang: 'en' | 'ta'): { score: number, keyFactor: string, starName: string, taraLabel: string } => {
    // 13.3333 deg per Nakshatra
    const nakshatraSpan = 13.333333;
    const birthStarIndex = Math.floor(birthMoonLong / nakshatraSpan);
    const dailyStarIndex = Math.floor(dailyMoonLong / nakshatraSpan);

    const dist = (dailyStarIndex - birthStarIndex + 27) % 27;
    const taraIndex = (dist % 9) + 1; // 1 to 9

    let score = 0;
    let quality = 'Neutral';
    let labelKey = '';

    switch (taraIndex) {
        case 1: score = -5; quality = 'Bad'; labelKey = 'janma'; break;
        case 2: score = 15; quality = 'Good'; labelKey = 'sampath'; break;
        case 3: score = -15; quality = 'Bad'; labelKey = 'vipat'; break;
        case 4: score = 15; quality = 'Good'; labelKey = 'kshema'; break;
        case 5: score = -10; quality = 'Bad'; labelKey = 'pratyak'; break;
        case 6: score = 20; quality = 'Good'; labelKey = 'sadhana'; break;
        case 7: score = -20; quality = 'Bad'; labelKey = 'naidhana'; break;
        case 8: score = 15; quality = 'Good'; labelKey = 'mitra'; break;
        case 9: score = 20; quality = 'Good'; labelKey = 'paramaMitra'; break;
    }

    const localizedLabel = getStr(lang, `gocharam.taraBala.${labelKey}`);
    const starIndexRaw = dailyStarIndex % 27;
    const starName = lang === 'ta' ? TAMIL_NAKSHATRAS[starIndexRaw] : NAKSHATRAS[starIndexRaw];

    const keyFactor = quality === 'Good'
        ? getStr(lang, "gocharam.factors.taraGood", { tara: localizedLabel, star: starName })
        : getStr(lang, "gocharam.factors.taraBad", { tara: localizedLabel, star: starName });

    return { score, keyFactor, starName, taraLabel: localizedLabel };
};

// --- MAIN PREDICTION ENGINE ---

// --- DYNAMIC PREDICTION ENGINE ---

const generateDailyPrediction = (
    lang: 'en' | 'ta',
    dasaLord: string,
    bhuktiLord: string,
    antaramLord: string,
    dasaScore: number,
    transitScore: number,
    finalScore: number,
    keyTransits: string[], // Already localized strings
    tara: { score: number, keyFactor: string, starName: string, taraLabel: string },
    fc: { career: number, finance: number, health: number, rel: number }
): string => {

    // 1. INTRO
    const sentiment = finalScore > 70 ? 'positive' : finalScore < 40 ? 'negative' : 'neutral';

    const intros = {
        en: {
            positive: ["Stars are aligned in your favor today.", "A promising day awaits you.", "Positive cosmic energy supports your actions."],
            neutral: ["A balanced day with mixed influences.", "Planetary forces are moderate today.", "Steady progress is expected."],
            negative: ["Cosmic currents are challenging today.", "Caution is advised as planets are tricky.", "Patience is your best ally today."]
        },
        ta: {
            positive: ["இன்று கிரக நிலை உங்களுக்கு சாதகமாக உள்ளது.", "சிறப்பான பலன்களைத் தரும் நாள்.", "நேர்மறையான ஆற்றல் உங்களைச் சூழ்ந்துள்ளது."],
            neutral: ["கலவையான பலன்கள் நிறைந்த நாள்.", "கிரகங்கள் சம நிலையில் உள்ளன.", "நிதானமான முன்னேற்றம் எதிர்பார்க்கலாம்."],
            negative: ["இன்று கிரக நிலை சற்று சவாலாக உள்ளது.", "கவனமுடன் செயல்பட வேண்டிய நாள்.", "பொறுமை காப்பது மிக அவசியம்."]
        }
    };

    const intro = intros[lang][sentiment][Math.floor(Math.random() * intros[lang][sentiment].length)];

    // 2. DASA CONTEXT (Now includes Bhukti)
    let dasaText = "";
    const dasaBhukti = `${dasaLord}-${bhuktiLord}`; // e.g., Saturn-Venus

    if (dasaScore > 70) {
        dasaText = lang === 'ta'
            ? `${dasaLord} தசை மற்றும் ${bhuktiLord} புத்தி உங்களுக்கு பலம் சேர்க்கின்றன.`
            : `${dasaBhukti} period strengthens your purpose.`;
    } else if (dasaScore < 40) {
        dasaText = lang === 'ta'
            ? `${dasaLord} தசை, ${bhuktiLord} புத்தி சற்று பலவீனமாக உள்ளதால் கவனம் தேவை.`
            : `${dasaBhukti} influence is weak, implying caution.`;
    } else {
        dasaText = lang === 'ta'
            ? `${dasaLord} தசை, ${bhuktiLord} புத்தி மத்திமமான பலன்களைத் தரும்.`
            : `${dasaBhukti} offers moderate support.`;
    }

    // 3. TRANSIT HIGHLIGHT (Now active)
    let transitText = "";
    if (keyTransits.length > 0) {
        // keyTransits[0] is usually the most significant ONE (e.g. Moon or Sun).
        // Format: "Sun in 11 (Good)" -> "Sun in 11 boosts you."
        // We will just append "Also, <first item>." to make strict sense of it.
        const firstTransit = keyTransits[0]; // "Sun in House (Good)"
        // Simple append because it's already localized well enough.
        transitText = lang === 'ta'
            ? `மேலும், ${firstTransit} சாதகமாக அமையலாம்.`
            : `Additionally, ${firstTransit}.`;
    }

    // 4. LIFE AREA FOCUS
    let focusText = "";
    // Find lowest score area to warn, or highest to encourage
    const areas = [
        { name: 'career', val: fc.career, labelEn: 'Career', labelTa: 'தொழில்' },
        { name: 'finance', val: fc.finance, labelEn: 'Finance', labelTa: 'நிதி' },
        { name: 'health', val: fc.health, labelEn: 'Health', labelTa: 'ஆரோக்கியம்' },
        { name: 'rel', val: fc.rel, labelEn: 'Relationships', labelTa: 'உறவுகள்' }
    ];

    // Sort by value ascending
    areas.sort((a, b) => a.val - b.val);
    const weakArea = areas[0];
    const strongArea = areas[3];

    if (finalScore < 50) {
        // Warn about weak area
        focusText = lang === 'ta'
            ? `குறிப்பாக ${weakArea.labelTa} விஷயத்தில் விழிப்புடன் இருக்கவும்.`
            : `Be especially vigilant regarding ${weakArea.labelEn}.`;
    } else {
        // Highlight strong area
        focusText = lang === 'ta'
            ? `${strongArea.labelTa} ரீதியாக நல்ல முன்னேற்றம் காணலாம்.`
            : `You can expect good progress in ${strongArea.labelEn}.`;
    }

    // 5. STAR TEXT
    let starText = "";
    if (tara.score > 10) {
        starText = lang === 'ta'
            ? `${tara.starName} நட்சத்திரம் நன்மை தரும்.`
            : `${tara.starName} brings favor.`;
    } else if (tara.score < 0) {
        starText = lang === 'ta'
            ? `${tara.starName} நட்சத்திரம் என்பதால் தடங்கல்கள் வரலாம்.`
            : `Obstacles possible due to ${tara.starName}.`;
    }

    return `${intro} ${dasaText} ${transitText} ${starText} ${focusText}`;
};

export const generate15DayForecast = (
    birthData: any,
    lang: Language = 'en'
): DayForecast[] => {
    const forecast: DayForecast[] = [];
    const startDate = new Date();

    const moon = birthData.planets.find((p: any) => p.name === 'Moon');
    const moonLong = moon?.longitude || 0;
    const rasiSign = moon?.signIndex || 0;
    const lagnaSign = birthData.ascendant?.signIndex || 0;

    const dashaPeriods = calculateDashaPeriods(birthData.birthDate, moonLong);
    console.log('[Generate15Day] Debug:', {
        birthDate: birthData.birthDate,
        moonLong,
        firstDasa: dashaPeriods[0]?.planet,
        dasaCount: dashaPeriods.length
    });

    for (let i = 0; i < 15; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // 1. DASA ANALYSIS (60%)
        const currentDasa = getCurrentDasha(dashaPeriods, currentDate);
        // console.log(`[Generate15Day] Day ${i} Dasa:`, currentDasa?.maha.planet, currentDasa?.bhukti?.planet);
        const dasaLord = currentDasa?.maha.planet || 'Unknown';
        const bhuktiLord = currentDasa?.bhukti?.planet || 'Unknown';
        const antaramLord = currentDasa?.antaram?.planet || 'Unknown';

        // Calculate Deep Dasa
        let sookshmaLord = 'Unknown';
        let pranaLord = 'Unknown';
        if (currentDasa?.antaram) {
            const deep = calculateDeepDasha(currentDasa.antaram, currentDate);
            sookshmaLord = deep.sookshma;
            pranaLord = deep.prana;
        }

        // Score Dasa Hierarchy
        // Weights: Maha(40), Bhukti(30), Antaram(15), Sookshma(10), Prana(5)
        const lords = [
            { name: dasaLord, weight: 0.4 },
            { name: bhuktiLord, weight: 0.3 },
            { name: antaramLord, weight: 0.15 },
            { name: sookshmaLord, weight: 0.1 },
            { name: pranaLord, weight: 0.05 }
        ];

        let dasaScore = 0; // 0-100
        lords.forEach(l => {
            const nature = getPlanetNature(l.name, lagnaSign);
            const base = nature === 'Benefic' ? 80 : nature === 'Malefic' ? 30 : 50;
            dasaScore += base * l.weight;
        });

        const dasaString = `${dasaLord}-${bhuktiLord}-${antaramLord}-${sookshmaLord}-${pranaLord}`;
        const dasaEffectKey = dasaScore > 70 ? 'dasaStrong' : dasaScore < 40 ? 'dasaHidden' : 'dasaStrong'; // Simplification for key
        const dasaDesc = getStr(lang, `gocharam.factors.${dasaEffectKey}`, { dasa: dasaLord, house: 1 }); // Improve placeholder usage

        // 2. TRANSIT ANALYSIS (40%)
        const transitData = calculatePlanetaryPositions(currentDate, 13.0827, 80.2707);
        const transitPlanets = transitData.planets;

        let transitScore = 0;
        const keyTransits: string[] = [];

        // Tara Bala First (Add to transit score or treat separately? User said "Moon gets 40% importance". Tara Bala IS Moon's daily quality.)
        const dailyMoonLong = transitPlanets.find(p => p.name === 'Moon')?.longitude || 0;
        const tara = calculateTaraBala(dailyMoonLong, moonLong, lang);
        // Tara score (-20 to +20). Normalize to 0-100 scale context? 
        // Let's stick to the user's explicit weights rules for planets.

        transitPlanets.forEach(p => {
            const rules = PLANET_TRANSIT_RULES[p.name];
            const weight = TRANSIT_WEIGHTS[p.name] || 0.05;
            if (!rules) return;

            const h = getHouse(rasiSign, p.signIndex);
            let pScore = 50;

            if (rules.good.includes(h)) {
                pScore = 100;
            } else if (rules.bad.includes(h)) {
                pScore = 0;
            } else {
                pScore = 50;
            }

            transitScore += pScore * weight;
        });

        // Add Tara Bala as a specific modifier to the Transits Score, or just display it.
        // Since Moon is 40% of transit score, let's refine Moon score using Tara.
        // If Tara is Bad, Moon score should be penalized even if House is Good.
        if (tara.score < 0) transitScore -= 10;
        if (tara.score > 0) transitScore += 10;

        // keyTransits.unshift(tara.keyFactor); // Removed as it is now in header

        // Add specific transit notes for FAST MOVING planets (User Request)
        const interestingPlanets = ['Moon', 'Sun', 'Mars', 'Mercury', 'Venus'];
        let addedCount = 0;

        for (const pname of interestingPlanets) {
            if (addedCount >= 6) break; // Increased limit
            const p = transitPlanets.find(tp => tp.name === pname);
            if (!p) continue;

            const h = getHouse(rasiSign, p.signIndex);

            // Localize Planet Name
            const pNameLocalized = lang === 'ta' ?
                (pname === 'Jupiter' ? 'குரு' : pname === 'Saturn' ? 'சனி' : pname === 'Mars' ? 'செவ்வாய்' : pname === 'Venus' ? 'சுக்ரன்' : pname === 'Mercury' ? 'புதன்' : pname === 'Sun' ? 'சூரியன்' : pname === 'Moon' ? 'சந்திரன்' : pname === 'Rahu' ? 'ராகு' : pname === 'Ketu' ? 'கேது' : pname)
                : pname;

            const rules = PLANET_TRANSIT_RULES[pname];
            if (!rules) continue;

            if (rules.good.includes(h)) {
                keyTransits.push(getStr(lang, "gocharam.factors.transitGood", { planet: pNameLocalized, house: h }));
                addedCount++;
            } else if (rules.bad.includes(h)) {
                keyTransits.push(getStr(lang, "gocharam.factors.transitBad", { planet: pNameLocalized, house: h }));
                addedCount++;
            } else {
                // Neutral
                keyTransits.push(getStr(lang, "gocharam.factors.transitNeutral", { planet: pNameLocalized, house: h }));
                addedCount++;
            }
        }

        // 3. COMBINED SCORE
        const finalScore = (dasaScore * 0.6) + (transitScore * 0.4);

        // 4. GENERATE OUTPUT
        const rating = Math.min(5, Math.max(1, Math.round(finalScore / 20)));
        let verdictKey = 'Average';
        if (finalScore >= 75) verdictKey = 'Excellent';
        else if (finalScore >= 60) verdictKey = 'Good';
        else if (finalScore <= 35) verdictKey = 'Danger';
        else if (finalScore <= 50) verdictKey = 'Caution';

        forecast.push({
            date: currentDate,
            dateString: currentDate.toDateString(),
            dasaLord,
            bhuktiLord,
            antaramLord,
            starRating: rating,
            verdict: getStr(lang, `gocharam.status.${verdictKey}`), // Reuse/ensure keys exist
            prediction: generateDailyPrediction(
                lang,
                dasaLord,
                bhuktiLord,
                antaramLord,
                dasaScore,
                transitScore,
                finalScore,
                keyTransits,
                tara, // { score, keyFactor, starName, taraLabel }
                {
                    career: Math.min(100, Math.round(finalScore * 0.9 + (dasaScore > 60 ? 10 : 0))),
                    finance: Math.min(100, Math.round(finalScore * 0.9 + (transitScore > 60 ? 10 : 0))),
                    health: Math.min(100, Math.round(finalScore * 0.8 + 20)),
                    rel: Math.min(100, Math.round(finalScore * 0.9))
                }
            ),
            keyFactors: keyTransits.slice(0, 6),
            extended: {
                dasa: {
                    period: dasaString,
                    score: Math.round(dasaScore),
                    effect: dasaDesc,
                    beneficLevel: Math.round(dasaScore),
                    dasa: dasaLord,
                    bhukti: bhuktiLord,
                    antaram: antaramLord,
                    sookshma: sookshmaLord,
                    prana: pranaLord
                },
                transit: {
                    score: Math.round(transitScore),
                    moonHouse: getHouse(rasiSign, transitPlanets.find(p => p.name === 'Moon')?.signIndex || 0),
                    keyTransits: keyTransits
                },
                totalScore: Math.round(finalScore),
                lifeAreas: {
                    // Simple logic: Career (Saturn/Sun/Jup/Mer), Finance (Jup/Ven/2nd/11th), Health (Sun/Mars/6th), Rel (Ven/Mars/7th)
                    // We map finalScore + planetary modifiers
                    career: Math.min(100, Math.round(finalScore * 0.9 + (dasaScore > 60 ? 10 : 0))),
                    finance: Math.min(100, Math.round(finalScore * 0.9 + (transitScore > 60 ? 10 : 0))),
                    health: Math.min(100, Math.round(finalScore * 0.8 + 20)),
                    relationships: Math.min(100, Math.round(finalScore * 0.9))
                },
                luckyTime: "06:00 - 07:30", // Placeholder or implement Hora
                color: "Red", // Placeholder or implement based on Star
                dos: ["Focus on goals", "Pray to ancestors"],
                donts: ["Avoid arguments", "No new loans"],
                tithi: getStr(lang, "gocharam.factors.tithiDefault", { n: "Shukla Paksha" }), // Placeholder
                yoga: getStr(lang, "gocharam.factors.yogaDefault", { n: "Siddha" }), // Placeholder
                unluckyTime: "10:30 - 12:00", // Placeholder (Rahu Kalam approx)
                nakshatra: tara.starName,
                tara: tara.taraLabel
            }
        });
    }

    return forecast;
};

export interface DailySnapshotResult {
    jupiter: GocharamResult;
    saturn: GocharamResult;
    sun: GocharamResult;
    mars: GocharamResult;
    mercury: GocharamResult;
    venus: GocharamResult;
    rahu: GocharamResult;
    ketu: GocharamResult;
    verdict: {
        title: string;
        message: string;
        type: 'success' | 'warning' | 'danger';
    };
    forecast15Days?: DayForecast[];
}

// Language type
type Language = 'en' | 'ta';



// Vedhai (Obstruction) Mapping
const VEDHAI_TABLE: Record<string, Record<number, number>> = {
    Sun: { 3: 9, 6: 12, 10: 4, 11: 5 },
    Moon: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
    Mars: { 3: 12, 6: 9, 11: 5 },
    Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 4, 11: 12 },
    Jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
    Venus: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 3, 12: 6 },
    Saturn: { 3: 12, 6: 9, 11: 5 },
    Rahu: { 3: 12, 6: 9, 11: 5 },
    Ketu: { 3: 12, 6: 9, 11: 5 }
};

// Check Vedhai
const isBlockedByVedhai = (
    planet: string,
    houseFromMoon: number,
    moonSignIndex: number,
    transitPlanets: { name: string, signIndex: number }[]
): boolean => {
    const vedhaiMap = VEDHAI_TABLE[planet];
    if (!vedhaiMap) return false;

    const obstructionHouse = vedhaiMap[houseFromMoon];
    if (!obstructionHouse) return false;

    const obstructionSign = (moonSignIndex + (obstructionHouse - 1)) % 12;
    const blocker = transitPlanets.find(p => p.signIndex === obstructionSign && p.name !== planet);

    return !!blocker;
};

// Helper to get localized string with replacement
const getStr = (lang: Language, key: string, params?: Record<string, string | number>) => {
    // Traverse object path e.g. "gocharam.descriptions.favorable"
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) {
        value = value?.[k as keyof typeof value];
        if (!value) return key; // Fallback to key if not found
    }

    if (typeof value === 'string' && params) {
        let str = value;
        for (const [p, v] of Object.entries(params)) {
            str = str.replace(`{${p}}`, String(v));
        }
        return str;
    }
    return String(value);
};

// Generic Transit Calculation
const calculatePlanetTransit = (
    planetName: string,
    rasiSign: number,
    currentSignIndex: number,
    transitPlanets: { name: string, signIndex: number }[],
    goodHouses: number[],
    badHouses: number[],
    lang: Language = 'en'
): GocharamResult => {
    const houseFromRasi = getHouse(rasiSign, currentSignIndex);

    let status: GocharamResult['status'] = 'Moderate';
    let description = '';
    let isFavorable = false;

    // Check Vedhai first
    const isBlocked = isBlockedByVedhai(planetName, houseFromRasi, rasiSign, transitPlanets);

    // Note: status is strictly typed, so we map English keys to types, but return localized description.
    // For status display in UI, we should probably return the localized string separately or map it in UI.
    // Let's modify logic: The 'status' field in GocharamResult is currently an English string literal type.
    // We should keep the internal type for logic but use localized string for display if needed.
    // However, the UI currently renders `p.status`. 
    // We will cheat slightly: The GocharamResult interface expects specific English strings. 
    // We will keep `status` as English for code logic, and rely on UI to localize specific status values 
    // OR change the interface to allow string.
    // Given the task, let's keep status as English keyword for styling logic (Green/Red color), 
    // but we might need a `statusText` field for display.
    // Or, we update the UI to map status to localized text.
    // Actually, simple approach: Return localized description. Status is for color/icon.
    // The previous code put localized text into 'status' sometimes? No, it put enum-like strings.
    // Let's stick to English status for logic/color, and use description for text.
    // Wait, the UI displays `p.status` directly: `{p.status}`.
    // So we DO need to localize status text.
    // To solve this without breaking types everywhere:
    // We will cast the localized string to 'any' or string, OR better: change the type definition.
    // But changing type definition breaks other files? DailySnapshot passes it.
    // Let's assume we can change the Status string content but keep Type keyword? No.
    // Let's use `statusText` or simpler: Just return the localized string for status if possible.
    // To be safe and clean: We will update GocharamResult to allow string.

    // Status Logic First (English)
    let rawStatus: GocharamResult['status'] = 'Moderate';

    if (goodHouses.includes(houseFromRasi)) {
        if (isBlocked) {
            rawStatus = 'Moderate';
            description = getStr(lang, "gocharam.descriptions.vedhai", { planet: planetName, house: houseFromRasi });
            isFavorable = false;
        } else {
            rawStatus = 'Good';
            description = getStr(lang, "gocharam.descriptions.favorable", { planet: planetName, house: houseFromRasi });
            isFavorable = true;
        }
    } else if (badHouses.includes(houseFromRasi)) {
        rawStatus = 'Difficult';
        description = getStr(lang, "gocharam.descriptions.unfavorable", { planet: planetName, house: houseFromRasi });
        isFavorable = false;
    } else {
        rawStatus = 'Moderate';
        description = getStr(lang, "gocharam.descriptions.neutral", { planet: planetName, house: houseFromRasi });
        isFavorable = true;
    }

    // Localize Status for UI?
    // The current UI uses `p.status` for both ClassName logic (e.g. `p.status === 'Good'`) AND display `{p.status}`.
    // This is a Conflict.
    // Resolution: We will attach a new property `statusLabel` to the result, and use that in UI for display text.
    // But since I can't easily change the interface used in DailySnapshot without editing it again (which I plan to do), 
    // I 'll add `statusLabel` to GocharamResult (via `any` or update interface).
    // Let's update interface in this file.

    return {
        planet: planetName,
        status: rawStatus,
        description,
        isFavorable,
        // @ts-ignore - Adding dynamic property for UI
        statusLabel: getStr(lang, `gocharam.status.${rawStatus}`)
    };
};

export const calculateJupiterTransit = (rasiSign: number, lagnaSign: number, currentSign: number, transitPlanets: { name: string, signIndex: number }[], lang: Language = 'en'): GocharamResult => {
    const result = calculatePlanetTransit('Jupiter', rasiSign, currentSign, transitPlanets, [2, 5, 7, 9, 11], [1, 3, 4, 6, 8, 10, 12], lang);

    const aspects: string[] = [];
    const rasiFromJupiter = getHouse(currentSign, rasiSign);
    if ([5, 7, 9].includes(rasiFromJupiter)) aspects.push(lang === 'ta' ? "ராசி" : "Rasi");

    const lagnaFromJupiter = getHouse(currentSign, lagnaSign);
    if ([5, 7, 9].includes(lagnaFromJupiter)) aspects.push(lang === 'ta' ? "லக்னம்" : "Lagna");

    if (aspects.length > 0) {
        result.description += " " + getStr(lang, "gocharam.descriptions.aspectProtection", { aspects: aspects.join(lang === 'ta' ? ' & ' : ' & ') });
        result.aspects = aspects;
        if (result.status === 'Difficult') result.status = 'Moderate';
        if (result.status === 'Moderate') result.status = 'Good';
        result.isFavorable = true;

        // precise mapping again for upgraded status
        // @ts-ignore
        result.statusLabel = getStr(lang, `gocharam.status.${result.status}`);
    }
    return result;
};

export const calculateSaturnTransit = (
    rasiSign: number,
    currentSign: number,
    transitPlanets: { name: string, signIndex: number }[],
    lang: Language = 'en',
    saturnLongitude?: number,
    birthMoonLongitude?: number
): GocharamResult => {
    const result = calculatePlanetTransit('Saturn', rasiSign, currentSign, transitPlanets, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], lang);

    const houseFromRasi = getHouse(rasiSign, currentSign);

    let rawStatus: GocharamResult['status'] = result.status;
    let specialMessage = "";

    // GURUJI RULE 2: JANMA NAKSHATRA SANI in Own House (Kumbha/Makara)
    // Check if Saturn is in Birth Star
    let isJanmaSani = false;
    let isSaturnDignified = false;

    if (saturnLongitude !== undefined && birthMoonLongitude !== undefined) {
        // Calculate Nakshatras
        const starSpan = 13.333333;
        const saturnStarIndex = Math.floor(saturnLongitude / starSpan);
        const birthStarIndex = Math.floor(birthMoonLongitude / starSpan);

        if (saturnStarIndex === birthStarIndex) {
            isJanmaSani = true;
            // Check Dignity (Capricorn=9, Aquarius=10)
            if (currentSign === 9 || currentSign === 10) {
                isSaturnDignified = true;
            }
        }
    }

    if (isJanmaSani && isSaturnDignified) {
        // OVERRIDE FOR DIGNIFIED JANMA SANI
        rawStatus = 'Good'; // Guruji says he won't destroy
        result.isFavorable = true;

        // Custom Description based on Guruji Advice
        const msg = lang === 'ta'
            ? "கும்ப/மகர ராசியில் சனி ஜென்ம நட்சத்திரத்தில் செல்கிறார். இவர் கெடுதல் செய்ய மாட்டார். ஆனால் அதிக வேலைப்பளுவை (Workload) கொடுப்பார். வேலை பாதுகாப்பானது."
            : "Saturn transits your birth star in his own house. He will not cause harm but will increase workload significantly. Job is safe.";

        result.description = msg;
        specialMessage = " (Janma Sani - Dignified)";

        // Append specific scoring context if possible or just rely on description
        // result.aspects could be used to show flags? Let's just use description.
    } else if ([12, 1, 2].includes(houseFromRasi)) {
        rawStatus = 'Sade Sati';
        result.description = houseFromRasi === 1
            ? getStr(lang, "gocharam.descriptions.sadeSatiJanma")
            : houseFromRasi === 12
                ? getStr(lang, "gocharam.descriptions.sadeSatiViraya")
                : getStr(lang, "gocharam.descriptions.sadeSatiPada");
        result.isFavorable = false;
    } else if (houseFromRasi === 8) {
        rawStatus = 'Ashtama';
        result.description = getStr(lang, "gocharam.descriptions.ashtama");
        result.isFavorable = false;
    } else if (houseFromRasi === 4) {
        rawStatus = 'Ardhastama';
        result.description = getStr(lang, "gocharam.descriptions.ardhastama");
        result.isFavorable = false;
    }

    result.status = rawStatus;
    // @ts-ignore
    result.statusLabel = (getStr(lang, `gocharam.status.${rawStatus.replace(' ', '')}`) || getStr(lang, `gocharam.status.${rawStatus}`)) + specialMessage;

    return result;
};





export const getDailySnapshot = (
    rasiSign: number,
    lagnaSign: number,
    currentDasaStatus: 'Good' | 'Bad' | 'Neutral',
    transits: { name: string, signIndex: number }[],
    birthDataForForecast?: any,
    lang: Language = 'en'
): DailySnapshotResult => {

    const getP = (name: string) => transits.find(p => p.name === name)?.signIndex || 0;

    // Extract Longitudes if available (assuming transits has 'longitude' property hidden by type)
    const saturnObj = transits.find(p => p.name === 'Saturn');
    // @ts-ignore
    const saturnLong = saturnObj?.longitude;

    // Extract Birth Moon Longitude
    const moon = birthDataForForecast?.planets?.find((p: any) => p.name === 'Moon');
    const birthMoonLong = moon?.longitude;

    const jupiter = calculateJupiterTransit(rasiSign, lagnaSign, getP('Jupiter'), transits, lang);
    const saturn = calculateSaturnTransit(rasiSign, getP('Saturn'), transits, lang, saturnLong, birthMoonLong);

    const sun = calculatePlanetTransit('Sun', rasiSign, getP('Sun'), transits, [3, 6, 10, 11], [1, 2, 4, 5, 7, 8, 9, 12], lang);
    const mars = calculatePlanetTransit('Mars', rasiSign, getP('Mars'), transits, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], lang);
    const mercury = calculatePlanetTransit('Mercury', rasiSign, getP('Mercury'), transits, [2, 4, 6, 8, 10, 11], [1, 3, 5, 7, 9, 12], lang);
    const venus = calculatePlanetTransit('Venus', rasiSign, getP('Venus'), transits, [1, 2, 3, 4, 5, 8, 9, 11, 12], [6, 7, 10], lang);

    const rahu = calculatePlanetTransit('Rahu', rasiSign, getP('Rahu'), transits, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], lang);
    const ketu = calculatePlanetTransit('Ketu', rasiSign, getP('Ketu'), transits, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], lang);

    let verdictTitle = "";
    let verdictMessage = "";
    let verdictType: DailySnapshotResult['verdict']['type'] = 'warning';

    const isGocharamBad = !jupiter.isFavorable || !saturn.isFavorable;

    if (currentDasaStatus === 'Good') {
        if (isGocharamBad) {
            verdictTitle = getStr(lang, "gocharam.verdicts.dontWorry");
            verdictMessage = getStr(lang, "gocharam.verdicts.dontWorryMsg");
            verdictType = 'success';
        } else {
            verdictTitle = getStr(lang, "gocharam.verdicts.golden");
            verdictMessage = getStr(lang, "gocharam.verdicts.goldenMsg");
            verdictType = 'success';
        }
    } else if (currentDasaStatus === 'Bad') {
        if (isGocharamBad) {
            verdictTitle = getStr(lang, "gocharam.verdicts.doubleTrouble");
            verdictMessage = getStr(lang, "gocharam.verdicts.doubleTroubleMsg");
            verdictType = 'danger';
        } else {
            verdictTitle = getStr(lang, "gocharam.verdicts.tempRelief");
            verdictMessage = getStr(lang, "gocharam.verdicts.tempReliefMsg");
            verdictType = 'warning';
        }
    } else {
        if (isGocharamBad) {
            verdictTitle = getStr(lang, "gocharam.verdicts.caution");
            verdictMessage = getStr(lang, "gocharam.verdicts.cautionMsg");
            verdictType = 'warning';
        } else {
            verdictTitle = getStr(lang, "gocharam.verdicts.goodProgress");
            verdictMessage = getStr(lang, "gocharam.verdicts.goodProgressMsg");
            verdictType = 'success';
        }
    }

    let forecast15Days: DayForecast[] = [];
    if (birthDataForForecast) {
        forecast15Days = generate15DayForecast(birthDataForForecast, lang);
    }

    return {
        jupiter, saturn, sun, mars, mercury, venus, rahu, ketu,
        verdict: { title: verdictTitle, message: verdictMessage, type: verdictType },
        forecast15Days
    };
};
