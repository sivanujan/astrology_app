/**
 * Comprehensive Dasa-Bhukti Scoring System
 * Based on Aditya Guruji's methodology with enhanced scoring (0-225 marks)
 */

import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';
import { getHouseLordStrength, getHousesRuledByPlanet } from './houseLordship';
import { SIGN_LORDS } from './constants';

// ============================================================================
// ENUMS & INTERFACES
// ============================================================================

export enum DasaQuality {
    EXCELLENT = 'Excellent',      // 150+ (மகா யோக தசை)
    VERY_GOOD = 'Very Good',       // 100-149 (யோக தசை)
    GOOD = 'Good',                 // 60-99 (சாதாரண நல்ல தசை)
    AVERAGE = 'Average',           // 30-59 (கலவையான பலன்கள்)
    BAD = 'Bad',                   // 0-29 (கடினமான தசை)
    VERY_BAD = 'Very Bad'          // -55 to -1 (மிகக் கடுமையான தசை)
}

export interface DasaScoreBreakdown {
    sthanaBala: number;           // House strength (0-100)
    lordshipScore: number;        // Lordship score (+40 to -30)
    subathuvamScore: number;      // Subathuvam score (+40 to -90)
    aspectScore: number;          // Aspect score (+20 to -15)
    nakshatraScore: number;       // Nakshatra score (+25 to -20)
    totalScore: number;           // Total (-55 to +225)
    quality: DasaQuality;         // Quality classification
    description: {
        en: string;
        ta: string;
    };
}

export interface BhuktiScore {
    dasaScore: number;
    bhuktiScore: number;
    combinedScore: number;        // (dasa × 60%) + (bhukti × 40%)
    quality: DasaQuality;
}

// ============================================================================
// QUALITY CLASSIFICATION
// ============================================================================

export function classifyDasaQuality(score: number): DasaQuality {
    if (score >= 150) return DasaQuality.EXCELLENT;
    if (score >= 100) return DasaQuality.VERY_GOOD;
    if (score >= 60) return DasaQuality.GOOD;
    if (score >= 30) return DasaQuality.AVERAGE;
    if (score >= 0) return DasaQuality.BAD;
    return DasaQuality.VERY_BAD;
}

export function getQualityDescription(quality: DasaQuality): { en: string; ta: string } {
    const descriptions = {
        [DasaQuality.EXCELLENT]: {
            en: 'Maha Yoga Dasa - Life-changing growth, all auspicious events',
            ta: 'மகா யோக தசை - வாழ்வில் மிகப்பெரிய வளர்ச்சி, அனைத்து சுபகாரியங்கள்'
        },
        [DasaQuality.VERY_GOOD]: {
            en: 'Yoga Dasa - Good progress, most auspicious events occur',
            ta: 'யோக தசை - நல்ல முன்னேற்றங்கள், பெரும்பாலான சுபகாரியங்கள்'
        },
        [DasaQuality.GOOD]: {
            en: 'Good Dasa - Some good events, no major problems',
            ta: 'சாதாரண நல்ல தசை - சில நல்ல விஷயங்கள், பெரிய சிக்கல்கள் இல்லை'
        },
        [DasaQuality.AVERAGE]: {
            en: 'Mixed results - Good and bad equally, effort needed',
            ta: 'கலவையான பலன்கள் - நல்லதும் கெட்டதும் சமமாக, பிரயத்தனம் தேவை'
        },
        [DasaQuality.BAD]: {
            en: 'Difficult Dasa - Many obstacles and problems, caution needed',
            ta: 'கடினமான தசை - பல தடைகள் மற்றும் சிக்கல்கள், எச்சரிக்கை தேவை'
        },
        [DasaQuality.VERY_BAD]: {
            en: 'Very Difficult Dasa - Major losses possible, full caution',
            ta: 'மிகக் கடுமையான தசை - பெரிய நஷ்டங்கள் சாத்தியம், முழு எச்சரிக்கை'
        }
    };

    return descriptions[quality];
}

// ============================================================================
// COMPONENT 1: STHANA BALA (HOUSE STRENGTH) - 0 to 100
// ============================================================================

