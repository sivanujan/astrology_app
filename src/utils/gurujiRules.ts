import { ChartData } from './astrology';
import { analyzeChartNature, getPlanetsAspectingHouse, isBenefic, isMalefic } from './vedicAspects';
import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';

/**
 * Guruji-specific marriage matching rules and auto-reject criteria
 */

export interface GurujiCompatibilityCheck {
    passed: boolean;
    autoReject: boolean;
    severity: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
    tamilReason: string;
}

/**
 * RULE 1: Lagna Subathuvam/Pavathuvam Compatibility
 * Soft + Soft = OK
 * Tough + Tough = OK  
 * Soft + Tough = REJECT (மென்மையானவர் ஏமாற்றப்படுவார்)
 */
export function checkLagnaQualityMatch(
    boyChart: ChartData,
    girlChart: ChartData
): GurujiCompatibilityCheck {
    const boyNature = analyzeChartNature(boyChart);
    const girlNature = analyzeChartNature(girlChart);

    // Check if natures are compatible
    const bothSoft = boyNature.overallNature === 'Subathuvam' && girlNature.overallNature === 'Subathuvam';
    const bothTough = boyNature.overallNature === 'Pavathuvam' && girlNature.overallNature === 'Pavathuvam';
    const mismatch = (boyNature.overallNature === 'Subathuvam' && girlNature.overallNature === 'Pavathuvam') ||
        (boyNature.overallNature === 'Pavathuvam' && girlNature.overallNature === 'Subathuvam');

    if (bothSoft) {
        return {
            passed: true,
            autoReject: false,
            severity: 'low',
            reason: 'Both have gentle, kind nature (Subathuvam). Will understand each other well.',
            tamilReason: 'இருவரும் மென்மையான குணம் கொண்டவர்கள். ஒருவரை ஒருவர் நன்கு புரிந்துகொள்வார்கள்.'
        };
    } else if (bothTough) {
        return {
            passed: true,
            autoReject: false,
            severity: 'low',
            reason: 'Both have tough, resilient nature (Pavathuvam). Can handle challenges together.',
            tamilReason: 'இருவரும் கடுமையான குணம் கொண்டவர்கள். சேர்ந்து சவால்களை எதிர்கொள்வார்கள்.'
        };
    } else if (mismatch) {
        return {
            passed: false,
            autoReject: true,
            severity: 'critical',
            reason: 'CRITICAL: One has soft nature, other has tough nature. The gentle person will be manipulated/cheated.',
            tamilReason: 'முக்கியம்: ஒருவர் மென்மையான குணம், மற்றவர் கடுமையான குணம். மென்மையானவர் ஏமாற்றப்படுவார்.'
        };
    } else {
        // Mixed natures - acceptable but needs awareness
        return {
            passed: true,
            autoReject: false,
            severity: 'medium',
            reason: 'Balanced natures with mixed qualities. Need mutual understanding.',
            tamilReason: 'சமநிலையான குணங்கள். ஒருவருக்கொருவர் புரிதல் தேவை.'
        };
    }
}

/**
 * RULE 2: 5th House - Children Compatibility
 * MOST CRITICAL: Both damaged = ABSOLUTE REJECT
 */
export function check5thHouseMatch(
    boyChart: ChartData,
    girlChart: ChartData
): GurujiCompatibilityCheck {
    const boy5thStrength = analyze5thHouseStrength(boyChart);
    const girl5thStrength = analyze5thHouseStrength(girlChart);

    // Both damaged = ABSOLUTE REJECT
    if (boy5thStrength.condition === 'Damaged' && girl5thStrength.condition === 'Damaged') {
        return {
            passed: false,
            autoReject: true,
            severity: 'critical',
            reason: 'ABSOLUTELY REJECT: Both have damaged 5th house. No possibility of children.',
            tamilReason: 'முற்றிலும் நிராகரிக்கவும்: இருவருக்கும் 5-ம் இடம் சேதம். குழந்தை பாக்கியம் இல்லை. சேர்க்கவே கூடாது.'
        };
    }

    // One weak but other very strong = Acceptable (compensation)
    if ((boy5thStrength.condition === 'Weak' && girl5thStrength.condition === 'Strong') ||
        (boy5thStrength.condition === 'Strong' && girl5thStrength.condition === 'Weak')) {
        return {
            passed: true,
            autoReject: false,
            severity: 'medium',
            reason: 'One 5th house weak but compensated by other being very strong. Children possible.',
            tamilReason: 'ஒருவருக்கு குறை இருந்தால், மற்றவருக்கு மிக வலுவாக இருக்கிறது. குழந்தை பாக்கியம் உண்டு.'
        };
    }

    // Both strong = Excellent
    if (boy5thStrength.condition === 'Strong' && girl5thStrength.condition === 'Strong') {
        return {
            passed: true,
            autoReject: false,
            severity: 'low',
            reason: 'Excellent! Both have strong 5th house. Good children yoga.',
            tamilReason: 'சிறப்பு! இருவருக்கும் 5-ம் இடம் வலுவாக உள்ளது. நல்ல குழந்தை யோகம்.'
        };
    }

    // Default moderate
    return {
        passed: true,
        autoReject: false,
        severity: 'low',
        reason: '5th house compatibility acceptable.',
        tamilReason: '5-ம் இடம் பொருத்தம் ஏற்கத்தக்கது.'
    };
}

