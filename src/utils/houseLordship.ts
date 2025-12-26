/**
 * House Lordship and Vedic Astrology Core Utilities
 * Essential for authentic Aditya Guruji marriage matching
 */

// Zodiac Sign Rulers
export const SIGN_RULERS: { [key: number]: string[] } = {
    0: ['Mars'],           // Aries
    1: ['Venus'],          // Taurus
    2: ['Mercury'],        // Gemini
    3: ['Moon'],           // Cancer
    4: ['Sun'],            // Leo
    5: ['Mercury'],        // Virgo
    6: ['Venus'],          // Libra
    7: ['Mars'],           // Scorpio
    8: ['Jupiter'],        // Sagittarius
    9: ['Saturn'],         // Capricorn
    10: ['Saturn'],        // Aquarius
    11: ['Jupiter']        // Pisces
};

// Elemental Groups for Lagna Compatibility
export const SIGN_ELEMENTS: { [key: number]: string } = {
    0: 'Fire',    // Aries
    1: 'Earth',   // Taurus
    2: 'Air',     // Gemini
    3: 'Water',   // Cancer
    4: 'Fire',    // Leo
    5: 'Earth',   // Virgo
    6: 'Air',     // Libra
    7: 'Water',   // Scorpio
    8: 'Fire',    // Sagittarius
    9: 'Earth',   // Capricorn
    10: 'Air',    // Aquarius
    11: 'Water'   // Pisces
};

export const SIGN_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

/**
 * Get houses ruled by a planet in a chart
 */
export function getHousesRuledByPlanet(planetName: string, chart: any): number[] {
    const lagna = chart.ascendant?.signIndex ?? 0;
    const houses: number[] = [];

    // Check each house to see if this planet rules it
    for (let house = 1; house <= 12; house++) {
        const signIndex = (lagna + house - 1) % 12;
        const rulers = SIGN_RULERS[signIndex];

        if (rulers && rulers.includes(planetName)) {
            houses.push(house);
        }
    }

    return houses;
}

/**
 * Get the lord (ruler) of a specific house
 */
export function getHouseLord(houseNumber: number, chart: any): string | null {
    // Use signIndex (0-11) not sign which may be undefined
    const lagna = chart.ascendant?.signIndex ?? 0;
    const signIndex = (lagna + houseNumber - 1) % 12;
    const rulers = SIGN_RULERS[signIndex];

    return rulers && rulers.length > 0 ? rulers[0] : null;
}

/**
 * Get planet by name from chart
 */
export function getPlanet(chart: any, planetName: string): any {
    const planets = chart.planets || [];
    return planets.find((p: any) => p.name === planetName);
}

/**
 * Calculate house lord strength (simplified)
 * Returns 0-100 score
 */
export function getHouseLordStrength(houseNumber: number, chart: any): number {
    console.log(`\n===== HOUSE ${houseNumber} LORD STRENGTH =====`);
    let strength = 50; // Base strength
    console.log('Base strength:', strength);

    const lord = getHouseLord(houseNumber, chart);
    console.log('House lord:', lord);
    if (!lord) {
        console.log('No lord found, returning base strength:', strength);
        return strength;
    }

    const lordPlanet = getPlanet(chart, lord);
    console.log('Lord planet full object:', JSON.stringify(lordPlanet, null, 2));
    if (!lordPlanet) {
        console.log('Lord planet not found, returning base strength:', strength);
        return strength;
    }

    // Get lord's house position
    // If house property doesn't exist, calculate from signIndex and ascendant
    let lordHouse = lordPlanet.house ?? lordPlanet.houseNumber;

    if (lordHouse === undefined && lordPlanet.signIndex !== undefined && chart.ascendant?.signIndex !== undefined) {
        // Calculate house from sign difference
        lordHouse = ((lordPlanet.signIndex - chart.ascendant.signIndex + 12) % 12) + 1;
        console.log('Calculated lordHouse from signIndex:', lordHouse);
    }

    lordHouse = lordHouse ?? 1; // Final fallback

    console.log('Lord is in house:', lordHouse, '(from lordPlanet.house =', lordPlanet.house, ', lordPlanet.houseNumber =', lordPlanet.houseNumber, ', lordPlanet.signIndex =', lordPlanet.signIndex, ')');

    // Lord in Kendra (1,4,7,10) - Strong
    if ([1, 4, 7, 10].includes(lordHouse)) {
        strength += 20;
        console.log('Lord in Kendra (+20), strength now:', strength);
    }

    // Lord in Trikona (1,5,9) - Very Strong
    if ([1, 5, 9].includes(lordHouse)) {
        strength += 25;
        console.log('Lord in Trikona (+25), strength now:', strength);
    }

    // Lord in Dusthana (6,8,12) - Weak
    if ([6, 8, 12].includes(lordHouse)) {
        strength -= 30;
        console.log('Lord in Dusthana (-30), strength now:', strength);
    }

    // Check if lord is in own sign (exalted placement)
    const lordSign = Math.floor(lordPlanet.longitude / 30);
    const lordRulers = SIGN_RULERS[lordSign];
    console.log('Lord sign:', lordSign, 'Rulers:', lordRulers);
    if (lordRulers && lordRulers.includes(lord)) {
        strength += 15; // Own sign strength
        console.log('Lord in own sign (+15), strength now:', strength);
    }

    const finalStrength = Math.min(100, Math.max(0, strength));
    console.log('Final lord strength:', finalStrength);
    console.log('=====================================\n');

    return finalStrength;
}

