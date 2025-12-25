/**
 * Aditya Guruji Marriage Matching - Rule-Based Implementation
 * Pure TypeScript logic - no AI needed
 * Based on Guruji's 8 core compatibility rules
 */

import { calculateVimshottariDasha, getCurrentDasha } from './dashaCalculation';
import { calculateSubathuvamPavathuvam, calculateHouseSubathuvamPavathuvam } from './subathuvam';
import { calculateAdityaGurujiSubathuvam, getFunctionalNature } from './adityaGurujiSubathuvam';

/**
 * RULE 1: தசா-புக்தி பொருத்தம் (Dasa-Bhukti Synchronization)
 * This is THE MOST IMPORTANT rule according to Aditya Guruji
 */
export interface DasaSyncResult {
    compatible: boolean;
    score: number; // 0-100
    divorceRiskPeriods: Array<{
        year: number;
        boyDasa: string;
        boyBhukti: string;
        girlDasa: string;
        girlBhukti: string;
        reason: string;
    }>;
    childrenTimingGood: boolean;
    childrenPredictedYear: number | null;
    details: string[];
    autoReject: boolean;
    autoRejectReason?: string;
}

export function analyzeDasaSynchronization(
    boyChart: any,
    girlChart: any,
    marriageDate: Date = new Date()
): DasaSyncResult {
    const result: DasaSyncResult = {
        compatible: true,
        score: 100,
        divorceRiskPeriods: [],
        childrenTimingGood: false,
        childrenPredictedYear: null,
        details: [],
        autoReject: false
    };

    // Calculate Dasa periods for next 15 years
    // Dasha is calculated from Moon position, not Ascendant
    const boyMoon = boyChart.planets.find((p: any) => p.name === 'Moon');
    const girlMoon = girlChart.planets.find((p: any) => p.name === 'Moon');

    const boyDasaPeriods = boyMoon ? calculateVimshottariDasha(boyMoon.longitude, boyChart.birthDate || new Date(), 15) : [];
    const girlDasaPeriods = girlMoon ? calculateVimshottariDasha(girlMoon.longitude, girlChart.birthDate || new Date(), 15) : [];

    // Get functional nature for both
    const boyFunctional = getFunctionalNature(boyChart.planets[0].signIndex, 'en');
    const girlFunctional = getFunctionalNature(girlChart.planets[0].signIndex, 'en');

    // Get 7th house lord for both
    const boy7thHouse = (boyChart.planets[0].signIndex + 6) % 12;
    const girl7thHouse = (girlChart.planets[0].signIndex + 6) % 12;

    const boy7thLord = getHouseLord(boy7thHouse);
    const girl7thLord = getHouseLord(girl7thHouse);

    // Analyze next 15 years
    const marriageYear = marriageDate.getFullYear();

    for (let year = 0; year < 15; year++) {
        const checkYear = marriageYear + year;

        // Get Dasa for this year for both
        const boyDasa = getDasaForYear(boyDasaPeriods, checkYear);
        const girlDasa = getDasaForYear(girlDasaPeriods, checkYear);

        if (!boyDasa || !girlDasa) continue;

        // Check for divorce risk (விவாகரத்து விதி)
        const boyDivorceRisk = checkDivorceRisk(
            boyDasa.maha.planet,
            boyDasa.bhukti?.planet || boyDasa.maha.planet,
            boy7thLord,
            boyFunctional,
            boyChart
        );

        const girlDivorceRisk = checkDivorceRisk(
            girlDasa.maha.planet,
            girlDasa.bhukti?.planet || girlDasa.maha.planet,
            girl7thLord,
            girlFunctional,
            girlChart
        );

        // CRITICAL: If BOTH have divorce risk in same period → AUTO REJECT!
        if (boyDivorceRisk.isRisk && girlDivorceRisk.isRisk) {
            result.divorceRiskPeriods.push({
                year: checkYear,
                boyDasa: boyDasa.maha.planet,
                boyBhukti: boyDasa.bhukti?.planet || boyDasa.maha.planet,
                girlDasa: girlDasa.maha.planet,
                girlBhukti: girlDasa.bhukti?.planet || girlDasa.maha.planet,
                reason: `Boy: ${boyDivorceRisk.reason}, Girl: ${girlDivorceRisk.reason}`
            });

            result.autoReject = true;
            result.autoRejectReason = `Divorce risk in ${checkYear} - Both charts show separation Dasa simultaneously`;
            result.score = 0;
            return result;
        }

        // Check for children timing (குழந்தை பாக்கியம்)
        if (year >= 1 && year <= 3 && !result.childrenPredictedYear) {
            const boyChildrenYoga = checkChildrenYoga(
                boyDasa.maha.planet,
                boyDasa.bhukti?.planet || boyDasa.maha.planet,
                boyChart
            );

            const girlChildrenYoga = checkChildrenYoga(
                girlDasa.maha.planet,
                girlDasa.bhukti?.planet || girlDasa.maha.planet,
                girlChart
            );

            if (boyChildrenYoga && girlChildrenYoga) {
                result.childrenTimingGood = true;
                result.childrenPredictedYear = checkYear;
                result.details.push(`Children likely in ${checkYear} (within 2-3 years of marriage)`);
            }
        }
    }

    // Score calculation
    if (result.divorceRiskPeriods.length > 0) {
        result.score -= (result.divorceRiskPeriods.length * 20); // -20 per risky period
    }

    if (!result.childrenTimingGood) {
        result.score -= 15; // Children delay reduces score
        result.details.push("Warning: Children timing may be delayed beyond 3 years");
    }

    result.score = Math.max(0, result.score);
    result.compatible = result.score >= 50;

    return result;
}