export function calculateSthanaBala(planet: any, chart: any): number {
    let score = 50; // Base score

    const planetHouse = planet.house;
    if (!planetHouse) return score;

    // Kendra houses (1,4,7,10) - Strong
    if ([1, 4, 7, 10].includes(planetHouse)) {
        score += 20;
    }

    // Trikona houses (1,5,9) - Very Strong
    if ([1, 5, 9].includes(planetHouse)) {
        score += 25;
    }

    // Dusthana houses (6,8,12) - Weak
    if ([6, 8, 12].includes(planetHouse)) {
        score -= 30;
    }

    // Own sign strength
    const planetSign = Math.floor(planet.longitude / 30);
    const signLords = SIGN_LORDS[planetSign];
    if (signLords && signLords.includes(planet.name)) {
        score += 15;
    }

    // Exaltation
    const exaltationSigns: Record<string, number> = {
        'Sun': 0,      // Aries
        'Moon': 1,     // Taurus
        'Mars': 9,     // Capricorn
        'Mercury': 5,  // Virgo
        'Jupiter': 3,  // Cancer
        'Venus': 11,   // Pisces
        'Saturn': 6    // Libra
    };

    if (exaltationSigns[planet.name] === planetSign) {
        score += 20;
    }

    // Debilitation
    const debilitationSigns: Record<string, number> = {
        'Sun': 6,      // Libra
        'Moon': 7,     // Scorpio
        'Mars': 3,     // Cancer
        'Mercury': 11, // Pisces
        'Jupiter': 9,  // Capricorn
        'Venus': 5,    // Virgo
        'Saturn': 0    // Aries
    };

    if (debilitationSigns[planet.name] === planetSign) {
        score -= 50;
    }

    return Math.min(100, Math.max(0, score));
}

// ============================================================================
// COMPONENT 2: LORDSHIP SCORE - (+40 to -30)
// ============================================================================

export function calculateLordshipScore(planetName: string, chart: any): number {
    const housesRuled = getHousesRuledByPlanet(planetName, chart);
    let score = 0;

    for (const house of housesRuled) {
        // Good houses (1,5,9) - Trikona lords
        if ([1, 5, 9].includes(house)) {
            score += 20; // +40 if ruling 2 trikonas
        }
        // Kendra houses (1,4,7,10)
        else if ([4, 7, 10].includes(house)) {
            score += 15; // +30 if ruling 2 kendras
        }
        // Dusthana houses (6,8,12)
        else if ([6, 8, 12].includes(house)) {
            score -= 15; // -30 if ruling 2 dusthanas
        }
        // Upachaya houses (3,6,10,11)
        else if ([3, 11].includes(house)) {
            score += 10;
        }
    }

    return Math.min(40, Math.max(-30, score));
}

// ============================================================================
// COMPONENT 3: SUBATHUVAM SCORE - (+40 to -90)
// ============================================================================

export function calculateSubathuvamScore(planetName: string, planets: any[]): number {
    const agSubathuvam = calculateAdityaGurujiSubathuvam(planets);
    const planetScore = agSubathuvam[planetName];

    if (!planetScore) return 0;

    const netScore = planetScore.subathuvam - planetScore.pavathuvam;

    // Scale from -100 to +100 range to -90 to +40
    // High subathuvam = +40, High pavathuvam = -90
    if (netScore >= 50) {
        return 40; // Excellent subathuvam
    } else if (netScore >= 20) {
        return Math.round((netScore - 20) / 30 * 20 + 20); // 20 to 40
    } else if (netScore >= 0) {
        return Math.round(netScore / 20 * 20); // 0 to 20
    } else if (netScore >= -20) {
        return Math.round(netScore / 20 * 30); // 0 to -30
    } else if (netScore >= -50) {
        return Math.round((netScore + 20) / 30 * 30 - 30); // -30 to -60
    } else {
        return -90; // Severe pavathuvam
    }
}

// ============================================================================
// COMPONENT 4: ASPECT SCORE - (+20 to -15)
// ============================================================================

