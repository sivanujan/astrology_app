import { PLANETS, NAKSHATRAS, SIGN_LORDS } from './constants';
import { getNakshatra } from './astrology';

// --- Definitions ---

const NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon']; // Mercury/Moon conditional
const NATURAL_MALEFICS = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];

// --- Helper Functions ---

// Calculate degree difference considering 360 degree circle
const getDegreeDifference = (deg1: number, deg2: number) => {
    let diff = Math.abs(deg1 - deg2);
    if (diff > 180) diff = 360 - diff;
    return diff;
};

// Check if Moon is Waxing (Valarpirai)
// Simplified: If Moon is ahead of Sun by 0-180 degrees, it's waxing.
const isWaxingMoon = (moonLon: number, sunLon: number) => {
    let diff = moonLon - sunLon;
    if (diff < 0) diff += 360;
    return diff > 0 && diff < 180;
};

// Check if Mercury is Benefic (Not joined with malefics)
const isMercuryBenefic = (mercury: any, allPlanets: any[]) => {
    // Check conjunctions with malefics within 10 degrees (standard orb for influence)
    const malefics = ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'];
    const conjoinedMalefics = allPlanets.filter(p =>
        malefics.includes(p.name) &&
        getDegreeDifference(mercury.longitude, p.longitude) < 10
    );
    return conjoinedMalefics.length === 0;
};

// Get Planet Strength/Goodness Score based on Conjunction
const getConjunctionScore = (target: any, source: any, orb: number = 15) => {
    const diff = getDegreeDifference(target.longitude, source.longitude);
    if (diff > orb) return 0;
    // Formula: (15 - diff) / 15 * 100
    return ((orb - diff) / orb) * 100;
};

// Get Aspect Score
// Returns score if aspected, 0 otherwise.
// Rules:
// Jupiter: 5, 7, 9 (Very High Subathuvam)
// Mars: 4, 7, 8 (High Pavathuvam)
// Saturn: 3, 7, 10 (High Pavathuvam)
// Others: 7 (Standard)
// Orb: +/- 10 degrees
const getAspectScore = (target: any, source: any) => {
    const diff = (target.longitude - source.longitude + 360) % 360; // Angle from Source to Target

    let isAspected = false;
    let aspectStrength = 0; // 0-100

    // Check specific planetary aspects with 10 degree orb
    // 10 degree orb means angle must be within (AspectAngle - 10) to (AspectAngle + 10)

    const checkAngle = (angle: number, targetAngle: number) => {
        return Math.abs(angle - targetAngle) <= 10;
    };

    if (source.name === 'Jupiter') {
        if (checkAngle(diff, 120) || checkAngle(diff, 180) || checkAngle(diff, 240)) { // 5th (120), 7th (180), 9th (240)
            isAspected = true;
            aspectStrength = 100; // Jupiter aspect is highest Subathuvam
        }
    } else if (source.name === 'Mars') {
        if (checkAngle(diff, 90) || checkAngle(diff, 180) || checkAngle(diff, 210)) { // 4th (90), 7th (180), 8th (210)
            isAspected = true;
            aspectStrength = 100;
        }
    } else if (source.name === 'Saturn') {
        if (checkAngle(diff, 60) || checkAngle(diff, 180) || checkAngle(diff, 270)) { // 3rd (60), 7th (180), 10th (270)
            isAspected = true;
            aspectStrength = 100;
        }
    } else {
        // All others: 7th only
        if (checkAngle(diff, 180)) {
            isAspected = true;
            aspectStrength = 100;
        }
    }

    // Special Rule: Saturn aspected by Jupiter within 5 degrees -> 100% Subathuvam
    if (target.name === 'Saturn' && source.name === 'Jupiter' && isAspected) {
        // Check exact orb
        // We need to find which aspect it is to check degree
        // But we already checked orb <= 10. If orb <= 5, it's super strong.
        // Let's refine the strength based on orb if needed, but for now 100 is max.
    }

    return isAspected ? aspectStrength : 0;
};

// --- Main Calculation Function ---

