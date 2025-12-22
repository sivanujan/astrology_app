// Marriage Matching Core Logic - Adhiya Guruji Method
// Implements comprehensive Guruji system with aspect-based analysis and auto-reject criteria

import { calculatePlanetaryPositions, calculateDashaPeriods, getCurrentDasha, ChartData } from './astrology';
import { analyzeChartNature } from './vedicAspects';
import {
    checkLagnaQualityMatch,
    check5thHouseMatch,
    check8thHouseSafety,
    check2ndHouseWealth,
    check12thHouseSettlement,
    GurujiCompatibilityCheck
} from './gurujiRules';
import {
    generate10YearForecast,
    detectSeparativeDasa,
    check6to8Relationship,
    getCurrentMahaDasa
} from './dasaPrediction';

export interface PersonMatchingData {
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

export interface MatchingResult {
    overallScore: number;
    verdict: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Risky' | 'Poor';
    autoReject: boolean;
    autoRejectReasons: string[];
    lagnaAnalysis: LagnaMatchResult;
    houseMatching: HouseMatchingResult;
    dasaMatching: DasaMatchResult;
    recommendations: string[];
}

export interface LagnaMatchResult {
    boyType: 'Subathuvam' | 'Pavathuvam' | 'Mixed';
    girlType: 'Subathuvam' | 'Pavathuvam' | 'Mixed';
    compatible: boolean;
    score: number;
    details: string;
}

export interface HouseMatchingResult {
    house2: { compatible: boolean; score: number; details: string };
    house5: { compatible: boolean; score: number; details: string };
    house7: { compatible: boolean; score: number; details: string };
    house8: { compatible: boolean; score: number; details: string };
    house12: {
        compatible: boolean;
        score: number;
        details: string;
        boyYoga: 'Foreign' | 'Local';
        girlYoga: 'Foreign' | 'Local';
    };
    overallScore: number;
}

export interface DasaMatchResult {
    boyCurrentDasa: string;
    girlCurrentDasa: string;
    boyCurrentBhukti: string;
    girlCurrentBhukti: string;
    currentCompatible: boolean;
    sixEightRelationship: boolean;
    futureSeparationRisk: boolean;
    futureProblems: Array<{
        period: string;
        issue: string;
        severity: 'high' | 'medium' | 'low';
    }>;
    nextTenYears: Array<{
        year: number;
        boyMahaDasa: string;
        boyBhukti: string;
        girlMahaDasa: string;
        girlBhukti: string;
        compatible: boolean;
        issues: string[];
    }>;
    score: number;
    details: string;
}

/**
 * Main function to analyze marriage compatibility
 */
export async function analyzeMarriageCompatibility(
    boy: PersonMatchingData,
    girl: PersonMatchingData
): Promise<MatchingResult> {
    // Generate charts for both
    const boyChart = generateChart(boy);
    const girlChart = generateChart(girl);

    // GURUJI METHOD: Comprehensive analysis with auto-reject criteria

    // STEP 1: Chart Quality Analysis (Aspect-based Subathuvam/Pavathuvam)
    const boyNature = analyzeChartNature(boyChart);
    const girlNature = analyzeChartNature(girlChart);
    const lagnaQualityCheck = checkLagnaQualityMatch(boyChart, girlChart);

    // STEP 2: Critical 5 Houses Analysis (with auto-reject)
    const house5Check = check5thHouseMatch(boyChart, girlChart);
    const house8BoyCheck = check8thHouseSafety(boyChart, girlChart, 'boy');
    const house8GirlCheck = check8thHouseSafety(girlChart, boyChart, 'girl');
    const house2Check = check2ndHouseWealth(boyChart, girlChart);
    const house12Check = check12thHouseSettlement(
        boyChart,
        girlChart,
        boy.birthPlace,
        boy.currentPlace,
        girl.birthPlace,
        girl.currentPlace
    );

    // STEP 3: Dasa-Bhukti Analysis (Current + 10-year forecast)
    const boyBirthDate = new Date(`${boy.date}T${boy.time}`);
    const girlBirthDate = new Date(`${girl.date}T${girl.time}`);

    // Use existing working Dasa calculation functions
    const boyMoon = boyChart.planets.find((p: any) => p.name === 'Moon');
    const girlMoon = girlChart.planets.find((p: any) => p.name === 'Moon');

    if (!boyMoon || !girlMoon) {
        throw new Error('Moon position not found in charts');
    }

    // Calculate Dasa periods using existing function
    console.log('=== BIRTH DATE DEBUG ===');
    console.log('Boy date string:', boy.date, boy.time);
    console.log('Boy birth date object:', boyBirthDate);
    console.log('Girl date string:', girl.date, girl.time);
    console.log('Girl birth date object:', girlBirthDate);
    console.log('Current date:', new Date());

    const boyDasaPeriods = calculateDashaPeriods(boyBirthDate, boyMoon.longitude);
    const girlDasaPeriods = calculateDashaPeriods(girlBirthDate, girlMoon.longitude);

    // Get current Dasa using existing function
    const currentBoyDasa = getCurrentDasha(boyDasaPeriods);
    const currentGirlDasa = getCurrentDasha(girlDasaPeriods);

    console.log('=== DASA DEBUG ===');
    console.log('Boy Moon longitude:', boyMoon.longitude);
    console.log('Boy Dasa Periods count:', boyDasaPeriods.length);
    console.log('Current Boy Dasa:', currentBoyDasa);
    console.log('Boy Maha:', currentBoyDasa?.maha?.planet);
    console.log('Boy Bhukti:', currentBoyDasa?.bhukti?.planet);
    console.log('---');
    console.log('Girl Moon longitude:', girlMoon.longitude);
    console.log('Girl Dasa Periods count:', girlDasaPeriods.length);
    console.log('Current Girl Dasa:', currentGirlDasa);
    console.log('Girl Maha:', currentGirlDasa?.maha?.planet);
    console.log('Girl Bhukti:', currentGirlDasa?.bhukti?.planet);
    console.log('==================');

    // Get 10-year forecast
    const tenYearForecast = generate10YearForecast(boyChart, girlChart, boyBirthDate, girlBirthDate);

    // Detect separative Dasa for bride (critical within 2-5 years)
    const brideSeparativeDasa = detectSeparativeDasa(girlChart, girlBirthDate, 'girl', 10);
    const groomSeparativeDasa = detectSeparativeDasa(boyChart, boyBirthDate, 'boy', 10);

    // Check current 6-8 relationship using actual current Dasa planets
    const current6to8 = currentBoyDasa?.maha && currentGirlDasa?.maha
        ? check6to8Relationship(currentBoyDasa.maha.planet, currentGirlDasa.maha.planet, boyChart)
        : { is6to8: false, relationship: 'safe' as const, details: 'Dasa not available' };

    // STEP 4: Collect all auto-reject reasons (Guruji criteria)
    const autoRejectReasons: string[] = [];
    let autoReject = false;

    const checks: GurujiCompatibilityCheck[] = [
        lagnaQualityCheck,
        house5Check,
        house8BoyCheck,
        house8GirlCheck,
        house2Check,
        house12Check
    ];

    // Add Guruji auto-reject reasons
    checks.forEach(check => {
        if (check.autoReject) {
            autoReject = true;
            autoRejectReasons.push(check.reason);
        }
    });

    // Auto-reject: Current 6-8 Dasa relationship
    if (current6to8.is6to8) {
        autoReject = true;
        autoRejectReasons.push('CRITICAL: Current Dasa planets in 6-8 relationship. சண்டை சச்சரவுகள் - Constant ego clashes.');
    }

    // Auto-reject: Bride's separative Dasa within 2-5 years (GURUJI'S MOST IMPORTANT RULE)
    const criticalSeparativeDasa = brideSeparativeDasa.find(d => d.autoReject);
    if (criticalSeparativeDasa) {
        autoReject = true;
        autoRejectReasons.push(`ABSOLUTE REJECT: Bride has separative Dasa (${criticalSeparativeDasa.dasaLord}) in year ${criticalSeparativeDasa.whenOccurs}. ரத்து தசை - ${criticalSeparativeDasa.reason}`);
    }

    // Auto-reject: Multiple critical years (5+ out of 10)
    const criticalYears = tenYearForecast.filter(y => y.combinedAssessment === 'Critical');
    if (criticalYears.length >= 5) {
        autoReject = true;
        autoRejectReasons.push(`CRITICAL: Too many critical years (${criticalYears.length} out of 10) in the next decade. This indicates severe ongoing challenges.`);
    }

    // Placeholder for old analysis results, will be replaced by Guruji's scoring
    const lagnaAnalysis: LagnaMatchResult = {
        boyType: boyNature.overallNature,
        girlType: girlNature.overallNature,
        compatible: lagnaQualityCheck.passed,
        score: lagnaQualityCheck.passed ? 10 : 0,
        details: lagnaQualityCheck.reason
    };

    const houseMatching: HouseMatchingResult = {
        house2: {
            compatible: house2Check.passed,
            score: house2Check.passed ? (house2Check.severity === 'low' ? 10 : 7) : 0,
            details: house2Check.reason
        },
        house5: {
            compatible: house5Check.passed,
            score: house5Check.passed ? (house5Check.severity === 'low' ? 10 : house5Check.severity === 'medium' ? 7 : 3) : 0,
            details: house5Check.reason
        },
        house7: {
            compatible: true,
            score: 7,
            details: "7th house physical compatibility - moderate"
        },
        house8: {
            compatible: house8BoyCheck.passed && house8GirlCheck.passed,
            score: (house8BoyCheck.passed ? 5 : 0) + (house8GirlCheck.passed ? 5 : 0),
            details: `Boy: ${house8BoyCheck.reason} | Girl: ${house8GirlCheck.reason}`
        },
        house12: {
            compatible: house12Check.passed,
            score: house12Check.passed ? 10 : 0,
            details: house12Check.reason,
            boyYoga: house12Check.reason.includes('Foreign') ? 'Foreign' : 'Local',
            girlYoga: house12Check.reason.includes('Foreign') ? 'Foreign' : 'Local'
        },
        overallScore: 0 // Will calculate below
    };

    houseMatching.overallScore = (
        houseMatching.house2.score +
        houseMatching.house5.score * 2 + // 5th house weighted more
        houseMatching.house7.score +
        houseMatching.house8.score * 1.5 + // 8th house weighted more
        houseMatching.house12.score
    ) / 7.5;

    const dasaMatching: DasaMatchResult = {
        boyCurrentDasa: currentBoyDasa?.maha?.planet || 'Unknown',
        girlCurrentDasa: currentGirlDasa?.maha?.planet || 'Unknown',
        boyCurrentBhukti: currentBoyDasa?.bhukti?.planet || 'Unknown',
        girlCurrentBhukti: currentGirlDasa?.bhukti?.planet || 'Unknown',
        currentCompatible: !current6to8.is6to8,
        sixEightRelationship: current6to8.is6to8,
        futureSeparationRisk: brideSeparativeDasa.some(d => d.autoReject) || groomSeparativeDasa.some(d => d.autoReject),
        futureProblems: tenYearForecast
            .filter(y => y.combinedAssessment === 'Critical')
            .map(y => ({
                period: `Year ${y.year}`,
                issue: y.specificIssues.join(', ') || 'Critical period',
                severity: 'high' as const
            })),
        nextTenYears: tenYearForecast.map(y => ({
            year: y.year,
            boyMahaDasa: y.groom.mahaDasa,
            boyBhukti: y.groom.antarDasa,
            girlMahaDasa: y.bride.mahaDasa,
            girlBhukti: y.bride.antarDasa,
            compatible: y.combinedAssessment !== 'Critical',
            issues: y.specificIssues
        })),
        score: Math.max(0, 100 - (criticalYears.length * 10) - (current6to8.is6to8 ? 30 : 0)),
        details: `Current: Boy ${currentBoyDasa?.maha?.planet || 'Unknown'}/${currentBoyDasa?.bhukti?.planet || 'Unknown'}, Girl ${currentGirlDasa?.maha?.planet || 'Unknown'}/${currentGirlDasa?.bhukti?.planet || 'Unknown'}. 10-year outlook: ${criticalYears.length} critical years.`
    };


    const overallScore = calculateOverallScore(lagnaAnalysis, houseMatching, dasaMatching);

    // Determine verdict
    let verdict: MatchingResult['verdict'];
    if (autoReject || overallScore < 50) verdict = 'Poor';
    else if (overallScore < 60) verdict = 'Risky';
    else if (overallScore < 70) verdict = 'Average';
    else if (overallScore < 80) verdict = 'Good';
    else if (overallScore < 90) verdict = 'Very Good';
    else verdict = 'Excellent';

    // Generate recommendations
    const recommendations = generateRecommendations(
        lagnaAnalysis,
        houseMatching,
        dasaMatching,
        verdict,
        boy,
        girl
    );

    return {
        overallScore,
        verdict,
        autoReject,
        autoRejectReasons,
        lagnaAnalysis,
        houseMatching,
        dasaMatching,
        recommendations
    };
}

/**
 * Generate astrological chart for a person
 */
function generateChart(person: PersonMatchingData): any {
    const birthDate = new Date(`${person.date}T${person.time}`);
    const chart = calculatePlanetaryPositions(birthDate, person.birthLat, person.birthLng);
    return {
        ...chart,
        birthDate // Add birthDate for Dasa calculation
    };
}

/**
 * Analyze Lagna quality (Subathuvam vs Pavathuvam)
 */
function analyzeLagnaQuality(boyChart: ChartData, girlChart: ChartData): LagnaMatchResult {
    // Get planets aspecting/occupying Lagna for both
    const boyLagnaInfluences = getPlanetaryInfluences(boyChart, 1); // 1 = Lagna/Ascendant
    const girlLagnaInfluences = getPlanetaryInfluences(girlChart, 1);

    // Classify chart types
    const boyType = classifyChartType(boyLagnaInfluences);
    const girlType = classifyChartType(girlLagnaInfluences);

    // Check compatibility
    const compatible =
        (boyType === girlType) || // Same type = compatible
        (boyType === 'Mixed' || girlType === 'Mixed'); // Mixed can adjust

    const score = compatible ? 10 :
        (boyType === 'Mixed' || girlType === 'Mixed') ? 6 : 2;

    const details = `Boy: ${boyType} nature. Girl: ${girlType} nature. ${compatible
        ? 'Both have similar temperament - will understand each other well.'
        : 'Different temperaments - may face communication issues.'
        }`;

    return { boyType, girlType, compatible, score, details };
}

/**
 * Get planetary influences on a house
 */
function getPlanetaryInfluences(chart: ChartData, house: number): string[] {
    const influences: string[] = [];
    const houseSign = getHouseSign(chart, house);

    // Check planets in the house
    Object.entries(chart.planets).forEach(([planet, data]) => {
        if (getSignNumber(data.sign) === houseSign) {
            influences.push(planet);
        }
    });

    // TODO: Add aspect calculation
    // For now, simplified version

    return influences;
}

/**
 * Classify chart type based on planetary influences
 */
function classifyChartType(influences: string[]): 'Subathuvam' | 'Pavathuvam' | 'Mixed' {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

    const beneficCount = influences.filter(p => benefics.includes(p)).length;
    const maleficCount = influences.filter(p => malefics.includes(p)).length;

    if (beneficCount > maleficCount) return 'Subathuvam';
    if (maleficCount > beneficCount) return 'Pavathuvam';
    return 'Mixed';
}

/**
 * Analyze 5 critical houses
 */
function analyzeHouses(
    boyChart: ChartData,
    girlChart: ChartData,
    boy: PersonMatchingData,
    girl: PersonMatchingData
): HouseMatchingResult {
    const house2 = analyzeHouse2(boyChart, girlChart);
    const house5 = analyzeHouse5(boyChart, girlChart);
    const house7 = analyzeHouse7(boyChart, girlChart);
    const house8 = analyzeHouse8(boyChart, girlChart, boy, girl);
    const house12 = analyzeHouse12(boyChart, girlChart, boy, girl);

    const overallScore = (
        house2.score +
        house5.score * 2 + // 5th house is most critical
        house7.score +
        house8.score * 1.5 + // 8th house is very important
        house12.score
    ) / 6.5;

    return { house2, house5, house7, house8, house12, overallScore };
}

function analyzeHouse2(boyChart: ChartData, girlChart: ChartData) {
    // Simplified: Check if at least one has a strong 2nd house
    const boyStrength = getHouseStrength(boyChart, 2);
    const girlStrength = getHouseStrength(girlChart, 2);

    const compatible = boyStrength > 5 || girlStrength > 5;
    const score = Math.max(boyStrength, girlStrength);
    const details = compatible
        ? 'At least one partner has strong family/wealth indicators'
        : 'Both have weak 2nd house - may face financial challenges';

    return { compatible, score, details };
}

function analyzeHouse5(boyChart: ChartData, girlChart: ChartData) {
    // CRITICAL: Check children yoga
    const boyStrength = getHouseStrength(boyChart, 5);
    const girlStrength = getHouseStrength(girlChart, 5);

    const compatible = boyStrength > 4 || girlStrength > 4;
    const score = compatible ? Math.max(boyStrength, girlStrength) : Math.min(boyStrength, girlStrength);

    const details = !compatible && boyStrength < 4 && girlStrength < 4
        ? 'CRITICAL: Both have severely afflicted 5th house - Children yoga questionable'
        : compatible
            ? 'Good children yoga - one or both have strong 5th house'
            : 'Moderate children yoga';

    return { compatible, score, details };
}

function analyzeHouse7(boyChart: ChartData, girlChart: ChartData) {
    const boyStrength = getHouseStrength(boyChart, 7);
    const girlStrength = getHouseStrength(girlChart, 7);

    const diff = Math.abs(boyStrength - girlStrength);
    const compatible = diff < 4;
    const score = 10 - diff;

    const details = compatible
        ? 'Similar sexual desire levels - compatible expectations'
        : 'Mismatch in desire levels - may cause dissatisfaction';

    return { compatible, score, details };
}

function analyzeHouse8(boyChart: ChartData, girlChart: ChartData, boy: PersonMatchingData, girl: PersonMatchingData) {
    const boyStrength = getHouseStrength(boyChart, 8);
    const girlStrength = getHouseStrength(girlChart, 8);

    // Check 8th house for Subathuvam (movement tendency)
    const boy8thInfluences = getPlanetaryInfluences(boyChart, 8);
    const girl8thInfluences = getPlanetaryInfluences(girlChart, 8);

    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const boyBeneficCount = boy8thInfluences.filter(p => benefics.includes(p)).length;
    const girlBeneficCount = girl8thInfluences.filter(p => benefics.includes(p)).length;

    const boy8thSubathuvam = boyBeneficCount > 0 || boyStrength > 6;
    const girl8thSubathuvam = girlBeneficCount > 0 || girlStrength > 6;

    // Validate with actual movement
    const boyHasMoved = boy.birthPlace !== boy.currentPlace;
    const girlHasMoved = girl.birthPlace !== girl.currentPlace;

    const compatible = boyStrength > 5 && girlStrength > 5;
    const score = Math.min(boyStrength, girlStrength);

    let details = '';
    if (!compatible) {
        details = '⚠️ Longevity concerns - one or both charts show health/lifespan issues. ';
    } else {
        details = '✅ Good longevity indicators for both. ';
    }

    // Add movement analysis
    if (boy8thSubathuvam && boyHasMoved) {
        details += 'Boy: 8th House Subathuvam confirmed - has moved from birthplace. ';
    } else if (boy8thSubathuvam && !boyHasMoved) {
        details += 'Boy: 8th House shows movement yoga, but currently in birthplace. ';
    }

    if (girl8thSubathuvam && girlHasMoved) {
        details += 'Girl: 8th House Subathuvam confirmed - has moved from birthplace.';
    } else if (girl8thSubathuvam && !girlHasMoved) {
        details += 'Girl: 8th House shows movement yoga, but currently in birthplace.';
    }

    return { compatible, score, details };
}

function analyzeHouse12(
    boyChart: ChartData,
    girlChart: ChartData,
    boy: PersonMatchingData,
    girl: PersonMatchingData
) {
    // Determine 12th house yoga for each person
    const boy12thHouseStrength = getHouseStrength(boyChart, 12);
    const girl12thHouseStrength = getHouseStrength(girlChart, 12);

    // Get 12th house influences
    const boy12thInfluences = getPlanetaryInfluences(boyChart, 12);
    const girl12thInfluences = getPlanetaryInfluences(girlChart, 12);

    // Classify 12th house as Subathuva (Foreign) or Pavathuva (Local)
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];

