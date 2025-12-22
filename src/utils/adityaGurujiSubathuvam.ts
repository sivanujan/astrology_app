import { calculateNavamsa, getNakshatra, NAKSHATRA_LORDS } from './astrology';

export interface SubathuvamResult {
    planet: string;
    rasiScore: number;
    navamsaScore: number;
    totalScore: number;
    isSubathuva: boolean;
    details: string[];
}

// Helper to calculate moon phase and light
const calculateMoonPhase = (moonLon: number, sunLon: number) => {
    let diff = moonLon - sunLon;
    if (diff < 0) diff += 360;

    // 0-180 is Waxing (Valarpirai), 180-360 is Waning (Theipirai)
    const isWaxing = diff <= 180;

    // Light calculation
    // Full Moon (180 deg) = 100% light
    // New Moon (0/360 deg) = 0% light
    let lightPercentage = 0;
    if (diff <= 180) {
        lightPercentage = (diff / 180) * 100;
    } else {
        lightPercentage = ((360 - diff) / 180) * 100;
    }

    return {
        isWaxing,
        lightPercentage,
        phaseName: isWaxing ? 'Valarpirai (Waxing)' : 'Theipirai (Waning)',
        isBenefic: lightPercentage > 50 // Rule: >50% light is Benefic
    };
};

export const calculateAdityaGurujiSubathuvam = (rasiPlanets: any[]): Record<string, SubathuvamResult> => {
    const results: Record<string, SubathuvamResult> = {};
    const jupiter = rasiPlanets.find(p => p.name === 'Jupiter');
    const venus = rasiPlanets.find(p => p.name === 'Venus');
    const sun = rasiPlanets.find(p => p.name === 'Sun');
    const moon = rasiPlanets.find(p => p.name === 'Moon');

    // Pre-calculate Moon status
    let moonStatus = { isWaxing: false, lightPercentage: 0, phaseName: '', isBenefic: false };
    if (moon && sun) {
        moonStatus = calculateMoonPhase(moon.longitude, sun.longitude);
    }

    rasiPlanets.forEach(planet => {
        let rasiScore = 0;
        let navamsaScore = 0;
        const details: string[] = [];
        let isSubathuva = false;

        // --- Step A: Rasi Chart Subathuvam (Base Strength) ---

        // Rule 1: Jupiter's Aspect (Guru Drishti) - +40 Marks
        if (jupiter && planet.name !== 'Jupiter') {
            const signDiff = (planet.signIndex - jupiter.signIndex + 12) % 12;
            const houseDist = signDiff + 1;

            if ([5, 7, 9].includes(houseDist)) {
                rasiScore += 40;
                details.push("Jupiter Aspect (+40)");
            }
        }

        // Rule 2: Conjunction with Benefics - +20 Marks
        // Benefics: Jupiter, Venus, Waxing Moon (Guru, Sukra, Valarpirai Chandran)
        if (planet.name !== 'Jupiter' && jupiter && planet.signIndex === jupiter.signIndex) {
            rasiScore += 20;
            details.push("Conjoined Jupiter (+20)");
        }
        if (planet.name !== 'Venus' && venus && planet.signIndex === venus.signIndex) {
            rasiScore += 20;
            details.push("Conjoined Venus (+20)");
        }

        // Moon Special Rule: Waxing Moon acts as Benefic
        if (planet.name !== 'Moon' && moon && moonStatus.isBenefic && planet.signIndex === moon.signIndex) {
            rasiScore += 15; // Slightly less than Jupiter/Venus
            details.push(`Conjoined Waxing Moon (${Math.round(moonStatus.lightPercentage)}% Light) (+15)`);
        }

        // Rule 3: Star Lord (Nakshatra) - +10 Marks
        const nakshatraInfo = getNakshatra(planet.longitude);
        if (nakshatraInfo.index >= 0 && nakshatraInfo.index < NAKSHATRA_LORDS.length) {
            const starLord = NAKSHATRA_LORDS[nakshatraInfo.index];
            if (['Jupiter', 'Venus'].includes(starLord)) {
                rasiScore += 10;
                details.push(`Star of ${starLord} (+10)`);
            }
            // Moon Star: Only if Waxing
            if (starLord === 'Moon' && moonStatus.isBenefic) {
                rasiScore += 10;
                details.push(`Star of Waxing Moon (+10)`);
            }
        }

        // --- Moon Specific Subathuvam Logic ---
        if (planet.name === 'Moon') {
            rasiScore += moonStatus.lightPercentage; // Direct add of light %
            details.push(`${moonStatus.phaseName}: ${Math.round(moonStatus.lightPercentage)}% Light (+${Math.round(moonStatus.lightPercentage)})`);

            if (!moonStatus.isBenefic) {
                details.push("Low Light: Treated as Malefic (Saturn-like)");
                // If extremely dark (<20%), maybe subtract or flag as Pavathuvam?
                // For now, low score reflects this.
            }
        }

        // --- Step B: Navamsa Chart Subathuvam (Hidden Strength) ---

        const navamsa = calculateNavamsa(planet.longitude);
        const navamsaSignIndex = navamsa.signIndex;

        // Rule 4: Vargottama - +30 Marks
        if (planet.signIndex === navamsaSignIndex) {
            navamsaScore += 30;
            details.push("Vargottama (+30)");
        }

        // Rule 5: Placement in Benefic Houses
        if ([1, 6, 8, 11].includes(navamsaSignIndex)) {
            navamsaScore += 20;
            details.push("Navamsa Benefic Sign (+20)");
        }

        // --- Step C: Final Calculation & Identification ---

        let totalScore = rasiScore + navamsaScore;
        if (totalScore > 100) totalScore = 100;

        // Definition of Subathuva:
        // Usually > 50.
        // For Moon: It is Subathuva if Light > 50 OR if it gets other support (Jupiter/Venus).
        // If it's Dark Moon (Theipirai) and no support -> It's Pavathuva.

        isSubathuva = totalScore >= 50;

        results[planet.name] = {
            planet: planet.name,
            rasiScore: Math.round(rasiScore),
            navamsaScore: Math.round(navamsaScore),
            totalScore: Math.round(totalScore),
            isSubathuva,
            details
        };
    });

    return results;
};

