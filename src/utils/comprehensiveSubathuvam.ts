/**
 * Comprehensive Subathuvam/Pavathuvam Analyzer
 * 
 * Analyzes the benefic (Subha) and malefic (Paapa) nature of planets
 * based on multiple factors including dignity, house placement, conjunctions, aspects
 */

import { SubathuvamAnalysis, Planet Analysis, PlanetDignity } from '../types/enhancedDasaTypes';
import { PlanetPosition } from './planetaryRelationships';
import { calculatePlanetDignity } from './planetDignity';

/**
 * Analyze comprehensive Subathuvam/Pavathuvam for all planets
 */
export function analyzeComprehensiveSubathuvam(
    planets: PlanetPosition[],
    ascendantSign: string,
    conjunctions: Map<string, string[]>, // planet name -> conjunct planets
    aspects: Map<string, string[]> // planet name -> aspecting planets
): SubathuvamAnalysis {
    const subhaPlanets: PlanetAnalysis[] = [];
    const paapaPlanets: PlanetAnalysis[] = [];

    // Analyze each planet
    for (const planet of planets) {
        const analysis = analyzePlanetSubathuvam(
            planet,
            conjunctions.get(planet.name) || [],
            aspects.get(planet.name) || []
        );

        if (analysis.status === 'Subha') {
            subhaPlanets.push(analysis);
        } else if (analysis.status === 'Paapa') {
            paapaPlanets.push(analysis);
        }
    }

    // Determine Subha and Paapa houses
    const subhaHouses = [1, 2, 4, 5, 7, 9, 10, 11]; // Benefic houses
    const paapaHouses = [3, 6, 8, 12]; // Malefic houses (Dusthanas)

    // Analyze conjunctions
    const subhaConjunctions: string[] = [];
    const paapaConjunctions: string[] = [];

    for (const [planet, conjuncts] of conjunctions.entries()) {
        if (conjuncts.length > 0) {
            const conjunctionText = `${planet} + ${conjuncts.join(', ')}`;

            // Determine if benefic or malefic conjunction
            const isBeneficConjunction = isConjunctionBenefic(planet, conjuncts);

            if (isBeneficConjunction) {
                subhaConjunctions.push(conjunctionText);
            } else {
                paapaConjunctions.push(conjunctionText);
            }
        }
    }

    // Calculate overall score
    const allScores = [...subhaPlanets, ...paapaPlanets].map(p => p.score);
    const overallScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 50;

    return {
        subhaPlanets,
        paapaPlanets,
        subhaHouses,
        paapaHouses,
        subhaConjunctions,
        paapaConjunctions,
        overallSubathuvamScore: overallScore,
    };
}

/**
 * Analyze individual planet Subathuvam
 */
