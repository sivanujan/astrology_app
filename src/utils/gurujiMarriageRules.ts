/**
 * Authentic Aditya Guruji Marriage Matching Rules
 * Complete implementation with exact methodology
 * 9 Rules, 130% weighted system normalized to 100
 */

import { calculateSubathuvamPavathuvam, calculateHouseSubathuvamPavathuvam } from './subathuvam';
import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';
import { calculateVimshottariDasha, getCurrentDasha, getDashaAtDate } from './dashaCalculation';
import { ZODIAC_SIGNS } from './constants';
import {
    getHousesRuledByPlanet,
    getHouseLord,
    getPlanet,
    getHouseLordStrength,
    hasAspect,
    getDegreeSeparation,
    getHouseFromPoint,
    getElementalCompatibility,
    hasChandraAdhiYoga as checkChandraAdhiYoga
} from './houseLordship';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ComprehensiveMatchResult {
    overallScore: number;
    verdict: string;
    autoReject: boolean;
    autoRejectReasons: string[];

    // Rule results
    dasaSync: RuleResult;
    doshaBalance: RuleResult;
    house2nd: RuleResult;
    house5th: RuleResult;
    house7th: RuleResult;
    house8th: RuleResult;
    venus: RuleResult;
    jupiterVenus: RuleResult;
    lagna: RuleResult;

    strengths: string[];
    weaknesses: string[];
    recommendations: string[];

    // Optional charts for display
    boyChart?: any;
    girlChart?: any;
}

