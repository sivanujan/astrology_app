import { ChartData, calculateDashaPeriods, getCurrentDasha } from './astrology';

/**
 * Enhanced Dasa-Bhukti Prediction System for Guruji Marriage Matching
 * Includes: 6-8 relationship check, separative dasa detection, and 10-year forecast
 */

// Vimshottari Dasa periods (in years)
const DASA_PERIODS: Record<string, number> = {
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17,
    'Ketu': 7,
    'Venus': 20
};

const DASA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

export interface DasaPeriod {
    planet: string;
    startDate: Date;
    endDate: Date;
    antarDasas: AnterDasaPeriod[];
}

export interface AnterDasaPeriod {
    planet: string;
    startDate: Date;
    endDate: Date;
}

export interface YearlyDasaForecast {
    year: number;
    groom: {
        mahaDasa: string;
        antarDasa: string;
        nature: 'Favorable' | 'Neutral' | 'Unfavorable';
        effects: string[];
        houseRuled: number;
    };
    bride: {
        mahaDasa: string;
        antarDasa: string;
        nature: 'Favorable' | 'Neutral' | 'Unfavorable';
        effects: string[];
        houseRuled: number;
    };
    combinedAssessment: 'Harmonious' | 'Challenging' | 'Critical';
    sixEightProblem: boolean;
    separationRisk: 'None' | 'Low' | 'Medium' | 'High';
    specificIssues: string[];
}

export interface SeparativeDasaWarning {
    hasSeparativeDasa: boolean;
    whenOccurs: number;  // year number
    dasaLord: string;
    reason: string;
    severity: 'Critical' | 'High' | 'Medium';
    autoReject: boolean;  // TRUE if within 2-5 years for bride
}

/**
 * Calculate current Maha Dasa based on Moon position at birth
 */
export function getCurrentMahaDasa(birthChart: ChartData, birthDate: Date): DasaPeriod | null {
    const moon = birthChart.planets.find(p => p.name === 'Moon');
    if (!moon) return null;

    // Calculate which nakshatra Moon is in (simplified - needs proper calculation)
    const nakshatraLord = getNakshatraLord(moon.longitude);

    // Find current Dasa
    return calculateDasaFrom(nakshatraLord, birthDate);
}

/**
 * Get Nakshatra lord based on Moon's longitude
 */
function getNakshatraLord(moonLongitude: number): string {
    const nakshatraLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const nakshatraIndex = Math.floor(moonLongitude / 13.333333); // 27 nakshatras
    return nakshatraLords[nakshatraIndex % 9];
}

/**
 * Calculate Dasa period from a starting planet
 */
function calculateDasaFrom(startPlanet: string, birthDate: Date): DasaPeriod {
    const startIndex = DASA_SEQUENCE.indexOf(startPlanet);
    const years = DASA_PERIODS[startPlanet];

    const start = new Date(birthDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + years);

    // Calculate Antar Dasas (simplified)
    const antarDasas: AnterDasaPeriod[] = [];
    let currentDate = new Date(start);

    DASA_SEQUENCE.forEach(planet => {
        const antarYears = (DASA_PERIODS[planet] / 120) * years;
        const antarEnd = new Date(currentDate);
        antarEnd.setDate(antarEnd.getDate() + (antarYears * 365.25));

        antarDasas.push({
            planet,
            startDate: new Date(currentDate),
            endDate: new Date(antarEnd)
        });

        currentDate = new Date(antarEnd);
    });

    return {
        planet: startPlanet,
        startDate: start,
        endDate: end,
        antarDasas
    };
}

/**
 * Check if two planets have 6-8 relationship in the chart
 */
export function check6to8Relationship(
    planet1: string,
    planet2: string,
    chart: ChartData
): {
    is6to8: boolean;
    relationship: '6th' | '8th' | 'safe';
    details: string;
} {
    // Get house positions of both planets
    const p1House = getPlanetHouse(chart, planet1);
    const p2House = getPlanetHouse(chart, planet2);

    if (p1House === 0 || p2House === 0) {
        return { is6to8: false, relationship: 'safe', details: 'Planet not found' };
    }

    // Calculate distance
    const distance1to2 = (p2House - p1House + 12) % 12;
    const distance2to1 = (p1House - p2House + 12) % 12;

    if (distance1to2 === 6 || distance1to2 === 8) {
        return {
            is6to8: true,
            relationship: distance1to2 === 6 ? '6th' : '8th',
            details: `${planet1} to ${planet2} is ${distance1to2}th house relationship`
        };
    }

    if (distance2to1 === 6 || distance2to1 === 8) {
        return {
            is6to8: true,
            relationship: distance2to1 === 6 ? '6th' : '8th',
            details: `${planet2} to ${planet1} is ${distance2to1}th house relationship`
        };
    }

    return { is6to8: false, relationship: 'safe', details: 'No 6-8 relationship' };
}

