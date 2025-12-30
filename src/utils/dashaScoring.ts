/**
 * Comprehensive Dasa-Bhukti Scoring System
 * Based on Aditya Guruji's methodology with enhanced scoring (0-225 marks)
 */

import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';
import { getHouseLordStrength, getHousesRuledByPlanet } from './houseLordship';
import { SIGN_LORDS, PLANET_RELATIONSHIPS, MOOLA_TRIKONA, EXALTATION_POINTS, DEBILITATION_POINTS } from './constants';

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
    sthanaBalaDetails: string;    // Explanation for Sthana Bala
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
    if (score >= 75) return DasaQuality.EXCELLENT;
    if (score >= 60) return DasaQuality.VERY_GOOD;
    if (score >= 45) return DasaQuality.GOOD;
    if (score >= 30) return DasaQuality.AVERAGE;
    if (score >= 15) return DasaQuality.BAD;
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

function getSignStrength(planet: any, planetSignIndex: number, chart?: any): { score: number, type: string } {
    const name = planet.name;
    const degree = planet.longitude % 30;

    // 1. Exaltation (Ucha) - +20
    const exaltation = EXALTATION_POINTS[name as keyof typeof EXALTATION_POINTS];
    if (exaltation && exaltation.sign === planetSignIndex) {
        return { score: 20, type: 'Exalted (உச்சம்)' };
    }

    // 2. Debilitation (Neecha) & Neecha Bhanga
    const debilitation = DEBILITATION_POINTS[name as keyof typeof DEBILITATION_POINTS];
    if (debilitation && debilitation.sign === planetSignIndex) {
        // Neecha Bhanga Check
        // 1. Retrograde
        if (planet.isRetro) {
            return { score: 30, type: 'Neecha Bhanga (நீச பங்கம்) - Retrograde' };
        }

        // 2. Lord of Debilitated Sign in Kendra
        if (chart && chart.planets && chart.ascendant) {
            const signOwner = SIGN_LORDS[planetSignIndex];
            const ownerPlanet = chart.planets.find((p: any) => p.name === signOwner);
            if (ownerPlanet) {
                const ownerSign = ownerPlanet.signIndex ?? Math.floor(ownerPlanet.longitude / 30);
                const lagnaSign = chart.ascendant.signIndex ?? 0;
                const ownerHouse = ((ownerSign - lagnaSign + 12) % 12) + 1;

                if ([1, 4, 7, 10].includes(ownerHouse)) {
                    return { score: 30, type: `Neecha Bhanga (Sign Lord ${signOwner} in Kendra)` };
                }
            }
        }

        return { score: -50, type: 'Debilitated (நீசம்)' };
    }

    // 3. Moola Trikona - +18
    const moolaTrikona = MOOLA_TRIKONA[name as keyof typeof MOOLA_TRIKONA];
    if (moolaTrikona && moolaTrikona.sign === planetSignIndex) {
        if (degree >= moolaTrikona.startDegree && degree <= moolaTrikona.endDegree) {
            return { score: 18, type: 'Moola Trikona (மூலத்திரிகோணம்)' };
        }
    }

    // 4. Own Sign (Swakshetra) - +15
    const signOwner = SIGN_LORDS[planetSignIndex];
    if (signOwner === name) {
        return { score: 15, type: 'Own Sign (ஆட்சி)' };
    }

    // 5. Friend/Enemy/Neutral
    const planetRels = PLANET_RELATIONSHIPS[name as keyof typeof PLANET_RELATIONSHIPS];
    if (planetRels) {
        if (planetRels.friends.includes(signOwner)) {
            return { score: 10, type: 'Friend Sign (நட்பு)' };
        } else if (planetRels.enemies.includes(signOwner)) {
            return { score: -15, type: 'Enemy Sign (பகை)' };
        }
    }

    return { score: 0, type: 'Neutral Sign (சமம்)' }; // Neutral
}