interface RuleResult {
    score: number;
    weight: number;
    details: string[];
    warnings?: string[];
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export function analyzeComprehensiveMarriageMatch(
    boyChart: any,
    girlChart: any,
    marriageDate: Date = new Date()
): ComprehensiveMatchResult {

    const result: ComprehensiveMatchResult = {
        overallScore: 0,
        verdict: '',
        autoReject: false,
        autoRejectReasons: [],
        dasaSync: { score: 0, weight: 35, details: [] },
        doshaBalance: { score: 0, weight: 15, details: [] },
        house2nd: { score: 0, weight: 10, details: [] },
        house5th: { score: 0, weight: 15, details: [] },
        house7th: { score: 0, weight: 20, details: [] },
        house8th: { score: 0, weight: 10, details: [] },
        venus: { score: 0, weight: 10, details: [] },
        jupiterVenus: { score: 0, weight: 8, details: [] },
        lagna: { score: 0, weight: 7, details: [] },
        strengths: [],
        weaknesses: [],
        recommendations: []
    };

    // Rule 1: Dasa-Bhukti Synchronization (35%)
    result.dasaSync = analyzeDasaSynchronization(boyChart, girlChart, marriageDate);
    if (result.dasaSync.warnings) {
        result.autoRejectReasons.push(...result.dasaSync.warnings);
    }

    // Rule 2: Dosha Balance (15%)
    result.doshaBalance = calculateMilliliterDoshaBalance(boyChart, girlChart);

    // Rule 3: 2nd House Analysis (10%)
    result.house2nd = analyze2ndHouse(boyChart, girlChart);

    // Rule 4: 5th House Analysis (15%)
    result.house5th = analyze5thHouse(boyChart, girlChart);

    // Rule 5: 7th House Analysis (20%)
    result.house7th = analyze7thHouse(boyChart, girlChart);

    // Rule 6: 8th House / Foreign (10%)
    result.house8th = analyze8thHouseForeign(boyChart, girlChart);

    // Rule 7: Venus Analysis (10%)
    result.venus = analyzeVenus(boyChart, girlChart);

    // Rule 8: Jupiter-Venus Conjunction (8%)
    result.jupiterVenus = analyzeJupiterVenusConjunction(boyChart, girlChart);

    // Rule 9: Lagna Compatibility (7%)
    result.lagna = analyzeLagnaCompatibility(boyChart, girlChart);

    // Calculate overall score (130% total, normalize to 100)
    const weightedScores = [
        result.dasaSync.score * 0.35,
        result.doshaBalance.score * 0.15,
        result.house2nd.score * 0.10,
        result.house5th.score * 0.15,
        result.house7th.score * 0.20,
        result.house8th.score * 0.10,
        result.venus.score * 0.10,
        result.jupiterVenus.score * 0.08,
        result.lagna.score * 0.07
    ];

    const totalWeightedScore = weightedScores.reduce((a, b) => a + b, 0);
    result.overallScore = totalWeightedScore / 1.30; // Normalize from 130% to 100%

    // Auto-reject check
    result.autoReject = result.autoRejectReasons.length > 0;

    // Verdict
    if (result.autoReject) {
        result.verdict = 'Auto Reject';
    } else if (result.overallScore >= 90) {
        result.verdict = 'Excellent';
    } else if (result.overallScore >= 80) {
        result.verdict = 'Very Good';
    } else if (result.overallScore >= 70) {
        result.verdict = 'Good';
    } else if (result.overallScore >= 60) {
        result.verdict = 'Average';
    } else if (result.overallScore >= 50) {
        result.verdict = 'Risky';
    } else {
        result.verdict = 'Poor';
    }

    // Generate strengths and weaknesses
    generateStrengthsWeaknesses(result);

    // Generate recommendations
    generateRecommendations(result);

    return result;
}

// ============================================================================
// RULE 1: DASA-BHUKTI SYNCHRONIZATION (35%)
// ============================================================================

function analyzeDasaSynchronization(
    boyChart: any,
    girlChart: any,
    marriageDate: Date
): RuleResult {
    const result: RuleResult = {
        score: 100,
        weight: 35,
        details: [],
        warnings: []
    };

    try {
        const boyMoon = boyChart.planets?.find((p: any) => p.name === 'Moon');
        const girlMoon = girlChart.planets?.find((p: any) => p.name === 'Moon');

        if (!boyMoon || !girlMoon) {
            result.details.push('Unable to calculate Dasha - Moon data missing');
            result.score = 50;
            return result;
        }

        // Get current Dasha for both
        const boyDasha = getCurrentDasha(boyMoon.longitude, boyChart.birthDate, marriageDate);
        const girlDasha = getCurrentDasha(girlMoon.longitude, girlChart.birthDate, marriageDate);

        result.details.push(`Boy: ${boyDasha.maha.planet} Maha Dasha, ${boyDasha.bhukti?.planet || 'N/A'} Bhukti`);
        result.details.push(`Girl: ${girlDasha.maha.planet} Maha Dasha, ${girlDasha.bhukti?.planet || 'N/A'} Bhukti`);

        // Check 6-8 relationship between Dasha lords
        const relationship = getDashaLordRelationship(boyDasha.maha.planet, girlDasha.maha.planet, boyChart, girlChart);

        if (relationship === '6-8') {
            result.warnings!.push('Current Dasa lords in 6-8 relationship - High conflict risk / தற்போதைய தசா அதிபதிகள் 6-8 உறவில் - அதிக மோதல் ஆபத்து');
            result.score = 0;
            return result;
        }

        // Check if girl is in 6/8/12 house lord Dasha
        const girlBadDasha = checkGirlBadDasha(girlDasha.maha.planet, girlChart);
        if (girlBadDasha) {
            const tamilMessages: Record<string, string> = {
                '6th': '6வது இல்ல அதிபதி தசை - எதிரி மற்றும் நோய் காலம்',
                '8th': '8வது இல்ல அதிபதி தசை - தடைகள் மற்றும் ஆரோக்கிய சிக்கல்கள்',
                '12th': '12வது இல்ல அதிபதி தசை - செலவு மற்றும் இழப்பு காலம்'
            };
            const englishMsg = `Girl in ${girlBadDasha} house lord Dasha - Obstacles period`;
            const tamilMsg = tamilMessages[girlBadDasha] || englishMsg;
            result.warnings!.push(`${englishMsg} / ${tamilMsg}`);
            result.score = 20;
            return result;
        }

        // Analyze next 10 years
        let conflictYears = 0;
        for (let year = 1; year <= 10; year++) {
            const futureDate = new Date(marriageDate);
            futureDate.setFullYear(futureDate.getFullYear() + year);

            const boyFuture = getCurrentDasha(boyMoon.longitude, boyChart.birthDate, futureDate);
            const girlFuture = getCurrentDasha(girlMoon.longitude, girlChart.birthDate, futureDate);

            const futureRel = getDashaLordRelationship(boyFuture.maha.planet, girlFuture.maha.planet, boyChart, girlChart);

            if (futureRel === '6-8' || checkGirlBadDasha(girlFuture.maha.planet, girlChart)) {
                conflictYears++;
            }
        }

        if (conflictYears >= 3) {
            result.warnings!.push(`${conflictYears} critical conflict years in next 10 years`);
            result.score = 30;
        } else if (conflictYears === 2) {
            result.details.push(`⚠️ ${conflictYears} conflict years detected in next decade`);
            result.score = 70;
        } else if (conflictYears === 1) {
            result.details.push(`Minor: 1 challenging year in next decade`);
            result.score = 85;
        } else {
            result.details.push('✓ No major conflict years in next 10 years');
        }

    } catch (error) {
        result.details.push('Error in Dasha calculation');
        result.score = 50;
    }

    return result;
}

function getDashaLordRelationship(planet1: string, planet2: string, chart1: any, chart2: any): string {
    // Get house positions of these planets
    const p1 = chart1.planets?.find((p: any) => p.name === planet1);
    const p2 = chart2.planets?.find((p: any) => p.name === planet2);

    if (!p1 || !p2) return 'unknown';

    const house1 = p1.house || 1;
    const house2 = p2.house || 1;

    const diff = Math.abs(house1 - house2);

    if (diff === 5 || diff === 7) return '6-8';
    if (diff === 1 || diff === 11) return '2-12';
    if (diff === 4 || diff === 8) return '5-9';
    if (diff === 6) return '7-7';

    return 'other';
}

function checkGirlBadDasha(dashaLord: string, girlChart: any): string | null {
    const planet = girlChart.planets?.find((p: any) => p.name === dashaLord);
    if (!planet) return null;

    // Check which house this planet rules
    const ruledHouses = getHousesRuledByPlanet(dashaLord, girlChart);

    let badHouse: string | null = null;
    if (ruledHouses.includes(6)) badHouse = '6th';
    else if (ruledHouses.includes(8)) badHouse = '8th';
    else if (ruledHouses.includes(12)) badHouse = '12th';
    // If planet rules a bad house, check its Subathuvam
    if (badHouse) {
        try {
            // Calculate Subathuvam for this planet
            const subathuvamResults = calculateAdityaGurujiSubathuvam(girlChart.planets || []);
            const planetSubathuvam = subathuvamResults[dashaLord];

            if (planetSubathuvam) {
                const subScore = planetSubathuvam.totalScore || 0;

                // If Subathuvam is high (>=70), the planet is strong enough to overcome bad house rulership
                if (subScore >= 70) {
                    console.log(`${dashaLord} rules ${badHouse} house but has high Subathuvam (${subScore}) - OK`);
                    return null; // Don't reject - high Subathuvam cancels negative
                }

                console.log(`${dashaLord} rules ${badHouse} house with low Subathuvam (${subScore}) - Bad Dasha`);
            }
        } catch (error) {
            console.error('Error calculating Subathuvam for Dasha check:', error);
            // If we can't calculate Subathuvam, use the traditional rule (reject)
        }
    }

    return badHouse;
}




// ============================================================================
// RULE 2: DOSHA BALANCE - MILLILITER CALCULATION (15%)
// ============================================================================

function calculateMilliliterDoshaBalance(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 100,
        weight: 15,
        details: []
    };