// --- Advanced Prediction Logic (Digbala + Subathuvam + Adhipathiyam) ---

import { SIGN_LORDS, OWN_SIGNS } from './constants';

export interface YogaResult {
    planet: string;
    digbalaScore: number;
    digbalaStatus: string; // "Full", "Partial", "None"
    yogaStatus: string; // "Rajayogam", "Dangerously Strong", "Jackpot", "Severe Trouble", "Good", "Neutral"
    description: string;
}

export const calculateDigbalaAndYogas = (
    planets: any[],
    ascendantSignIndex: number,
    subathuvamResults: Record<string, SubathuvamResult>
): Record<string, YogaResult> => {
    const results: Record<string, YogaResult> = {};

    // 1. Identify Lords
    const lagnadipathi = SIGN_LORDS[ascendantSignIndex];

    // Avayogis: Lords of 6, 8, 12
    const house6Sign = (ascendantSignIndex + 5) % 12;
    const house8Sign = (ascendantSignIndex + 7) % 12;
    const house12Sign = (ascendantSignIndex + 11) % 12;
    const avayogiLords = [
        SIGN_LORDS[house6Sign],
        SIGN_LORDS[house8Sign],
        SIGN_LORDS[house12Sign]
    ];

    // Yogakaraka Check (Planet owning Kendra and Trikona)
    // Kendra: 1, 4, 7, 10 (Indices: 0, 3, 6, 9)
    // Trikona: 1, 5, 9 (Indices: 0, 4, 8)
    // Note: 1st house is both, but usually Yogakaraka refers to another planet.
    const getYogakaraka = () => {
        const yogakarakas: string[] = [];
        Object.entries(OWN_SIGNS).forEach(([planet, signs]) => {
            let hasKendra = false;
            let hasTrikona = false;

            signs.forEach(signIndex => {
                // Calculate house number (1-based) relative to Ascendant
                // House 1 is at index 0 relative to ascendant
                const houseIndex = (signIndex - ascendantSignIndex + 12) % 12; // 0 to 11

                if ([0, 3, 6, 9].includes(houseIndex)) hasKendra = true;
                if ([0, 4, 8].includes(houseIndex)) hasTrikona = true;
            });

            // Exclude Sun and Moon as they own only one sign (cannot own both unless 1st is both)
            // But for Cancer/Leo ascendants, Mars is Yogakaraka.
            // For Taurus/Libra, Saturn is Yogakaraka.
            if (hasKendra && hasTrikona) {
                yogakarakas.push(planet);
            }
        });
        return yogakarakas;
    };
    const yogakarakas = getYogakaraka();

    planets.forEach(planet => {
        // Skip nodes for Digbala usually, but let's process standard planets
        if (['Rahu', 'Ketu'].includes(planet.name)) return;

        // A. Digbala Calculation
        const houseIndex = (planet.signIndex - ascendantSignIndex + 12) % 12;
        const houseNumber = houseIndex + 1; // 1-12

        let digbalaScore = 0;
        let digbalaStatus = "None";

        // Rules
        // Jupiter/Mercury: 1st House
        // Venus/Moon: 4th House
        // Saturn: 7th House
        // Sun/Mars: 10th House

        const checkDigbala = (targetHouse: number) => {
            if (houseNumber === targetHouse) {
                digbalaScore = 30;
                digbalaStatus = "Full";
            } else if (Math.abs(houseNumber - targetHouse) === 1) {
                digbalaScore = 15;
                digbalaStatus = "Partial";
            }
        };

        if (['Jupiter', 'Mercury'].includes(planet.name)) checkDigbala(1);
        else if (['Venus', 'Moon'].includes(planet.name)) checkDigbala(4);
        else if (planet.name === 'Saturn') checkDigbala(7);
        else if (['Sun', 'Mars'].includes(planet.name)) checkDigbala(10);

        // B. Danger vs. Yoga Check
        const isSubathuva = subathuvamResults[planet.name]?.isSubathuva || false;
        const isMalefic = ['Sun', 'Mars', 'Saturn'].includes(planet.name);
        const isBenefic = ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet.name);

        let yogaStatus = "Neutral";
        let description = "";

        if (digbalaScore > 0) {
            if (isMalefic) {
                if (isSubathuva) {
                    yogaStatus = "Rajayogam";
                    description = "Malefic with Digbala + Subathuvam (High Status, Authority)";
                } else {
                    yogaStatus = "Dangerously Strong";
                    description = "Malefic with Digbala WITHOUT Subathuvam (Risk of misuse, ego)";
                }
            } else if (isBenefic) {
                yogaStatus = "Good";
                description = "Benefic with Digbala (Wisdom, Mildness)";
            }
        }

        // C. Adhipathiyam Check
        // Overwrite or append to description based on lordship

        // Yogakaraka
        if (yogakarakas.includes(planet.name)) {
            if (digbalaScore > 0 && isSubathuva) {
                yogaStatus = "Jackpot";
                description = "Yogakaraka with Digbala + Subathuvam (Highest Success)";
            } else if (yogaStatus === "Neutral") {
                yogaStatus = "Good";
                description = "Yogakaraka Planet";
            }
        }
        // Avayogi (6, 8, 12 Lord)
        else if (avayogiLords.includes(planet.name)) {
            // Check if NOT Subathuva (implies Pavathuvam dominance)
            if (digbalaScore > 0 && !isSubathuva) {
                yogaStatus = "Severe Trouble";
                description = "Avayogi with Digbala + Pavathuvam (Severe Trouble)";
            }
        }
        // Lagnadipathi
        else if (planet.name === lagnadipathi) {
            if (digbalaScore > 0) {
                description += " (Lagnadipathi Strong)";
                if (yogaStatus === "Neutral") yogaStatus = "Good";
            }
        }

        results[planet.name] = {
            planet: planet.name,
            digbalaScore,
            digbalaStatus,
            yogaStatus,
            description
        };
    });

    return results;
};

