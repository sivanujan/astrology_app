/**
 * Main entry point for marriage matching
 * Provides new comprehensive analysis
 */

import { analyzeComprehensiveMarriageMatch, ComprehensiveMatchResult } from './gurujiMarriageRules';
import { calculatePlanetaryPositions } from './astrology';

/**
 * Person data structure for matching
 */
export interface PersonData {
    name: string;
    gender: 'male' | 'female';
    date: string;
    time: string;
    birthPlace: string;
    birthLat: number;
    birthLng: number;
    currentPlace: string;
    currentLat: number;
    currentLng: number;
}

/**
 * Analyze marriage compatibility using NEW comprehensive Aditya Guruji rules
 * This is the recommended method with all 7 rules implemented
 */
export async function analyzeMarriageMatchingNew(
    boy: PersonData,
    girl: PersonData
): Promise<ComprehensiveMatchResult> {
    try {
        console.log('Starting comprehensive marriage matching...', { boy, girl });

        // Generate charts
        const boyChart = generateChartForMatching(boy);
        const girlChart = generateChartForMatching(girl);

        console.log('Charts generated:', { boyChart, girlChart });

        // Use new comprehensive analysis
        const result = analyzeComprehensiveMarriageMatch(boyChart, girlChart, new Date());

        console.log('Comprehensive result:', result);

        // Attach charts to result for display
        return {
            ...result,
            boyChart,
            girlChart
        };
    } catch (error) {
        console.error('Error in analyzeMarriageMatchingNew:', error);
        throw error;
    }
}

/**
 * Helper: Generate chart from person data
 */
function generateChartForMatching(person: PersonData) {
    const birthDate = new Date(`${person.date}T${person.time}`);
    const chart = calculatePlanetaryPositions(birthDate, person.birthLat, person.birthLng);

    return {
        ...chart,
        birthDate, // Add for Dasha calculation
        planets: chart.planets || [] // Ensure planets array exists
    };
}

// Export types
export type { ComprehensiveMatchResult } from './gurujiMarriageRules';
