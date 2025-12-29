/**
 * Transit Calculator
 * 
 * Calculates current planetary transits and their effects
 * on the natal chart
 */

import { Transit } from '../types/enhancedDasaTypes';

/**
 * Get current transits for major planets
 * Note: This is a simplified version. In production, you'd use an ephemeris library
 * or API to get actual current planetary positions
 */
export function getCurrentTransits(
    birthChartPlanets: Map<string, { sign: string; house: number }>,
    currentDate: Date = new Date()
): Transit[] {
    const transits: Transit[] = [];

    // For now, returning placeholder transits
    // In production, integrate with Swiss Ephemeris or similar

    // Hard-coded current positions as of early 2025 (approximate)
    const currentPositions = getCurrentPlanetaryPositions(currentDate);

    for (const [planet, position] of Object.entries(currentPositions)) {
        const currentHouse = calculateTransitHouse(position.sign, birthChartPlanets);
        const aspectingHouses = getTransitAspectHouses(currentHouse);
        const effect = determineTransitEffect(planet, currentHouse);
        const description = getTransitDescription(planet, position.sign, currentHouse);

        transits.push({
            planet,
            currentSign: position.sign,
            currentHouse,
            aspectingHouses,
            effect,
            description,
        });
    }

    return transits;
}

/**
 * Get approximate current planetary positions
 * THIS IS A PLACEHOLDER - Replace with actual ephemeris calculations
 */
function getCurrentPlanetaryPositions(date: Date): Record<string, { sign: string; degree: number }> {
    // Approximate positions for late December 2024/early 2025
    // These should be calculated using Swiss Ephemeris or similar
    return {
        'Jupiter': { sign: 'Taurus', degree: 15 },
        'Saturn': { sign: 'Aquarius', degree: 10 },
        'Rahu': { sign: 'Pisces', degree: 20 },
        'Ketu': { sign: 'Virgo', degree: 20 },
    };
}

/**
 * Calculate which house a transiting planet is in
 */
function calculateTransitHouse(
    transitSign: string,
    birthChart: Map<string, { sign: string; house: number }>
): number {
    // Find ascendant sign from birth chart
    const ascendantData = birthChart.get('Ascendant');
    if (!ascendantData) {
        return 1; // Default to 1st house
    }

    const ascendantSign = ascendantData.sign;

    // Calculate house based on sign distance from ascendant
    const signOrder = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const ascIndex = signOrder.indexOf(ascendantSign);
    const transitIndex = signOrder.indexOf(transitSign);

    if (ascIndex === -1 || transitIndex === -1) {
        return 1; // Default
    }

    const houseDiff = (transitIndex - ascIndex + 12) % 12;
    return houseDiff + 1;
}

/**
 * Get houses that transit planet aspects
 */
function getTransitAspectHouses(fromHouse: number): number[] {
    const aspectHouses: number[] = [];

    // 7th aspect (all planets)
    const seventhHouse = ((fromHouse + 6) % 12) + 1;
    aspectHouses.push(seventhHouse);

    return aspectHouses;
}

/**
 * Determine if transit is favorable, unfavorable, or neutral
 */
function determineTransitEffect(
    planet: string,
    house: number
): 'Favorable' | 'Unfavorable' | 'Neutral' {
    // Simplified rules:
    // Jupiter - favorable in 2, 5, 7, 9, 11 from Lagna
    // Saturn - favorable in 3, 6, 11 from Lagna (Upachaya houses)
    // Rahu/Ketu - favorable in 3, 6, 10, 11

    if (planet === 'Jupiter') {
        return [2, 5, 7, 9, 11].includes(house) ? 'Favorable' : 'Neutral';
    } else if (planet === 'Saturn') {
        return [3, 6, 11].includes(house) ? 'Favorable' : 'Unfavorable';
    } else if (planet === 'Rahu' || planet === 'Ketu') {
        return [3, 6, 10, 11].includes(house) ? 'Favorable' : 'Unfavorable';
    }

    return 'Neutral';
}

/**
 * Get transit description
 */