// --- Functional Status & Special Predictions ---

export interface FunctionalStatus {
    planet: string;
    nature: string; // "Yogakaraka", "Benefic", "Malefic", "Maraka", "Neutral"
    roles: string[]; // e.g., ["Lord of 1", "Lord of 5"]
}

export const getFunctionalNature = (ascendantSignIndex: number, language: 'en' | 'ta' = 'en'): Record<string, FunctionalStatus> => {
    const results: Record<string, FunctionalStatus> = {};

    // Translation helper
    const translateNature = (nature: string): string => {
        if (language !== 'ta') return nature;
        const translations: Record<string, string> = {
            'Yogakaraka': 'யோககாரகன்',
            'Benefic': 'சுபன்',
            'Malefic': 'பாபன்',
            'Maraka': 'மாரகன்',
            'Neutral': 'நடுநிலை'
        };
        return translations[nature] || nature;
    };

    const translateRole = (house: number): string => {
        return language === 'ta' ? `${house} வீட்டின் அதிபதி` : `Lord of ${house}`;
    };

    Object.entries(OWN_SIGNS).forEach(([planet, signs]) => {
        const houses = signs.map(sign => (sign - ascendantSignIndex + 12) % 12 + 1);
        const roles = houses.map(h => translateRole(h));

        let nature = "Neutral";

        const hasKendra = houses.some(h => [1, 4, 7, 10].includes(h));
        const hasTrikona = houses.some(h => [1, 5, 9].includes(h));
        const hasBad = houses.some(h => [3, 6, 11].includes(h));
        const hasMaraka = houses.some(h => [2, 7].includes(h));
        const has8or12 = houses.some(h => [8, 12].includes(h));

        // Logic Hierarchy
        if (hasKendra && hasTrikona) {
            nature = "Yogakaraka";
        } else if (hasTrikona) {
            nature = "Benefic";
        } else if (hasBad) {
            nature = "Malefic";
        } else if (hasMaraka) {
            nature = "Maraka";
        } else if (has8or12) {
            // If only 8 or 12 (and not Trikona/Bad), usually Malefic/Neutral
            nature = "Malefic";
        }

        results[planet] = {
            planet,
            nature: translateNature(nature),
            roles
        };
    });

    // Nodes are usually Malefic unless in Kendra/Trikona with Lord
    results['Rahu'] = { planet: 'Rahu', nature: 'Malefic', roles: [] };
    results['Ketu'] = { planet: 'Ketu', nature: 'Malefic', roles: [] };

    return results;
};

