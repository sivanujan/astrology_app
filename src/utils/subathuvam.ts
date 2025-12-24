import { PLANETS, NAKSHATRAS, SIGN_LORDS } from './constants';
import { getNakshatra } from './astrology';
import { calculateAdityaGurujiSubathuvam } from './adityaGurujiSubathuvam';

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
export const isWaxingMoon = (moonLon: number, sunLon: number) => {
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

// Calculate Moon's Subathuvam/Pavathuvam Power based on Light Percentage
// Guruji: "பௌர்ணமி சந்திரன் குருவுக்கு இணையான சுபர்"
const getMoonPower = (moonLon: number, sunLon: number): { subPower: number; pavaPower: number; isBenefic: boolean } => {
    let diff = moonLon - sunLon;
    if (diff < 0) diff += 360;

    // Calculate light percentage (0% at New Moon, 100% at Full Moon)
    let lightPercentage = 0;
    if (diff <= 180) {
        lightPercentage = (diff / 180) * 100; // Waxing
    } else {
        lightPercentage = ((360 - diff) / 180) * 100; // Waning
    }

    // Power calculation based on Guruji's teaching
    if (lightPercentage >= 95) {
        // Full Moon (Pournami) = Equal to Jupiter
        return { subPower: 100, pavaPower: 0, isBenefic: true };
    } else if (lightPercentage >= 50) {
        // Waxing Moon (Shashti to Chaturdashi) = Scaled 70-95
        const scaledPower = 70 + ((lightPercentage - 50) / 45) * 25;
        return { subPower: scaledPower, pavaPower: 0, isBenefic: true };
    } else if (lightPercentage <= 5) {
        // New Moon (Amavasai) = Equal to Saturn in maleficence
        return { subPower: 0, pavaPower: 100, isBenefic: false };
    } else {
        // Waning Moon (Krishna Paksha) = Scaled 50-70 Pavathuvam
        const scaledPava = 50 + ((50 - lightPercentage) / 45) * 20;
        return { subPower: 0, pavaPower: scaledPava, isBenefic: false };
    }
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
// Improved Aspect Score Calculation
// 1. Checks Sign-Based Aspect (Vedic Standard) first.
// 2. Calculates Strength based on Degree Orb (Precision).
const getAspectScore = (target: any, source: any, customOrb: number = 10) => {
    // 1. Sign-Based Check
    // Handle wrap-around for sign index difference
    let signDiff = (target.signIndex - source.signIndex + 12) % 12;

    let isSignAspect = false;
    let idealAngle = 0;

    if (source.name === 'Jupiter') {
        if (signDiff === 4) { isSignAspect = true; idealAngle = 120; }      // 5th
        else if (signDiff === 6) { isSignAspect = true; idealAngle = 180; } // 7th
        else if (signDiff === 8) { isSignAspect = true; idealAngle = 240; } // 9th
    } else if (source.name === 'Mars') {
        if (signDiff === 3) { isSignAspect = true; idealAngle = 90; }       // 4th
        else if (signDiff === 6) { isSignAspect = true; idealAngle = 180; } // 7th
        else if (signDiff === 7) { isSignAspect = true; idealAngle = 210; } // 8th
    } else if (source.name === 'Saturn') {
        if (signDiff === 2) { isSignAspect = true; idealAngle = 60; }       // 3rd
        else if (signDiff === 6) { isSignAspect = true; idealAngle = 180; } // 7th
        else if (signDiff === 9) { isSignAspect = true; idealAngle = 270; } // 10th
    } else {
        // All others (Sun, Moon, Ven, Merc, Rahu, Ketu): 7th Only
        if (signDiff === 6) { isSignAspect = true; idealAngle = 180; }
    }

    if (!isSignAspect) return 0;

    // 2. Degree-Based Strength Calculation
    const angleDiffRaw = (target.longitude - source.longitude + 360) % 360;

    // Deviation from ideal angle
    let deflection = Math.abs(angleDiffRaw - idealAngle);
    if (deflection > 180) deflection = 360 - deflection;

    // Gentle Decay: 100% at exact, decays to 10% at 30 deg deflection.
    let score = 100 - (deflection * 3);

    // Clamp Score
    if (score < 10) score = 10; // Minimum visibility
    if (score > 100) score = 100;

    // Special Rule: Saturn aspected by Jupiter within 5 degrees -> 100% Subathuvam
    if (target.name === 'Saturn' && source.name === 'Jupiter' && deflection <= 5) {
        score = 100;
    }

    return score;
};

// --- Main Calculation Function ---

export const calculateSubathuvamPavathuvam = (allPlanets: any[], language: 'en' | 'ta' = 'en') => {
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

        // 1. Check Star (Nakshatra) Lord (Placeholder)
        // ...

        // 2. Check Conjunctions & Aspects
        allPlanets.forEach(source => {
            if (source.name === target.name) return;

            // --- Subathuvam (Goodness) ---

            // Conjunction with Benefics (Jupiter, Venus)
            if (['Jupiter', 'Venus'].includes(source.name)) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    subathuvamScore += score;
                    const conjoinedText = language === 'ta' ? 'கூட்டு' : 'Conjoined with';
                    subathuvamDetails.push(`${conjoinedText} ${translatePlanetName(source.name, language)} (${Math.round(score)}%)`);
                }
            }
            // Conjunction with Waxing Moon / Benefic Mercury
            if (source.name === 'Moon' && isMoonWaxing) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    subathuvamScore += score * 0.5; // Moon is less strong than Guru/Sukra
                    const conjoinedText = language === 'ta' ? 'கூட்டு' : 'Conjoined with';
                    subathuvamDetails.push(`${conjoinedText} ${translatePlanetName('Waxing Moon', language)} (${Math.round(score * 0.5)}%)`);
                }
            }
            if (source.name === 'Mercury' && isMercBenefic) {
                const score = getConjunctionScore(target, source);
                if (score > 0) {
                    subathuvamScore += score * 0.5;
                    const conjoinedText = language === 'ta' ? 'கூட்டு' : 'Conjoined with';
                    subathuvamDetails.push(`${conjoinedText} ${translatePlanetName('Benefic Mercury', language)} (${Math.round(score * 0.5)}%)`);
                }
            }

            // Aspects (Use Refined Function)
            // Determine if source is Benefic/Malefic for Aspect Calculation
            let isBeneficSource = ['Jupiter', 'Venus'].includes(source.name);
            if (source.name === 'Moon' && isMoonWaxing) isBeneficSource = true;
            if (source.name === 'Mercury' && isMercBenefic) isBeneficSource = true;

            let isMaleficSource = ['Saturn', 'Mars'].includes(source.name);

            // Calculate raw aspect score
            const aspectScore = getAspectScore(target, source);

            if (aspectScore > 0) {
                const aspectedText = language === 'ta' ? 'பார்வை' : 'Aspected by';
                if (source.name === 'Jupiter') {
                    subathuvamScore += aspectScore;
                    subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Jupiter', language)} (${Math.round(aspectScore)}%)`);
                } else if (source.name === 'Venus') {
                    subathuvamScore += aspectScore * 0.75;
                    subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Venus', language)} (${Math.round(aspectScore * 0.75)}%)`);
                } else if (source.name === 'Moon' && isMoonWaxing) {
                    subathuvamScore += aspectScore * 0.6;
                    subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Waxing Moon', language)} (${Math.round(aspectScore * 0.6)}%)`);
                } else if (source.name === 'Mercury' && isMercBenefic) {
                    subathuvamScore += aspectScore * 0.5;
                    subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Benefic Mercury', language)} (${Math.round(aspectScore * 0.5)}%)`);
                } else if (isMaleficSource) {
                    pavathuvamScore += aspectScore;
                    pavathuvamDetails.push(`${aspectedText} ${translatePlanetName(source.name, language)} (${Math.round(aspectScore)}%)`);
                }
            }
        });

        // 3. Combustion (Pavathuvam)
        if (target.name !== 'Sun') {
            const combustionScore = getConjunctionScore(target, sun, 8); // 8 degree orb
            if (combustionScore > 0) {
                pavathuvamScore += 100; // Combustion is high Pavathuvam
                const combustText = language === 'ta' ? 'எரிமம் (சூரியனுடன் கூட்டு)' : 'Combust (Joined Sun)';
                pavathuvamDetails.push(combustText);
            }
        }

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

