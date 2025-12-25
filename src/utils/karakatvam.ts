/**
 * Karakatvam (Natural Significations) of Planets and Houses
 * காரகத்துவம் - கிரகங்களின் இயல்பான குணங்கள்
 * 
 * Based on Aditya Guruji's teachings
 */

export interface PlanetKarakatvam {
    primary: string[];      // Primary significations
    secondary: string[];    // Secondary significations
    naturalHouses: number[]; // Natural houses ruled
    diseases: string[];     // Health issues
    professions: string[];  // Career fields
    relationships: string[]; // People represented
    bodyParts: string[];    // Body parts
    qualities: string[];    // Character traits
}

export const PLANET_KARAKATVAM: Record<string, PlanetKarakatvam> = {
    Sun: {
        primary: ['Father', 'Soul', 'Authority', 'Government', 'Power'],
        secondary: ['Ego', 'Status', 'Leadership', 'King', 'Self-respect'],
        naturalHouses: [1, 5, 9, 10],
        diseases: ['Heart', 'Eyes', 'Bones', 'Fever', 'Blood pressure'],
        professions: ['Government', 'Politics', 'Administration', 'CEO', 'Leadership roles'],
        relationships: ['Father', 'Authority figures', 'Government officials'],
        bodyParts: ['Heart', 'Right eye (men)', 'Spine', 'Stomach'],
        qualities: ['Confidence', 'Authority', 'Dignity', 'Nobility', 'Pride']
    },

    Moon: {
        primary: ['Mother', 'Mind', 'Emotions', 'Public', 'Water'],
        secondary: ['Feelings', 'Peace', 'Nurturing', 'Liquids', 'Tides'],
        naturalHouses: [4],
        diseases: ['Mental issues', 'Lungs', 'Asthma', 'Cold', 'Cough', 'Depression'],
        professions: ['Nursing', 'Catering', 'Public relations', 'Psychology', 'Dairy'],
        relationships: ['Mother', 'Women', 'Public', 'Masses'],
        bodyParts: ['Mind', 'Left eye (men)', 'Breasts', 'Fluids', 'Stomach'],
        qualities: ['Emotions', 'Sensitivity', 'Caring', 'Changeability', 'Intuition']
    },

    Mars: {
        primary: ['Courage', 'Energy', 'Siblings', 'Property', 'Accidents'],
        secondary: ['War', 'Fire', 'Blood', 'Surgery', 'Land'],
        naturalHouses: [3, 6, 10],
        diseases: ['Accidents', 'Cuts', 'Burns', 'Fever', 'Blood disorders', 'Surgery'],
        professions: ['Military', 'Police', 'Engineering', 'Surgery', 'Sports', 'Real estate'],
        relationships: ['Siblings', 'Soldiers', 'Engineers', 'Competitors'],
        bodyParts: ['Blood', 'Muscles', 'Bone marrow', 'Head', 'Male organs'],
        qualities: ['Courage', 'Aggression', 'Energy', 'Ambition', 'Recklessness']
    },

    Mercury: {
        primary: ['Intelligence', 'Communication', 'Business', 'Education', 'Speech'],
        secondary: ['Writing', 'Mathematics', 'Logic', 'Wit', 'Commerce'],
        naturalHouses: [3, 6, 10],
        diseases: ['Nervous system', 'Speech disorders', 'Skin', 'Thyroid'],
        professions: ['Business', 'Teaching', 'Writing', 'CA', 'IT', 'Trading'],
        relationships: ['Friends', 'Colleagues', 'Students', 'Uncles/Aunts', 'Cousins'],
        bodyParts: ['Nervous system', 'Skin', 'Tongue', 'Hands', 'Lungs'],
        qualities: ['Intelligence', 'Wit', 'Adaptability', 'Communication', 'Cunning']
    },

    Jupiter: {
        primary: ['Children', 'Knowledge', 'Fortune', 'Guru', 'Wealth'],
        secondary: ['Wisdom', 'Religion', 'Philosophy', 'Expansion', 'Optimism'],
        naturalHouses: [2, 5, 9, 11],
        diseases: ['Liver', 'Diabetes', 'Obesity', 'Fat-related issues'],
        professions: ['Teacher', 'Priest', 'Judge', 'Advisor', 'Lawyer', 'Professor'],
        relationships: ['Children', 'Guru', 'Husband (for women)', 'Elders', 'Mentors'],
        bodyParts: ['Liver', 'Fat', 'Hips', 'Ears'],
        qualities: ['Wisdom', 'Generosity', 'Optimism', 'Morality', 'Expansion']
    },

    Venus: {
        primary: ['Spouse', 'Luxury', 'Vehicles', 'Arts', 'Marriage'],
        secondary: ['Beauty', 'Comforts', 'Romance', 'Pleasure', 'Refinement'],
        naturalHouses: [2, 7],
        diseases: ['Reproductive system', 'Kidneys', 'Diabetes', 'Venereal diseases'],
        professions: ['Arts', 'Fashion', 'Hospitality', 'Jewelry', 'Entertainment', 'Design'],
        relationships: ['Spouse', 'Wife (for men)', 'Partners', 'Artists'],
        bodyParts: ['Reproductive organs', 'Kidneys', 'Face', 'Throat', 'Genitals'],
        qualities: ['Love', 'Beauty', 'Refinement', 'Sensuality', 'Harmony']
    },

    Saturn: {
        primary: ['Longevity', 'Servants', 'Suffering', 'Discipline', 'Death'],
        secondary: ['Karma', 'Delay', 'Hard work', 'Poverty', 'Old age'],
        naturalHouses: [6, 8, 10, 12],
        diseases: ['Chronic illness', 'Bones', 'Joints', 'Arthritis', 'Paralysis', 'Depression'],
        professions: ['Labor', 'Mining', 'Iron/Steel', 'Oil', 'Servants', 'Judiciary'],
        relationships: ['Servants', 'Workers', 'Old people', 'Laborers'],
        bodyParts: ['Bones', 'Teeth', 'Knees', 'Joints', 'Nerves'],
        qualities: ['Discipline', 'Patience', 'Suffering', 'Detachment', 'Responsibility']
    },

    Rahu: {
        primary: ['Foreigners', 'Technology', 'Deception', 'Material success', 'Confusion'],
        secondary: ['Illusion', 'Obsession', 'Unconventional', 'Poison', 'Addiction'],
        naturalHouses: [6, 8, 12],
        diseases: ['Poison', 'Cancer', 'Mental disorders', 'Addiction', 'Allergies'],
        professions: ['IT', 'Electronics', 'Foreign', 'Research', 'Unconventional fields'],
        relationships: ['Foreigners', 'Outcasts', 'Unconventional people'],
        bodyParts: ['Nervous system', 'Glands'],
        qualities: ['Ambition', 'Deception', 'Obsession', 'Innovation', 'Materialism']
    },

    Ketu: {
        primary: ['Spirituality', 'Detachment', 'Past karma', 'Moksha', 'Liberation'],
        secondary: ['Mysticism', 'Occult', 'Salvation', 'Loss', 'Renunciation'],
        naturalHouses: [8, 12],
        diseases: ['Mysterious diseases', 'Intestines', 'Worms', 'Accidents'],
        professions: ['Spirituality', 'Astrology', 'Research', 'Occult', 'Liberation work'],
        relationships: ['Spiritual gurus', 'Mystics', 'Ascetics'],
        bodyParts: ['Intestines', 'Spine'],
        qualities: ['Detachment', 'Spirituality', 'Intuitiveness', 'Suddenness', 'Liberation']
    }
};