export const generateSpecialPredictions = (
    planets: any[],
    ascendantSignIndex: number,
    subathuvamResults: Record<string, SubathuvamResult>,
    currentDasa?: any
): { planet: string; prediction: string; type: string }[] => {
    const predictions: { planet: string; prediction: string; type: string }[] = [];
    const lagnadipathiName = SIGN_LORDS[ascendantSignIndex];
    const lagnadipathi = planets.find(p => p.name === lagnadipathiName);
    const jupiter = planets.find(p => p.name === 'Jupiter');
    const moon = planets.find(p => p.name === 'Moon');
    const saturn = planets.find(p => p.name === 'Saturn');
    const mars = planets.find(p => p.name === 'Mars');
    const sun = planets.find(p => p.name === 'Sun');
    const rahu = planets.find(p => p.name === 'Rahu');
    const venus = planets.find(p => p.name === 'Venus');

    // Helper: partial aspect check (simplified)
    const hasAspect = (target: any, source: any, aspects: number[]) => {
        if (!target || !source) return false;
        const dist = (target.signIndex - source.signIndex + 12) % 12 + 1;
        return aspects.includes(dist);
    };

    planets.forEach(planet => {
        if (['Rahu', 'Ketu'].includes(planet.name)) return;

        const houseIndex = (planet.signIndex - ascendantSignIndex + 12) % 12;
        const houseNumber = houseIndex + 1;
        const isSubathuva = subathuvamResults[planet.name]?.isSubathuva || false;

        // --- 1. Dusthana Rules (6, 8, 12) ---
        if ([6, 8, 12].includes(houseNumber)) {
            // A. Lagna Lord Exception
            if (planet.name === lagnadipathiName) {
                if (isSubathuva) {
                    predictions.push({
                        planet: planet.name,
                        type: 'Lagna Lord in Dusthana',
                        prediction: "Rise to high status after initial struggle (Subathuva protects Lagna Lord)."
                    });
                } else {
                    predictions.push({
                        planet: planet.name,
                        type: 'Lagna Lord in Dusthana',
                        prediction: "Risk of struggles in life structure due to weak Lagna Lord."
                    });
                }
            }

            // B. 8th House (Ayul Sthana)
            if (houseNumber === 8) {
                if (isSubathuva) {
                    predictions.push({
                        planet: planet.name,
                        type: '8th House Subathuva',
                        prediction: "Long life, potential for Unearned Wealth (Insurance/Legacy), Success in Research/Occult."
                    });
                } else if (['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'].includes(planet.name)) {
                    predictions.push({
                        planet: planet.name,
                        type: '8th House Affliction',
                        prediction: "Risk of sudden events, accidents, or financial loss (Malefic in 8th without relief)."
                    });
                }
            }

            // C. 12th House (Viriya Sthana) - Foreign Settlement
            if (houseNumber === 12) {
                // Special Check for Foreign Settlement Case Study
                const hasBeneficAspect = (jupiter && hasAspect(planet, jupiter, [5, 7, 9])) || (venus && hasAspect(planet, venus, [7]));

                if (isSubathuva || hasBeneficAspect) {
                    predictions.push({
                        planet: planet.name,
                        type: 'Foreign Settlement',
                        prediction: "Permanent Foreign Citizenship & Settlement possible (Pure Benefic influence on 12th)."
                    });
                } else if (['Saturn', 'Rahu', 'Ketu'].includes(planet.name)) {
                    predictions.push({
                        planet: planet.name,
                        type: 'Foreign Settlement',
                        prediction: "Struggle abroad or settlement in different state only (Malefic influence on 12th)."
                    });
                }
            }

            // D. 6th House
            if (houseNumber === 6 && isSubathuva) {
                predictions.push({
                    planet: planet.name,
                    type: '6th House Subathuva',
                    prediction: "Success in Service/Job, Victory over enemies, Good immunity."
                });
            }
        }

        // --- 2. Digbala Rules (Existing) ---
        if (planet.name === 'Mars' && houseNumber === 10) {
            predictions.push({
                planet: 'Mars',
                type: 'Digbala (10th)',
                prediction: isSubathuva
                    ? "High Authority, Commander, Real Estate Success (Controlled Power)."
                    : "Aggressive leadership, conflicts (Uncontrolled Power)."
            });
            // Profession Case Study: Mars + Saturn
            if (saturn && (hasAspect(planet, saturn, [3, 7, 10]) || planet.signIndex === saturn.signIndex)) {
                predictions.push({
                    planet: 'Mars',
                    type: 'Profession (Medical/Tech)',
                    prediction: "Medical profession, Surgery, Dentistry, or Engineering (Cutting tools/Machinery)."
                });
            }
        }

        if (planet.name === 'Saturn' && houseNumber === 7) {
            predictions.push({
                planet: 'Saturn',
                type: 'Digbala (7th)',
                prediction: isSubathuva
                    ? "Mass Leader, Public Service, Loyal Partner."
                    : "Delay in marriage, harsh speech, unpopularity."
            });
        }
        if (planet.name === 'Sun' && houseNumber === 10) {
            predictions.push({
                planet: 'Sun',
                type: 'Digbala (10th)',
                prediction: isSubathuva
                    ? "Government High Office, Politics, CEO."
                    : "Egoistic leadership, father conflicts."
            });
        }
        if (planet.name === 'Jupiter' && houseNumber === 1) {
            predictions.push({
                planet: 'Jupiter',
                type: 'Digbala (Lagna)',
                prediction: "Divine Protection, Wisdom, Respect. (Always Good)."
            });
        }
        if (planet.name === 'Venus' && houseNumber === 4) {
            predictions.push({
                planet: 'Venus',
                type: 'Digbala (4th)',
                prediction: "Luxury Vehicles, Mansion, Happiness from Mother."
            });
        }
    });

    // --- 3. Afflicted Full Moon Rule ---
    if (moon && sun) {
        const isWaxing = isWaxingMoon(moon.longitude, sun.longitude);
        // Simple check for Full Moon (approx opposite Sun)
        const elongation = Math.abs(moon.longitude - sun.longitude);
        const isFullMoon = elongation > 160 && elongation < 200; // Approx range

        if (isFullMoon) {
            const hasSaturnAspect = saturn && hasAspect(moon, saturn, [3, 7, 10]);
            const hasRahuKetu = rahu && (moon.signIndex === rahu.signIndex || (rahu.signIndex + 6) % 12 === moon.signIndex); // Conj with Rahu or Ketu
            const hasJupiterRelief = jupiter && hasAspect(moon, jupiter, [5, 7, 9]);

            if ((hasSaturnAspect || hasRahuKetu) && !hasJupiterRelief) {
                predictions.push({
                    planet: 'Moon',
                    type: 'Afflicted Full Moon',
                    prediction: "Risk of mental stress, emotional instability, or water-related issues (Pavathuvam on Full Moon)."
                });
            }
        }
    }

    // --- 4. Inter-Faith Love Rule (Case Study) ---
    if (rahu) {
        const rahuHouseIndex = (rahu.signIndex - ascendantSignIndex + 12) % 12 + 1;
        if ([1, 7].includes(rahuHouseIndex)) {
            predictions.push({
                planet: 'Rahu',
                type: 'Inter-Faith Connections',
                prediction: "Strong tendency for unconventional, inter-religious, or inter-caste relationships (Rahu in 1/7)."
            });
        }
    }

    // --- 5. Progeny Analysis (Case Study) ---
    // 5th House Lord
    const house5SignIndex = (ascendantSignIndex + 4) % 12;
    const lord5Name = SIGN_LORDS[house5SignIndex];
    const lord5 = planets.find(p => p.name === lord5Name);

    if (lord5 && jupiter) {
        const lord5House = (lord5.signIndex - ascendantSignIndex + 12) % 12 + 1;
        const jupiterHouse = (jupiter.signIndex - ascendantSignIndex + 12) % 12 + 1;

        const lord5Afflicted = [6, 8, 12].includes(lord5House) || (rahu && lord5.signIndex === rahu.signIndex);
        const jupiterAfflicted = [6, 8, 12].includes(jupiterHouse) || (rahu && jupiter.signIndex === rahu.signIndex);

        if (lord5Afflicted && jupiterAfflicted) {
            predictions.push({
                planet: 'Jupiter',
                type: 'Progeny (Child Birth)',
                prediction: "Critical Puthira Dosha: Both 5th Lord and Karaka are afflicted. Child birth may require remedies/delay."
            });
        } else if (lord5Afflicted) {
            predictions.push({
                planet: lord5Name,
                type: 'Progeny (Child Birth)',
                prediction: "Delay or challenges in progeny due to 5th Lord affliction."
            });
        } else {
            predictions.push({
                planet: lord5Name,
                type: 'Progeny (Child Birth)',
                prediction: "Favorable conditions for progeny (5th Lord well-placed)."
            });
        }
    }


    // --- 6. Love Breakup & Dasha Rules (New Request) ---
    if (currentDasa) {
        const dasaLordName = currentDasa.maha?.planet || currentDasa.lord;

        // A. Rahu Dasha Love Context
        if (dasaLordName === 'Rahu') {
            const hasLovePlanetConnection = (venus && (rahu?.signIndex === venus.signIndex || hasAspect(rahu, venus, [7]))) ||
                (mars && (rahu?.signIndex === mars.signIndex || hasAspect(rahu, mars, [7])));

            if (hasLovePlanetConnection) {
                predictions.push({
                    planet: 'Rahu',
                    type: 'Love & Relationship (Rahu Dasha)',
                    prediction: "Current Rahu Dasha indicates intense, possibly unconventional romantic involvement. Warning: Relationship may be temporary or fraught with illusion."
                });
            }
        }

        // B. Jupiter Dasha Breakup Context
        if (dasaLordName === 'Jupiter') {
            predictions.push({
                planet: 'Jupiter',
                type: 'Love & Breakup (Jupiter Dasha)',
                prediction: "Jupiter Dasha typically brings a return to traditional values/wisdom. Unconventional relationships started previously (e.g., in Rahu period) often end or face reality check now."
            });
        }
    }

    // C. Saturn + Mars Breakup Indicator (General)
    const house7Sign = (ascendantSignIndex + 6) % 12;
    const house5Sign = (ascendantSignIndex + 4) % 12;

    // Check if Saturn AND Mars influence 7th or 5th
    const influencesHouse = (hSign: number) => {
        if (!saturn || !mars) return false;

        // Saturn Aspect (3, 7, 10 from Saturn)
        const saturnDist = (hSign - saturn.signIndex + 12) % 12 + 1;
        const saturnAspects = [1, 3, 7, 10].includes(saturnDist); // 1 is conjunction

        // Mars Aspect (4, 7, 8 from Mars)
        const marsDist = (hSign - mars.signIndex + 12) % 12 + 1;
        const marsAspects = [1, 4, 7, 8].includes(marsDist);

        return saturnAspects && marsAspects;
    };

    if (influencesHouse(house7Sign) || influencesHouse(house5Sign)) {
        predictions.push({
            planet: 'Saturn', // Attribution to Saturn/Mars
            type: 'Breakup/Conflict Indicator',
            prediction: "Saturn + Mars combined influence on 5th/7th House indicates potential for deep but problematic attachments, conflicts, or breakups."
        });
    }

    // --- 7. Vakram (Retrograde) Rules (New Request) ---
    planets.forEach(planet => {
        if (['Rahu', 'Ketu', 'Sun', 'Moon'].includes(planet.name)) return; // Sun/Moon never Retro, Nodes always

        if (planet.isRetro) {
            const isNaturalMalefic = ['Saturn', 'Mars'].includes(planet.name);
            const isNaturalBenefic = ['Jupiter', 'Venus', 'Mercury'].includes(planet.name);

            // Check Exaltation/Debilitation
            const exalt = EXALTATION_POINTS[planet.name as keyof typeof EXALTATION_POINTS];
            const debilitation = DEBILITATION_POINTS[planet.name as keyof typeof DEBILITATION_POINTS];

            const isExalted = exalt && exalt.sign === planet.signIndex;
            const isDebilitated = debilitation && debilitation.sign === planet.signIndex;

            // Rule 1: Malefic in Vakram -> Benefic
            if (isNaturalMalefic) {
                predictions.push({
                    planet: planet.name,
                    type: 'Retrograde Malefic (Vakram)',
                    prediction: `${planet.name} is Retrograde (Vakram). Rule: A retrograde malefic loses its ability to harm and acts like a benefic. Unexpected success possible.`
                });
            }

            // Rule 2: Benefic in Vakram -> Extremely Strong
            if (isNaturalBenefic) {
                predictions.push({
                    planet: planet.name,
                    type: 'Retrograde Benefic (Vakram)',
                    prediction: `${planet.name} is Retrograde (Vakram). Rule: It gains immense strength (Chesta Bala). If functioning as a malefic for this Lagna, it may cause issues due to excess strength.`
                });
            }

            // Rule 3: Exalted + Retro -> Weak (Debilitated)
            if (isExalted) {
                predictions.push({
                    planet: planet.name,
                    type: 'Exalted Retrograde (Uchcha Vakram)',
                    prediction: `${planet.name} is Exalted but Retrograde. Rule: It acts as if it is Debilitated (Neecha). The strength is nullified.`
                });
            }

            // Rule 4: Debilitated + Retro -> Strong (Exalted / Neecha Banga)
            if (isDebilitated) {
                predictions.push({
                    planet: planet.name,
                    type: 'Debilitated Retrograde (Neecha Vakram)',
                    prediction: `${planet.name} is Debilitated but Retrograde. Rule: It acts as if it is Exalted (Uchcha). Immense power is hidden.`
                });
            }
        }
    });

    return predictions;
};

