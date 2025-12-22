// Comprehensive Dasa Analysis System
// Based on Vedic Astrology principles with 5-step scoring methodology

import { SIGN_LORDS } from './constants';

// Types
export interface DasaScore {
    totalScore: number;
    rating: number; // 1-5 stars
    quality: 'EXCELLENT' | 'VERY GOOD' | 'GOOD' | 'AVERAGE' | 'CHALLENGING' | 'DIFFICULT';
    breakdown: {
        lordship: LordshipScore;
        placement: PlacementScore;
        subathuvam: SubathuvamScore;
        dignity: DignityScore;
        aspects: AspectScore;
    };
}

export interface LordshipScore {
    score: number; // 0-20
    percentage: number; // 0-100 (weighted)
    houses: number[];
    quality: string;
    details: string;
}

export interface PlacementScore {
    score: number; // 0-15
    percentage: number; // 0-100 (weighted)
    house: number;
    quality: string;
    maleficBonus: boolean;
}

export interface SubathuvamScore {
    score: number; // 0-12
    percentage: number; // 0-100 (weighted)
    nature: 'Benefic' | 'Malefic';
    adjustments: string[];
}

export interface DignityScore {
    score: number; // 0-13
    percentage: number; // 0-100 (weighted)
    dignity: string;
    factors: string[];
}

export interface AspectScore {
    score: number; // 0-10
    percentage: number; // 0-100 (weighted)
    conjunctions: string[];
    aspects: string[];
}

// House lordship mapping for all 12 Lagnas
const HOUSE_LORDSHIP_MAP: Record<number, Record<string, number[]>> = {
    // Lagna 0 = Aries
    0: {
        'Sun': [5], 'Moon': [4], 'Mars': [1, 8], 'Mercury': [3, 6],
        'Jupiter': [9, 12], 'Venus': [2, 7], 'Saturn': [10, 11]
    },
    // Lagna 1 = Taurus
    1: {
        'Sun': [4], 'Moon': [3], 'Mars': [7, 12], 'Mercury': [2, 5],
        'Jupiter': [8, 11], 'Venus': [1, 6], 'Saturn': [9, 10]
    },
    // Lagna 2 = Gemini
    2: {
        'Sun': [3], 'Moon': [2], 'Mars': [6, 11], 'Mercury': [1, 4],
        'Jupiter': [7, 10], 'Venus': [5, 12], 'Saturn': [8, 9]
    },
    // Lagna 3 = Cancer
    3: {
        'Sun': [2], 'Moon': [1], 'Mars': [5, 10], 'Mercury': [3, 12],
        'Jupiter': [6, 9], 'Venus': [4, 11], 'Saturn': [7, 8]
    },
    // Lagna 4 = Leo
    4: {
        'Sun': [1], 'Moon': [12], 'Mars': [4, 9], 'Mercury': [2, 11],
        'Jupiter': [5, 8], 'Venus': [3, 10], 'Saturn': [6, 7]
    },
    // Lagna 5 = Virgo
    5: {
        'Sun': [12], 'Moon': [11], 'Mars': [3, 8], 'Mercury': [1, 10],
        'Jupiter': [4, 7], 'Venus': [2, 9], 'Saturn': [5, 6]
    },
    // Lagna 6 = Libra
    6: {
        'Sun': [11], 'Moon': [10], 'Mars': [2, 7], 'Mercury': [9, 12],
        'Jupiter': [3, 6], 'Venus': [1, 8], 'Saturn': [4, 5]
    },
    // Lagna 7 = Scorpio
    7: {
        'Sun': [10], 'Moon': [9], 'Mars': [1, 6], 'Mercury': [8, 11],
        'Jupiter': [2, 5], 'Venus': [7, 12], 'Saturn': [3, 4]
    },
    // Lagna 8 = Sagittarius
    8: {
        'Sun': [9], 'Moon': [8], 'Mars': [5, 12], 'Mercury': [7, 10],
        'Jupiter': [1, 4], 'Venus': [6, 11], 'Saturn': [2, 3]
    },
    // Lagna 9 = Capricorn
    9: {
        'Sun': [8], 'Moon': [7], 'Mars': [4, 11], 'Mercury': [6, 9],
        'Jupiter': [3, 12], 'Venus': [5, 10], 'Saturn': [1, 2]
    },
    // Lagna 10 = Aquarius
    10: {
        'Sun': [7], 'Moon': [6], 'Mars': [3, 10], 'Mercury': [5, 8],
        'Jupiter': [2, 11], 'Venus': [4, 9], 'Saturn': [1, 12]
    },
    // Lagna 11 = Pisces
    11: {
        'Sun': [6], 'Moon': [5], 'Mars': [2, 9], 'Mercury': [4, 7],
        'Jupiter': [1, 10], 'Venus': [3, 8], 'Saturn': [11, 12]
    }
};