/**
 * Check if a Dasa period has divorce/separation risk
 */
function checkDivorceRisk(
    mahaDasa: string,
    bhukti: string,
    seventhLord: string,
    functionalNature: any,
    chart: any
): { isRisk: boolean; reason: string } {
    // Get house lordships
    const get6thLord = getHouseLord((chart.planets[0].signIndex + 5) % 12);
    const get8thLord = getHouseLord((chart.planets[0].signIndex + 7) % 12);
    const get12thLord = getHouseLord((chart.planets[0].signIndex + 11) % 12);

    // Check if 7th lord is afflicted
    const is7thLordAfflicted = isLordAfflicted(seventhLord, chart);

    // Divorce risk conditions:
    // 1. 7th lord afflicted AND running 6/8/12 lord Dasa
    if (is7thLordAfflicted) {
        if ([get6thLord, get8thLord, get12thLord].includes(mahaDasa) ||
            [get6thLord, get8thLord, get12thLord].includes(bhukti)) {
            return {
                isRisk: true,
                reason: `7th lord afflicted + ${mahaDasa}-${bhukti} Dasa (6/8/12 lords)`
            };
        }
    }

    // 2. Family house lords (2,4) afflicted + 6/8/12 Dasa
    const get2ndLord = getHouseLord((chart.planets[0].signIndex + 1) % 12);
    const get4thLord = getHouseLord((chart.planets[0].signIndex + 3) % 12);

    const is2ndLordAfflicted = isLordAfflicted(get2ndLord, chart);
    const is4thLordAfflicted = isLordAfflicted(get4thLord, chart);

    if ((is2ndLordAfflicted || is4thLordAfflicted) &&
        ([get6thLord, get8thLord, get12thLord].includes(mahaDasa) ||
            [get6thLord, get8thLord, get12thLord].includes(bhukti))) {
        return {
            isRisk: true,
            reason: `Family lord afflicted + ${mahaDasa}-${bhukti} Dasa (6/8/12 lords)`
        };
    }

    return { isRisk: false, reason: '' };
}

/**
 * Check if lord is afflicted (combusted, conjunct malefics, etc.)
 */
function isLordAfflicted(planetName: string, chart: any): boolean {
    const planet = chart.planets.find((p: any) => p.name === planetName);
    if (!planet) return false;

    const sun = chart.planets.find((p: any) => p.name === 'Sun');
    const saturn = chart.planets.find((p: any) => p.name === 'Saturn');
    const mars = chart.planets.find((p: any) => p.name === 'Mars');
    const rahu = chart.planets.find((p: any) => p.name === 'Rahu');

    // Check combustion
    if (sun) {
        const sunDiff = Math.abs(planet.longitude - sun.longitude);
        const actualDiff = Math.min(sunDiff, 360 - sunDiff);
        if (actualDiff < 10) return true; // Combust
    }

    // Check malefic conjunction
    const malefics = [saturn, mars, rahu].filter(Boolean);
    for (const malefic of malefics) {
        const conjDiff = Math.abs(planet.longitude - malefic.longitude);
        const actualDiff = Math.min(conjDiff, 360 - conjDiff);
        if (actualDiff < 10) return true; // Afflicted by malefic
    }

    return false;
}

