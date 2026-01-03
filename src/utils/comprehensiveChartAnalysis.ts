/**
 * Comprehensive Chart Analysis - Main Integration
 * 
 * This utility integrates all Phase 1 components to gather
 * complete chart data for comprehensive predictions
 */

import { ComprehensiveChartData, PlanetDetails, HouseLord, DasaTimeline } from '../types/enhancedDasaTypes';
import { calculatePlanetDignity, getNaturalFriendship, getTemporalFriendship, getCombinedFriendship } from './planetDignity';
import { getNakshatra } from './nakshatraCalculator';
import { getConjunctions, getAspectedBy, getHouseRelationship, PlanetPosition } from './planetaryRelationships';
import { detectAllYogas } from './yogaDetection';
import { analyzeComprehensiveSubathuvam } from './comprehensiveSubathuvam';
import { getCurrentTransits } from './transitCalculator';

/**
 * Main function to gather all comprehensive chart data
 * This is the entry point that brings together all Phase 1 utilities
 */
export function gatherComprehensiveChartData(
    birthDetails: any,
    planets: any[],
    houses: any[],
    dasaPeriod: any,
    bhuktiPeriod: any,
    nextBhuktiPeriod?: any
): ComprehensiveChartData {

    // Convert to PlanetPosition format
    const planetPositions: PlanetPosition[] = planets.map(p => ({
        name: p.planet,
        sign: p.sign,
        house: p.house,
        degree: p.longitude % 30, // Degree within sign
    }));

    // Get Dasa lord details
    const dasaLord = getPlanetDetails(dasaPeriod.planet, planetPositions);

    // Get Bhukti lord details
    const bhuktiLord = getPlanetDetails(bhuktiPeriod.planet, planetPositions);

    // Get Next Bhukti lord details (if exists)
    const nextBhuktiLord = nextBhuktiPeriod
        ? getPlanetDetails(nextBhuktiPeriod.planet, planetPositions)
        : undefined;

    // Get all house lords
    const allHouseLords = getAllHouseLords(planets, houses);

    // Detect yogas
    const ascendant = houses.find(h => h.house === 1);
    const yogas = detectAllYogas(planetPositions, ascendant?.sign || 'Aries');

    // Get current transits
    const birthChartMap = new Map(
        planetPositions.map(p => [p.name, { sign: p.sign, house: p.house }])
    );
    const currentTransits = getCurrentTransits(birthChartMap);

    // Analyze Subathuvam
    const conjunctionsMap = new Map<string, string[]>();
    const aspectsMap = new Map<string, string[]>();

    for (const planet of planetPositions) {
        const conjunctions = getConjunctions(planet, planetPositions);
        const aspects = getAspectedBy(planet, planetPositions);

        conjunctionsMap.set(planet.name, conjunctions.map(c => c.planet));
        aspectsMap.set(planet.name, aspects.map(a => a.planet));
    }

    const subathuvamAnalysis = analyzeComprehensiveSubathuvam(
        planetPositions,
        ascendant?.sign || 'Aries',
        conjunctionsMap,
        aspectsMap
    );

    // Calculate planetary relationships
    const planetaryRelationships = {
        dasaBhukti: getHouseRelationship(dasaLord.house, bhuktiLord.house),
        dasaNextBhukti: nextBhuktiLord
            ? getHouseRelationship(dasaLord.house, nextBhuktiLord.house)
            : undefined,
        bhuktiNextBhukti: nextBhuktiLord
            ? getHouseRelationship(bhuktiLord.house, nextBhuktiLord.house)
            : undefined,
        naturalFriendship: getNaturalFriendship(dasaLord.name, bhuktiLord.name),
        temporalFriendship: getTemporalFriendship(dasaLord.house, bhuktiLord.house),
    };

    // Build timeline
    const dasaTimeline: DasaTimeline = {
        mahaDasa: {
            planet: dasaPeriod.planet,
            startDate: new Date(dasaPeriod.start),
            endDate: new Date(dasaPeriod.end),
        },
        currentBhukti: {
            planet: bhuktiPeriod.planet,
            startDate: new Date(bhuktiPeriod.start),
            endDate: new Date(bhuktiPeriod.end),
            durationMonths: calculateMonthsDuration(bhuktiPeriod.start, bhuktiPeriod.end),
        },
        nextBhukti: nextBhuktiPeriod ? {
            planet: nextBhuktiPeriod.planet,
            startDate: new Date(nextBhuktiPeriod.start),
            endDate: new Date(nextBhuktiPeriod.end),
            durationMonths: calculateMonthsDuration(nextBhuktiPeriod.start, nextBhuktiPeriod.end),
        } : undefined,
    };

    return {
        birthDetails: {
            name: birthDetails.name || '',
            dateOfBirth: new Date(birthDetails.dateOfBirth),
            timeOfBirth: birthDetails.timeOfBirth || '',
            placeOfBirth: birthDetails.placeOfBirth || '',
            latitude: birthDetails.latitude || 0,
            longitude: birthDetails.longitude || 0,
        },
        ascendant: {
            sign: ascendant?.sign || 'Aries',
            degree: ascendant?.longitude || 0,
            lord: ascendant?.lord || 'Mars',
            lordHouse: planets.find(p => p.planet === ascendant?.lord)?.house || 1,
        },
        dasaTimeline,
        dasaLord,
        bhuktiLord,
        nextBhuktiLord,
        allHouseLords,
        yogas,
        currentTransits,
        subathuvamAnalysis,
        planetaryRelationships,
    };
}