export interface HouseSignification {
    name: string;
    tamilName: string;
    primarySignifications: string[];
    people: string[];
    areas: string[];
    bodyParts: string[];
    results: {
        good: string[];
        bad: string[];
    };
}

export const HOUSE_SIGNIFICATIONS: Record<number, HouseSignification> = {
    1: {
        name: '1st House (Lagna)',
        tamilName: 'லக்னம்',
        primarySignifications: ['Self', 'Body', 'Personality', 'Health', 'Overall life'],
        people: ['Self', 'Native'],
        areas: ['Physical appearance', 'Character', 'Vitality', 'Life path'],
        bodyParts: ['Overall body', 'Head', 'Brain', 'Face'],
        results: {
            good: ['Good health', 'Strong personality', 'Success', 'Longevity'],
            bad: ['Health issues', 'Weak character', 'Struggles', 'Short life']
        }
    },

    2: {
        name: '2nd House (Dhana)',
        tamilName: 'தனம்',
        primarySignifications: ['Wealth', 'Family', 'Speech', 'Food', 'Death timing (Maraka)'],
        people: ['Family', 'Face', 'Mouth'],
        areas: ['Bank balance', 'Accumulated wealth', 'Food habits', 'Vision (right eye)'],
        bodyParts: ['Face', 'Mouth', 'Tongue', 'Right eye', 'Throat'],
        results: {
            good: ['Wealth accumulation', 'Good family', 'Pleasant speech', 'Good food'],
            bad: ['Financial loss', 'Family problems', 'Harsh speech', 'Death (Maraka)']
        }
    },

    3: {
        name: '3rd House (Sahaja)',
        tamilName: 'சகோதரம்',
        primarySignifications: ['Courage', 'Siblings', 'Short travels', 'Communication', 'Efforts'],
        people: ['Younger siblings', 'Neighbors', 'Colleagues'],
        areas: ['Writing', 'Skills', 'Hobbies', 'Self-efforts', 'Right ear'],
        bodyParts: ['Right ear', 'Shoulders', 'Arms', 'Hands', 'Collar bone'],
        results: {
            good: ['Courage', 'Good siblings', 'Skills', 'Success through efforts'],
            bad: ['Cowardice', 'Sibling problems', 'Failed efforts', 'Communication issues']
        }
    },

    4: {
        name: '4th House (Sukha)',
        tamilName: 'சுகம்',
        primarySignifications: ['Mother', 'Home', 'Property', 'Education', 'Vehicles', 'Comforts'],
        people: ['Mother', 'Mother\'s family'],
        areas: ['Real estate', 'Land', 'Basic education', 'Inner peace', 'Heart'],
        bodyParts: ['Chest', 'Heart', 'Lungs', 'Breasts'],
        results: {
            good: ['Good mother', 'Property', 'Vehicles', 'Education', 'Peace'],
            bad: ['Mother problems', 'No property', 'No vehicles', 'Poor education', 'Unrest']
        }
    },

    5: {
        name: '5th House (Putra)',
        tamilName: 'புத்திரம்',
        primarySignifications: ['Children', 'Intelligence', 'Romance', 'Speculation', 'Past karma'],
        people: ['Children', 'Students', 'Lovers'],
        areas: ['Creativity', 'Learning', 'Mantras', 'Stock market', 'Stomach'],
        bodyParts: ['Stomach', 'Upper abdomen', 'Gall bladder'],
        results: {
            good: ['Children', 'Intelligence', 'Romance', 'Speculation gains', 'Good karma'],
            bad: ['No children', 'Low intelligence', 'Romance failure', 'Losses', 'Bad karma']
        }
    },

    6: {
        name: '6th House (Ripu)',
        tamilName: 'வைரி/ரோகம்',
        primarySignifications: ['Enemies', 'Disease', 'Debt', 'Service', 'Competition', 'Maternal uncles'],
        people: ['Enemies', 'Servants', 'Maternal uncles', 'Colleagues'],
        areas: ['Litigation', 'Loans', 'Health issues', 'Daily work', 'Lower abdomen'],
        bodyParts: ['Intestines', 'Kidneys', 'Lower abdomen'],
        results: {
            good: ['Victory over enemies', 'Service success', 'Good health', 'No debts'],
            bad: ['Enemy troubles', 'Diseases', 'Debts', 'Litigation', 'Service problems']
        }
    },

    7: {
        name: '7th House (Kalatra)',
        tamilName: 'கள்த்திரம்',
        primarySignifications: ['Spouse', 'Marriage', 'Partnership', 'Business', 'Public dealings'],
        people: ['Spouse', 'Business partner', 'Public'],
        areas: ['Marriage', 'Business partnerships', 'Contracts', 'Foreign travels'],
        bodyParts: ['Reproductive area', 'Lower back', 'Bladder'],
        results: {
            good: ['Happy marriage', 'Good spouse', 'Business success', 'Partnerships'],
            bad: ['Marriage problems', 'Divorce', 'Business losses', 'Partnership issues']
        }
    },

    8: {
        name: '8th House (Ayur)',
        tamilName: 'ஆயுள்',
        primarySignifications: ['Longevity', 'Death', 'Hidden wealth', 'Occult', 'Transformations', 'Inheritance'],
        people: ['In-laws', 'Occultists'],
        areas: ['Sudden events', 'Research', 'Insurance', 'Inheritance', 'Sexual organs'],
        bodyParts: ['Sexual organs', 'Anus', 'Prostate'],
        results: {
            good: ['Long life', 'Inheritance', 'Occult powers', 'Research success', 'Insurance gains'],
            bad: ['Short life', 'Accidents', 'Chronic diseases', 'Sudden losses', 'Surgery']
        }
    },

    9: {
        name: '9th House (Bhagya)',
        tamilName: 'பாக்கியம்',
        primarySignifications: ['Father', 'Fortune', 'Guru', 'Religion', 'Long travels', 'Higher education'],
        people: ['Father', 'Guru', 'Teachers', 'Grandchildren'],
        areas: ['Luck', 'Philosophy', 'Dharma', 'Pilgrimage', 'PhD', 'Hips'],
        bodyParts: ['Hips', 'Thighs'],
        results: {
            good: ['Good father', 'Fortune', 'Guru blessing', 'Higher education', 'Foreign travels'],
            bad: ['Father problems', 'Bad luck', 'No guru', 'No higher education', 'No fortune']
        }
    },

    10: {
        name: '10th House (Karma)',
        tamilName: 'கர்மம்',
        primarySignifications: ['Career', 'Status', 'Authority', 'Profession', 'Public image', 'Father\'s image'],
        people: ['Employer', 'Government', 'Authority'],
        areas: ['Professional success', 'Fame', 'Power', 'Social status', 'Knees'],
        bodyParts: ['Knees', 'Joints'],
        results: {
            good: ['Career success', 'High status', 'Authority', 'Fame', 'Government favor'],
            bad: ['Career failure', 'Low status', 'No authority', 'Bad reputation', 'Job loss']
        }
    },

    11: {
        name: '11th House (Labha)',
        tamilName: 'லாபம்',
        primarySignifications: ['Gains', 'Income', 'Elder siblings', 'Fulfillment', 'Friends', 'Achievements'],
        people: ['Elder siblings', 'Friends', 'Well-wishers'],
        areas: ['Regular income', 'Earnings', 'Desires fulfilled', 'Left ear', 'Social circle'],
        bodyParts: ['Left ear', 'Ankles', 'Calves'],
        results: {
            good: ['High income', 'Gains', 'Desires fulfilled', 'Good friends', 'Achievements'],
            bad: ['Low income', 'Losses', 'Unfulfilled desires', 'No friends', 'Failures']
        }
    },

    12: {
        name: '12th House (Vyaya)',
        tamilName: 'வியய/செலவு',
        primarySignifications: ['Loss', 'Expenses', 'Foreign', 'Moksha', 'Hospitalization', 'Isolation'],
        people: ['Foreigners', 'Spiritual masters', 'Prisoners'],
        areas: ['Foreign settlement', 'Spiritual liberation', 'Hospital', 'Jail', 'Feet', 'Bed pleasures'],
        bodyParts: ['Feet', 'Left eye'],
        results: {
            good: ['Foreign settlement', 'Moksha', 'Spiritual growth', 'Bed pleasures', 'Charity'],
            bad: ['Losses', 'Hospitalization', 'Imprisonment', 'Isolation', 'Excessive expenses']
        }
    }
};

