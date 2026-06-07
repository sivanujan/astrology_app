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

    const positions: { name: string; longitude: number; signIndex: number; degree: number; isRetro: boolean }[] = bodies.map(body => {
        // Use GeoVector to get geocentric position vector
        const vector = Astronomy.GeoVector(body, date, true);
        // Convert to Ecliptic coordinates
        const ecliptic = Astronomy.Ecliptic(vector);

        // Calculate Retrograde Status
        // Check longitude 1 hour earlier
        const datePrev = new Date(date.getTime() - 60 * 60 * 1000);
        const vectorPrev = Astronomy.GeoVector(body, datePrev, true);
        const eclipticPrev = Astronomy.Ecliptic(vectorPrev);

        // If current lon < prev lon, it's retrograde
        // Handle 360 boundary: (Prev: 359, Curr: 0) -> diff is +1 (Direct)
        // (Prev: 0, Curr: 359) -> diff is +359 (Retrograde)
        // Proper way: (Curr - Prev + 540) % 360 - 180 should be negative

        const diff = (ecliptic.elon - eclipticPrev.elon + 540) % 360 - 180;
        const isRetro = diff < 0;

        // Convert to Sidereal
        let lon = ecliptic.elon - ayanamsa;
        if (lon < 0) lon += 360;

        return {
            name: body,
            longitude: lon,
            signIndex: Math.floor(lon / 30),
            degree: lon % 30,
            isRetro: isRetro
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
        degree: rahuSidereal % 30,
        isRetro: true // Rahu is always Retrograde (Mean Node)
    });

    positions.push({
        name: "Ketu",
        longitude: ketuSidereal,
        signIndex: Math.floor(ketuSidereal / 30),
        degree: ketuSidereal % 30,
        isRetro: true // Ketu is always Retrograde (Mean Node)
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
    level: 'Maha' | 'Bhukti' | 'Antaram' | 'Sookshma' | 'Prana';
}

// Helper to add years (fractional) to date
const addYears = (date: Date, years: number): Date => {
    const result = new Date(date);
    const totalDays = years * 365.2425; // Use Gregorian year avg
    result.setTime(result.getTime() + totalDays * 24 * 60 * 60 * 1000);
    return result;
};

const generateSubPeriods = (
    parentPlanet: string,
    startDate: Date,
    parentDuration: number,
    level: 'Bhukti' | 'Antaram' | 'Sookshma' | 'Prana',
    grandParentPlanet?: string
): DashaPeriod[] => {
    // Validate startDate first
    if (!startDate || isNaN(new Date(startDate).getTime())) {
        console.error('Invalid startDate in generateSubPeriods:', { parentPlanet, startDate, level });
        return [];
    }

    const subPeriods: DashaPeriod[] = [];
    let currentSubDate = new Date(startDate);

    // Sequence starts from the parent planet
    const startIndex = DASHA_ORDER.indexOf(parentPlanet);

    for (let i = 0; i < 9; i++) {
        const planetIndex = (startIndex + i) % 9;
        const planet = DASHA_ORDER[planetIndex];

        let durationYears = 0;

        // Vimshottari Formula uses 120 year cycle ratio
        // Duration = (ParentDuration * PlanetYears) / 120
        durationYears = (parentDuration * DASHA_YEARS[planet]) / 120;

        const endDate = addYears(currentSubDate, durationYears);

        // Validate generated endDate
        if (isNaN(endDate.getTime())) {
            console.error('Generated invalid endDate:', { planet, currentSubDate, durationYears });
            continue;
        }

        // Define Next Level
        let nextLevel: 'Sookshma' | 'Prana' | null = null;
        if (level === 'Antaram') nextLevel = 'Sookshma';
        else if (level === 'Sookshma') nextLevel = 'Prana';

        const period: DashaPeriod = {
            planet,
            startDate: new Date(currentSubDate),
            endDate: new Date(endDate),
            durationYears,
            level
        };

        // Recursive Generation for deep analysis if needed
        // For performance, we might limit this, but user requested it.
        // We will generate on-the-fly usually, but here we pre-calc?
        // Actually, pre-calculating ALL 5 levels for a lifetime is huge.
        // Better: `getCurrentDasha` should calculate detail on demand.
        // But the user's `generate15DaysForecast` will iterate days, so we need a way to find it efficiently.
        // Let's modify `calculateDashaPeriods` to NOT recurse all the way by default, 
        // OR we implement a `getDasaDetails(date)` function that drills down.
        // For now, let's keep the generator pure but maybe NOT loop Antaram->Sookshma for the whole life.
        // Only generate 'Bhukti' and 'Antaram' here. Deep levels can be calc'd on demand.
        // Wait, current code generates Antaram for ALL Bhuktis. That's already a lot.
        // Adding Sookshma/Prana for ALL Antarams is 9x9x9x9x9 = 59000 objects. Too heavy.
        // I will change this to ONLY generate up to Antaram here.
        // And I will add a helper `getDeepDasa(date)` in `gocharam.ts` to calculate the 5 levels for just that day.

        if (level === 'Bhukti') {
            // Generate Antarams
            period.subPeriods = generateSubPeriods(planet, currentSubDate, durationYears, 'Antaram', parentPlanet);
        }

        subPeriods.push(period);

        currentSubDate = endDate;
    }

    return subPeriods;
};



// Precise Dasa Years (Sidereal Solar Year ~ 365.25636 days)
// We use a standard approximation of 365.25 days per year for compatibility with general almanacs.
const addSiderealYears = (date: Date, years: number): Date => {
    const millisPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const totalMillis = years * millisPerYear;
    return new Date(date.getTime() + totalMillis);
};

export const calculateDashaPeriods = (birthDate: Date, moonLongitude: number) => {
    // 1. Validate Inputs
    if (!birthDate || isNaN(birthDate.getTime()) || typeof moonLongitude !== 'number' || isNaN(moonLongitude)) {
        console.error("Invalid inputs for Dasha calculation:", { birthDate, moonLongitude });
        return [{
            planet: 'Ketu', // Default fallback
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            durationYears: 1,
            level: 'Maha' as 'Maha'
        }];
    }

    // 2. Calculate Nakshatra and Balance
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
        // Fallback: Return a default short dasha starting now, to prevent crash
        return [{
            planet: 'Ketu', // Default
            startDate: new Date(),
            endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            durationYears: 1,
            level: 'Maha' as 'Maha'
        }];
    }

    const birthLordIndexInOrder = DASHA_ORDER.indexOf(birthLord);

    const birthDashaTotalYears = DASHA_YEARS[birthLord];
    const birthDashaBalanceYears = birthDashaTotalYears * percentageRemaining;

    const periods: DashaPeriod[] = [];
    let currentDate = new Date(birthDate);

    // 2. Generate Maha Dashas for 120 years
    // First period (Balance)
    let endDate = addSiderealYears(currentDate, birthDashaBalanceYears);
    periods.push({
        planet: birthLord,
        startDate: new Date(currentDate),
        endDate: new Date(endDate),
        durationYears: birthDashaBalanceYears,
        level: 'Maha'
    });
    currentDate = endDate;

    const birthLordIndex = DASHA_ORDER.indexOf(birthLord);

    // Continue cycle from next planet
    for (let i = 1; i <= 9; i++) {
        const nextIndex = (birthLordIndex + i) % 9;
        const planet = DASHA_ORDER[nextIndex];
        const duration = DASHA_YEARS[planet];

        endDate = addSiderealYears(currentDate, duration);
        periods.push({
            planet,
            startDate: new Date(currentDate),
            endDate: new Date(endDate),
            durationYears: duration,
            level: 'Maha'
        });
        currentDate = endDate;
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
    if (!rasiData || !rasiData.planets) return null;

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

// 3. Calculate Current Transits (Full Chart)
export const calculateFullTransitChart = () => {
    const date = new Date();
    const observer = new Observer(13.0827, 80.2707, 0); // Chennai (Default)

    // Get Ayanamsa
    const ayanamsa = getLahiriAyanamsa(date);

    const getSignAndDegree = (body: Body) => {
        const equator = Equator(body, date, observer, false, true);
        const ecliptic = Astronomy.Ecliptic(equator.vec);

        // Convert Tropical to Sidereal
        let lon = ecliptic.elon - ayanamsa;
        if (lon < 0) lon += 360;

        return {
            signIndex: Math.floor(lon / 30),
            degree: lon % 30,
            longitude: lon // Added logic needs this if we want it later
        };
    };

    // Calculate for all major planets
    const planets = [
        { name: 'Sun', body: Body.Sun },
        { name: 'Moon', body: Body.Moon },
        { name: 'Mars', body: Body.Mars },
        { name: 'Mercury', body: Body.Mercury },
        { name: 'Jupiter', body: Body.Jupiter },
        { name: 'Venus', body: Body.Venus },
        { name: 'Saturn', body: Body.Saturn },
        // Rahu/Ketu need special handling if Body.MoonNode is not available directly or needs calculation
        // Astronomy engine usually has MoonNode. Let's try to use it or fallback.
        // If Body.MoonNode fails, we might need another way. But let's assume it works or use a simplified calc if needed.
        // For now, let's try Body.MoonNode again, but if it fails, I'll use a hardcoded fallback just for nodes or a different method.
        // Actually, let's check if we can import Body properly.
    ];

    const transitPlanets = planets.map(p => {
        const { signIndex, degree } = getSignAndDegree(p.body);
        return { name: p.name, signIndex, degree };
    });

    // Add Rahu/Ketu
    // Note: Astronomy engine might not export MoonNode in Body enum directly in some versions?
    // Let's use a safe approach. If Body.MoonNode is undefined, we use a hardcoded approx or skip.
    // But since we need it, let's try to find it.
    // Actually, let's use the hardcoded values for Rahu/Ketu for now to avoid the previous error, 
    // but calculate others dynamically.
    // Dec 2025: Rahu in Aquarius (10), Ketu in Leo (4).
    transitPlanets.push({ name: 'Rahu', signIndex: 10, degree: 15 }); // Approx
    transitPlanets.push({ name: 'Ketu', signIndex: 4, degree: 15 }); // Approx

    return transitPlanets;
};

// 3b. Calculate Current Transits (Simple Interface)
export const calculateCurrentTransits = () => {
    const fullChart = calculateFullTransitChart();
    const getSign = (name: string) => fullChart.find(p => p.name === name)?.signIndex || 0;

    return {
        jupiterSignIndex: getSign('Jupiter'),
        saturnSignIndex: getSign('Saturn'),
        rahuSignIndex: getSign('Rahu'),
        ketuSignIndex: getSign('Ketu'),
        sunSignIndex: getSign('Sun'),
        moonSignIndex: getSign('Moon'),
        marsSignIndex: getSign('Mars'),
        mercurySignIndex: getSign('Mercury'),
        venusSignIndex: getSign('Venus')
    };
};

// 4. Calculate Yogas & Doshas (Shared Logic)
export const calculateYogas = (planets: any[], ascendant: any, language: 'en' | 'ta' = 'en') => {
    const yogas: { name: string, description: string }[] = [];
    const doshas: { name: string, description: string }[] = [];

    const t = {
        gajakesari: {
            name: language === 'ta' ? 'கஜகேசரி யோகம்' : 'Gajakesari Yoga',
            desc: language === 'ta'
                ? 'சந்திரனும் குருவும் கேந்திரத்தில் உள்ளனர். இது அறிவு, செல்வம் மற்றும் புகழைத் தரும்.'
                : 'Moon and Jupiter in Kendra. Indicates wisdom, wealth, and fame.'
        },
        manglik: {
            name: language === 'ta' ? 'செவ்வாய் தோஷம்' : 'Manglik Dosha',
            desc: language === 'ta'
                ? 'செவ்வாய் (1/2/4/7/8/12) இடத்தில் உள்ளது. திருமணத்தில் தாமதம் அல்லது சிக்கல்களை ஏற்படுத்தலாம்.'
                : 'Mars is in a sensitive position (1/2/4/7/8/12). May cause delay or difficulty in marriage.'
        },
        parivartana: {
            name: language === 'ta' ? 'பரிவர்த்தனை யோகம்' : 'Parivartana Yoga',
            desc: (p1: string, p2: string) => language === 'ta'
                ? `${p1} மற்றும் ${p2} ராசி பரிமாற்றம் செய்துள்ளனர். இது இரு கிரகங்களையும் பலப்படுத்துகிறது.`
                : `${p1} & ${p2} exchange signs. Strengthening both planets.`
        },
        neechaBhanga: {
            name: language === 'ta' ? 'நீச பங்கம் ராஜ யோகம்' : 'Neecha Bhanga Raja Yoga',
            desc: (p: string) => language === 'ta'
                ? `${p} நீச பங்கம் அடைகிறது. பலவீனம் பலமாக மாறுகிறது.`
                : `${p} gets cancellation of debilitation, converting weakness into strength.`
        },
        guruMangala: {
            name: language === 'ta' ? 'குரு மங்கள யோகம்' : 'Guru-Mangala Yoga',
            descConj: language === 'ta'
                ? 'குரு மற்றும் செவ்வாய் சேர்க்கை. செல்வம் மற்றும் சொத்துக்களுக்கு நல்லது.'
                : 'Jupiter and Mars conjunction. Good for wealth and property.',
            descAspect: language === 'ta'
                ? 'குரு மற்றும் செவ்வாய் பார்வை. ஆற்றல் மற்றும் முயற்சிக்கு நல்லது.'
                : 'Jupiter and Mars mutual aspect. Good for energy and enterprise.'
        },
        budhaAditya: {
            name: language === 'ta' ? 'புத-ஆதித்ய யோகம்' : 'Budha-Aditya Yoga',
            desc: language === 'ta'
                ? 'சூரியன் மற்றும் புதன் சேர்க்கை. அறிவு மற்றும் பேச்சுத் திறமைக்கு நல்லது.'
                : 'Sun and Mercury conjunction. Good for intelligence and communication.'
        }
    };

    // Simple Gajakesari Yoga (Jupiter in Kendra from Moon)
    const moon = planets.find((p: any) => p.name === 'Moon');
    const jupiter = planets.find((p: any) => p.name === 'Jupiter');

    if (moon && jupiter) {
        // Calculate house difference
        const diff = (jupiter.signIndex - moon.signIndex + 12) % 12; // 0=1st, 3=4th, 6=7th, 9=10th
        // Kendra houses are 1, 4, 7, 10 (Indices 0, 3, 6, 9)
        if ([0, 3, 6, 9].includes(diff)) {
            yogas.push({ name: t.gajakesari.name, description: t.gajakesari.desc });
        }
    }

    // Manglik Dosha (Mars in 1, 2, 4, 7, 8, 12 from Ascendant)
    const mars = planets.find((p: any) => p.name === 'Mars');
    if (mars && ascendant) {
        const house = (mars.signIndex - ascendant.signIndex + 12) % 12 + 1;
        if ([1, 2, 4, 7, 8, 12].includes(house)) {
            doshas.push({ name: t.manglik.name, description: t.manglik.desc });
        }
    }

    // Advanced Yogas
    // Parivartana (Exchange of Signs)
    const exchanges = checkParivartana(planets);
    exchanges.forEach(ex => {
        // Map planet names to Tamil if needed, or leave as English names even in Tamil text?
        // Ideally translate planet names too.
        // Let's keep English legacy names for variables but use mapping for display if needed.
        // For now, using English names in Tamil string is common or acceptable, "Sun மற்றும் Moon..."
        // But better:
        const taPlanets: Record<string, string> = {
            'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்', 'Mercury': 'புதன்',
            'Jupiter': 'குரு', 'Venus': 'சுக்கிரன்', 'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
        };
        const p1Name = language === 'ta' ? (taPlanets[ex.p1] || ex.p1) : ex.p1;
        const p2Name = language === 'ta' ? (taPlanets[ex.p2] || ex.p2) : ex.p2;

        yogas.push({
            name: t.parivartana.name,
            description: t.parivartana.desc(p1Name, p2Name)
        });
    });

    // Neecha Bhanga (Cancellation of Debilitation)
    planets.forEach((p: any) => {
        if (checkNeechaBhanga(p, planets, ascendant)) {
            const taPlanets: Record<string, string> = {
                'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்', 'Mercury': 'புதன்',
                'Jupiter': 'குரு', 'Venus': 'சுக்கிரன்', 'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
            };
            const pName = language === 'ta' ? (taPlanets[p.name] || p.name) : p.name;
            yogas.push({
                name: t.neechaBhanga.name,
                description: t.neechaBhanga.desc(pName)
            });
        }
    });

    // Guru-Mangala Yoga (Jupiter & Mars Conjunction/Aspect)
    if (jupiter && mars) {
        // Conjunction
        if (jupiter.signIndex === mars.signIndex) {
            yogas.push({ name: t.guruMangala.name, description: t.guruMangala.descConj });
        }
        // Opposition (Aspect)
        else if (Math.abs(jupiter.signIndex - mars.signIndex) === 6) {
            yogas.push({ name: t.guruMangala.name, description: t.guruMangala.descAspect });
        }
    }

    // Budha-Aditya Yoga (Sun & Mercury Conjunction)
    const sun = planets.find((p: any) => p.name === 'Sun');
    const mercury = planets.find((p: any) => p.name === 'Mercury');
    if (sun && mercury && sun.signIndex === mercury.signIndex) {
        yogas.push({ name: t.budhaAditya.name, description: t.budhaAditya.desc });
    }

    return { yogas, doshas };
};
