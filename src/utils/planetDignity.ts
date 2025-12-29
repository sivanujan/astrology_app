/**
 * Planet Dignity Calculator
 * 
 * Calculates whether a planet is Exalted, Debilitated, in Own sign,
 * Friend sign, Enemy sign, or Neutral sign.
 */

import { PlanetDignity } from '../types/enhancedDasaTypes';

// Exaltation signs and degrees
const EXALTATION_DATA: Record<string, { sign: string; degree: number }> = {
    'Sun': { sign: 'Aries', degree: 10 },
    'Moon': { sign: 'Taurus', degree: 3 },
    'Mars': { sign: 'Capricorn', degree: 28 },
    'Mercury': { sign: 'Virgo', degree: 15 },
    'Jupiter': { sign: 'Cancer', degree: 5 },
    'Venus': { sign: 'Pisces', degree: 27 },
    'Saturn': { sign: 'Libra', degree: 20 },
    // Rahu/Ketu exaltation is debated, using common interpretation
    'Rahu': { sign: 'Taurus', degree: 15 },
    'Ketu': { sign: 'Scorpio', degree: 15 },
};

// Debilitation signs (opposite of exaltation)
const DEBILITATION_DATA: Record<string, { sign: string; degree: number }> = {
    'Sun': { sign: 'Libra', degree: 10 },
    'Moon': { sign: 'Scorpio', degree: 3 },
    'Mars': { sign: 'Cancer', degree: 28 },
    'Mercury': { sign: 'Pisces', degree: 15 },
    'Jupiter': { sign: 'Capricorn', degree: 5 },
    'Venus': { sign: 'Virgo', degree: 27 },
    'Saturn': { sign: 'Aries', degree: 20 },
    'Rahu': { sign: 'Scorpio', degree: 15 },
    'Ketu': { sign: 'Taurus', degree: 15 },
};

// Own signs (Swakshetra)
const OWN_SIGNS: Record<string, string[]> = {
    'Sun': ['Leo'],
    'Moon': ['Cancer'],
    'Mars': ['Aries', 'Scorpio'],
    'Mercury': ['Gemini', 'Virgo'],
    'Jupiter': ['Sagittarius', 'Pisces'],
    'Venus': ['Taurus', 'Libra'],
    'Saturn': ['Capricorn', 'Aquarius'],
    'Rahu': [],  // Shadow planet, no ownership
    'Ketu': [],  // Shadow planet, no ownership
};

// Natural friendships (Naisargika Maitri)
const NATURAL_FRIENDS: Record<string, string[]> = {
    'Sun': ['Moon', 'Mars', 'Jupiter'],
    'Moon': ['Sun', 'Mercury'],
    'Mars': ['Sun', 'Moon', 'Jupiter'],
    'Mercury': ['Sun', 'Venus'],
    'Jupiter': ['Sun', 'Moon', 'Mars'],
    'Venus': ['Mercury', 'Saturn'],
    'Saturn': ['Mercury', 'Venus'],
    'Rahu': ['Mercury', 'Venus', 'Saturn'],
    'Ketu': ['Mars', 'Jupiter'],
};

// Natural enemies
const NATURAL_ENEMIES: Record<string, string[]> = {
    'Sun': ['Venus', 'Saturn'],
    'Moon': ['None'],
    'Mars': ['Mercury'],
    'Mercury': ['Moon'],
    'Jupiter': ['Mercury', 'Venus'],
    'Venus': ['Sun', 'Moon'],
    'Saturn': ['Sun', 'Moon', 'Mars'],
    'Rahu': ['Sun', 'Moon'],
    'Ketu': ['Sun', 'Moon'],
};

/**
 * Calculate planet dignity based on sign placement
 */
export function calculatePlanetDignity(
    planet: string,
    sign: string,
    degree: number
): PlanetDignity {
    // Check exaltation
    const exaltationData = EXALTATION_DATA[planet];
    if (exaltationData && exaltationData.sign === sign) {
        return 'Exalted';
    }

    // Check debilitation
    const debilitationData = DEBILITATION_DATA[planet];
    if (debilitationData && debilitationData.sign === sign) {
        return 'Debilitated';
    }

    // Check own sign
    const ownSigns = OWN_SIGNS[planet] || [];
    if (ownSigns.includes(sign)) {
        return 'Own';
    }

    // Check friend/enemy sign
    // Need to know who owns the sign
    const signLord = getSignLord(sign);
    if (signLord) {
        const friends = NATURAL_FRIENDS[planet] || [];
        const enemies = NATURAL_ENEMIES[planet] || [];

        if (friends.includes(signLord)) {
            return 'Friend';
        }

        if (enemies.includes(signLord)) {
            return 'Enemy';
        }
    }

    return 'Neutral';
}