interface House5Strength {
    condition: 'Strong' | 'Moderate' | 'Weak' | 'Damaged';
    details: string;
}

function analyze5thHouseStrength(chart: ChartData): House5Strength {
    // Get planets aspecting 5th house
    const fifthHouseAspects = getPlanetsAspectingHouse(chart, 5);
    const beneficAspects = fifthHouseAspects.filter(a => isBenefic(a.planet));
    const maleficAspects = fifthHouseAspects.filter(a => isMalefic(a.planet));

    // Check Jupiter (natural significator for children)
    const jupiter = chart.planets.find(p => p.name === 'Jupiter');
    const jupiterStrong = jupiter ? (jupiter.isRetro ? false : true) : false;

    // Determine condition
    if (beneficAspects.length >= 2 && jupiterStrong) {
        return {
            condition: 'Strong',
            details: 'Multiple benefic aspects and Jupiter strong'
        };
    } else if (maleficAspects.length >= 2 && beneficAspects.length === 0) {
        return {
            condition: 'Damaged',
            details: 'Multiple malefic aspects without benefic protection'
        };
    } else if (maleficAspects.length > beneficAspects.length) {
        return {
            condition: 'Weak',
            details: 'More malefic than benefic influences'
        };
    } else {
        return {
            condition: 'Moderate',
            details: 'Balanced influences'
        };
    }
}

/**
 * RULE 3: 8th House - Longevity & Mangalya
 * Groom short life = REJECT
 * Bride widowhood yoga = REJECT
 */
export function check8thHouseSafety(
    boyChart: ChartData,
    girlChart: ChartData,
    gender: 'boy' | 'girl'
): GurujiCompatibilityCheck {
    const chart = gender === 'boy' ? boyChart : girlChart;
    const eighthHouseAspects = getPlanetsAspectingHouse(chart, 8);

    const maleficAspects = eighthHouseAspects.filter(a => isMalefic(a.planet));
    const beneficAspects = eighthHouseAspects.filter(a => isBenefic(a.planet));

    // Critical risk if multiple malefics without benefic protection
    const criticalRisk = maleficAspects.length >= 2 && beneficAspects.length === 0;

    if (criticalRisk) {
        return {
            passed: false,
            autoReject: true,
            severity: 'critical',
            reason: gender === 'boy'
                ? 'CRITICAL: Groom has short life indication (8th house severely afflicted). REJECT.'
                : 'CRITICAL: Bride has widowhood yoga (8th house severely afflicted). REJECT.',
            tamilReason: gender === 'boy'
                ? 'முக்கியம்: மாப்பிள்ளைக்கு ஆயுள் குற்றம். நிராகரிக்கவும்.'
                : 'முக்கியம்: பெண்ணுக்கு விதவை யோகம். நிராகரிக்கவும்.'
        };
    }

    // Moderate risk - needs remedies
    if (maleficAspects.length > beneficAspects.length) {
        return {
            passed: true,
            autoReject: false,
            severity: 'high',
            reason: '8th house has some afflictions. Remedies recommended.',
            tamilReason: '8-ம் இடத்தில் சில குறைகள். பரிகாரங்கள் தேவை.'
        };
    }

    // Safe
    return {
        passed: true,
        autoReject: false,
        severity: 'low',
        reason: '8th house is safe. Good longevity indicators.',
        tamilReason: '8-ம் இடம் பாதுகாப்பானது. நல்ல ஆயுள் குறிப்புகள்.'
    };
}

/**
 * RULE 4: 2nd House - Wealth
 * Both damaged = Post-marriage poverty = REJECT
 */