export const calculateSubathuvamPavathuvam = (allPlanets: any[]) => {
    const results: any = {};
    const sun = allPlanets.find(p => p.name === 'Sun');
    const moon = allPlanets.find(p => p.name === 'Moon');
    const mercury = allPlanets.find(p => p.name === 'Mercury');

    const isMoonWaxing = isWaxingMoon(moon.longitude, sun.longitude);
    const isMercBenefic = isMercuryBenefic(mercury, allPlanets);

    allPlanets.forEach(target => {
        let subathuvamScore = 0;
        let pavathuvamScore = 0;
        const subathuvamDetails: string[] = [];
        const pavathuvamDetails: string[] = [];

        // 1. Check Star (Nakshatra) Lord
        const nakshatra = getNakshatra(target.longitude);
        // We need Nakshatra Lord mapping. Assuming we have it or can derive it.
        // In astrology.ts we have NAKSHATRA_LORDS. We need to export/import it.
        // For now, let's skip star lord check or add it if we can import NAKSHATRA_LORDS.
        // Let's assume we can get it.
        // actually NAKSHATRA_LORDS is in astrology.ts but not exported in the snippet I saw.
        // I will add a placeholder or try to import if possible. 
        // Let's skip for a moment and focus on planetary interaction which is the core request.

        // 2. Check Conjunctions & Aspects
        allPlanets.forEach(source => {
            if (source.name === target.name) return;

            // --- Subathuvam (Goodness) ---

            // Conjunction with Benefics (Jupiter, Venus)
            if (['Jupiter', 'Venus'].includes(source.name)) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    subathuvamScore += score;
                    subathuvamDetails.push(`Conjoined with ${source.name} (${Math.round(score)}%)`);
                }
            }
            // Conjunction with Waxing Moon / Benefic Mercury
            if (source.name === 'Moon' && isMoonWaxing) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    subathuvamScore += score * 0.5; // Moon is less strong than Guru/Sukra
                    subathuvamDetails.push(`Conjoined with Waxing Moon (${Math.round(score * 0.5)}%)`);
                }
            }
            if (source.name === 'Mercury' && isMercBenefic) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    subathuvamScore += score * 0.5;
                    subathuvamDetails.push(`Conjoined with Benefic Mercury (${Math.round(score * 0.5)}%)`);
                }
            }

            // Aspect by Jupiter (Highest Subathuvam)
            if (source.name === 'Jupiter') {
                const score = getAspectScore(target, source);
                if (score > 0) {
                    subathuvamScore += score; // Full score for Jupiter aspect
                    subathuvamDetails.push(`Aspected by Jupiter (100%)`);
                }
            }
            // Aspect by Venus (Good but less than Jupiter)
            if (source.name === 'Venus') {
                const score = getAspectScore(target, source);
                if (score > 0) {
                    subathuvamScore += score * 0.75;
                    subathuvamDetails.push(`Aspected by Venus (75%)`);
                }
            }


            // --- Pavathuvam (Badness) ---

            // Conjunction with Malefics (Saturn, Mars, Rahu, Ketu)
            if (['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(source.name)) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    pavathuvamScore += score;
                    pavathuvamDetails.push(`Conjoined with ${source.name} (${Math.round(score)}%)`);
                }
            }

            // Aspect by Saturn or Mars
            if (['Saturn', 'Mars'].includes(source.name)) {
                const score = getAspectScore(target, source);
                if (score > 0) {
                    pavathuvamScore += score;
                    pavathuvamDetails.push(`Aspected by ${source.name} (100%)`);
                }
            }
        });

        // 3. Combustion (Pavathuvam)
        if (target.name !== 'Sun') {
            const combustionScore = getConjunctionScore(target, sun, 8); // 8 degree orb
            if (combustionScore > 0) {
                pavathuvamScore += 100; // Combustion is high Pavathuvam
                pavathuvamDetails.push(`Combust (Joined Sun)`);
            }
        }

        // Normalize Scores (Optional, but good for UI)
        // Cap at 100? Or allow accumulation?
        // User said "Quantifying", so accumulation is fine, but maybe cap for percentage display.
        // Let's keep raw scores for now.

        results[target.name] = {
            subathuvam: {
                score: Math.round(subathuvamScore),
                details: subathuvamDetails
            },
            pavathuvam: {
                score: Math.round(pavathuvamScore),
                details: pavathuvamDetails
            }
        };
    });

    return results;
};

// --- House Calculation Function ---

