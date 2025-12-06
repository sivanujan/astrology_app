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

    const currentAge = new Date().getFullYear() - birthDate.getFullYear();
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
                        const ageAtBhukti = bhuktiMidDate.getFullYear() - birthDate.getFullYear();
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
export const predictCareerPath = (
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

    // --- Step A: Identify Key Planets ---
    const house2Sign = (ascendantSign + 1) % 12;
    const house7Sign = (ascendantSign + 6) % 12;
    const house8Sign = (ascendantSign + 7) % 12;
    const house11Sign = (ascendantSign + 10) % 12;

    const lord2 = SIGN_LORDS[house2Sign];
    const lord7 = SIGN_LORDS[house7Sign];
    const lord11 = SIGN_LORDS[house11Sign];
    const venus = 'Venus';

    const rahu = getPlanetPosition(planets, 'Rahu');
    const ketu = getPlanetPosition(planets, 'Ketu');
    const keyPlanets = [lord2, lord7, lord11, venus];

    if (rahu && [house2Sign, house7Sign, house8Sign].includes(rahu.signIndex)) keyPlanets.push('Rahu');
    if (ketu && [house2Sign, house7Sign, house8Sign].includes(ketu.signIndex)) keyPlanets.push('Ketu');

    const isKeyPlanet = (planetName: string) => keyPlanets.includes(planetName);

    // --- Precision Engine Execution ---
    let answer = "";
    let reason = "";
    let isFavorable = false;
    let predictionDetails: string[] = [];

    const now = new Date();

    // 1. Scan Future Periods
    if (allDashaPeriods.length > 0) {
        for (const maha of allDashaPeriods) {
            if (maha.endDate < now) continue;

            if (maha.subPeriods) {
                for (const bhukti of maha.subPeriods) {
                    if (bhukti.endDate < now) continue;

                    // Age Check
                    const bhuktiMidDate = new Date((bhukti.startDate.getTime() + bhukti.endDate.getTime()) / 2);
                    const ageAtBhukti = bhuktiMidDate.getFullYear() - birthDate.getFullYear();
                    if (ageAtBhukti < 21) continue;

                    // Step 1: Bukthi Filter
                    if (isKeyPlanet(bhukti.planet)) {

                        // Step 2: Guru Filter (Intersection)
                        // Scan for favorable Jupiter periods within this Bukthi
                        const jupiterWindows = getJupiterFavorablePeriods(
                            bhukti.startDate < now ? now : bhukti.startDate, // Start from now if Bukthi active
                            bhukti.endDate,
                            ascendantSign,
                            moonSign,
                            house7Sign
                        );

                        if (jupiterWindows.length > 0) {
                            for (const jWindow of jupiterWindows) {
                                // Step 3: Sun Filter (Pinpoint)
                                const sunWindows = getSunFavorablePeriods(
                                    jWindow.start,
                                    jWindow.end,
                                    ascendantSign,
                                    house7Sign
                                );

                                if (sunWindows.length > 0) {
                                    // Found precise dates!
                                    sunWindows.forEach(sw => {
                                        const detail = isTamil
                                            ? `${sw.start.toLocaleDateString()} - ${sw.end.toLocaleDateString()} (புத்தி: ${bhukti.planet}, குரு பலம்)`
                                            : `${sw.start.toLocaleDateString()} - ${sw.end.toLocaleDateString()} (Bukthi: ${bhukti.planet}, Jupiter Favorable)`;
                                        predictionDetails.push(detail);
                                    });
                                } else {
                                    // Fallback to Jupiter Window if Sun window misses (rare but possible if window is short)
                                    const detail = isTamil
                                        ? `${jWindow.start.toLocaleDateString()} - ${jWindow.end.toLocaleDateString()} (புத்தி: ${bhukti.planet}, குரு பலம்)`
                                        : `${jWindow.start.toLocaleDateString()} - ${jWindow.end.toLocaleDateString()} (Bukthi: ${bhukti.planet}, Jupiter Favorable)`;
                                    predictionDetails.push(detail);
                                }
                            }
                        }
                    }
                    if (predictionDetails.length >= 3) break; // Limit to top 3 predictions
                }
            }
            if (predictionDetails.length >= 3) break;
        }
    }

    if (predictionDetails.length > 0) {
        isFavorable = true;
        answer = isTamil ? "திருமண காலம் துல்லியமாக கணிக்கப்பட்டுள்ளது." : "Marriage timing has been precisely calculated.";
        reason = isTamil
            ? `**துல்லியமான திருமண தேதிகள் (Precision Dates):**\n\n` +
            predictionDetails.map(d => `- ${d}`).join('\n') +
            `\n\n(கணிக்கப்பட்ட முறை: தசை/புத்தி -> குரு பார்வை -> சூரியன் சஞ்சாரம்)`
            : `**Precision Marriage Dates:**\n\n` +
            predictionDetails.map(d => `- ${d}`).join('\n') +
            `\n\n(Method: Dasa/Bukthi -> Jupiter Aspect -> Sun Transit)`;
    } else {
        isFavorable = false;
        answer = isTamil ? "தற்போதைய காலம் திருமணத்திற்கு சாதகமாக இல்லை." : "Current period is not favorable for marriage.";
        reason = isTamil
            ? "அடுத்த சில ஆண்டுகளில் வலுவான திருமண அமைப்பு இல்லை. (தசை, குரு, சூரியன் மூன்றும் இணையும் காலம் இல்லை)."
            : "No strong marriage indication in the next few years. (No intersection of favorable Dasa, Jupiter, and Sun found).";
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

    let predictionType = "";
    let reasons: string[] = [];
    let isLove = false;

    // --- Step A: The "Rahu Override" (Primary Check) ---
    // Check: Is Rahu in the 7th House OR conjoined with the 7th Lord?
    let rahuOverride = false;
    if (rahu) {
        if (rahu.signIndex === house7Sign) {
            rahuOverride = true;
            reasons.push(isTamil
                ? "ராகு 7-ம் இடத்தில் உள்ளார் (விதிவிலக்கு: காதல்/கலப்பு திருமணம் உறுதி)."
                : "Rahu is in the 7th House (Override: Strong Love/Inter-caste Marriage).");
        }
        if (p7 && rahu.signIndex === p7.signIndex) {
            rahuOverride = true;
            reasons.push(isTamil
                ? "ராகு 7-ம் அதிபதியுடன் சேர்க்கை (விதிவிலக்கு: காதல் திருமணம்)."
                : "Rahu is conjoined with 7th Lord (Override: Love Marriage).");
        }
    }

    if (rahuOverride) {
        predictionType = isTamil ? "காதல் திருமணம் (விதிவிலக்கு/கலப்பு)" : "Love Marriage (Inter-caste/Unconventional)";
        isLove = true;
    }

    // --- Step B: The "Venus Override" (Secondary Check) ---
    // Check: Is Venus in Own House (Taurus/Libra) or Exalted (Pisces)?
    // Check: Is the user running Venus Dasa or Rahu Dasa (connected to Venus)?
    else {
        let venusOverride = false;
        if (venus) {
            // Own House (Taurus=1, Libra=6) or Exalted (Pisces=11)
            if ([1, 6, 11].includes(venus.signIndex)) {
                venusOverride = true;
                reasons.push(isTamil
                    ? "சுக்கிரன் ஆட்சி/உச்சம் (இயற்கையான காதல் ஈர்ப்பு)."
                    : "Venus is in Own House/Exalted (Natural Romantic Nature).");
            }
        }

        if (currentDasa) {
            const dasaLord = currentDasa.maha.planet;
            if (dasaLord === 'Venus') {
                venusOverride = true;
                reasons.push(isTamil
                    ? "சுக்கிரன் தசை நடக்கிறது (காதல் காலம்)."
                    : "Running Venus Dasa (Romantic Period).");
            }
            if (dasaLord === 'Rahu') {
                // Check if Rahu connects to Venus
                if (rahu && venus && (rahu.signIndex === venus.signIndex || isAspecting(rahu.signIndex, venus.signIndex, [5, 9]))) { // Rahu trine/conjunction
                    venusOverride = true;
                    reasons.push(isTamil
                        ? "ராகு தசை (சுக்கிரன் தொடர்பு) - காதல் விருப்பம்."
                        : "Running Rahu Dasa connected to Venus (Desire for Love).");
                }
            }
        }

        if (venusOverride) {
            predictionType = isTamil ? "காதல் திருமணம் (அதிக வாய்ப்பு)" : "Love Marriage (High Probability)";
            isLove = true;
        }

        // --- Step C: The "Standard 5+7 Rule" (Tertiary Check) ---
        // Check: Is the 5th Lord connected to the 7th Lord or 7th House?
        else {
            let standardLove = false;
            if (p5) {
                if (p5.signIndex === house7Sign) {
                    standardLove = true;
                    reasons.push(isTamil ? "5-ம் அதிபதி 7-ல் உள்ளார்." : "5th Lord is in the 7th House.");
                }
                if (p7 && p5.signIndex === p7.signIndex) {
                    standardLove = true;
                    reasons.push(isTamil ? "5-ம் மற்றும் 7-ம் அதிபதிகள் சேர்க்கை." : "5th and 7th Lords are conjoined.");
                }
                // Mutual Aspect (7th)
                if (p7 && Math.abs(p5.signIndex - p7.signIndex) === 6) {
                    standardLove = true;
                    reasons.push(isTamil ? "5-ம் மற்றும் 7-ம் அதிபதிகள் சமசப்தம பார்வை." : "5th and 7th Lords aspect each other.");
                }
            }
            // Lagna Lord to 7th (Personal Choice)
            if (pLagna) {
                if (pLagna.signIndex === house7Sign) {
                    standardLove = true;
                    reasons.push(isTamil ? "லக்னாதிபதி 7-ல் உள்ளார்." : "Lagna Lord is in 7th House.");
                }
                if (p7 && pLagna.signIndex === p7.signIndex) {
                    standardLove = true;
                    reasons.push(isTamil ? "லக்னாதிபதி மற்றும் 7-ம் அதிபதி சேர்க்கை." : "Lagna Lord and 7th Lord are conjoined.");
                }
            }

            if (standardLove) {
                predictionType = isTamil ? "காதல் திருமணம் (ஆன்ம ரீதியானது)" : "Love Marriage (Soul Connection)";
                isLove = true;
            }

            // --- Step D: The "Kama Trikona" Check (Desire Love) ---
            // Check: Are the 3rd Lord, 7th Lord, and 11th Lord connected?
            else {
                let kamaTrikona = false;
                // Check connections between 3, 7, 11
                // 3-7
                if (p3 && p7 && (p3.signIndex === p7.signIndex || Math.abs(p3.signIndex - p7.signIndex) === 6)) {
                    kamaTrikona = true;
                    reasons.push(isTamil ? "3-ம் மற்றும் 7-ம் அதிபதிகள் தொடர்பு." : "3rd and 7th Lords connected.");
                }
                // 7-11
                if (p7 && p11 && (p7.signIndex === p11.signIndex || Math.abs(p7.signIndex - p11.signIndex) === 6)) {
                    kamaTrikona = true;
                    reasons.push(isTamil ? "7-ம் மற்றும் 11-ம் அதிபதிகள் தொடர்பு." : "7th and 11th Lords connected.");
                }
                // 3-11 (Less strong for marriage but supports desire)
                if (p3 && p11 && (p3.signIndex === p11.signIndex)) {
                    // Optional: usually need 7th involvement for marriage
                }

                if (kamaTrikona) {
                    predictionType = isTamil ? "காதல் திருமணம் (விருப்பம் சார்ந்தது)" : "Love Marriage (Desire Driven)";
                    isLove = true;
                } else {
                    // All Checks Failed -> Arranged Marriage
                    predictionType = isTamil ? "பெற்றோர் பார்க்கும் திருமணம்" : "Arranged Marriage";
                    isLove = false;
                    reasons.push(isTamil
                        ? "காதல் திருமணத்திற்கான கிரக அமைப்புகள் இல்லை (5-7 தொடர்பு, ராகு/சுக்கிரன் ஆதிக்கம் இல்லை)."
                        : "No strong planetary combinations for Love Marriage (No 5-7 connection, Rahu/Venus override).");
                }
            }
        }
    }

    // Additional Context: Inter-caste Warning
    if (isLove && !predictionType.includes("Inter-caste") && !predictionType.includes("கலப்பு")) {
        // Check Ketu too
        if (ketu && ketu.signIndex === house7Sign) {
            reasons.push(isTamil ? "கேது 7-ல் உள்ளார் (கலப்பு சாத்தியம்)." : "Ketu in 7th House (Inter-caste likely).");
            predictionType += isTamil ? " (கலப்பு சாத்தியம்)" : " (Inter-caste likely)";
        }
    }

    const answer = predictionType;
    const reason = reasons.join('\n- ');

    return {
        question,
        answer,
        reason: isTamil ? `**காரணங்கள்:**\n- ${reason}` : `**Reasons:**\n- ${reason}`,
        isFavorable: isLove // Favorable = Love in this context? Or just neutral. Let's say True if Love, False if Arranged for now, or just True.
        // Actually, let's keep it consistent with "Favorable" meaning "Love" as that's usually the query "Will I have love marriage?"
    };
};
