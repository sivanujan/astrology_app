import {
    Observer,
    Body,
    Vector,
    Equator,
    Ecliptic,
    SiderealTime
} from 'astronomy-engine';
import * as Astronomy from 'astronomy-engine';
import {
    PLANET_RELATIONSHIPS,
    EXALTATION_POINTS,
    DEBILITATION_POINTS,
    OWN_SIGNS,
    SIGN_LORDS,
    PLANETS
} from './constants';

// --- Advanced Calculation Functions ---

// 1. Calculate Planetary Dignity
export const calculateDignity = (planet: string, signIndex: number, degree: number, allPlanets: any[]) => {
    // Exaltation
    const exalt = EXALTATION_POINTS[planet as keyof typeof EXALTATION_POINTS];
    if (exalt && exalt.sign === signIndex) {
        // Check deep exaltation (within 5 degrees)
        if (Math.abs(degree - exalt.degree) <= 5) return 'exalted'; // Deep exaltation
        return 'exalted';
    }

    // Debilitation
    const debilitation = DEBILITATION_POINTS[planet as keyof typeof DEBILITATION_POINTS];
    if (debilitation && debilitation.sign === signIndex) {
        return 'debilitated';
    }

    // Own Sign
    const ownSigns = OWN_SIGNS[planet as keyof typeof OWN_SIGNS];
    if (ownSigns && ownSigns.includes(signIndex)) {
        return 'ownSign';
    }

    // Friendship/Enmity
    const signLord = SIGN_LORDS[signIndex];

    // If planet is in sign of a friend
    const relationships = PLANET_RELATIONSHIPS[planet as keyof typeof PLANET_RELATIONSHIPS];
    if (relationships) {
        if (relationships.friends.includes(signLord)) {
            // Check for Adhi Mithra (Temporary friendship due to placement)
            // Temporary friend: Planet in 2, 3, 4, 10, 11, 12 from planet
            // For simplicity, we'll stick to natural friendship first, or implement compound later
            return 'friend';
        }
        if (relationships.enemies.includes(signLord)) {
            return 'enemy';
        }
    }

    return 'neutral';
};

// 2. Check Neecha Bhanga (Cancellation of Debilitation)
export const checkNeechaBhanga = (planet: any, allPlanets: any[], ascendant: any) => {
    if (calculateDignity(planet.name, planet.signIndex, planet.degree, allPlanets) !== 'debilitated') {
        return false;
    }

    const signLordName = SIGN_LORDS[planet.signIndex];
    const signLord = allPlanets.find(p => p.name === signLordName);

    const exaltationSignIndex = EXALTATION_POINTS[planet.name as keyof typeof EXALTATION_POINTS]?.sign;
    const exaltationLordName = SIGN_LORDS[exaltationSignIndex];
    const exaltationLord = allPlanets.find(p => p.name === exaltationLordName);

    // Condition 1: Sign Lord in Kendra from Lagna or Moon
    const moon = allPlanets.find(p => p.name === 'Moon');

    const isKendra = (p: any, ref: any) => {
        if (!p || !ref) return false;
        const house = (p.signIndex - ref.signIndex + 12) % 12 + 1;
        return [1, 4, 7, 10].includes(house);
    };

    if (isKendra(signLord, ascendant) || isKendra(signLord, moon)) return true;

    // Condition 2: Exaltation Lord in Kendra from Lagna or Moon
    if (isKendra(exaltationLord, ascendant) || isKendra(exaltationLord, moon)) return true;

    // Condition 3: Aspect from Exalted Planet (Simplified check)
    // This requires full aspect calculation logic, which we'll add below.

    // Condition 4: Parivartana with Sign Lord
    // If sign lord is in the debilitated planet's sign (which is impossible if it's debilitated, unless exchange)
    // Actually, if Planet A is in Sign B (debilitated) and Planet B is in Sign A.
    // Example: Sun in Libra (Debilitated), Venus in Leo.
    if (signLord) {
        const signLordOwnSigns = OWN_SIGNS[signLord.name as keyof typeof OWN_SIGNS];
        if (signLordOwnSigns && signLordOwnSigns.includes(planet.signIndex)) {
            // Wait, Parivartana is mutual exchange.
            // Planet A is in Sign B. Planet B is in Sign A.
            // Planet A is 'planet'. Sign B is 'planet.signIndex'. Lord of Sign B is 'signLord'.
            // We need to check if 'signLord' is in a sign owned by 'planet'.
            const planetOwnSigns = OWN_SIGNS[planet.name as keyof typeof OWN_SIGNS];
            if (planetOwnSigns && planetOwnSigns.includes(signLord.signIndex)) {
                return true;
            }
        }
    }
    return false;
};