/**
 * Check if planet aspects a house
 * Jupiter aspects 5th, 7th, 9th houses from its position
 * Saturn aspects 3rd, 7th, 10th houses
 * Mars aspects 4th, 7th, 8th houses
 */
export function hasAspect(
    planetName: string,
    planetHouse: number,
    targetHouse: number
): boolean {
    const diff = (targetHouse - planetHouse + 12) % 12;

    if (planetName === 'Jupiter') {
        return [4, 6, 8].includes(diff); // 5th, 7th, 9th
    } else if (planetName === 'Saturn') {
        return [2, 6, 9].includes(diff); // 3rd, 7th, 10th
    } else if (planetName === 'Mars') {
        return [3, 6, 7].includes(diff); // 4th, 7th, 8th
    } else {
        // All planets aspect 7th house
        return diff === 6; // 7th house
    }
}

/**
 * Get exact degree separation between two planets
 */
export function getDegreeSeparation(planet1: any, planet2: any): number {
    if (!planet1 || !planet2) return 360;

    let diff = Math.abs(planet1.longitude - planet2.longitude);

    // Handle wrap-around (e.g., 359° to 1°)
    if (diff > 180) {
        diff = 360 - diff;
    }

    return diff;
}

/**
 * Check if planet is in a specific house from another planet/point
 */
export function getHouseFromPoint(
    planetHouse: number,
    pointHouse: number
): number {
    return ((planetHouse - pointHouse + 12) % 12) || 12;
}

/**
 * Check elemental compatibility between two lagnas
 */
export function getElementalCompatibility(lagna1: number, lagna2: number): {
    score: number;
    description: string;
} {
    const element1 = SIGN_ELEMENTS[lagna1 % 12];
    const element2 = SIGN_ELEMENTS[lagna2 % 12];

    // Same element - Excellent
    if (element1 === element2) {
        return {
            score: 95,
            description: `Both ${element1} signs - Natural understanding`
        };
    }

    // Compatible elements
    const compatible = [
        ['Fire', 'Air'],
        ['Earth', 'Water']
    ];

    const isCompatible = compatible.some(([e1, e2]) =>
        (element1 === e1 && element2 === e2) ||
        (element1 === e2 && element2 === e1)
    );

    if (isCompatible) {
        return {
            score: 80,
            description: `${element1} and ${element2} - Complementary energies`
        };
    }

    // Conflicting elements
    const conflicts = [
        ['Fire', 'Water'],   // Fire extinguished by water
        ['Earth', 'Air']     // Earth and air don't mix well
    ];

    const isConflict = conflicts.some(([e1, e2]) =>
        (element1 === e1 && element2 === e2) ||
        (element1 === e2 && element2 === e1)
    );

    if (isConflict) {
        return {
            score: 40,
            description: `${element1} vs ${element2} - Natural friction`
        };
    }

    // Neutral
    return {
        score: 65,
        description: `${element1} and ${element2} - Neutral relationship`
    };
}

/**
 * Check if chart has Chandra Adhi Yoga
 * Benefics (Jupiter, Venus, Mercury) in 6th, 7th, or 8th from Moon
 */
export function hasChandraAdhiYoga(chart: any): boolean {
    const planets = chart.planets || [];
    const moon = getPlanet(chart, 'Moon');

    if (!moon) return false;

    const moonHouse = moon.house || 1;
    const benefics = ['Jupiter', 'Venus', 'Mercury'];

    let beneficCount = 0;

    for (const planet of planets) {
        if (!benefics.includes(planet.name)) continue;

        const houseFromMoon = getHouseFromPoint(planet.house, moonHouse);

        // Check if in 6th, 7th, or 8th from Moon
        if ([6, 7, 8].includes(houseFromMoon)) {
            beneficCount++;
        }
    }

    // At least 2 benefics needed for the yoga
    return beneficCount >= 2;
}

/**
 * Get planet's functional nature for the lagna
 * (This is a simplified version, full calculation is complex)
 */
export function getPlanetFunctionalNature(
    planetName: string,
    lagna: number
): 'Benefic' | 'Malefic' | 'Neutral' {
    // Natural benefics
    const naturalBenefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    // Natural malefics
    const naturalMalefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

    if (naturalBenefics.includes(planetName)) {
        return 'Benefic';
    } else if (naturalMalefics.includes(planetName)) {
        return 'Malefic';
    }

    return 'Neutral';
}