    const boyDosha = calculateDoshaMilliliters(boyChart);
    const girlDosha = calculateDoshaMilliliters(girlChart);

    result.details.push(`Boy dosha: ${boyDosha}`);
    result.details.push(`Girl dosha: ${girlDosha}`);

    const difference = Math.abs(boyDosha - girlDosha);

    if (difference <= 10) {
        result.score = 100;
        result.details.push('✓ Excellent balance: Similar dosha levels');
    } else if (difference <= 25) {
        result.score = 85;
        result.details.push(`Minor difference: ${difference} gap - Manageable`);
    } else if (difference <= 40) {
        result.score = 60;
        result.details.push(`⚠️ Moderate imbalance: ${difference} difference`);
    } else if (difference <= 60) {
        result.score = 30;
        result.details.push(`⚠️ Poor match: ${difference} severe mismatch`);
    } else {
        result.score = 20;
        result.details.push(`❌ Very severe mismatch: ${difference} - Not compatible`);
    }

    return result;
}

function calculateDoshaMilliliters(chart: any): number {
    let dosha = 0;
    const planets = chart.planets || [];
    const lagna = chart.ascendant?.sign || 0;
    const moon = planets.find((p: any) => p.name === 'Moon');
    const venus = planets.find((p: any) => p.name === 'Venus');

    // Malefics list
    const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

    // Check malefics in critical positions
    for (const planet of planets) {
        if (!malefics.includes(planet.name)) continue;

        const planetHouse = planet.house || 1;

        // From Lagna
        if (planetHouse === 7) dosha += 30; // 7th from Lagna
        if (planetHouse === 8) dosha += 25; // 8th from Lagna
        if (planetHouse === 1) dosha += 20; // 1st (Lagna itself)
        if (planetHouse === 12) dosha += 15; // 12th from Lagna

        // From Moon
        if (moon) {
            const moonHouse = moon.house || 1;
            const moonDiff = (planetHouse - moonHouse + 12) % 12;
            if (moonDiff === 6) dosha += 25; // 7th from Moon
            if (moonDiff === 7) dosha += 20; // 8th from Moon
        }

        // Conjunct Venus
        if (venus && Math.abs(planet.longitude - venus.longitude) < 10) {
            dosha += 35;
        }
    }

    // Reductions - Accurate Jupiter aspect checking
    const jupiter = getPlanet(chart, 'Jupiter');
    if (jupiter) {
        const jupiterHouse = jupiter.house || 1;
        let jupiterReduction = 0;

        // Check if Jupiter aspects critical malefic positions
        for (const planet of planets) {
            if (!malefics.includes(planet.name)) continue;

            const planetHouse = planet.house || 1;

            // Jupiter aspects 5th, 7th, 9th from its position
            if (hasAspect('Jupiter', jupiterHouse, planetHouse)) {
                jupiterReduction += 10; // Reduce 10ml per aspected malefic
            }
        }

        dosha = Math.max(0, dosha - Math.min(jupiterReduction, 30)); // Max 30ml reduction
    }

    // Benefics in Kendra - More accurate
    const benefics = ['Jupiter', 'Venus', 'Mercury'];
    let kendraReduction = 0;

    for (const planet of planets) {
        if (!benefics.includes(planet.name)) continue;
        const house = planet.house || 1;

        if ([1, 4, 7, 10].includes(house)) {
            kendraReduction += 10; // 10ml per benefic in Kendra
        }
    }

    dosha = Math.max(0, dosha - Math.min(kendraReduction, 25)); // Max 25ml reduction

    return Math.max(0, dosha);
}

