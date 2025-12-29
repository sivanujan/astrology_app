/**
 * Marriage Dasa Forecast - Analyzes next 10 years of Dasa periods for both partners
 */

import { calculateDashaPeriods, getCurrentDasha, DashaPeriod } from './astrology';
import { calculateDasaScore } from './dashaScoring';
import { getHousesRuledByPlanet } from './houseLordship';

export interface DasaPeriodScore {
    planet: string;           // Bhukti planet
    mahaDasa: string;         // Maha Dasa planet for context
    startDate: Date;
    endDate: Date;
    score: number;
    quality: string;
    isProblematic: boolean; // 6th or 8th house lord
    problemType?: string;
}

export interface MarriageDasaForecast {
    boyPeriods: DasaPeriodScore[];
    girlPeriods: DasaPeriodScore[];
    challenges: {
        date: Date;
        description: {
            en: string;
            ta: string;
        };
        severity: 'low' | 'medium' | 'high';
        affectedPerson: 'boy' | 'girl' | 'both';
    }[];
    overallCompatibility: number; // Average score for next 10 years
}

export function analyzeMarriageDasaForecast(
    boyChart: any,
    girlChart: any,
    boyBirthDate: Date,
    girlBirthDate: Date
): MarriageDasaForecast {
    const today = new Date();
    const tenYearsLater = new Date(today);
    tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);

    // Get Dasa periods for both
    const boyMoon = boyChart.planets.find((p: any) => p.name === 'Moon');
    const girlMoon = girlChart.planets.find((p: any) => p.name === 'Moon');

    // Validation
    if (!boyMoon || !girlMoon) {
        console.error('Moon not found in charts:', { boyMoon, girlMoon });
        return {
            boyPeriods: [],
            girlPeriods: [],
            challenges: [],
            overallCompatibility: 0
        };
    }

    if (!boyMoon.longitude || !girlMoon.longitude) {
        console.error('Moon longitude missing:', { boyMoon, girlMoon });
        return {
            boyPeriods: [],
            girlPeriods: [],
            challenges: [],
            overallCompatibility: 0
        };
    }

    // Validate birth dates
    const boyDate = boyBirthDate instanceof Date ? boyBirthDate : new Date(boyBirthDate);
    const girlDate = girlBirthDate instanceof Date ? girlBirthDate : new Date(girlBirthDate);

    if (isNaN(boyDate.getTime()) || isNaN(girlDate.getTime())) {
        console.error('Invalid birth dates:', { boyBirthDate, girlBirthDate });
        return {
            boyPeriods: [],
            girlPeriods: [],
            challenges: [],
            overallCompatibility: 0
        };
    }

    console.log('Calculating Dasa periods with valid dates:', { boyDate, girlDate });

    const boyDasaPeriods = calculateDashaPeriods(boyDate, boyMoon.longitude);
    const girlDasaPeriods = calculateDashaPeriods(girlDate, girlMoon.longitude);

    // Get periods within next 10 years
    const boyUpcoming = getUpcomingPeriods(boyDasaPeriods, today, tenYearsLater, boyChart);
    const girlUpcoming = getUpcomingPeriods(girlDasaPeriods, today, tenYearsLater, girlChart);

    // Identify challenges
    const challenges = identifyChallenges(boyUpcoming, girlUpcoming);

    // Calculate overall compatibility
    const boyAvg = boyUpcoming.length > 0
        ? boyUpcoming.reduce((sum, p) => sum + p.score, 0) / boyUpcoming.length
        : 0;
    const girlAvg = girlUpcoming.length > 0
        ? girlUpcoming.reduce((sum, p) => sum + p.score, 0) / girlUpcoming.length
        : 0;
    const overallCompatibility = (boyAvg + girlAvg) / 2;

    return {
        boyPeriods: boyUpcoming,
        girlPeriods: girlUpcoming,
        challenges,
        overallCompatibility
    };
}

