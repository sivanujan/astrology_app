/**
 * Yoga Detection System
 * 
 * Detects various yogas (planetary combinations) in the chart
 * Including Raja Yogas, Dhana Yogas, and special combinations
 */

import { Yoga, YogaType } from '../types/enhancedDasaTypes';
import { PlanetPosition } from './planetaryRelationships';

/**
 * Detect all yogas in the chart
 */
export function detectAllYogas(
    planets: PlanetPosition[],
    ascendantSign: string
): Yoga[] {
    const yogas: Yoga[] = [];

    // Add each yoga detection
    yogas.push(...detectGajaKesariYoga(planets));
    yogas.push(...detectBudhadityaYoga(planets));
    yogas.push(...detectChandraMangalaYoga(planets));
    yogas.push(...detectRajaYogas(planets, ascendantSign));
    yogas.push(...detectDhanaYogas(planets, ascendantSign));
    yogas.push(...detectVipritaRajaYogas(planets));
    yogas.push(...detectNeechaBhangaRajayoga(planets));

    return yogas;
}

/**
 * Gaja Kesari Yoga
 * Jupiter in a Kendra (1,4,7,10) from Moon
 */
function detectGajaKesariYoga(planets: PlanetPosition[]): Yoga[] {
    const yogas: Yoga[] = [];

    const jupiter = planets.find(p => p.name === 'Jupiter');
    const moon = planets.find(p => p.name === 'Moon');

    if (!jupiter || !moon) return yogas;

    // Calculate houses from Moon
    const houseDiff = (jupiter.house - moon.house + 12) % 12;
    const kendraHouses = [0, 3, 6, 9]; // 1st, 4th, 7th, 10th from Moon

    if (kendraHouses.includes(houseDiff)) {
        yogas.push({
            type: 'GajaKesari',
            name: 'Gaja Kesari Yoga (கஜகேசரி யோகம்)',
            description: 'Jupiter in Kendra from Moon - Wealth, wisdom, and fame',
            planetsInvolved: ['Jupiter', 'Moon'],
            houses: [jupiter.house, moon.house],
            strength: 80,
            effect: 'Positive',
        });
    }

    return yogas;
}

/**
 * Budhaditya Yoga
 * Sun and Mercury conjunction (within 12° in Vedic)
 */
function detectBudhadityaYoga(planets: PlanetPosition[]): Yoga[] {
    const yogas: Yoga[] = [];

    const sun = planets.find(p => p.name === 'Sun');
    const mercury = planets.find(p => p.name === 'Mercury');

    if (!sun || !mercury) return yogas;

    // Check if in same house
    if (sun.house === mercury.house) {
        yogas.push({
            type: 'Budhaditya',
            name: 'Budhaditya Yoga (புதாதித்ய யோகம்)',
            description: 'Sun-Mercury conjunction - Intelligence, communication skills',
            planetsInvolved: ['Sun', 'Mercury'],
            houses: [sun.house],
            strength: 70,
            effect: 'Positive',
        });
    }

    return yogas;
}

/**
 * Chandra Mangala Yoga
 * Moon and Mars conjunction
 */
function detectChandraMangalaYoga(planets: PlanetPosition[]): Yoga[] {
    const yogas: Yoga[] = [];

    const moon = planets.find(p => p.name === 'Moon');
    const mars = planets.find(p => p.name === 'Mars');

    if (!moon || !mars) return yogas;

    // Check if in same house
    if (moon.house === mars.house) {
        yogas.push({
            type: 'ChandraMangala',
            name: 'Chandra Mangala Yoga (சந்திர மங்கள யோகம்)',
            description: 'Moon-Mars conjunction - Wealth through effort, property',
            planetsInvolved: ['Moon', 'Mars'],
            houses: [moon.house],
            strength: 65,
            effect: 'Positive',
        });
    }

    return yogas;
}

/**
 * Raja Yogas
 * Combination of Kendra (1,4,7,10) and Trikona (1,5,9) lords
 */
function detectRajaYogas(planets: PlanetPosition[], ascendantSign: string): Yoga[] {
    const yogas: Yoga[] = [];

    // Simplified Raja Yoga detection
    // In a real implementation, we'd need to know which planets rule which houses
    // For now, detecting if benefics are in Kendras in good dignity

    const kendraHouses = [1, 4, 7, 10];
    const benefics = ['Jupiter', 'Venus'];

    for (const benefic of benefics) {
        const planet = planets.find(p => p.name === benefic);
        if (planet && kendraHouses.includes(planet.house)) {
            yogas.push({
                type: 'RajaYoga',
                name: `Raja Yoga - ${benefic} in ${planet.house}th house`,
                description: `${benefic} in Kendra - Power and authority`,
                planetsInvolved: [benefic],
                houses: [planet.house],
                strength: 75,
                effect: 'Positive',
            });
        }
    }

    return yogas;
}

