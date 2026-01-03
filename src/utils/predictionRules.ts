import { DashaPeriod, calculatePlanetaryPositions } from './astrology';
import { SubathuvamResult } from './adityaGurujiSubathuvam';
import { calculateSubathuvamPavathuvam } from './subathuvam';
import { OWN_SIGNS, SIGN_LORDS } from './constants';

// --- Types ---

export interface PredictionResult {
    question: string;
    answer: string;
    reason: string;
    isFavorable: boolean;
    predictionDetails?: {
        periods: {
            start: Date;
            end: Date;
            dasa: string;
            bhukti: string;
            antaram: string;
            score: number;
            isPriority1: boolean;
            isPriority2: boolean;
            reason?: string;
        }[];
        marriageLords?: string[];
        isLateMarriage?: boolean;
        lateReasons?: string[];
    };
    verdict?: string;
}

export interface TransitPositions {
    jupiterSignIndex: number;
    saturnSignIndex: number;
    rahuSignIndex: number;
    ketuSignIndex: number;
    sunSignIndex: number;
    moonSignIndex: number;
    marsSignIndex: number;
    mercurySignIndex: number;
    venusSignIndex: number;
}

// --- Helper Functions ---

const getHouseNumber = (planetSign: number, ascendantSign: number): number => {
    return (planetSign - ascendantSign + 12) % 12 + 1;
};

const getPlanetPosition = (planets: any[], planetName: string) => {
    return planets.find(p => p.name === planetName);
};

const isAspecting = (sourceSign: number, targetSign: number, aspects: number[]): boolean => {
    const houseDist = (targetSign - sourceSign + 12) % 12 + 1;
    return aspects.includes(houseDist);
};

// Helper to get Nakshatra Lord
const getNakshatraLord = (longitude: number): string => {
    const nakshatraSpan = 13.3333333333;
    const nakshatraIndex = Math.floor(longitude / nakshatraSpan);
    const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    // Sequence starts from Ashwini (Ketu)
    return lords[nakshatraIndex % 9];
};

// Helper to check Jupiter Transit for a specific date
const checkJupiterTransit = (date: Date, ascendantSign: number, moonSign: number, house7Sign: number, lord7Sign: number, venusSign: number) => {
    // We need to calculate Jupiter's position for this future date
    // We can use a simplified calculation or call the full engine.
    // Since we don't have lat/lng here easily, we'll use default (Chennai) as it doesn't affect planetary sign much.
    const futureTransits = calculatePlanetaryPositions(date, 13.0827, 80.2707);
    const jupiter = futureTransits.planets.find(p => p.name === 'Jupiter');

    if (!jupiter) return false;

    const jupiterSign = jupiter.signIndex;
    const jupiterAspects = [1, 5, 7, 9]; // Conjunction + Aspects

    const aspect7Lagna = isAspecting(jupiterSign, house7Sign, jupiterAspects);
    const house7FromMoon = (moonSign + 6) % 12;
    const aspect7Rasi = isAspecting(jupiterSign, house7FromMoon, jupiterAspects);

    // Check aspects to 7th Lord and Venus (using their natal positions)
    const aspect7Lord = isAspecting(jupiterSign, lord7Sign, jupiterAspects);
    const aspectVenus = isAspecting(jupiterSign, venusSign, jupiterAspects);

    const aspectLagna = isAspecting(jupiterSign, ascendantSign, jupiterAspects);
    const aspectRasi = isAspecting(jupiterSign, moonSign, jupiterAspects);

    return aspect7Lagna || aspect7Rasi || aspect7Lord || aspectVenus || aspectLagna || aspectRasi;
};

// --- Prediction Logic ---

// 1. Job Prediction
export const predictJobTiming = (
    currentDasa: { maha: DashaPeriod, bhukti?: DashaPeriod },
    transits: TransitPositions,
    ascendantSign: number,
    moonSign: number,
    planets: any[],
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "எனக்கு எப்போது வேலை கிடைக்கும்?" : "When will I get a job?";

    // Rule: Dasa/Bukthi of 10th Lord, Saturn, or Planet in 10th
    const house10Sign = (ascendantSign + 9) % 12;
    const lord10 = SIGN_LORDS[house10Sign];
    const saturn = getPlanetPosition(planets, 'Saturn');
    const planetsIn10 = planets.filter(p => p.signIndex === house10Sign).map(p => p.name);

    const dasaLord = currentDasa?.maha?.planet;
    const bukthiLord = currentDasa?.bhukti?.planet;

    if (!dasaLord) return { question, answer: "Data Missing", reason: "", isFavorable: false };

    const isJobDasa =
        dasaLord === lord10 ||
        dasaLord === 'Saturn' ||
        planetsIn10.includes(dasaLord) ||
        bukthiLord === lord10 ||
        bukthiLord === 'Saturn' ||
        (bukthiLord && planetsIn10.includes(bukthiLord));

    // Gocharam Triggers
    // Jupiter aspects 6th (Service) or 10th (Career)
    // Jupiter Aspects: 5, 7, 9
    // Check if Transit Jupiter aspects 6th or 10th house from Lagna
    const house6Sign = (ascendantSign + 5) % 12;

    // Jupiter is in transits.jupiterSignIndex
    // Check aspect to house6Sign or house10Sign
    // Aspect check: (Target - Source + 12) % 12 + 1 IN [5, 7, 9] OR Conjunction (1)
    // Note: Guruji usually counts conjunction as aspect/connection too.
    const jupiterAspects = [1, 5, 7, 9];
    const jupiterAspects6 = isAspecting(transits.jupiterSignIndex, house6Sign, jupiterAspects);
    const jupiterAspects10 = isAspecting(transits.jupiterSignIndex, house10Sign, jupiterAspects);

    // Saturn Transit: 3, 6, 11 from Moon Sign (Upachaya)
    const saturnHouseFromMoon = (transits.saturnSignIndex - moonSign + 12) % 12 + 1;
    const isSaturnFavorable = [3, 6, 11].includes(saturnHouseFromMoon);

    if (isJobDasa && (jupiterAspects6 || jupiterAspects10)) {
        return {
            question,
            answer: isTamil ? "மிக விரைவில் வேலை கிடைக்கும். (Very Soon)" : "You will get a job very soon.",
            reason: isTamil
                ? "இப்போது நடக்கும் தசை/புத்தி 10-ம் இடத்தோடு சம்பந்தப்பட்டுள்ளது. கோச்சார குருவும் உங்கள் 6/10-ம் இடத்தைப் பார்க்கிறார்."
                : "Current Dasa/Bhukti is connected to the 10th house. Transit Jupiter is also aspecting your 6th/10th house.",
            isFavorable: true
        };
    } else if (isJobDasa) {
        return {
            question,
            answer: isTamil ? "வேலை வாய்ப்பு உள்ளது, ஆனால் சிறு தாமதம் இருக்கலாம்." : "Job opportunity exists, but there might be a slight delay.",
            reason: isTamil
                ? "தசை சாதகமாக உள்ளது, ஆனால் கோச்சார குருவின் பார்வை இன்னும் முழுமையாக கிடைக்கவில்லை."
                : "Dasa is favorable, but Transit Jupiter aspect is not yet fully supportive.",
            isFavorable: true
        };
    } else if (jupiterAspects6 || jupiterAspects10) {
        return {
            question,
            answer: isTamil ? "முயற்சி செய்தால் வேலை கிடைக்கும்." : "You can get a job if you try hard.",
            reason: isTamil
                ? "கோச்சாரம் சாதகமாக உள்ளது, ஆனால் தசை முழு ஒத்துழைப்பு தரவில்லை."
                : "Transit is favorable, but Dasa is not fully supportive.",
            isFavorable: true
        };
    }

    return {
        question,
        answer: isTamil ? "தற்சமயம் வேலை கிடைப்பதில் தாமதம் ஏற்படலாம்." : "There might be a delay in getting a job right now.",
        reason: isTamil
            ? "தற்போதைய தசை மற்றும் கோச்சாரம் இரண்டும் வேலைக்கு முழுமையாக சாதகமாக இல்லை."
            : "Both current Dasa and Transit are not fully favorable for a job.",
        isFavorable: false
    };
};
// Helper to get house number (1-12)
const getHouse = (planetSign: number, ascendantSign: number): number => {
    return (planetSign - ascendantSign + 12) % 12 + 1;
};

// 7. Jupiter Career logic (Guru)
const predictJupiterCareer = (
    planets: any[],
    ascendantSign: number,
    moonSignIndex: number,
    subathuvamScores: Record<string, SubathuvamResult>,
    language: 'en' | 'ta' = 'en'
): { prediction: string, reason: string } | null => {
    const isTamil = language === 'ta';
    const jupiter = planets.find(p => p.name === 'Jupiter');
    const mercury = planets.find(p => p.name === 'Mercury');
    const venus = planets.find(p => p.name === 'Venus');

    if (!jupiter) return null;

    const jupiterScore = subathuvamScores['Jupiter']?.totalScore || 0;
    const mercuryScore = subathuvamScores['Mercury']?.totalScore || 0;
    const venusScore = subathuvamScores['Venus']?.totalScore || 0;

    let predictions: string[] = [];
    let reasons: string[] = [];

    // Check from Lagna & Rasi (Moon)
    const ascendants = [
        { name: isTamil ? 'லக்னம்' : 'Lagna', sign: ascendantSign },
        { name: isTamil ? 'ராசி' : 'Rasi', sign: moonSignIndex }
    ];

    // House Based Rules
    for (const asc of ascendants) {
        const jupiterHouse = getHouse(jupiter.signIndex, asc.sign);

        // Rule 1: Jupiter in 2nd House
        if (jupiterHouse === 2) {
            predictions.push(isTamil
                ? "நிதி, வங்கி, கற்பித்தல், சட்டம் (குரு 2-ல்)."
                : "Finance, Banking, Teaching, Law (Jupiter in 2nd).");
            reasons.push(isTamil
                ? `${asc.name}-லிருந்து குரு 2-ம் வீட்டில்: சிறந்த நிதி ஆலோசகர், ஆசிரியர் அல்லது வழக்கறிஞர் ஆகலாம்.`
                : `Jupiter in 2nd from ${asc.name}: Potential for Financial Advisor, Teacher, or Lawyer.`);
        }

        // Rule 2: Jupiter in 10th House
        if (jupiterHouse === 10) {
            predictions.push(isTamil
                ? "உயர் வங்கி பதவி, பேராசிரியர், கல்வித் துறை தலைவர் (குரு 10-ல்)."
                : "High-level Banking, Professor, Head of Education (Jupiter in 10th).");
            reasons.push(isTamil
                ? `${asc.name}-லிருந்து குரு 10-ம் வீட்டில்: வங்கி அல்லது கல்வியில் மிக உயர்ந்த பதவி.`
                : `Jupiter in 10th from ${asc.name}: High position in Banking or Education.`);
        }

        // Rule 3: 10th Lord in 2nd House (Specific check for Guru as 10th Lord)
        // Guru is 10th Lord for Gemini (2) and Pisces (11) Lagnas
        const house10Sign = (asc.sign + 9) % 12;
        const lord10 = SIGN_LORDS[house10Sign];

        if (lord10 === 'Jupiter' && jupiterHouse === 2) {
            predictions.push(isTamil
                ? "பயிற்சி, வழிகாட்டுதல், மேலாண்மை (10-ம் அதிபதி குரு 2-ல்)."
                : "Training, Guiding, Management (10th Lord Jupiter in 2nd).");
            reasons.push(isTamil
                ? `${asc.name}-லிருந்து 10-ம் அதிபதி குரு 2-ம் வீட்டில்: சிறந்த பயிற்சியாளர் அல்லது மேலாளர் ஆகலாம்.`
                : `10th Lord Jupiter in 2nd from ${asc.name}: Excellent Trainer or Manager.`);
        }
    }

    // Combination Rules (If Jupiter is Dominant or Strong > 60)
    // Only apply if Jupiter has decent strength
    if (jupiterScore > 50) {

        // Jupiter + Mercury (2nd Strongest)
        if (mercuryScore > 50 && mercuryScore < jupiterScore) { // Mercury is strong but secondary to Jupiter
            predictions.push(isTamil
                ? "வங்கி கணக்காளர், ஆடிட்டர், பதிப்பகம், விளம்பரம் (குரு + புதன்)."
                : "Bank Accountant, Auditor, Publishing, Marketing (Jupiter + Mercury).");
            reasons.push(isTamil
                ? "குரு (முதன்மை) + புதன் சேர்க்கை: நிதி மற்றும் வணிக அறிவு."
                : "Jupiter (Primary) + Mercury combination: Finance and Business acumen.");
        }

        // Jupiter + Venus (2nd Strongest)
        if (venusScore > 50 && venusScore < jupiterScore) {
            predictions.push(isTamil
                ? "கூட்டுறவு, சமூக நிறுவனம், திருமண ஆலோசகர், ஆடம்பர வணிகம் (குரு + சுக்ரன்)."
                : "Co-operatives, Social Ent., Marriage Counselor, Luxury Biz (Jupiter + Venus).");
            reasons.push(isTamil
                ? "குரு (முதன்மை) + சுக்ரன் சேர்க்கை: சமூக சேவை மற்றும் கலை/ஆடம்பர வணிகம்."
                : "Jupiter (Primary) + Venus combination: Social Service and Arts/Luxury business.");
        }
    }

    if (predictions.length === 0) return null;

    // Deduplicate
    const uniquePreds = Array.from(new Set(predictions));
    const uniqueReasons = Array.from(new Set(reasons));

    return {
        prediction: uniquePreds.join("\n"),
        reason: uniqueReasons.join("\n- ")
    };
};

// Helper to get favorable Sun Transit months
const getSunTransitMonths = (ascendantSign: number): string[] => {
    // Sun in 1, 5, 7, 9 is favorable
    // Sun stays in each sign for approx 1 month (mid-month to mid-month)
    // Tamil months map roughly to Sun signs:
    // Aries (0) -> Chithirai (Apr-May)
    // Taurus (1) -> Vaikasi (May-Jun)
    // ...

    const tamilMonths = [
        "Chithirai (Apr-May)", "Vaikasi (May-Jun)", "Ani (Jun-Jul)", "Adi (Jul-Aug)",
        "Avani (Aug-Sep)", "Purattasi (Sep-Oct)", "Aippasi (Oct-Nov)", "Karthigai (Nov-Dec)",
        "Margazhi (Dec-Jan)", "Thai (Jan-Feb)", "Masi (Feb-Mar)", "Panguni (Mar-Apr)"
    ];

    const favorableSigns = [
        ascendantSign, // 1st
        (ascendantSign + 4) % 12, // 5th
        (ascendantSign + 6) % 12, // 7th
        (ascendantSign + 8) % 12  // 9th
    ];

    return favorableSigns.map(sign => tamilMonths[sign]);
};