function getTransitDescription(
    planet: string,
    sign: string,
    house: number
): string {
    const descriptions: Record<string, Record<number, string>> = {
        'Jupiter': {
            1: 'Self-improvement, new beginnings, optimism',
            2: 'Wealth increase, family happiness',
            3: 'Short travels, communication success',
            4: 'Property gains, mother\'s well-being',
            5: 'Children\'s success, creativity, education',
            6: 'Victory over enemies, health',
            7: 'Marriage prospects, partnerships',
            8: 'Spiritual growth, inheritance',
            9: 'Fortune, higher education, long travels',
            10: 'Career growth, recognition',
            11: 'Income increase, wishes fulfilled',
            12: 'Spiritual practices, foreign connections',
        },
        'Saturn': {
            1: 'Challenges, patience needed',
            2: 'Financial caution, speech control',
            3: 'Courage, efforts rewarded',
            4: 'Property matters need care',
            5: 'Delays in children matters',
            6: 'Victory through hard work',
            7: 'Relationship tests',
            8: 'Transformation period',
            9: 'Spiritual lessons',
            10: 'Career responsibilities',
            11: 'Gradual income growth',
            12: 'Isolation, meditation',
        },
        'Rahu': {
            3: 'Courage, unconventional success',
            6: 'Victory over enemies',
            10: 'Career advancement through innovation',
            11: 'Unexpected gains',
        },
        'Ketu': {
            3: 'Spiritual courage',
            6: 'Healing abilities',
            10: 'Detachment from worldly success',
            11: 'Spiritual gains',
        },
    };

    const planetDescriptions = descriptions[planet];
    if (planetDescriptions && planetDescriptions[house]) {
        return planetDescriptions[house];
    }

    return `${planet} transiting ${house}th house in ${sign}`;
}

/**
 * Get transit description in Tamil
 */
export function getTransitDescriptionInTamil(transit: Transit): string {
    const planetTamil: Record<string, string> = {
        'Jupiter': 'குரு',
        'Saturn': 'சனி',
        'Rahu': 'ராகு',
        'Ketu': 'கேது',
    };

    const signTamil: Record<string, string> = {
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
        'Pisces': 'மீனம்',
    };

    const effectTamil: Record<string, string> = {
        'Favorable': 'சாதகமானது',
        'Unfavorable': 'பாதகமானது',
        'Neutral': 'நடுநிலை',
    };

    return `${planetTamil[transit.planet] || transit.planet} ${signTamil[transit.currentSign] || transit.currentSign} ராசியில் ${transit.currentHouse}வது வீட்டில் செல்கிறது - ${effectTamil[transit.effect] || transit.effect}`;
}

/**
 * Check if transit supports Dasa/Bhukti results
 */
export function doesTransitSupportDasaBhukti(
    dasaPlanet: string,
    bhuktiPlanet: string,
    transits: Transit[]
): {
    supported: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];
    let supported = false;

    // Check if Dasa or Bhukti planet is transiting favorably
    const dasaTransit = transits.find(t => t.planet === dasaPlanet);
    const bhuktiTransit = transits.find(t => t.planet === bhuktiPlanet);

    if (dasaTransit && dasaTransit.effect === 'Favorable') {
        supported = true;
        reasons.push(`${dasaPlanet} transiting favorably in ${dasaTransit.currentHouse}th house`);
    }

    if (bhuktiTransit && bhuktiTransit.effect === 'Favorable') {
        supported = true;
        reasons.push(`${bhuktiPlanet} transiting favorably in ${bhuktiTransit.currentHouse}th house`);
    }

    // Check Jupiter and Saturn transits (most important)
    const jupiterTransit = transits.find(t => t.planet === 'Jupiter');
    const saturnTransit = transits.find(t => t.planet === 'Saturn');

    if (jupiterTransit && jupiterTransit.effect === 'Favorable') {
        reasons.push(`Jupiter transit supports the period`);
    }

    if (saturnTransit && saturnTransit.effect === 'Unfavorable') {
        reasons.push(`Saturn transit may create delays`);
    }

    return { supported, reasons };
}