// 3. Check Parivartana Yoga
export const checkParivartana = (allPlanets: any[]) => {
    const exchanges: { p1: string; p2: string }[] = [];

    for (let i = 0; i < allPlanets.length; i++) {
        for (let j = i + 1; j < allPlanets.length; j++) {
            const p1 = allPlanets[i];
            const p2 = allPlanets[j];

            // Skip Rahu and Ketu for Parivartana
            if (['Rahu', 'Ketu'].includes(p1.name) || ['Rahu', 'Ketu'].includes(p2.name)) continue;

            // P1 in P2's sign
            const p2OwnSigns = OWN_SIGNS[p2.name as keyof typeof OWN_SIGNS] || [];
            const p1InP2Sign = p2OwnSigns.includes(p1.signIndex);

            // P2 in P1's sign
            const p1OwnSigns = OWN_SIGNS[p1.name as keyof typeof OWN_SIGNS] || [];
            const p2InP1Sign = p1OwnSigns.includes(p2.signIndex);

            if (p1InP2Sign && p2InP1Sign) {
                exchanges.push({ p1: p1.name, p2: p2.name });
            }
        }
    }
    return exchanges;
};

// 4. Calculate Planetary Strength (Simplified Shadbala-like)
export const calculateStrength = (planet: any, ascendant: any, timeOfDay: 'day' | 'night' = 'day') => {
    let points = 0;
    const maxPoints = 10;

    // 1. Sthana Bala (Positional) - based on Dignity
    // We need to pass allPlanets to calculateDignity, but here we might not have it easily available in this signature.
    // Let's assume we call this with dignity already known or calculate it.
    // For now, let's just use a simplified dignity check or require dignity as input.
    // Refactoring to take dignity as input would be better, but let's re-calculate for now.
    // We need allPlanets for dignity... let's adjust signature later or assume basic dignity.

    // Let's assume we can get dignity from context or pass it.
    // For this implementation, we will return a raw score based on available data.

    return points; // Placeholder, will implement full logic in component or helper
};

// 5. Calculate Aspects
// 5. Calculate Aspects
export const calculateAspects = (planet: any, allPlanets: any[]) => {
    const aspects: {
        type: string;
        strength: number;
        signIndex: number;
        planets: string[]
    }[] = [];
    const planetSign = planet.signIndex;

    // Define aspect rules based on planet
    let aspectRules: { offset: number; strength: number }[] = [];

    switch (planet.name) {
        case 'Mars':
            aspectRules = [
                { offset: 3, strength: 75 },  // 4th
                { offset: 6, strength: 100 }, // 7th
                { offset: 7, strength: 75 }   // 8th
            ];
            break;
        case 'Jupiter':
            aspectRules = [
                { offset: 4, strength: 75 },  // 5th
                { offset: 6, strength: 100 }, // 7th
                { offset: 8, strength: 75 }   // 9th
            ];
            break;
        case 'Saturn':
            aspectRules = [
                { offset: 2, strength: 75 },  // 3rd
                { offset: 6, strength: 100 }, // 7th
                { offset: 9, strength: 75 }   // 10th
            ];
            break;
        case 'Rahu':
        case 'Ketu':
            aspectRules = [
                { offset: 6, strength: 100 }  // 7th only
            ];
            break;
        default:
            // Sun, Moon, Mercury, Venus
            aspectRules = [
                { offset: 6, strength: 100 }  // 7th
            ];
            break;
    }

    // Calculate aspects for each rule
    aspectRules.forEach(rule => {
        const targetSignIndex = (planetSign + rule.offset) % 12;

        // Find planets in this sign
        const planetsInSign = allPlanets
            .filter(p => p.signIndex === targetSignIndex && p.name !== planet.name)
            .map(p => p.name);

        aspects.push({
            type: `${rule.offset + 1}th`,
            strength: rule.strength,
            signIndex: targetSignIndex,
            planets: planetsInSign
        });
    });

    return aspects;
};