// 2. Detailed Marriage Timing (Guruji System)
export const predictDetailedMarriageTimingDeprecated = (
    currentDasa: { maha: DashaPeriod, bhukti?: DashaPeriod },
    transits: TransitPositions,
    ascendantSign: number,
    moonSign: number,
    planets: any[],
    birthDate: Date,
    gender: 'male' | 'female' = 'male',
    allDashaPeriods: DashaPeriod[] = []
): PredictionResult => {
    const question = "When will I get married? (திருமணம் எப்போது?)";

    // --- Step A: Verify Marriage Promise (Dasa Check) ---
    const house2Sign = (ascendantSign + 1) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house8Sign = (ascendantSign + 7) % 12;
    const house11Sign = (ascendantSign + 10) % 12;

    const lord2 = SIGN_LORDS[house2Sign];
    const lord7 = SIGN_LORDS[house7Sign];
    const lord11 = SIGN_LORDS[house11Sign];

    const dasaLordName = currentDasa?.maha?.planet;
    const bukthiLordName = currentDasa?.bhukti?.planet;

    if (!dasaLordName) return { question, answer: "Data Missing", reason: "", isFavorable: false };

    const dasaLordPlanet = getPlanetPosition(planets, dasaLordName);
    const bukthiLordPlanet = getPlanetPosition(planets, bukthiLordName || '');

    // Check Connections for Dasa Lord
    const checkConnection = (planetName: string, planetObj: any) => {
        if (!planetObj) return false;

        // Priority Check: Rahu/Ketu in 2, 7, 8
        if (['Rahu', 'Ketu'].includes(planetName)) {
            if ([house2Sign, house7Sign, house8Sign].includes(planetObj.signIndex)) return true;
        }

        // 1. Direct Rule: Is Lord of 2, 7, 11?
        if ([lord2, lord7, lord11].includes(planetName)) return true;

        // 2. Placement Rule: Is in 2, 7, 11?
        if ([house2Sign, house7Sign, house11Sign].includes(planetObj.signIndex)) return true;

        // 3. Star Lord Rule: Standing in Star of 7th Lord?
        const starLord = getNakshatraLord(planetObj.longitude);
        if (starLord === lord7) return true;

        return false;
    };

    const isDasaConnected = checkConnection(dasaLordName, dasaLordPlanet);
    const isBukthiConnected = bukthiLordName ? checkConnection(bukthiLordName, bukthiLordPlanet) : false;

    const isMarriagePeriod = isDasaConnected || isBukthiConnected;

    // --- Step B: Verify Timing (Guru Bala / Gocharam Check) ---
    const jupiterAspects = [1, 5, 7, 9];

    // 1. 7th House from Lagna
    const aspect7Lagna = isAspecting(transits.jupiterSignIndex, house7Sign, jupiterAspects);

    // 2. 7th House from Rasi (Moon)
    const house7FromMoon = (moonSign + 6) % 12;
    const aspect7Rasi = isAspecting(transits.jupiterSignIndex, house7FromMoon, jupiterAspects);

    // 3. 7th Lord (Natal Position)
    const lord7Planet = getPlanetPosition(planets, lord7);
    const aspect7Lord = lord7Planet ? isAspecting(transits.jupiterSignIndex, lord7Planet.signIndex, jupiterAspects) : false;

    // 4. Venus (Natal Position) - Optional but good indicator
    const venusPlanet = getPlanetPosition(planets, 'Venus');
    const aspectVenus = venusPlanet ? isAspecting(transits.jupiterSignIndex, venusPlanet.signIndex, jupiterAspects) : false;

    // 5. Lagna
    const aspectLagna = isAspecting(transits.jupiterSignIndex, ascendantSign, jupiterAspects);

    // Strict Guru Bala: Must aspect 7th House OR 7th Lord OR Lagna
    const isGuruBala = aspect7Lagna || aspect7Lord || aspectLagna;

    // --- Step C: Final Synthesis ---
    let answer = "";
    let reason = "";
    let isFavorable = false;

    // Convert birthDate to Date object if it's not already (handles Firestore Timestamp)
    const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const currentAge = new Date().getFullYear() - birthDateObj.getFullYear();
    const favorableMonths = getSunTransitMonths(ascendantSign).join(", ");

    if (isMarriagePeriod && isGuruBala) {
        isFavorable = true;
        answer = `திருமண யோகம் இப்போது மிக வலுவாக உள்ளது! ${currentDasa.bhukti?.endDate ? `(புத்தி முடிவு: ${new Date(currentDasa.bhukti.endDate).toLocaleDateString()})` : ''}`;
        reason = `தசை/புத்தி சாதகமாக உள்ளது மற்றும் குரு பலம் உள்ளது.\n\nசிறந்த மாதங்கள் (சூரியன் சஞ்சாரம்): ${favorableMonths}`;
    } else {
        // Search for NEXT favorable period
        let futurePrediction = "";

        if (allDashaPeriods.length > 0) {
            const now = new Date();
            let found = false;

            // Flatten periods to iterate easily
            for (const maha of allDashaPeriods) {
                if (maha.endDate < now) continue;

                if (maha.subPeriods) {
                    for (const bhukti of maha.subPeriods) {
                        if (bhukti.endDate < now) continue;

                        // Age Check: Skip if age < 21 (approx)
                        const bhuktiMidDate = new Date((bhukti.startDate.getTime() + bhukti.endDate.getTime()) / 2);
                        const ageAtBhukti = bhuktiMidDate.getFullYear() - birthDateObj.getFullYear();
                        if (ageAtBhukti < 21) continue;

                        // Check Bhukti Level
                        const mahaPlanet = getPlanetPosition(planets, maha.planet);
                        const bhuktiPlanet = getPlanetPosition(planets, bhukti.planet);

                        const mahaConn = checkConnection(maha.planet, mahaPlanet);
                        const bhuktiConn = checkConnection(bhukti.planet, bhuktiPlanet);

                        if (mahaConn || bhuktiConn) {
                            // Check Antarams for precision
                            if (bhukti.subPeriods) {
                                for (const antaram of bhukti.subPeriods) {
                                    if (antaram.endDate < now) continue;

                                    const antaramPlanet = getPlanetPosition(planets, antaram.planet);
                                    const antaramConn = checkConnection(antaram.planet, antaramPlanet);

                                    if (antaramConn || bhuktiConn) {
                                        // Check Guru Bala for this period
                                        const midDate = new Date((antaram.startDate.getTime() + antaram.endDate.getTime()) / 2);
                                        const hasGuruBala = checkJupiterTransit(
                                            midDate,
                                            ascendantSign,
                                            moonSign,
                                            house7Sign,
                                            lord7Planet?.signIndex || 0,
                                            venusPlanet?.signIndex || 0
                                        );

                                        if (hasGuruBala) {
                                            futurePrediction = `${antaram.startDate.toLocaleDateString()} - ${antaram.endDate.toLocaleDateString()} (${maha.planet}/${bhukti.planet}/${antaram.planet})`;
                                            found = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (found) break;
                    }
                }
                if (found) break;
            }
        }

        if (isMarriagePeriod && !isGuruBala) {
            isFavorable = true;
            answer = "திருமண காலம் நடக்கிறது, ஆனால் குரு பலத்திற்காக காத்திருக்க வேண்டும்.";
            reason = `தசை சாதகமாக உள்ளது. அடுத்த குரு பெயர்ச்சியை எதிர்பார்க்கவும்.\n\nஅடுத்த வலுவான காலம்: ${futurePrediction || "அடுத்த குரு பெயர்ச்சியை எதிர்பார்க்கவும்."}\n\nசிறந்த மாதங்கள்: ${favorableMonths}`;
        } else {
            isFavorable = false;
            answer = "தற்போதைய காலம் திருமணத்திற்கு சாதகமாக இல்லை.";
            reason = `தற்போதைய தசை/புத்தி தொடர்பில் இல்லை. \n\nஅடுத்த திருமண யோகம்: ${futurePrediction || "சிறிது காலம் காத்திருக்கவும்."}\n\nசிறந்த மாதங்கள்: ${favorableMonths}`;
        }
    }

    return {
        question,
        answer,
        reason,
        isFavorable
    };
};
const predictCareerPath_Old = (
    planets: any[],
    ascendantSign: number,
    subathuvamScores: Record<string, SubathuvamResult>,
    currentDasa?: { maha: DashaPeriod, bhukti?: DashaPeriod },
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "எந்த வேலை எனக்கு ஏற்றது?" : "Which job suits me?";

    const house10Sign = (ascendantSign + 9) % 12;
    const lord10 = SIGN_LORDS[house10Sign];
    const house6Sign = (ascendantSign + 5) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house8Sign = (ascendantSign + 7) % 12;

    const lord6 = SIGN_LORDS[house6Sign];
    const lord8 = SIGN_LORDS[house8Sign];

    // 1. Analyze Saturn (Jeevana Karaka)
    const saturn = getPlanetPosition(planets, 'Saturn');
    const saturnScore = subathuvamScores['Saturn']?.totalScore || 0;
    const isSaturnSubathuva = saturnScore > 50; // Threshold for "Subathuva"

    // 2. Analyze 10th House Connections
    // Occupants
    const occupants = planets.filter(p => p.signIndex === house10Sign);

    // Lord of 10th
    const lord10Planet = getPlanetPosition(planets, lord10);
    const lord10Score = subathuvamScores[lord10]?.totalScore || 0;

    // Aspects to 10th (Jupiter, Mars, Saturn)
    // Jupiter aspects 5, 7, 9
    const jupiter = getPlanetPosition(planets, 'Jupiter');
    const jupiterAspects10 = jupiter && isAspecting(jupiter.signIndex, house10Sign, [1, 5, 7, 9]);

    // 3. Determine Dominant Planet for Career
    // The Golden Rule: Planet with highest Subathuvam connected to 10th or Lagna.
    // We prioritize 10th house connection.

    let candidates: { name: string, score: number, role: string }[] = [];

    // Add Occupants
    occupants.forEach(p => {
        candidates.push({
            name: p.name,
            score: subathuvamScores[p.name]?.totalScore || 0,
            role: 'Occupant of 10th'
        });
    });

    // Add Lord
    candidates.push({
        name: lord10,
        score: lord10Score,
        role: 'Lord of 10th'
    });

    // Add Saturn (Karaka)
    candidates.push({
        name: 'Saturn',
        score: saturnScore,
        role: 'Jeevana Karaka'
    });

    // Deduplicate Candidates (keep highest score/role preference? Score is same per planet)
    // We just need unique names.
    const uniqueCandidatesMap = new Map<string, { name: string, score: number, role: string }>();
    candidates.forEach(c => {
        if (!uniqueCandidatesMap.has(c.name)) {
            uniqueCandidatesMap.set(c.name, c);
        } else {
            // Optional: Append role if needed, but for now just keep first
            // Or keep the one with "Occupant" role as it's more specific?
            // Actually score is what matters. Score is constant per planet.
            // Let's just keep the first one encountered.
        }
    });
    const uniqueCandidates = Array.from(uniqueCandidatesMap.values());

    // Sort by Score
    uniqueCandidates.sort((a, b) => b.score - a.score);

    // --- Dasa Override Rule ---
    let dominantPlanet = uniqueCandidates[0].name;
    let dominantScore = uniqueCandidates[0].score;
    let overrideReason = "";

    if (currentDasa && currentDasa.maha) {
        const dasaLord = currentDasa.maha.planet;

        console.log("DEBUG: Dasa Override Check", {
            dasaLord,
            lord6,
            lord8,
            dominantPlanet,
            candidates: uniqueCandidates.map(c => `${c.name}:${c.score}`)
        });

        // Check if Dasa Lord is 6th or 8th Lord
        if (dasaLord === lord6 || dasaLord === lord8) {
            // Override: Select Rank 2 if available
            if (uniqueCandidates.length > 1) {
                // Ensure Rank 2 is NOT the same planet (it shouldn't be after dedupe)
                // And check if Rank 1 IS the Dasa Lord (otherwise why override?)
                // Guruji's rule: If running Dasa is 6/8 Lord, AND that Lord is the Career Determinant.
                if (dominantPlanet === dasaLord) {
                    dominantPlanet = uniqueCandidates[1].name;
                    dominantScore = uniqueCandidates[1].score;
                    if (isTamil) {
                        overrideReason = `(குறிப்பு: தற்போதைய தசை நாதன் ${dasaLord} 6/8-க்கு உடையவர். எனவே விதிவிலக்கு விதியின்படி 2-வது சிறந்த கிரகம் ${dominantPlanet} தேர்ந்தெடுக்கப்பட்டது.)`;
                    } else {
                        overrideReason = `(Note: Current Dasa Lord ${dasaLord} is 6th/8th Lord. Switched to 2nd best planet ${dominantPlanet} as per Dasa Override Rule.)`;
                    }
                    console.log("DEBUG: Override Triggered!", { newDominant: dominantPlanet, reason: overrideReason });
                } else {
                    console.log("DEBUG: Override NOT Triggered - Dominant Planet is not Dasa Lord");
                }
            } else {
                console.log("DEBUG: Override NOT Triggered - Not enough candidates");
            }
        } else {
            console.log("DEBUG: Override NOT Triggered - Dasa Lord is not 6th/8th Lord");
        }
    }

    // 4. Specific Combinations (Guruji's Formulas)
    let specificPrediction = "";

    // Saturn + Mercury
    const mercury = getPlanetPosition(planets, 'Mercury');
    const saturnMercuryConjunction = saturn && mercury && saturn.signIndex === mercury.signIndex;
    if (saturnMercuryConjunction) {
        specificPrediction = isTamil
            ? "கணினி உதிரிபாகங்கள், ஹார்டுவேர், மெக்கானிக், கணக்கு வழக்கு, ஐடி துறை (சனி + புதன்)."
            : "Computer Spare Parts, Hardware, Mechanics, Bookkeeping, IT (Saturn + Mercury).";
    }

    // Saturn + Mars
    const mars = getPlanetPosition(planets, 'Mars');
    const saturnMarsConjunction = saturn && mars && saturn.signIndex === mars.signIndex;
    if (saturnMarsConjunction) {
        specificPrediction = isTamil
            ? "இயந்திரம், தொழிற்சாலை, சிவில் இன்ஜினியரிங், சீருடைப் பணிகள் (சனி + செவ்வாய்)."
            : "Machinery, Industry, Civil Engineering, Uniformed Services (Saturn + Mars).";
    }

    // Sun + 10th + Jupiter Aspect
    const sun = getPlanetPosition(planets, 'Sun');
    const sunIn10 = sun && sun.signIndex === house10Sign;
    if (sunIn10 && jupiterAspects10) {
        specificPrediction = isTamil
            ? "உயர் அரசு வேலை, நிர்வாகம், மருத்துவம் (சூரியன் 10-ல் + குரு பார்வை)."
            : "High Level Govt Job, Administration, Medicine (Sun in 10th + Guru Aspect).";
    }

    // 5. Govt vs Private
    const sunScore = subathuvamScores['Sun']?.totalScore || 0;
    const isGovtLikely = sunScore > 60 || (sunIn10 && jupiterAspects10);

    // 6. Business vs Job
    const lord7 = SIGN_LORDS[house7Sign];
    // lord6 is already defined above
    const lord7Score = subathuvamScores[lord7]?.totalScore || 0;
    const lord6Score = subathuvamScores[lord6]?.totalScore || 0;

    const isBusinessLikely = lord7Score > lord6Score + 10; // Significant difference

    // 7. Career Mappings
    const careers: Record<string, string> = isTamil ? {
        'Sun': "அரசு வேலை, அரசியல், மருத்துவம், நிர்வாகம்.",
        'Moon': "உணவு, பயணம், விவசாயம், திரவப் பொருட்கள், மக்கள் தொடர்பு, கடல் சார் துறை.",
        'Mars': "காவல்/ராணுவம், ரியல் எஸ்டேட், பொறியியல், அறுவை சிகிச்சை.",
        'Mercury': "ஐடி, வணிகம், கணக்கு, தகவல் தொடர்பு, எழுத்து, ஜோதிடம்.",
        'Jupiter': "வங்கி, ஆசிரியர், நிதி, சட்டம், ஆன்மீகம்.",
        'Venus': "கலை, சினிமா, ஆடம்பர பொருட்கள், வாகனங்கள், ஃபேஷன்.",
        'Saturn': "கடின உழைப்பு, தொழிற்சாலை, சேவைத் துறை, இரும்பு/எஃகு, எண்ணெய்.",
        'Rahu': "வெளிநாடு, நிழல் வணிகம், ரசாயனம், ஏற்றுமதி/இறக்குமதி.",
        'Ketu': "மருத்துவம், ஜோதிடம், சட்டம், ஆன்மீகம், நுண்ணுயிரியல்."
    } : {
        'Sun': "Govt Job, Politics, Medicine, Administration.",
        'Moon': "Food, Travel, Agriculture, Liquids, Public Relations, Marine.",
        'Mars': "Uniform Service (Police/Army), Real Estate, Engineering, Surgery.",
        'Mercury': "IT, Business, Accounts, Communication, Writing, Astrology.",
        'Jupiter': "Banking, Teaching, Finance, Law, Religion.",
        'Venus': "Arts, Cinema, Luxury Goods, Vehicles, Fashion, UI/UX.",
        'Saturn': "Hard Work, Industry, Service Sector, Iron/Steel, Oil.",
        'Rahu': "Foreign, Shadow Business, Chemicals, Imports/Exports.",
        'Ketu': "Medical, Astrology, Law, Spirituality, Micro-biology."
    };

    let finalPrediction = specificPrediction || careers[dominantPlanet] || (isTamil ? "பொது சேவை" : "General Service");

    // Refine based on Saturn's status
    let roleType = "";
    if (dominantPlanet === 'Saturn') {
        if (isSaturnSubathuva) {
            roleType = isTamil ? "(கௌரவமான பதவி)" : "(White Collar / Managerial Role)";
            finalPrediction += " " + roleType;
        } else {
            roleType = isTamil ? "(உழைப்பு சார்ந்த பணி)" : "(Labor / Service Role)";
            finalPrediction += " " + roleType;
        }
    }

    // Construct Answer
    let answer = "";

    if (isTamil) {
        answer = `**துறை:** ${dominantPlanet} - ${finalPrediction}\n\n`;
        answer += `**அரசு வேலை:** ${isGovtLikely ? "அதிகம் (சூரியன் பலம்)" : "குறைவு (தனியார் துறை வாய்ப்பு)"}\n\n`;
        answer += `**தொழில் vs வேலை:** ${isBusinessLikely ? "சொந்த தொழில் சிறப்பு (7-ம் பாவம் பலம்)" : "வேலைக்கு செல்வதே சிறப்பு (6-ம் பாவம்/சனி பலம்)"}`;
    } else {
        answer = `**Primary Field:** ${dominantPlanet} - ${finalPrediction}\n\n`;
        answer += `**Govt Job Probability:** ${isGovtLikely ? "High (Sun is strong)" : "Low (Private Sector likely)"}\n\n`;
        answer += `**Business vs Job:** ${isBusinessLikely ? "Business is favorable (Strong 7th House)" : "Employment/Service is favorable (Strong 6th House/Saturn)"}`;
    }

    if (overrideReason) answer += `\n\n${overrideReason}`;

    // Construct Reason
    let reason = "";
    if (isTamil) {
        reason = `10-ம் பாவகம் மற்றும் சனி (Jeevana Karaka) ஆய்வு:\n` +
            `- முக்கிய கிரகம்: ${dominantPlanet} (மதிப்பெண்: ${dominantScore.toFixed(0)})\n` +
            `- சனி நிலை: ${isSaturnSubathuva ? "சுபத்துவம் (நன்று)" : "பாவத்துவம் (பலவீனம்)"}\n` +
            `- சிறப்பு யோகம்: ${specificPrediction ? "உள்ளது" : "இல்லை"}\n\n` +
            `ஆதித்ய குருஜியின் விதி: 10-ம் பாவகத்துடன் தொடர்புடைய அதிக சுபத்துவ பெற்ற கிரகமே தொழிலை நிர்ணயிக்கும்.`;
    } else {
        reason = `10th House & Saturn Analysis:\n` +
            `- Dominant Planet: ${dominantPlanet} (Score: ${dominantScore.toFixed(0)})\n` +
            `- Saturn Status: ${isSaturnSubathuva ? "Subathuvam (Good)" : "Pavathuvam (Weak)"}\n` +
            `- Specific Yoga: ${specificPrediction ? "Yes" : "None"}\n\n` +
            `Based on Aditya Guruji's rule: The planet with the highest Subathuvam connecting to the 10th house determines the profession.`;
    }

    // DEBUG: Add debug info to reason for troubleshooting
    reason += `\n\n[DEBUG: Dasa=${currentDasa?.maha?.planet || 'None'}, L6=${lord6}, L8=${lord8}, Dom=${dominantPlanet}, Cands=${uniqueCandidates.map(c => c.name).join(',')}]`;

    return {
        question,
        answer,
        reason,
        isFavorable: true
    };
};


// Helper to scan for Jupiter Transit periods within a date range
const getJupiterFavorablePeriods = (startDate: Date, endDate: Date, ascendantSign: number, moonSign: number, house7Sign: number): { start: Date, end: Date, sign: number }[] => {
    const favorablePeriods: { start: Date, end: Date, sign: number }[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    const stepDays = 15; // Check every 15 days

    let currentFavorableStart: Date | null = null;
    let currentSign = -1;

    while (currentDate <= end) {
        // We need a way to get Jupiter's sign efficiently. 
        // Using calculatePlanetaryPositions is heavy but accurate.
        // Optimization: We can check if we are in a favorable sign.
        const transits = calculatePlanetaryPositions(currentDate, 13.0827, 80.2707); // Default Chennai
        const jupiter = transits.planets.find(p => p.name === 'Jupiter');

        if (jupiter) {
            const sign = jupiter.signIndex;
            const jupiterAspects = [1, 5, 7, 9];

            // Check aspects to 7th House OR Lagna (Strict Rule from prompt)
            // Prompt says: "aspects the 7th House (Aquarius) or Lagna (Leo)"
            const aspect7 = isAspecting(sign, house7Sign, jupiterAspects);
            const aspectLagna = isAspecting(sign, ascendantSign, jupiterAspects);

            const isFavorable = aspect7 || aspectLagna;

            if (isFavorable) {
                if (!currentFavorableStart) {
                    currentFavorableStart = new Date(currentDate);
                    currentSign = sign;
                } else if (currentSign !== sign) {
                    // Sign changed but still favorable (unlikely for Jupiter directly, but possible if moving 5->7 aspect etc? No, aspect depends on sign)
                    // If sign changes, aspect might change.
                    // If we are here, it means we were favorable, and now we are in a NEW sign which is ALSO favorable?
                    // Or we just continue.
                    // Actually, if sign changes, we should probably record the previous block and start new.
                    favorablePeriods.push({ start: currentFavorableStart, end: new Date(currentDate), sign: currentSign });
                    currentFavorableStart = new Date(currentDate);
                    currentSign = sign;
                }
            } else {
                if (currentFavorableStart) {
                    favorablePeriods.push({ start: currentFavorableStart, end: new Date(currentDate), sign: currentSign });
                    currentFavorableStart = null;
                    currentSign = -1;
                }
            }
        }

        currentDate.setDate(currentDate.getDate() + stepDays);
    }

    if (currentFavorableStart) {
        favorablePeriods.push({ start: currentFavorableStart, end: end, sign: currentSign });
    }

    return favorablePeriods;
};

// Helper to scan for Sun Transit periods within a window
const getSunFavorablePeriods = (startDate: Date, endDate: Date, ascendantSign: number, house7Sign: number): { start: Date, end: Date }[] => {
    const periods: { start: Date, end: Date }[] = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    const stepDays = 5; // Check every 5 days for Sun

    let currentStart: Date | null = null;

    while (currentDate <= end) {
        const transits = calculatePlanetaryPositions(currentDate, 13.0827, 80.2707);
        const sun = transits.planets.find(p => p.name === 'Sun');

        if (sun) {
            // Rule: Sun in 7th House OR Lagna
            const isFavorable = sun.signIndex === house7Sign || sun.signIndex === ascendantSign;

            if (isFavorable) {
                if (!currentStart) {
                    currentStart = new Date(currentDate);
                }
            } else {
                if (currentStart) {
                    periods.push({ start: currentStart, end: new Date(currentDate) });
                    currentStart = null;
                }
            }
        }
        currentDate.setDate(currentDate.getDate() + stepDays);
    }
    if (currentStart) {
        periods.push({ start: currentStart, end: end });
    }
    return periods;
};


// Helper: Get Marriage Giving Lords (Step 2)
// Returns ordered priority list: [Primary, Secondary, Tertiary...]
const getMarriageGivingLords = (lagnaIndex: number, subathuvamScores: Record<string, SubathuvamResult>): string[] => {
    // 0=Aries, 11=Pisces
    const lordsMap: Record<number, string[]> = {
        0: ['Saturn', 'Venus', 'Mercury'],      // Aries
        1: ['Mars', 'Jupiter'],                 // Taurus
        2: ['Jupiter', 'Moon', 'Sun'],          // Gemini
        3: ['Saturn', 'Mercury', 'Venus'],      // Cancer
        4: ['Saturn', 'Mercury', 'Venus'],      // Leo (Moon added conditionally below)
        5: ['Jupiter', 'Venus', 'Moon'],        // Virgo
        6: ['Venus', 'Mercury'],                // Libra (Avoid Mars/Sun)
        7: ['Mercury', 'Venus', 'Saturn'],      // Scorpio
        8: ['Mercury', 'Venus'],                // Sagittarius (Saturn 2,3 - ignored as main giver)
        9: ['Moon', 'Jupiter', 'Mars', 'Saturn'], // Capricorn
        10: ['Sun', 'Mars'],                    // Aquarius
        11: ['Mars', 'Mercury']                 // Pisces
    };

    const specificLords = [...(lordsMap[lagnaIndex] || [])];

    // Special Rule for Leo (Simha) - Moon if Benefic
    if (lagnaIndex === 4) {
        // Moon is 12th Lord, can give if benefic (Subathuva)
        const moonScore = subathuvamScores['Moon'];
        if (moonScore && moonScore.isSubathuva) {
            specificLords.push('Moon'); // Added as extra option (usually last priority unless very strong)
        }
    }

    return specificLords;
};

// 2. Detailed Marriage Timing (Precision Engine)
export const predictDetailedMarriageTiming = (
    currentDasa: { maha: DashaPeriod, bhukti?: DashaPeriod },
    transits: TransitPositions,
    ascendantSign: number,
    moonSign: number,
    planets: any[],
    birthDate: Date,
    gender: 'male' | 'female' = 'male',
    allDashaPeriods: DashaPeriod[] = [],
    language: 'en' | 'ta' = 'en',
    subathuvamScores: Record<string, SubathuvamResult> = {} // Added parameter
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "எனக்கு எப்போது திருமணம் நடக்கும்?" : "When will I get married?";

    // Guard against null currentDasa
    if (!currentDasa?.maha?.planet) {
        return {
            question,
            answer: isTamil ? "தசை தகவல் கிடைக்கவில்லை" : "Dasa data not available",
            reason: "",
            isFavorable: false
        };
    }

    const getP = (name: string) => getPlanetPosition(planets, name);
    const getH = (sign: number) => (sign - ascendantSign + 12) % 12 + 1;

    // --- Step 1: Late Marriage Indicators ---
    let isLateMarriage = false;
    let lateReasons: string[] = [];
    let reliefReasons: string[] = [];

    const saturn = getP('Saturn');
    const jupiter = getP('Jupiter');
    const house7Sign = (ascendantSign + 6) % 12;
    const lord7 = SIGN_LORDS[house7Sign];
    const lord7Planet = getP(lord7);

    // 1. Saturn Position Check
    if (saturn) {
        const saturnHouse = getH(saturn.signIndex);
        if (saturnHouse === 2 || saturnHouse === 8) {
            isLateMarriage = true;
            lateReasons.push(isTamil
                ? `சனி ${saturnHouse}-ம் வீட்டில் உள்ளார் (தாமத அறிகுறி).`
                : `Saturn is in ${saturnHouse}th house (Delay Indicator).`);

            // Check Relief (Jupiter Aspect)
            if (jupiter) {
                const aspect = isAspecting(jupiter.signIndex, saturn.signIndex, [1, 5, 7, 9]);
                if (aspect) {
                    reliefReasons.push(isTamil
                        ? "குருவின் பார்வை சனி மீது உள்ளது (தாமதம் குறையும்)."
                        : "Jupiter aspects Saturn (Delay reduces).");
                    isLateMarriage = false; // Relief
                }
            }
            // Check Benefic Conjunction
            const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
            const conj = planets.find(p => benefics.includes(p.name) && p.signIndex === saturn.signIndex);
            if (conj) {
                reliefReasons.push(isTamil
                    ? `${conj.name} கிரகத்துடன் சனி சேர்க்கை (தாமதம் குறையும்).`
                    : `Saturn conjoined with ${conj.name} (Delay reduces).`);
                isLateMarriage = false; // Relief
            }
        }
    }

    // 2. 7th House/Lord Analysis
    if (lord7Planet) {
        const l7House = getH(lord7Planet.signIndex);
        if ([6, 8, 12].includes(l7House)) {
            // Ubaya Lagna Exception check could go here, but prompt says "Is 7th Lord in 8th? -> Late"
            if (l7House === 8) {
                isLateMarriage = true;
                lateReasons.push(isTamil
                    ? "7-ம் அதிபதி 8-ல் உள்ளார்."
                    : "7th Lord is in 8th House.");
            } else {
                lateReasons.push(isTamil
                    ? `7-ம் அதிபதி ${l7House}-ல் (மறைவு ஸ்தானம்).`
                    : `7th Lord in ${l7House}th House (Hidden House).`);
            }
        }
    }

    // Malefic Aspects on 7th House/Lord
    const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
    const checkMaleficAspect = (targetSign: number) => {
        return planets.some(p => malefics.includes(p.name) && isAspecting(p.signIndex, targetSign, [1, 4, 7, 8, 10])); // Simplified aspects
    };
    if (checkMaleficAspect(house7Sign)) {
        // Only consider if no relief
        // For brevity, we just note it
    }

    // --- Step 2: Identify Marriage-Giving Lords ---
    let marriageLords = getMarriageGivingLords(ascendantSign, subathuvamScores);

    // Special Rule for Leo (Simha) - Index 4
    if (ascendantSign === 4 && marriageLords.includes('Moon')) {
        const moonScore = subathuvamScores['Moon'];
        if (!moonScore || !moonScore.isSubathuva) {
            // Remove Moon if not Subathuva
            marriageLords = marriageLords.filter(lord => lord !== 'Moon');
            // Optional: Log reason or add to lateReasons/reliefReasons if beneficial for debug
            // reason += "(Moon removed due to lack of Subathuvam for Leo)"; 
        }
    }

    // --- Step 3: Dasa-Bhukti-Antara Scoring ---
    // Helper to score a period
    // Returns { score, breakdown }
    const scorePeriod = (dasa: string, bhukti: string, antaram: string) => {
        let score = 0;
        let reasons: string[] = [];

        // Priority Scoring:
        // Priority 1 Lord in Dasa/Bhukti = +5
        // Priority 2 Lord in Dasa/Bhukti = +3
        // Others = +1
        const getPriorityScore = (planet: string) => {
            const idx = marriageLords.indexOf(planet);
            if (idx === 0) return 5; // Best Lord (e.g., Saturn for Leo)
            if (idx === 1) return 3; // Second Best
            if (idx > 1) return 2;   // Others
            return 0; // Not in list
        };

        const dasaP = getPriorityScore(dasa);
        if (dasaP > 0) { score += dasaP; reasons.push(`Dasa Priority ${marriageLords.indexOf(dasa) + 1}`); }

        const bhuktiP = getPriorityScore(bhukti);
        if (bhuktiP > 0) { score += bhuktiP; reasons.push(`Bhukti Priority ${marriageLords.indexOf(bhukti) + 1}`); }

        const antaramP = getPriorityScore(antaram);
        if (antaramP > 0) { score += 1; }

        // Placement Match (2, 7, 11)
        const checkPlace = (pName: string) => {
            const p = getP(pName);
            if (!p) return 0;
            const h = getH(p.signIndex);
            if ([2, 7, 11].includes(h)) return 1;
            return 0;
        };

        if (checkPlace(dasa)) score += 1;
        if (checkPlace(bhukti)) score += 1;
        if (checkPlace(antaram)) score += 1;

        // Venus Priority (Universal)
        if (dasa === 'Venus' || bhukti === 'Venus') score += 2;

        // Subathuvam Check
        if (subathuvamScores[dasa]?.isSubathuva) score += 1;
        if (subathuvamScores[bhukti]?.isSubathuva) score += 1;

        return score;
    };

    // Find High Probability Periods
    const now = new Date();
    // Convert birthDate to Date object if it's not already
    const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const age21Date = new Date(birthDateObj.getFullYear() + 21, birthDateObj.getMonth(), birthDateObj.getDate());

    // Limits
    const endScanDate = new Date(now.getFullYear() + 10, 0, 1); // Audit next 10 years

    const validPeriods: {
        start: Date,
        end: Date,
        dasa: string,
        bhukti: string,
        antaram: string,
        score: number,
        isPriority1: boolean
    }[] = [];

    if (allDashaPeriods.length > 0) {
        for (const maha of allDashaPeriods) {
            if (maha.endDate < now) continue; // Skip past
            if (maha.startDate > endScanDate) break; // Stop at limit

            if (maha.subPeriods) {
                for (const bhukti of maha.subPeriods) {
                    if (bhukti.endDate < now) continue;

                    if (bhukti.subPeriods) {
                        for (const antaram of bhukti.subPeriods) {
                            if (antaram.endDate < now) continue;
                            if (antaram.endDate < age21Date) continue; // Skip childhood

                            // STRICT RULE: Antaram Lord MUST be a Marriage-Giving Lord
                            // Even if Dasa/Bhukti are strong, the event usually triggers when a relevant Antaram runs.
                            if (!marriageLords.includes(antaram.planet)) continue;

                            const s = scorePeriod(maha.planet, bhukti.planet, antaram.planet);

                            // Check if this period involves the Priority 1 Lord
                            const p1Lord = marriageLords[0];
                            const isP1 = (maha.planet === p1Lord || bhukti.planet === p1Lord);

                            if (s >= 4) {
                                validPeriods.push({
                                    start: (antaram.startDate < now) ? now : antaram.startDate, // Cap at now if running
                                    end: antaram.endDate,
                                    dasa: maha.planet,
                                    bhukti: bhukti.planet,
                                    antaram: antaram.planet,
                                    score: s,
                                    isPriority1: isP1
                                });
                            }
                        }
                    }
                }
            }
        }
    }



    // --- Sequence Logic ---
    // "Saturn (P1) will main check near... if not then use Mercury (P2)"
    // We should filter validPeriods to prefer P1 periods if they exist within a reasonable time.
    // Otherwise show P2.

    let finalPeriods: typeof validPeriods = [];
    const p1Lord = marriageLords[0];

    // Find if there are any P1 periods in the next 5 years?
    const p2Lord = marriageLords[1];

    // Filter sets
    const p1Periods = validPeriods.filter(p => p.dasa === p1Lord || p.bhukti === p1Lord);
    const p2Periods = validPeriods.filter(p => p.dasa === p2Lord || p.bhukti === p2Lord);

    // --- Sequence Logic (Waterfall with Smart Gap Fill) ---
    // User Requirement: "Saturn (P1) near... if gap (e.g. 2026 to 2041) find intermediate valid periods"

    // Sort all by date first
    p1Periods.sort((a, b) => a.start.getTime() - b.start.getTime());
    p2Periods.sort((a, b) => a.start.getTime() - b.start.getTime());
    validPeriods.sort((a, b) => a.start.getTime() - b.start.getTime());

    // 1. Start with P1 periods as the baseline.
    let selectedPeriods = [...p1Periods];

    // 2. Gap Analysis & Fill
    // If P1 is empty, or has large gaps, fill with P2 or General Valid.
    const GAP_THRESHOLD_YEARS = 3.5;

    const nowTime = now.getTime();
    const msPerYear = 1000 * 60 * 60 * 24 * 365.25;

    // A. Initial Gap Check (Now to First P1)
    if (selectedPeriods.length === 0 || (selectedPeriods[0].start.getTime() - nowTime) / msPerYear > GAP_THRESHOLD_YEARS) {
        // Find fillers before the first P1
        const endLimit = selectedPeriods.length > 0 ? selectedPeriods[0].start : new Date(now.getFullYear() + 10, 0, 1);

        // Prefer P2 fillers first
        const p2Fillers = p2Periods.filter(p => !p.isPriority1 && p.start >= now && p.start < endLimit);
        // If no P2, us generic valid fillers
        const genericFillers = validPeriods.filter(p => !p.isPriority1 && p.start >= now && p.start < endLimit);

        const fillers = p2Fillers.length > 0 ? p2Fillers : genericFillers;

        fillers.forEach(f => {
            // Add unique
            if (!selectedPeriods.some(sp => sp.dasa === f.dasa && sp.bhukti === f.bhukti && sp.antaram === f.antaram)) {
                selectedPeriods.push(f);
            }
        });
    }

    // B. Inter-Period Gap Check (Between P1s)
    // We iterate through valid periods and check if they fall into any "empty" space between P1s
    // Simple heuristic: If a valid period is > 2 years away from ANY P1 period, include it.
    const otherHighQuality = validPeriods.filter(p => !p.isPriority1);

    otherHighQuality.forEach(other => {
        // Is this 'other' period useful? 
        // useful if it occupies a time slot where NO P1 period exists within +/- 2 years.
        const isCoveredByP1 = p1Periods.some(p1 => {
            const diffYears = Math.abs(p1.start.getTime() - other.start.getTime()) / msPerYear;
            return diffYears < 2.5; // If within 2.5 years of a P1, assume P1 covers it.
        });

        if (!isCoveredByP1) {
            // Add only if not already added
            if (!selectedPeriods.some(sp => sp.dasa === other.dasa && sp.bhukti === other.bhukti && sp.antaram === other.antaram)) {
                selectedPeriods.push(other);
            }
        }
    });

    finalPeriods = selectedPeriods;

    // Fallback: If absolutely nothing selected (rare), revert to validPeriods
    if (finalPeriods.length === 0) {
        finalPeriods = validPeriods;
    }

    // Final Sort by Date
    finalPeriods.sort((a, b) => a.start.getTime() - b.start.getTime());

    // --- Step 4: Final Prediction Output ---
    let answer = "";
    let reason = "";

    // Late Marriage Text
    if (isLateMarriage && lateReasons.length > 0) {
        answer += isTamil
            ? `**தாமத திருமணம் வாய்ப்பு:**\n${lateReasons.join('\n')}\n(ஆனால் சரியான பரிகாரம் மற்றும் தசை காலத்தில் திருமணம் கைகூடும்).\n\n`
            : `**Indication of Delayed Marriage:**\n${lateReasons.join('\n')}\n(Marriage is possible during favorable Dasa/Bhukti).\n\n`;
    } else if (reliefReasons.length > 0) {
        answer += isTamil
            ? `**தடைகள் இருந்தாலும் திருமணம் நடக்கும்:**\n${reliefReasons.join('\n')}\n\n`
            : `**Marriage possible despite delays:**\n${reliefReasons.join('\n')}\n\n`;
    } else {
        answer += isTamil
            ? `**திருமண காலம்:** ஜாதக அமைப்புப்படி சரியான காலத்தில் திருமணம் நடக்கும்.\n\n`
            : `**Marriage Timing:** Favorable alignment for marriage at right age.\n\n`;
    }

    const verdict = answer;

    // Periods List
    if (finalPeriods.length > 0) {
        // Take top 3 distinct periods
        const topPeriods = finalPeriods.slice(0, 3);

        const periodTexts = topPeriods.map(p => {
            const startStr = p.start.toLocaleDateString(language, { month: 'short', year: 'numeric' });
            const endStr = p.end.toLocaleDateString(language, { month: 'short', year: 'numeric' });
            const scoreLabel = isTamil ? "மதிப்பெண்" : "Score";
            const priorityLabel = p.isPriority1 ? (isTamil ? "(முக்கிய காலம்)" : "(Primary Period)") : "";
            return `**${startStr} - ${endStr}**: ${p.dasa}/${p.bhukti}/${p.antaram} ${priorityLabel}`;
        });

        answer += isTamil
            ? `திருமணம் நடக்க வாய்ப்புள்ள வலுவான காலங்கள்:\n${periodTexts.join('\n')}`
            : `Strongest High Probability Periods:\n${periodTexts.join('\n')}`;
    } else {
        answer += isTamil
            ? "அடுத்த சில ஆண்டுகளில் மிக வலுவான திருமண தசை குறிப்புகள் இல்லை. பரிகாரங்கள் தேவைப்படலாம்."
            : "No very strong (>4 score) Dasa periods found in the near future. Remedies might be needed.";
    }

    // Reason Text
    const lordNames = marriageLords.slice(0, 3).join(', '); // Show top 3 expected
    reason = isTamil
        ? `**எதிர்பார்க்கப்படும் கிரகங்கள் (வரிசைப்படி):** ${lordNames}\n\n**கணிப்பு முறை:**\n- இந்த லக்னத்திற்குரிய முக்கிய திருமண கிரகம் (${p1Lord || 'None'} போன்ற) முதலில் தேடுகிறோம்.\n- அது அமைந்த தசை/புத்திகளுக்கு கூடுதல் மதிப்பெண்கள் வழங்கப்பட்டுள்ளன.`
        : `**Expected Lords (In Priority Order):** ${lordNames}\n\n**Logic Used:**\n- We check for the Primary Marriage Lord (${p1Lord || 'None'}) first.\n- Periods involving this lord get Priority Bonus points.`;

    const structuredPeriods = finalPeriods.map((p: any) => ({
        start: p.start,
        end: p.end,
        dasa: p.dasa,
        bhukti: p.bhukti,
        antaram: p.antaram,
        score: p.score || 0,
        isPriority1: p.isPriority1 || false,
        isPriority2: p.isPriority2 || false,
        reason: p.reason
    }));

    return {
        question,
        answer,
        reason,
        isFavorable: validPeriods.length > 0,
        predictionDetails: {
            periods: structuredPeriods,
            marriageLords,
            isLateMarriage,
            lateReasons
        },
        verdict
    };
};

// 3. Love vs Arranged (Guruji's Formula + Rahu Logic)
// 3. Love vs Arranged (Hierarchy of Love Method)
export const predictMarriageType = (
    planets: any[],
    ascendantSign: number,
    subathuvamScores: Record<string, SubathuvamResult>,
    currentDasa?: { maha: DashaPeriod, bhukti?: DashaPeriod },
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "காதல் திருமணமா அல்லது பெற்றோர் பார்க்கும் திருமணமா?" : "Love or Arranged Marriage?";

    const getP = (name: string) => getPlanetPosition(planets, name);
    const venus = getP('Venus');
    const rahu = getP('Rahu');
    const ketu = getP('Ketu');
    const lagnaLord = SIGN_LORDS[ascendantSign];
    const pLagna = getP(lagnaLord);

    const house3Sign = (ascendantSign + 2) % 12;
    const house5Sign = (ascendantSign + 4) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house11Sign = (ascendantSign + 10) % 12;

    const lord3 = SIGN_LORDS[house3Sign];
    const lord5 = SIGN_LORDS[house5Sign];
    const lord7 = SIGN_LORDS[house7Sign];
    const lord11 = SIGN_LORDS[house11Sign];

    const p3 = getP(lord3);
    const p5 = getP(lord5);
    const p7 = getP(lord7);
    const p11 = getP(lord11);

    // --- Extra Definitions ---
    const house9Sign = (ascendantSign + 8) % 12;
    const lord9 = SIGN_LORDS[house9Sign]; // Also define lord9 just in case logic uses it

    let predictionType = "";
    let reasons: string[] = [];
    let isLove = false;

    // --- Scoring System ---
    let loveScore = 0;
    let arrangedScore = 0;

    // 1. Conjunctions (Classic Rule)
    if (p5 && p7 && p5.signIndex === p7.signIndex) {
        loveScore += 40;
        reasons.push(isTamil ? "5-ம் மற்றும் 7-ம் அதிபதிகள் சேர்க்கை." : "5th and 7th Lords are conjoined.");
    }
    if (pLagna && p7 && pLagna.signIndex === p7.signIndex) {
        loveScore += 30;
        reasons.push(isTamil ? "லக்னாதிபதி மற்றும் 7-ம் அதிபதி சேர்க்கை." : "Lagna Lord and 7th Lord are conjoined.");
    }

    // 2. Rahu Effect (Unconventional)
    if (rahu && (rahu.signIndex === house7Sign || (p7 && rahu.signIndex === p7.signIndex))) {
        loveScore += 35;
        reasons.push(isTamil ? "ராகு 7-ல் அல்லது 7-ம் அதிபதியுடன் (கலப்பு திருமணம்)." : "Rahu in 7th or with 7th Lord (Inter-caste/Love).");
    }

    // 3. Venus Analysis (The User's Request)
    // "check Venus realted if Venus releate past he have love check how Venus in that chart it good or bad"
    const venusScore = subathuvamScores['Venus']?.totalScore || 0;
    const isVenusSubathuva = venusScore >= 50;

    // Check Libra (Thulam - House of Venus/Balance)
    // If Lagna is Libra (6) -> Venus is Lagna Lord -> Nature is Love/Art
    // If 7th is Libra (6) -> Aries Lagna -> Venus is 7th Lord.
    const isLagnaLibra = ascendantSign === 6;
    const is7thLibra = house7Sign === 6;

    if (isLagnaLibra || is7thLibra) {
        loveScore += 15;
        reasons.push(isTamil
            ? "துலாம் ராசி தொடர்பு (லக்னம் அல்லது 7-ம் இடம்) - இயற்கையான காதல் ஈர்ப்பு."
            : "Libra connection (Lagna or 7th) - Natural romantic inclination.");
    }

    if (isVenusSubathuva) {
        loveScore += 20;
        reasons.push(isTamil
            ? "சுக்கிரன் சுபத்துவமாக உள்ளார் (உண்மையான அன்பு)."
            : "Venus is Subathuva (Strong/Pure Love).");
    } else {
        // Weak Venus often means love failure or unconventional desire usually leading to arranged
        arrangedScore += 10;
        reasons.push(isTamil
            ? "சுக்கிரன் பலவீனமாக உள்ளார் (காதல் தோல்வி அல்லது பெற்றோர் தேர்வு)."
            : "Venus is Weak (Love obstacles/Arranged likely).");
    }

    // 4. Dasa/Bhukti Check (Timing Rule)
    // "check dasa buthi and check Venus realted"
    if (currentDasa) {
        const dasaLord = currentDasa?.maha?.planet;
        if (!dasaLord) return { question: "Marriage Type?", answer: "Data Missing", reason: "", isFavorable: false };
        const bhuktiLord = currentDasa.bhukti?.planet;

        // Is Dasa Lord Venus or 5th/7th/Rahu?
        const lovePlanets = ['Venus', 'Rahu', lord5, lord7];

        if (lovePlanets.includes(dasaLord)) {
            loveScore += 25;
            reasons.push(isTamil
                ? `தற்போதைய தசை (${dasaLord}) காதலுக்கு சாதகமானது.`
                : `Current Dasa (${dasaLord}) favors Love.`);
        } else if (bhuktiLord && lovePlanets.includes(bhuktiLord)) {
            loveScore += 15;
            reasons.push(isTamil
                ? `தற்போதைய புத்தி (${bhuktiLord}) காதலுக்கு சாதகமானது.`
                : `Current Bhukti (${bhuktiLord}) favoring Love.`);
        } else {
            // Unrelated Dasa often leads to Arranged
            arrangedScore += 20;
        }
    }

    // 5. 9th House (Parental Approval)
    // If 9th Lord is strong and connected to 7th, Parents arrange it.
    if (p7 && p5 && p7.signIndex === house9Sign) {
        arrangedScore += 25;
        reasons.push(isTamil ? "7-ம் அதிபதி 9-ல் (பெற்றோர் நிச்சயித்த திருமணம்)." : "7th Lord in 9th (Arranged by parents).");
    }

    // --- Final Verdict ---
    let verdict = "";

    // Normalize Scores
    arrangedScore += 20; // Default weight for social norm

    if (loveScore > arrangedScore) {
        const diff = loveScore - arrangedScore;
        if (diff > 30) {
            verdict = isTamil ? "காதல் திருமணம் நடக்கவே அதிக வாய்ப்பு." : "Strong indication of Love Marriage.";
        } else {
            verdict = isTamil ? "காதல் கலந்த பெற்றோர் சம்மதத்துடன் திருமணம்." : "Love Marriage with parental approval likely.";
        }
        isLove = true;
    } else {
        verdict = isTamil ? "பெற்றோர் பார்க்கும் (Arranged) திருமணம் நடக்கவே வாய்ப்பு." : "Arranged Marriage is most likely.";
        // Check for Love Failure context
        if (!isVenusSubathuva && loveScore > 20) {
            verdict += isTamil ? " (கடந்த கால காதல் தடைகள் இருக்கலாம்)." : " (Possible past love obstacles).";
        }
        isLove = false;
    }

    // Additional Context: Inter-caste Warning
    if (isLove && !verdict.includes("Inter-caste") && !verdict.includes("கலப்பு")) {
        if (ketu && ketu.signIndex === house7Sign) {
            reasons.push(isTamil ? "கேது 7-ல் உள்ளார் (கலப்பு சாத்தியம்)." : "Ketu in 7th House (Inter-caste likely).");
            verdict += isTamil ? " (கலப்பு சாத்தியம்)" : " (Inter-caste likely)";
        }
    }

    const answer = verdict;
    const reason = reasons.join('\n- ');

    return {
        question,
        answer,
        reason: isTamil ? `**காரணங்கள்:**\n- ${reason}` : `**Reasons:**\n- ${reason}`,
        isFavorable: isLove // Favorable = Love in this context? Or just neutral. Let's say True if Love, False if Arranged for now, or just True.
        // Actually, let's keep it consistent with "Favorable" meaning "Love" as that's usually the query "Will I have love marriage?"
    };
};

// 4. Suitable Career Path (Job vs Business) - Guruji Method
// 4. Suitable Career Path (Job vs Business) - Guruji Method
export const predictCareerPath = (
    planets: any[],
    ascendantSign: number,
    subathuvamScores: Record<string, SubathuvamResult>,
    currentDasa?: { maha: DashaPeriod, bhukti?: DashaPeriod },
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "எந்த வேலை எனக்கு ஏற்றது? (தொழில்/வேலை)" : "Which Career is suitable? (Job vs Business)";

    const getP = (name: string) => getPlanetPosition(planets, name);

    // --- Helper for Planetary Combinations ---
    const checkCombo = (p1: string, p2: string): boolean => {
        const pl1 = getP(p1);
        const pl2 = getP(p2);
        return !!(pl1 && pl2 && pl1.signIndex === pl2.signIndex); // Conjunction
    };

    // --- Detailed Combination Rules (From User) ---
    const combinationRules = [
        // 1. SUN Combinations
        {
            check: () => checkCombo('Sun', 'Moon'),
            msg_ta: "அரசாங்க வேலைகள், பொது நிர்வாகம், அரசியல்",
            msg_en: "Government Jobs, Public Administration, Politics"
        },
        {
            check: () => checkCombo('Sun', 'Mars'),
            msg_ta: "இராணுவம், காவல்துறை, பாதுகாப்பு துறை (குறிப்பாக 10-ல் இருந்தால் சிறப்பு)",
            msg_en: "Army, Police, Defense Sector (Excellent if in 10th House)"
        },
        {
            check: () => checkCombo('Sun', 'Mercury'),
            msg_ta: "நிதி, வங்கி, அரசாங்க கணக்காளர் (நிபுணத்துவம்)",
            msg_en: "Finance, Banking, Govt Accountant (Expertise)"
        },
        {
            check: () => checkCombo('Sun', 'Jupiter'),
            msg_ta: "நீதிபதி, சட்டம், உயர் கல்வி துறை, நிர்வாகம்",
            msg_en: "Judge, Law, Higher Education, Administration"
        },
        {
            check: () => checkCombo('Sun', 'Venus'),
            msg_ta: "நிதி மேலாண்மை, கலை/ஆடம்பர அரசுத் துறை",
            msg_en: "Financial Management, Arts/Luxury Govt Sector"
        },
        {
            check: () => checkCombo('Sun', 'Saturn'),
            msg_ta: "தாமதமான அரசு வேலை, கடின உழைப்பு சார்ந்த நிர்வாகம்",
            msg_en: "Delayed Govt Job, Hard Labor Administration"
        },

        // 2. MOON Combinations
        {
            check: () => checkCombo('Moon', 'Mars'),
            msg_ta: "உணர்ச்சி சார்ந்த தொழில், விவசாயம், மருத்துவம்",
            msg_en: "Emotion-centric jobs, Agriculture, Medical"
        },
        {
            check: () => checkCombo('Moon', 'Mercury'),
            msg_ta: "எழுத்து, இதழியல், வணிகம், கணக்கு",
            msg_en: "Writing, Journalism, Business, Accounts"
        },
        {
            check: () => checkCombo('Moon', 'Jupiter'),
            msg_ta: "வங்கி, நிதி, ஆசிரியர், தொண்டு நிறுவனம்",
            msg_en: "Banking, Finance, Teaching, NGO/Charity"
        },
        {
            check: () => checkCombo('Moon', 'Venus'),
            msg_ta: "சினிமா, பொழுதுபோக்கு, பால்/திரவம் சார்ந்த தொழில்",
            msg_en: "Cinema, Entertainment, Dairy/Liquid Business"
        },
        {
            check: () => checkCombo('Moon', 'Saturn'),
            msg_ta: "எண்ணெய், சுரங்கம், விவசாயம், பனி/நீர் தொழில்",
            msg_en: "Oil, Mining, Agriculture, Ice/Water Business"
        },

        // 3. MARS Combinations
        {
            check: () => checkCombo('Mars', 'Mercury'),
            msg_ta: "கட்டிட இன்ஜினியர் (Contractor), ரியல் எஸ்டேட்",
            msg_en: "Civil Engineer (Contractor), Real Estate"
        },
        {
            check: () => checkCombo('Mars', 'Jupiter'),
            msg_ta: "உயர் அதிகாரி (சீருடை), சட்டம், நிர்வாகம்",
            msg_en: "High Officer (Uniform), Law, Admin"
        },
        {
            check: () => checkCombo('Mars', 'Venus'),
            msg_ta: "கட்டடக்கலை (Architect), வாகனம், ஃபேஷன்",
            msg_en: "Architecture, Automobile, Fashion"
        },
        {
            check: () => checkCombo('Mars', 'Saturn'),
            msg_ta: "மெக்கானிக்கல், தொழிற்சாலை, இரும்பு/எஃகு",
            msg_en: "Mechanical, Industry, Iron/Steel"
        },
        {
            check: () => checkCombo('Mars', 'Ketu'),
            msg_ta: "ஆன்மீகம் கலந்த மருத்துவம், ஜோதிடம், மின்சாரம்",
            msg_en: "Spiritual Medicine, Astrology, Electricity"
        },

        // 4. MERCURY Combinations
        {
            check: () => checkCombo('Mercury', 'Jupiter'),
            msg_ta: "வங்கி அதிகாரி, ஆடிட்டர், ஆசிரியர், ஜோதிடம்",
            msg_en: "Bank Officer, Auditor, Teacher, Astrology"
        },
        {
            check: () => checkCombo('Mercury', 'Venus'),
            msg_ta: "கலை மற்றும் கணினி, வரைபடம் (Graphics), ஊடகம்",
            msg_en: "Arts & Tech, Graphics, Media"
        },
        {
            check: () => checkCombo('Mercury', 'Saturn'),
            msg_ta: "கணக்கு தணிக்கை, புள்ளிவிவரம், வியாபாரம்",
            msg_en: "Auditing, Statistics, Business"
        },
        {
            check: () => checkCombo('Mercury', 'Rahu'),
            msg_ta: "ஆராய்ச்சி, டெக்னாலஜி, புகைப்படம், நிழல் உலகத் தொடர்பு",
            msg_en: "Research, Technology, Photography"
        },

        // 5. JUPITER Combinations (Key for Profession)
        {
            check: () => checkCombo('Jupiter', 'Venus'),
            msg_ta: "நிர்வாக ஆலோசகர், கல்வி நிறுவனம், வங்கி",
            msg_en: "Management Consultant, Education Institute, Banking"
        },
        {
            check: () => checkCombo('Jupiter', 'Saturn'),
            msg_ta: "சட்டம், தர்ம ஸ்தாபனம், மத போதகர்/தலைவர்",
            msg_en: "Law, Charitable Trust, Religious Leader"
        },

        // 6. SATURN Combinations (Career Karaka)
        {
            check: () => checkCombo('Saturn', 'Venus'),
            msg_ta: "வாகனம், இரும்பு, தோல் தொழில், அழகு சாதனங்கள்",
            msg_en: "Automobile, Iron, Leather, Cosmetics"
        },

        // 7. RAHU/KETU
        {
            check: () => checkCombo('Rahu', 'Jupiter'),
            msg_ta: "வெளிநாட்டுத் தொடர்பு, சட்டம், பிரம்மாண்டத் தொழில்",
            msg_en: "Foreign Connect, Law, Large Scale Industry"
        },
        {
            check: () => checkCombo('Ketu', 'Mars'),
            msg_ta: "மருத்துவம் (Surgery), மின்சாரம், நுண்ணிய கருவிகள்",
            msg_en: "Medical (Surgery), Electrical, Micro Instruments"
        },

        // 8. THREE PLANET COMBOS (Special) - Nested Checks
        {
            check: () => checkCombo('Sun', 'Jupiter') && checkCombo('Sun', 'Mercury'),
            msg_ta: "மிகப்பெரிய அரசியல்/நிர்வாக வெற்றி (Power & Admin)",
            msg_en: "Great Political/Administrative Success"
        },
        {
            check: () => checkCombo('Moon', 'Jupiter') && checkCombo('Moon', 'Venus'),
            msg_ta: "செல்வம் கொழிக்கும் தொழில், பொழுதுபோக்கு",
            msg_en: "Wealthy Business, Entertainment"
        },
        {
            check: () => checkCombo('Mars', 'Mercury') && checkCombo('Mars', 'Jupiter'),
            msg_ta: "தொழில்நுட்ப மேதை, இன்ஜினியரிங் தலைமை",
            msg_en: "Tech Genius, Engineering Head"
        },
        {
            check: () => checkCombo('Saturn', 'Venus') && checkCombo('Saturn', 'Mercury'),
            msg_ta: "சிறந்த வணிகர் (Merchant), வரைவாளர்",
            msg_en: "Excellent Merchant, Draftsman"
        }
    ];

    // Find Matched Combinations
    const matches: string[] = [];
    combinationRules.forEach(rule => {
        if (rule.check()) {
            matches.push(isTamil ? rule.msg_ta : rule.msg_en);
        }
    });
    // Deduplicate and Take top 3
    const uniqueMatches = Array.from(new Set(matches)).slice(0, 3);

    // --- Original Logic (Subathuvam & Dasa) ---
    // House Definitions
    const house6Sign = (ascendantSign + 5) % 12;
    const house8Sign = (ascendantSign + 7) % 12;
    const lord6 = SIGN_LORDS[house6Sign];
    const lord8 = SIGN_LORDS[house8Sign];

    // Score Access
    const saturnScore = subathuvamScores['Saturn']?.totalScore || 0;
    const mercuryScore = subathuvamScores['Mercury']?.totalScore || 0;
    const sunScore = subathuvamScores['Sun']?.totalScore || 0;
    const marsScore = subathuvamScores['Mars']?.totalScore || 0;
    const jupiterScore = subathuvamScores['Jupiter']?.totalScore || 0;
    const venusScore = subathuvamScores['Venus']?.totalScore || 0;
    const moonScore = subathuvamScores['Moon']?.totalScore || 0;

    let careerType = "";
    let reasons: string[] = [];
    let currentFocus = "";

    // 1. Job vs Business (Saturn vs Mercury)
    const isBusiness = mercuryScore > saturnScore && mercuryScore > 15;

    if (isBusiness) {
        careerType = isTamil ? "சொந்த தொழில் (Business)" : "Business / Self-Employment";
        reasons.push(isTamil
            ? `கணக்கீடு: புதன் (${mercuryScore.toFixed(0)}) > சனி (${saturnScore.toFixed(0)}).\n- புதன் சனியை விட வலுவாக உள்ளார் (வியாபார சிந்தனை).`
            : `Calculation: Mercury (${mercuryScore.toFixed(0)}) > Saturn (${saturnScore.toFixed(0)}).\n- Mercury is stronger than Saturn (Business aptitude).`);
    } else {
        const diff = saturnScore - mercuryScore;
        if (diff > 10) {
            careerType = isTamil ? "அரசு/தனியார் வேலை (Job/Service)" : "Job / Service (Employment)";
            reasons.push(isTamil
                ? `கணக்கீடு: சனி (${saturnScore.toFixed(0)}) > புதன் (${mercuryScore.toFixed(0)}).\n- சனி புதனை விட வலுவாக உள்ளார் (உழைப்பு/சேவை).`
                : `Calculation: Saturn (${saturnScore.toFixed(0)}) > Mercury (${mercuryScore.toFixed(0)}).\n- Saturn is stronger than Mercury (Service oriented).`);
        } else {
            careerType = isTamil ? "வேலை அல்லது தொழில் (இரண்டும் சாத்தியம்)" : "Job or Business (Mixed Potential)";
            reasons.push(isTamil
                ? `கணக்கீடு: சனி (${saturnScore.toFixed(0)}) ≈ புதன் (${mercuryScore.toFixed(0)}).\n- சனியும் புதனும் சம பலத்தில் உள்ளனர்.`
                : `Calculation: Saturn (${saturnScore.toFixed(0)}) ≈ Mercury (${mercuryScore.toFixed(0)}).\n- Saturn and Mercury have comparable strength.`);
        }
    }

    // 2. Career Domain Ranking
    const scores = [
        { name: isTamil ? 'சூரியன் (நிர்வாகம்/அரசு)' : 'Sun (Govt/Admin)', val: sunScore, planet: 'Sun', domain: isTamil ? "அரசு, அரசியல், நிர்வாகம்" : "Government, Politics, Admin" },
        { name: isTamil ? 'செவ்வாய் (பொறியியல்/சீருடை)' : 'Mars (Engineering/Uniform)', val: marsScore, planet: 'Mars', domain: isTamil ? "ரியல் எஸ்டேட், சீருடைப் பணி, பொறியியல்" : "Real Estate, Engineering, Uniformed Services" },
        { name: isTamil ? 'குரு (நிதி/ஆசிரியர்)' : 'Jupiter (Finance/Teaching)', val: jupiterScore, planet: 'Jupiter', domain: isTamil ? "வங்கி, கல்வி, சட்டம், ஆன்மீகம்" : "Banking, Education, Law, Finance" },
        { name: isTamil ? 'சுக்கிரன் (கலை/மென்பொருள்)' : 'Venus (Arts/IT/Luxury)', val: venusScore, planet: 'Venus', domain: isTamil ? "கலை, ஐடி (IT), சினிமா, வாகனம்" : "Arts, IT, Media, Luxury Goods" },
        { name: isTamil ? 'புதன் (கணக்கு/தொடர்பு)' : 'Mercury (Accounts/Comm)', val: mercuryScore, planet: 'Mercury', domain: isTamil ? "கணக்கு, எழுத்து, ஜோதிடம், வியாபாரம்" : "Accounting, Communication, Business, Data" },
        { name: isTamil ? 'சனி (தொழிற்சாலை/உழைப்பு)' : 'Saturn (Industry/Service)', val: saturnScore, planet: 'Saturn', domain: isTamil ? "பொறிமுறை, தொழிற்சாலை, கடின உழைப்பு" : "Manufacturing, Service, Labor" },
        { name: isTamil ? 'சந்திரன் (உணவு/பயணம்)' : 'Moon (Food/Travel)', val: moonScore, planet: 'Moon', domain: isTamil ? "உணவு, பயணம், ஏற்றுமதி" : "Food, Travel, Liquids" }
    ];

    const strongDomains = scores.filter(s => s.val > 10).sort((a, b) => b.val - a.val);

    let domainText = "";
    if (strongDomains.length > 0) {
        const top = strongDomains[0];
        domainText = isTamil
            ? `சிறந்த துறை: ${top.name}`
            : `Best Domain: ${top.name}`;
        reasons.push(isTamil
            ? `${top.planet} மிக அதிக சுபத்துவ பலம் (${top.val.toFixed(0)}) பெற்றுள்ளார்.`
            : `${top.planet} has the highest Subathuvam strength (${top.val.toFixed(0)}).`);

        if (strongDomains.length > 1) {
            const second = strongDomains[1];
            domainText += isTamil ? `, ${second.name}` : `, ${second.name}`;
        }
    } else {
        domainText = isTamil ? "பொதுவான துறை" : "General Stream";
    }

    // 3. Current Dasa Focus
    if (currentDasa) {
        const dasaLord = currentDasa?.maha?.planet;
        if (!dasaLord) return { question: "Foreign Travel?", answer: "Data Missing", reason: "", isFavorable: false };
        // Find Dasa Lord's Domain
        const dasaPlanetInfo = scores.find(s => s.planet === dasaLord);
        if (dasaPlanetInfo && dasaPlanetInfo.val > 10) {
            currentFocus = isTamil
                ? `தற்போதைய கவனம்: ${dasaPlanetInfo.domain} (${dasaLord} தசை).`
                : `Current Focus: ${dasaPlanetInfo.domain} (Due to ${dasaLord} Dasa).`;
        }

        reasons.push(isTamil
            ? `தற்போதைய தசை: ${dasaLord} (இப்போதைய கவனம்).`
            : `Current Dasa: ${dasaLord} (Current focus).`);

        // 6th Lord Rule Check
        if (dasaLord === lord6) {
            currentFocus += isTamil
                ? " (எச்சரிக்கை: 6-ம் அதிபதி தசை. கடன்/விரோதம் தவிர்க்க வேலையில் தொடர்வது நல்லது)"
                : " (Warning: 6th Lord Dasa. Employment is safer/preferred).";

            reasons.push(isTamil
                ? "6-ம் அதிபதி தசையில் சொந்த தொழில் இடர்பாடானது."
                : "Running 6th Lord Dasa makes business risky.");
        }
        // 8th Lord Rule
        else if (dasaLord === lord8) {
            reasons.push(isTamil
                ? "குறிப்பு: 8-ம் அதிபதி தசை. எதிர்பாராத மாற்றங்கள் வரலாம். ஆராய்ச்சி/அயல்நாடு/இன்சூரன்ஸ் துறை ஏற்றது."
                : "Note: Running 8th Lord Dasa. Expect sudden changes. Research/Audit/Insurance fields are favorable.");
            currentFocus += isTamil ? " (மாற்றங்கள் வரலாம்)" : " (Expect Changes).";
        }
    }

    // 4. Incorporate Combination Insights
    let combinationText = "";
    if (uniqueMatches.length > 0) {
        combinationText = isTamil
            ? `\n\n**சிறப்பு யோகங்கள்:**\n- ${uniqueMatches.join('\n- ')}`
            : `\n\n**Special Combinations:**\n- ${uniqueMatches.join('\n- ')}`;

        reasons.push(isTamil
            ? `கிரக சேர்க்கைகள் (${uniqueMatches.length}) கூடுதல் வலிமை சேர்க்கின்றன.`
            : `Found ${uniqueMatches.length} significant planetary combinations.`);
    }

    // 5. Jupiter Analysis (Existing)
    const jupiterAnalysis = predictJupiterCareer(planets, ascendantSign, (planets.find(p => p.name === 'Moon')?.signIndex || 0), subathuvamScores, language);
    let jupiterText = "";
    if (jupiterAnalysis) {
        jupiterText = `\n\n**${isTamil ? "குரு (Jupiter) சிறப்பு பலன்கள்:" : "Jupiter Specific Career Insights:"}**\n${jupiterAnalysis.prediction}`;
        reasons.push(`**${isTamil ? "குருவின் பங்களிப்பு" : "Jupiter's Contribution"}:**\n- ${jupiterAnalysis.reason}`);
    }

    // Construct Final Answer
    const answer = `**${careerType}**\n${domainText}${combinationText}\n\n${currentFocus}${jupiterText}`;
    const reasonText = reasons.join('\n- ');

    return {
        question,
        answer,
        reason: isTamil ? `**காரணங்கள்:**\n- ${reasonText}` : `**Reasons:**\n- ${reasonText}`,
        isFavorable: true
    };
};

// 5. Foreign Settlement Prediction (Aditya Guruji's 8-12 Subathuva Rule)
export const predictForeignTravel = (
    planets: any[],
    ascendantSign: number,
    moonSignIndex: number,
    subathuvamScores: Record<string, SubathuvamResult>,  // Keep for backward compatibility
    currentDasa?: { maha: DashaPeriod, bhukti?: DashaPeriod },
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "வெளிநாட்டில் செட்டில் ஆக முடியுமா?" : "Can I settle abroad?";

    const getP = (name: string) => getPlanetPosition(planets, name);

    // ✅ NEW: Use LATEST Subathuvam Calculation
    console.log('[Foreign Settlement] Calculating LATEST Subathuvam scores...');
    const latestSubathuvam = calculateSubathuvamPavathuvam(planets, language);

    // Use latest scores for all planets (simplified mapping)
    const updatedScores: Record<string, any> = {};
    for (const planetName in latestSubathuvam) {
        const result = latestSubathuvam[planetName];
        const netScore = (result.subathuvam || 0) - (result.pavathuvam || 0);
        updatedScores[planetName] = {
            totalScore: netScore
        };
    }

    // 1. Lagna Based Houses
    const l8 = (ascendantSign + 7) % 12;
    const l12 = (ascendantSign + 11) % 12;
    const l9 = (ascendantSign + 8) % 12;

    const lord8_Lagna = SIGN_LORDS[l8];
    const lord12_Lagna = SIGN_LORDS[l12];
    const lord9_Lagna = SIGN_LORDS[l9];

    // 2. Rasi Based Houses (Moon Sign)
    const r8 = (moonSignIndex + 7) % 12;
    const r12 = (moonSignIndex + 11) % 12;

    const lord8_Rasi = SIGN_LORDS[r8];
    const lord12_Rasi = SIGN_LORDS[r12];

    // ✅ USE LATEST SCORES (prioritize updated, fall back to old)
    const s8_L = updatedScores[lord8_Lagna]?.totalScore || subathuvamScores[lord8_Lagna]?.totalScore || 0;
    const s12_L = updatedScores[lord12_Lagna]?.totalScore || subathuvamScores[lord12_Lagna]?.totalScore || 0;
    const s8_R = updatedScores[lord8_Rasi]?.totalScore || subathuvamScores[lord8_Rasi]?.totalScore || 0;
    const s12_R = updatedScores[lord12_Rasi]?.totalScore || subathuvamScores[lord12_Rasi]?.totalScore || 0;

    console.log(`[Foreign Settlement] Lagna 8th (${lord8_Lagna}): ${s8_L}, 12th (${lord12_Lagna}): ${s12_L}`);
    console.log(`[Foreign Settlement] Rasi 8th (${lord8_Rasi}): ${s8_R}, 12th (${lord12_Rasi}): ${s12_R}`);

    // Sign Nature Check - Moveable signs for displacement
    const moveableSigns = [0, 3, 6, 9]; // Aries, Cancer, Libra, Capricorn
    const waterSigns = [3, 7, 11]; // Cancer, Scorpio, Pisces

    const is8Moveable = moveableSigns.includes(l8);
    const is12Moveable = moveableSigns.includes(l12);
    const is8Water = waterSigns.includes(l8);
    const is12Water = waterSigns.includes(l12);

    let foreignScore = 0;
    let reasons: string[] = [];

    // ============================================================
    // RULE 1: Check planets IN 8th & 12th HOUSES for Subathuvam
    // ============================================================

    // Find planets in 8th house from Lagna
    const planetsIn8L = planets.filter((p: any) => p.signIndex === l8);
    const planetsIn12L = planets.filter((p: any) => p.signIndex === l12);

    // Find planets in 8th house from Rasi (Moon)
    const planetsIn8R = planets.filter((p: any) => p.signIndex === r8);
    const planetsIn12R = planets.filter((p: any) => p.signIndex === r12);

    // Calculate Subathuvam for planets in these houses
    let house8LSubha = false;
    let house12LSubha = false;
    let house8RSubha = false;
    let house12RSubha = false;

    // Check Lagna-based 8th house
    if (planetsIn8L.length > 0) {
        const avgScore8L = planetsIn8L.reduce((sum: number, p: any) => {
            const score = updatedScores[p.name]?.totalScore || subathuvamScores[p.name]?.totalScore || 0;
            return sum + score;
        }, 0) / planetsIn8L.length;
        house8LSubha = avgScore8L > 40;
        console.log(`[Foreign] 8th House (Lagna) planets: ${planetsIn8L.map((p: any) => p.name).join(', ')} - Avg Score: ${avgScore8L.toFixed(0)}`);
    }

    // Check Lagna-based 12th house  
    if (planetsIn12L.length > 0) {
        const avgScore12L = planetsIn12L.reduce((sum: number, p: any) => {
            const score = updatedScores[p.name]?.totalScore || subathuvamScores[p.name]?.totalScore || 0;
            return sum + score;
        }, 0) / planetsIn12L.length;
        house12LSubha = avgScore12L > 40;
        console.log(`[Foreign] 12th House (Lagna) planets: ${planetsIn12L.map((p: any) => p.name).join(', ')} - Avg Score: ${avgScore12L.toFixed(0)}`);
    }

    // Check Rasi-based houses
    if (planetsIn8R.length > 0) {
        const avgScore8R = planetsIn8R.reduce((sum: number, p: any) => {
            const score = updatedScores[p.name]?.totalScore || subathuvamScores[p.name]?.totalScore || 0;
            return sum + score;
        }, 0) / planetsIn8R.length;
        house8RSubha = avgScore8R > 40;
        console.log(`[Foreign] 8th House (Rasi) planets: ${planetsIn8R.map((p: any) => p.name).join(', ')} - Avg Score: ${avgScore8R.toFixed(0)}`);
    }

    if (planetsIn12R.length > 0) {
        const avgScore12R = planetsIn12R.reduce((sum: number, p: any) => {
            const score = updatedScores[p.name]?.totalScore || subathuvamScores[p.name]?.totalScore || 0;
            return sum + score;
        }, 0) / planetsIn12R.length;
        house12RSubha = avgScore12R > 40;
        console.log(`[Foreign] 12th House (Rasi) planets: ${planetsIn12R.map((p: any) => p.name).join(', ')} - Avg Score: ${avgScore12R.toFixed(0)}`);
    }

    const hasLagnaHouseYoga = house8LSubha && house12LSubha;
    const hasRasiHouseYoga = house8RSubha && house12RSubha;

    console.log(`[Foreign] Lagna House Yoga: ${hasLagnaHouseYoga}, Rasi House Yoga: ${hasRasiHouseYoga}`);

    // If NEITHER Lagna NOR Rasi house yoga exists, unlikely
    if (!hasLagnaHouseYoga && !hasRasiHouseYoga) {
        return {
            question,
            answer: isTamil
                ? "வெளிநாட்டு செட்டில்மென்ட் சாத்தியம் குறைவு."
                : "Foreign settlement is unlikely.",
            reason: isTamil
                ? `8 & 12 வீடுகளில் உள்ள கிரகங்கள் சுபத்துவமாக இல்லை.\n- 8ம் வீடு (லக்னம்): ${planetsIn8L.length > 0 ? planetsIn8L.map((p: any) => p.name).join(', ') : 'வெற்று'}\n- 12ம் வீடு (லக்னம்): ${planetsIn12L.length > 0 ? planetsIn12L.map((p: any) => p.name).join(', ') : 'வெற்று'}`
                : `Planets in 8th & 12th houses are not Subathuvam.\n- 8th House (Lagna): ${planetsIn8L.length > 0 ? planetsIn8L.map((p: any) => p.name).join(', ') : 'Empty'}\n- 12th House (Lagna): ${planetsIn12L.length > 0 ? planetsIn12L.map((p: any) => p.name).join(', ') : 'Empty'}`,
            isFavorable: false
        };
    }

    foreignScore += 40;
    if (hasLagnaHouseYoga) {
        reasons.push(isTamil
            ? `✅ 8 & 12 வீடுகளில் (லக்னம்) சுபத்துவ கிரகங்கள் உள்ளன`
            : `✅ 8th & 12th Houses (Lagna) have Subha planets`);
    }
    if (hasRasiHouseYoga) {
        foreignScore += 20;
        reasons.push(isTamil
            ? `✅ 8 & 12 வீடுகளில் (ராசி) சுபத்துவ கிரகங்கள் உள்ளன`
            : `✅ 8th & 12th Houses (Rasi) have Subha planets`);
    }

    // ============================================================
    // RULE 2: 8th & 12th LORDS MUST be Connected
    // ============================================================
    const lord8Planet_L = getP(lord8_Lagna);
    const lord12Planet_L = getP(lord12_Lagna);

    let has812Connection = false;
    let connectionType = "";

    if (lord8Planet_L && lord12Planet_L) {
        // Same sign (Conjunction)
        if (lord8Planet_L.signIndex === lord12Planet_L.signIndex) {
            has812Connection = true;
            connectionType = isTamil ? "இணைப்பு" : "Conjunction";
        }
        // Mutual aspect (7th from each other = opposition)
        else if (Math.abs(lord8Planet_L.signIndex - lord12Planet_L.signIndex) === 6 ||
            Math.abs(lord8Planet_L.signIndex - lord12Planet_L.signIndex) === 6) {
            has812Connection = true;
            connectionType = isTamil ? "எதிர் பார்வை" : "Opposition";
        }
        // Same planet rules both
        else if (lord8_Lagna === lord12_Lagna) {
            has812Connection = true;
            connectionType = isTamil ? "ஒரே கிரகம்" : "Same Lord";
        }
        // NEW: 8th Lord in 12th House OR 12th Lord in 8th House (Placement/Exchange)
        else if (lord8Planet_L.signIndex === l12) {
            has812Connection = true;
            connectionType = isTamil ? "8ம் அதிபதி 12ல்" : "8th Lord in 12th";
        }
        else if (lord12Planet_L.signIndex === l8) {
            has812Connection = true;
            connectionType = isTamil ? "12ம் அதிபதி 8ல்" : "12th Lord in 8th";
        }
    }

    console.log(`[Foreign] 8-12 Lord Connection: ${has812Connection} (${connectionType})`);

    // MANDATORY: If lords not connected, STOP
    if (!has812Connection) {
        return {
            question,
            answer: isTamil
                ? "வெளிநாட்டு செட்டில்மென்ட் இல்லை. 8 & 12 அதிபதிகள் தொடர்பில் இல்லை."
                : "No foreign settlement. 8th & 12th Lords are NOT connected.",
            reason: isTamil
                ? `8 & 12 வீடுகளில் சுபத்துவம் உள்ளது, ஆனால் அதிபதிகள் (${lord8_Lagna}, ${lord12_Lagna}) தொடர்பில் இல்லை.\n${reasons.join('\n')}`
                : `8 & 12 houses have Subathuvam, but lords (${lord8_Lagna}, ${lord12_Lagna}) are NOT connected.\n${reasons.join('\n')}`,
            isFavorable: false
        };
    }

    foreignScore += 30;
    reasons.push(isTamil
        ? `✅ 8 & 12 அதிபதிகள் தொடர்பில் உள்ளனர்: ${connectionType} (${lord8_Lagna}-${lord12_Lagna})`
        : `✅ 8th & 12th Lords connected: ${connectionType} (${lord8_Lagna}-${lord12_Lagna})`);

    // ============================================================
    // RULE 3: Dasa Analysis for 100% Confirmation
    // ============================================================
    let is100Percent = false;
    let dasaReasons: string[] = [];

    if (currentDasa && currentDasa.maha?.planet) {
        const dasaLord = currentDasa.maha.planet;
        // Logic continues...

        const bhuktiLord = currentDasa.bhukti?.planet;

        // Check if Dasa Lord is 8th or 12th Lord
        const isDasa8or12 = (dasaLord === lord8_Lagna || dasaLord === lord12_Lagna);
        const isBhukti8or12 = bhuktiLord ? (bhuktiLord === lord8_Lagna || bhuktiLord === lord12_Lagna) : false;

        // Check if Dasa is Rahu or Ketu
        const isDasaRahuKetu = ['Rahu', 'Ketu'].includes(dasaLord);
        const isBhuktiRahuKetu = bhuktiLord ? ['Rahu', 'Ketu'].includes(bhuktiLord) : false;

        // Check if Dasa Lord is in moveable sign
        const dasaPlanet = getP(dasaLord);
        const moveableSigns = [0, 3, 6, 9]; // Aries, Cancer, Libra, Capricorn
        const isDasaMoveable = dasaPlanet ? moveableSigns.includes(dasaPlanet.signIndex) : false;

        console.log(`[Foreign] Dasa Check:`, {
            dasaLord,
            bhuktiLord,
            isDasa8or12,
            isDasaRahuKetu,
            isDasaMoveable
        });

        if (isDasa8or12 || isBhukti8or12) {
            is100Percent = true;
            foreignScore = 100;
            dasaReasons.push(isTamil
                ? `🎯 ${isDasa8or12 ? dasaLord : bhuktiLord} தசை/புக்தி (8/12 அதிபதி)`
                : `🎯 ${isDasa8or12 ? dasaLord : bhuktiLord} Dasa/Bhukti (8/12 Lord)`);
        }
        else if (isDasaRahuKetu || isBhuktiRahuKetu) {
            is100Percent = true;
            foreignScore = 100;
            dasaReasons.push(isTamil
                ? `🎯 ${isDasaRahuKetu ? dasaLord : bhuktiLord} தசை/புக்தி (வெளிநாட்டு காரகன்)`
                : `🎯 ${isDasaRahuKetu ? dasaLord : bhuktiLord} Dasa/Bhukti (Foreign Karaka)`);
        }
        else if (isDasaMoveable) {
            is100Percent = true;
            foreignScore = 100;
            const signNames = ['மேஷம்', 'கடகம்', 'துலாம்', 'மகரம்'];
            dasaReasons.push(isTamil
                ? `🎯 ${dasaLord} சர ராசியில் உள்ளார் (இடப்பெயர்ச்சி)`
                : `🎯 ${dasaLord} in Moveable Sign (Displacement)`);
        }
    }

    // Additional factors (only if basic yoga exists)
    const rahu = getP('Rahu');
    if (rahu && ([l8, l12].includes(rahu.signIndex))) {
        foreignScore += 10;
        reasons.push(isTamil
            ? "ராகு 8/12 வீட்டில் உள்ளார்"
            : "Rahu in 8th/12th House");
    }

    // Final Verdict
    let answer = "";
    let isFavorable = true;

    if (is100Percent) {
        answer = isTamil
            ? "🎯 **100% நிச்சயம் - வெளிநாட்டு செட்டில்மென்ட்!**"
            : "🎯 **100% CERTAIN - Foreign Settlement!**";
        reasons.push(...dasaReasons);
    }
    else if (foreignScore >= 70) {
        answer = isTamil
            ? "✅ **மிக அதிக வாய்ப்பு** - நிரந்தர செட்டில்மென்ட் சாத்தியம்"
            : "✅ **Very High Chance** - Permanent Settlement Possible";
    }
    else {
        answer = isTamil
            ? "⚡ **நல்ல வாய்ப்பு** - நீண்ட கால வேலை/தங்கும் வாய்ப்பு"
            : "⚡ **Good Chance** - Long term work/stay opportunity";
    }

    const reasonText = reasons.join('\n- ');
    return {
        question,
        answer,
        reason: isTamil
            ? `**மதிப்பெண்:** ${foreignScore}/100\n\n**காரணங்கள்:**\n- ${reasonText}`
            : `**Score:** ${foreignScore}/100\n\n**Reasons:**\n- ${reasonText}`,
        isFavorable
    };
};

// 6. Predict Current Love Status
export const predictCurrentLoveStatus = (
    planets: any[],
    ascendantSign: number,
    moonSign: number,
    currentDasa: { maha: DashaPeriod, bhukti?: DashaPeriod },
    agScores: Record<string, SubathuvamResult>,
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "நான் இப்போது காதலில் உள்ளேனா?" : "Am I currently in love / Is love favorable?";

    // --- Part 1: Birth Chart Analysis (Love Potential) ---
    let chartScore = 0;
    const house5Sign = (ascendantSign + 4) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house9Sign = (ascendantSign + 8) % 12;

    const lord5 = SIGN_LORDS[house5Sign];
    const lord7 = SIGN_LORDS[house7Sign];
    const lord9 = SIGN_LORDS[house9Sign];

    const pVenus = getPlanetPosition(planets, 'Venus');
    const pMars = getPlanetPosition(planets, 'Mars');
    const p5Lord = getPlanetPosition(planets, lord5);
    const p7Lord = getPlanetPosition(planets, lord7);
    const p9Lord = getPlanetPosition(planets, lord9);
    const pJupiter = getPlanetPosition(planets, 'Jupiter');
    const pRahu = getPlanetPosition(planets, 'Rahu');
    const pKetu = getPlanetPosition(planets, 'Ketu');

    // 1. 5th-7th Lord Connection
    let has5_7_Connection = false;
    if (p5Lord && p7Lord) {
        // Conjunction
        if (p5Lord.signIndex === p7Lord.signIndex) has5_7_Connection = true;
        // Exchange (Parivartana)
        if (p5Lord.signIndex === house7Sign && p7Lord.signIndex === house5Sign) has5_7_Connection = true;
        // Mutual Aspect (7th aspect)
        if (Math.abs(p5Lord.signIndex - p7Lord.signIndex) === 6) has5_7_Connection = true;
    }
    if (has5_7_Connection) chartScore += 2; // Weight: 2 (Primary)

    // 2. Venus Strength (Check Subathuvam)
    if (agScores['Venus'] && agScores['Venus'].totalScore >= 50) chartScore += 1;

    // 3. Venus-Mars Connection (Passion)
    if (pVenus && pMars) {
        if (pVenus.signIndex === pMars.signIndex || Math.abs(pVenus.signIndex - pMars.signIndex) === 6) {
            chartScore += 1;
        }
    }

    // 4. Rahu/Ketu Influence (Unconventional)
    // Rahu in 5th or 7th?
    if (pRahu && (pRahu.signIndex === house5Sign || pRahu.signIndex === house7Sign)) chartScore += 1;

    // 5. Jupiter Aspect on 7th House (Legitimacy)
    // Jupiter aspects 5, 7, 9 positions from itself
    if (pJupiter) {
        const jupiterAspects = [
            (pJupiter.signIndex + 4) % 12, // 5th aspect
            (pJupiter.signIndex + 6) % 12, // 7th aspect
            (pJupiter.signIndex + 8) % 12  // 9th aspect
        ];
        if (jupiterAspects.includes(house7Sign)) chartScore += 1;
    }

    // 6. 9th House Connection (Parental Approval usually aids serious love)
    // If 9th Lord connects with 5th or 7th
    if (p9Lord && (p9Lord.signIndex === house5Sign || p9Lord.signIndex === house7Sign)) chartScore += 1;


    // --- Part 2: Dasa Bhukti Analysis (Current Status) ---
    let dasaScore = 0;
    const mahaPlanet = currentDasa?.maha?.planet;
    const bukthiLord = currentDasa?.bhukti?.planet;

    if (!mahaPlanet) return { question: "Love Status?", answer: "Data Missing", reason: "", isFavorable: false };
    const bhuktiPlanet = currentDasa.bhukti?.planet || "";

    const lovePlanets = ['Venus', 'Mars', 'Rahu', 'Moon', 'Mercury'];

    // 1. Is Maha Dasa a love planet?
    if (lovePlanets.includes(mahaPlanet)) dasaScore += 1;
    if (mahaPlanet === 'Venus') dasaScore += 1; // Bonus for Venus

    // 2. Is Bhukti a love planet?
    if (lovePlanets.includes(bhuktiPlanet)) dasaScore += 2; // Bhukti is more active now
    if (bhuktiPlanet === 'Venus') dasaScore += 1;

    // 3. Is Dasa/Bhukti planet the 5th or 7thLord?
    if (mahaPlanet === lord5 || mahaPlanet === lord7) dasaScore += 2;
    if (bhuktiPlanet === lord5 || bhuktiPlanet === lord7) dasaScore += 2;

    // --- Final Determination ---
    // Decision Tree logic
    let answer = "";
    let reason = "";
    let isFavorable = false;

    // Thresholds
    const isChartStrong = chartScore >= 3;
    const isDasaActive = dasaScore >= 3;

    if (isChartStrong && isDasaActive) {
        answer = isTamil
            ? "ஆம்! தற்போது நீங்கள் காதலில் இருக்கவோ அல்லது காதல் வயப்படவோ அதிக வாய்ப்புள்ளது. (சாதகமான தசை/புத்தி)."
            : "YES! High probability you are currently in love or will fall in love soon. (Favorable Dasa/Bhukti).";
        isFavorable = true;
    } else if (isChartStrong && !isDasaActive) {
        answer = isTamil
            ? "காதல் வாய்ப்பு ஜாதகத்தில் உள்ளது, ஆனால் தற்போது காலம் முழுமையாக கனியவில்லை. ( காத்திருங்கள்)."
            : "Love potential exists in chart, but current timing is not fully active. (Waiting phase).";
        isFavorable = false;
    } else if (!isChartStrong && isDasaActive) {
        answer = isTamil
            ? "தற்காலிகமான ஈர்ப்பு ஏற்படலாம். ஆனால் ஆழமான காதலாக மாறுவது கடினம்."
            : "Temporary attraction is possible. But difficult to turn into deep, lasting love.";
        isFavorable = false;
    } else {
        answer = isTamil
            ? "தற்போது காதலில் ஈடுபாடு குறைவு. கவனம் வேறு திசையில் இருக்கலாம்."
            : "Currently prediction shows low interest in love. Focus might be on Career/Family.";
        isFavorable = false;
    }

    if (isTamil) {
        reason = `விதி: ஜாதகத்தில் 5-7 தொடர்பு + தற்போதைய தசை/புத்தி ஆதரவு.\n` +
            `- ஜாதக வலிமை: ${chartScore >= 3 ? "வலுவானது" : "சராசரி"} (${chartScore}/7)\n` +
            `- தசை நிலை: ${isDasaActive ? "சாதகம்" : "சாதகமில்லை"} (தசை: ${mahaPlanet}, புத்தி: ${bhuktiPlanet})`;
    } else {
        reason = `Rule: 5th-7th Connection in Chart + Favorable Dasa/Bhukti.\n` +
            `- Chart Strength: ${chartScore >= 3 ? "Strong" : "Average"} (${chartScore}/7 Indicators)\n` +
            `- Dasa Status: ${isDasaActive ? "Active" : "Inactive"} (Running ${mahaPlanet} Dasa, ${bhuktiPlanet} Bhukti)`;
    }

    return {
        question,
        answer,
        reason,
        isFavorable
    };
};

// 7. Marriage Status Prediction (The Marriage Triangle 3-7-11)
export const predictMarriageStatus = (
    planets: any[],
    ascendantSign: number,
    currentDasa: { maha: DashaPeriod, bhukti?: DashaPeriod },
    birthDate: Date,
    language: 'en' | 'ta' = 'en'
): { isMarried: boolean, confidence: number, statusText: string, reason: string } => {
    const isTamil = language === 'ta';

    // --- Step 1: Birth Chart Analysis (3-7-11 Connections) ---
    const house3Sign = (ascendantSign + 2) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house11Sign = (ascendantSign + 10) % 12;

    const lord3 = SIGN_LORDS[house3Sign];
    const lord7 = SIGN_LORDS[house7Sign];
    const lord11 = SIGN_LORDS[house11Sign];

    const getPlanet = (name: string) => planets.find(p => p.name === name);
    const planet3 = getPlanet(lord3);
    const planet7 = getPlanet(lord7);
    const planet11 = getPlanet(lord11);

    const checkConnection = (p1: any, p2: any) => {
        if (!p1 || !p2) return false;
        // Conjunction
        if (p1.signIndex === p2.signIndex) return true;
        // Opposition (Mutual Aspect)
        if (Math.abs(p1.signIndex - p2.signIndex) === 6) return true;

        return false;
    };

    const isConnected3_7 = checkConnection(planet3, planet7);
    const isConnected7_11 = checkConnection(planet7, planet11);
    const isConnected3_11 = checkConnection(planet3, planet11);

    // Calculate Birth Chart Score
    let birthScore = 0;

    // Q1: 3-7-11 Connection
    if (isConnected3_7 || isConnected7_11 || isConnected3_11) birthScore += 30;

    // Q2: Planets in 7th House
    const planetsIn7 = planets.filter(p => p.signIndex === house7Sign);
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Saturn', 'Mars', 'Sun'];

    if (planetsIn7.length === 0) {
        birthScore += 15; // Empty is neutral/ok
    } else {
        const hasBenefic = planetsIn7.some(p => benefics.includes(p.name));
        const hasMalefic = planetsIn7.some(p => malefics.includes(p.name));
        const hasNode = planetsIn7.some(p => ['Rahu', 'Ketu'].includes(p.name));

        if (hasBenefic) birthScore += 20;
        else if (hasMalefic) birthScore += 10;
        else if (hasNode) birthScore += 5;
    }

    // Q3: 7th Lord Position
    const getHouseNumber = (planetSign: number, ascendantSign: number): number => {
        return (planetSign - ascendantSign + 12) % 12 + 1;
    };

    if (planet7) {
        const h7Pos = getHouseNumber(planet7.signIndex, ascendantSign);
        if ([1, 4, 7, 10, 5, 9].includes(h7Pos)) birthScore += 25;
        if (h7Pos === 11) birthScore += 30; // Excellent
        if (h7Pos === 3) birthScore += 25; // Good
        if ([6, 8, 12].includes(h7Pos)) birthScore += 5; // Difficult
    }

    // Q4: Venus Strength (Simple check: Exalted/Own)
    const venus = getPlanet('Venus');
    if (venus) {
        if (venus.signIndex === 11) birthScore += 20; // Pisces (Exalted)
        if ([1, 6].includes(venus.signIndex)) birthScore += 15; // Taurus/Libra (Own)
        if (venus.signIndex === 5) birthScore += 5; // Virgo (Debilitated)
    }

    // Q5: Jupiter Aspect on 7th
    const jupiter = getPlanet('Jupiter');
    // Using simple aspect check logic internal here relying on inputs/constants isn't ideal but we can re-impl simple check or reuse if exported (it's not).
    // Let's implement simple check:
    const isAspectingLocal = (source: number, target: number, aspects: number[]) => {
        const dist = (target - source + 12) % 12 + 1;
        return aspects.includes(dist);
    };

    if (jupiter) {
        const aspect7 = isAspectingLocal(jupiter.signIndex, house7Sign, [1, 5, 7, 9]);
        if (aspect7) birthScore += 20;
    }

    // Cap Birth Score at 100
    birthScore = Math.min(100, birthScore);

    // --- Step 2: Dasa Score ---
    let dasaScore = 0;
    const dasaLord = currentDasa?.maha?.planet;
    if (!dasaLord) return { isMarried: false, confidence: 0, statusText: "Data Missing", reason: "" };
    const bhuktiLord = currentDasa.bhukti?.planet;

    // Q1: Maha Dasa Planet
    if (dasaLord === lord7) dasaScore += 40;
    else if (dasaLord === 'Venus' || dasaLord === 'Jupiter') dasaScore += 30;
    else if (dasaLord === lord11) dasaScore += 25;
    else if (dasaLord === lord3) dasaScore += 20;

    // Q2: Bhukti Planet
    if (bhuktiLord === lord7) dasaScore += 30;
    else if (bhuktiLord === 'Venus') dasaScore += 25;
    else if (bhuktiLord === 'Jupiter' || bhuktiLord === lord11) dasaScore += 20;
    else if (bhuktiLord === lord3) dasaScore += 15;

    // Q3: Dasa-Bhukti Combo
    // Both are 3-7-11 lords?
    const isDasa3711 = [lord3, lord7, lord11].includes(dasaLord);
    const isBhukti3711 = bhuktiLord && [lord3, lord7, lord11].includes(bhuktiLord);

    if (isDasa3711 && isBhukti3711) dasaScore += 40;
    else if (dasaLord === lord7 || bhuktiLord === lord7) dasaScore += 20;
    else if ((dasaLord === 'Venus' && bhuktiLord === 'Jupiter') || (dasaLord === 'Jupiter' && bhuktiLord === 'Venus')) dasaScore += 25;

    dasaScore = Math.min(100, dasaScore);

    // --- Step 3: Age Factor ---
    const now = new Date();
    // Convert birthDate to Date object if it's not already
    const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const currentAge = now.getFullYear() - birthDateObj.getFullYear();
    let ageModifier = 1.0;

    if (currentAge >= 18 && currentAge <= 23) ageModifier = 0.7;
    else if (currentAge >= 24 && currentAge <= 28) ageModifier = 1.0;
    else if (currentAge >= 29 && currentAge <= 33) ageModifier = 1.2;
    else if (currentAge >= 34 && currentAge <= 40) ageModifier = 1.5;
    else if (currentAge > 40) ageModifier = 2.0;

    // --- Final Calculation ---
    const rawTotal = (birthScore * 0.4) + (dasaScore * 0.4) + (currentAge * 0.2);
    const finalScore = rawTotal * ageModifier;

    // Using threshold of 65 for "Married"
    let isMarried = false;
    let statusText = "";

    if (finalScore >= 90) {
        isMarried = true;
        statusText = isTamil ? "திருமணமாகிவிட்டது (95% உறுதி)" : "Likely Married (95% Certainty)";
    } else if (finalScore >= 70) {
        isMarried = true;
        statusText = isTamil ? "மிகவும் வாய்ப்புள்ளது (80% உறுதி)" : "Likely Married (80% Certainty)";
    } else if (finalScore >= 65) {
        isMarried = true;
        statusText = isTamil ? "வாய்ப்புள்ளது (65% உறுதி)" : "Likely Married (65% Certainty)";
    } else {
        isMarried = false;
        statusText = isTamil ? "திருமணமாகவில்லை" : "Likely Single";
    }

    const reason = isTamil
        ? `மதிப்பெண்: ${finalScore.toFixed(0)}/100 (வயது: ${currentAge}, காரணி: x${ageModifier})\n` +
        `ஜாதக பலம்: ${birthScore}/100, தசை பலம்: ${dasaScore}/100`
        : `Score: ${finalScore.toFixed(0)}/100 (Age: ${currentAge}, Modifier: x${ageModifier})\n` +
        `Chart Score: ${birthScore}/100, Dasa Score: ${dasaScore}/100`;

    return { isMarried, confidence: finalScore, statusText, reason };
};

// Helper: Get all future Maha Dasa periods from current age to target age
const getFutureDasaPeriods = (
    birthDate: Date,
    currentAge: number,
    targetAge: number,
    moonLongitude: number
): Array<{ planet: string, startAge: number, endAge: number, durationYears: number }> => {
    const DASHA_YEARS: Record<string, number> = {
        'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10,
        'Mars': 7, 'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17
    };

    const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

    const NAKSHATRA_LORDS = [
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
        'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
    ];

    // Calculate starting Nakshatra
    const nakshatraSpan = 13.333333;
    let nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan);
    if (nakshatraIndex >= 27) nakshatraIndex = 0;
    if (nakshatraIndex < 0) nakshatraIndex = 0;

    const longitudeInNakshatra = moonLongitude % nakshatraSpan;
    const percentagePassed = longitudeInNakshatra / nakshatraSpan;
    const percentageRemaining = 1 - percentagePassed;

    const birthLord = NAKSHATRA_LORDS[nakshatraIndex];
    const birthLordIndexInOrder = DASHA_ORDER.indexOf(birthLord);
    const birthDashaTotalYears = DASHA_YEARS[birthLord];
    const birthDashaBalanceYears = birthDashaTotalYears * percentageRemaining;

    const periods: Array<{ planet: string, startAge: number, endAge: number, durationYears: number }> = [];

    let currentAgePointer = 0;

    // First period (balance)
    let endAge = currentAgePointer + birthDashaBalanceYears;
    if (endAge > currentAge) {
        periods.push({
            planet: birthLord,
            startAge: Math.max(currentAgePointer, currentAge),
            endAge: Math.min(endAge, targetAge),
            durationYears: Math.min(endAge, targetAge) - Math.max(currentAgePointer, currentAge)
        });
    }
    currentAgePointer = endAge;

    // Subsequent periods
    let currentLordIndex = (birthLordIndexInOrder + 1) % 9;
    while (currentAgePointer < targetAge) {
        const planet = DASHA_ORDER[currentLordIndex];
        const duration = DASHA_YEARS[planet];
        endAge = currentAgePointer + duration;

        if (endAge > currentAge) {
            periods.push({
                planet,
                startAge: Math.max(currentAgePointer, currentAge),
                endAge: Math.min(endAge, targetAge),
                durationYears: Math.min(endAge, targetAge) - Math.max(currentAgePointer, currentAge)
            });
        }

        currentAgePointer = endAge;
        currentLordIndex = (currentLordIndex + 1) % 9;

        if (currentAgePointer >= targetAge) break;
    }

    return periods.filter(p => p.durationYears > 0);
};
// 8. Life Quality Analysis (8 Categories - Each 0-100 Points)
export const predictLifeQuality = (
    planets: any[],
    ascendantSign: number,
    moonSign: number,
    currentDasa: { maha: DashaPeriod, bhukti?: DashaPeriod },
    birthDate: Date,
    subathuvamScores: Record<string, SubathuvamResult>,
    language: 'en' | 'ta' = 'en'
): PredictionResult & {
    totalScore: number,
    starRating: number,
    categories: any
} => {
    const isTamil = language === 'ta';
    const question = isTamil ? "வாழ்க்கை எப்படி இருக்கும்?" : "How Will Life Be?";

    if (!currentDasa?.maha?.planet) {
        return {
            question,
            answer: "Dasa Data Missing",
            reason: "",
            isFavorable: false,
            totalScore: 0,
            starRating: 0,
            categories: {}
        };
    }

    // Age check: Skip for people over 60
    const now = new Date();
    const ageMs = now.getTime() - birthDate.getTime();
    const currentAge = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    if (currentAge >= 60) {
        return {
            question,
            answer: isTamil
                ? "உங்கள் வயது 60க்கு மேல் உள்ளதால், இந்த பகுப்பாய்வு கிடைக்கவில்லை."
                : "Life Quality Analysis is not available for age 60+.",
            reason: "",
            isFavorable: true,
            totalScore: 0,
            starRating: 0,
            categories: {}
        };
    }

    // Helpers
    const getP = (name: string) => planets.find(p => p.name === name);
    const getLord = (houseIdx: number) => SIGN_LORDS[(ascendantSign + houseIdx - 1) % 12];
    const getSubathuvam = (planetName: string) => subathuvamScores[planetName]?.totalScore || 0;

    // Helper: Check if planet is in specific house
    const getPlanetHouse = (planetName: string): number => {
        const planet = getP(planetName);
        if (!planet) return -1;
        return ((planet.signIndex - ascendantSign + 12) % 12) + 1;
    };

    // Helper: Jupiter Aspect (Subathuvam)
    const hasJupiterAspect = (planetName: string): boolean => {
        const planet = getP(planetName);
        const jupiter = getP('Jupiter');
        if (!planet || !jupiter) return false;

        let diff = planet.signIndex - jupiter.signIndex;
        if (diff < 0) diff += 12;
        return [4, 6, 8].includes(diff);
    };

    // Helper: Conjunction
    const isConjunct = (p1Name: string, p2Name: string): boolean => {
        const p1 = getP(p1Name);
        const p2 = getP(p2Name);
        return p1 && p2 && p1.signIndex === p2.signIndex;
    };

    // Helper: Combust (Distance from Sun < 10)
    const isCombust = (planetName: string): boolean => {
        const planet = getP(planetName);
        const sun = getP('Sun');
        if (!planet || !sun || planetName === 'Sun' || planetName === 'Rahu' || planetName === 'Ketu') return false;
        let diff = Math.abs(planet.longitude - sun.longitude);
        if (diff > 180) diff = 360 - diff;
        return diff < 10;
    };

    // Helper: Is Malefic
    const isMalefic = (name: string) => ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(name);

    // Helper: Check if Lord (planet) is strong
    const isLordStrong = (lordName: string) => {
        const house = getPlanetHouse(lordName);
        return ![6, 8, 12].includes(house) && !isCombust(lordName);
    };

    // =========================================================================================
    // 1. EDUCATION (கல்வி) - Mercury & 4th House
    // =========================================================================================
    const calculateEducationScore = (): number => {
        let score = 0;

        // STEP 1: Mercury's Strength (Max 50)
        const mercury = getP('Mercury');
        if (mercury) {
            // 1. Mercury Subathuvam (Base Strength) - Max 30
            // Logic: proportional score based on subathuvam percentage
            const mercurySubu = subathuvamScores['Mercury']?.totalScore || 0;
            const subuPoints = Math.round((mercurySubu / 100) * 30);
            score += subuPoints;

            // 2. Mercury-Venus Conjunction (Max 20)
            if (isConjunct('Mercury', 'Venus') && !isCombust('Mercury')) {
                score += 20;
            }
            // Own House (Max 10)
            else if (['Gemini', 'Virgo'].includes(mercury.sign)) score += 10;

            // Maleficence Check
            if (isConjunct('Mercury', 'Saturn') || isConjunct('Mercury', 'Mars')) {
                if (!hasJupiterAspect('Mercury')) score -= 15;
            }
            if (isCombust('Mercury')) score -= 10;
        }

        // STEP 2: 4th House Strength (Max 30)
        const lord4 = getLord(4);
        const lord4House = getPlanetHouse(lord4);
        const planetsIn4 = planets.filter(p => getPlanetHouse(p.name) === 4).map(p => p.name);

        if ([1, 4, 7, 10, 5, 9].includes(lord4House)) score += 15;
        if (planetsIn4.includes('Jupiter') || planetsIn4.includes('Venus')) score += 15;
        if (planetsIn4.includes('Saturn') || planetsIn4.includes('Rahu')) score -= 10;

        // STEP 3: Dasa Check
        const dasaLord = currentDasa?.maha?.planet || '';
        if (dasaLord && (dasaLord === getLord(1) || ['Mercury', 'Jupiter', 'Venus'].includes(dasaLord))) score += 20;
        else if ([getLord(6), getLord(8), getLord(12)].includes(dasaLord)) score -= 10;

        return Math.max(0, Math.min(100, score));
    };

    // =========================================================================================
    // 2. WEALTH (செல்வம்) - Jupiter, 2, 9, 11
    // =========================================================================================
    const calculateWealthScore = (): number => {
        let score = 0;
        const lord2 = getLord(2);
        const lord11 = getLord(11);
        const lord9 = getLord(9);

        // 1. Jupiter Strength (Primary) - Max 30
        const jupSubu = subathuvamScores['Jupiter']?.totalScore || 0;
        const jupPoints = Math.round((jupSubu / 100) * 30);
        score += jupPoints;

        // Bonus for Jupiter in 2nd or Aspecting 2nd (Max 10)
        const jupSign = getP('Jupiter')?.signIndex || 0;
        const h2Sign = (ascendantSign + 1) % 12; // 0-11
        let aspectDiff = h2Sign - jupSign;
        if (aspectDiff < 0) aspectDiff += 12;

        if (getPlanetHouse('Jupiter') === 2) score += 10;
        else if ([4, 6, 8].includes(aspectDiff)) score += 5;

        // Aspect on 11th House
        const h11Sign = (ascendantSign + 10) % 12;
        let diff11 = h11Sign - jupSign;
        if (diff11 < 0) diff11 += 12;
        if ([4, 6, 8].includes(diff11)) score += 10;

        // 2. House Lords (2, 9, 11) - Max 30
        if (getPlanetHouse(lord2) === 11 || getPlanetHouse(lord11) === 2) score += 20; // Parivarthana
        else {
            if (isLordStrong(lord2)) score += 5;
            if (isLordStrong(lord11)) score += 5;
        }

        if (isLordStrong(lord9)) score += 10;

        // 3. Lagna Link - Max 20
        const lagnaLord = getLord(1);
        if (isConjunct(lagnaLord, lord2) || isConjunct(lagnaLord, lord11) || isConjunct(lagnaLord, lord9)) score += 20;

        // 4. Special Yoga
        const rahuHouse = getPlanetHouse('Rahu');
        if ((rahuHouse === 2 || rahuHouse === 11) && hasJupiterAspect('Rahu')) score += 20;

        // Penalty
        if (isCombust(lord2) || [6, 8, 12].includes(getPlanetHouse(lord2))) score -= 10;

        return Math.max(0, Math.min(100, score));
    };

    // =========================================================================================
    // 3. CAREER (தொழில்) - Saturn, 10th
    // =========================================================================================
    const calculateCareerScore = (): number => {
        let score = 0;

        // 1. Saturn Strength (Primary) - Max 30
        const saturnSubu = subathuvamScores['Saturn']?.totalScore || 0;
        const saturnPoints = Math.round((saturnSubu / 100) * 30);
        score += saturnPoints;

        // Bonus if Saturn is NOT conjunct Nodes/Mars (Max 10)
        if (!isConjunct('Saturn', 'Rahu') && !isConjunct('Saturn', 'Ketu') && !isConjunct('Saturn', 'Mars')) {
            score += 10;
        }

        // 2. 10th House - Max 30
        const planetsIn10 = planets.filter(p => getPlanetHouse(p.name) === 10).map(p => p.name);
        if (planetsIn10.includes('Sun') || planetsIn10.includes('Mars')) score += 20; // Digbala

        const lord10 = getLord(10);
        if (isLordStrong(lord10)) score += 10;

        // 3. Rahu in 10th
        if (planetsIn10.includes('Rahu') && (hasJupiterAspect('Rahu') || hasJupiterAspect('Venus'))) score += 20;

        // 4. Dasa Check
        const dasaLord = currentDasa?.maha?.planet || '';
        if (dasaLord && (dasaLord === lord10 || dasaLord === 'Saturn')) score += 10;

        return Math.max(0, Math.min(100, score));
    };

    // =========================================================================================
    // 4. MARRIAGE (திருமணம்) - Venus, 7th
    // =========================================================================================
    const calculateMarriageScore = (): number => {
        let score = 0;

        // 1. Venus Strength (Primary) - Max 30
        const venusSubu = subathuvamScores['Venus']?.totalScore || 0;
        const venusPoints = Math.round((venusSubu / 100) * 30);
        score += venusPoints;

        // Bonus if Venus is Isolated from Malefics (Max 10)
        if (!isConjunct('Venus', 'Sun') && !isConjunct('Venus', 'Mars') && !isConjunct('Venus', 'Saturn') && !isConjunct('Venus', 'Rahu') && !isConjunct('Venus', 'Ketu')) {
            score += 10;
        }

        // 2. 7th House - Max 30
        const planetsIn7 = planets.filter(p => getPlanetHouse(p.name) === 7).map(p => p.name);
        if (planetsIn7.length === 0) score += 20; // Clean slate
        else if (planetsIn7.includes('Jupiter') || planetsIn7.includes('Venus') || planetsIn7.includes('Moon') || planetsIn7.includes('Mercury')) score += 15;
        else if (planetsIn7.some(p => isMalefic(p))) score -= 15;

        // 3. 2nd & 8th House
        const planetsIn2 = planets.filter(p => getPlanetHouse(p.name) === 2);
        const planetsIn8 = planets.filter(p => getPlanetHouse(p.name) === 8);
        if (planetsIn2.some(p => isMalefic(p.name)) || planetsIn8.some(p => isMalefic(p.name))) score -= 10;

        // 7th Lord Strength
        if (getSubathuvam(getLord(7)) > 40) score += 15;

        return Math.max(0, Math.min(100, score));
    };

    // =========================================================================================
    // 5. HEALTH (ஆரோக்கியம்) - Lagna Lord, 6th Lord
    // =========================================================================================
    const calculateHealthScore = (): number => {
        let score = 0;
        const lord1 = getLord(1);
        const lord6 = getLord(6);

        // 1. Lagnadipathi (Immunity) - Max 40
        const h1LordHouse = getPlanetHouse(lord1);
        if ([1, 4, 7, 10, 5, 9].includes(h1LordHouse)) score += 20;
        if (hasJupiterAspect(lord1)) score += 20;

        // Penalty
        if ([6, 8, 12].includes(h1LordHouse)) {
            if (hasJupiterAspect(lord1)) score -= 5;
            else score -= 20;
        }
        if (isCombust(lord1)) score -= 15;

        // 2. 6th Lord (Disease) - Max 30
        if (hasJupiterAspect(lord6) || hasJupiterAspect('Venus')) score += 20; // Benign
        if (isConjunct(lord6, 'Saturn') || isConjunct(lord6, 'Mars') || isConjunct(lord6, 'Rahu')) score -= 20; // Severe

        // 3. Lagna Bhava - Max 20
        const planetsIn1 = planets.filter(p => getPlanetHouse(p.name) === 1).map(p => p.name);
        if (planetsIn1.includes('Rahu') || planetsIn1.includes('Ketu')) score -= 10;
        if (planetsIn1.includes('Jupiter') || planetsIn1.includes('Venus')) score += 20;

        // Saturn Aspect on Lagna
        const saturnSign = getP('Saturn')?.signIndex || 0;
        let aspectDiff = (ascendantSign - saturnSign + 12) % 12;
        if ([2, 6, 9].includes(aspectDiff)) score -= 10; // 3rd, 7th, 10th aspect

        // 4. Karaka (Sun/Saturn)
        if (getSubathuvam('Saturn') > 40) score += 5;
        if (getSubathuvam('Sun') > 40) score += 5;

        return Math.max(0, Math.min(100, score));
    };

    // Calculate Scores
    const education = calculateEducationScore();
    const wealth = calculateWealthScore();
    const career = calculateCareerScore();
    const marriage = calculateMarriageScore();
    const health = calculateHealthScore();

    // Preserve others with basic placeholders or simpler logic
    const family = Math.round((wealth + marriage) / 2); // Approximation
    const property = Math.round((wealth + career) / 2); // Approximation
    const happiness = Math.round((health + family) / 2); // Approximation

    const totalScore = Math.round((education + wealth + career + marriage + health + family + property + happiness) / 8);

    let starRating = 0;
    if (totalScore >= 80) starRating = 5;
    else if (totalScore >= 60) starRating = 4;
    else if (totalScore >= 40) starRating = 3;
    else starRating = 2;

    let verdict = "";
    if (totalScore >= 80) verdict = isTamil ? "மிகச் சிறப்பு (Excellent)" : "Excellent";
    else if (totalScore >= 60) verdict = isTamil ? "நன்று (Good)" : "Good";
    else if (totalScore >= 40) verdict = isTamil ? "பரவாயில்லை (Average)" : "Average";
    else verdict = isTamil ? "கடினம் (Challenging)" : "Challenging";

    // Categories
    const categories = {
        education, wealth, career, marriage, health, family, property, happiness
    };

    const answer = isTamil
        ? `உங்கள் ஒட்டுமொத்த வாழ்க்கை மதிப்பீடு: **${totalScore}/100**\n\n**தரமதிப்பீடு:** ${verdict}\n\n5 முக்கிய பிரிவுகளில் (கல்வி, செல்வம், தொழில், திருமணம், ஆரோக்கியம்) புதிய விதிமுறைகளின்படி விரிவான ஆய்வு செய்யப்பட்டுள்ளது.`
        : `Your Overall Life Quality Score: **${totalScore}/100**\n\n**Rating:** ${verdict}\n\nDetailed analysis across 5 key categories based on strict Guruji rules.`;

    const buildDetail = (name: string, score: number) => {
        let comment = "";
        if (score > 80) comment = "🌟";
        else if (score > 60) comment = "✅";
        else if (score > 40) comment = "⚠️";
        else comment = "❌";
        return `${comment} ${name}: **${score}/100**`;
    };

    const reason = isTamil
        ? `**மதிப்பெண் விவரம் (புதிய விதிகள்):**\n\n` +
        `${buildDetail('🎓 கல்வி (Education)', education)}\n` +
        `${buildDetail('💰 செல்வம் (Wealth)', wealth)}\n` +
        `${buildDetail('💼 தொழில் (Career)', career)}\n` +
        `${buildDetail('❤️ திருமணம் (Marriage)', marriage)}\n` +
        `${buildDetail('🏥 ஆரோக்கியம் (Health)', health)}\n`
        : `**Score Breakdown (New Guruji Rules):**\n\n` +
        `${buildDetail('🎓 Education', education)}\n` +
        `${buildDetail('💰 Wealth', wealth)}\n` +
        `${buildDetail('💼 Career', career)}\n` +
        `${buildDetail('❤️ Marriage', marriage)}\n` +
        `${buildDetail('🏥 Health', health)}\n`;

    return {
        question,
        answer,
        reason,
        isFavorable: totalScore > 45,
        totalScore,
        starRating,
        categories
    };
};