// ============================================================================
// RULE 3: 2ND HOUSE ANALYSIS (10%)
// ============================================================================

function analyze2ndHouse(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 70,
        weight: 10,
        details: []
    };

    const boy2ndScore = get2ndHouseScore(boyChart);
    const girl2ndScore = get2ndHouseScore(girlChart);

    result.details.push(`Boy 2nd house: ${boy2ndScore}/100`);
    result.details.push(`Girl 2nd house: ${girl2ndScore}/100`);

    // Both strong
    if (boy2ndScore >= 70 && girl2ndScore >= 70) {
        result.score = 100;
        result.details.push('✓ Both families have good wealth indicators');
    }
    // Both moderate
    else if (boy2ndScore >= 50 && girl2ndScore >= 50) {
        result.score = 70;
        result.details.push('Moderate family backgrounds - Compatible');
    }
    // Mismatch
    else if (Math.abs(boy2ndScore - girl2ndScore) > 40) {
        result.score = 50;
        result.details.push('⚠️ Significant wealth background mismatch');
    }
    else {
        result.score = 60;
    }

    return result;
}

function get2ndHouseScore(chart: any): number {
    let score = 50;
    const planets = chart.planets || [];

    // 2nd House Lord Strength (30% of score)
    const lordStrength = getHouseLordStrength(2, chart);
    score += (lordStrength - 50) * 0.3; // Convert 0-100 to -15 to +15

    // Find planets in 2nd house
    const in2nd = planets.filter((p: any) => p.house === 2);

    for (const planet of in2nd) {
        if (planet.name === 'Jupiter') score += 20;
        else if (planet.name === 'Venus') score += 15;
        else if (planet.name === 'Mercury') score += 15;
        else if (planet.name === 'Saturn') score -= 20;
        else if (planet.name === 'Mars') score -= 15;
        else if (planet.name === 'Rahu') score -= 15;
    }

    return Math.min(100, Math.max(0, score));
}

