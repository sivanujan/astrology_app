/**
 * Nakshatra Calculator
 * 
 * Calculates nakshatra and pada based on planetary longitude
 */

// Nakshatra data with lords
const NAKSHATRAS = [
    { name: 'Ashwini', lord: 'Ketu', startDegree: 0, endDegree: 13.333333 },
    { name: 'Bharani', lord: 'Venus', startDegree: 13.333333, endDegree: 26.666667 },
    { name: 'Krittika', lord: 'Sun', startDegree: 26.666667, endDegree: 40 },
    { name: 'Rohini', lord: 'Moon', startDegree: 40, endDegree: 53.333333 },
    { name: 'Mrigashira', lord: 'Mars', startDegree: 53.333333, endDegree: 66.666667 },
    { name: 'Ardra', lord: 'Rahu', startDegree: 66.666667, endDegree: 80 },
    { name: 'Punarvasu', lord: 'Jupiter', startDegree: 80, endDegree: 93.333333 },
    { name: 'Pushya', lord: 'Saturn', startDegree: 93.333333, endDegree: 106.666667 },
    { name: 'Ashlesha', lord: 'Mercury', startDegree: 106.666667, endDegree: 120 },
    { name: 'Magha', lord: 'Ketu', startDegree: 120, endDegree: 133.333333 },
    { name: 'Purva Phalguni', lord: 'Venus', startDegree: 133.333333, endDegree: 146.666667 },
    { name: 'Uttara Phalguni', lord: 'Sun', startDegree: 146.666667, endDegree: 160 },
    { name: 'Hasta', lord: 'Moon', startDegree: 160, endDegree: 173.333333 },
    { name: 'Chitra', lord: 'Mars', startDegree: 173.333333, endDegree: 186.666667 },
    { name: 'Swati', lord: 'Rahu', startDegree: 186.666667, endDegree: 200 },
    { name: 'Vishakha', lord: 'Jupiter', startDegree: 200, endDegree: 213.333333 },
    { name: 'Anuradha', lord: 'Saturn', startDegree: 213.333333, endDegree: 226.666667 },
    { name: 'Jyeshta', lord: 'Mercury', startDegree: 226.666667, endDegree: 240 },
    { name: 'Moola', lord: 'Ketu', startDegree: 240, endDegree: 253.333333 },
    { name: 'Purva Ashadha', lord: 'Venus', startDegree: 253.333333, endDegree: 266.666667 },
    { name: 'Uttara Ashadha', lord: 'Sun', startDegree: 266.666667, endDegree: 280 },
    { name: 'Shravana', lord: 'Moon', startDegree: 280, endDegree: 293.333333 },
    { name: 'Dhanishta', lord: 'Mars', startDegree: 293.333333, endDegree: 306.666667 },
    { name: 'Shatabhisha', lord: 'Rahu', startDegree: 306.666667, endDegree: 320 },
    { name: 'Purva Bhadrapada', lord: 'Jupiter', startDegree: 320, endDegree: 333.333333 },
    { name: 'Uttara Bhadrapada', lord: 'Saturn', startDegree: 333.333333, endDegree: 346.666667 },
    { name: 'Revati', lord: 'Mercury', startDegree: 346.666667, endDegree: 360 },
];

// Sign mapping to degrees (0-360)
const SIGN_START_DEGREES: Record<string, number> = {
    'Aries': 0,
    'Taurus': 30,
    'Gemini': 60,
    'Cancer': 90,
    'Leo': 120,
    'Virgo': 150,
    'Libra': 180,
    'Scorpio': 210,
    'Sagittarius': 240,
    'Capricorn': 270,
    'Aquarius': 300,
    'Pisces': 330,
};

/**
 * Calculate absolute longitude (0-360) from sign and degree
 */
function getAbsoluteLongitude(sign: string, degree: number): number {
    const signStart = SIGN_START_DEGREES[sign] || 0;
    return signStart + degree;
}

/**
 * Get nakshatra details from absolute longitude
 */