export function check2ndHouseWealth(
    boyChart: ChartData,
    girlChart: ChartData
): GurujiCompatibilityCheck {
    const boy2ndStrength = getHouseStrength(boyChart, 2);
    const girl2ndStrength = getHouseStrength(girlChart, 2);

    // Both very weak = Poverty
    if (boy2ndStrength < 3 && girl2ndStrength < 3) {
        return {
            passed: false,
            autoReject: true,
            severity: 'critical',
            reason: 'REJECT: Both have very weak 2nd house. Post-marriage poverty likely.',
            tamilReason: 'நிராகரிக்கவும்: இருவருக்கும் 2-ம் இடம் மிக பலவீனம். திருமணத்திற்குப் பின் வறுமை வாட்டும்.'
        };
    }

    // At least one strong
    if (boy2ndStrength >= 7 || girl2ndStrength >= 7) {
        return {
            passed: true,
            autoReject: false,
            severity: 'low',
            reason: 'At least one has strong 2nd house. Financial security expected.',
            tamilReason: 'குறைந்தது ஒருவருக்கு 2-ம் இடம் வலுவாக உள்ளது. பொருளாதார பாதுகாப்பு உண்டு.'
        };
    }

    return {
        passed: true,
        autoReject: false,
        severity: 'medium',
        reason: 'Moderate wealth indicators. Need to work hard.',
        tamilReason: 'நடுத்தர செல்வ குறிப்புகள். கடின உழைப்பு தேவை.'
    };
}

/**
 * RULE 5: 12th House - Foreign vs Local Settlement
 * PROPER GURUJI LOGIC WITH SUBATHUVAM SCORE LEVELS:
 * - High Subathuvam (>70): Foreign country settlement
 * - Moderate Subathuvam (40-70): Different city/state within country  
 * - Low Subathuvam (<40): Stays in birth place
 * - Uses birth place and current place to calculate actual movement
 */