// ============================================================================
// RULE 4: 5TH HOUSE ANALYSIS (15%)
// ============================================================================

function analyze5thHouse(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 70,
        weight: 15,
        details: []
    };

    const boy5th = get5thHouseScore(boyChart);
    const girl5th = get5thHouseScore(girlChart);

    result.details.push(`Boy 5th house: ${boy5th}/100`);
    result.details.push(`Girl 5th house: ${girl5th}/100`);

    const avgScore = (boy5th + girl5th) / 2;

    if (avgScore >= 80) {
        result.score = 100;
        result.details.push('✓ Excellent progeny indicators in both charts');
    } else if (avgScore >= 60) {
        result.score = 85;
        result.details.push('Good children prospects');
    } else if (avgScore >= 40) {
        result.score = 60;
        result.details.push('⚠️ Moderate children indicators - possible delays');
    } else {
        result.score = 30;
        result.details.push('⚠️ Weak 5th house - children challenges possible');
    }

    return result;
}

function get5thHouseScore(chart: any): number {
    let score = 50;
    const planets = chart.planets || [];

    // 5th House Lord Strength (30% of score)
    const lordStrength = getHouseLordStrength(5, chart);
    score += (lordStrength - 50) * 0.3; // Convert 0-100 to -15 to +15

    const in5th = planets.filter((p: any) => p.house === 5);

    for (const planet of in5th) {
        if (planet.name === 'Jupiter') score += 30;
        else if (planet.name === 'Venus') score += 20;
        else if (planet.name === 'Mercury') score += 15;
        else if (planet.name === 'Saturn') score -= 25;
        else if (planet.name === 'Ketu') score -= 25;
        else if (planet.name === 'Mars') score -= 20;
        else if (planet.name === 'Rahu') score -= 20;
    }

    return Math.min(100, Math.max(0, score));
}

// ============================================================================
// RULE 5: 7TH HOUSE ANALYSIS (20%)
// ============================================================================

function analyze7thHouse(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 70,
        weight: 20,
        details: []
    };

    const boySaturn7th = hasSaturnIn7th(boyChart);
    const girlSaturn7th = hasSaturnIn7th(girlChart);

    // Saturn in 7th special rule
    if (boySaturn7th && girlSaturn7th) {
        result.score = 70;
        result.details.push('Both have Saturn in 7th - Equal late marriage energy');
    } else if (boySaturn7th || girlSaturn7th) {
        result.score = 30;
        result.details.push('⚠️ Only one has Saturn in 7th - Mismatch in marriage readiness');
    }

    const boy7th = get7thHouseScore(boyChart);
    const girl7th = get7thHouseScore(girlChart);

    result.details.push(`Boy 7th house health: ${boy7th}/100`);
    result.details.push(`Girl 7th house health: ${girl7th}/100`);

    const avgScore = (boy7th + girl7th) / 2;
    result.score = Math.min(result.score, avgScore);

    return result;
}

function hasSaturnIn7th(chart: any): boolean {
    const planets = chart.planets || [];
    return planets.some((p: any) => p.name === 'Saturn' && p.house === 7);
}

function get7thHouseScore(chart: any): number {
    let score = 70;
    const planets = chart.planets || [];

    // 7th House Lord Strength (30% of score)
    const lordStrength = getHouseLordStrength(7, chart);
    score += (lordStrength - 50) * 0.3; // Convert 0-100 to -15 to +15

    const in7th = planets.filter((p: any) => p.house === 7);

    for (const planet of in7th) {
        if (planet.name === 'Jupiter') score += 25;
        else if (planet.name === 'Venus') score += 30;
        else if (planet.name === 'Mercury') score += 15;
        else if (planet.name === 'Saturn') score -= 20;
        else if (planet.name === 'Mars') score -= 20;
        else if (planet.name === 'Rahu') score -= 25;
        else if (planet.name === 'Ketu') score -= 20;
    }

    return Math.min(100, Math.max(20, score));
}

// ============================================================================
// RULE 6: 8TH HOUSE / FOREIGN SETTLEMENT (10%)
// ============================================================================

