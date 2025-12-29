/**
 * Planetary Relationships - Conjunctions and Aspects
 * 
 * Calculates which planets are conjunct or aspecting each other
 */

import { PlanetConjunction, PlanetAspect } from '../types/enhancedDasaTypes';

export interface PlanetPosition {
    name: string;
    sign: string;
    house: number;
    degree: number;
}

/**
 * Calculate conjunctions for a planet
 * Planets in the same house are considered conjunct
 * Close conjunction within 5° is marked specially
 */
export function getConjunctions(
    planet: PlanetPosition,
    allPlanets: PlanetPosition[]
): PlanetConjunction[] {
    const conjunctions: PlanetConjunction[] = [];

    for (const otherPlanet of allPlanets) {
        // Skip self
        if (otherPlanet.name === planet.name) continue;

        // Check if in same house
        if (otherPlanet.house === planet.house) {
            // Calculate degree difference
            const degreeDiff = Math.abs(planet.degree - otherPlanet.degree);
            const isDegreeClose = degreeDiff <= 5;

            // Determine effect based on planets involved
            const effect = determineConjunctionEffect(planet.name, otherPlanet.name);

            conjunctions.push({
                planet: otherPlanet.name,
                house: planet.house,
                isDegreeClose,
                effect,
            });
        }
    }

    return conjunctions;
}

/**
 * Determine if conjunction is benefic or malefic
 */
function determineConjunctionEffect(
    planet1: string,
    planet2: string
): 'Benefic' | 'Malefic' | 'Neutral' {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

    const planet1Benefic = benefics.includes(planet1);
    const planet2Benefic = benefics.includes(planet2);

    // Both benefic
    if (planet1Benefic && planet2Benefic) {
        return 'Benefic';
    }

    // Both malefic
    if (malefics.includes(planet1) && malefics.includes(planet2)) {
        return 'Malefic';
    }

    // Mixed
    return 'Neutral';
}

/**
 * Calculate aspects for a planet
 * All planets have 7th house aspect
 * Mars aspects 4th and 8th from itself
 * Jupiter aspects 5th and 9th from itself
 * Saturn aspects 3rd and 10th from itself
 */
export function getAspects(
    planet: PlanetPosition,
    allPlanets: PlanetPosition[]
): PlanetAspect[] {
    const aspects: PlanetAspect[] = [];

    // Get aspect houses for this planet
    const aspectHouses = getAspectHouses(planet.name, planet.house);

    // Check each other planet
    for (const otherPlanet of allPlanets) {
        if (otherPlanet.name === planet.name) continue;

        // Check if this planet aspects the other planet's house
        if (aspectHouses.includes(otherPlanet.house)) {
            const aspectType = getAspectType(planet.name, planet.house, otherPlanet.house);
            const strength = calculateAspectStrength(planet.name, planet.house, otherPlanet.house);

            aspects.push({
                planet: otherPlanet.name,
                fromHouse: planet.house,
                aspectType,
                strength,
            });
        }
    }

    return aspects;
}

/**
 * Get houses that a planet aspects
 */
function getAspectHouses(planetName: string, fromHouse: number): number[] {
    const aspectHouses: number[] = [];

    // All planets have 7th aspect
    const seventhHouse = ((fromHouse + 6) % 12) + 1;
    aspectHouses.push(seventhHouse);

    // Special aspects
    if (planetName === 'Mars') {
        // 4th and 8th aspects
        const fourthHouse = ((fromHouse + 3) % 12) + 1;
        const eighthHouse = ((fromHouse + 7) % 12) + 1;
        aspectHouses.push(fourthHouse, eighthHouse);
    } else if (planetName === 'Jupiter') {
        // 5th and 9th aspects
        const fifthHouse = ((fromHouse + 4) % 12) + 1;
        const ninthHouse = ((fromHouse + 8) % 12) + 1;
        aspectHouses.push(fifthHouse, ninthHouse);
    } else if (planetName === 'Saturn') {
        // 3rd and 10th aspects
        const thirdHouse = ((fromHouse + 2) % 12) + 1;
        const tenthHouse = ((fromHouse + 9) % 12) + 1;
        aspectHouses.push(thirdHouse, tenthHouse);
    }

    return aspectHouses;
}

/**
 * Get aspect type description
 */
function getAspectType(planetName: string, fromHouse: number, toHouse: number): string {
    const houseDiff = (toHouse - fromHouse + 12) % 12;

    if (houseDiff === 6) {
        return '7th aspect (opposition)';
    } else if (houseDiff === 3 && planetName === 'Mars') {
        return '4th aspect (Mars special)';
    } else if (houseDiff === 7 && planetName === 'Mars') {
        return '8th aspect (Mars special)';
    } else if (houseDiff === 4 && planetName === 'Jupiter') {
        return '5th aspect (Jupiter special)';
    } else if (houseDiff === 8 && planetName === 'Jupiter') {
        return '9th aspect (Jupiter special)';
    } else if (houseDiff === 2 && planetName === 'Saturn') {
        return '3rd aspect (Saturn special)';
    } else if (houseDiff === 9 && planetName === 'Saturn') {
        return '10th aspect (Saturn special)';
    }

    return `${houseDiff + 1}th aspect`;
}

/**
 * Calculate aspect strength (0-100)
 */
function calculateAspectStrength(
    planetName: string,
    fromHouse: number,
    toHouse: number
): number {
    const houseDiff = (toHouse - fromHouse + 12) % 12;

    // 7th aspect is full strength
    if (houseDiff === 6) {
        return 100;
    }

    // Special aspects are also full strength
    if ((planetName === 'Mars' && (houseDiff === 3 || houseDiff === 7)) ||
        (planetName === 'Jupiter' && (houseDiff === 4 || houseDiff === 8)) ||
        (planetName === 'Saturn' && (houseDiff === 2 || houseDiff === 9))) {
        return 100;
    }

    // Other aspects (Rasi Drishti) have partial strength
    return 50;
}

/**
 * Find aspects TO a planet (who is aspecting this planet)
 */
export function getAspectedBy(
    planet: PlanetPosition,
    allPlanets: PlanetPosition[]
): PlanetAspect[] {
    const aspectingPlanets: PlanetAspect[] = [];

    for (const otherPlanet of allPlanets) {
        if (otherPlanet.name === planet.name) continue;

        const aspectHouses = getAspectHouses(otherPlanet.name, otherPlanet.house);

        if (aspectHouses.includes(planet.house)) {
            const aspectType = getAspectType(otherPlanet.name, otherPlanet.house, planet.house);
            const strength = calculateAspectStrength(otherPlanet.name, otherPlanet.house, planet.house);

            aspectingPlanets.push({
                planet: otherPlanet.name,
                fromHouse: otherPlanet.house,
                aspectType,
                strength,
            });
        }
    }

    return aspectingPlanets;
}

/**
 * Calculate house relationship between two planets
 * Example: "3rd from", "11th from", "same house"
 */
export function getHouseRelationship(
    planet1House: number,
    planet2House: number
): string {
    if (planet1House === planet2House) {
        return 'same house';
    }

    const diff = (planet2House - planet1House + 12) % 12;

    if (diff === 0) {
        return 'same house';
    }

    const houseNames = [
        '1st', '2nd', '3rd', '4th', '5th', '6th',
        '7th', '8th', '9th', '10th', '11th', '12th'
    ];

    return `${houseNames[diff]} from`;
}