    const boyBeneficCount = boy12thInfluences.filter(p => benefics.includes(p)).length;
    const boyMaleficCount = boy12thInfluences.filter(p => malefics.includes(p)).length;
    const boyYoga: 'Foreign' | 'Local' = (boyBeneficCount > boyMaleficCount || boy12thHouseStrength > 5) ? 'Foreign' : 'Local';

    const girlBeneficCount = girl12thInfluences.filter(p => benefics.includes(p)).length;
    const girlMaleficCount = girl12thInfluences.filter(p => malefics.includes(p)).length;
    const girlYoga: 'Foreign' | 'Local' = (girlBeneficCount > girlMaleficCount || girl12thHouseStrength > 5) ? 'Foreign' : 'Local';

    // Validate with current living place
    const boyHasMoved = boy.birthPlace !== boy.currentPlace;
    const girlHasMoved = girl.birthPlace !== girl.currentPlace;

    // Check compatibility
    const compatible = (boyYoga === girlYoga);
    const score = compatible ? 10 : 3;

    let details = '';
    if (boyYoga === 'Foreign' && girlYoga === 'Foreign') {
        details = '🌍 Excellent Match! Both have Foreign Yoga (12th House Subathuva). Both will go abroad or to a different city and live together happily.';
        if (boyHasMoved && girlHasMoved) {
            details += ' ✓ Validated: Both have already moved from birthplace.';
        }
    } else if (boyYoga === 'Local' && girlYoga === 'Local') {
        details = '🏠 Excellent Match! Both have Local Yoga (12th House Pavathuva). Both will stay in their native town/country and live together happily.';
        if (!boyHasMoved && !girlHasMoved) {
            details += ' ✓ Validated: Both are still in birthplace.';
        }
    } else if (boyYoga === 'Foreign' && girlYoga === 'Local') {
        details = '⚠️ DO NOT MATCH! Groom has Foreign Yoga, Bride has Local Yoga. The husband will go away for work (Abroad/Outstation), and the wife will be forced to stay back alone. Separation occurs.';
        if (boyHasMoved && !girlHasMoved) {
            details += ' ⛔ CRITICAL: Pattern already visible - Groom has moved, Bride still in hometown!';
        }
    } else { // boyYoga === 'Local' && girlYoga === 'Foreign'
        details = '⚠️ DO NOT MATCH! Bride has Foreign Yoga, Groom has Local Yoga. Similar result. One person wants to move out, the other is tied to the native place. Friction and separation happen.';
        if (!boyHasMoved && girlHasMoved) {
            details += ' ⛔ CRITICAL: Pattern already visible - Bride has moved, Groom still in hometown!';
        }
    }