// Approximate Lahiri Ayanamsa calculation
// Based on 23° 51' 11" at J2000 (Jan 1 2000, 12:00 UTC)
// Precession rate approx 50.29 arcseconds per year
export const getLahiriAyanamsa = (date: Date): number => {
    const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const daysSinceJ2000 = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);
    const yearsSinceJ2000 = daysSinceJ2000 / 365.25;

    // Base Ayanamsa at J2000: 23.853 degrees (23° 51' 11")
    const baseAyanamsa = 23.853;
    const rate = 50.29 / 3600; // degrees per year

    return baseAyanamsa + (yearsSinceJ2000 * rate);
};

export const calculatePlanetaryPositions = (date: Date, lat: number, lng: number) => {
    const ayanamsa = getLahiriAyanamsa(date);
    const observer = new Observer(lat, lng, 0);

    const bodies = [
        Body.Sun, Body.Moon, Body.Mars, Body.Mercury,
        Body.Jupiter, Body.Venus, Body.Saturn
    ];

    const positions: { name: string; longitude: number; signIndex: number; degree: number }[] = bodies.map(body => {
        // Use GeoVector to get geocentric position vector
        const vector = Astronomy.GeoVector(body, date, true);
        // Convert to Ecliptic coordinates
        const ecliptic = Astronomy.Ecliptic(vector);

        // Convert to Sidereal
        let lon = ecliptic.elon - ayanamsa;
        if (lon < 0) lon += 360;

        return {
            name: body,
            longitude: lon,
            signIndex: Math.floor(lon / 30),
            degree: lon % 30
        };
    });

    // Ascendant Calculation
    // We need the Local Sidereal Time (LST)
    const gst = SiderealTime(date);
    const lst = (gst + lng / 15.0) % 24;
    const ramc = lst * 15.0; // Right Ascension of Medium Coeli

    // Obliquity of Ecliptic
    // Use Sun's position to get current obliquity or just use standard J2000
    const sunVector = Astronomy.GeoVector(Body.Sun, date, true);
    const eps = Astronomy.Ecliptic(sunVector).elat; // This gives latitude, not obliquity.
    // Actually, Ecliptic function returns { elon, elat }.
    // Obliquity is the tilt of Earth's axis.
    // Astronomy engine has `Obliquity` function? No.
    // But we can use a standard value or calculate it.
    // Let's use standard 23.439 degrees.
    const obliquity = 23.439;

    const rad = Math.PI / 180;
    const ramcRad = ramc * rad;
    const epsRad = obliquity * rad;
    const latRad = lat * rad;

    const num = Math.cos(ramcRad);
    const den = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

    let ascRad = Math.atan2(num, den);
    let ascDeg = ascRad / rad;
    if (ascDeg < 0) ascDeg += 360;

    // Adjust for Sidereal
    let ascSidereal = ascDeg - ayanamsa;
    if (ascSidereal < 0) ascSidereal += 360;

    const ascendant = {
        name: "Ascendant",
        longitude: ascSidereal,
        signIndex: Math.floor(ascSidereal / 30),
        degree: ascSidereal % 30
    };

    // Rahu/Ketu - Simplified for now (Mean Node)
    const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const T = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24 * 36525);
    let nodeMean = 125.04452 - 1934.136261 * T;
    nodeMean = nodeMean % 360;
    if (nodeMean < 0) nodeMean += 360;

    let rahuSidereal = nodeMean - ayanamsa;
    if (rahuSidereal < 0) rahuSidereal += 360;

    let ketuSidereal = (rahuSidereal + 180) % 360;

    positions.push({
        name: "Rahu",
        longitude: rahuSidereal,
        signIndex: Math.floor(rahuSidereal / 30),
        degree: rahuSidereal % 30
    });

    positions.push({
        name: "Ketu",
        longitude: ketuSidereal,
        signIndex: Math.floor(ketuSidereal / 30),
        degree: ketuSidereal % 30
    });

    return {
        ascendant,
        planets: positions,
        ayanamsa
    };
};