export function getNakshatraFromLongitude(absoluteLongitude: number): {
    name: string;
    lord: string;
    pada: number;
} {
    // Normalize to 0-360
    const normalizedLong = absoluteLongitude % 360;

    // Find the nakshatra
    const nakshatra = NAKSHATRAS.find(
        n => normalizedLong >= n.startDegree && normalizedLong < n.endDegree
    ) || NAKSHATRAS[0]; // Default to Ashwini if not found

    // Calculate pada (1-4)
    const degreeInNakshatra = normalizedLong - nakshatra.startDegree;
    const nakshatraSpan = 13.333333; // Each nakshatra spans 13°20'
    const padaSpan = nakshatraSpan / 4; // Each pada is 1/4 of nakshatra
    const pada = Math.floor(degreeInNakshatra / padaSpan) + 1;

    return {
        name: nakshatra.name,
        lord: nakshatra.lord,
        pada: Math.min(pada, 4), // Ensure pada is 1-4
    };
}

/**
 * Get nakshatra from sign and degree
 */
export function getNakshatra(sign: string, degree: number): {
    name: string;
    lord: string;
    pada: number;
} {
    const absoluteLongitude = getAbsoluteLongitude(sign, degree);
    return getNakshatraFromLongitude(absoluteLongitude);
}

/**
 * Get Tamil name for nakshatra
 */
export function getTamilNakshatraName(nakshatraName: string): string {
    const tamilNames: Record<string, string> = {
        'Ashwini': 'அச்வினி',
        'Bharani': 'பரணி',
        'Krittika': 'கார்த்திகை',
        'Rohini': 'ரோகிணி',
        'Mrigashira': 'மிருகசீரிஷம்',
        'Ardra': 'திருவாதிரை',
        'Punarvasu': 'புனர்பூசம்',
        'Pushya': 'பூசம்',
        'Ashlesha': 'ஆயில்யம்',
        'Magha': 'மகம்',
        'Purva Phalguni': 'பூரம்',
        'Uttara Phalguni': 'உத்திரம்',
        'Hasta': 'ஹஸ்தம்',
        'Chitra': 'சித்திரை',
        'Swati': 'சுவாதி',
        'Vishakha': 'விசாகம்',
        'Anuradha': 'அனுஷம்',
        'Jyeshta': 'கேட்டை',
        'Moola': 'மூலம்',
        'Purva Ashadha': 'பூராடம்',
        'Uttara Ashadha': 'உத்திராடம்',
        'Shravana': 'திருவோணம்',
        'Dhanishta': 'அவிட்டம்',
        'Shatabhisha': 'சதயம்',
        'Purva Bhadrapada': 'பூரட்டாதி',
        'Uttara Bhadrapada': 'உத்திரட்டாதி',
        'Revati': 'ரேவதி',
    };

    return tamilNames[nakshatraName] || nakshatraName;
}

/**
 * Check if two planets are in the same nakshatra
 */
export function arePlanetsInSameNakshatra(
    planet1Sign: string,
    planet1Degree: number,
    planet2Sign: string,
    planet2Degree: number
): boolean {
    const nakshatra1 = getNakshatra(planet1Sign, planet1Degree);
    const nakshatra2 = getNakshatra(planet2Sign, planet2Degree);

    return nakshatra1.name === nakshatra2.name;
}

/**
 * Check if planet is in Gandanta (junction between water and fire signs)
 * These are critical degrees that need caution
 */
export function isGandanta(sign: string, degree: number): boolean {
    const gandantaRanges = [
        // Cancer-Leo junction (end of Cancer, start of Leo)
        { sign: 'Cancer', minDegree: 26.666667, maxDegree: 30 },
        { sign: 'Leo', minDegree: 0, maxDegree: 3.333333 },
        // Scorpio-Sagittarius junction
        { sign: 'Scorpio', minDegree: 26.666667, maxDegree: 30 },
        { sign: 'Sagittarius', minDegree: 0, maxDegree: 3.333333 },
        // Pisces-Aries junction
        { sign: 'Pisces', minDegree: 26.666667, maxDegree: 30 },
        { sign: 'Aries', minDegree: 0, maxDegree: 3.333333 },
    ];

    return gandantaRanges.some(
        range => range.sign === sign && degree >= range.minDegree && degree <= range.maxDegree
    );
}