/**
 * Check if Dasa has children yoga (குழந்தை பாக்கியம்)
 */
function checkChildrenYoga(mahaDasa: string, bhukti: string, chart: any): boolean {
    // Children indicated by:
    // 1. Jupiter Dasa/Bhukti (natural karaka)
    if (mahaDasa === 'Jupiter' || bhukti === 'Jupiter') return true;

    // 2. 5th house lord Dasa/Bhukti
    const get5thLord = getHouseLord((chart.planets[0].signIndex + 4) % 12);
    if (mahaDasa === get5thLord || bhukti === get5thLord) return true;

    return false;
}

/**
 * Get house lord based on sign
 */
function getHouseLord(signIndex: number): string {
    const lords: Record<number, string> = {
        0: 'Mars',      // Aries
        1: 'Venus',     // Taurus
        2: 'Mercury',   // Gemini
        3: 'Moon',      // Cancer
        4: 'Sun',       // Leo
        5: 'Mercury',   // Virgo
        6: 'Venus',     // Libra
        7: 'Mars',      // Scorpio
        8: 'Jupiter',   // Sagittarius
        9: 'Saturn',    // Capricorn
        10: 'Saturn',   // Aquarius
        11: 'Jupiter'   // Pisces
    };
    return lords[signIndex] || 'Unknown';
}

/**
 * Get Dasa for specific year
 */
function getDasaForYear(dasaPeriods: any[], year: number): any {
    for (const period of dasaPeriods) {
        const startYear = new Date(period.start).getFullYear();
        const endYear = new Date(period.end).getFullYear();

        if (year >= startYear && year <= endYear) {
            return period;
        }
    }
    return null;
}

/**
 * RULE 2: பாப-சுப சாம்யம் (Papa-Suba Balance / Dosha Matching)
 * "சுபருக்கு சுபர், பாபருக்கு பாபர்"
 */
export interface DoshaBalanceResult {
    compatible: boolean;
    score: number;
    boySeverity: number; // 0-100 (ml of poison)
    girlSeverity: number; // 0-100 (ml of poison)
    balanced: boolean;
    details: string[];
}

export function analyzeDoshaBalance(
    boyChart: any,
    girlChart: any
): DoshaBalanceResult {
    const result: DoshaBalanceResult = {
        compatible: true,
        score: 100,
        boySeverity: 0,
        girlSeverity: 0,
        balanced: true,
        details: []
    };

    // Calculate Dosha severity for both
    result.boySeverity = calculateDoshaSeverity(boyChart);
    result.girlSeverity = calculateDoshaSeverity(girlChart);

    result.details.push(`Boy dosha: ${result.boySeverity}ml (${getDoshLabel(result.boySeverity)})`);
    result.details.push(`Girl dosha: ${result.girlSeverity}ml (${getDoshLabel(result.girlSeverity)})`);

    // Check balance - FIXED THRESHOLDS
    const difference = Math.abs(result.boySeverity - result.girlSeverity);

    if (difference > 40) {
        // Very unbalanced (clean + severe dosha)
        result.balanced = false;
        result.compatible = false;
        result.score = 20;
        result.details.push("⚠️ Severe mismatch: Very different dosha levels - High conflict risk");
    } else if (difference > 15) {
        // Moderately unbalanced (FIXED: Was 25, now 15)
        result.balanced = false;
        result.score = 60;
        result.details.push(`⚠️ Moderate imbalance: ${difference}ml difference - Some friction expected`);
    } else if (difference > 5) {
        // Minor imbalance (NEW threshold)
        result.balanced = true;
        result.score = 85;
        result.details.push(`Minor difference: ${difference}ml gap - Manageable with understanding`);
    } else {
        // Well balanced
        result.balanced = true;
        result.score = 100;
        result.details.push("✓ Excellent balance: Similar dosha levels");
    }

    return result;
}

/**
 * Calculate dosha severity (0-100ml)
 */