/**
 * Get complete planet details
 */
function getPlanetDetails(planetName: string, allPlanets: PlanetPosition[]): PlanetDetails {
    const planet = allPlanets.find(p => p.name === planetName);

    if (!planet) {
        throw new Error(`Planet ${planetName} not found`);
    }

    const dignity = calculatePlanetDignity(planet.name, planet.sign, planet.degree);
    const nakshatra = getNakshatra(planet.sign, planet.degree);
    const conjunctions = getConjunctions(planet, allPlanets);
    const aspects = getAspectedBy(planet, allPlanets);

    // Determine house rulership (simplified - should come from chart data)
    const rulesHouses = getHouseRulership(planet.name);

    return {
        name: planet.name,
        sign: planet.sign,
        house: planet.house,
        degree: planet.degree,
        retrograde: false, // Should come from actual chart data
        dignity,
        nakshatra: nakshatra.name,
        nakshatraPada: nakshatra.pada,
        nakshatraLord: nakshatra.lord,
        rulesHouses,
        conjunctions,
        aspects,
        subathuvamScore: 50, // Will be calculated by Subathuvam analyzer
        subathuvamStatus: 'Neutral',
        subathuvamReason: '',
    };
}

/**
 * Get house rulership for a planet
 */
function getHouseRulership(planet: string): number[] {
    const rulership: Record<string, number[]> = {
        'Sun': [5],
        'Moon': [4],
        'Mars': [1, 8],
        'Mercury': [3, 6],
        'Jupiter': [9, 12],
        'Venus': [2, 7],
        'Saturn': [10, 11],
        'Rahu': [],
        'Ketu': [],
    };

    return rulership[planet] || [];
}

/**
 * Get all 12 house lords
 */
function getAllHouseLords(planets: any[], houses: any[]): HouseLord[] {
    const houseLords: HouseLord[] = [];

    for (let i = 1; i <= 12; i++) {
        const house = houses.find(h => h.house === i);
        if (!house) continue;

        const lord = house.lord;
        const lordPlanet = planets.find(p => p.planet === lord);

        if (lordPlanet) {
            const dignity = calculatePlanetDignity(lord, lordPlanet.sign, lordPlanet.longitude % 30);

            houseLords.push({
                houseNumber: i,
                lord,
                lordSign: lordPlanet.sign,
                lordHouse: lordPlanet.house,
                lordDignity: dignity,
            });
        }
    }

    return houseLords;
}

/**
 * Calculate duration in months
 */
function calculateMonthsDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

    return months;
}