export const getNakshatra = (longitude: number) => {
    const nakshatraSpan = 13.333333; // 13 degrees 20 minutes
    const index = Math.floor(longitude / nakshatraSpan);
    const pada = Math.floor((longitude % nakshatraSpan) / 3.333333) + 1;
    return { index, pada };
};

// Vimshottari Dasha Constants
export const DASHA_YEARS: Record<string, number> = {
    Ketu: 7,
    Venus: 20,
    Sun: 6,
    Moon: 10,
    Mars: 7,
    Rahu: 18,
    Jupiter: 16,
    Saturn: 19,
    Mercury: 17
};

export const DASHA_ORDER = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export const PLANET_COLORS: Record<string, string> = {
    Ketu: '#8B4513',
    Venus: '#FF69B4',
    Sun: '#FF6347',
    Moon: '#C0C0C0',
    Mars: '#DC143C',
    Rahu: '#2C3E50',
    Jupiter: '#FFD700',
    Saturn: '#4169E1',
    Mercury: '#32CD32'
};

export const NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export interface DashaPeriod {
    planet: string;
    startDate: Date;
    endDate: Date;
    durationYears: number;
    subPeriods?: DashaPeriod[];
    level: 'Maha' | 'Bhukti' | 'Antaram';
}

// Helper to add years (fractional) to date
const addYears = (date: Date, years: number): Date => {
    const result = new Date(date);
    const totalDays = years * 365.2425; // Use Gregorian year avg
    result.setTime(result.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return result;
};

const generateSubPeriods = (parentPlanet: string, startDate: Date, parentDuration: number, level: 'Bhukti' | 'Antaram', grandParentPlanet?: string): DashaPeriod[] => {
    const subPeriods: DashaPeriod[] = [];
    let currentSubDate = new Date(startDate);

    // Sequence starts from the parent planet
    const startIndex = DASHA_ORDER.indexOf(parentPlanet);

    for (let i = 0; i < 9; i++) {
        const planetIndex = (startIndex + i) % 9;
        const planet = DASHA_ORDER[planetIndex];

        let durationYears = 0;

        if (level === 'Bhukti') {
            // Bhukti = (Maha Years * Bhukti Years) / 120
            durationYears = (parentDuration * DASHA_YEARS[planet]) / 120;
        } else {
            // Antaram = (Bhukti Years * Antaram Years) / 120 (relative to Bhukti duration)
            durationYears = parentDuration * (DASHA_YEARS[planet] / 120);
        }

        const endDate = addYears(currentSubDate, durationYears);

        subPeriods.push({
            planet,
            startDate: new Date(currentSubDate),
            endDate: new Date(endDate),
            durationYears,
            level
        });

        currentSubDate = endDate;
    }

    return subPeriods;
};

export const calculateDashaPeriods = (birthDate: Date, moonLongitude: number) => {
    // 1. Calculate Nakshatra and Balance
    const nakshatraSpan = 13.333333; // 13 degrees 20 minutes
    let nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan);

    // Safety bounds check
    if (nakshatraIndex >= 27) nakshatraIndex = 0;
    if (nakshatraIndex < 0) nakshatraIndex = 0;

    const longitudeInNakshatra = moonLongitude % nakshatraSpan;
    const percentagePassed = longitudeInNakshatra / nakshatraSpan;
    const percentageRemaining = 1 - percentagePassed;

    const birthLord = NAKSHATRA_LORDS[nakshatraIndex];
    if (!birthLord) {
        console.error("Invalid nakshatra index or lord:", nakshatraIndex, birthLord);
        return [];
    }

    const birthLordIndexInOrder = DASHA_ORDER.indexOf(birthLord);

    const birthDashaTotalYears = DASHA_YEARS[birthLord];
    const birthDashaBalanceYears = birthDashaTotalYears * percentageRemaining;

    const periods: DashaPeriod[] = [];
    let currentDate = new Date(birthDate);

    // 2. Generate Maha Dashas for 120 years
    // First period (Balance)
    let endDate = addYears(currentDate, birthDashaBalanceYears);
    periods.push({
        planet: birthLord,
        startDate: new Date(currentDate),
        endDate: new Date(endDate),
        durationYears: birthDashaBalanceYears,
        level: 'Maha'
    });
    currentDate = endDate;

    // Subsequent periods
    let currentLordIndex = (birthLordIndexInOrder + 1) % 9;
    while (periods.length < 9) { // Usually cover full cycle or until 120 years
        const planet = DASHA_ORDER[currentLordIndex];
        const duration = DASHA_YEARS[planet];
        endDate = addYears(currentDate, duration);

        periods.push({
            planet,
            startDate: new Date(currentDate),
            endDate: new Date(endDate),
            durationYears: duration,
            level: 'Maha'
        });

        currentDate = endDate;
        currentLordIndex = (currentLordIndex + 1) % 9;
    }

    // 3. Generate Bhuktis and Antarams for each Maha Dasha
    periods.forEach(maha => {
        maha.subPeriods = generateSubPeriods(maha.planet, maha.startDate, maha.durationYears, 'Bhukti');

        // Generate Antarams for current Bhukti
        maha.subPeriods.forEach(bhukti => {
            bhukti.subPeriods = generateSubPeriods(bhukti.planet, bhukti.startDate, bhukti.durationYears, 'Antaram', maha.planet);
        });
    });

    return periods;
};