/**
 * Dhana Yogas (Wealth Yogas)
 * 2nd and 11th house lords in good positions
 */
function detectDhanaYogas(planets: PlanetPosition[], ascendantSign: string): Yoga[] {
    const yogas: Yoga[] = [];

    // Simplified Dhana Yoga: Jupiter or Venus in 2nd, 5th, 9th, or 11th house
    const wealthHouses = [2, 5, 9, 11];
    const wealthPlanets = ['Jupiter', 'Venus'];

    for (const planetName of wealthPlanets) {
        const planet = planets.find(p => p.name === planetName);
        if (planet && wealthHouses.includes(planet.house)) {
            yogas.push({
                type: 'DhanaYoga',
                name: `Dhana Yoga - ${planetName} in ${planet.house}th`,
                description: `${planetName} in wealth house - Financial prosperity`,
                planetsInvolved: [planetName],
                houses: [planet.house],
                strength: 70,
                effect: 'Positive',
            });
        }
    }

    return yogas;
}

/**
 * Viparita Raja Yogas
 * Lords of 6th, 8th, 12th (Dusthana) in Dusthanas
 * This is a complex yoga that gives good results from bad houses
 */
function detectVipritaRajaYogas(planets: PlanetPosition[]): Yoga[] {
    const yogas: Yoga[] = [];

    // Simplified: If Saturn (natural 8th karaka) is in 12th or vice versa
    const saturn = planets.find(p => p.name === 'Saturn');
    const rahu = planets.find(p => p.name === 'Rahu');

    const dusthanas = [6, 8, 12];

    if (saturn && dusthanas.includes(saturn.house)) {
        yogas.push({
            type: 'VipritaRajaYoga',
            name: 'Viparita Raja Yoga (விபரீத ராஜ யோகம்)',
            description: 'Saturn in Dusthana - Success from difficulties',
            planetsInvolved: ['Saturn'],
            houses: [saturn.house],
            strength: 60,
            effect: 'Mixed',
        });
    }

    return yogas;
}

/**
 * Neecha Bhanga Raja Yoga
 * Cancellation of debilitation
 * When a debilitated planet has certain conditions that cancel the debilitation
 */
function detectNeechaBhangaRajayoga(planets: PlanetPosition[]): Yoga[] {
    const yogas: Yoga[] = [];

    // Conditions for Neecha Bhanga:
    // 1. Lord of the sign of debilitation in a Kendra from Lagna or Moon
    // 2. Planet exalted in Navamsa
    // 3. Dispositor of debilitated planet in Kendra/Trikona

    // This requires detailed chart analysis - simplified version:
    // Check if any debilitated planets exist and apply heuristic

    const debilitatedSigns: Record<string, string> = {
        'Sun': 'Libra',
        'Moon': 'Scorpio',
        'Mars': 'Cancer',
        'Mercury': 'Pisces',
        'Jupiter': 'Capricorn',
        'Venus': 'Virgo',
        'Saturn': 'Aries',
    };

    for (const planet of planets) {
        if (debilitatedSigns[planet.name] === planet.sign) {
            // Planet is debilitated - check for cancellation
            // Simplified: if in Kendra house
            if ([1, 4, 7, 10].includes(planet.house)) {
                yogas.push({
                    type: 'NeechaBhangaRajayoga',
                    name: `Neecha Bhanga Raja Yoga - ${planet.name}`,
                    description: `Debilitation cancelled for ${planet.name} - Rise after fall`,
                    planetsInvolved: [planet.name],
                    houses: [planet.house],
                    strength: 65,
                    effect: 'Positive',
                });
            }
        }
    }

    return yogas;
}

/**
 * Get yoga description in Tamil
 */
export function getYogaDescriptionInTamil(yoga: Yoga): string {
    const tamilDescriptions: Record<YogaType, string> = {
        'GajaKesari': 'சந்திரனிடமிருந்து குரு கேந்திரத்தில் - செல்வம், ஞானம், புகழ்',
        'Budhaditya': 'சூரியன்-புதன் சேர்க்கை - புத்திசாலித்தனம், தொடர்பு திறன்',
        'ChandraMangala': 'சந்திரன்-செவ்வாய் சேர்க்கை - முயற்சி மூலம் செல்வம், சொத்து',
        'RajaYoga': 'அதிகாரம் மற்றும் செல்வத்தை வழங்கும் யோகம்',
        'DhanaYoga': 'நிதி செழிப்பை வழங்கும் யோகம்',
        'VipritaRajaYoga': 'சிரமங்களிலிருந்து வெற்றி',
        'NeechaBhangaRajayoga': 'வீழ்ச்சிக்குப் பிறகு எழுச்சி',
        'PanchamahapurushaYoga': 'மகா புருஷ யோகம் - மாபெரும் ஆளுமை',
        'Other': 'மற்ற யோகம்',
    };

    return tamilDescriptions[yoga.type] || yoga.description;
}
