import { ChartData } from './astrology';

/**
 * Vedic Aspect Rules:
 * - All planets aspect the 7th house from their position
 * - Mars aspects 4th & 8th houses from its position
 * - Jupiter aspects 5th & 9th houses from its position
 * - Saturn aspects 3rd & 10th houses from its position
 * - Rahu/Ketu aspect 5th & 9th houses from their position
 */

export interface AspectResult {
    planet: string;
    aspectType: 'full' | 'special';
    strength: number;
    fromHouse: number;
    toHouse: number;
}

/**
 * Get the house number where a planet is located
 */
function getPlanetHouse(chart: ChartData, planetName: string): number {
    const planet = chart.planets.find(p => p.name === planetName);
    if (!planet) return 0;

    // Calculate house based on planet longitude and ascendant
    const ascendantLongitude = getLongitudeFromSign(chart.ascendant);
    let houseNumber = Math.floor((planet.longitude - ascendantLongitude + 360) % 360 / 30) + 1;

    return houseNumber;
}

/**
 * Helper to get longitude from sign name
 */
function getLongitudeFromSign(signName: string): number {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const index = signs.indexOf(signName);
    return index >= 0 ? index * 30 : 0;
}

/**
 * Get all planets aspecting a specific house number
 */
export function getPlanetsAspectingHouse(
    chart: ChartData,
    targetHouseNumber: number
): AspectResult[] {
    const aspects: AspectResult[] = [];
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    planets.forEach(planetName => {
        const planetHouse = getPlanetHouse(chart, planetName);
        if (planetHouse === 0) return; // Planet not found

        // Normal 7th house aspect (all planets)
        const seventhHouse = (planetHouse + 6) % 12 + (planetHouse + 6 > 12 ? 0 : 0);
        const normalSeventhHouse = ((planetHouse - 1 + 6) % 12) + 1;

        if (normalSeventhHouse === targetHouseNumber) {
            aspects.push({
                planet: planetName,
                aspectType: 'full',
                strength: 1.0,
                fromHouse: planetHouse,
                toHouse: targetHouseNumber
            });
        }

        // Special aspects
        const specialAspects = getSpecialAspects(planetName, planetHouse);
        specialAspects.forEach(aspectHouse => {
            if (aspectHouse === targetHouseNumber) {
                aspects.push({
                    planet: planetName,
                    aspectType: 'special',
                    strength: 0.75,
                    fromHouse: planetHouse,
                    toHouse: targetHouseNumber
                });
            }
        });
    });

    return aspects;
}

/**
 * Get special aspects for specific planets
 */
function getSpecialAspects(planetName: string, fromHouse: number): number[] {
    const aspects: number[] = [];

    switch (planetName) {
        case 'Mars':
            // Mars aspects 4th and 8th from its position
            aspects.push(((fromHouse - 1 + 3) % 12) + 1); // 4th house
            aspects.push(((fromHouse - 1 + 7) % 12) + 1); // 8th house
            break;

        case 'Jupiter':
            // Jupiter aspects 5th and 9th from its position
            aspects.push(((fromHouse - 1 + 4) % 12) + 1); // 5th house
            aspects.push(((fromHouse - 1 + 8) % 12) + 1); // 9th house
            break;

        case 'Saturn':
            // Saturn aspects 3rd and 10th from its position
            aspects.push(((fromHouse - 1 + 2) % 12) + 1); // 3rd house
            aspects.push(((fromHouse - 1 + 9) % 12) + 1); // 10th house
            break;

        case 'Rahu':
        case 'Ketu':
            // Rahu/Ketu aspect 5th and 9th from their position
            aspects.push(((fromHouse - 1 + 4) % 12) + 1); // 5th house
            aspects.push(((fromHouse - 1 + 8) % 12) + 1); // 9th house
            break;
    }

    return aspects;
}

/**
 * Get all planets aspecting the Lagna (1st house)
 */
export function getPlanetsAspectingLagna(chart: ChartData): AspectResult[] {
    return getPlanetsAspectingHouse(chart, 1);
}

/**
 * Get all planets aspecting Rasi (Moon sign house)
 */
export function getPlanetsAspectingRasi(chart: ChartData): AspectResult[] {
    const moonHouse = getPlanetHouse(chart, 'Moon');
    if (moonHouse === 0) return [];

    return getPlanetsAspectingHouse(chart, moonHouse);
}

/**
 * Classify planet as benefic or malefic
 */
export function isBenefic(planetName: string): boolean {
    // Benefics: Jupiter, Venus, Mercury (when alone), bright Moon
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    return benefics.includes(planetName);
}