function getPlanetHouse(chart: ChartData, planetName: string): number {
    const planet = chart.planets.find(p => p.name === planetName);
    if (!planet) return 0;

    // Simple house calculation
    const ascendantDegree = getSignDegree(chart.ascendant);
    const houseNumber = Math.floor((planet.longitude - ascendantDegree + 360) % 360 / 30) + 1;
    return houseNumber;
}

function getSignDegree(signName: string): number {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs.indexOf(signName) * 30;
}

/**
 * Detect separative Dasa (ரத்து தசை) periods
 */
export function detectSeparativeDasa(
    chart: ChartData,
    birthDate: Date,
    gender: 'boy' | 'girl',
    yearsToCheck: number = 10
): SeparativeDasaWarning[] {
    const warnings: SeparativeDasaWarning[] = [];
    let currentDate = new Date();

    // Get Dasa sequence for next 10 years
    for (let year = 1; year <= yearsToCheck; year++) {
        const futureDate = new Date(currentDate);
        futureDate.setFullYear(futureDate.getFullYear() + year);

        const dasa = getCurrentDasaAtDate(chart, birthDate, futureDate);
        if (!dasa) continue;

        // Check if this is a separative Dasa
        const isSeparative = isSeparativeDasaPlanet(dasa.planet, chart);

        if (isSeparative) {
            // For BRIDE, auto-reject if within 2-5 years
            const autoReject = gender === 'girl' && year >= 2 && year <= 5;

            warnings.push({
                hasSeparativeDasa: true,
                whenOccurs: year,
                dasaLord: dasa.planet,
                reason: getSeparativeDasaReason(dasa.planet, chart),
                severity: year <= 3 ? 'Critical' : year <= 5 ? 'High' : 'Medium',
                autoReject
            });
        }
    }

    return warnings;
}