// --- Rahu-Ketu Analysis (Aditya Guruji Rules) ---

import { isWaxingMoon } from './subathuvam';
import { EXALTATION_POINTS, DEBILITATION_POINTS } from './constants'; // Added DEBILITATION_POINTS

export interface ShadowPlanetResult {
    planet: string;
    houseScore: number;
    subathuvamScore: number;
    soodshumaScore: number;
    totalScore: number;
    prediction: string;
    details: string[];
}

export const calculateRahuKetuStrength = (
    planets: any[],
    ascendantSignIndex: number
): Record<string, ShadowPlanetResult> => {
    const results: Record<string, ShadowPlanetResult> = {};
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    const jupiter = planets.find(p => p.name === 'Jupiter');
    const venus = planets.find(p => p.name === 'Venus');
    const mars = planets.find(p => p.name === 'Mars');

    ['Rahu', 'Ketu'].forEach(planetName => {
        const planet = planets.find(p => p.name === planetName);
        if (!planet) return;

        let houseScore = 0;
        let subathuvamScore = 0;
        let soodshumaScore = 0;
        const details: string[] = [];

        // Step A: House Placement (Sthana Balam)
        const houseIndex = (planet.signIndex - ascendantSignIndex + 12) % 12;
        const houseNumber = houseIndex + 1;

        if ([3, 6, 10, 11].includes(houseNumber)) {
            houseScore = 30;
            details.push(`Upachaya House ${houseNumber} (+30)`);
        } else if ([1, 5, 9].includes(houseNumber)) {
            houseScore = 20;
            details.push(`Trikona House ${houseNumber} (+20)`);
        } else if ([2, 8, 12].includes(houseNumber)) {
            houseScore = 5;
            details.push(`Tricky House ${houseNumber} (+5)`);
        } else {
            // 4, 7 (Kendras not mentioned in prompt as best, assume neutral/moderate)
            // Let's give 10 for Kendra
            if ([4, 7].includes(houseNumber)) {
                houseScore = 10;
                details.push(`Kendra House ${houseNumber} (+10)`);
            }
        }

        // Step B: Subathuvam Check
        // Helper for Conjunction (Same Sign)
        const isConjoined = (p1: any, p2: any) => p1.signIndex === p2.signIndex;

        // Helper for Aspect (Sign Based)
        // Jupiter: 5, 7, 9
        // Mars: 4, 7, 8
        // Venus: 7 (Standard)
        const isAspectedBy = (target: any, source: any, aspects: number[]) => {
            if (!source) return false;
            const signDiff = (target.signIndex - source.signIndex + 12) % 12;
            const dist = signDiff + 1;
            return aspects.includes(dist);
        };

        if (planetName === 'Rahu') {
            // Venus Conj/Aspect (+40)
            if (venus && (isConjoined(planet, venus) || isAspectedBy(planet, venus, [7]))) {
                subathuvamScore += 40;
                details.push("Venus Connection (+40)");
            }
            // Jupiter Conj/Aspect (+30)
            if (jupiter && (isConjoined(planet, jupiter) || isAspectedBy(planet, jupiter, [5, 7, 9]))) {
                subathuvamScore += 30;
                details.push("Jupiter Connection (+30)");
            }
            // Moon Conj (Waxing) (+20)
            if (moon && isConjoined(planet, moon)) {
                if (sun && isWaxingMoon(moon.longitude, sun.longitude)) {
                    subathuvamScore += 20;
                    details.push("Waxing Moon Conjunction (+20)");
                }
            }
        } else { // Ketu
            // Jupiter Conj/Aspect (+40)
            if (jupiter && (isConjoined(planet, jupiter) || isAspectedBy(planet, jupiter, [5, 7, 9]))) {
                subathuvamScore += 40;
                details.push("Jupiter Connection (+40)");
            }
            // Mars Conj/Aspect (+30)
            if (mars && (isConjoined(planet, mars) || isAspectedBy(planet, mars, [4, 7, 8]))) {
                subathuvamScore += 30;
                details.push("Mars Connection (+30)");
            }
        }

        // Step C: Soodshuma Check
        // Dispositor Strength
        const dispositorName = SIGN_LORDS[planet.signIndex];
        const dispositor = planets.find(p => p.name === dispositorName);

        if (dispositor) {
            // Check Ucha (Exaltation)
            const exaltInfo = EXALTATION_POINTS && EXALTATION_POINTS[dispositorName as keyof typeof EXALTATION_POINTS];
            const isExalted = !!(exaltInfo && dispositor.signIndex === exaltInfo.sign);

            // Check Aatchi (Own Sign)
            const ownSigns = OWN_SIGNS && OWN_SIGNS[dispositorName as keyof typeof OWN_SIGNS];
            const isOwnSign = !!(ownSigns && ownSigns.includes(dispositor.signIndex));

            if (isExalted || isOwnSign) {
                soodshumaScore += 20;
                details.push(`Dispositor ${dispositorName} Strong (+20)`);
            }
        }

        // Star Lord
        const nakshatra = getNakshatra(planet.longitude);
        if (nakshatra.index >= 0 && nakshatra.index < NAKSHATRA_LORDS.length) {
            const starLord = NAKSHATRA_LORDS[nakshatra.index];
            if (['Jupiter', 'Venus', 'Mercury'].includes(starLord)) {
                soodshumaScore += 10;
                details.push(`Benefic Star Lord ${starLord} (+10)`);
            }
        }

        // Final Verdict
        const totalScore = houseScore + subathuvamScore + soodshumaScore;
        let prediction = "";

        if (totalScore >= 70) {
            if (planetName === 'Rahu') {
                prediction = "Excellent / Yoga Rahu: Immense wealth, luxury cars, big business, and foreign travel. (Bogan)";
            } else {
                prediction = "Excellent / Yoga Ketu: Supreme wisdom (Gnanam), spiritual rise, or medical/astrology success.";
            }
        } else if (totalScore >= 40) {
            prediction = "Moderate / Mixed: Good results but with some struggle. Sudden gains possible.";
        } else {
            if (planetName === 'Rahu') {
                prediction = "Pavathuvam / Malefic: Addiction, bad friendship, legal issues, or illusion.";
            } else {
                prediction = "Pavathuvam / Malefic: Confusion, detachment, marital trouble.";
            }
        }

        results[planetName] = {
            planet: planetName,
            houseScore,
            subathuvamScore,
            soodshumaScore,
            totalScore,
            prediction,
            details
        };
    });

    return results;
};