function analyze8thHouseForeign(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 70,
        weight: 10,
        details: []
    };

    const boyForeign = hasForeignYoga(boyChart);
    const girlForeign = hasForeignYoga(girlChart);

    if (boyForeign && girlForeign) {
        result.score = 100;
        result.details.push('✓ Both have foreign settlement yoga - Compatible for abroad');
    } else if (!boyForeign && !girlForeign) {
        result.score = 100;
        result.details.push('✓ Both prefer homeland - Compatible for local life');
    } else {
        result.score = 50;
        result.details.push('⚠️ Foreign settlement mismatch - Possible separation risk');
    }

    return result;
}

function hasForeignYoga(chart: any): boolean {
    const planets = chart.planets || [];
    const in8th = planets.filter((p: { house: number }) => p.house === 8);
    const in12th = planets.filter((p: { house: number }) => p.house === 12);
    const rahu = planets.find((p: { name: string }) => p.name === 'Rahu');

    // Check 8th and 12th house lord strength
    const lord8thStrength = getHouseLordStrength(8, chart);
    const lord12thStrength = getHouseLordStrength(12, chart);

    let foreignScore = 0;

    // House lord strength
    if (lord8thStrength >= 60) foreignScore += 25;
    if (lord12thStrength >= 60) foreignScore += 25;

    // Benefics in 8/12
    if (in8th.some((p: { name: string }) => ['Jupiter', 'Venus', 'Mercury'].includes(p.name))) foreignScore += 20;
    if (in12th.some((p: { name: string }) => ['Jupiter', 'Venus', 'Mercury'].includes(p.name))) foreignScore += 20;

    // Rahu strong
    if (rahu && [8, 12, 9].includes(rahu.house)) foreignScore += 30;

    return foreignScore >= 60;
}

// ============================================================================
// RULE 7: VENUS ANALYSIS (10%)
// ============================================================================

function analyzeVenus(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 70,
        weight: 10,
        details: []
    };

    const boyVenus = getVenusScore(boyChart);
    const girlVenus = getVenusScore(girlChart);

    result.details.push(`Boy Venus: ${boyVenus}/100`);
    result.details.push(`Girl Venus: ${girlVenus}/100`);

    const avgScore = (boyVenus + girlVenus) / 2;
    result.score = avgScore;

    if (avgScore >= 80) {
        result.details.push('✓ Excellent conjugal happiness indicators');
    } else if (avgScore < 50) {
        result.details.push('⚠️ Venus afflictions - Conjugal challenges possible');
    }

    return result;
}

function getVenusScore(chart: any): number {
    let score = 70;
    const planets = chart.planets || [];
    const venus = planets.find((p: any) => p.name === 'Venus');
    const sun = planets.find((p: any) => p.name === 'Sun');

    if (!venus) return 50;

    // Accurate combustion check with degree ranges
    if (sun) {
        const separation = getDegreeSeparation(venus, sun);
        if (separation < 8) {
            score -= 35; // Severe combustion
        } else if (separation < 12) {
            score -= 20; // Mild combustion
        }
    }

    // Dusthana check
    if ([6, 8, 12].includes(venus.house)) {
        score -= 15;
    }

    // Check Chandra Adhi Yoga (benefics in 6/7/8 from Moon)
    if (checkChandraAdhiYoga(chart)) {
        score += 25; // Cancels afflictions
    }

    return Math.min(100, Math.max(30, score));
}

// Note: hasChandraAdhiYoga is now imported from houseLordship.ts as checkChandraAdhiYoga

// ============================================================================
// RULE 8: JUPITER-VENUS CONJUNCTION (8%)
// ============================================================================

function analyzeJupiterVenusConjunction(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 100,
        weight: 8,
        details: []
    };

    const boyConjunction = checkJupiterVenusConjunction(boyChart);
    const girlConjunction = checkJupiterVenusConjunction(girlChart);

    if (!boyConjunction.hasConjunction && !girlConjunction.hasConjunction) {
        result.score = 100;
        result.details.push('✓ No Jupiter-Venus conjunction - No children delay');
    } else {
        const worstScore = Math.min(boyConjunction.score, girlConjunction.score);
        result.score = worstScore;

        if (boyConjunction.hasConjunction) {
            result.details.push(`Boy: Jupiter-Venus conjunction - ${boyConjunction.details}`);
        }
        if (girlConjunction.hasConjunction) {
            result.details.push(`Girl: Jupiter-Venus conjunction - ${girlConjunction.details}`);
        }
    }

    return result;
}