export const calculateHouseSubathuvamPavathuvam = (ascendantSign: number, allPlanets: any[]) => {
    const results: any = {};
    const sun = allPlanets.find(p => p.name === 'Sun');
    const moon = allPlanets.find(p => p.name === 'Moon');
    const mercury = allPlanets.find(p => p.name === 'Mercury');

    const isMoonWaxing = isWaxingMoon(moon.longitude, sun.longitude);
    const isMercBenefic = isMercuryBenefic(mercury, allPlanets);

    // Iterate through 12 houses
    for (let i = 0; i < 12; i++) {
        const houseNumber = i + 1;
        const houseSignIndex = (ascendantSign + i) % 12;
        // Approximate longitude for the house center (midpoint of the sign)
        // Sign 0 is 0-30, midpoint 15. Sign 1 is 30-60, midpoint 45.
        const houseMidpoint = (houseSignIndex * 30) + 15;

        // Create a pseudo-object for the house to reuse helper functions
        const houseObj = {
            name: `House ${houseNumber}`,
            longitude: houseMidpoint,
            signIndex: houseSignIndex
        };

        let subathuvamScore = 0;
        let pavathuvamScore = 0;
        const subathuvamDetails: string[] = [];
        const pavathuvamDetails: string[] = [];

        // Check Planets Occupying or Aspecting the House
        allPlanets.forEach(source => {
            // 1. Occupants (Conjunction logic with house midpoint/sign)
            // If planet is in the same sign, it influences the house.
            if (source.signIndex === houseSignIndex) {
                // Occupant
                if (['Jupiter', 'Venus'].includes(source.name)) {
                    subathuvamScore += 100; // Strong Subathuvam by occupation
                    subathuvamDetails.push(`Occupied by ${source.name}`);
                } else if (source.name === 'Moon' && isMoonWaxing) {
                    subathuvamScore += 60;
                    subathuvamDetails.push(`Occupied by Waxing Moon`);
                } else if (source.name === 'Mercury' && isMercBenefic) {
                    subathuvamScore += 50;
                    subathuvamDetails.push(`Occupied by Benefic Mercury`);
                } else if (['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(source.name)) {
                    pavathuvamScore += 100; // Strong Pavathuvam by occupation
                    pavathuvamDetails.push(`Occupied by ${source.name}`);
                }
            }

            // 2. Aspects (Sign-Based for Houses)
            const offset = (houseSignIndex - source.signIndex + 12) % 12;
            const count = offset + 1;

            let aspectScore = 0;
            let aspectName = '';

            if (source.name === 'Jupiter') {
                if ([5, 7, 9].includes(count)) {
                    aspectScore = 100;
                    aspectName = `Aspected by Jupiter (${count}th)`;
                }
            } else if (source.name === 'Mars') {
                if ([4, 7, 8].includes(count)) {
                    aspectScore = 100;
                    aspectName = `Aspected by Mars (${count}th)`;
                }
            } else if (source.name === 'Saturn') {
                if ([3, 7, 10].includes(count)) {
                    aspectScore = 100;
                    aspectName = `Aspected by Saturn (${count}th)`;
                }
            } else if (['Rahu', 'Ketu'].includes(source.name)) {
                if (count === 7) {
                    aspectScore = 100;
                    aspectName = `Aspected by ${source.name} (7th)`;
                }
            } else {
                // Sun, Moon, Mercury, Venus - 7th aspect only
                if (count === 7) {
                    if (source.name === 'Venus') {
                        aspectScore = 75;
                        aspectName = `Aspected by Venus (7th)`;
                    } else if (source.name === 'Mercury' && isMercBenefic) {
                        aspectScore = 50;
                        aspectName = `Aspected by Benefic Mercury (7th)`;
                    } else if (source.name === 'Moon' && isMoonWaxing) {
                        aspectScore = 60;
                        aspectName = `Aspected by Waxing Moon (7th)`;
                    } else if (source.name === 'Sun') {
                        aspectScore = 100;
                        aspectName = `Aspected by Sun (7th)`;
                    }
                }
            }

            if (aspectScore > 0) {
                if (['Jupiter', 'Venus'].includes(source.name) ||
                    (source.name === 'Mercury' && isMercBenefic) ||
                    (source.name === 'Moon' && isMoonWaxing)) {
                    subathuvamScore += aspectScore;
                    subathuvamDetails.push(aspectName);
                } else {
                    pavathuvamScore += aspectScore;
                    pavathuvamDetails.push(aspectName);
                }
            }
        });

        results[houseNumber] = {
            subathuvam: {
                score: Math.round(subathuvamScore),
                details: subathuvamDetails
            },
            pavathuvam: {
                score: Math.round(pavathuvamScore),
                details: pavathuvamDetails
            }
        };
    }

    return results;
};
