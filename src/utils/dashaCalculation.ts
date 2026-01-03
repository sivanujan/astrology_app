/**
 * Vimshottari Dasha System Implementation
 * Based on Vedic Astrology Dasha calculation
 */

import { getNakshatra, NAKSHATRA_LORDS } from './astrology';

// Dasha periods in years for each planet
const DASHA_PERIODS: Record<string, number> = {
    'Ketu': 7,
    'Venus': 20,
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17
};

// Order of Dasha lords (Vimshottari sequence)
const DASHA_SEQUENCE = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
    'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export interface DashaPeriod {
    planet: string;
    start: Date;
    end: Date;
    bhukti?: BhuktiPeriod[];
}

export interface BhuktiPeriod {
    planet: string;
    start: Date;
    end: Date;
}

/**
 * Calculate Vimshottari Dasha periods starting from birth
 */
export function calculateVimshottariDasha(
    moonLongitude: number,
    birthDate: Date,
    yearsAhead: number = 120 // Full Dasha cycle
): DashaPeriod[] {
    const nakshatra = getNakshatra(moonLongitude);
    const nakshatraLord = NAKSHATRA_LORDS[nakshatra.index];

    // Calculate balance of first Dasha
    const nakshatraDuration = 360 / 27; // 13.333... degrees per nakshatra
    const nakshatraStart = nakshatra.index * nakshatraDuration;
    const traversed = ((moonLongitude - nakshatraStart) + 360) % nakshatraDuration; // Degrees traversed in current nakshatra
    const remaining = nakshatraDuration - traversed;
    const percentRemaining = remaining / nakshatraDuration;

    const firstDashaDuration = DASHA_PERIODS[nakshatraLord];
    const firstDashaBalance = firstDashaDuration * percentRemaining;

    // Generate all Dasha periods
    const periods: DashaPeriod[] = [];
    let currentDate = new Date(birthDate);

    // Find starting index in sequence
    let startIndex = DASHA_SEQUENCE.indexOf(nakshatraLord);

    // First period (balance)
    const firstEndDate = addYears(currentDate, firstDashaBalance);
    periods.push({
        planet: nakshatraLord,
        start: new Date(currentDate),
        end: firstEndDate
    });

    currentDate = new Date(firstEndDate);

    // Remaining periods
    let sequenceIndex = (startIndex + 1) % DASHA_SEQUENCE.length;
    let totalYears = firstDashaBalance;

    while (totalYears < yearsAhead) {
        const planet = DASHA_SEQUENCE[sequenceIndex];
        const duration = DASHA_PERIODS[planet];
        const endDate = addYears(currentDate, duration);

        periods.push({
            planet,
            start: new Date(currentDate),
            end: endDate
        });

        currentDate = new Date(endDate);
        totalYears += duration;
        sequenceIndex = (sequenceIndex + 1) % DASHA_SEQUENCE.length;
    }

    // Calculate Bhukti (sub-periods) for each Maha Dasha
    periods.forEach(period => {
        period.bhukti = calculateBhukti(period);
    });

    return periods;
}

/**
 * Calculate Bhukti (sub-periods) within a Maha Dasha
 */
function calculateBhukti(mahaDasha: DashaPeriod): BhuktiPeriod[] {
    const bhuktiPeriods: BhuktiPeriod[] = [];
    const mahaDashaPlanet = mahaDasha.planet;
    const mahaDashaDuration = DASHA_PERIODS[mahaDashaPlanet];

    // Total days in Maha Dasha
    const totalDays = getDaysBetween(mahaDasha.start, mahaDasha.end);

    // Start from the Maha Dasha lord
    let startIndex = DASHA_SEQUENCE.indexOf(mahaDashaPlanet);
    let currentDate = new Date(mahaDasha.start);

    for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
        const bhuktiPlanet = DASHA_SEQUENCE[(startIndex + i) % DASHA_SEQUENCE.length];
        const bhuktiDuration = DASHA_PERIODS[bhuktiPlanet];

        // Bhukti days = (Bhukti planet years × Maha Dasha planet years × 365) / 120
        const bhuktiDays = (bhuktiDuration * mahaDashaDuration * 365) / 120;

        const endDate = addDays(currentDate, bhuktiDays);

        // Don't exceed Maha Dasha end
        const actualEndDate = endDate > mahaDasha.end ? mahaDasha.end : endDate;

        bhuktiPeriods.push({
            planet: bhuktiPlanet,
            start: new Date(currentDate),
            end: actualEndDate
        });

        if (actualEndDate >= mahaDasha.end) break;

        currentDate = new Date(endDate);
    }

    return bhuktiPeriods;
}

/**
 * Get current Maha Dasha and Bhukti
 */
export function getCurrentDasha(
    moonLongitude: number,
    birthDate: Date,
    currentDate: Date = new Date()
): { maha: DashaPeriod; bhukti: BhuktiPeriod | null } {
    const periods = calculateVimshottariDasha(moonLongitude, birthDate, 120);

    for (const period of periods) {
        if (currentDate >= period.start && currentDate <= period.end) {
            // Found Maha Dasha, now find Bhukti
            if (period.bhukti) {
                for (const bhukti of period.bhukti) {
                    if (currentDate >= bhukti.start && currentDate <= bhukti.end) {
                        return {
                            maha: period,
                            bhukti
                        };
                    }
                }
            }

            return {
                maha: period,
                bhukti: null
            };
        }
    }

    // Fallback to first period
    return {
        maha: periods[0],
        bhukti: periods[0].bhukti?.[0] || null
    };
}

/**
 * Get Dasha for a specific date
 */
export function getDashaAtDate(
    moonLongitude: number,
    birthDate: Date,
    targetDate: Date
): { maha: DashaPeriod; bhukti: BhuktiPeriod | null } {
    return getCurrentDasha(moonLongitude, birthDate, targetDate);
}

/**
 * Helper: Add years to date
 */
function addYears(date: Date, years: number): Date {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + Math.floor(years));

    // Add remaining fractional years as days
    const fractionalYears = years - Math.floor(years);
    const daysToAdd = fractionalYears * 365.25;
    newDate.setDate(newDate.getDate() + Math.round(daysToAdd));

    return newDate;
}

/**
 * Helper: Add days to date
 */
function addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + Math.round(days));
    return newDate;
}

/**
 * Helper: Get days between two dates
 */
function getDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format Dasha period for display
 */
export function formatDashaPeriod(period: DashaPeriod): string {
    const startStr = period.start.toLocaleDateString();
    const endStr = period.end.toLocaleDateString();
    return `${period.planet} Dasha (${startStr} - ${endStr})`;
}

/**
 * Format Bhukti period for display
 */
export function formatBhuktiPeriod(bhukti: BhuktiPeriod): string {
    const startStr = bhukti.start.toLocaleDateString();
    const endStr = bhukti.end.toLocaleDateString();
    return `${bhukti.planet} Bhukti (${startStr} - ${endStr})`;
}