// Tamil translations
const QUALITY_TRANSLATIONS: Record<string, { en: string; ta: string }> = {
    'EXCELLENT': { en: 'EXCELLENT PERIOD', ta: 'மிகச்சிறந்த காலம்' },
    'VERY_GOOD': { en: 'VERY GOOD PERIOD', ta: 'மிக நல்ல காலம்' },
    'GOOD': { en: 'GOOD PERIOD', ta: 'நல்ல காலம்' },
    'AVERAGE': { en: 'AVERAGE PERIOD', ta: 'சராசரி காலம்' },
    'CHALLENGING': { en: 'CHALLENGING PERIOD', ta: 'கஷ்டமான காலம்' },
    'DIFFICULT': { en: 'DIFFICULT PERIOD', ta: 'மிக கஷ்டமான காலம்' }
};

/**
 * STEP 1: House Lordship Analysis (40% weightage)
 * Determines quality based on which houses the planet rules
 */
export function calculateLordshipScore(
    planetName: string,
    lagnaIndex: number,
    language: 'en' | 'ta' = 'en'
): LordshipScore {
    const lordship = HOUSE_LORDSHIP_MAP[lagnaIndex];
    const houses = lordship[planetName] || [];

    let score = 0;
    const qualities: string[] = [];

    houses.forEach(house => {
        // Trikona houses (1, 5, 9): +10 points
        if ([1, 5, 9].includes(house)) {
            score += 10;
            qualities.push(language === 'ta' ? `திரிகோண வீடு ${house}` : `Trikona House ${house}`);
        }
        // Kendra houses (4, 7, 10): +8 points
        else if ([4, 7, 10].includes(house)) {
            score += 8;
            qualities.push(language === 'ta' ? `கேந்திர வீடு ${house}` : `Kendra House ${house}`);
        }
        // 8th house: -10 points (most dangerous)
        else if (house === 8) {
            score -= 10;
            qualities.push(language === 'ta' ? `8வது வீடு (ஆயுள் ஸ்தானம்)` : `8th House (Ayul Sthana)`);
        }
        // 6th house: -5 points
        else if (house === 6) {
            score -= 5;
            qualities.push(language === 'ta' ? `6வது வீடு (எதிரிகள்)` : `6th House (Enemies)`);
        }
        // 12th house: +2 points (mixed)
        else if (house === 12) {
            score += 2;
            qualities.push(language === 'ta' ? `12வது வீடு (மோட்சம்)` : `12th House (Moksha)`);
        }
        // Upachaya (3, 11): +6 points
        else if ([3, 11].includes(house)) {
            score += 6;
            qualities.push(language === 'ta' ? `உபசய வீடு ${house}` : `Upachaya House ${house}`);
        }
        // Neutral (2): +5 points
        else if (house === 2) {
            score += 5;
            qualities.push(language === 'ta' ? `2வது வீடு (செல்வம்)` : `2nd House (Wealth)`);
        }
    });

    // Normalize to 0-20 range
    const normalizedScore = Math.max(0, Math.min(20, score));
    const percentage = (normalizedScore / 20) * 40; // 40% weightage

    let quality = 'Neutral';
    if (normalizedScore >= 16) quality = language === 'ta' ? 'மிகச்சிறந்தது' : 'Excellent';
    else if (normalizedScore >= 12) quality = language === 'ta' ? 'நல்லது' : 'Good';
    else if (normalizedScore >= 8) quality = language === 'ta' ? 'சராசரி' : 'Average';
    else quality = language === 'ta' ? 'சவால்' : 'Challenging';

    const details = qualities.join(', ');

    return {
        score: normalizedScore,
        percentage,
        houses,
        quality,
        details
    };
}

/**
 * STEP 2: House Placement Analysis (20% weightage)
 * Where is the Dasa planet physically located in the chart?
 */
