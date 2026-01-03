import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';
import { calculateHouseSubathuvamPavathuvam } from './subathuvam';
import { calculateDashaPeriods, getCurrentDasha, DashaPeriod } from './astrology';

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface LongevityAnalysis {
    score: number; // 0-100
    category: 'SHORT' | 'MEDIUM' | 'LONG';
    categoryTamil: string;
    lifespan: string;
    lifespanTamil: string;
    factors: {
        lagna: { score: number; verdict: string; details: string };
        eighthHouse: { score: number; verdict: string; details: string };
        saturn: { score: number; verdict: string; details: string };
    };
    verdict: string;
    verdictTamil: string;
}

export interface DangerousDasa {
    planet: string;
    role: string;
    roleTamil: string;
    severity: 'MEDIUM' | 'HIGH' | 'VERY HIGH' | 'EXTREME';
    reason: string;
    tamilReason: string;
}

export interface DeathRiskPeriod {
    period: string;
    startAge: number;
    endAge: number;
    risk: number;
    riskLevel: string;
    reason: string;
    tamilReason: string;
}

export interface DeathRiskAssessment {
    currentPeriod: {
        maha: { planet: string; risk: number };
        antar: { planet: string; risk: number };
        pratyantar: { planet: string; risk: number };
        combinedRisk: number;
        riskLevel: string;
        verdict: string;
        verdictTamil: string;
    };
    next10YearRisk: DeathRiskPeriod[];
    hasExtremeRiskIn5Years: boolean;
    hasExtremeRiskIn10Years: boolean;
}