// Helper to translate planet names
const translatePlanetName = (planetName: string, language: 'en' | 'ta'): string => {
    if (language !== 'ta') return planetName;
    const tamilNames: Record<string, string> = {
        'Sun': 'சூரியன்',
        'Moon': 'சந்திரன்',
        'Mars': 'செவ்வாய்',
        'Mercury': 'புதன்',
        'Jupiter': 'குரு',
        'Venus': 'சுக்ரன்',
        'Saturn': 'சனி',
        'Rahu': 'ராகு',
        'Ketu': 'கேது',
        'Waxing Moon': 'வளர்பிறை',
        'Waning Moon': 'தேய்பிறை',
        'Benefic Mercury': 'சுப புதன்',
        'Malefic Mercury': 'பாப புதன்'
    };
    return tamilNames[planetName] || planetName;
};

export const calculateHouseSubathuvamPavathuvam = (ascendantSign: number, allPlanets: any[], language: 'en' | 'ta' = 'en') => {
    const results: any = {};
    const sun = allPlanets.find(p => p.name === 'Sun');
    const moon = allPlanets.find(p => p.name === 'Moon');
    const mercury = allPlanets.find(p => p.name === 'Mercury');
    const jupiter = allPlanets.find(p => p.name === 'Jupiter');

    // Use new Moon power calculation
    const moonPower = getMoonPower(moon.longitude, sun.longitude);
    const isMoonBenefic = moonPower.isBenefic;
    const isMercBenefic = isMercuryBenefic(mercury, allPlanets);

    // NEW: Check if benefics are afflicted (lose their power)
    // சுபர்களின் சக்தி இழப்பு விதி
    const isBeneficAfflicted = (benefic: any, beneficName: string): boolean => {
        if (!benefic || !sun) return false;

        const malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu'];

        // Check combustion (அஸ்தங்கம்) - within specific degrees of Sun
        const combustionRanges: Record<string, number> = {
            'Moon': 12, 'Mars': 17, 'Mercury': 14,
            'Jupiter': 11, 'Venus': 10, 'Saturn': 15
        };

        if (combustionRanges[beneficName]) {
            const sunDiff = Math.abs(benefic.longitude - sun.longitude);
            const actualDiff = Math.min(sunDiff, 360 - sunDiff);
            if (actualDiff < combustionRanges[beneficName]) {
                return true; // Combusted = afflicted
            }
        }

        // Check malefic conjunction (within 10°)
        // குரு சனி/ராகு/கேது உடன் = சக்தி இழப்பு
        for (const malefic of allPlanets.filter(p => malefics.includes(p.name))) {
            const conjDiff = Math.abs(benefic.longitude - malefic.longitude);
            const actualDiff = Math.min(conjDiff, 360 - conjDiff);
            if (actualDiff <= 10) {
                return true; // Conjoined with malefic = afflicted
            }
        }

        return false;
    };

    // Check if Jupiter has power (not afflicted)
    const jupiterHasPower = jupiter ? !isBeneficAfflicted(jupiter, 'Jupiter') : false;

    // Get planet Subathuvam to check neutral status
    const planetSubathuvam = calculateAdityaGurujiSubathuvam(allPlanets);

    // UPDATED: Check if malefics are neutral using planet Subathuvam results
    // சுபத்துவம் அடைந்த பாபி = நடுநிலை
    const isMaleficNeutral = (malefic: any): boolean => {
        if (!malefic) return false;

        // Use planet Subathuvam results isNeutral flag
        const maleficSubResult = planetSubathuvam[malefic.name];
        if (maleficSubResult && maleficSubResult.isNeutral) {
            return true; // Planet calculation already determined neutral status
        }

        return false;
    };

    // Iterate through 12 houses
    for (let i = 0; i < 12; i++) {
        const houseNumber = i + 1;
        const houseSignIndex = (ascendantSign + i) % 12;
        // Approximate longitude for the house center (midpoint of the sign)
        // Sign 0 is 0-30, midpoint 15. Sign 1 is 30-60, midpoint 45.
        const houseMidpoint = (houseSignIndex * 30) + 15;

        // Create a pseudo-object for the house to reuse helper functions
        const houseName = language === 'ta' ? `வீடு ${houseNumber}` : `House ${houseNumber}`;
        const houseObj = {
            name: houseName,
            longitude: houseMidpoint,
            signIndex: houseSignIndex // Kept for reference
        };

        let subathuvamScore = 0;
        let pavathuvamScore = 0;
        const subathuvamDetails: string[] = [];
        const pavathuvamDetails: string[] = [];

        // Check Planets Occupying or Aspecting the House
        allPlanets.forEach(source => {
            // 1. Occupants (Sign-based placement)
            if (source.signIndex === houseSignIndex) {
                const occupiedText = language === 'ta' ? 'ஆக்கிரமித்தது' : 'Occupied by';

                // REFINED SUBATHUVAM POWERS
                if (source.name === 'Jupiter') {
                    subathuvamScore += 100; // Jupiter = 100 (Top benefic)
                    subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                } else if (source.name === 'Moon') {
                    if (isMoonBenefic) {
                        subathuvamScore += moonPower.subPower; // Full/Waxing Moon: 70-100
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName('Moon', language)} (${Math.round(moonPower.subPower)}%)`);
                    } else {
                        pavathuvamScore += moonPower.pavaPower; // New/Waning Moon: 50-100 pava
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName('Moon', language)} (-${Math.round(moonPower.pavaPower)}%)`);
                    }
                } else if (source.name === 'Venus') {
                    subathuvamScore += 90; // Venus = 90
                    subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                } else if (source.name === 'Mercury') {
                    if (isMercBenefic) {
                        subathuvamScore += 80; // Solo Mercury = 80
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName('Benefic Mercury', language)}`);
                    } else {
                        pavathuvamScore += 50; // Mercury with malefics = -50
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName('Malefic Mercury', language)}`);
                    }
                }

                // REFINED PAVATHUVAM POWERS
                // சுபத்துவம் அடைந்த பாபி = நடுநிலை
                else if (source.name === 'Saturn') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += 100;
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                    }
                } else if (source.name === 'Rahu') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += 90;
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                    }
                } else if (source.name === 'Ketu') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += 80;
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                    }
                } else if (source.name === 'Mars') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += 75;
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                    }
                } else if (source.name === 'Sun') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += 60;
                        pavathuvamDetails.push(`${occupiedText} ${translatePlanetName(source.name, language)}`);
                    }
                }
            }

            // 2. Aspects (Degree Based with Refined Powers)
            const aspectScore = getAspectScore(houseObj, source, 16);

            if (aspectScore > 0) {
                const aspectedText = language === 'ta' ? 'பார்வை' : 'Aspected by';

                // SUBATHUVAM ASPECTS (Only if benefic has power!)
                if (source.name === 'Jupiter') {
                    if (jupiterHasPower) {
                        subathuvamScore += aspectScore; // Powerful Jupiter aspect
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Jupiter', language)}`);
                    } else {
                        // Afflicted Jupiter - no Subathuvam power
                        const afflictedText = language === 'ta' ? 'பார்வை (பலவீனம்)' : 'Aspected (Afflicted)';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Jupiter', language)} - ${afflictedText}`);
                    }
                } else if (source.name === 'Venus') {
                    const venus = allPlanets.find(p => p.name === 'Venus');
                    const venusHasPower = venus ? !isBeneficAfflicted(venus, 'Venus') : false;
                    if (venusHasPower) {
                        subathuvamScore += aspectScore * 0.90; // Venus = 90% of aspect
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Venus', language)}`);
                    } else {
                        const afflictedText = language === 'ta' ? 'பார்வை (பலவீனம்)' : 'Aspected (Afflicted)';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Venus', language)} - ${afflictedText}`);
                    }
                } else if (source.name === 'Moon' && isMoonBenefic) {
                    const moonAspectPower = (moonPower.subPower / 100) * aspectScore;
                    subathuvamScore += moonAspectPower; // Scaled by Moon's power (70-100%)
                    subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Moon', language)} (${Math.round(moonAspectPower)}%)`);
                } else if (source.name === 'Mercury') {
                    if (isMercBenefic) {
                        subathuvamScore += aspectScore * 0.80; // Solo Mercury = 80%
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Benefic Mercury', language)}`);
                    } else {
                        // Mercury with malefics - no Subathuvam power
                        const afflictedText = language === 'ta' ? 'பார்வை (பாவி புதன்)' : 'Aspected (Malefic Mercury)';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Mercury', language)} - ${afflictedText}`);
                    }
                }

                // PAVATHUVAM ASPECTS
                // சுபத்துவம் அடைந்த பாபி பார்வை = நடுநிலை
                else if (source.name === 'Saturn') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Saturn', language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += aspectScore;
                        pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Saturn', language)}`);
                    }
                } else if (source.name === 'Rahu') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Rahu', language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += aspectScore * 0.90;
                        pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Rahu', language)}`);
                    }
                } else if (source.name === 'Ketu') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Ketu', language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += aspectScore * 0.80;
                        pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Ketu', language)}`);
                    }
                } else if (source.name === 'Mars') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Mars', language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += aspectScore * 0.75;
                        pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Mars', language)}`);
                    }
                } else if (source.name === 'Sun') {
                    if (isMaleficNeutral(source)) {
                        const neutralText = language === 'ta' ? 'நடுநிலை' : 'Neutral';
                        subathuvamDetails.push(`${aspectedText} ${translatePlanetName('Sun', language)} (${neutralText})`);
                    } else {
                        pavathuvamScore += aspectScore * 0.60;
                        pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Sun', language)}`);
                    }
                } else if (source.name === 'Moon' && !isMoonBenefic) {
                    const moonPavaAspect = (moonPower.pavaPower / 100) * aspectScore;
                    pavathuvamScore += moonPavaAspect; // Waning Moon pava aspect
                    pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Moon', language)} (-${Math.round(moonPavaAspect)}%)`);
                } else if (source.name === 'Mercury' && !isMercBenefic) {
                    pavathuvamScore += aspectScore * 0.50; // Mercury with malefics = 50%
                    pavathuvamDetails.push(`${aspectedText} ${translatePlanetName('Malefic Mercury', language)}`);
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