export function check12thHouseSettlement(
    boyChart: ChartData,
    girlChart: ChartData,
    boyBirthPlace?: string,
    boyCurrentPlace?: string,
    girlBirthPlace?: string,
    girlCurrentPlace?: string
): GurujiCompatibilityCheck {
    const boySettlement = analyzeSettlementTendency(boyChart, boyBirthPlace, boyCurrentPlace);
    const girlSettlement = analyzeSettlementTendency(girlChart, girlBirthPlace, girlCurrentPlace);

    // Case 1: Both have HIGH Subathuvam (Foreign settlement)
    if (boySettlement.tendency === 'Foreign' && girlSettlement.tendency === 'Foreign') {
        return {
            passed: true,
            autoReject: false,
            severity: 'low',
            reason: `Both have foreign settlement yoga (Boy: ${boySettlement.subathuvamScore}, Girl: ${girlSettlement.subathuvamScore}). Will settle abroad together.`,
            tamilReason: `இருவருக்கும் வெளிநாடு குடியேற்ற யோகம் (மாப்பிள்ளை: ${boySettlement.subathuvamScore}, பெண்: ${girlSettlement.subathuvamScore}). சேர்ந்து வெளிநாட்டில் குடியேறுவார்கள்.`
        };
    }

    // Case 2: Both have LOW Subathuvam (Stay in birth place)
    if (boySettlement.tendency === 'BirthPlace' && girlSettlement.tendency === 'BirthPlace') {
        // Check if their birth places are same/nearby
        const samePlace = boyBirthPlace && girlBirthPlace &&
            arePlacesSame(boyBirthPlace, girlBirthPlace);

        if (samePlace) {
            return {
                passed: true,
                autoReject: false,
                severity: 'low',
                reason: 'Both will stay in birth place and are from same area. Will live together in hometown.',
                tamilReason: 'இருவரும் பிறந்த இடத்திலேயே இருப்பார்கள் மற்றும் ஒரே பகுதியிலிருந்து. சொந்த ஊரில் சேர்ந்து வாழ்வார்கள்.'
            };
        } else {
            return {
                passed: false,
                autoReject: true,
                severity: 'critical',
                reason: `REJECT: Both will stay in their respective birth places which are different. Will live separately (Boy in ${boyBirthPlace}, Girl in ${girlBirthPlace}).`,
                tamilReason: `நிராகரிக்கவும்: இருவரும் தங்கள் பிறந்த இடங்களில் தங்குவார்கள் (மாப்பிள்ளை: ${boyBirthPlace}, பெண்: ${girlBirthPlace}). பிரிந்து வாழ நேரிடும்.`
            };
        }
    }

    // Case 3: Both have MODERATE Subathuvam (Different city within country)
    if (boySettlement.tendency === 'DifferentCity' && girlSettlement.tendency === 'DifferentCity') {
        // Both willing to move within country - check current locations
        const sameCurrentPlace = boyCurrentPlace && girlCurrentPlace &&
            arePlacesSame(boyCurrentPlace, girlCurrentPlace);

        if (sameCurrentPlace) {
            return {
                passed: true,
                autoReject: false,
                severity: 'low',
                reason: `Both have moderate movement tendency and currently in same city (${boyCurrentPlace}). Compatible.`,
                tamilReason: `இருவரும் நடுத்தர நகர்வு போக்கு உள்ளவர்கள் மற்றும் தற்போது ஒரே நகரத்தில் (${boyCurrentPlace}). பொருத்தமானவர்கள்.`
            };
        } else {
            return {
                passed: true,
                autoReject: false,
                severity: 'medium',
                reason: `Both willing to move within country (Boy moved ${boySettlement.distanceMoved}km, Girl moved ${girlSettlement.distanceMoved}km). Can settle in one location together.`,
                tamilReason: `இருவரும் நாட்டிற்குள் நகர்வதற்கு தயாராக உள்ளனர் (மாப்பிள்ளை ${boySettlement.distanceMoved}கி.மீ, பெண் ${girlSettlement.distanceMoved}கி.மீ). ஒரு இடத்தில் சேர்ந்து குடியேறலாம்.`
            };
        }
    }

    // Case 4: MISMATCH scenarios

    // Boy Foreign, Girl stays local
    if (boySettlement.tendency === 'Foreign' &&
        (girlSettlement.tendency === 'BirthPlace' || girlSettlement.tendency === 'DifferentCity')) {

        // Check if girl has moved to where boy is
        const girlWithBoy = boyCurrentPlace && girlCurrentPlace &&
            arePlacesSame(boyCurrentPlace, girlCurrentPlace);

        if (girlWithBoy && boyCurrentPlace && boyCurrentPlace.toLowerCase() !== 'india') {
            // Girl already abroad with boy - Good!
            return {
                passed: true,
                autoReject: false,
                severity: 'low',
                reason: `Groom has foreign yoga (score ${boySettlement.subathuvamScore}) and bride has moved to be with him in ${boyCurrentPlace}. Compatible.`,
                tamilReason: `மாப்பிள்ளைக்கு வெளிநாடு யோகம் (மதிப்பெண் ${boySettlement.subathuvamScore}) மற்றும் பெண் அவருடன் ${boyCurrentPlace}-ல் குடியேறியுள்ளார். பொருத்தம்.`
            };
        }

        return {
            passed: false,
            autoReject: true,
            severity: 'critical',
            reason: `REJECT: Groom has high foreign settlement tendency (score ${boySettlement.subathuvamScore}, ${boySettlement.distanceMoved}km moved). Bride has low tendency (score ${girlSettlement.subathuvamScore}, ${girlSettlement.distanceMoved}km moved). Groom will go abroad, bride won't follow.`,
            tamilReason: `நிராகரிக்கவும்: மாப்பிள்ளைக்கு அதிக வெளிநாடு போக்கு (மதிப்பெண் ${boySettlement.subathuvamScore}, ${boySettlement.distanceMoved}கி.மீ நகர்ந்துள்ளார்). பெண்ணுக்கு குறைவான போக்கு (மதிப்பெண் ${girlSettlement.subathuvamScore}, ${girlSettlement.distanceMoved}கி.மீ). மாப்பிள்ளை வெளிநாடு செல்வார், பெண் பின்தொடர மாட்டார்.`
        };
    }

    // Girl Foreign, Boy stays local - CRITICAL REJECT
    if (girlSettlement.tendency === 'Foreign' &&
        (boySettlement.tendency === 'BirthPlace' || boySettlement.tendency === 'DifferentCity')) {

        return {
            passed: false,
            autoReject: true,
            severity: 'critical',
            reason: `REJECT: Bride has strong foreign settlement tendency (score ${girlSettlement.subathuvamScore}, ${girlSettlement.distanceMoved}km moved). Groom prefers local (score ${boySettlement.subathuvamScore}, ${boySettlement.distanceMoved}km moved). Bride will leave for abroad, separation inevitable.`,
            tamilReason: `நிராகரிக்கவும்: பெண்ணுக்கு வலுவான வெளிநாடு போக்கு (மதிப்பெண் ${girlSettlement.subathuvamScore}, ${girlSettlement.distanceMoved}கி.மீ). மாப்பிள்ளை உள்நாட்டை விரும்புகிறார் (மதிப்பெண் ${boySettlement.subathuvamScore}, ${boySettlement.distanceMoved}கி.மீ). பெண் வெளிநாடு செல்வார், பிரிவு தவிர்க்க முடியாதது.`
        };
    }

    // Boy moderate, Girl birth place - Check if girl willing to move
    if (boySettlement.tendency === 'DifferentCity' && girlSettlement.tendency === 'BirthPlace') {
        const girlMovedToBoy = boyCurrentPlace && girlCurrentPlace &&
            arePlacesSame(boyCurrentPlace, girlCurrentPlace);

        if (girlMovedToBoy) {
            return {
                passed: true,
                autoReject: false,
                severity: 'low',
                reason: `Groom has moderate movement tendency and bride has joined him in ${boyCurrentPlace}. Compatible.`,
                tamilReason: `மாப்பிள்ளைக்கு நடுத்தர நகர்வு போக்கு மற்றும் பெண் அவருடன் ${boyCurrentPlace}-ல் சேர்ந்துள்ளார். பொருத்தம்.`
            };
        }

        return {
            passed: false,
            autoReject: true,
            severity: 'high',
            reason: `HIGH RISK: Groom has moved ${boySettlement.distanceMoved}km from birth place, bride hasn't moved (${girlSettlement.distanceMoved}km). Risk of living separately.`,
            tamilReason: `அதிக ஆபத்து: மாப்பிள்ளை ${boySettlement.distanceMoved}கி.மீ நகர்ந்துள்ளார், பெண் நகரவில்லை (${girlSettlement.distanceMoved}கி.மீ). பிரிந்து வாழும் ஆபத்து.`
        };
    }

    // Default case
    return {
        passed: true,
        autoReject: false,
        severity: 'medium',
        reason: `Settlement patterns need evaluation. Boy: ${boySettlement.tendency} (${boySettlement.subathuvamScore}), Girl: ${girlSettlement.tendency} (${girlSettlement.subathuvamScore}).`,
        tamilReason: `குடியேற்ற முறைகளை மதிப்பீடு செய்ய வேண்டும். மாப்பிள்ளை: ${boySettlement.tendency} (${boySettlement.subathuvamScore}), பெண்: ${girlSettlement.tendency} (${girlSettlement.subathuvamScore}).`
    };
}

