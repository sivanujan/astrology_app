export const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const TAMIL_RASI_NAMES = [
    "Mesham", "Rishabam", "Mithunam", "Kadagam",
    "Simmam", "Kanni", "Thulaam", "Vrichigam",
    "Dhanusu", "Makaram", "Kumbam", "Meenam"
];

export const NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const TAMIL_NAKSHATRAS = [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
    "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
    "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்",
    "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

export const PLANETS = [
    "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
];

export const PLANET_SYMBOLS = {
    Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me",
    Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke"
};

// 0=Aries, 1=Taurus, ... 11=Pisces
export const SIGN_LORDS = [
    "Mars",    // Aries
    "Venus",   // Taurus
    "Mercury", // Gemini
    "Moon",    // Cancer
    "Sun",     // Leo
    "Mercury", // Virgo
    "Venus",   // Libra
    "Mars",    // Scorpio
    "Jupiter", // Sagittarius
    "Saturn",  // Capricorn
    "Saturn",  // Aquarius
    "Jupiter"  // Pisces
];

export const EXALTATION_POINTS = {
    Sun: { sign: 0, degree: 10 },      // Aries 10
    Moon: { sign: 1, degree: 3 },      // Taurus 3
    Mars: { sign: 9, degree: 28 },     // Capricorn 28
    Mercury: { sign: 5, degree: 15 },  // Virgo 15
    Jupiter: { sign: 3, degree: 5 },   // Cancer 5
    Venus: { sign: 11, degree: 27 },   // Pisces 27
    Saturn: { sign: 6, degree: 20 },   // Libra 20
    Rahu: { sign: 1, degree: 0 },      // Taurus (Mean)
    Ketu: { sign: 7, degree: 0 }       // Scorpio (Mean)
};

export const DEBILITATION_POINTS = {
    Sun: { sign: 6, degree: 10 },      // Libra 10
    Moon: { sign: 7, degree: 3 },      // Scorpio 3
    Mars: { sign: 3, degree: 28 },     // Cancer 28
    Mercury: { sign: 11, degree: 15 }, // Pisces 15
    Jupiter: { sign: 9, degree: 5 },   // Capricorn 5
    Venus: { sign: 5, degree: 27 },    // Virgo 27
    Saturn: { sign: 0, degree: 20 },   // Aries 20
    Rahu: { sign: 7, degree: 0 },      // Scorpio
    Ketu: { sign: 1, degree: 0 }       // Taurus
};

export const OWN_SIGNS = {
    Sun: [4],           // Leo
    Moon: [3],          // Cancer
    Mars: [0, 7],       // Aries, Scorpio
    Mercury: [2, 5],    // Gemini, Virgo
    Jupiter: [8, 11],   // Sagittarius, Pisces
    Venus: [1, 6],      // Taurus, Libra
    Saturn: [9, 10]    // Capricorn, Aquarius
};

// Friendship Table (Natural relationships)
// [Friends, Neutrals, Enemies]
export const PLANET_RELATIONSHIPS = {
    Sun: {
        friends: ["Moon", "Mars", "Jupiter"],
        neutrals: ["Mercury"],
        enemies: ["Venus", "Saturn"]
    },
    Moon: {
        friends: ["Sun", "Mercury"],
        neutrals: ["Mars", "Jupiter", "Venus", "Saturn"],
        enemies: ["Rahu", "Ketu"] // No natural enemies usually, but Rahu/Ketu are nodes
    },
    Mars: {
        friends: ["Sun", "Moon", "Jupiter"],
        neutrals: ["Venus", "Saturn"],
        enemies: ["Mercury"]
    },
    Mercury: {
        friends: ["Sun", "Venus"],
        neutrals: ["Mars", "Jupiter", "Saturn"],
        enemies: ["Moon"]
    },
    Jupiter: {
        friends: ["Sun", "Moon", "Mars"],
        neutrals: ["Saturn"],
        enemies: ["Mercury", "Venus"]
    },
    Venus: {
        friends: ["Mercury", "Saturn"],
        neutrals: ["Mars", "Jupiter"],
        enemies: ["Sun", "Moon"]
    },
    Saturn: {
        friends: ["Mercury", "Venus"],
        neutrals: ["Jupiter"],
        enemies: ["Sun", "Moon", "Mars"]
    },
    Rahu: {
        friends: ["Mercury", "Venus", "Saturn"],
        neutrals: ["Jupiter"],
        enemies: ["Sun", "Moon", "Mars"]
    },
    Ketu: {
        friends: ["Mars", "Jupiter"],
        neutrals: ["Venus", "Saturn"],
        enemies: ["Sun", "Moon", "Mercury"]
    }
};

export const MOOLA_TRIKONA = {
    Sun: { sign: 4, startDegree: 0, endDegree: 20 },      // Leo 0-20
    Moon: { sign: 1, startDegree: 3, endDegree: 30 },     // Taurus 3-30
    Mars: { sign: 0, startDegree: 0, endDegree: 12 },     // Aries 0-12
    Mercury: { sign: 5, startDegree: 15, endDegree: 20 }, // Virgo 15-20
    Jupiter: { sign: 8, startDegree: 0, endDegree: 10 },  // Sagittarius 0-10
    Venus: { sign: 6, startDegree: 0, endDegree: 15 },    // Libra 0-15
    Saturn: { sign: 10, startDegree: 0, endDegree: 20 }   // Aquarius 0-20
};