/**
 * Helper function to get combined significations
 */
export const getCombinedSignifications = (
    planetName: string,
    lordOfHouses: number[]
): string[] => {
    const planetKara = PLANET_KARAKATVAM[planetName];
    if (!planetKara) return [];

    const combined = [...planetKara.primary];

    // Add house significations
    lordOfHouses.forEach(houseNum => {
        const houseSig = HOUSE_SIGNIFICATIONS[houseNum];
        if (houseSig) {
            combined.push(...houseSig.primarySignifications);
        }
    });

    return [...new Set(combined)]; // Remove duplicates
};

/**
 * Helper function to determine who is affected
 */
export const determineAffectedPersons = (
    planetName: string,
    lordOfHouses: number[]
): string[] => {
    const affected: string[] = [];

    // Add from Karakatvam
    const planetKara = PLANET_KARAKATVAM[planetName];
    if (planetKara) {
        affected.push(...planetKara.relationships);
    }

    // Add from house lordship
    lordOfHouses.forEach(houseNum => {
        const houseSig = HOUSE_SIGNIFICATIONS[houseNum];
        if (houseSig) {
            affected.push(...houseSig.people);
        }
    });

    return [...new Set(affected)]; // Remove duplicates
};

/**
 * SPECIAL RAHU/KETU RULES (Aditya Guruji)
 * ராகு/கேது சிறப்பு விதிகள்
 */