export interface MarriageLongevityVerdict {
    longevityScore: number;
    category: 'SHORT' | 'MEDIUM' | 'LONG';
    currentRisk: number;
    futureHighRisk: boolean;
    marriageRecommendation: 'REJECT' | 'PROCEED_WITH_CAUTION' | 'PROCEED';
    reason: string;
    tamilReason: string;
    detailedAnalysis: {
        longevity: LongevityAnalysis;
        dangerousDasas: DangerousDasa[];
        deathRisk: DeathRiskAssessment;
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get sign index from sign name
 */
function getSignIndex(signName: string): number {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs.indexOf(signName);
}

/**
 * Get house lord planet for a given sign
 */
function getHouseLord(signIndex: number): string {
    const lords = [
        'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
        'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
    ];
    return lords[signIndex];
}

/**
 * Get planets in a specific house
 */
function getPlanetsInHouse(chart: any, houseNumber: number): any[] {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    const houseSign = (ascendantSign + houseNumber - 1) % 12;

    return chart.planets.filter((p: any) => {
        const planetSign = typeof p.sign === 'string' ? getSignIndex(p.sign) : p.signIndex;
        return planetSign === houseSign;
    });
}

/**
 * Check if planet is in Kendra (1, 4, 7, 10)
 */
function isInKendra(chart: any, planet: any): boolean {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    const planetSign = typeof planet.sign === 'string' ? getSignIndex(planet.sign) : planet.signIndex;
    const houseNumber = ((planetSign - ascendantSign + 12) % 12) + 1;

    return [1, 4, 7, 10].includes(houseNumber);
}

/**
 * Check if planet is in Trikona (1, 5, 9)
 */
function isInTrikona(chart: any, planet: any): boolean {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    const planetSign = typeof planet.sign === 'string' ? getSignIndex(planet.sign) : planet.signIndex;
    const houseNumber = ((planetSign - ascendantSign + 12) % 12) + 1;

    return [1, 5, 9].includes(houseNumber);
}

/**
 * Check if planet is in Upachaya (3, 6, 10, 11)
 */
function isInUpachaya(chart: any, planet: any): boolean {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    const planetSign = typeof planet.sign === 'string' ? getSignIndex(planet.sign) : planet.signIndex;
    const houseNumber = ((planetSign - ascendantSign + 12) % 12) + 1;

    return [3, 6, 10, 11].includes(houseNumber);
}

/**
 * Check if planet is in Dusthana (6, 8, 12)
 */
function isInDusthana(chart: any, planet: any): boolean {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    const planetSign = typeof planet.sign === 'string' ? getSignIndex(planet.sign) : planet.signIndex;
    const houseNumber = ((planetSign - ascendantSign + 12) % 12) + 1;

    return [6, 8, 12].includes(houseNumber);
}

/**
 * Check if planet is combust (within 8 degrees of Sun)
 */
function isCombust(planet: any, sun: any): boolean {
    if (planet.name === 'Sun') return false;
    const diff = Math.abs(planet.longitude - sun.longitude);
    return diff <= 8 || diff >= 352; // Handle wrap-around
}

/**
 * Get planet dignity score
 */
function getPlanetDignity(planet: any): { score: number; status: string } {
    // Exaltation and debilitation points
    const exaltation: Record<string, number> = {
        'Sun': 1, 'Moon': 2, 'Mars': 10, 'Mercury': 6, 'Jupiter': 4,
        'Venus': 12, 'Saturn': 7
    };

    const debilitation: Record<string, number> = {
        'Sun': 7, 'Moon': 8, 'Mars': 4, 'Mercury': 12, 'Jupiter': 10,
        'Venus': 6, 'Saturn': 1
    };

    const ownSigns: Record<string, number[]> = {
        'Sun': [5], 'Moon': [4], 'Mars': [1, 8], 'Mercury': [3, 6],
        'Jupiter': [9, 12], 'Venus': [2, 7], 'Saturn': [10, 11]
    };

    const planetSign = typeof planet.sign === 'string' ? getSignIndex(planet.sign) : planet.signIndex;

    // Check exaltation
    if (exaltation[planet.name] !== undefined && exaltation[planet.name] === planetSign + 1) {
        return { score: 100, status: 'Exalted' };
    }

    // Check debilitation
    if (debilitation[planet.name] !== undefined && debilitation[planet.name] === planetSign + 1) {
        return { score: 10, status: 'Debilitated' };
    }

    // Check own sign
    if (ownSigns[planet.name]?.includes(planetSign + 1)) {
        return { score: 80, status: 'Own Sign' };
    }

    // Check friend/enemy (simplified)
    return { score: 50, status: 'Neutral' };
}

// ═══════════════════════════════════════════════════════════════
// FACTOR CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * FACTOR 1: Lagna & Lagna Lord Analysis (40% weight)
 * FIXED: Now properly uses Subathuvam/Pavathuvam scores
 */
function calculateLagnaFactor(chart: any): { score: number; verdict: string; details: string } {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    // Calculate house Subathuvam/Pavathuvam
    const houseSubathuvam = calculateHouseSubathuvamPavathuvam(chart.planets, ascendantSign);
    const lagnaSubathuvam = houseSubathuvam[1]; // 1st house

    // Lagna Subathuvam score (NET score, not subtraction)
    // If Subathuvam > Pavathuvam, it's good. Use ratio.
    const lagnaSubTotal = lagnaSubathuvam.subathuvam.score;
    const lagnaPavaTotal = lagnaSubathuvam.pavathuvam.score;

    let lagnaHouseScore = 50; // Base
    if (lagnaSubTotal > lagnaPavaTotal) {
        // More Subathuvam = good
        lagnaHouseScore = Math.min(100, 50 + (lagnaSubTotal - lagnaPavaTotal) / 2);
    } else if (lagnaPavaTotal > lagnaSubTotal) {
        // More Pavathuvam = bad
        lagnaHouseScore = Math.max(0, 50 - (lagnaPavaTotal - lagnaSubTotal) / 2);
    }

    console.log(`Lagna House: Sub=${lagnaSubTotal}, Pava=${lagnaPavaTotal}, Score=${lagnaHouseScore}`);

    // Get Lagna Lord
    const lagnaLord = getHouseLord(ascendantSign);
    const lagnaLordPlanet = chart.planets.find((p: any) => p.name === lagnaLord);

    if (!lagnaLordPlanet) {
        return { score: 50, verdict: 'MODERATE', details: 'Lagna lord not found' };
    }

    // Calculate planet Subathuvam
    const planetSubathuvam = calculateAdityaGurujiSubathuvam(chart.planets);
    const lagnaLordSub = planetSubathuvam[lagnaLord];

    // Lagna Lord Subathuvam strength (direct from Aditya Guruji calculation)
    const lagnaLordSubScore = lagnaLordSub ? lagnaLordSub.totalScore : 50;

    console.log(`Lagna Lord (${lagnaLord}): Subathuvam=${lagnaLordSubScore}`);

    // Lagna Lord dignity
    const dignity = getPlanetDignity(lagnaLordPlanet);
    const dignityScore = dignity.score;

    console.log(`Lagna Lord Dignity: ${dignity.status} = ${dignityScore}`);

    // Weighted average (House 30%, Lord Subathuvam 40%, Dignity 30%)
    const score = (lagnaHouseScore * 0.3) + (lagnaLordSubScore * 0.4) + (dignityScore * 0.3);

    let verdict = 'MODERATE';
    if (score >= 70) verdict = 'STRONG';
    else if (score < 40) verdict = 'WEAK';

    const details = `House: ${Math.round(lagnaHouseScore)}, Lord Sub: ${Math.round(lagnaLordSubScore)}, Dignity: ${dignity.status} (${dignityScore})`;

    console.log(`LAGNA FACTOR FINAL: ${Math.round(score)}/100 - ${verdict}`);

    return { score: Math.round(score), verdict, details };
}

/**
 * FACTOR 2: 8th House & 8th Lord Analysis (35% weight)
 * FIXED: Now properly uses Subathuvam scores, especially for Jupiter aspects
 */
function calculate8thHouseFactor(chart: any): { score: number; verdict: string; details: string } {
    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    // Calculate 8th house Subathuvam/Pavathuvam
    const houseSubathuvam = calculateHouseSubathuvamPavathuvam(chart.planets, ascendantSign);
    const eighthHouse = houseSubathuvam[8];

    // 8th house score: MORE SUBATHUVAM = GOOD for longevity!
    // Jupiter aspect to 8th = high Subathuvam = good!
    const eighthSubTotal = eighthHouse.subathuvam.score;
    const eighthPavaTotal = eighthHouse.pavathuvam.score;

    let houseScore = 50; // Base
    if (eighthSubTotal > eighthPavaTotal) {
        // Jupiter/Venus aspects = high Subathuvam = GOOD for longevity!
        houseScore = Math.min(100, 50 + (eighthSubTotal - eighthPavaTotal) / 2);
    } else if (eighthPavaTotal > eighthSubTotal) {
        // Malefic aspects = high Pavathuvam = BAD
        houseScore = Math.max(0, 50 - (eighthPavaTotal - eighthSubTotal) / 2);
    }

    console.log(`8th House: Sub=${eighthSubTotal}, Pava=${eighthPavaTotal}, Score=${houseScore}`);
    console.log(`8th House details:`, eighthHouse.subathuvam.details, eighthHouse.pavathuvam.details);

    // Get 8th lord and use Subathuvam
    const eighthHouseSign = (ascendantSign + 7) % 12;
    const eighthLord = getHouseLord(eighthHouseSign);
    const eighthLordPlanet = chart.planets.find((p: any) => p.name === eighthLord);

    let eighthLordScore = 50;

    if (eighthLordPlanet) {
        // Use planet Subathuvam for 8th lord
        const planetSubathuvam = calculateAdityaGurujiSubathuvam(chart.planets);
        const eighthLordSub = planetSubathuvam[eighthLord];

        if (eighthLordSub) {
            // Convert Subathuvam to position score
            // High Subathuvam in 8th lord = good position
            eighthLordScore = eighthLordSub.totalScore;
        } else {
            // Fallback to positional analysis
            if (isInKendra(chart, eighthLordPlanet) || isInTrikona(chart, eighthLordPlanet)) {
                eighthLordScore = 80;
            } else if (isInUpachaya(chart, eighthLordPlanet)) {
                eighthLordScore = 60;
            } else if (isInDusthana(chart, eighthLordPlanet)) {
                eighthLordScore = 20;
            }
        }

        console.log(`8th Lord (${eighthLord}): Subathuvam=${eighthLordScore}`);
    }

    // Weighted average (House Subathuvam 60%, Lord 40%)
    const score = (houseScore * 0.6) + (eighthLordScore * 0.4);

    let verdict = 'MODERATE';
    if (score >= 60) verdict = 'GOOD';
    else if (score < 30) verdict = 'SEVERELY AFFLICTED';

    const details = `House: ${Math.round(houseScore)}, Lord: ${Math.round(eighthLordScore)}`;

    console.log(`8TH HOUSE FACTOR FINAL: ${Math.round(score)}/100 - ${verdict}`);

    return { score: Math.round(score), verdict, details };
}

/**
 * FACTOR 3: Saturn (Ayul Karaka) Analysis (25% weight)
 */
function calculateSaturnFactor(chart: any): { score: number; verdict: string; details: string } {
    const saturn = chart.planets.find((p: any) => p.name === 'Saturn');

    if (!saturn) {
        return { score: 50, verdict: 'MODERATE', details: 'Saturn not found' };
    }

    // Saturn Subathuvam
    const planetSubathuvam = calculateAdityaGurujiSubathuvam(chart.planets);
    const saturnSub = planetSubathuvam['Saturn'];
    const saturnSubScore = saturnSub ? saturnSub.totalScore : 50;

    // Saturn strength (based on dignity and position)
    const dignity = getPlanetDignity(saturn);
    let strengthScore = dignity.score;

    // Saturn combustion check
    const sun = chart.planets.find((p: any) => p.name === 'Sun');
    const combustionPenalty = (sun && isCombust(saturn, sun)) ? 30 : 0;

    // Saturn in Upachaya bonus
    const upachayaBonus = isInUpachaya(chart, saturn) ? 20 : 0;

    // Calculate final score
    const score = Math.max(0, Math.min(100,
        (saturnSubScore + strengthScore + upachayaBonus - combustionPenalty) / 2
    ));

    let verdict = 'MODERATE';
    if (score >= 70) verdict = 'STRONG';
    else if (score < 40) verdict = 'WEAK';

    const details = `Sub: ${Math.round(saturnSubScore)}, ${dignity.status}, ${isInUpachaya(chart, saturn) ? 'Upachaya' : ''}, ${combustionPenalty > 0 ? 'Combust' : 'Not Combust'}`;

    return { score: Math.round(score), verdict, details };
}

// ═══════════════════════════════════════════════════════════════
// DANGEROUS DASA IDENTIFICATION
// ═══════════════════════════════════════════════════════════════

/**
 * Identify all dangerous Dasas that can cause death
 */
export function identifyDangerousDasas(chart: any): DangerousDasa[] {
    const dangerous: DangerousDasa[] = [];

    const ascendantSign = typeof chart.ascendant === 'object'
        ? chart.ascendant.signIndex
        : getSignIndex(chart.ascendant);

    // 1. 8th Lord
    const eighthHouseSign = (ascendantSign + 7) % 12;
    const eighthLord = getHouseLord(eighthHouseSign);

    // 2. Planets in 8th House
    const planetsIn8th = getPlanetsInHouse(chart, 8);

    // 3. Maraka Lords (2nd & 7th)
    const secondHouseSign = (ascendantSign + 1) % 12;
    const seventhHouseSign = (ascendantSign + 6) % 12;
    const secondLord = getHouseLord(secondHouseSign);
    const seventhLord = getHouseLord(seventhHouseSign);

    // 4. Lagna Lord if in Dusthana
    const lagnaLord = getHouseLord(ascendantSign);
    const lagnaLordPlanet = chart.planets.find((p: any) => p.name === lagnaLord);

    // Add 8th lord
    let eighthLordSeverity: DangerousDasa['severity'] = 'HIGH';
    if (secondLord === eighthLord || seventhLord === eighthLord) {
        eighthLordSeverity = 'EXTREME'; // Both 8th lord AND Maraka
    }

    dangerous.push({
        planet: eighthLord,
        role: '8th Lord',
        roleTamil: '8-ம் அதிபதி',
        severity: eighthLordSeverity,
        reason: `${eighthLord} is the 8th house lord`,
        tamilReason: `${eighthLord} 8-ம் வீட்டின் அதிபதி`
    });

    // Add planets in 8th house
    planetsIn8th.forEach(planet => {
        let severity: DangerousDasa['severity'] = 'VERY HIGH';

        // Check if also Maraka
        if (planet.name === secondLord || planet.name === seventhLord) {
            severity = 'EXTREME';
        }

        dangerous.push({
            planet: planet.name,
            role: planet.name === secondLord || planet.name === seventhLord
                ? `In 8th House + Maraka Lord`
                : 'In 8th House',
            roleTamil: planet.name === secondLord || planet.name === seventhLord
                ? '8-ம் வீட்டில் + மாரகாதிபதி'
                : '8-ம் வீட்டில் அமர்ந்துள்ளார்',
            severity,
            reason: `${planet.name} occupies 8th house`,
            tamilReason: `${planet.name} 8-ம் வீட்டில் அமர்ந்துள்ளார்`
        });
    });

    // Add Maraka lords (if not already added)
    if (!dangerous.find(d => d.planet === secondLord)) {
        dangerous.push({
            planet: secondLord,
            role: '2nd Lord (Maraka)',
            roleTamil: '2-ம் அதிபதி (மாரகர்)',
            severity: 'HIGH',
            reason: `${secondLord} is the 2nd house lord (Maraka)`,
            tamilReason: `${secondLord} 2-ம் வீட்டின் அதிபதி (மாரகர்)`
        });
    }

    if (!dangerous.find(d => d.planet === seventhLord)) {
        dangerous.push({
            planet: seventhLord,
            role: '7th Lord (Maraka)',
            roleTamil: '7-ம் அதிபதி (மாரகர்)',
            severity: 'HIGH',
            reason: `${seventhLord} is the 7th house lord (Maraka)`,
            tamilReason: `${seventhLord} 7-ம் வீட்டின் அதிபதி (மாரகர்)`
        });
    }

    // Add Lagna lord if in Dusthana
    if (lagnaLordPlanet && isInDusthana(chart, lagnaLordPlanet)) {
        dangerous.push({
            planet: lagnaLord,
            role: 'Lagna Lord in Dusthana',
            roleTamil: 'லக்னாதிபதி துஷ்தானத்தில்',
            severity: 'MEDIUM',
            reason: `${lagnaLord} (Lagna lord) is in 6th/8th/12th house`,
            tamilReason: `${lagnaLord} (லக்னாதிபதி) 6/8/12 வீட்டில் உள்ளார்`
        });
    }

    return dangerous;
}

// ═══════════════════════════════════════════════════════════════
// DEATH RISK CALCULATION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate death risk for a specific Dasa period
 */
function calculatePlanetRisk(planet: string, dangerousDasas: DangerousDasa[]): number {
    const found = dangerousDasas.find(d => d.planet === planet);
    if (!found) return 0;

    switch (found.severity) {
        case 'EXTREME': return 90;
        case 'VERY HIGH': return 80;
        case 'HIGH': return 60;
        case 'MEDIUM': return 40;
        default: return 20;
    }
}

/**
 * Calculate combined death risk for current Dasa period
 */
function calculateDeathRisk(
    currentDasa: ReturnType<typeof getCurrentDasha>,
    dangerousDasas: DangerousDasa[]
): {
    maha: { planet: string; risk: number };
    antar: { planet: string; risk: number };
    pratyantar: { planet: string; risk: number };
    combinedRisk: number;
    riskLevel: string;
} {
    const mahaRisk = currentDasa?.maha ? calculatePlanetRisk(currentDasa.maha.planet, dangerousDasas) : 0;
    const antarRisk = currentDasa?.bhukti ? calculatePlanetRisk(currentDasa.bhukti.planet, dangerousDasas) : 0;
    const pratyantarRisk = currentDasa?.antaram ? calculatePlanetRisk(currentDasa.antaram.planet, dangerousDasas) : 0;

    // Weighted combination
    const combinedRisk = (mahaRisk * 0.6) + (antarRisk * 0.3) + (pratyantarRisk * 0.1);

    let riskLevel = 'LOW';
    if (combinedRisk >= 80) riskLevel = 'EXTREME DANGER';
    else if (combinedRisk >= 60) riskLevel = 'VERY HIGH RISK';
    else if (combinedRisk >= 40) riskLevel = 'HIGH RISK';
    else if (combinedRisk >= 20) riskLevel = 'MODERATE RISK';

    return {
        maha: { planet: currentDasa?.maha?.planet || 'Unknown', risk: mahaRisk },
        antar: { planet: currentDasa?.bhukti?.planet || 'Unknown', risk: antarRisk },
        pratyantar: { planet: currentDasa?.antaram?.planet || 'Unknown', risk: pratyantarRisk },
        combinedRisk: Math.round(combinedRisk),
        riskLevel
    };
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * Predict death risk for next 10 years
 */
function predictNext10YearRisk(
    chart: any,
    birthDate: Date,
    dasaPeriods: DashaPeriod[],
    dangerousDasas: DangerousDasa[]
): DeathRiskPeriod[] {
    const riskPeriods: DeathRiskPeriod[] = [];
    const currentAge = calculateAge(birthDate);

    for (let year = 1; year <= 10; year++) {
        const futureDate = new Date(birthDate);
        futureDate.setFullYear(futureDate.getFullYear() + currentAge + year);

        const futureDasa = getCurrentDasha(dasaPeriods, futureDate);
        if (!futureDasa) continue;

        const risk = calculateDeathRisk(futureDasa, dangerousDasas);

        // Only include HIGH, VERY HIGH, or EXTREME risk periods
        if (risk.combinedRisk >= 40) {
            riskPeriods.push({
                period: `${futureDasa.maha.planet}${futureDasa.bhukti ? `/${futureDasa.bhukti.planet}` : ''}`,
                startAge: currentAge + year,
                endAge: currentAge + year,
                risk: risk.combinedRisk,
                riskLevel: risk.riskLevel,
                reason: `${futureDasa.maha.planet} Maha Dasa${futureDasa.bhukti ? ` / ${futureDasa.bhukti.planet} Antar` : ''}`,
                tamilReason: `${futureDasa.maha.planet} மகா தசை${futureDasa.bhukti ? ` / ${futureDasa.bhukti.planet} அந்தர்` : ''}`
            });
        }
    }

    return riskPeriods;
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Comprehensive longevity analysis for marriage matching
 * 
 * This is the main function to call for marriage matching
 */
export function analyzeLongevityForMarriage(
    chart: any,
    birthDate: Date,
    dasaPeriods?: DashaPeriod[]
): MarriageLongevityVerdict {
    // Calculate Dasa periods if not provided
    const moon = chart.planets.find((p: any) => p.name === 'Moon');
    if (!moon) {
        throw new Error('Moon not found in chart - cannot calculate longevity');
    }

    const periods = dasaPeriods || calculateDashaPeriods(birthDate, moon.longitude);
    const currentDasa = getCurrentDasha(periods);

    // STEP 1: Calculate 3-Factor Longevity Score
    const lagnaFactor = calculateLagnaFactor(chart);
    const eighthHouseFactor = calculate8thHouseFactor(chart);
    const saturnFactor = calculateSaturnFactor(chart);

    // Weighted average
    const longevityScore = Math.round(
        (lagnaFactor.score * 0.40) +
        (eighthHouseFactor.score * 0.35) +
        (saturnFactor.score * 0.25)
    );

    // Classify longevity
    let category: 'SHORT' | 'MEDIUM' | 'LONG';
    let categoryTamil: string;
    let lifespan: string;
    let lifespanTamil: string;
    let verdict: string;
    let verdictTamil: string;

    if (longevityScore >= 80) {
        category = 'LONG';
        categoryTamil = 'தீர்க்க ஆயுள்';
        lifespan = '66-80+ years';
        lifespanTamil = '66-80+ வருடங்கள்';
        verdict = 'LONG LIFE';
        verdictTamil = 'நீண்ட ஆயுள்';
    } else if (longevityScore >= 50) {
        category = 'MEDIUM';
        categoryTamil = 'மத்திம ஆயுள்';
        lifespan = '33-66 years';
        lifespanTamil = '33-66 வருடங்கள்';
        verdict = 'MEDIUM LIFE';
        verdictTamil = 'மத்திம ஆயுள்';
    } else {
        category = 'SHORT';
        categoryTamil = 'அற்ப ஆயுள்';
        lifespan = 'Before 33 years';
        lifespanTamil = '33 வயதுக்குள்';
        verdict = 'SHORT LIFE INDICATION';
        verdictTamil = 'குறைவான ஆயுள் அறிகுறி';
    }

    const longevityAnalysis: LongevityAnalysis = {
        score: longevityScore,
        category,
        categoryTamil,
        lifespan,
        lifespanTamil,
        factors: {
            lagna: lagnaFactor,
            eighthHouse: eighthHouseFactor,
            saturn: saturnFactor
        },
        verdict,
        verdictTamil
    };

    // STEP 2: Identify Dangerous Dasas
    const dangerousDasas = identifyDangerousDasas(chart);

    // STEP 3: Calculate Death Risk
    const currentPeriodRisk = calculateDeathRisk(currentDasa, dangerousDasas);
    const next10YearRisk = predictNext10YearRisk(chart, birthDate, periods, dangerousDasas);

    const hasExtremeRiskIn5Years = next10YearRisk.some(r => r.startAge <= calculateAge(birthDate) + 5 && r.risk >= 80);
    const hasExtremeRiskIn10Years = next10YearRisk.some(r => r.risk >= 80);

    const deathRisk: DeathRiskAssessment = {
        currentPeriod: {
            ...currentPeriodRisk,
            verdict: `${currentPeriodRisk.maha.planet}/${currentPeriodRisk.antar.planet} - ${currentPeriodRisk.riskLevel}`,
            verdictTamil: `${currentPeriodRisk.maha.planet}/${currentPeriodRisk.antar.planet} - ${currentPeriodRisk.riskLevel === 'EXTREME DANGER' ? 'மரண ஆபத்து' : currentPeriodRisk.riskLevel === 'VERY HIGH RISK' ? 'மிக அதிக ஆபத்து' : 'ஆபத்து'}`
        },
        next10YearRisk,
        hasExtremeRiskIn5Years,
        hasExtremeRiskIn10Years
    };

    // STEP 4: Marriage Recommendation Logic
    let marriageRecommendation: MarriageLongevityVerdict['marriageRecommendation'];
    let reason: string;
    let tamilReason: string;

    // CRITICAL COMBINATIONS for AUTO-REJECT
    const criticalLagnaAnd8th = lagnaFactor.score < 30 && eighthHouseFactor.score < 30;
    const extremeCurrentRisk = currentPeriodRisk.combinedRisk >= 80;

    if (criticalLagnaAnd8th) {
        marriageRecommendation = 'REJECT';
        reason = 'Both Lagna and 8th house severely weak - Short life indication';
        tamilReason = 'லக்னம் மற்றும் 8-ம் வீடு இரண்டும் மிகவும் பலவீனம் - குறைவான ஆயுள்';
    } else if (extremeCurrentRisk) {
        marriageRecommendation = 'REJECT';
        reason = 'Currently in EXTREME death-risk period';
        tamilReason = 'தற்போது உயர் மரண ஆபத்து காலம்';
    } else if (hasExtremeRiskIn5Years) {
        marriageRecommendation = 'REJECT';
        reason = 'EXTREME death-risk period in next 5 years';
        tamilReason = 'அடுத்த 5 வருடங்களில் உயர் மரண ஆபத்து காலம்';
    } else if (category === 'SHORT') {
        // SHORT doesn't automatically reject if Lagna is strong
        if (lagnaFactor.score >= 70) {
            marriageRecommendation = 'PROCEED_WITH_CAUTION';
            reason = 'Overall short life indication, but strong Lagna provides protection';
            tamilReason = 'ஆயுள் குறைவு, ஆனால் வலுவான லக்னம் பாதுகாப்பு அளிக்கிறது';
        } else {
            marriageRecommendation = 'REJECT';
            reason = 'Short life indication with weak Lagna';
            tamilReason = 'பலவீனமான லக்னத்துடன் குறைவான ஆயுள்';
        }
    } else if (category === 'MEDIUM' && currentPeriodRisk.combinedRisk >= 60) {
        marriageRecommendation = 'PROCEED_WITH_CAUTION';
        reason = 'Medium longevity with currently high-risk period';
        tamilReason = 'மத்திம ஆயுள், தற்போது அதிக ஆபத்து காலம்';
    } else if (category === 'MEDIUM' && hasExtremeRiskIn10Years) {
        marriageRecommendation = 'PROCEED_WITH_CAUTION';
        reason = 'Medium longevity with future high-risk periods';
        tamilReason = 'மத்திம ஆயுள், எதிர்காலத்தில் அதிக ஆபத்து காலங்கள்';
    } else {
        marriageRecommendation = 'PROCEED';
        reason = `Good longevity (${category}) with no extreme risks`;
        tamilReason = `நல்ல ஆயுள் (${categoryTamil}), உயர் ஆபத்து இல்லை`;
    }

    // ═══════════════════════════════════════════════════════════════
    // DETAILED CONSOLE LOGGING FOR VERIFICATION
    // ═══════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔮 LONGEVITY ANALYSIS RESULT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Overall Longevity Score: ${longevityScore}/100`);
    console.log(`Category: ${category} (${categoryTamil})`);
    console.log(`Lifespan: ${longevityAnalysis.lifespan}`);
    console.log('');
    console.log('📊 Factor Breakdown:');
    console.log(`  Lagna Factor (40%): ${lagnaFactor.score}/100 - ${lagnaFactor.verdict}`);
    console.log(`  8th House Factor (35%): ${eighthHouseFactor.score}/100 - ${eighthHouseFactor.verdict}`);
    console.log(`  Saturn Factor (25%): ${saturnFactor.score}/100 - ${saturnFactor.verdict}`);
    console.log('');
    console.log('⚠️ Current Period Death Risk:');
    console.log(`  Maha Dasa: ${currentPeriodRisk.maha.planet} (Risk: ${currentPeriodRisk.maha.risk}/100)`);
    console.log(`  Antar Dasa: ${currentPeriodRisk.antar.planet} (Risk: ${currentPeriodRisk.antar.risk}/100)`);
    console.log(`  Combined Risk: ${currentPeriodRisk.combinedRisk}/100 - ${currentPeriodRisk.riskLevel}`);
    console.log('');

    if (next10YearRisk.length > 0) {
        console.log('📅 HIGH RISK PERIODS IN NEXT 10 YEARS:');
        next10YearRisk.forEach(risk => {
            const riskEmoji = risk.risk >= 80 ? '🔴' : risk.risk >= 60 ? '🟠' : '🟡';
            console.log(`  ${riskEmoji} Age ${risk.startAge}: ${risk.period} - Risk: ${risk.risk}/100 (${risk.riskLevel})`);
        });

        // Highlight extreme danger periods
        const extremePeriods = next10YearRisk.filter(r => r.risk >= 80);
        if (extremePeriods.length > 0) {
            console.log('');
            console.log('🚨 EXTREME DANGER PERIODS (Risk >= 80):');
            extremePeriods.forEach(risk => {
                console.log(`  ⚠️ Age ${risk.startAge}: ${risk.period} - EXTREME DANGER!`);
                console.log(`     Tamil: ${risk.tamilReason}`);
            });
        }
    } else {
        console.log('✅ No high-risk periods detected in next 10 years');
    }

    console.log('');
    console.log('🏥 Dangerous Dasas (Death-Inflicting Planets):');
    dangerousDasas.forEach(dasa => {
        const severityEmoji = dasa.severity === 'EXTREME' ? '🔴' :
            dasa.severity === 'VERY HIGH' ? '🟠' :
                dasa.severity === 'HIGH' ? '🟡' : '🔵';
        console.log(`  ${severityEmoji} ${dasa.planet} - ${dasa.role} (${dasa.severity})`);
    });

    console.log('');
    console.log('💍 Marriage Recommendation:', marriageRecommendation);
    console.log(`Reason: ${reason}`);
    console.log(`Tamil: ${tamilReason}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    return {
        longevityScore,
        category,
        currentRisk: currentPeriodRisk.combinedRisk,
        futureHighRisk: hasExtremeRiskIn5Years || hasExtremeRiskIn10Years,
        marriageRecommendation,
        reason,
        tamilReason,
        detailedAnalysis: {
            longevity: longevityAnalysis,
            dangerousDasas,
            deathRisk
        }
    };
}