    return { compatible, score, details, boyYoga, girlYoga };
}

/**
 * Simplified house strength calculation
 */
function getHouseStrength(chart: ChartData, house: number): number {
    // Simplified scoring - actual implementation would be much more complex
    const houseSign = getHouseSign(chart, house);
    let strength = 5; // Base strength

    // Count benefic planets
    Object.entries(chart.planets).forEach(([planet, data]) => {
        if (getSignNumber(data.sign) === houseSign) {
            if (['Jupiter', 'Venus', 'Mercury'].includes(planet)) strength += 2;
            if (['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(planet)) strength -= 1;
        }
    });

    return Math.max(0, Math.min(10, strength));
}

function getHouseSign(chart: ChartData, house: number): number {
    const ascendantSign = getSignNumber(chart.ascendant);
    return ((ascendantSign + house - 2) % 12) + 1;
}

function getSignNumber(sign: string): number {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs.indexOf(sign) + 1;
}

/**
 * Analyze Dasa-Bhukti timing
 */
function analyzeDasaTiming(boyChart: any, girlChart: any): DasaMatchResult {
    // Find Moon from planets array
    const boyMoon = boyChart.planets?.find((p: any) => p.name === 'Moon');
    const girlMoon = girlChart.planets?.find((p: any) => p.name === 'Moon');

    // Check if Moon data exists
    if (!boyMoon || !girlMoon) {
        console.warn('Moon data missing for Dasa calculation');
        return {
            boyCurrentDasa: 'Unknown',
            girlCurrentDasa: 'Unknown',
            boyCurrentBhukti: 'Unknown',
            girlCurrentBhukti: 'Unknown',
            currentCompatible: true,
            sixEightRelationship: false,
            futureSeparationRisk: false,
            futureProblems: [],
            nextTenYears: [],
            score: 7,
            details: 'Dasa analysis unavailable - Moon position data missing'
        };
    }

    try {
        // Calculate Dasa periods for both using Moon longitude
        const boyDasaPeriods = calculateDashaPeriods(
            new Date(boyChart.birthDate),
            boyMoon.longitude
        );
        const girlDasaPeriods = calculateDashaPeriods(
            new Date(girlChart.birthDate),
            girlMoon.longitude
        );

        // Get current Dasa for both
        const boyCurrentDasa = getCurrentDasha(boyDasaPeriods);
        const girlCurrentDasa = getCurrentDasha(girlDasaPeriods);

        const boyMahaDasa = boyCurrentDasa?.maha?.planet || 'Unknown';
        const girlMahaDasa = girlCurrentDasa?.maha?.planet || 'Unknown';
        const boyBhukti = boyCurrentDasa?.bhukti?.planet || 'Unknown';
        const girlBhukti = girlCurrentDasa?.bhukti?.planet || 'Unknown';

        // Check 6-8 relationship between Maha Dasa planets
        const sixEightRelationship = isSixEightRelationship(boyMahaDasa, girlMahaDasa);

        // Check for future separation risk (simplified)
        const futureSeparationRisk = checkFutureSeparationRisk(boyCurrentDasa, girlCurrentDasa);

        const currentCompatible = !sixEightRelationship && !futureSeparationRisk;
        const score = currentCompatible ? 10 : sixEightRelationship ? 2 : 6;

        const details = sixEightRelationship
            ? `Boy: ${boyMahaDasa} Dasa, Girl: ${girlMahaDasa} Dasa - 6-8 relationship causes constant ego clashes and conflicts`
            : futureSeparationRisk
                ? `Current timing shows potential separation tendencies in upcoming periods`
                : `Boy: ${boyMahaDasa}/${boyBhukti}, Girl: ${girlMahaDasa}/${girlBhukti} - Compatible timing for marriage`;

        // Analyze next 10 years
        const futureAnalysis = analyzeNext10Years(boyDasaPeriods, girlDasaPeriods);

        return {
            boyCurrentDasa: boyMahaDasa,
            girlCurrentDasa: girlMahaDasa,
            boyCurrentBhukti: boyBhukti,
            girlCurrentBhukti: girlBhukti,
            currentCompatible,
            sixEightRelationship,
            futureSeparationRisk,
            futureProblems: futureAnalysis.problems,
            nextTenYears: futureAnalysis.yearByYear,
            score: futureAnalysis.overallScore,
            details
        };
    } catch (error) {
        console.error('Error in Dasa calculation:', error);
        return {
            boyCurrentDasa: 'Error',
            girlCurrentDasa: 'Error',
            boyCurrentBhukti: 'Error',
            girlCurrentBhukti: 'Error',
            currentCompatible: true,
            sixEightRelationship: false,
            futureSeparationRisk: false,
            futureProblems: [],
            nextTenYears: [],
            score: 7,
            details: 'Error calculating Dasa periods - using default neutral score'
        };
    }
}

/**
 * Analyze next 10 years of Dasa-Bhukti for both partners
 */
function analyzeNext10Years(boyPeriods: any[], girlPeriods: any[]) {
    const now = new Date();
    const tenYearsLater = new Date(now);
    tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);

    const problems: Array<{ period: string; issue: string; severity: 'high' | 'medium' | 'low' }> = [];
    const yearByYear: Array<any> = [];

    // Analyze year by year
    for (let year = 0; year < 10; year++) {
        const checkDate = new Date(now);
        checkDate.setFullYear(checkDate.getFullYear() + year);

        const boyDasa = getCurrentDasha(boyPeriods, checkDate);
        const girlDasa = getCurrentDasha(girlPeriods, checkDate);

        const boyMaha = boyDasa?.maha?.planet || 'Unknown';
        const girlMaha = girlDasa?.maha?.planet || 'Unknown';
        const boyBhukti = boyDasa?.bhukti?.planet || 'Unknown';
        const girlBhukti = girlDasa?.bhukti?.planet || 'Unknown';

        const issues: string[] = [];
        let compatible = true;

        // Check 6-8 relationship
        if (isSixEightRelationship(boyMaha, girlMaha)) {
            issues.push('6-8 Dasa relationship - conflicts');
            compatible = false;
            problems.push({
                period: `Year ${year + 1}: ${boyMaha}/${girlMaha}`,
                issue: '6-8 Maha Dasa relationship will cause ego clashes',
                severity: 'high'
            });
        }

        // Check 6-8 in Bhukti too
        if (isSixEightRelationship(boyBhukti, girlBhukti)) {
            issues.push('6-8 Bhukti relationship');
            compatible = false;
            problems.push({
                period: `Year ${year + 1}: ${boyBhukti}/${girlBhukti} Bhukti`,
                issue: '6-8 Bhukti relationship - temporary conflicts',
                severity: 'medium'
            });
        }

        // Check separation planets
        const separationPlanets = ['Rahu', 'Ketu', 'Saturn'];
        if (separationPlanets.includes(boyMaha) && separationPlanets.includes(girlMaha)) {
            issues.push('Both in separation-prone Dasa');
            problems.push({
                period: `Year ${year + 1}`,
                issue: 'Both in hardship periods - may face separation tendencies',
                severity: 'medium'
            });
        }

        yearByYear.push({
            year: year + 1,
            boyMahaDasa: boyMaha,
            boyBhukti: boyBhukti,
            girlMahaDasa: girlMaha,
            girlBhukti: girlBhukti,
            compatible,
            issues
        });
    }

    // Calculate overall score based on problems
    let overallScore = 10;
    problems.forEach(p => {
        if (p.severity === 'high') overallScore -= 3;
        else if (p.severity === 'medium') overallScore -= 1;
        else overallScore -= 0.5;
    });
    overallScore = Math.max(0, overallScore);

    return { problems, yearByYear, overallScore };
}

/**
 * Check if two planets are in 6-8 relationship
 */
function isSixEightRelationship(planet1: string, planet2: string): boolean {
    // Map planets to their associated signs for 6-8 calculation
    const planetSignMap: Record<string, number[]> = {
        'Sun': [5], // Leo
        'Moon': [4], // Cancer
        'Mars': [1, 8], // Aries, Scorpio
        'Mercury': [3, 6], // Gemini, Virgo
        'Jupiter': [9, 12], // Sagittarius, Pisces
        'Venus': [2, 7], // Taurus, Libra
        'Saturn': [10, 11], // Capricorn, Aquarius
        'Rahu': [11], // Co-ruler of Aquarius
        'Ketu': [8]  // Co-ruler of Scorpio
    };

    const signs1 = planetSignMap[planet1] || [0];
    const signs2 = planetSignMap[planet2] || [0];

    // Check all combinations
    for (const sign1 of signs1) {
        for (const sign2 of signs2) {
            const diff = Math.abs(sign1 - sign2);
            // 6-8 relationship: 6 houses apart or 8 houses apart
            if (diff === 5 || diff === 7 || diff === 6) { // 6th or 8th from each other
                return true;
            }
        }
    }

    return false;
}

/**
 * Check for future separation risk in upcoming Dasa periods
 */
function checkFutureSeparationRisk(boyDasa: any, girlDasa: any): boolean {
    // Simplified: Check if either is entering Rahu/Ketu/Saturn Dasa soon
    // and if 12th lord is involved
    const separationPlanets = ['Rahu', 'Ketu', 'Saturn'];

    const boyInSeparationDasa = boyDasa?.maha?.planet && separationPlanets.includes(boyDasa.maha.planet);
    const girlInSeparationDasa = girlDasa?.maha?.planet && separationPlanets.includes(girlDasa.maha.planet);

    // Both in separation-prone Dasa = higher risk
    return boyInSeparationDasa && girlInSeparationDasa;
}

/**
 * Calculate overall score
 */
function calculateOverallScore(
    lagna: LagnaMatchResult,
    houses: HouseMatchingResult,
    dasa: DasaMatchResult
): number {
    return (lagna.score * 1.5 + houses.overallScore * 10 + dasa.score) / 2.5;
}

/**
 * Generate recommendations
 */
function generateRecommendations(
    lagna: LagnaMatchResult,
    houses: HouseMatchingResult,
    dasa: DasaMatchResult,
    verdict: string,
    boy: PersonMatchingData,
    girl: PersonMatchingData
): string[] {
    const recommendations: string[] = [];

    if (!lagna.compatible) {
        recommendations.push('Consider counseling to bridge temperament differences');
    }

    if (!houses.house5.compatible) {
        recommendations.push('Consult astrologer for remedies to strengthen 5th house for children');
    }

    if (!houses.house12.compatible) {
        recommendations.push('Discuss living arrangements early - one prefers foreign, other hometown');
    }

    if (verdict === 'Excellent' || verdict === 'Very Good') {
        recommendations.push('Excellent match! Proceed with marriage planning');
    } else if (verdict === 'Good') {
        recommendations.push('Good match with minor adjustments needed');
    } else {
        recommendations.push('Careful consideration advised before finalizing');
    }

    return recommendations;
}