export interface RahuKetuConjunctionEffect {
    planet: string;
    effect: string;
    tamil: string;
    interpretation: string;
    examples: string[];
    isGood: boolean;
}

export const RAHU_KETU_SPECIAL_RULES = {
    /**
     * தனித்த ராகு/கேது விதி (Isolated Rahu/Ketu Rule)
     * When alone, better than with malefics
     */
    ALONE_IS_BETTER: {
        rule: "Rahu/Ketu alone is preferable to Rahu/Ketu with malefics (Saturn/Mars)",
        tamil: "ராகு/கேது தனியாக இருப்பது சனி/செவ்வாயுடன் சேர்வதை விட நல்லது",
        reason: "Alone = neutral/manageable. With malefics = amplified negativity",
        interpretation: "An isolated node is like a blank slate. When combined with malefics, it absorbs and magnifies their negative traits."
    },

    /**
     * கிரகச் சேர்க்கை விதி (Planetary Conjunction Rule)
     * Rahu/Ketu BECOMES the planet it conjoins
     */
    ABSORPTION_RULE: {
        rule: "Rahu/Ketu absorbs the nature of any planet it conjoins and becomes that planet",
        tamil: "ராகு/கேது எந்த கிரகத்துடன் சேர்ந்தாலும், அந்த கிரகமாகவே மாறிச் செயல்படும்",
        mechanism: "Shadow planets have no independent nature - they mirror and amplify the conjunct planet",
        power: "The amplification is usually 2-3x stronger than the original planet"
    },

    /**
     * Specific Conjunction Effects
     */
    CONJUNCTION_EFFECTS: {
        'Rahu+Mars': {
            planet: 'Mars',
            effect: 'Rahu becomes super-aggressive Mars - extreme courage turning to recklessness',
            tamil: 'ராகு + செவ்வாய் = அதி தைரியம், முரட்டுத்தனம், விபத்து ஆபத்து',
            interpretation: 'This combination creates fearless, sometimes reckless behavior. High accident risk, especially for blood relatives (Mars = siblings).',
            examples: [
                'Accidents (especially vehicles)',
                'Extreme sports/risk-taking',
                'Sibling conflicts/accidents',
                'Blood-related issues',
                'Aggressive business tactics'
            ],
            isGood: false
        },
        'Rahu+Saturn': {
            planet: 'Saturn',
            effect: 'Rahu becomes extreme Saturn - deep suffering but also potential for profound learning',
            tamil: 'ராகு + சனி = கடும் துன்பம், ஆனால் ஆழமான கற்றல்',
            interpretation: 'Amplifies Saturn\'s delays, restrictions, and suffering. Can lead to depression, chronic issues, but also spiritual depth.',
            examples: [
                'Chronic diseases',
                'Long-term struggles',
                'Depression/mental health',
                'Karmic lessons',
                'Servant/labor issues'
            ],
            isGood: false
        },
        'Rahu+Jupiter': {
            planet: 'Jupiter (Guru Chandala Yoga)',
            effect: 'Jupiter LOSES power, Rahu GAINS Jupiter\'s knowledge but uses it for material/unethical purposes',
            tamil: 'குரு சண்டாள யோகம்: குரு பலம் இழக்கிறார், ராகு குருவின் அறிவை பெறுகிறார்',
            interpretation: 'This is the famous Guru Chandala Yoga. Jupiter (pure wisdom) is polluted by Rahu (materialism). Person gains knowledge but lacks ethics/morality. Can indicate children issues, guru problems, or unethical financial gains.',
            examples: [
                'Children problems (Jupiter = children)',
                'Unethical money gains',
                'Guru/teacher conflicts',
                'Knowledge used for wrong purposes',
                'Lack of moral compass despite education'
            ],
            isGood: false
        },
        'Rahu+Venus': {
            planet: 'Venus',
            effect: 'Rahu becomes hyper-Venus - obsession with luxury, beauty, relationships',
            tamil: 'ராகு + சுக்ரன் = அதி ஆசை, பொருள் வசதி மோகம், காம உறவு',
            interpretation: 'Creates intense desire for comfort, luxury, and sensual pleasures. Can indicate foreign spouse or unconventional relationships.',
            examples: [
                'Obsession with luxury/comfort',
                'Foreign spouse',
                'Unconventional marriage',
                'Fashion/design innovation',
                'Excessive materialism'
            ],
            isGood: true // Can be good if well-placed
        },
        'Rahu+Mercury': {
            planet: 'Mercury',
            effect: 'Rahu becomes super-Mercury - genius in technology, but potential for deception',
            tamil: 'ராகு + புதன் = தொழில்நுட்ப மேதை, ஆனால் ஏமாற்றும் திறன்',
            interpretation: 'Excellent for IT, technology, innovative thinking. But can also create cunning, deceptive communication.',
            examples: [
                'IT/Software genius',
                'Innovative communication',
                'Foreign language skills',
                'Cunning business tactics',
                'Digital entrepreneurship'
            ],
            isGood: true // Good for modern careers
        },
        'Rahu+Sun': {
            planet: 'Sun',
            effect: 'Rahu amplifies ego and authority desire - can create government connections or ego issues',
            tamil: 'ராகு + சூரியன் = அதி அகங்காரம், அதிகார ஆசை, அரசு தொடர்பு',
            interpretation: 'Strong desire for power and status. Can give government connections (especially foreign) or create ego problems with father.',
            examples: [
                'Foreign government jobs',
                'Political ambitions',
                'Father conflicts',
                'Ego/authority issues',
                'Status obsession'
            ],
            isGood: true // If well-placed
        },
        'Rahu+Moon': {
            planet: 'Moon',
            effect: 'Rahu disturbs mind - mental confusion, emotional instability, but can give public fame',
            tamil: 'ராகு + சந்திரன் = மன குழப்பம், உணர்ச்சி ஏற்ற இறக்கம், பொது புகழ்',
            interpretation: 'Creates mental restlessness and emotional volatility. Can indicate public connection or popularity, but with mental stress.',
            examples: [
                'Mental confusion',
                'Emotional instability',
                'Public fame/popularity',
                'Mother issues',
                'Psychology interest'
            ],
            isGood: false // Usually problematic
        },
        'Ketu+Jupiter': {
            planet: 'Jupiter',
            effect: 'Ketu detaches from Jupiter - spiritual instead of material, renunciation of children/wealth',
            tamil: 'கேது + குரு = ஆன்மீக அறிவு, ஆனால் பொருள் நீக்கம், குழந்தை பிரிவு',
            interpretation: 'Creates spiritual wisdom but detachment from children, wealth. Can indicate foreign spiritual studies.',
            examples: [
                'Spiritual knowledge',
                'Detachment from children',
                'Renunciation tendency',
                'Occult/astrology expertise',
                'Loss of wealth for spiritual goals'
            ],
            isGood: true // For spiritual seekers
        },
        'Ketu+Mars': {
            planet: 'Mars',
            effect: 'Sudden courage or sudden accidents - unpredictable Mars energy',
            tamil: 'கேது + செவ்வாய் = திடீர் தைரியம் அல்லது திடீர் விபத்து',
            interpretation: 'Creates sudden, unexpected bursts of courage or accidents. Can indicate surgical expertise.',
            examples: [
                'Sudden accidents',
                'Surgical skill',
                'Unpredictable courage',
                'Sudden sibling separation',
                'Military/police with spiritual bent'
            ],
            isGood: false // Accident prone
        }
    }
};