export function calculateSthanaBala(planet: any, chart: any): { score: number, details: string } {
    let score = 50; // Base score
    const details = [];

    // Calculate house position from planet sign and ascendant sign
    const planetSign = planet.signIndex ?? Math.floor(planet.longitude / 30);
    const lagnaSign = chart.ascendant?.signIndex ?? 0;
    const planetHouse = ((planetSign - lagnaSign + 12) % 12) + 1;

    // Kendra houses (1,4,7,10) - Strong
    if ([1, 4, 7, 10].includes(planetHouse)) {
        score += 20;
        details.push('Kendra (+20)');
    }
    // Trikona houses (1,5,9) - Very Strong
    else if ([5, 9].includes(planetHouse)) { // 1 is covered in Kendra
        score += 25;
        details.push('Trikona (+25)');
    }
    // Dusthana houses (6,8,12) - Special Guruji Logic
    else if ([6, 8, 12].includes(planetHouse)) {
        // Initial Score Low
        let dusthanaScore = -30;
        details.push('Dusthana (Initial: -30)');

        // APPLY GURUJI SUBATHUVAM FILTER
        // Check if planet has Subathuvam (Beneficence)
        const subathuvamData = calculateAdityaGurujiSubathuvam(chart.planets || []);
        const pSubathuvam = subathuvamData[planet.name];

        if (pSubathuvam && pSubathuvam.totalScore > 0) {
            const subScore = pSubathuvam.totalScore;

            if (subScore >= 60) {
                // High Subathuvam: Transforms Dusthana to "Hidden Strength"
                dusthanaScore = 20; // Flip to positive
                details.push(`Guruji Rule: High Subathuvam in Dusthana (+20)`);
                details.push(`(Benefic Influence: ${Math.round(subScore)}%)`);
            } else if (subScore >= 40) {
                // Medium Subathuvam: Neutralizes bad effect
                dusthanaScore = 0;
                details.push(`Guruji Rule: Moderate Subathuvam (Neutralized)`);
            } else {
                // Low Subathuvam: Remains Bad
                details.push(`Low Subathuvam (${Math.round(subScore)}%)`);
            }
        } else {
            details.push('No Subathuvam Protection');
        }

        score += dusthanaScore;
    }

    // Sign Strength (Ucha, Neecha, Moola Trikona, Own, Friend, Enemy)
    const signStrength = getSignStrength(planet, planetSign, chart);
    score += signStrength.score;
    details.push(`${signStrength.type} (${signStrength.score > 0 ? '+' : ''}${signStrength.score})`);

    // Check Neecha Bhanga explicit override if score is Debilitated (-50)
    // Only if checkNeechaBhanga logic is external, but here we handled simple retro case. 
    // For full Neecha Bhanga, we need more complex logic. 
    // Assuming simple check embedded in getSignStrength is sufficient for now based on available data.

    return {
        score: Math.min(100, Math.max(0, score)),
        details: details.join(', ')
    };
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

    // Use totalScore (0-100 range)
    // Convert 0-100 to -90 to +40 scale
    const total = planetScore.totalScore;

    if (total >= 80) {
        return 40; // Excellent
    } else if (total >= 60) {
        return Math.round((total - 60) / 20 * 20 + 20); // 20 to 40
    } else if (total >= 40) {
        return Math.round((total - 40) / 20 * 20); // 0 to 20
    } else if (total >= 20) {
        return Math.round((40 - total) / 20 * -30); // 0 to -30
    } else if (total >= 10) {
        return Math.round((20 - total) / 10 * -30 - 30); // -30 to -60
    } else {
        return -90; // Very bad
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
            sthanaBalaDetails: 'N/A',
            lordshipScore: 0,
            subathuvamScore: 0,
            aspectScore: 0,
            nakshatraScore: 0,
            totalScore: 0,
            quality: DasaQuality.VERY_BAD,
            description: getQualityDescription(DasaQuality.VERY_BAD)
        };
    }

    const sthanaBalaObj = calculateSthanaBala(planet, chart);
    const lordshipScore = calculateLordshipScore(planetName, chart);
    const subathuvamScore = calculateSubathuvamScore(planetName, chart.planets);
    const aspectScore = calculateAspectScore(planet, chart.planets);
    const nakshatraScore = calculateNakshatraScore(planet, chart);

    const totalRawScore = sthanaBalaObj.score + lordshipScore + subathuvamScore + aspectScore + nakshatraScore;

    // Normalize to 0-100 scale
    // Original Range: -55 to 225
    // Target Range: 0 to 100
    // Simple scaling: (Score / 2.25) approx. 
    // Scaling Factor: 100 / 225 = 0.444
    const SCALING_FACTOR = 0.444;

    const normalize = (val: number) => Math.round(val * SCALING_FACTOR * 10) / 10;

    const totalScore = Math.min(100, Math.max(0, normalize(totalRawScore + 55))); // Shift positive to avoid negatives? No, user wants simple conversion.

    // Let's use simple scaling but handle min/max mapping better
    // Map -55..225 -> 0..100
    // Total Range = 280
    // ((Score + 55) / 280) * 100

    const finalScore = Math.min(100, Math.max(0, Math.round(((totalRawScore + 55) / 280) * 100)));

    const quality = classifyDasaQuality(finalScore);

    return {
        sthanaBala: normalize(sthanaBalaObj.score),
        sthanaBalaDetails: sthanaBalaObj.details,
        lordshipScore: normalize(lordshipScore),
        subathuvamScore: normalize(subathuvamScore),
        aspectScore: normalize(aspectScore),
        nakshatraScore: normalize(nakshatraScore),
        totalScore: finalScore,
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