interface SettlementAnalysis {
    tendency: 'Foreign' | 'DifferentCity' | 'BirthPlace';
    subathuvamScore: number;
    distanceMoved: number;
    details: string;
}

/**
 * Analyze settlement tendency based on Subathuvam score and actual movement
 */
function analyzeSettlementTendency(
    chart: ChartData,
    birthPlace?: string,
    currentPlace?: string
): SettlementAnalysis {
    // Step 1: Calculate Subathuvam for all planets
    const subathuvamResults = calculateAdityaGurujiSubathuvam(chart.planets);

    // Step 2: Find 8th and 12th house lords
    const ascendantSign = typeof chart.ascendant === 'object' ? chart.ascendant.signIndex :
        typeof chart.ascendant === 'string' ? getSignIndex(chart.ascendant) : 0;

    const eighthHouseSign = (ascendantSign + 7) % 12;
    const twelfthHouseSign = (ascendantSign + 11) % 12;

    const eighthLord = getHouseLord(eighthHouseSign);
    const twelfthLord = getHouseLord(twelfthHouseSign);

    // Step 3: Get Subathuvam scores
    const eighthLordScore = subathuvamResults[eighthLord]?.totalScore || 0;
    const twelfthLordScore = subathuvamResults[twelfthLord]?.totalScore || 0;

    // Take the higher score (more dominant tendency)
    const maxScore = Math.max(eighthLordScore, twelfthLordScore);

    // Step 4: Calculate actual distance moved
    const distanceMoved = calculateDistance(birthPlace, currentPlace);

    // Step 5: Determine tendency based on score AND actual movement
    let tendency: 'Foreign' | 'DifferentCity' | 'BirthPlace';

    // High score (>70) = Foreign tendency
    if (maxScore > 70) {
        tendency = 'Foreign';
    }
    // Moderate score (40-70) = Different city within country
    else if (maxScore >= 40) {
        tendency = 'DifferentCity';
    }
    // Low score (<40) = Stays in birth place
    else {
        tendency = 'BirthPlace';
    }

    // Adjust based on actual movement
    // If person hasn't moved much despite high score, reduce tendency
    if (tendency === 'Foreign' && distanceMoved < 500) {
        tendency = 'DifferentCity'; // Might go foreign in future
    }
    if (tendency === 'DifferentCity' && distanceMoved < 100) {
        tendency = 'BirthPlace'; // Hasn't actually moved yet
    }

    return {
        tendency,
        subathuvamScore: maxScore,
        distanceMoved,
        details: `8th lord (${eighthLord}): ${eighthLordScore}, 12th lord (${twelfthLord}): ${twelfthLordScore}`
    };
}

