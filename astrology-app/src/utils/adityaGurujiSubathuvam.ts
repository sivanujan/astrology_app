import { calculateNavamsa, getNakshatra, NAKSHATRA_LORDS } from './astrology';

export interface SubathuvamResult {
    planet: string;
    rasiScore: number;
    navamsaScore: number;
    totalScore: number;
    isSubathuva: boolean;
    details: string[];
}

export const calculateAdityaGurujiSubathuvam = (rasiPlanets: any[]): Record<string, SubathuvamResult> => {
    const results: Record<string, SubathuvamResult> = {};
    const jupiter = rasiPlanets.find(p => p.name === 'Jupiter');
    const venus = rasiPlanets.find(p => p.name === 'Venus');

    rasiPlanets.forEach(planet => {
        let rasiScore = 0;
        let navamsaScore = 0;
        const details: string[] = [];

        // --- Step A: Rasi Chart Subathuvam (Base Strength) ---

        // Rule 1: Jupiter's Aspect (Guru Drishti) - +40 Marks
        // Check if Jupiter aspects the target planet (5th, 7th, 9th house from Jupiter).
        if (jupiter && planet.name !== 'Jupiter') {
            // Calculate house distance (1-based)
            const signDiff = (planet.signIndex - jupiter.signIndex + 12) % 12;
            const houseDist = signDiff + 1;

            if ([5, 7, 9].includes(houseDist)) {
                rasiScore += 40;
                details.push("Jupiter Aspect (+40)");
            }
        }

        // Rule 2: Conjunction with Benefics - +20 Marks
        // Check if target is in the same sign as Jupiter or Venus.
        if (planet.name !== 'Jupiter' && jupiter && planet.signIndex === jupiter.signIndex) {
            rasiScore += 20;
            details.push("Conjoined Jupiter (+20)");
        }
        if (planet.name !== 'Venus' && venus && planet.signIndex === venus.signIndex) {
            rasiScore += 20;
            details.push("Conjoined Venus (+20)");
        }

        // Rule 3: Star Lord (Nakshatra) - +10 Marks
        // If the planet is in the Star of Jupiter or Venus.
        const nakshatraInfo = getNakshatra(planet.longitude);
        // Safety check for index
        if (nakshatraInfo.index >= 0 && nakshatraInfo.index < NAKSHATRA_LORDS.length) {
            const starLord = NAKSHATRA_LORDS[nakshatraInfo.index];
            if (['Jupiter', 'Venus'].includes(starLord)) {
                rasiScore += 10;
                details.push(`Star of ${starLord} (+10)`);
            }
        }

        // --- Step B: Navamsa Chart Subathuvam (Hidden Strength) ---

        const navamsa = calculateNavamsa(planet.longitude);
        const navamsaSignIndex = navamsa.signIndex;

        // Rule 4: Vargottama - +30 Marks
        // Compare rasi_positions[Planet].Sign_ID AND navamsa_positions[Planet].Sign_ID.
        if (planet.signIndex === navamsaSignIndex) {
            navamsaScore += 30;
            details.push("Vargottama (+30)");
        }

        // Rule 5: Placement in Benefic Houses - +20 Marks
        // IF Sign ID is 2 or 7 (Venus) OR 9 or 12 (Jupiter)
        // 0-based indices: Taurus(1), Libra(6), Sagittarius(8), Pisces(11)
        if ([1, 6, 8, 11].includes(navamsaSignIndex)) {
            navamsaScore += 20;
            details.push("Navamsa Benefic Sign (+20)");
        }

        // --- Step C: Final Calculation & Identification ---

        let totalScore = rasiScore + navamsaScore;
        if (totalScore > 100) totalScore = 100;

        results[planet.name] = {
            planet: planet.name,
            rasiScore,
            navamsaScore,
            totalScore,
            isSubathuva: totalScore >= 50,
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

export const getFunctionalNature = (ascendantSignIndex: number): Record<string, FunctionalStatus> => {
    const results: Record<string, FunctionalStatus> = {};

    Object.entries(OWN_SIGNS).forEach(([planet, signs]) => {
        const houses = signs.map(sign => (sign - ascendantSignIndex + 12) % 12 + 1);
        const roles = houses.map(h => `Lord of ${h}`);

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
            nature,
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
    subathuvamResults: Record<string, SubathuvamResult>
): { planet: string; prediction: string; type: string }[] => {
    const predictions: { planet: string; prediction: string; type: string }[] = [];

    planets.forEach(planet => {
        if (['Rahu', 'Ketu'].includes(planet.name)) return;

        const houseIndex = (planet.signIndex - ascendantSignIndex + 12) % 12;
        const houseNumber = houseIndex + 1;
        const isSubathuva = subathuvamResults[planet.name]?.isSubathuva || false;

        // 1. Mars in 10th (Digbala)
        if (planet.name === 'Mars' && houseNumber === 10) {
            if (isSubathuva) {
                predictions.push({
                    planet: 'Mars',
                    type: 'Special Placement (10th House)',
                    prediction: "High Authority, IAS/IPS, Commander, Successful Real Estate Entrepreneur. (Controlled Power)"
                });
            } else {
                predictions.push({
                    planet: 'Mars',
                    type: 'Special Placement (10th House)',
                    prediction: "Cruel Police, Sadistic Boss, Criminal tendencies, Accidents. (Uncontrolled Power)"
                });
            }
        }

        // 2. Saturn in 7th (Digbala)
        if (planet.name === 'Saturn' && houseNumber === 7) {
            if (isSubathuva) {
                predictions.push({
                    planet: 'Saturn',
                    type: 'Special Placement (7th House)',
                    prediction: "Mass Leader, Justice, Public Service, Loyal Partner. (Benefic Saturn)"
                });
            } else {
                predictions.push({
                    planet: 'Saturn',
                    type: 'Special Placement (7th House)',
                    prediction: "Lazy, Delay in Marriage, Harsh Speech, Unpopular. (Malefic Saturn)"
                });
            }
        }

        // 3. Sun in 10th (Digbala)
        if (planet.name === 'Sun' && houseNumber === 10) {
            if (isSubathuva) {
                predictions.push({
                    planet: 'Sun',
                    type: 'Special Placement (10th House)',
                    prediction: "Government High Office, Politics, CEO, Father's Support. (Royal Status)"
                });
            } else {
                predictions.push({
                    planet: 'Sun',
                    type: 'Special Placement (10th House)',
                    prediction: "Egoistic Leader, Conflicts with Authority, Trouble to Father."
                });
            }
        }

        // 4. Guru in 1st (Digbala)
        if (planet.name === 'Jupiter' && houseNumber === 1) {
            predictions.push({
                planet: 'Jupiter',
                type: 'Special Placement (Lagna)',
                prediction: "Divine Protection, Wisdom, Respect, General Happiness. (Digbala Jupiter is always good)"
            });
        }

        // 5. Venus in 4th (Digbala)
        if (planet.name === 'Venus' && houseNumber === 4) {
            predictions.push({
                planet: 'Venus',
                type: 'Special Placement (4th House)',
                prediction: "Luxury Vehicles, Mansion, Happiness from Mother, Artistic Success."
            });
        }
    });

    return predictions;
};