export function calculatePlacementScore(
    planetName: string,
    planetHouse: number,
    language: 'en' | 'ta' = 'en'
): PlacementScore {
    let score = 0;
    let quality = '';
    let maleficBonus = false;

    const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
    const isMalefic = malefics.includes(planetName);

    // Kendra (1, 4, 7, 10): +8 points
    if ([1, 4, 7, 10].includes(planetHouse)) {
        score += 8;
        quality = language === 'ta' ? 'கேந்திரத்தில்' : 'In Kendra';
    }
    // Trikona (5, 9): +10 points (1 already covered in Kendra)
    else if ([5, 9].includes(planetHouse)) {
        score += 10;
        quality = language === 'ta' ? 'திரிகோணத்தில்' : 'In Trikona';
    }
    // Upachaya (3, 6, 11): +6 points (10 already covered)
    else if ([3, 6, 11].includes(planetHouse)) {
        score += 6;
        quality = language === 'ta' ? 'உபசயத்தில்' : 'In Upachaya';

        // Malefics THRIVE in Upachaya: +5 bonus
        if (isMalefic) {
            score += 5;
            maleficBonus = true;
        }
    }
    // 2nd/11th: +5 points
    else if (planetHouse === 2) {
        score += 5;
        quality = language === 'ta' ? '2வது வீட்டில்' : 'In 2nd House';
    }
    // 8th house: +1 point
    else if (planetHouse === 8) {
        score += 1;
        quality = language === 'ta' ? '8வது வீட்டில்' : 'In 8th House';
    }
    // 12th house: +2 points
    else if (planetHouse === 12) {
        score += 2;
        quality = language === 'ta' ? '12வது வீட்டில்' : 'In 12th House';
    }

    const normalizedScore = Math.min(15, score);
    const percentage = (normalizedScore / 15) * 20; // 20% weightage

    return {
        score: normalizedScore,
        percentage,
        house: planetHouse,
        quality,
        maleficBonus
    };
}

/**
 * STEP 3: Subathuvam/Papathuvam Analysis (15% weightage)
 * Natural benefic/malefic nature with adjustments
 */
export function calculateSubathuvamScore(
    planetName: string,
    lordshipScore: LordshipScore,
    placementScore: PlacementScore,
    language: 'en' | 'ta' = 'en'
): SubathuvamScore {
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

    const isBenefic = benefics.includes(planetName);
    const isMalefic = malefics.includes(planetName);

    let score = isBenefic ? 7 : 4;
    const adjustments: string[] = [];

    // Adjustments based on lordship
    const rulesDusthana = lordshipScore.houses.some(h => [6, 8, 12].includes(h));
    const rulesTrikona = lordshipScore.houses.some(h => [1, 5, 9].includes(h));

    if (isBenefic && rulesDusthana) {
        score -= 3;
        adjustments.push(language === 'ta' ? 'துஸ்தானாதிபதி (-3)' : 'Rules Dusthana (-3)');
    }

    if (isMalefic && rulesTrikona) {
        score += 3;
        adjustments.push(language === 'ta' ? 'திரிகோணாதிபதி (+3)' : 'Rules Trikona (+3)');
    }

    if (isMalefic && placementScore.maleficBonus) {
        score += 2;
        adjustments.push(language === 'ta' ? 'உபசயத்தில் (+2)' : 'In Upachaya (+2)');
    }

    const normalizedScore = Math.max(0, Math.min(12, score));
    const percentage = (normalizedScore / 12) * 15; // 15% weightage

    return {
        score: normalizedScore,
        percentage,
        nature: isBenefic ? 'Benefic' : 'Malefic',
        adjustments
    };
}

/**
 * STEP 4: Dignity/Strength Analysis (15% weightage)
 * Exaltation, own sign, friendly, enemy, debilitation
 */
export function calculateDignityScore(
    planet: any,
    language: 'en' | 'ta' = 'en'
): DignityScore {
    let score = 5; // Base neutral score
    const factors: string[] = [];

    // Dignity levels (from planet.dignity if available)
    if (planet.dignity) {
        switch (planet.dignity.toLowerCase()) {
            case 'exalted':
            case 'uchham':
                score = 10;
                factors.push(language === 'ta' ? 'உச்சம் (+10)' : 'Exalted (+10)');
                break;
            case 'own':
            case 'swakshetra':
                score = 8;
                factors.push(language === 'ta' ? 'ச்வக்ஷேத்ரம் (+8)' : 'Own Sign (+8)');
                break;
            case 'friend':
            case 'mithra':
                score = 6;
                factors.push(language === 'ta' ? 'நண்பர் (+6)' : 'Friendly (+6)');
                break;
            case 'enemy':
            case 'shatru':
                score = 3;
                factors.push(language === 'ta' ? 'எதிரி (+3)' : 'Enemy (+3)');
                break;
            case 'debilitated':
            case 'neecham':
                score = 1;
                factors.push(language === 'ta' ? 'நீச்சம் (+1)' : 'Debilitated (+1)');
                break;
        }
    }

    // Retrograde bonus
    if (planet.retrograde) {
        score += 2;
        factors.push(language === 'ta' ? 'வக்கிரம் (+2)' : 'Retrograde (+2)');
    }

    const normalizedScore = Math.min(13, score);
    const percentage = (normalizedScore / 13) * 15; // 15% weightage

    return {
        score: normalizedScore,
        percentage,
        dignity: planet.dignity || 'Neutral',
        factors
    };
}

