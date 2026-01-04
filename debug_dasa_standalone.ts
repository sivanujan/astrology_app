
// Mock Constants
const DASHA_YEARS: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
    Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const DASHA_ORDER = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

const NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

interface DashaPeriod {
    planet: string;
    startDate: Date;
    endDate: Date;
    durationYears: number;
    subPeriods?: DashaPeriod[];
    level: string;
}

const addSiderealYears = (date: Date, years: number): Date => {
    const millisPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const totalMillis = years * millisPerYear;
    return new Date(date.getTime() + totalMillis);
};

const generateSubPeriods = (
    parentPlanet: string,
    startDate: Date,
    parentDuration: number,
    level: string
): DashaPeriod[] => {
    const subPeriods: DashaPeriod[] = [];
    let currentSubDate = new Date(startDate);
    const startIndex = DASHA_ORDER.indexOf(parentPlanet);

    for (let i = 0; i < 9; i++) {
        const planetIndex = (startIndex + i) % 9;
        const planet = DASHA_ORDER[planetIndex];
        const durationYears = (parentDuration * DASHA_YEARS[planet]) / 120;
        const endDate = addSiderealYears(currentSubDate, durationYears);

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

const calculateDashaPeriods = (birthDate: Date, moonLongitude: number) => {
    const nakshatraSpan = 13.333333;
    let nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan);

    if (nakshatraIndex >= 27) nakshatraIndex = 0;
    if (nakshatraIndex < 0) nakshatraIndex = 0;

    const longitudeInNakshatra = moonLongitude % nakshatraSpan;
    const percentagePassed = longitudeInNakshatra / nakshatraSpan;
    const percentageRemaining = 1 - percentagePassed;

    const birthLord = NAKSHATRA_LORDS[nakshatraIndex];
    if (!birthLord) {
        console.log("Invalid Lord for Index:", nakshatraIndex);
        return [];
    }

    const birthDashaTotalYears = DASHA_YEARS[birthLord];
    const birthDashaBalanceYears = birthDashaTotalYears * percentageRemaining;

    const periods: DashaPeriod[] = [];
    let currentDate = new Date(birthDate);

    // Balance
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

    // Generate Bhuktis
    periods.forEach(maha => {
        maha.subPeriods = generateSubPeriods(maha.planet, maha.startDate, maha.durationYears, 'Bhukti');
    });

    return periods;
};

const getCurrentDasha = (periods: DashaPeriod[], date: Date = new Date()) => {
    const maha = periods.find(p => date >= p.startDate && date < p.endDate);
    if (!maha) return null;
    const bhukti = maha.subPeriods?.find(p => date >= p.startDate && date < p.endDate);
    return { maha, bhukti };
};

// --- RUN TESTS ---
console.log("--- Testing Standalone Dasa Calculation ---");
const birthDate = new Date('2000-01-01T12:00:00');
const testLongitudes = [0, 95, 120, 220, 340]; // 0=Ketu, 95=Cancer(Saturn), 120=Leo(Ketu?), 220=Scorpio(Saturn?), 340=Pisces(Saturn?)

testLongitudes.forEach(long => {
    console.log(`\nMoon Longitude: ${long}`);
    const periods = calculateDashaPeriods(birthDate, long);
    const first = periods[0];
    console.log(`First Dasa: ${first?.planet}`);

    // Check Current (2026)
    const targetDate = new Date('2026-01-01');
    const current = getCurrentDasha(periods, targetDate);
    console.log(`Current Dasa (2026): ${current?.maha?.planet}-${current?.bhukti?.planet}`);

    if (current?.maha?.planet === 'Saturn' && current?.bhukti?.planet === 'Saturn') {
        console.log("WARNING: GOT SATURN-SATURN");
    }
});