/**
 * Calculate distance between two places (simplified)
 */
function calculateDistance(place1?: string, place2?: string): number {
    if (!place1 || !place2) return 0;

    // If same place
    if (arePlacesSame(place1, place2)) return 0;

    // Simplified: Check if one is foreign
    const foreignCountries = ['usa', 'uk', 'canada', 'australia', 'singapore', 'dubai', 'uae',
        'germany', 'france', 'switzerland', 'new zealand', 'malaysia'];

    const place1Foreign = foreignCountries.some(c => place1.toLowerCase().includes(c));
    const place2Foreign = foreignCountries.some(c => place2.toLowerCase().includes(c));

    if (place1Foreign || place2Foreign) {
        return 10000; // Foreign = 10000km (arbitrary large number)
    }

    // Rough estimates for Indian cities (simplified)
    // In production, use actual geocoding API
    const indiaCityDistances: Record<string, Record<string, number>> = {
        'chennai': { 'mumbai': 1300, 'delhi': 2200, 'bangalore': 350, 'kolkata': 1700 },
        'mumbai': { 'chennai': 1300, 'delhi': 1400, 'bangalore': 1000, 'kolkata': 2000 },
        'delhi': { 'chennai': 2200, 'mumbai': 1400, 'bangalore': 2200, 'kolkata': 1500 },
        'bangalore': { 'chennai': 350, 'mumbai': 1000, 'delhi': 2200, 'kolkata': 1900 },
        'kolkata': { 'chennai': 1700, 'mumbai': 2000, 'delhi': 1500, 'bangalore': 1900 }
    };

    // Try to find distance
    const city1 = Object.keys(indiaCityDistances).find(c => place1.toLowerCase().includes(c));
    const city2 = Object.keys(indiaCityDistances).find(c => place2.toLowerCase().includes(c));

    if (city1 && city2 && indiaCityDistances[city1]?.[city2]) {
        return indiaCityDistances[city1][city2];
    }

    // Default: assume different state = ~800km
    return 800;
}

/**
 * Check if two places are same/nearby
 */
function arePlacesSame(place1: string, place2: string): boolean {
    const p1 = place1.toLowerCase().trim();
    const p2 = place2.toLowerCase().trim();

    // Exact match
    if (p1 === p2) return true;

    // Check if one contains the other
    if (p1.includes(p2) || p2.includes(p1)) return true;

    return false;
}

// Helper: Get sign index from sign name
function getSignIndex(signName: string): number {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return signs.indexOf(signName);
}

// Helper: Get house lord (ruling planet) for a sign
function getHouseLord(signIndex: number): string {
    const lords = [
        'Mars',     // Aries
        'Venus',    // Taurus  
        'Mercury',  // Gemini
        'Moon',     // Cancer
        'Sun',      // Leo
        'Mercury',  // Virgo
        'Venus',    // Libra
        'Mars',     // Scorpio (traditionally Mars, modern Pluto)
        'Jupiter',  // Sagittarius
        'Saturn',   // Capricorn
        'Saturn',   // Aquarius (traditionally Saturn, modern Uranus)
        'Jupiter'   // Pisces (traditionally Jupiter, modern Neptune)
    ];
    return lords[signIndex];
}


function getHouseStrength(chart: ChartData, houseNumber: number): number {
    const aspects = getPlanetsAspectingHouse(chart, houseNumber);
    const beneficAspects = aspects.filter(a => isBenefic(a.planet));
    const maleficAspects = aspects.filter(a => isMalefic(a.planet));

    // Calculate strength (0-10 scale)
    let strength = 5; // Base
    strength += beneficAspects.length * 2;
    strength -= maleficAspects.length * 1.5;

    return Math.max(0, Math.min(10, strength));
}