function getCurrentDasaAtDate(chart: ChartData, birthDate: Date, targetDate: Date): { planet: string } | null {
    // Simplified - get current Maha Dasa at target date
    const moon = chart.planets.find(p => p.name === 'Moon');
    if (!moon) return null;

    const nakshatraLord = getNakshatraLord(moon.longitude);

    // Calculate years since birth
    const yearsSinceBirth = (targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    // Find which Dasa we're in
    let totalYears = 0;
    let currentPlanetIndex = DASA_SEQUENCE.indexOf(nakshatraLord);

    while (totalYears < yearsSinceBirth) {
        const planet = DASA_SEQUENCE[currentPlanetIndex % 9];
        totalYears += DASA_PERIODS[planet];

        if (totalYears > yearsSinceBirth) {
            return { planet };
        }

        currentPlanetIndex++;
    }

    return null;
}

/**
 * Check if a Dasa planet is separative
 */
function isSeparativeDasaPlanet(planet: string, chart: ChartData): boolean {
    // Separative Dasa indicators:
    // 1. 6th, 8th, or 12th lord
    // 2. Rahu/Ketu with afflictions
    // 3. Saturn if it's a maraka or 6/8 lord

    const house = getPlanetHouse(chart, planet);

    // Always separative: Rahu, Ketu if afflicted
    if (planet === 'Rahu' || planet === 'Ketu') {
        return house === 6 || house === 8 || house === 12;
    }

    // Saturn in difficult houses
    if (planet === 'Saturn') {
        return house === 6 || house === 8 || house === 12 || house === 2 || house === 7;
    }

    // Check if planet rules 6th, 8th, or 12th house (simplified)
    return house === 6 || house === 8 || house === 12;
}

function getSeparativeDasaReason(planet: string, chart: ChartData): string {
    const house = getPlanetHouse(chart, planet);

    if (planet === 'Rahu') {
        return `Rahu Dasa in ${house}th house - Causes unexpected separations and foreign influences`;
    } else if (planet === 'Ketu') {
        return `Ketu Dasa - Causes detachment and spiritual pursuits leading to physical separation`;
    } else if (planet === 'Saturn' && (house === 6 || house === 8)) {
        return `Saturn Dasa as ${house === 6 ? '6th' : '8th'} house influence - Major obstacles and separations`;
    } else if (house === 12) {
        return `${planet} Dasa ruling 12th house - Foreign settlement/separation from family`;
    } else if (house === 8) {
        return `${planet} Dasa ruling 8th house - Transformations and sudden changes causing separation`;
    } else if (house === 6) {
        return `${planet} Dasa ruling 6th house - Disputes, enemies, and separation`;
    }

    return `${planet} Dasa has separative tendencies`;
}

/**
 * Generate complete 10-year Dasa-Bhukti forecast using WORKING existing functions
 */
export function generate10YearForecast(
    boyChart: ChartData,
    girlChart: ChartData,
    boyBirthDate: Date,
    girlBirthDate: Date
): YearlyDasaForecast[] {
    const forecast: YearlyDasaForecast[] = [];
    const currentDate = new Date();

    // Get Moon positions to calculate Dasa periods
    const boyMoon = boyChart.planets.find((p: any) => p.name === 'Moon');
    const girlMoon = girlChart.planets.find((p: any) => p.name === 'Moon');

    if (!boyMoon || !girlMoon) {
        console.error('Moon not found in charts');
        return [];
    }

    // Calculate Dasa periods using the WORKING existing function
    const boyDasaPeriods = calculateDashaPeriods(boyBirthDate, boyMoon.longitude);
    const girlDasaPeriods = calculateDashaPeriods(girlBirthDate, girlMoon.longitude);

    for (let year = 1; year <= 10; year++) {
        const futureDate = new Date(currentDate);
        futureDate.setFullYear(futureDate.getFullYear() + year);

        // Get Dasa at future date using WORKING existing function
        const boyDasa = getCurrentDasha(boyDasaPeriods, futureDate);
        const girlDasa = getCurrentDasha(girlDasaPeriods, futureDate);

        if (!boyDasa || !girlDasa || !boyDasa.maha || !girlDasa.maha) {
            console.warn(`Unable to calculate Dasa for year ${year}`);
            continue;
        }

        // Analyze each Dasa's nature
        const boyAnalysis = analyzeDasaPeriod(boyDasa.maha.planet, boyChart);
        const girlAnalysis = analyzeDasaPeriod(girlDasa.maha.planet, girlChart);

        // Check 6-8 relationship between Maha Dasas
        const sixEight = check6to8Relationship(boyDasa.maha.planet, girlDasa.maha.planet, boyChart);

        // Combined assessment
        const combinedAssessment = getCombinedAssessment(
            boyAnalysis.nature,
            girlAnalysis.nature,
            sixEight.is6to8
        );

        // Separation risk
        const separationRisk = getSeparationRisk(
            boyAnalysis.nature,
            girlAnalysis.nature,
            sixEight.is6to8,
            isSeparativeDasaPlanet(boyDasa.maha.planet, boyChart),
            isSeparativeDasaPlanet(girlDasa.maha.planet, girlChart)
        );

        // Specific issues
        const specificIssues: string[] = [];
        if (sixEight.is6to8) specificIssues.push('6-8 Dasa relationship - Ego clashes');
        if (isSeparativeDasaPlanet(boyDasa.maha.planet, boyChart)) specificIssues.push('Groom in separative Dasa');
        if (isSeparativeDasaPlanet(girlDasa.maha.planet, girlChart)) specificIssues.push('Bride in separative Dasa');
        if (boyAnalysis.nature === 'Unfavorable' && girlAnalysis.nature === 'Unfavorable') specificIssues.push('Both in difficult periods');

        forecast.push({
            year,
            groom: {
                mahaDasa: boyDasa.maha.planet,
                antarDasa: boyDasa.bhukti?.planet || 'Unknown',
                nature: boyAnalysis.nature,
                effects: boyAnalysis.effects,
                houseRuled: boyAnalysis.houseRuled
            },
            bride: {
                mahaDasa: girlDasa.maha.planet,
                antarDasa: girlDasa.bhukti?.planet || 'Unknown',
                nature: girlAnalysis.nature,
                effects: girlAnalysis.effects,
                houseRuled: girlAnalysis.houseRuled
            },
            combinedAssessment,
            sixEightProblem: sixEight.is6to8,
            separationRisk,
            specificIssues
        });
    }

    return forecast;
}

function analyzeDasaPeriod(planet: string, chart: ChartData): {
    nature: 'Favorable' | 'Neutral' | 'Unfavorable';
    effects: string[];
    houseRuled: number;
} {
    const house = getPlanetHouse(chart, planet);
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const isBenefic = benefics.includes(planet);

    //Determine nature
    let nature: 'Favorable' | 'Neutral' | 'Unfavorable';
    const effects: string[] = [];

    if (isBenefic && (house === 1 || house === 5 || house === 9 || house === 10)) {
        nature = 'Favorable';
        effects.push('Good progress', 'Happiness', 'Success');
    } else if (!isBenefic && (house === 6 || house === 8 || house === 12)) {
        nature = 'Unfavorable';
        effects.push('Challenges', 'Obstacles', 'Need patience');
    } else {
        nature = 'Neutral';
        effects.push('Mixed results', 'Need effort');
    }

    return { nature, effects, houseRuled: house };
}

function getCombinedAssessment(
    boyNature: string,
    girlNature: string,
    sixEight: boolean
): 'Harmonious' | 'Challenging' | 'Critical' {
    if (sixEight) return 'Critical';
    if (boyNature === 'Unfavorable' && girlNature === 'Unfavorable') return 'Critical';
    if (boyNature === 'Favorable' && girlNature === 'Favorable') return 'Harmonious';
    return 'Challenging';
}

function getSeparationRisk(
    boyNature: string,
    girlNature: string,
    sixEight: boolean,
    boySeparative: boolean,
    girlSeparative: boolean
): 'None' | 'Low' | 'Medium' | 'High' {
    if (sixEight && (boySeparative || girlSeparative)) return 'High';
    if (boySeparative && girlSeparative) return 'High';
    if (sixEight) return 'Medium';
    if (boySeparative || girlSeparative) return 'Medium';
    if (boyNature === 'Unfavorable' && girlNature === 'Unfavorable') return 'Low';
    return 'None';
}
