
import { calculateDashaPeriods, DASHA_YEARS, DASHA_ORDER } from './src/utils/astrology';

// Mock specific logic
const mockCalculate = () => {
    // Rahu Dasa total 18 years.
    // Birth Date: 2000-01-01
    // Remain: 8 years. (Elapsed 10 years)
    // Means we are somewhere past Rahu-Saturn.

    // Let's simulate calculateDashaPeriods logic manually or via import if possible.
    // Since I cannot run the full TS file easily without transpiling, I will reimplement the 'broken' logic here to verify.

    const parentPlanet = 'Rahu';
    const parentDuration = 8; // Passed as Balance!
    const startDate = new Date('2000-01-01');

    console.log(`--- SIMULATION: Passing Balance Duration (${parentDuration}y) ---`);
    // Logic from src/utils/astrology.ts
    const startIndex = DASHA_ORDER.indexOf(parentPlanet);
    let currentSubDate = new Date(startDate);

    for (let i = 0; i < 9; i++) {
        const planetIndex = (startIndex + i) % 9;
        const planet = DASHA_ORDER[planetIndex];

        // BUG: usage of parentDuration (8) instead of standard (18) scales everything down
        const durationYears = (parentDuration * DASHA_YEARS[planet]) / 120;

        const endDate = new Date(currentSubDate);
        endDate.setDate(endDate.getDate() + (durationYears * 365.25));

        console.log(`${parentPlanet}-${planet}: ${currentSubDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (Dur: ${durationYears.toFixed(2)}y)`);

        currentSubDate = endDate;
    }
}

mockCalculate();