/**
 * Function to analyze Rahu/Ketu conjunction effects
 */
export const analyzeRahuKetuConjunction = (
    nodeName: 'Rahu' | 'Ketu',
    conjunctPlanets: string[],
    language: 'en' | 'ta' = 'en'
): string => {
    if (conjunctPlanets.length === 0) {
        return language === 'ta'
            ? `${nodeName} தனியாக உள்ளது - நடுநிலை நிலை. கெட்ட கிரகங்களுடன் சேர்வதை விட இது நல்லது.`
            : `${nodeName} is alone - neutral position. Better than conjunction with malefics.`;
    }

    const effects: string[] = [];

    conjunctPlanets.forEach(planet => {
        const key = `${nodeName}+${planet}` as keyof typeof RAHU_KETU_SPECIAL_RULES.CONJUNCTION_EFFECTS;
        const effect = RAHU_KETU_SPECIAL_RULES.CONJUNCTION_EFFECTS[key];

        if (effect) {
            if (language === 'ta') {
                effects.push(`${effect.tamil}\n  எ.கா: ${effect.examples[0]}, ${effect.examples[1]}`);
            } else {
                effects.push(`${effect.effect}\n  Examples: ${effect.examples.slice(0, 2).join(', ')}`);
            }
        } else {
            // Generic interpretation if specific combo not defined
            if (language === 'ta') {
                effects.push(`${nodeName} ${planet}-ஆக மாறுகிறது - ${planet} குணங்களை பெருக்கும்`);
            } else {
                effects.push(`${nodeName} becomes ${planet} - amplifies ${planet}'s traits`);
            }
        }
    });

    return effects.join('\n\n');
};

/**
 * Check if Rahu/Ketu placement is problematic
 */
export const isRahuKetuProblematic = (
    nodeName: 'Rahu' | 'Ketu',
    conjunctPlanets: string[]
): boolean => {
    // Alone is okay
    if (conjunctPlanets.length === 0) return false;

    // Check for problematic conjunctions
    const malefics = ['Saturn', 'Mars'];
    const hasMaleficConjunction = conjunctPlanets.some(p => malefics.includes(p));

    // Guru Chandala
    const hasJupiter = conjunctPlanets.includes('Jupiter');

    return hasMaleficConjunction || (nodeName === 'Rahu' && hasJupiter);
};

