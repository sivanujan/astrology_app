import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';
import { calculateDashaPeriods } from './astrology';

interface PlanetaryStatus {
    planet: string;
    house_from_lagna: number;
    is_subathuvam: boolean;
    subathuvam_source: string | null;
    is_papathuvam: boolean;
    papathuvam_source: string | null;
    strength_score: number;
    is_lagnathipathi: boolean;
}

interface DashaIssue {
    issue: string;
    planet: string;
    period: string; // e.g., "Saturn Dasa - Mars Bhukti"
    age: number;
    year: number;
}

const getHouseFromLagna = (planetSignIndex: number, lagnaSignIndex: number): number => {
    let house = (planetSignIndex - lagnaSignIndex) + 1;
    if (house <= 0) house += 12;
    return house;
};

export const generateGurujiPersonaProfile = (chartData: any, birthDetails: any) => {
    const { planets, ascendant } = chartData;
    const subathuvamResults = calculateAdityaGurujiSubathuvam(planets);

    // Fix: Get Moon Longitude for Dasa Calculation
    const moon = planets.find((p: any) => p.name === 'Moon');
    const moonLon = moon ? (moon.fullDegree || moon.longitude || 0) : 0;

    // Call with correct 2 arguments
    const dasaPeriods = calculateDashaPeriods(new Date(birthDetails.date), moonLon);

    // 1. Lagna & Lagnathipathi
    const SIGN_LORDS = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    const lagnaSignIndex = ascendant.signIndex;
    const lagnathipathiName = SIGN_LORDS[lagnaSignIndex];
    const lagnathipathi = planets.find((p: any) => p.name === lagnathipathiName);
    const lagnaLordSubathuvam = subathuvamResults[lagnathipathiName];

    const lagnathipathiStrength = lagnaLordSubathuvam.isSubathuva ? 'Subathuvam (High)' : (lagnaLordSubathuvam.totalScore > 50 ? 'Moderate' : 'Weak/Papathuvam');

    // 2. Planetary Status
    const planetaryStatus: PlanetaryStatus[] = planets.map((p: any) => {
        const res = subathuvamResults[p.name];
        if (!res) return null;

        const house = getHouseFromLagna(p.signIndex, lagnaSignIndex);

        return {
            planet: p.name,
            house_from_lagna: house,
            is_subathuvam: res.isSubathuva,
            subathuvam_source: res.details.filter(d => d.includes('Jupiter') || d.includes('Venus') || d.includes('Mercury')).join(', ') || ((res.isSubathuva ? 'Natural Strength' : null)),
            is_papathuvam: !res.isSubathuva && res.totalScore < 40,
            papathuvam_source: !res.isSubathuva ? 'Malefic Influence/Weakness' : null,
            strength_score: res.totalScore,
            is_lagnathipathi: p.name === lagnathipathiName
        };
    }).filter(Boolean);

    // 3. Current Dasa
    const currentDasa = dasaPeriods.find((d: any) => {
        const now = new Date();
        return new Date(d.startDate) <= now && new Date(d.endDate) >= now;
    });

    // 4. Age-Based "Shocking" Truths
    const birthYear = new Date(birthDetails.date).getFullYear();
    const shockingEvents: DashaIssue[] = [];

    // Helper to find periods in age range
    const findPeriodsInAge = (minAge: number, maxAge: number) => {
        return dasaPeriods.filter((d: any) => {
            const startAge = new Date(d.startDate).getFullYear() - birthYear;
            const endAge = new Date(d.endDate).getFullYear() - birthYear;
            return (startAge <= maxAge && endAge >= minAge);
        });
    };

    // A. Childhood Health (Age 0-7): 6th Lord Afflicted + Dasa/Bhukti
    const house6SignIndex = (lagnaSignIndex + 5) % 12;
    const lord6Name = SIGN_LORDS[house6SignIndex];
    const lord6Status = planetaryStatus.find(p => p?.planet === lord6Name);

    if (lord6Status && lord6Status.is_papathuvam) {
        // Find Dasa OR Bhukti
        const periods = findPeriodsInAge(0, 7);
        const match = periods.find((d: any) => {
            if (d.planet === lord6Name) return true;
            if (d.subPeriods && d.subPeriods.some((sub: any) => sub.planet === lord6Name)) return true;
            return false;
        });

        if (match) {
            shockingEvents.push({
                issue: "Childhood Health/Survival Struggle",
                planet: lord6Name,
                period: `${match.planet} Dasa (Early Life)`,
                age: new Date(match.startDate).getFullYear() - birthYear,
                year: new Date(match.startDate).getFullYear()
            });
        }
    }

    // New: Broad Bhukti Analysis for Shocking Events (Any Age)
    // We scan all Dasas and their Bhuktis to find 'Peak' negative periods
    dasaPeriods.forEach((maha: any) => {
        if (!maha.subPeriods) return;

        maha.subPeriods.forEach((bhukti: any) => {
            const bhuktiPlanet = bhukti.planet;
            const bhuktiStartYear = new Date(bhukti.startDate).getFullYear();
            const ageAtStart = bhuktiStartYear - birthYear;

            // Skip future events beyond simple prediction (keep it historical or near future)
            // But user wants "Who Am I" which creates a persona based on past mostly.
            // Let's look for specific signatures.

            // 1. 8th Lord Bhukti (Sudden Falls/Accidents/Insults)
            const house8SignIndex = (lagnaSignIndex + 7) % 12;
            const lord8Name = SIGN_LORDS[house8SignIndex];

            if (bhuktiPlanet === lord8Name) {
                // If 8th lord is also Papathuvam, it's a confirmed shock
                const pStatus = planetaryStatus.find(p => p?.planet === bhuktiPlanet);
                if (pStatus && pStatus.is_papathuvam) {
                    shockingEvents.push({
                        issue: "Sudden Downfall/Humiliation (8th Lord)",
                        planet: bhuktiPlanet,
                        period: `${maha.planet}-${bhuktiPlanet}`,
                        age: ageAtStart,
                        year: bhuktiStartYear
                    });
                }
            }

            // 2. Rahu/Ketu - Change of Place/Mind
            if ((bhuktiPlanet === 'Rahu' || bhuktiPlanet === 'Ketu') && ageAtStart > 10) {
                // Check if they are afflicted
                const pStatus = planetaryStatus.find(p => p?.planet === bhuktiPlanet);
                if (pStatus && pStatus.is_papathuvam) {
                    shockingEvents.push({
                        issue: "Major Life Shift/Confusion",
                        planet: bhuktiPlanet,
                        period: `${maha.planet}-${bhuktiPlanet}`,
                        age: ageAtStart,
                        year: bhuktiStartYear
                    });
                }
            }
        });
    });

    // Sort events by year
    shockingEvents.sort((a, b) => a.year - b.year);

    // E. Recurring Struggle (6th/8th Lord Bhuktis) - Keep simple list of years
    const house8SignIndex = (lagnaSignIndex + 7) % 12;
    // Start of new dasha_timeline generation
    const dasha_timeline_raw = dasaPeriods.flatMap((maha: any) => {
        if (!maha.subPeriods) return [];
        return maha.subPeriods.map((bhukti: any) => {
            const startYear = new Date(bhukti.startDate).getFullYear();

            // Get details for Bhukti Lord
            const bhuktiLordStatus = planetaryStatus.find((p: any) => p?.planet === bhukti.planet);

            return {
                year: startYear,
                dasha: maha.planet,
                bhukti: bhukti.planet,
                bhukti_lord_position_from_lagna: bhuktiLordStatus?.house_from_lagna || 0,
                // AI expects "Papathuvam" or "Subathuvam" directly
                bhukti_lord_status: bhuktiLordStatus?.is_subathuvam ? "Subathuvam" : bhuktiLordStatus?.is_papathuvam ? "Papathuvam" : "Neutral"
            };
        });
    }).sort((a: any, b: any) => a.year - b.year)
        .filter((item: any) => {
            const age = item.year - birthYear;
            return item.year <= new Date().getFullYear() && age >= 12; // Filter Age < 12 per request
        });

    // Identify 6th, 8th, 12th lords for the AI context
    const getLordOf = (houseNum: number) => SIGN_LORDS[(lagnaSignIndex + houseNum - 1) % 12];

    const lord8Name = SIGN_LORDS[house8SignIndex];

    const struggleYears = dasaPeriods
        .flatMap((maha: any) => {
            return maha.subPeriods?.filter((bhukti: any) => bhukti.planet === lord6Name || bhukti.planet === lord8Name) || [];
        })
        .map((bhukti: any) => new Date(bhukti.startDate).getFullYear())
        .filter((val, index, self) => self.indexOf(val) === index) // Unique years
        .sort();

    // Generate planetary_traits for AI "Deep Scan" (Previous) -> Mapped to new planetary_scan

    // Helper to calculate Aspects
    const getAspectsToPlanet = (targetHouse: number) => {
        const aspects: string[] = [];
        planets.forEach((p: any) => {
            const sourceHouse = getHouseFromLagna(p.signIndex, lagnaSignIndex);
            const dist = (targetHouse - sourceHouse + 12) % 12 || 12; // Distance from source to target

            // Jupiter: 5, 7, 9
            if (p.name === 'Jupiter' && [5, 7, 9].includes(dist)) aspects.push(`Jupiter (${dist}th Aspect)`);
            // Saturn: 3, 7, 10
            if (p.name === 'Saturn' && [3, 7, 10].includes(dist)) aspects.push(`Saturn (${dist}th Aspect)`);
            // Mars: 4, 7, 8
            if (p.name === 'Mars' && [4, 7, 8].includes(dist)) aspects.push(`Mars (${dist}th Aspect)`);
            // All Planets: 7th aspect
            if (!['Jupiter', 'Saturn', 'Mars', 'Rahu', 'Ketu'].includes(p.name) && dist === 7) {
                aspects.push(`${p.name} (7th Aspect)`);
            }
        });
        return aspects;
    };

    const ninePlanetMap: Record<string, string> = {
        'Sun': 'Soul/Ego',
        'Moon': 'Mind/Emotions',
        'Mars': 'Anger/Energy',
        'Mercury': 'Intellect/Speech',
        'Jupiter': 'Wisdom/Wealth',
        'Venus': 'Luxury/Desire',
        'Saturn': 'Work/Karma',
        'Rahu': 'Obsession/Unconventional',
        'Ketu': 'Detachment/Spirituality'
    };

    const planetary_scan = Object.keys(ninePlanetMap).map(pName => {
        const p = planetaryStatus.find((ps: any) => ps?.planet === pName);
        if (!p) return null;

        const aspects = getAspectsToPlanet(p.house_from_lagna);
        const status = p.is_subathuvam ? "Subathuvam (Positive)" : p.is_papathuvam ? "Papathuvam (Negative)" : "Neutral";

        // Special check for "Strong" Venus if score is high but not strictly subathuva
        const finalStatus = (pName === 'Venus' && p.strength_score > 60) ? "Strong" : status;

        return {
            planet: pName,
            role: ninePlanetMap[pName],
            house: p.house_from_lagna,
            status: finalStatus,
            aspects_received: aspects
        };
    }).filter(Boolean);

    return {
        user_identity: {
            lagna: ascendant.signName,
            lagna_lord_strength: lagnathipathiStrength.includes('Weak') ? 'Weak' : 'Strong',
            moon_status: (() => {
                const m = planetaryStatus.find((p: any) => p.planet === 'Moon');
                return m?.is_subathuvam ? "Subathuvam" : m?.is_papathuvam ? "Papathuvam" : "Neutral";
            })()
        },
        planetary_scan: planetary_scan,
        dasha_timeline_raw: dasha_timeline_raw,
        shocking_events: shockingEvents,
        struggle_years: struggleYears
    };
};