/**
 * STEP 5: Conjunction & Aspect Analysis (10% weightage)
 * Check conjunctions and aspects from other planets
 */
export function calculateAspectScore(
    planetName: string,
    planetSignIndex: number,
    allPlanets: any[],
    language: 'en' | 'ta' = 'en'
): AspectScore {
    let score = 0;
    const conjunctions: string[] = [];
    const aspects: string[] = [];

    allPlanets.forEach(otherPlanet => {
        if (otherPlanet.name === planetName) return;

        // Check conjunction (same sign)
        if (otherPlanet.signIndex === planetSignIndex) {
            if (otherPlanet.name === 'Jupiter') {
                score += 5;
                conjunctions.push(language === 'ta' ? 'குருவுடன் (+5)' : 'With Jupiter (+5)');
            } else if (otherPlanet.name === 'Venus') {
                score += 4;
                conjunctions.push(language === 'ta' ? 'சுக்ரனுடன் (+4)' : 'With Venus (+4)');
            } else if (['Mercury', 'Moon'].includes(otherPlanet.name)) {
                score += 3;
                conjunctions.push(`${language === 'ta' ? 'உடன்' : 'With'} ${otherPlanet.name} (+3)`);
            } else if (['Saturn', 'Mars', 'Rahu', 'Ketu'].includes(otherPlanet.name)) {
                score -= 2;
                conjunctions.push(`${language === 'ta' ? 'உடன்' : 'With'} ${otherPlanet.name} (-2)`);
            }
        }

        // Check aspects (7th house aspect for all planets)
        const signDiff = (planetSignIndex - otherPlanet.signIndex + 12) % 12;
        if (signDiff === 6) { // 7th aspect
            if (otherPlanet.name === 'Jupiter') {
                score += 4;
                aspects.push(language === 'ta' ? 'குரு பார்வை (+4)' : 'Jupiter Aspect (+4)');
            } else if (['Venus', 'Mercury', 'Moon'].includes(otherPlanet.name)) {
                score += 2;
                aspects.push(`${otherPlanet.name} ${language === 'ta' ? 'பார்வை' : 'Aspect'} (+2)`);
            } else {
                score -= 1;
                aspects.push(`${otherPlanet.name} ${language === 'ta' ? 'பார்வை' : 'Aspect'} (-1)`);
            }
        }
    });

    const normalizedScore = Math.max(0, Math.min(10, score + 5)); // +5 to normalize from negative
    const percentage = (normalizedScore / 10) * 10; // 10% weightage

    return {
        score: normalizedScore,
        percentage,
        conjunctions,
        aspects
    };
}

/**
 * Calculate overall Dasa score combining all 5 steps
 */
export function analyzeDasaPlanet(
    planetName: string,
    planet: any,
    lagnaIndex: number,
    allPlanets: any[],
    language: 'en' | 'ta' = 'en'
): DasaScore {
    // Calculate all 5 components
    const lordship = calculateLordshipScore(planetName, lagnaIndex, language);
    const placement = calculatePlacementScore(planetName, planet.house, language);
    const subathuvam = calculateSubathuvamScore(planetName, lordship, placement, language);
    const dignity = calculateDignityScore(planet, language);
    const aspects = calculateAspectScore(planetName, planet.signIndex, allPlanets, language);

    // Total score (0-100)
    const totalScore = Math.round(
        lordship.percentage +
        placement.percentage +
        subathuvam.percentage +
        dignity.percentage +
        aspects.percentage
    );

    // Rating (1-5 stars) - Fixed scale for consistent display
    // 1-20 = 1★, 21-40 = 2★, 41-60 = 3★, 61-80 = 4★, 81-100 = 5★
    let rating = 1;
    let quality: DasaScore['quality'] = 'DIFFICULT';

    if (totalScore >= 81) {
        rating = 5;
        quality = 'EXCELLENT';
    } else if (totalScore >= 61) {
        rating = 4;
        quality = 'VERY GOOD';
    } else if (totalScore >= 41) {
        rating = 3;
        quality = 'GOOD';
    } else if (totalScore >= 21) {
        rating = 2;
        quality = 'AVERAGE';
    } else {
        rating = 1;
        quality = 'CHALLENGING';
    }

    return {
        totalScore,
        rating,
        quality,
        breakdown: {
            lordship,
            placement,
            subathuvam,
            dignity,
            aspects
        }
    };
}

/**
 * Get translated quality text
 */
export function getQualityText(quality: string, language: 'en' | 'ta' = 'en'): string {
    const key = quality.toUpperCase().replace(' ', '_');
    return QUALITY_TRANSLATIONS[key]?.[language] || quality;
}