function calculateDoshaSeverity(chart: any): number {
    let severity = 0;
    const ascSign = chart.planets[0].signIndex;

    // Check Lagna 7th house
    const lagna7thSign = (ascSign + 6) % 12;
    const lagna8thSign = (ascSign + 7) % 12;

    // Check Rasi (Moon) 7th house
    const moon = chart.planets.find((p: any) => p.name === 'Moon');
    const rasiSign = moon ? moon.signIndex : ascSign;
    const rasi7thSign = (rasiSign + 6) % 12;
    const rasi8thSign = (rasiSign + 7) % 12;

    // Get malefic positions
    const mars = chart.planets.find((p: any) => p.name === 'Mars');
    const saturn = chart.planets.find((p: any) => p.name === 'Saturn');
    const rahu = chart.planets.find((p: any) => p.name === 'Rahu');
    const ketu = chart.planets.find((p: any) => p.name === 'Ketu');

    // 100ml poison: Mars in 7th + Saturn in 8th (SEVERE)
    const marsIn7thLagna = mars && mars.signIndex === lagna7thSign;
    const saturnIn8thLagna = saturn && saturn.signIndex === lagna8thSign;

    if (marsIn7thLagna && saturnIn8thLagna) {
        severity = 100;
        return severity;
    }

    // 50ml poison: Mars in 7th only (MODERATE)
    if (marsIn7thLagna) {
        severity += 50;
    }

    // Other malefics in 7th/8th (MILD)
    if (saturn && (saturn.signIndex === lagna7thSign || saturn.signIndex === lagna8thSign)) {
        severity += 25;
    }

    if (rahu && (rahu.signIndex === lagna7thSign || rahu.signIndex === lagna8thSign)) {
        severity += 20;
    }

    if (ketu && (ketu.signIndex === lagna7thSign || ketu.signIndex === lagna8thSign)) {
        severity += 15;
    }

    // Check Rasi chart as well
    const marsIn7thRasi = mars && mars.signIndex === rasi7thSign;
    if (marsIn7thRasi) {
        severity += 25; // Additional dosha from Rasi
    }

    return Math.min(100, severity);
}

function getDoshLabel(severity: number): string {
    if (severity >= 80) return 'Severe';
    if (severity >= 50) return 'Moderate';
    if (severity >= 25) return 'Mild';
    return 'Clean';
}

/**
 * RULE 3: 7-ம் இடம் பகுப்பாய்வு (7th House Analysis)
 * Saturn and Mars placement in 7th/8th houses
 */
export interface House7Result {
    compatible: boolean;
    score: number;
    boySaturnIn7th: boolean;
    girlSaturnIn7th: boolean;
    boyMarsDosha: boolean;
    girlMarsDosha: boolean;
    lateMarriageRecommended: boolean;
    details: string[];
}

export function analyze7thHouse(boyChart: any, girlChart: any): House7Result {
    const result: House7Result = {
        compatible: true,
        score: 100,
        boySaturnIn7th: false,
        girlSaturnIn7th: false,
        boyMarsDosha: false,
        girlMarsDosha: false,
        lateMarriageRecommended: false,
        details: []
    };

    // Check Saturn in 7th
    const boySaturn7th = checkSaturnIn7th(boyChart);
    const girlSaturn7th = checkSaturnIn7th(girlChart);

    result.boySaturnIn7th = boySaturn7th;
    result.girlSaturnIn7th = girlSaturn7th;

    // Saturn in 7th matching rule
    if (boySaturn7th || girlSaturn7th) {
        result.lateMarriageRecommended = true;

        if (boySaturn7th && girlSaturn7th) {
            // Both have Saturn in 7th - compatible!
            result.score = 80;
            result.details.push("✓ Both have Saturn in 7th - Late marriage will work");
            result.details.push("Recommendation: Marriage after 28-30 years age");
        } else {
            // Only one has Saturn - not ideal
            result.score = 50;
            result.compatible = false;
            result.details.push("⚠️ One has Saturn in 7th, other doesn't - Mismatch");
            result.details.push("Delay difference may cause issues");
        }
    }

    // Check Mars Dosha (Mangal Dosha)
    result.boyMarsDosha = checkMarsDosha(boyChart);
    result.girlMarsDosha = checkMarsDosha(girlChart);

    if (result.boyMarsDosha || result.girlMarsDosha) {
        // Check Jupiter aspect cancellation
        const boyJupiterCancels = checkJupiterAspect(boyChart, 'Mars');
        const girlJupiterCancels = checkJupiterAspect(girlChart, 'Mars');

        if (boyJupiterCancels && boyChart) {
            result.details.push("Boy: Mars dosha cancelled by Jupiter aspect");
            result.boyMarsDosha = false;
        }

        if (girlJupiterCancels) {
            result.details.push("Girl: Mars dosha cancelled by Jupiter aspect");
            result.girlMarsDosha = false;
        }

        // After cancellation check
        if (result.boyMarsDosha && result.girlMarsDosha) {
            result.details.push("✓ Both have Mars dosha - Compatible");
            result.score = Math.min(result.score, 85);
        } else if (result.boyMarsDosha || result.girlMarsDosha) {
            result.details.push("⚠️ One has Mars dosha - Imbalance");
            result.score = Math.min(result.score, 60);
            result.compatible = false;
        }
    }

    return result;
}