function analyzePlanetSubathuvam(
    planet: PlanetPosition,
    conjunctions: string[],
    aspects: string[]
): PlanetAnalysis {
    const dignity = calculatePlanetDignity(planet.name, planet.sign, planet.degree);
    const reasons: string[] = [];
    let score = 50; // Base neutral score

    // 1. Natural benefic/malefic nature
    const naturalBenefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const naturalMalefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

    if (naturalBenefics.includes(planet.name)) {
        score += 10;
        reasons.push(`${planet.name} is natural benefic`);
    } else if (naturalMalefics.includes(planet.name)) {
        score -= 10;
        reasons.push(`${planet.name} is natural malefic`);
    }

    // 2. Dignity
    if (dignity === 'Exalted') {
        score += 30;
        reasons.push(`Exalted in ${planet.sign}`);
    } else if (dignity === 'Own') {
        score += 20;
        reasons.push(`Own sign ${planet.sign}`);
    } else if (dignity === 'Friend') {
        score += 10;
        reasons.push(`Friend sign ${planet.sign}`);
    } else if (dignity === 'Enemy') {
        score -= 10;
        reasons.push(`Enemy sign ${planet.sign}`);
    } else if (dignity === 'Debilitated') {
        score -= 30;
        reasons.push(`Debilitated in ${planet.sign}`);
    }

    // 3. House placement
    const subhaHouses = [1, 2, 4, 5, 7, 9, 10, 11];
    const paapaHouses = [3, 6, 8, 12];

    if (subhaHouses.includes(planet.house)) {
        score += 15;
        reasons.push(`In benefic ${planet.house}th house`);
    } else if (paapaHouses.includes(planet.house)) {
        score -= 15;
        reasons.push(`In malefic ${planet.house}th house`);
    }

    // 4. Conjunctions
    if (conjunctions.length > 0) {
        const beneficConjunctions = conjunctions.filter(p => naturalBenefics.includes(p));
        const maleficConjunctions = conjunctions.filter(p => naturalMalefics.includes(p));

        if (beneficConjunctions.length > 0) {
            score += 5 * beneficConjunctions.length;
            reasons.push(`Conjunct benefics: ${beneficConjunctions.join(', ')}`);
        }

        if (maleficConjunctions.length > 0) {
            score -= 5 * maleficConjunctions.length;
            reasons.push(`Conjunct malefics: ${maleficConjunctions.length}`);
        }
    }

    // 5. Aspects
    if (aspects.length > 0) {
        const beneficAspects = aspects.filter(p => naturalBenefics.includes(p));
        const maleficAspects = aspects.filter(p => naturalMalefics.includes(p));

        if (beneficAspects.length > 0) {
            score += 5 * beneficAspects.length;
            reasons.push(`Aspected by benefics: ${beneficAspects.join(', ')}`);
        }

        if (maleficAspects.length > 0) {
            score -= 5 * maleficAspects.length;
            reasons.push(`Aspected by malefics: ${maleficAspects.join(', ')}`);
        }
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine status
    let status: 'Subha' | 'Paapa' | 'Neutral' = 'Neutral';
    if (score >= 60) {
        status = 'Subha';
    } else if (score <= 40) {
        status = 'Paapa';
    }

    return {
        planet: planet.name,
        score,
        status,
        reasons,
        position: {
            sign: planet.sign,
            house: planet.house,
            dignity,
        },
        conjunctions,
        aspects,
    };
}

/**
 * Determine if a conjunction is benefic
 */
function isConjunctionBenefic(planet: string, conjuncts: string[]): boolean {
    const naturalBenefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

    // If main planet is benefic and all conjuncts are benefic
    const planetIsBenefic = naturalBenefics.includes(planet);
    const allConjunctsBenefic = conjuncts.every(p => naturalBenefics.includes(p));

    return planetIsBenefic && allConjunctsBenefic;
}

/**
 * Get detailed explanation in Tamil
 */
export function getSubathuvamExplanationInTamil(analysis: PlanetAnalysis): string {
    const statusTamil = analysis.status === 'Subha' ? 'சுபத்துவம்' :
        analysis.status === 'Paapa' ? 'பாபத்துவம்' : 'நடுநிலை';

    let explanation = `${analysis.planet}: ${statusTamil} (${analysis.score}/100)\n`;
    explanation += `காரணங்கள்:\n`;

    for (const reason of analysis.reasons) {
        explanation += `  • ${translateReasonToTamil(reason)}\n`;
    }

    return explanation;
}

/**
 * Translate reason to Tamil
 */
function translateReasonToTamil(reason: string): string {
    // Simple translations for common patterns
    if (reason.includes('natural benefic')) {
        return 'இயற்கை சுப கிரகம்';
    } else if (reason.includes('natural malefic')) {
        return 'இயற்கை பாப கிரகம்';
    } else if (reason.includes('Exalted')) {
        return reason.replace('Exalted in', 'உச்சம்:');
    } else if (reason.includes('Own sign')) {
        return reason.replace('Own sign', 'சொந்த ராசி:');
    } else if (reason.includes('Debilitated')) {
        return reason.replace('Debilitated in', 'நீசம்:');
    } else if (reason.includes('benefic') && reason.includes('house')) {
        return reason.replace('In benefic', 'சுப').replace('house', 'வீட்டில்');
    } else if (reason.includes('malefic') && reason.includes('house')) {
        return reason.replace('In malefic', 'பாப').replace('house', 'வீட்டில்');
    }

    return reason;
}