export const getCurrentDasha = (periods: DashaPeriod[], date: Date = new Date()) => {
    const maha = periods.find(p => date >= p.startDate && date < p.endDate);
    if (!maha) return null;

    const bhukti = maha.subPeriods?.find(p => date >= p.startDate && date < p.endDate);
    const antaram = bhukti?.subPeriods?.find(p => date >= p.startDate && date < p.endDate);

    return { maha, bhukti, antaram };
};

// --- Navamsa Calculation ---

export const calculateNavamsa = (longitude: number) => {
    // 1. Get Sign and Degree
    const signIndex = Math.floor(longitude / 30);
    const degreeInSign = longitude % 30;

    // 2. Get Pada (1-9)
    // Each Pada is 3deg 20min = 3.3333 degrees
    const pada = Math.floor(degreeInSign / 3.3333333333) + 1;

    // 3. Determine Navamsa Sign based on Element
    // Movable: Aries (0), Cancer (3), Libra (6), Capricorn (9) -> Start from Sign itself
    // Fixed: Taurus (1), Leo (4), Scorpio (7), Aquarius (10) -> Start from 9th from Sign
    // Dual: Gemini (2), Virgo (5), Sagittarius (8), Pisces (11) -> Start from 5th from Sign

    let startSignIndex = 0;

    // Determine Quality: 0=Movable, 1=Fixed, 2=Dual
    // Aries(0) -> Movable (0%3=0)
    // Taurus(1) -> Fixed (1%3=1)
    // Gemini(2) -> Dual (2%3=2)
    // Cancer(3) -> Movable (3%3=0)
    const quality = signIndex % 3;

    if (quality === 0) { // Movable
        startSignIndex = signIndex;
    } else if (quality === 1) { // Fixed
        // 9th from Sign = Sign + 8
        startSignIndex = (signIndex + 8) % 12;
    } else { // Dual
        // 5th from Sign = Sign + 4
        startSignIndex = (signIndex + 4) % 12;
    }

    // Calculate final sign
    // 1st Pada = StartSign
    // 2nd Pada = StartSign + 1
    // ...
    const navamsaSignIndex = (startSignIndex + (pada - 1)) % 12;

    return {
        signIndex: navamsaSignIndex,
        pada: pada
    };
};

export const getNavamsaChartData = (rasiData: any) => {
    if (!rasiData) return null;

    const navamsaPlanets = rasiData.planets.map((p: any) => {
        const navamsa = calculateNavamsa(p.longitude);
        return {
            ...p,
            signIndex: navamsa.signIndex,
            navamsaPada: navamsa.pada
        };
    });

    const navamsaAscendant = {
        ...rasiData.ascendant,
        signIndex: calculateNavamsa(rasiData.ascendant.longitude).signIndex
    };

    return {
        planets: navamsaPlanets,
        ascendant: navamsaAscendant,
        userDetails: rasiData.userDetails
    };
};