function checkSaturnIn7th(chart: any): boolean {
    const ascSign = chart.planets[0].signIndex;
    const saturn = chart.planets.find((p: any) => p.name === 'Saturn');
    if (!saturn) return false;

    const seventhHouse = (ascSign + 6) % 12;
    return saturn.signIndex === seventhHouse;
}

function checkMarsDosha(chart: any): boolean {
    const ascSign = chart.planets[0].signIndex;
    const mars = chart.planets.find((p: any) => p.name === 'Mars');
    if (!mars) return false;

    // Mars in 1, 4, 7, 8, 12 from Lagna = Mangal Dosha
    const doshaHouses = [0, 3, 6, 7, 11]; // 0-indexed
    const marsHouse = (mars.signIndex - ascSign + 12) % 12;

    return doshaHouses.includes(marsHouse);
}

function checkJupiterAspect(chart: any, targetPlanet: string): boolean {
    const jupiter = chart.planets.find((p: any) => p.name === 'Jupiter');
    const target = chart.planets.find((p: any) => p.name === targetPlanet);

    if (!jupiter || !target) return false;

    // Jupiter aspects 5th, 7th, 9th houses from itself
    const signDiff = (target.signIndex - jupiter.signIndex + 12) % 12;
    const houseDist = signDiff + 1;

    return [5, 7, 9].includes(houseDist);
}

/**
 * RULE 4: சுக்கிரன் நிலை (Venus Analysis) - Conjugal Happiness
 */
export interface VenusAnalysisResult {
    compatible: boolean;
    score: number;
    boyVenusAfflicted: boolean;
    girlVenusAfflicted: boolean;
    conjugalIssuesWarning: boolean;
    details: string[];
}

export function analyzeVenus(boyChart: any, girlChart: any): VenusAnalysisResult {
    const result: VenusAnalysisResult = {
        compatible: true,
        score: 100,
        boyVenusAfflicted: false,
        girlVenusAfflicted: false,
        conjugalIssuesWarning: false,
        details: []
    };

    // Check Venus affliction for both
    result.boyVenusAfflicted = checkVenusAffliction(boyChart);
    result.girlVenusAfflicted = checkVenusAffliction(girlChart);

    if (result.boyVenusAfflicted) {
        result.details.push("⚠️ Boy: Venus afflicted (conjugal happiness may be affected)");
        result.score -= 25;
        result.conjugalIssuesWarning = true;
    }

    if (result.girlVenusAfflicted) {
        result.details.push("⚠️ Girl: Venus afflicted (conjugal happiness may be affected)");
        result.score -= 25;
        result.conjugalIssuesWarning = true;
    }

    if (result.boyVenusAfflicted && result.girlVenusAfflicted) {
        result.details.push("❌ Both have Venus affliction - Serious conjugal issues likely");
        result.compatible = false;
    }

    return result;
}

function checkVenusAffliction(chart: any): boolean {
    const venus = chart.planets.find((p: any) => p.name === 'Venus');
    if (!venus) return false;

    const saturn = chart.planets.find((p: any) => p.name === 'Saturn');
    const mars = chart.planets.find((p: any) => p.name === 'Mars');
    const rahu = chart.planets.find((p: any) => p.name === 'Rahu');
    const jupiter = chart.planets.find((p: any) => p.name === 'Jupiter');

    // Check malefic conjunctions
    const malefics = [saturn, mars, rahu].filter(Boolean);
    for (const malefic of malefics) {
        const conjDiff = Math.abs(venus.longitude - malefic.longitude);
        const actualDiff = Math.min(conjDiff, 360 - conjDiff);
        if (actualDiff < 10) {
            // Check if Jupiter aspects to cancel
            if (jupiter && checkJupiterAspect(chart, 'Venus')) {
                return false; // Dosha cancelled
            }
            return true; // Afflicted
        }
    }

    return false;
}

/**
 * RULE 5: குரு-சுக்கிரன் சேர்க்கை (Jupiter-Venus Conjunction)
 */