function getUpcomingPeriods(
    allPeriods: DashaPeriod[],
    startDate: Date,
    endDate: Date,
    chart: any
): DasaPeriodScore[] {
    const upcoming: DasaPeriodScore[] = [];

    for (const maha of allPeriods) {
        // Check if this Maha Dasa overlaps with our time range
        if (maha.endDate < startDate || maha.startDate > endDate) continue;

        // Check Bhukti periods
        if (maha.subPeriods) {
            for (const bhukti of maha.subPeriods) {
                // Validate dates FIRST before any comparisons
                if (!bhukti.startDate || !bhukti.endDate) {
                    console.warn('Missing Bhukti dates:', { planet: bhukti.planet });
                    continue;
                }

                const bhuktiStart = bhukti.startDate instanceof Date ? bhukti.startDate : new Date(bhukti.startDate);
                const bhuktiEnd = bhukti.endDate instanceof Date ? bhukti.endDate : new Date(bhukti.endDate);

                // Skip if dates are invalid
                if (isNaN(bhuktiStart.getTime()) || isNaN(bhuktiEnd.getTime())) {
                    console.warn('Invalid Bhukti dates:', { planet: bhukti.planet, start: bhukti.startDate, end: bhukti.endDate });
                    continue;
                }

                // Now safe to do date comparisons
                if (bhuktiEnd < startDate || bhuktiStart > endDate) continue;

                const scoreData = calculateDasaScore(bhukti.planet, chart);
                const housesRuled = getHousesRuledByPlanet(bhukti.planet, chart);

                const isProblematic = housesRuled.includes(6) || housesRuled.includes(8);
                let problemType: string | undefined;

                if (housesRuled.includes(6) && housesRuled.includes(8)) {
                    problemType = 'both_6th_8th';
                } else if (housesRuled.includes(6)) {
                    problemType = '6th_house_lord';
                } else if (housesRuled.includes(8)) {
                    problemType = '8th_house_lord';
                }

                upcoming.push({
                    planet: bhukti.planet,
                    mahaDasa: maha.planet,
                    startDate: bhuktiStart,
                    endDate: bhuktiEnd,
                    score: scoreData.totalScore,
                    quality: scoreData.quality,
                    isProblematic,
                    problemType
                });
            }
        }
    }

    return upcoming.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

function identifyChallenges(
    boyPeriods: DasaPeriodScore[],
    girlPeriods: DasaPeriodScore[]
): MarriageDasaForecast['challenges'] {
    const challenges: MarriageDasaForecast['challenges'] = [];

    // Check each time period
    const allDates = [
        ...boyPeriods.map(p => ({ date: p.startDate, type: 'boy', period: p })),
        ...girlPeriods.map(p => ({ date: p.startDate, type: 'girl', period: p }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < allDates.length; i++) {
        const current = allDates[i];
        const currentBoyPeriod = boyPeriods.find(p =>
            current.date >= p.startDate && current.date < p.endDate
        );
        const currentGirlPeriod = girlPeriods.find(p =>
            current.date >= p.startDate && current.date < p.endDate
        );

        if (!currentBoyPeriod || !currentGirlPeriod) continue;

        // Identify problems
        const boyScore = currentBoyPeriod.score;
        const girlScore = currentGirlPeriod.score;
        const boyProblematic = currentBoyPeriod.isProblematic;
        const girlProblematic = currentGirlPeriod.isProblematic;

        // High severity: Both have 6th/8th house lords OR both have very bad scores
        if ((boyProblematic && girlProblematic) || (boyScore < 0 && girlScore < 0)) {
            challenges.push({
                date: current.date,
                description: {
                    en: `Critical period: Both partners facing challenges (Boy: ${currentBoyPeriod.planet} ${boyScore.toFixed(0)}, Girl: ${currentGirlPeriod.planet} ${girlScore.toFixed(0)})`,
                    ta: `கடுமையான காலம்: இருவருக்கும் சவால்கள் (ஆண்: ${currentBoyPeriod.planet} ${boyScore.toFixed(0)}, பெண்: ${currentGirlPeriod.planet} ${girlScore.toFixed(0)})`
                },
                severity: 'high',
                affectedPerson: 'both'
            });
        }
        // Medium severity: One has 6th/8th lord or one has bad score
        else if (boyProblematic || girlProblematic || boyScore < 30 || girlScore < 30) {
            const affected = boyProblematic || boyScore < 30 ? (girlProblematic || girlScore < 30 ? 'both' : 'boy') : 'girl';
            challenges.push({
                date: current.date,
                description: {
                    en: `Moderate challenges: ${affected === 'boy' ? 'Husband' : affected === 'girl' ? 'Wife' : 'Both'} may face difficulties`,
                    ta: `நடுத்தர சவால்கள்: ${affected === 'boy' ? 'கணவர்' : affected === 'girl' ? 'மனைவி' : 'இருவரும்'} சிரமங்களை எதிர்கொள்ளலாம்`
                },
                severity: 'medium',
                affectedPerson: affected
            });
        }
        // Low severity: Score difference is very high
        else if (Math.abs(boyScore - girlScore) > 100) {
            challenges.push({
                date: current.date,
                description: {
                    en: `Imbalanced period: One partner progressing while other facing stagnation`,
                    ta: `சமநிலையற்ற காலம்: ஒரு துணை முன்னேறும் போது மற்றவர் தேக்கநிலையில்`
                },
                severity: 'low',
                affectedPerson: boyScore > girlScore ? 'girl' : 'boy'
            });
        }
    }

    // Remove duplicates within 30 days
    const filtered: typeof challenges = [];
    for (const challenge of challenges) {
        const isDuplicate = filtered.some(f =>
            Math.abs(f.date.getTime() - challenge.date.getTime()) < 30 * 24 * 60 * 60 * 1000 &&
            f.severity === challenge.severity
        );
        if (!isDuplicate) {
            filtered.push(challenge);
        }
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
}
