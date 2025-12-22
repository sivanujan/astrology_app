import { DashaPeriod, calculatePlanetaryPositions } from './astrology';
import { SubathuvamResult } from './adityaGurujiSubathuvam';
import { OWN_SIGNS, SIGN_LORDS } from './constants';

// --- Types ---

export interface PredictionResult {
    question: string;
    answer: string;
    reason: string;
    isFavorable: boolean;
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

    const dasaLord = currentDasa.maha.planet;
    const bukthiLord = currentDasa.bhukti?.planet;

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

    const dasaLordName = currentDasa.maha.planet;
    const bukthiLordName = currentDasa.bhukti?.planet;

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

    if (currentDasa) {
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
    reason += `\n\n[DEBUG: Dasa=${currentDasa?.maha.planet}, L6=${lord6}, L8=${lord8}, Dom=${dominantPlanet}, Cands=${uniqueCandidates.map(c => c.name).join(',')}]`;

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
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "எனக்கு எப்போது திருமணம் நடக்கும்?" : "When will I get married?";

    // --- Step A: Identify Key Planets (The Triangle 3-7-11) ---
    const house2Sign = (ascendantSign + 1) % 12;
    const house3Sign = (ascendantSign + 2) % 12; // Initiative
    const house7Sign = (ascendantSign + 6) % 12; // Marriage
    const house8Sign = (ascendantSign + 7) % 12; // Added House 8
    const house11Sign = (ascendantSign + 10) % 12; // Fulfillment

    const lord2 = SIGN_LORDS[house2Sign];
    const lord3 = SIGN_LORDS[house3Sign];
    const lord7 = SIGN_LORDS[house7Sign];
    const lord11 = SIGN_LORDS[house11Sign];
    const venus = 'Venus';
    const jupiter = 'Jupiter';

    const rahu = getPlanetPosition(planets, 'Rahu');
    const ketu = getPlanetPosition(planets, 'Ketu');
    // Key Planets for Marriage
    // Added Lord 3 (Initiative) and Lord 11 (Fulfillment) as Primary Indicators
    const keyPlanets = [lord7, lord11, lord3, venus, jupiter, lord2];

    if (rahu && [house2Sign, house7Sign, house8Sign].includes(rahu.signIndex)) keyPlanets.push('Rahu');
    if (ketu && [house2Sign, house7Sign, house8Sign].includes(ketu.signIndex)) keyPlanets.push('Ketu');

    const isKeyPlanet = (planetName: string) => keyPlanets.includes(planetName);

    // --- Precision Engine Execution ---
    const now = new Date();
    // Convert birthDate to Date object if it's not already
    const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
    const currentAge = now.getFullYear() - birthDateObj.getFullYear();
    const age21Date = new Date(birthDateObj.getFullYear() + 21, birthDateObj.getMonth(), birthDateObj.getDate());

    const pastFavorableYears = new Set<number>();
    const futureFavorableYears = new Set<number>();
    const pastDetails: string[] = [];
    const futureDetails: string[] = [];

    // Store ALL potential periods
    if (allDashaPeriods.length > 0) {
        for (const maha of allDashaPeriods) {
            // Skip periods completely before Age 21
            if (maha.endDate < age21Date) continue;

            if (maha.subPeriods) {
                for (const bhukti of maha.subPeriods) {
                    if (bhukti.endDate < age21Date) continue;

                    // Age Check
                    const bhuktiMidDate = new Date((bhukti.startDate.getTime() + bhukti.endDate.getTime()) / 2);
                    const ageAtBhukti = bhuktiMidDate.getFullYear() - birthDateObj.getFullYear();
                    // Double check age
                    if (ageAtBhukti < 21) continue;

                    // Step 1: Check if Bhukti Lord is connected to 3, 7, 11 OR is Venus/Jupiter
                    // Connection Types:
                    // 1. Is the Lord itself (e.g., Running 7th Lord Bhukti)
                    // 2. Is in the House (e.g., Planet in 7th)
                    // 3. Conjoined with Lord (e.g., With 7th Lord) - (Simplification: using sign index from planet list if available, else strict name match)

                    // We primarily check Name Match first as established in KeyPlanets
                    if (isKeyPlanet(bhukti.planet)) {

                        // Step 2: Jupiter Filter (Year Check)
                        const jupiterWindows = getJupiterFavorablePeriods(
                            bhukti.startDate,
                            bhukti.endDate,
                            ascendantSign,
                            moonSign,
                            house7Sign
                        );

                        if (jupiterWindows.length > 0) {
                            for (const jWindow of jupiterWindows) {
                                const year = jWindow.start.getFullYear();
                                const isPast = jWindow.end < now;

                                // Step 3: Sun Filter (Month Check) within valid Jupiter window
                                const sunWindows = getSunFavorablePeriods(
                                    jWindow.start,
                                    jWindow.end,
                                    ascendantSign,
                                    house7Sign
                                );

                                if (sunWindows.length > 0) {
                                    sunWindows.forEach(sw => {
                                        // Format details
                                        const startStr = sw.start.toLocaleDateString(language, { month: 'short', year: 'numeric' });
                                        const endStr = sw.end.toLocaleDateString(language, { month: 'short', year: 'numeric' });

                                        const detail = isTamil
                                            ? `**${sw.start.getFullYear()}**: ${startStr} - ${endStr} (புத்தி: ${bhukti.planet})`
                                            : `**${sw.start.getFullYear()}**: ${startStr} - ${endStr} (Bhukti: ${bhukti.planet})`;

                                        if (isPast) {
                                            pastFavorableYears.add(year);
                                            // Keep simplified list for past
                                            if (!pastDetails.includes(detail)) pastDetails.push(detail);
                                        } else {
                                            futureFavorableYears.add(year);
                                            // Limit future suggestions to reasonable count
                                            if (futureDetails.length < 5 && !futureDetails.includes(detail)) {
                                                futureDetails.push(detail);
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // --- Construct Answer ---
    let answer = "";
    let reason = "";
    let isFavorable = false;

    // Filter Logic:
    // 1. If User Age > 40, prioritize Past Dates diagnosis + Next Immediate Future.
    // 2. If User Age < 30, prioritize Future Dates.

    const sortedFutureYears = Array.from(futureFavorableYears).sort((a, b) => a - b);
    const sortedPastYears = Array.from(pastFavorableYears).sort((a, b) => b - a); // Descending (recent past first)

    // Filter far future dates (e.g. > current_year + 10)
    const realisticFutureYears = sortedFutureYears.filter(y => y <= now.getFullYear() + 10);
    const farFutureYears = sortedFutureYears.filter(y => y > now.getFullYear() + 10);

    const hasStrongFuture = realisticFutureYears.length > 0;
    const hasStrongPast = sortedPastYears.length > 0;

    if (hasStrongFuture) {
        const topYears = realisticFutureYears.slice(0, 3).join(", ");
        answer = isTamil
            ? `திருமணம் நடக்க வாய்ப்புள்ள ஆண்டுகள்: **${topYears}**\n\n`
            : `Most Likely Marriage Years: **${topYears}**\n\n`;

        // Add details corresponding to these years
        const relevantDetails = futureDetails.filter(d => realisticFutureYears.some(y => d.includes(y.toString()))).slice(0, 3);
        answer += isTamil ? `குறிப்பிட்ட காலங்கள்:\n${relevantDetails.join("\n")}` : `Specific Favorable Periods:\n${relevantDetails.join("\n")}`;

        isFavorable = true;
    } else {
        // No immediate future. Check Past.
        if (hasStrongPast) {
            // User likely missed the periods or is already married (but asking "when").
            // Or delay due to heavy Paabathuvam.
            const pastTop = sortedPastYears.slice(0, 3).join(", ");
            if (currentAge > 35) {
                answer = isTamil
                    ? `ஜாதகப்படி **${pastTop}** ஆகிய ஆண்டுகளில் வலுவான திருமண யோகம் இருந்தது. \n\nதற்போது குறிப்பிடத்தகுந்த யோகம் அருகில் இல்லை. (பரிகாரம் தேவை).`
                    : `According to the chart, strong marriage yogas occurred in **${pastTop}**. \n\nCurrently, there are no immediate strong indications in the near future.`;
            } else {
                // Young but no near future?
                answer = isTamil
                    ? `அடுத்த 5-7 ஆண்டுகளில் வலுவான யோகம் இல்லை. (${now.getFullYear() + 7}-க்கு பிறகு வாய்ப்பு).`
                    : `No strong yoga found in the immediate 5-7 years timeline.`;
            }
            if (farFutureYears.length > 0) {
                answer += isTamil ? `\n\nஅடுத்த சாத்தியம்: ${farFutureYears[0]}` : `\n\nNext possibility: ${farFutureYears[0]}`;
            }
            isFavorable = false;
        } else {
            // No past, no future?? Strange chart or strict filter.
            answer = isTamil
                ? "ஜாதகத்தில் திருமண யோகம் தாமதமாக உள்ளது. பரிகாரங்களை மேற்கொள்ளவும்."
                : "Marriage indications are delayed/weak in this chart. Remedies recommended.";
            isFavorable = false;
        }
    }

    if (isTamil) {
        reason = `விதி: 3, 7, 11 (திருமண முக்கோணம்) மற்றும் சுக்ரன், குரு தசை/புத்திகள்.\n- முக்கிய கிரகங்கள்: ${keyPlanets.join(', ')}\n- தற்போதைய தசை: ${currentDasa.maha.planet}/${currentDasa.bhukti?.planet}`;
    } else {
        reason = `Rule: 3-7-11 Marriage Triangle Logic (Initiative, Marriage, Fulfillment). Timing matches with Jupiter/Sun Transits.\n- Key Planets Checked: ${keyPlanets.join(', ')}\n- Current Status: Running ${currentDasa.maha.planet}/${currentDasa.bhukti?.planet}`;
    }

    return {
        question,
        answer,
        reason,
        isFavorable
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
        const dasaLord = currentDasa.maha.planet;
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

    // House Definitions
    const house6Sign = (ascendantSign + 5) % 12;
    const house8Sign = (ascendantSign + 7) % 12;
    const lord6 = SIGN_LORDS[house6Sign];
    const lord8 = SIGN_LORDS[house8Sign];

    // Safe access to scores
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
            ? `புதன் (${mercuryScore.toFixed(0)}) சனியை விட வலுவாக உள்ளார் (வியாபார சிந்தனை).`
            : `Mercury (${mercuryScore.toFixed(0)}) is stronger than Saturn (Business aptitude).`);
    } else {
        const diff = saturnScore - mercuryScore;
        if (diff > 10) {
            careerType = isTamil ? "அரசு/தனியார் வேலை (Job/Service)" : "Job / Service (Employment)";
            reasons.push(isTamil
                ? `சனி (${saturnScore.toFixed(0)}) புதனை விட வலுவாக உள்ளார் (உழைப்பு/சேவை).`
                : `Saturn (${saturnScore.toFixed(0)}) is stronger than Mercury (Service oriented).`);
        } else {
            careerType = isTamil ? "வேலை அல்லது தொழில் (இரண்டும் சாத்தியம்)" : "Job or Business (Mixed Potential)";
            reasons.push(isTamil
                ? "சனியும் புதனும் சம பலத்தில் உள்ளனர்."
                : "Saturn and Mercury have comparable strength.");
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

    // 3. Dasa Influence & 6/8 Rules (The User Request)
    if (currentDasa) {
        const dasaLord = currentDasa.maha.planet;

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

        // 6th Lord Rule
        if (dasaLord === lord6) {
            reasons.push(isTamil
                ? "எச்சரிக்கை: 6-ம் அதிபதி தசை நடப்பதால், சொந்த தொழில் செய்வதை விட வேலைக்கு செல்வதே சிறந்தது (கடன் பிரச்சனை வரலாம்)."
                : "Warning: Running 6th Lord Dasa. Employment is safer than Business (Risk of Debt).");
            if (isBusiness) {
                currentFocus += isTamil ? " (வேலையில் தொடர்வது நல்லது)" : " (Better to stick to Service).";
            }
        }

        // 8th Lord Rule
        else if (dasaLord === lord8) {
            reasons.push(isTamil
                ? "குறிப்பு: 8-ம் அதிபதி தசை. எதிர்பாராத மாற்றங்கள் வரலாம். ஆராய்ச்சி/அயல்நாடு/இன்சூரன்ஸ் துறை ஏற்றது."
                : "Note: Running 8th Lord Dasa. Expect sudden changes. Research/Audit/Insurance fields are favorable.");
            currentFocus += isTamil ? " (மாற்றங்கள் வரலாம்)" : " (Expect Changes).";
        }
    }

    const answer = `**${careerType}**\n${domainText}\n\n**${currentFocus}**`;
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
    subathuvamScores: Record<string, SubathuvamResult>,
    currentDasa?: { maha: DashaPeriod, bhukti?: DashaPeriod },
    language: 'en' | 'ta' = 'en'
): PredictionResult => {
    const isTamil = language === 'ta';
    const question = isTamil ? "வெளிநாட்டில் செட்டில் ஆக முடியுமா?" : "Can I settle abroad?";

    const getP = (name: string) => getPlanetPosition(planets, name);

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

    // Scores (Lagna)
    const s8_L = subathuvamScores[lord8_Lagna]?.totalScore || 0;
    const s12_L = subathuvamScores[lord12_Lagna]?.totalScore || 0;

    // Scores (Rasi)
    const s8_R = subathuvamScores[lord8_Rasi]?.totalScore || 0;
    const s12_R = subathuvamScores[lord12_Rasi]?.totalScore || 0;

    // Sign Nature Check (Moveable/Water) from Lagna mostly used, but checking Rasi helps
    const moveableSigns = [0, 3, 6, 9];
    const waterSigns = [3, 7, 11];

    const is8Moveable = moveableSigns.includes(l8) || moveableSigns.includes(r8);
    const is12Moveable = moveableSigns.includes(l12) || moveableSigns.includes(r12);
    const is8Water = waterSigns.includes(l8) || waterSigns.includes(r8);
    const is12Water = waterSigns.includes(l12) || waterSigns.includes(r12);

    let foreignScore = 0;
    let reasons: string[] = [];
    let strongLagna = false;
    let strongRasi = false;

    // 1. Lagna Strength (8th & 12th)
    if (s8_L > 40 && s12_L > 40) {
        strongLagna = true;
        foreignScore += 50;
        reasons.push(isTamil
            ? `லக்ன ரீதியாக 8 & 12ம் அதிபதிகள் சுபத்துவமாக உள்ளனர்.`
            : `Lagna: 8th & 12th Lords are Subathuva.`);
    } else if (s12_L > 40) {
        foreignScore += 20;
    }

    // 2. Rasi Strength (8th & 12th from Moon)
    if (s8_R > 40 && s12_R > 40) {
        strongRasi = true;
        foreignScore += 30; // Add bonus
        reasons.push(isTamil
            ? `ராசி ரீதியாக (சந்திரன்) 8 & 12ம் அதிபதிகள் சுபத்துவமாக உள்ளனர்.`
            : `Rasi (Moon): 8th & 12th Lords are Subathuva.`);
    }

    // 3. Moveable/Water Signs
    if (is8Moveable || is12Moveable) {
        foreignScore += 20;
        reasons.push(isTamil
            ? "8/12-ம் வீடுகள் சர ராசியில் (Moveable) உள்ளன."
            : "8th/12th Houses in Moveable Signs (Displacement).");
    }
    if (is8Water || is12Water) {
        foreignScore += 10;
        reasons.push(isTamil
            ? "நீர் ராசி தொடர்பு (கடல் கடந்து செல்லும் யோகம்)."
            : "Water Sign connection (Ocean travel).");
    }

    // 4. Rahu Influence (Foreign Karaka)
    const rahu = getP('Rahu');
    if (rahu) {
        // Check Rahu position from Lagna OR Rasi
        const rahuInLqn8 = rahu.signIndex === l8;
        const rahuInLqn12 = rahu.signIndex === l12;
        const rahuInRasi8 = rahu.signIndex === r8;
        const rahuInRasi12 = rahu.signIndex === r12;

        if (rahuInLqn8 || rahuInLqn12 || rahuInRasi8 || rahuInRasi12) {
            foreignScore += 25;
            reasons.push(isTamil
                ? "ராகு 8/12-ல் உள்ளார் (வெளிநாட்டு காரகன்)."
                : "Rahu in 8th/12th House (Foreign Karaka).");
        }

        // Rahu Conjunctions with 8/12 Lords (Lagna or Rasi)
        const relevantLords = [lord8_Lagna, lord12_Lagna, lord8_Rasi, lord12_Rasi];
        let rahuConnected = false;

        for (const ld of relevantLords) {
            const p = getP(ld);
            if (p && p.signIndex === rahu.signIndex) rahuConnected = true;
        }

        if (rahuConnected) {
            foreignScore += 15;
            reasons.push(isTamil
                ? "ராகு 8/12 அதிபதியுடன் சேர்க்கை."
                : "Rahu conjoined with 8th/12th Lord.");
        }
    }

    // 5. Dasa Check
    if (currentDasa) {
        const dasaLord = currentDasa.maha.planet;
        // Check if Dasa Lord is connected to Foreign Travel (Lagna Or Rasi Lords)
        const foreignLords = [lord8_Lagna, lord12_Lagna, lord9_Lagna, lord8_Rasi, lord12_Rasi, 'Rahu'];

        if (foreignLords.includes(dasaLord)) {
            foreignScore += 20;
            reasons.push(isTamil
                ? `தற்போதைய தசை (${dasaLord}) வெளிநாட்டு யோகத்திற்கு சாதகம்.`
                : `Current Dasa (${dasaLord}) supports Foreign Travel.`);
        }
    }

    // Verdict Logic
    let answer = "";
    let isFavorable = true;

    // Aditya Guruji's Strong Rule: IF Subathuva is present in 8 & 12
    if (strongLagna || strongRasi) {
        if (foreignScore >= 80) {
            answer = isTamil
                ? "**நிரந்தர குடியுரிமை (Permanent Settlement)**: ஜாதகத்தில் 8-12 சுபத்துவ விதி (லக்னம்/ராசி) வலுவாக உள்ளது."
                : "**Permanent Settlement**: Strong 8-12 Subathuva Rule (Lagna/Rasi) active.";
        } else {
            answer = isTamil
                ? "**நீண்ட கால வேலை/வாழ்க்கை**: 8-12 விதி சாதகமாக உள்ளது."
                : "**Long Term Stay**: 8-12 Rule is favorable.";
        }
    } else {
        // Moderate scores
        if (foreignScore >= 50) {
            answer = isTamil
                ? "**வெளிநாட்டு வேலை/பயணம்**: குறுகிய கால அல்லது வேலை நிமித்தம் செல்லலாம்."
                : "**Work / Short Stay**: Good chance for work, but permanent settlement needs stronger Subathuva.";
        } else {
            answer = isTamil
                ? "**குறைந்த வாய்ப்பு**: உள்ளூர் வாழ்க்கை சிறந்தது."
                : "**Low Chance**: Domestic life is more suitable.";
            isFavorable = false;
        }
    }

    const reasonText = reasons.join('\n- ');
    return {
        question,
        answer,
        reason: isTamil ? `**காரணங்கள்:**\n- ${reasonText}` : `**Reasons:**\n- ${reasonText}`,
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
    const mahaPlanet = currentDasa.maha.planet;
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
    const dasaLord = currentDasa.maha.planet;
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

    // Age check: Skip for people over 60
    const now = new Date();
    const ageMs = now.getTime() - birthDate.getTime();
    const currentAge = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    if (currentAge >= 60) {
        // Return null or skip - Frontend should handle this
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

    // Get Moon longitude for dasaperiod calculation
    const moon = planets.find(p => p.name === 'Moon');
    if (!moon) {
        throw new Error("Moon position required for Life Quality calculation");
    }

    // Calculate all future Dasa periods until age 60
    const futureDasas = getFutureDasaPeriods(birthDate, currentAge, 60, moon.longitude);
    const totalFutureYears = futureDasas.reduce((sum, p) => sum + p.durationYears, 0);

    const getP = (name: string) => planets.find(p => p.name === name);
    const getLord = (houseIdx: number) => SIGN_LORDS[(ascendantSign + houseIdx - 1) % 12];
    const getPlanetScore = (planetName: string) => subathuvamScores[planetName]?.totalScore || 0;

    // Helper: Check if planet is in specific house
    const getPlanetHouse = (planetName: string): number => {
        const planet = getP(planetName);
        if (!planet) return -1;
        return ((planet.signIndex - ascendantSign + 12) % 12) + 1;
    };

    // Helper: Check if Lord is strong (not in 6/8/12)
    const isLordStrong = (lordName: string): boolean => {
        const house = getPlanetHouse(lordName);
        return house !== 6 && house !== 8 && house !== 12;
    };

    // Helper: Check if Lord is in Kendra (1,4,7,10) or Trikona (1,5,9)
    const isLordInKendra = (lordName: string): boolean => {
        const house = getPlanetHouse(lordName);
        return [1, 4, 7, 10].includes(house);
    };

    const isLordInTrikona = (lordName: string): boolean => {
        const house = getPlanetHouse(lordName);
        return [1, 5, 9].includes(house);
    };

    // Helper: Check Jupiter aspect (Guruji's Subathuvam Rule)
    const hasJupiterAspect = (planetName: string): boolean => {
        const planet = getP(planetName);
        const jupiter = getP('Jupiter');
        if (!planet || !jupiter) return false;

        const diff = Math.abs(planet.signIndex - jupiter.signIndex);
        // Jupiter aspects: 5th, 7th, 9th houses from its position
        return [4, 6, 8].includes(diff) || [8, 6, 4].includes(diff);
    };

    // Helper: Check if two lords are connected
    const arelordsConnected = (lord1: string, lord2: string): boolean => {
        const house1 = getPlanetHouse(lord1);
        const house2 = getPlanetHouse(lord2);

        // Same sign or mutual aspect
        if (house1 === house2) return true;

        const planet1 = getP(lord1);
        const planet2 = getP(lord2);
        if (!planet1 || !planet2) return false;

        const diff = Math.abs(planet1.signIndex - planet2.signIndex);
        return [3, 6, 9].includes(diff); // 4th, 7th, 10th aspect
    };

    const mahaLord = currentDasa.maha.planet;

    // ========== CATEGORY 1: WEALTH & FINANCE ==========
    let wealthChartScore = 0;
    let wealthDasaScore = 0;

    const lord2 = getLord(2);
    const lord11 = getLord(11);
    const lord9 = getLord(9);

    // Chart Score (60)
    if (isLordInKendra(lord2) || isLordInTrikona(lord2)) wealthChartScore += 10;
    if (hasJupiterAspect(lord2)) wealthChartScore += 20;
    if (!isLordStrong(lord2)) wealthChartScore -= 10;

    const lord11Planet = getP(lord11);
    if (lord11Planet) {
        // Check if in own house or exalted
        const lord11Score = getPlanetScore(lord11);
        if (lord11Score > 60) wealthChartScore += 10;
    }

    if (arelordsConnected(lord11, lord2) || arelordsConnected(lord11, lord9)) {
        wealthChartScore += 10; // Dhana Yoga
    }

    if (isLordStrong(lord9)) wealthChartScore += 10;

    // Dasa Score (40) - Weighted Lifetime Average
    const lagnaLord = getLord(1);
    for (const period of futureDasas) {
        let periodScore = 0;

        if ([lord2, lord9, lord11].includes(period.planet)) periodScore += 20;

        const periodScore2 = getPlanetScore(period.planet);
        if (periodScore2 > 40) periodScore += 10;

        const periodHouse = getPlanetHouse(period.planet);
        if ([2, 11].includes(periodHouse)) periodScore += 10;
        if ([6, 8, 12].includes(periodHouse)) periodScore -= 20;

        wealthDasaScore += (periodScore * period.durationYears);
    }
    wealthDasaScore = totalFutureYears > 0 ? wealthDasaScore / totalFutureYears : 0;

    const wealth = Math.round(Math.max(0, Math.min(100, wealthChartScore + wealthDasaScore)));

    // ========== CATEGORY 2: CAREER & PROFESSION ==========
    let careerChartScore = 0;
    let careerDasaScore = 0;

    const lord10 = getLord(10);
    const saturn = getP('Saturn');
    const sun = getP('Sun');

    // Chart Score (60)
    if (isLordInKendra(lord10)) careerChartScore += 10;

    const lord10Planet = getP(lord10);
    const sunPlanet = getP('Sun');
    const marsPlanet = getP('Mars');

    if (lord10Planet && (sunPlanet || marsPlanet)) {
        const diff1 = sunPlanet ? Math.abs(lord10Planet.signIndex - sunPlanet.signIndex) : 999;
        const diff2 = marsPlanet ? Math.abs(lord10Planet.signIndex - marsPlanet.signIndex) : 999;
        if (diff1 === 0 || diff2 === 0) careerChartScore += 10; // With Sun or Mars
    }

    if (saturn && hasJupiterAspect('Saturn')) careerChartScore += 20;
    if (saturn) {
        const rahu = getP('Rahu');
        const ketu = getP('Ketu');
        const mars = getP('Mars');

        const saturnSign = saturn.signIndex;
        const hasAffliction = [rahu, ketu, mars].some(p => p && p.signIndex === saturnSign);
        if (hasAffliction) careerChartScore -= 10;
    }

    if (sun) {
        const sunSign = sun.signIndex;
        // Aries=0, Leo=4, Scorpio=7, Sagittarius=8
        if ([0, 4, 7, 8].includes(sunSign)) careerChartScore += 10;
    }

    // Dasa Score (40) - Weighted Lifetime Average
    const lord6 = getLord(6);
    for (const period of futureDasas) {
        let periodScore = 0;

        if (period.planet === lord10) periodScore += 20;
        if (arelordsConnected(period.planet, lord10)) periodScore += 10;
        if (period.planet === lord6) periodScore += 10;

        const periodHouse = getPlanetHouse(period.planet);
        if ([10, 1].includes(periodHouse)) periodScore += 10;
        if (periodHouse === 8) periodScore -= 20;

        careerDasaScore += (periodScore * period.durationYears);
    }
    careerDasaScore = totalFutureYears > 0 ? careerDasaScore / totalFutureYears : 0;

    const career = Math.round(Math.max(0, Math.min(100, careerChartScore + careerDasaScore)));

    // ========== CATEGORY 3: LOVE & MARRIAGE ==========
    let marriageChartScore = 0;
    let marriageDasaScore = 0;

    const lord3 = getLord(3);
    const lord7 = getLord(7);
    const venus = getP('Venus');
    const jupiter = getP('Jupiter');

    // Chart Score (60)
    if (arelordsConnected(lord3, lord7) && arelordsConnected(lord7, lord11)) {
        marriageChartScore += 20; // 3-7-11 connected
    }

    if (isLordStrong(lord7)) marriageChartScore += 10;

    const venusScore = getPlanetScore('Venus');
    const jupiterScore = getPlanetScore('Jupiter');
    if (venusScore > 50 || jupiterScore > 50) marriageChartScore += 10;

    const rahu = getP('Rahu');
    const ketu = getP('Ketu');
    const house2Sign = (ascendantSign + 1) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house8Sign = (ascendantSign + 7) % 12;

    const hasDosha = [rahu, ketu].some(p =>
        p && [house2Sign, house7Sign, house8Sign].includes(p.signIndex)
    );

    if (hasDosha) {
        marriageChartScore -= 20;
        // Check Jupiter aspect to cancel dosha
        if (jupiter && hasJupiterAspect('Rahu')) {
            marriageChartScore += 20; // Dosha cancelled
        }
    }

    // Dasa Score (40) - Weighted Lifetime Average
    const lord8 = getLord(8);
    for (const period of futureDasas) {
        let periodScore = 0;

        if (period.planet === lord7 || period.planet === 'Venus') periodScore += 20;
        if ([lord3, lord7, lord11].some(l => arelordsConnected(period.planet, l))) periodScore += 10;
        if (period.planet === lord6) periodScore -= 15;
        if (period.planet === lord8) periodScore -= 25;

        marriageDasaScore += (periodScore * period.durationYears);
    }
    marriageDasaScore = totalFutureYears > 0 ? marriageDasaScore / totalFutureYears : 0;

    const marriage = Math.round(Math.max(0, Math.min(100, marriageChartScore + marriageDasaScore)));

    // ========== CATEGORY 4: FAMILY & CHILDREN ==========
    let familyChartScore = 0;
    let familyDasaScore = 0;

    const lord5 = getLord(5);

    // Chart Score (60)
    const jupiterHouse = getPlanetHouse('Jupiter');
    const jupiterSign = jupiter ? jupiter.signIndex : -1;

    // Jupiter exalted (Cancer=3) or own house (Sagittarius=8, Pisces=11)
    if ([3, 8, 11].includes(jupiterSign)) familyChartScore += 20;
    if ([6, 8, 12].includes(jupiterHouse)) familyChartScore -= 20;

    if (jupiter && rahu) {
        if (jupiter.signIndex === rahu.signIndex) familyChartScore -= 10;
    }

    if (isLordStrong(lord5)) familyChartScore += 20;

    const house5Sign = (ascendantSign + 4) % 12;
    const maleficsInHouse5 = [saturn, marsPlanet, rahu, ketu].some(p =>
        p && p.signIndex === house5Sign
    );
    if (maleficsInHouse5) familyChartScore -= 10;

    // Dasa Score (40) - Weighted Lifetime Average
    for (const period of futureDasas) {
        let periodScore = 0;

        if (period.planet === lord5 || period.planet === 'Jupiter') periodScore += 20;
        if (period.planet === lord9) periodScore += 10;
        if (['Rahu', 'Ketu'].includes(period.planet)) periodScore -= 10;
        if (period.planet === lord8) periodScore -= 20;

        familyDasaScore += (periodScore * period.durationYears);
    }
    familyDasaScore = totalFutureYears > 0 ? familyDasaScore / totalFutureYears : 0;

    const family = Math.round(Math.max(0, Math.min(100, familyChartScore + familyDasaScore)));

    // ========== CATEGORY 5: HEALTH & LONGEVITY ==========
    let healthChartScore = 0;
    let healthDasaScore = 0;

    // Chart Score (60)
    const lagnaLordScore = getPlanetScore(lagnaLord);
    const lord6Score = getPlanetScore(lord6);

    if (lagnaLordScore > lord6Score) healthChartScore += 30;
    if (lagnaLordScore < 30) healthChartScore -= 20;

    const lord8Score = getPlanetScore(lord8);
    const saturnScore = getPlanetScore('Saturn');
    if (lord8Score > 50 || saturnScore > 50) healthChartScore += 20;

    const lagnaHouse = getPlanetHouse(lagnaLord);
    if ([6, 8, 12].includes(lagnaHouse)) healthChartScore -= 10;

    // Dasa Score (40) - Weighted Lifetime Average
    for (const period of futureDasas) {
        let periodScore = 0;

        if (period.planet === lagnaLord) periodScore += 20;
        if (getPlanetScore(period.planet) > 40) periodScore += 10;
        if (hasJupiterAspect(period.planet)) periodScore += 10;
        if (period.planet === lord6) periodScore -= 15;
        if (period.planet === lord8) periodScore -= 25;

        healthDasaScore += (periodScore * period.durationYears);
    }
    healthDasaScore = totalFutureYears > 0 ? healthDasaScore / totalFutureYears : 0;

    const health = Math.round(Math.max(0, Math.min(100, healthChartScore + healthDasaScore)));

    // ========== CATEGORY 6: PROPERTY & ASSETS ==========
    let propertyChartScore = 0;
    let propertyDasaScore = 0;

    const lord4 = getLord(4);

    // Chart Score (60)
    if (isLordInKendra(lord4) || isLordInTrikona(lord4)) propertyChartScore += 20;

    if (marsPlanet && (hasJupiterAspect('Mars') || arelordsConnected('Mars', 'Venus'))) {
        propertyChartScore += 20; // Land Karaka with Subathuvam
    }

    if (marsPlanet) {
        const marsSign = marsPlanet.signIndex;
        const afflicted = [rahu, ketu, saturn].some(p => p && p.signIndex === marsSign);
        if (afflicted) propertyChartScore -= 10;
    }

    if (venus && getPlanetScore('Venus') > 50) propertyChartScore += 10;

    // Dasa Score (40) - Weighted Lifetime Average
    const lord12 = getLord(12);
    for (const period of futureDasas) {
        let periodScore = 0;

        if (period.planet === lord4 || period.planet === 'Mars') periodScore += 20;
        if (period.planet === lord11) periodScore += 10;
        if (period.planet === lord12) periodScore -= 20;
        if (period.planet === 'Ketu') periodScore -= 10;

        propertyDasaScore += (periodScore * period.durationYears);
    }
    propertyDasaScore = totalFutureYears > 0 ? propertyDasaScore / totalFutureYears : 0;

    const property = Math.round(Math.max(0, Math.min(100, propertyChartScore + propertyDasaScore)));

    // ========== CATEGORY 7: EDUCATION & INTELLIGENCE ==========
    let educationChartScore = 0;
    let educationDasaScore = 0;

    const mercury = getP('Mercury');

    // Chart Score (60)
    if (mercury) {
        const mercuryScore = getPlanetScore('Mercury');
        const mercurySign = mercury.signIndex;

        // Bhadra Yoga (Exalted/Own: Gemini=2, Virgo=5)
        if ([2, 5].includes(mercurySign) && mercuryScore > 60) {
            educationChartScore += 20;
        }

        // Combust or Debilitated (Pisces=11)
        if (sunPlanet && Math.abs(mercury.signIndex - sunPlanet.signIndex) === 0) {
            educationChartScore -= 20; // Combust
        }
        if (mercurySign === 11) educationChartScore -= 20; // Debilitated
    }

    if (isLordStrong(lord4)) educationChartScore += 10;
    if (isLordStrong(lord9)) educationChartScore += 10;
    if (isLordStrong(lord2)) educationChartScore += 10;

    // Dasa Score (40) - Weighted Lifetime Average
    for (const period of futureDasas) {
        let periodScore = 0;

        if (period.planet === 'Mercury' || period.planet === 'Jupiter') periodScore += 20;
        if ([lord4, lord5, lord9].includes(period.planet)) periodScore += 20;
        if (period.planet === lord8) periodScore -= 20;

        educationDasaScore += (periodScore * period.durationYears);
    }
    educationDasaScore = totalFutureYears > 0 ? educationDasaScore / totalFutureYears : 0;

    const education = Math.round(Math.max(0, Math.min(100, educationChartScore + educationDasaScore)));

    // ========== CATEGORY 8: HAPPINESS & PEACE OF MIND ==========
    let happinessChartScore = 0;
    let happinessDasaScore = 0;

    // Chart Score (60) - using moon variable declared earlier
    if (moon && hasJupiterAspect('Moon')) happinessChartScore += 30;

    if (moon) {
        const moonSign = moon.signIndex;
        const afflicted = [saturn, rahu].some(p => p && p.signIndex === moonSign);
        if (afflicted) happinessChartScore -= 20;

        // Kemadruma: No planets on either side
        const leftSign = (moonSign - 1 + 12) % 12;
        const rightSign = (moonSign + 1) % 12;
        const hasNeighbor = planets.some(p =>
            p.name !== 'Moon' && (p.signIndex === leftSign || p.signIndex === rightSign)
        );
        if (!hasNeighbor) happinessChartScore -= 10;
    }

    const house4Sign = (ascendantSign + 3) % 12;
    const house4Afflicted = [saturn, marsPlanet, rahu, ketu].some(p =>
        p && p.signIndex === house4Sign
    );
    if (!house4Afflicted) happinessChartScore += 10;

    // Dasa Score (40) - Weighted Lifetime Average
    for (const period of futureDasas) {
        let periodScore = 0;

        if (getPlanetScore(period.planet) > 40) periodScore += 20;
        if (period.planet === 'Moon' || period.planet === 'Jupiter') periodScore += 10;
        if (period.planet === lord8) periodScore -= 20;

        // Check Sade Sati (simplified)
        if (period.planet === 'Saturn' && moon && saturn) {
            const moonToSaturn = Math.abs(moon.signIndex - saturn.signIndex);
            if (moonToSaturn <= 1) periodScore -= 10;
        }

        happinessDasaScore += (periodScore * period.durationYears);
    }
    happinessDasaScore = totalFutureYears > 0 ? happinessDasaScore / totalFutureYears : 0;

    const happiness = Math.round(Math.max(0, Math.min(100, happinessChartScore + happinessDasaScore)));

    // ========== OVERALL CALCULATION ==========
    const categories = {
        wealth: {
            score: wealth,
            chartScore: wealthChartScore,
            dasaScore: wealthDasaScore,
            name: isTamil ? "செல்வம் & நிதி" : "Wealth & Finance",
            icon: "💰"
        },
        career: {
            score: career,
            chartScore: careerChartScore,
            dasaScore: careerDasaScore,
            name: isTamil ? "தொழில் வெற்றி" : "Career & Success",
            icon: "💼"
        },
        marriage: {
            score: marriage,
            chartScore: marriageChartScore,
            dasaScore: marriageDasaScore,
            name: isTamil ? "காதல் & திருமணம்" : "Love & Marriage",
            icon: "❤️"
        },
        family: {
            score: family,
            chartScore: familyChartScore,
            dasaScore: familyDasaScore,
            name: isTamil ? "குடும்பம் & குழந்தைகள்" : "Family & Children",
            icon: "👨‍👩‍👧‍👦"
        },
        health: {
            score: health,
            chartScore: healthChartScore,
            dasaScore: healthDasaScore,
            name: isTamil ? "ஆரோக்கியம்" : "Health & Longevity",
            icon: "🏥"
        },
        property: {
            score: property,
            chartScore: propertyChartScore,
            dasaScore: propertyDasaScore,
            name: isTamil ? "சொத்து & வசதிகள்" : "Property & Assets",
            icon: "🏠"
        },
        education: {
            score: education,
            chartScore: educationChartScore,
            dasaScore: educationDasaScore,
            name: isTamil ? "கல்வி & புத்திசாலித்தனம்" : "Education & Intelligence",
            icon: "🎓"
        },
        happiness: {
            score: happiness,
            chartScore: happinessChartScore,
            dasaScore: happinessDasaScore,
            name: isTamil ? "மன அமைதி & சந்தோஷம்" : "Happiness & Peace",
            icon: "😊"
        }
    };

    const totalScore = Math.round(
        (wealth + career + marriage + family + health + property + education + happiness) / 8
    );

    // Star Rating (Score / 20)
    const starRating = Math.max(1, Math.min(5, Math.round(totalScore / 10) / 2));

    let verdict = "";
    if (starRating >= 4.5) verdict = isTamil ? "மிகச் சிறந்த வாழ்க்கை (Excellent)" : "Excellent Life";
    else if (starRating >= 4) verdict = isTamil ? "மிக நல்ல வாழ்க்கை (Very Good)" : "Very Good Life";
    else if (starRating >= 3) verdict = isTamil ? "நல்ல வாழ்க்கை (Good)" : "Good Life";
    else if (starRating >= 2) verdict = isTamil ? "சவாலான வாழ்க்கை (Challenging)" : "Challenging Life";
    else verdict = isTamil ? "கடினமான வாழ்க்கை (Difficult)" : "Difficult Life";

    const answer = isTamil
        ? `உங்கள் ஒட்டுமொத்த வாழ்க்கை மதிப்பீடு: **${totalScore}/100**\n\n**தரமதிப்பீடு:** ${verdict}\n\n8 வாழ்க்கை பிரிவுகளின் அடிப்படையில் கணக்கிடப்பட்டது.`
        : `Your Overall Life Quality Score: **${totalScore}/100**\n\n**Rating:** ${verdict}\n\nBased on 8 Life Categories.`;

    // Helper to translate planet names to Tamil
    const translatePlanet = (planetName: string): string => {
        if (!isTamil) return planetName;
        const tamilNames: Record<string, string> = {
            'Sun': 'சூரியன்',
            'Moon': 'சந்திரன்',
            'Mars': 'செவ்வாய்',
            'Mercury': 'புதன்',
            'Jupiter': 'குரு',
            'Venus': 'சுக்ரன்',
            'Saturn': 'சனி',
            'Rahu': 'ராகு',
            'Ketu': 'கேது'
        };
        return tamilNames[planetName] || planetName;
    };

    // Build detailed breakdown for each category
    const buildCategoryDetail = (categoryName: string, score: number, chartScore: number, dasaScore: number, lords: string[], keyDasas: string[]) => {
        const translatedLords = lords.map(translatePlanet);
        const translatedDasas = keyDasas.map(translatePlanet);
        const lordsText = translatedLords.length > 0 ? translatedLords.join(', ') : (isTamil ? 'இல்லை' : 'None');
        const dasaText = translatedDasas.length > 0 ? translatedDasas.slice(0, 3).join(', ') : (isTamil ? 'பல்வேறு' : 'Various');
        return isTamil
            ? `${categoryName}: ${score}/100\n   • ஜாதகம்: ${Math.round(chartScore)} (${lordsText})\n   • தசை: ${Math.round(dasaScore)} (${dasaText})`
            : `${categoryName}: ${score}/100\n   • Chart: ${Math.round(chartScore)} (${lordsText})\n   • Dasa: ${Math.round(dasaScore)} (${dasaText})`;
    };

    // Identify key contributing Dasas (top 3 by weight)
    const getTopDasas = () => {
        const dasaContributions: Array<{ planet: string, weight: number }> = [];
        for (const period of futureDasas) {
            dasaContributions.push({
                planet: period.planet,
                weight: period.durationYears
            });
        }
        dasaContributions.sort((a, b) => b.weight - a.weight);
        return dasaContributions.slice(0, 3).map(d => d.planet);
    };

    const topDasas = getTopDasas();

    const reason = isTamil
        ? `**மதிப்பெண் விவரம்:**\n\n${buildCategoryDetail('💰 செல்வம்', wealth, wealthChartScore, wealthDasaScore, [lord2, lord11, lord9], topDasas)}\n\n${buildCategoryDetail('💼 தொழில்', career, careerChartScore, careerDasaScore, [lord10, 'Saturn'], topDasas)}\n\n${buildCategoryDetail('❤️ திருமணம்', marriage, marriageChartScore, marriageDasaScore, [lord3, lord7, lord11], topDasas)}\n\n${buildCategoryDetail('👨‍👩‍👧‍👦 குடும்பம்', family, familyChartScore, familyDasaScore, [lord5, 'Jupiter', lord9], topDasas)}\n\n${buildCategoryDetail('🏥 ஆரோக்கியம்', health, healthChartScore, healthDasaScore, [lagnaLord, lord6], topDasas)}\n\n${buildCategoryDetail('🏠 சொத்து', property, propertyChartScore, propertyDasaScore, [lord4, 'Mars'], topDasas)}\n\n${buildCategoryDetail('🎓 கல்வி', education, educationChartScore, educationDasaScore, ['Mercury', lord5, lord9], topDasas)}\n\n${buildCategoryDetail('😊 சந்தோஷம்', happiness, happinessChartScore, happinessDasaScore, ['Moon', 'Jupiter'], topDasas)}`
        : `**Score Breakdown:**\n\n${buildCategoryDetail('💰 Wealth', wealth, wealthChartScore, wealthDasaScore, [lord2, lord11, lord9], topDasas)}\n\n${buildCategoryDetail('💼 Career', career, careerChartScore, careerDasaScore, [lord10, 'Saturn'], topDasas)}\n\n${buildCategoryDetail('❤️ Marriage', marriage, marriageChartScore, marriageDasaScore, [lord3, lord7, lord11], topDasas)}\n\n${buildCategoryDetail('👨‍👩‍👧‍👦 Family', family, familyChartScore, familyDasaScore, [lord5, 'Jupiter', lord9], topDasas)}\n\n${buildCategoryDetail('🏥 Health', health, healthChartScore, healthDasaScore, [lagnaLord, lord6], topDasas)}\n\n${buildCategoryDetail('🏠 Property', property, propertyChartScore, propertyDasaScore, [lord4, 'Mars'], topDasas)}\n\n${buildCategoryDetail('🎓 Education', education, educationChartScore, educationDasaScore, ['Mercury', lord5, lord9], topDasas)}\n\n${buildCategoryDetail('😊 Happiness', happiness, happinessChartScore, happinessDasaScore, ['Moon', 'Jupiter'], topDasas)}`;

    return {
        question,
        answer,
        reason,
        isFavorable: totalScore > 60,
        totalScore,
        starRating,
        categories
    };
};