export interface JupiterVenusResult {
    compatible: boolean;
    score: number;
    boyHasConjunction: boolean;
    girlHasConjunction: boolean;
    delayWarning: boolean;
    details: string[];
}

export function analyzeJupiterVenusConjunction(
    boyChart: any,
    girlChart: any
): JupiterVenusResult {
    const result: JupiterVenusResult = {
        compatible: true,
        score: 100,
        boyHasConjunction: false,
        girlHasConjunction: false,
        delayWarning: false,
        details: []
    };

    result.boyHasConjunction = checkJupiterVenusClose(boyChart);
    result.girlHasConjunction = checkJupiterVenusClose(girlChart);

    if (result.boyHasConjunction) {
        result.details.push("⚠️ Boy: Jupiter-Venus conjunction (<8°) - May delay conjugal happiness/children");
        result.score -= 20;
        result.delayWarning = true;
    }

    if (result.girlHasConjunction) {
        result.details.push("⚠️ Girl: Jupiter-Venus conjunction (<8°) - May delay conjugal happiness/children");
        result.score -= 20;
        result.delayWarning = true;
    }

    if (result.boyHasConjunction && result.girlHasConjunction) {
        result.details.push("❌ Both have Jupiter-Venus conjunction - Children may be significantly delayed");
        result.compatible = false;
    }

    return result;
}

function checkJupiterVenusClose(chart: any): boolean {
    const jupiter = chart.planets.find((p: any) => p.name === 'Jupiter');
    const venus = chart.planets.find((p: any) => p.name === 'Venus');

    if (!jupiter || !venus) return false;

    const diff = Math.abs(jupiter.longitude - venus.longitude);
    const actualDiff = Math.min(diff, 360 - diff);

    return actualDiff < 8; // Within 8 degrees
}

/**
 * RULE 6: லக்னப் பொருத்தம் (Lagna Compatibility)
 */
export interface LagnaMatchResult {
    compatible: boolean;
    score: number;
    matchType: 'Same' | 'Trikona' | 'Friendly' | 'Neutral' | '6-8' | 'Enemy';
    details: string[];
}

export function analyzeLagnaMatch(boyChart: any, girlChart: any): LagnaMatchResult {
    const boyLagna = boyChart.planets[0].signIndex;
    const girlLagna = girlChart.planets[0].signIndex;

    const result: LagnaMatchResult = {
        compatible: true,
        score: 100,
        matchType: 'Neutral',
        details: []
    };

    // Same Lagna (Eka Lagna)
    if (boyLagna === girlLagna) {
        result.matchType = 'Same';
        result.score = 95;
        result.details.push("✓ Same Lagna - Excellent match");
        return result;
    }

    // Trikona (Trines) - 1-5-9 relationship
    const signDiff = Math.abs(boyLagna - girlLagna);
    if (signDiff === 4 || signDiff === 8) {
        result.matchType = 'Trikona';
        result.score = 90;
        result.details.push("✓ Trikona Lagnas - Very good match");
        return result;
    }

    // Check element compatibility
    const boyElement = getElement(boyLagna);
    const girlElement = getElement(girlLagna);

    if (boyElement === girlElement) {
        result.matchType = 'Friendly';
        result.score = 85;
        result.details.push(`✓ Same element (${boyElement}) - Good compatibility`);
        return result;
    }

    // 6-8 relationship (Shashtashtakam) - Generally avoid
    if (signDiff === 5 || signDiff === 7) {
        result.matchType = '6-8';
        result.score = 40;
        result.compatible = false;
        result.details.push("⚠️ 6-8 relationship - Generally not recommended");

        // Check if lords are friends - exception
        const boyLord = getHouseLord(boyLagna);
        const girlLord = getHouseLord(girlLagna);
        if (arePlanetsFriends(boyLord, girlLord)) {
            result.score = 70;
            result.compatible = true;
            result.details.push("Exception: Lagna lords are friends - Can work");
        }
        return result;
    }

    // Neutral
    result.score = 75;
    result.details.push("Neutral Lagna match - Moderate compatibility");

    return result;
}

function getElement(signIndex: number): string {
    const elements: Record<number, string> = {
        0: 'Fire', 4: 'Fire', 8: 'Fire',        // Aries, Leo, Sagittarius
        1: 'Earth', 5: 'Earth', 9: 'Earth',     // Taurus, Virgo, Capricorn
        2: 'Air', 6: 'Air', 10: 'Air',           // Gemini, Libra, Aquarius
        3: 'Water', 7: 'Water', 11: 'Water'      // Cancer, Scorpio, Pisces
    };
    return elements[signIndex] || 'Unknown';
}

