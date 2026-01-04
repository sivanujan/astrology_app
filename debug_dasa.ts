
import { calculateDashaPeriods, getCurrentDasha, DASHA_ORDER } from './src/utils/astrology.ts';

// Mock Data
const birthDate = new Date('2000-01-01T12:00:00');
const moonLongitudes = [0, 40, 100, 200, 300]; // Spread across zodiac

console.log("--- Testing Dasa Calculation ---");

moonLongitudes.forEach(long => {
    console.log(`\nMoon Longitude: ${long}`);
    const periods = calculateDashaPeriods(birthDate, long);
    if (periods.length === 0) {
        console.log("No periods generated!");
        return;
    }
    const firstPeriod = periods[0];
    console.log(`First Dasa: ${firstPeriod.planet} (Balance: ${firstPeriod.durationYears.toFixed(2)} years)`);

    // Check current Dasa for today
    const current = getCurrentDasha(periods, new Date());
    console.log(`Current Dasa (2026): ${current?.maha.planet}-${current?.bhukti?.planet}`);
});

console.log("\n--- Testing Invalid Input ---");
const invalidPeriods = calculateDashaPeriods(new Date('Invalid'), 0);
console.log("Invalid Input First Dasa:", invalidPeriods[0]?.planet);