/**
 * Get the lord of a sign
 */
function getSignLord(sign: string): string | null {
    const signLordship: Record<string, string> = {
        'Aries': 'Mars',
        'Taurus': 'Venus',
        'Gemini': 'Mercury',
        'Cancer': 'Moon',
        'Leo': 'Sun',
        'Virgo': 'Mercury',
        'Libra': 'Venus',
        'Scorpio': 'Mars',
        'Sagittarius': 'Jupiter',
        'Capricorn': 'Saturn',
        'Aquarius': 'Saturn',
        'Pisces': 'Jupiter',
    };

    return signLordship[sign] || null;
}

/**
 * Check if planets are naturally friends
 */
export function areNaturalFriends(planet1: string, planet2: string): boolean {
    const friends = NATURAL_FRIENDS[planet1] || [];
    return friends.includes(planet2);
}

/**
 * Check if planets are naturally enemies
 */
export function areNaturalEnemies(planet1: string, planet2: string): boolean {
    const enemies = NATURAL_ENEMIES[planet1] || [];
    return enemies.includes(planet2);
}

/**
 * Get natural friendship status between two planets
 */
export function getNaturalFriendship(planet1: string, planet2: string): 'Friend' | 'Enemy' | 'Neutral' {
    if (areNaturalFriends(planet1, planet2)) {
        return 'Friend';
    }
    if (areNaturalEnemies(planet1, planet2)) {
        return 'Enemy';
    }
    return 'Neutral';
}

/**
 * Calculate temporal (Tatkalika) friendship based on house placement
 * Planets in 2nd, 3rd, 4th, 10th, 11th, 12th from each other are temporal friends
 */
export function getTemporalFriendship(
    planet1House: number,
    planet2House: number
): 'Friend' | 'Enemy' | 'Neutral' {
    const diff = Math.abs(planet1House - planet2House);

    // Friendly houses: 2, 3, 4, 10, 11, 12
    const friendlyDiffs = [2, 3, 4, 10, 11, 12];

    if (friendlyDiffs.includes(diff)) {
        return 'Friend';
    }

    // Enemy houses: 1, 5, 6, 7, 8, 9
    return 'Enemy';
}

/**
 * Get combined (Panchadha Maitri) friendship
 * Friend + Friend = Great Friend
 * Friend + Neutral / Neutral + Friend = Friend
 * Friend + Enemy / Enemy + Friend = Neutral
 * Neutral + Neutral = Neutral
 * Neutral + Enemy / Enemy + Neutral = Enemy
 * Enemy + Enemy = Great Enemy
 */
export function getCombinedFriendship(
    natural: 'Friend' | 'Enemy' | 'Neutral',
    temporal: 'Friend' | 'Enemy' | 'Neutral'
): 'Friend' | 'Enemy' | 'Neutral' {
    const friendshipScore: Record<string, number> = {
        'Friend': 2,
        'Neutral': 1,
        'Enemy': 0,
    };

    const combinedScore = friendshipScore[natural] + friendshipScore[temporal];

    // Score 4: Great Friend -> Friend
    // Score 3: Friend -> Friend
    // Score 2: Neutral -> Neutral
    // Score 1: Enemy -> Enemy
    // Score 0: Great Enemy -> Enemy

    if (combinedScore >= 3) {
        return 'Friend';
    } else if (combinedScore === 2) {
        return 'Neutral';
    } else {
        return 'Enemy';
    }
}

/**
 * Check if exaltation is deep (within degree range)
 */
export function isDeepExaltation(planet: string, sign: string, degree: number): boolean {
    const exaltationData = EXALTATION_DATA[planet];
    if (!exaltationData || exaltationData.sign !== sign) {
        return false;
    }

    // Within 5 degrees of exact exaltation degree
    return Math.abs(degree - exaltationData.degree) <= 5;
}

/**
 * Check if debilitation is deep (within degree range)
 */
export function isDeepDebilitation(planet: string, sign: string, degree: number): boolean {
    const debilitationData = DEBILITATION_DATA[planet];
    if (!debilitationData || debilitationData.sign !== sign) {
        return false;
    }

    // Within 5 degrees of exact debilitation degree
    return Math.abs(degree - debilitationData.degree) <= 5;
}