function arePlanetsFriends(planet1: string, planet2: string): boolean {
    const friendships: Record<string, string[]> = {
        'Sun': ['Moon', 'Mars', 'Jupiter'],
        'Moon': ['Sun', 'Mercury'],
        'Mars': ['Sun', 'Moon', 'Jupiter'],
        'Mercury': ['Sun', 'Venus'],
        'Jupiter': ['Sun', 'Moon', 'Mars'],
        'Venus': ['Mercury', 'Saturn'],
        'Saturn': ['Mercury', 'Venus']
    };

    return friendships[planet1]?.includes(planet2) || false;
}

/**
 * RULE 7: வெளிநாட்டு யோகம் (Foreign Settlement - 8-12 Rule)
 */
export interface ForeignSettlementResult {
    compatible: boolean;
    score: number;
    boyForeignYoga: boolean;
    girlForeignYoga: boolean;
    boyLocalYoga: boolean;
    girlLocalYoga: boolean;
    conflictWarning: boolean;
    details: string[];
}

export function analyzeForeignSettlement(
    boyChart: any,
    girlChart: any
): ForeignSettlementResult {
    const result: ForeignSettlementResult = {
        compatible: true,
        score: 100,
        boyForeignYoga: false,
        girlForeignYoga: false,
        boyLocalYoga: false,
        girlLocalYoga: false,
        conflictWarning: false,
        details: []
    };

    // Check 8th and 12th house Subathuvam for foreign yoga
    const boyHouseAnalysis = calculateHouseSubathuvamPavathuvam(
        boyChart.planets[0].signIndex,
        boyChart.planets,
        'en'
    );

    const girlHouseAnalysis = calculateHouseSubathuvamPavathuvam(
        girlChart.planets[0].signIndex,
        girlChart.planets,
        'en'
    );

    // Boy's foreign/local tendency
    const boy8thSuba = boyHouseAnalysis[8]?.subathuvam?.score || 0;
    const boy12thSuba = boyHouseAnalysis[12]?.subathuvam?.score || 0;
    const boy4thSuba = boyHouseAnalysis[4]?.subathuvam?.score || 0;

    result.boyForeignYoga = (boy8thSuba > 60 || boy12thSuba > 60);
    result.boyLocalYoga = (boy4thSuba > 70);

    // Girl's foreign/local tendency
    const girl8thSuba = girlHouseAnalysis[8]?.subathuvam?.score || 0;
    const girl12thSuba = girlHouseAnalysis[12]?.subathuvam?.score || 0;
    const girl4thSuba = girlHouseAnalysis[4]?.subathuvam?.score || 0;

    result.girlForeignYoga = (girl8thSuba > 60 || girl12thSuba > 60);
    result.girlLocalYoga = (girl4thSuba > 70);

    // Check conflict
    if (result.boyForeignYoga && result.girlLocalYoga) {
        result.conflictWarning = true;
        result.compatible = false;
        result.score = 30;
        result.details.push("⚠️ Boy has foreign settlement yoga, Girl prefers local - Separation risk");
    } else if (result.boyLocalYoga && result.girlForeignYoga) {
        result.conflictWarning = true;
        result.compatible = false;
        result.score = 30;
        result.details.push("⚠️ Girl has foreign settlement yoga, Boy prefers local - Separation risk");
    } else if (result.boyForeignYoga && result.girlForeignYoga) {
        result.score = 100;
        result.details.push("✓ Both have foreign settlement yoga - Compatible");
    } else if (result.boyLocalYoga && result.girlLocalYoga) {
        result.score = 100;
        result.details.push("✓ Both prefer local settlement - Compatible");
    } else {
        result.score = 85;
        result.details.push("Neutral - No strong foreign/local preference in either chart");
    }

    return result;
}

/**
 * MAIN FUNCTION: Complete Marriage Compatibility Analysis
 * Combines all 7 Aditya Guruji rules
 */
export interface ComprehensiveMatchResult {
    overallScore: number;
    verdict: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Risky' | 'Poor' | 'Rejected';
    autoReject: boolean;
    autoRejectReasons: string[];

    // Individual rule results
    dasaSync: DasaSyncResult;
    doshaBalance: DoshaBalanceResult;
    house7th: House7Result;
    venusAnalysis: VenusAnalysisResult;
    jupiterVenus: JupiterVenusResult;
    lagnaMatch: LagnaMatchResult;
    foreignSettlement: ForeignSettlementResult;