export function calculateAspectScore(planet: any, allPlanets: any[]): number {
    let score = 0;

    // Get aspects to this planet
    for (const sourcePlanet of allPlanets) {
        if (sourcePlanet.name === planet.name) continue;

        const isAspecting = checkAspect(sourcePlanet, planet);
        if (!isAspecting) continue;

        // Jupiter aspect = +20
        if (sourcePlanet.name === 'Jupiter') {
            score += 20;
        }
        // Venus aspect = +10
        else if (sourcePlanet.name === 'Venus') {
            score += 10;
        }
        // Saturn aspect = -15
        else if (sourcePlanet.name === 'Saturn') {
            score -= 15;
        }
        // Mars aspect = -10
        else if (sourcePlanet.name === 'Mars') {
            score -= 10;
        }
        // Rahu/Ketu aspect = -8
        else if (['Rahu', 'Ketu'].includes(sourcePlanet.name)) {
            score -= 8;
        }
    }

    return Math.min(20, Math.max(-15, score));
}

function checkAspect(source: any, target: any): boolean {
    const signDiff = Math.abs((target.signIndex - source.signIndex + 12) % 12);

    // All planets aspect 7th sign
    if (signDiff === 6) return true;

    // Jupiter aspects 5th, 7th, 9th
    if (source.name === 'Jupiter' && [4, 6, 8].includes(signDiff)) return true;

    // Mars aspects 4th, 7th, 8th
    if (source.name === 'Mars' && [3, 6, 7].includes(signDiff)) return true;

    // Saturn aspects 3rd, 7th, 10th
    if (source.name === 'Saturn' && [2, 6, 9].includes(signDiff)) return true;

    return false;
}

// ============================================================================
// COMPONENT 5: NAKSHATRA SCORE - (+25 to -20)
// ============================================================================

export function calculateNakshatraScore(planet: any, chart: any): number {
    // Get nakshatra lord from planet's degree
    const nakshatra = getNakshatra(planet.longitude);
    const nakshatraLord = nakshatra.lord;

    // Get strength of nakshatra lord
    const lordStrength = getHouseLordStrength(1, chart); // Simplified - should get actual lord planet

    // Convert 0-100 strength to -20 to +25
    if (lordStrength >= 80) return 25;
    if (lordStrength >= 60) return 15;
    if (lordStrength >= 40) return 5;
    if (lordStrength >= 20) return -5;
    return -20;
}

function getNakshatra(longitude: number): { name: string; lord: string } {
    const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const nakshatraIndex = Math.floor(longitude / 13.333333);
    const lordIndex = nakshatraIndex % 9;

    return {
        name: `Nakshatra ${nakshatraIndex + 1}`,
        lord: nakshatraLords[lordIndex]
    };
}

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateDasaScore(planetName: string, chart: any): DasaScoreBreakdown {
    const planet = chart.planets.find((p: any) => p.name === planetName);
    if (!planet) {
        return {
            sthanaBala: 0,
            lordshipScore: 0,
            subathuvamScore: 0,
            aspectScore: 0,
            nakshatraScore: 0,
            totalScore: 0,
            quality: DasaQuality.VERY_BAD,
            description: getQualityDescription(DasaQuality.VERY_BAD)
        };
    }

    const sthanaBala = calculateSthanaBala(planet, chart);
    const lordshipScore = calculateLordshipScore(planetName, chart);
    const subathuvamScore = calculateSubathuvamScore(planetName, chart.planets);
    const aspectScore = calculateAspectScore(planet, chart.planets);
    const nakshatraScore = calculateNakshatraScore(planet, chart);

    const totalScore = sthanaBala + lordshipScore + subathuvamScore + aspectScore + nakshatraScore;
    const quality = classifyDasaQuality(totalScore);

    return {
        sthanaBala,
        lordshipScore,
        subathuvamScore,
        aspectScore,
        nakshatraScore,
        totalScore,
        quality,
        description: getQualityDescription(quality)
    };
}

// ============================================================================
// BHUKTI SCORING
// ============================================================================

export function calculateBhuktiScore(
    dasaPlanet: string,
    bhuktiPlanet: string,
    chart: any
): BhuktiScore {
    const dasaScore = calculateDasaScore(dasaPlanet, chart).totalScore;
    const bhuktiScore = calculateDasaScore(bhuktiPlanet, chart).totalScore;

    // Formula: (Dasa × 60%) + (Bhukti × 40%)
    const combinedScore = (dasaScore * 0.6) + (bhuktiScore * 0.4);
    const quality = classifyDasaQuality(combinedScore);

    return {
        dasaScore,
        bhuktiScore,
        combinedScore,
        quality
    };
}
