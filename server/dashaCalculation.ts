
// Standalone Dasha Calculation for Server
// Duplicated from src/utils/astrology.ts to avoid import issues

export interface DashaPeriod {
    planet: string;
    startDate: Date;
    endDate: Date;
    durationYears: number;
    subPeriods?: DashaPeriod[];
    level: 'Maha' | 'Bhukti' | 'Antaram';
}

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

export const NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

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