    // Summary
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

export function analyzeComprehensiveMarriageMatch(
    boyChart: any,
    girlChart: any,
    marriageDate: Date = new Date()
): ComprehensiveMatchResult {
    // Run all 7 rules
    const dasaSync = analyzeDasaSynchronization(boyChart, girlChart, marriageDate);
    const doshaBalance = analyzeDoshaBalance(boyChart, girlChart);
    const house7th = analyze7thHouse(boyChart, girlChart);
    const venusAnalysis = analyzeVenus(boyChart, girlChart);
    const jupiterVenus = analyzeJupiterVenusConjunction(boyChart, girlChart);
    const lagnaMatch = analyzeLagnaMatch(boyChart, girlChart);
    const foreignSettlement = analyzeForeignSettlement(boyChart, girlChart);

    // Check auto-reject
    const autoReject = dasaSync.autoReject;
    const autoRejectReasons: string[] = [];

    if (dasaSync.autoReject) {
        autoRejectReasons.push(dasaSync.autoRejectReason || 'Dasa synchronization issue');
    }

    // Calculate weighted overall score
    const weights = {
        dasaSync: 0.35,        // 35% - Most important
        doshaBalance: 0.15,    // 15%
        house7th: 0.15,        // 15%
        venusAnalysis: 0.10,   // 10%
        jupiterVenus: 0.10,    // 10%
        lagnaMatch: 0.10,      // 10%
        foreignSettlement: 0.05 // 5%
    };

    const overallScore = autoReject ? 0 : Math.round(
        dasaSync.score * weights.dasaSync +
        doshaBalance.score * weights.doshaBalance +
        house7th.score * weights.house7th +
        venusAnalysis.score * weights.venusAnalysis +
        jupiterVenus.score * weights.jupiterVenus +
        lagnaMatch.score * weights.lagnaMatch +
        foreignSettlement.score * weights.foreignSettlement
    );

    // Determine verdict
    let verdict: ComprehensiveMatchResult['verdict'];
    if (autoReject) {
        verdict = 'Rejected';
    } else if (overallScore >= 85) {
        verdict = 'Excellent';
    } else if (overallScore >= 75) {
        verdict = 'Very Good';
    } else if (overallScore >= 65) {
        verdict = 'Good';
    } else if (overallScore >= 55) {
        verdict = 'Average';
    } else if (overallScore >= 40) {
        verdict = 'Risky';
    } else {
        verdict = 'Poor';
    }

    // Collect strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (dasaSync.score >= 70) strengths.push("Good Dasa-Bhukti synchronization");
    else weaknesses.push("Dasa-Bhukti compatibility issues");

    if (doshaBalance.balanced) strengths.push("Well-balanced dosha levels");
    else weaknesses.push("Dosha imbalance");

    if (lagnaMatch.score >= 85) strengths.push("Excellent Lagna compatibility");
    else if (lagnaMatch.score < 60) weaknesses.push("Poor Lagna match");

    if (!foreignSettlement.conflictWarning) strengths.push("No foreign settlement conflict");
    else weaknesses.push("Foreign settlement mismatch");

    // Generate recommendations
    const recommendations: string[] = [];

    if (house7th.lateMarriageRecommended) {
        recommendations.push("Late marriage (after 28-30 years) is recommended");
    }

    if (dasaSync.childrenPredictedYear) {
        recommendations.push(`Children likely around ${dasaSync.childrenPredictedYear}`);
    } else {
        recommendations.push("Children timing may be delayed - consult astrologer");
    }

    if (venusAnalysis.conjugalIssuesWarning || jupiterVenus.delayWarning) {
        recommendations.push("Focus on building emotional compatibility");
    }

    if (doshaBalance.score < 70) {
        recommendations.push("Perform dosha cancellation remedies before marriage");
    }

    if (foreignSettlement.conflictWarning) {
        recommendations.push("Discuss foreign settlement plans thoroughly before marriage");
    }

    return {
        overallScore,
        verdict,
        autoReject,
        autoRejectReasons,
        dasaSync,
        doshaBalance,
        house7th,
        venusAnalysis,
        jupiterVenus,
        lagnaMatch,
        foreignSettlement,
        strengths,
        weaknesses,
        recommendations
    };
}

// Export all rules
export {
    // All functions already exported above
};