export function isMalefic(planetName: string): boolean {
    // Malefics: Saturn, Mars, Rahu, Ketu, Sun
    const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];
    return malefics.includes(planetName);
}

/**
 * Analyze Subathuvam (benefic) vs Pavathuvam (malefic) nature
 * based on planetary aspects
 */
export interface ChartNatureAnalysis {
    lagnaAspects: {
        benefics: string[];
        malefics: string[];
        nature: 'Soft' | 'Tough' | 'Balanced';
        description: string;
    };
    rasiAspects: {
        benefics: string[];
        malefics: string[];
        nature: 'Soft' | 'Tough' | 'Balanced';
        description: string;
    };
    overallNature: 'Subathuvam' | 'Pavathuvam' | 'Mixed';
    personalityType: string;
}

export function analyzeChartNature(chart: ChartData): ChartNatureAnalysis {
    // Analyze Lagna aspects
    const lagnaAspects = getPlanetsAspectingLagna(chart);
    const lagnaBenefics = lagnaAspects.filter(a => isBenefic(a.planet)).map(a => a.planet);
    const lagnaMalefics = lagnaAspects.filter(a => isMalefic(a.planet)).map(a => a.planet);

    // Analyze Rasi aspects
    const rasiAspects = getPlanetsAspectingRasi(chart);
    const rasiBenefics = rasiAspects.filter(a => isBenefic(a.planet)).map(a => a.planet);
    const rasiMalefics = rasiAspects.filter(a => isMalefic(a.planet)).map(a => a.planet);

    // Determine Lagna nature
    const lagnaNature = determinNature(lagnaBenefics.length, lagnaMalefics.length);
    const lagnaDescription = getNatureDescription(lagnaNature, lagnaBenefics, lagnaMalefics);

    // Determine Rasi nature
    const rasiNature = determinNature(rasiBenefics.length, rasiMalefics.length);
    const rasiDescription = getNatureDescription(rasiNature, rasiBenefics, rasiMalefics);

    // Overall nature (weighted: Lagna slightly more important)
    let overallNature: 'Subathuvam' | 'Pavathuvam' | 'Mixed';
    if (lagnaNature === 'Soft' && rasiNature === 'Soft') {
        overallNature = 'Subathuvam';
    } else if (lagnaNature === 'Tough' && rasiNature === 'Tough') {
        overallNature = 'Pavathuvam';
    } else if (lagnaNature === 'Soft' || rasiNature === 'Soft') {
        overallNature = lagnaNature === 'Soft' ? 'Subathuvam' : 'Mixed';
    } else if (lagnaNature === 'Tough' || rasiNature === 'Tough') {
        overallNature = lagnaNature === 'Tough' ? 'Pavathuvam' : 'Mixed';
    } else {
        overallNature = 'Mixed';
    }

    // Personality type description
    const personalityType = getPersonalityType(overallNature, lagnaNature, rasiNature);

    return {
        lagnaAspects: {
            benefics: lagnaBenefics,
            malefics: lagnaMalefics,
            nature: lagnaNature,
            description: lagnaDescription
        },
        rasiAspects: {
            benefics: rasiBenefics,
            malefics: rasiMalefics,
            nature: rasiNature,
            description: rasiDescription
        },
        overallNature,
        personalityType
    };
}

function determinNature(beneficCount: number, maleficCount: number): 'Soft' | 'Tough' | 'Balanced' {
    if (beneficCount > maleficCount) return 'Soft';
    if (maleficCount > beneficCount) return 'Tough';
    return 'Balanced';
}

function getNatureDescription(
    nature: 'Soft' | 'Tough' | 'Balanced',
    benefics: string[],
    malefics: string[]
): string {
    if (nature === 'Soft') {
        return `Gentle, kind nature. Aspected by benefics: ${benefics.join(', ')}`;
    } else if (nature === 'Tough') {
        return `Strong, resilient nature. Aspected by malefics: ${malefics.join(', ')}`;
    } else {
        return `Balanced nature with mixed influences`;
    }
}

function getPersonalityType(
    overall: 'Subathuvam' | 'Pavathuvam' | 'Mixed',
    lagna: 'Soft' | 'Tough' | 'Balanced',
    rasi: 'Soft' | 'Tough' | 'Balanced'
): string {
    if (overall === 'Subathuvam') {
        return 'மென்மையான குணம் - Gentle, kind, righteous, easily trusting';
    } else if (overall === 'Pavathuvam') {
        return 'கடுமையான குணம் - Tough, resilient, practical, street-smart';
    } else {
        return 'சமநிலை - Balanced personality with both soft and tough qualities';
    }
}
