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
            // Check Maha Dasa
            if (d.planet === lord6Name) return true;
            // Check Bhukti (subPeriods)
            if (d.subPeriods && d.subPeriods.some((sub: any) => sub.planet === lord6Name)) return true;
            return false;
        });

        if (match) {
            shockingEvents.push({
                issue: "Childhood Health/Balarishtam",
                planet: lord6Name,
                period: `${match.planet} Dasa`,
                age: new Date(match.startDate).getFullYear() - birthYear,
                year: new Date(match.startDate).getFullYear()
            });
        }
    }

    // B. Education Break (Age 17-22): 4th Lord or Mercury Afflicted
    const house4SignIndex = (lagnaSignIndex + 3) % 12;
    const lord4Name = SIGN_LORDS[house4SignIndex];
    const lord4Status = planetaryStatus.find(p => p?.planet === lord4Name);
    const mercuryStatus = planetaryStatus.find(p => p?.planet === 'Mercury');

    if ((lord4Status && lord4Status.is_papathuvam) || (mercuryStatus && mercuryStatus.is_papathuvam)) {
        const periods = findPeriodsInAge(17, 22);
        const match = periods.find((d: any) => {
            const isLord4Start = d.planet === lord4Name || d.subPeriods?.some((sub: any) => sub.planet === lord4Name);
            const isMercStart = d.planet === 'Mercury' || d.subPeriods?.some((sub: any) => sub.planet === 'Mercury');

            return (lord4Status?.is_papathuvam && isLord4Start) || (mercuryStatus?.is_papathuvam && isMercStart);
        });

        if (match) {
            shockingEvents.push({
                issue: "Education Struggle/Break",
                planet: match.planet,
                period: `${match.planet} Dasa`,
                age: new Date(match.startDate).getFullYear() - birthYear,
                year: new Date(match.startDate).getFullYear()
            });
        }
    }

    // C. Father Issues (Age < 15): Sun Afflicted
    const sunStatus = planetaryStatus.find(p => p?.planet === 'Sun');
    if (sunStatus && sunStatus.is_papathuvam) {
        const periods = findPeriodsInAge(0, 15);
        const match = periods.find((d: any) => d.planet === 'Sun' || d.subPeriods?.some((sub: any) => sub.planet === 'Sun'));

        if (match) {
            shockingEvents.push({
                issue: "Father Separation/Issues",
                planet: "Sun",
                period: `${match.planet} Dasa`,
                age: new Date(match.startDate).getFullYear() - birthYear,
                year: new Date(match.startDate).getFullYear()
            });
        }
    }

    // D. Mother Issues (Age < 15): Moon Afflicted
    const moonStatus = planetaryStatus.find(p => p?.planet === 'Moon');
    if (moonStatus && moonStatus.is_papathuvam) {
        const periods = findPeriodsInAge(0, 15);
        const match = periods.find((d: any) => d.planet === 'Moon' || d.subPeriods?.some((sub: any) => sub.planet === 'Moon'));

        if (match) {
            shockingEvents.push({
                issue: "Mother Health/Issues",
                planet: "Moon",
                period: `${match.planet} Dasa`,
                age: new Date(match.startDate).getFullYear() - birthYear,
                year: new Date(match.startDate).getFullYear()
            });
        }
    }

    // E. Recurring Struggle (6th/8th Lord Bhuktis)
    const house8SignIndex = (lagnaSignIndex + 7) % 12;
    const lord8Name = SIGN_LORDS[house8SignIndex];

    // Check ALL dasa periods for sub-periods of 6th/8th lord
    const struggleYears = dasaPeriods
        .flatMap((maha: any) => {
            return maha.subPeriods?.filter((bhukti: any) => bhukti.planet === lord6Name || bhukti.planet === lord8Name) || [];
        })
        .map((bhukti: any) => new Date(bhukti.startDate).getFullYear())
        .filter((val, index, self) => self.indexOf(val) === index) // Unique years
        .sort();

    return {
        user_profile: {
            lagna: ascendant.signName,
            lagnathipathi: lagnathipathiName,
            lagnathipathi_strength: lagnathipathiStrength,
            rasi: planets.find((p: any) => p.name === 'Moon')?.signName || 'Unknown',
            star: birthDetails.nakshatra || 'Unknown'
        },
        planetary_status: planetaryStatus,
        current_dasha: {
            lord: currentDasa?.planet || 'Unknown',
            status: subathuvamResults[currentDasa?.planet || '']?.isSubathuva ? 'Subathuvam' : 'Papathuvam/Average',
            house_ownership: 'Calculated by AI'
        },
        shocking_events: shockingEvents,
        struggle_years: struggleYears
    };
};