function checkJupiterVenusConjunction(chart: any): { hasConjunction: boolean; score: number; details: string } {
    const planets = chart.planets || [];
    const jupiter = planets.find((p: any) => p.name === 'Jupiter');
    const venus = planets.find((p: any) => p.name === 'Venus');

    if (!jupiter || !venus) {
        return { hasConjunction: false, score: 100, details: '' };
    }

    const degrees = Math.abs(jupiter.longitude - venus.longitude);

    if (degrees <= 12) {
        let score = 60;
        let details = '';

        if (degrees <= 5) {
            score = 30;
            details = 'Very close conjunction (0-5°) - Serious children delay';
        } else if (degrees <= 10) {
            score = 60;
            details = 'Moderate conjunction (6-10°) - Children delay likely';
        } else {
            score = 80;
            details = 'Wide conjunction (11-12°) - Minor delay possible';
        }

        return { hasConjunction: true, score, details };
    }

    return { hasConjunction: false, score: 100, details: '' };
}

// ============================================================================
// RULE 9: LAGNA COMPATIBILITY (7%)
// ============================================================================

function analyzeLagnaCompatibility(boyChart: any, girlChart: any): RuleResult {
    const result: RuleResult = {
        score: 70,
        weight: 7,
        details: []
    };

    const boyLagna = boyChart.ascendant?.sign || 0;
    const girlLagna = girlChart.ascendant?.sign || 0;

    const position = (girlLagna - boyLagna + 12) % 12;

    // Position-based scoring (60% weight)
    let positionScore = 70;

    if (position === 0) {
        positionScore = 90;
        result.details.push('Same Lagna - Deep understanding');
    } else if (position === 1 || position === 11) {
        positionScore = 85;
        result.details.push('2-12 relationship - Complementary');
    } else if (position === 4 || position === 8) {
        positionScore = 95;
        result.details.push('5-9 Trikona - Excellent spiritual connection');
    } else if (position === 5 || position === 7) {
        positionScore = 30;
        result.details.push('⚠️ 6-8 Shashtashtaka - Friction likely');
    } else if (position === 6) {
        positionScore = 65;
        result.details.push('7-7 Opposition - Opposites attract but can clash');
    } else {
        positionScore = 70;
        result.details.push('Neutral Lagna relationship');
    }

    // Elemental compatibility (40% weight)
    const elementalResult = getElementalCompatibility(boyLagna, girlLagna);
    result.details.push(elementalResult.description);

    // Combine position score (60%) and elemental score (40%)
    result.score = Math.round(positionScore * 0.6 + elementalResult.score * 0.4);

    return result;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateStrengthsWeaknesses(result: ComprehensiveMatchResult) {
    // Strengths
    if (result.dasaSync.score >= 80) {
        result.strengths.push('Compatible Dasa periods for next decade');
    }
    if (result.doshaBalance.score >= 80) {
        result.strengths.push('Well-balanced dosha levels');
    }
    if (result.house7th.score >= 80) {
        result.strengths.push('Strong 7th house for marital happiness');
    }
    if (result.house5th.score >= 80) {
        result.strengths.push('Good progeny indicators');
    }

    // Weaknesses
    if (result.dasaSync.score < 60) {
        result.weaknesses.push('Dasa period conflicts detected');
    }
    if (result.doshaBalance.score < 60) {
        result.weaknesses.push('Dosha level mismatch');
    }
    if (result.house7th.score < 60) {
        result.weaknesses.push('7th house afflictions present');
    }
    if (result.venus.score < 60) {
        result.weaknesses.push('Venus afflictions may affect conjugal happiness');
    }
}

function generateRecommendations(result: ComprehensiveMatchResult) {
    if (result.autoReject) {
        result.recommendations.push('Match not recommended due to critical incompatibilities');
    } else if (result.overallScore >= 80) {
        result.recommendations.push('Excellent match - Proceed with confidence');
    } else if (result.overallScore >= 70) {
        result.recommendations.push('Good match - Minor challenges can be managed');
    } else {
        result.recommendations.push('Average match - Careful consideration recommended');
        result.recommendations.push('Discuss expectations and compromises before marriage');
    }

    if (result.jupiterVenus.score < 70) {
        result.recommendations.push('Children may be delayed - Plan accordingly');
    }

    if (result.house8th.score < 70) {
        result.recommendations.push('Discuss foreign settlement preferences clearly');
    }
}

