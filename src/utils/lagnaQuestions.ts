// Lagna Identification - Question Database
// Questions for identifying user's Lagna when birth time is unknown

export interface LagnaOption {
    lagna: string[];
    points: number; // 1 = weak match, 2 = moderate, 3 = strong
}

export interface Question {
    id: string;
    category: 'physical' | 'personality' | 'lifeEvents';
    weight: number; // Physical: 40%, Personality: 35%, Life Events: 25%
    question: {
        en: string;
        ta: string;
    };
    options: {
        id: string;
        text: {
            en: string;
            ta: string;
        };
        lagnas: LagnaOption[];
    }[];
}

const LAGNAS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export const LAGNA_QUESTIONS: Question[] = [
    // ============ PHYSICAL FEATURES (5 questions, 40% weight) ============
    {
        id: 'body_type',
        category: 'physical',
        weight: 8,
        question: {
            en: 'What is your body type?',
            ta: 'உங்கள் உடல் அமைப்பு எப்படி இருக்கு?'
        },
        options: [
            {
                id: 'thin_tall',
                text: {
                    en: 'Thin, tall body',
                    ta: 'மெலிந்த, உயரமான உடல்'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Virgo', 'Aquarius'], points: 3 }
                ]
            },
            {
                id: 'medium_muscular',
                text: {
                    en: 'Medium height, muscular',
                    ta: 'நடுத்தர உயரம், நல்ல தசை'
                },
                lagnas: [
                    { lagna: ['Aries', 'Leo', 'Scorpio'], points: 3 }
                ]
            },
            {
                id: 'short_stout',
                text: {
                    en: 'Short, stout body',
                    ta: 'குட்டையான, குண்டான உடல்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer'], points: 3 }
                ]
            },
            {
                id: 'tall_attractive',
                text: {
                    en: 'Tall, attractive body',
                    ta: 'நீண்ட, அழகான உடல்'
                },
                lagnas: [
                    { lagna: ['Libra', 'Sagittarius', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'medium_balanced',
                text: {
                    en: 'Medium, balanced body',
                    ta: 'நடுத்தர, சமச்சீரான உடல்'
                },
                lagnas: [
                    { lagna: ['Capricorn'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'face_shape',
        category: 'physical',
        weight: 8,
        question: {
            en: 'How is your face shape?',
            ta: 'உங்கள் முகம் எப்படி இருக்கு?'
        },
        options: [
            {
                id: 'oval_broad_forehead',
                text: {
                    en: 'Oval face, broad forehead',
                    ta: 'ஓவல் வடிவ முகம், நெற்றி பெரிது'
                },
                lagnas: [
                    { lagna: ['Aries', 'Sagittarius'], points: 3 }
                ]
            },
            {
                id: 'round_chubby',
                text: {
                    en: 'Round face, chubby cheeks',
                    ta: 'வட்ட முகம், பருமனான கன்னங்கள்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'long_sharp',
                text: {
                    en: 'Long face, sharp features',
                    ta: 'நீண்ட முகம், கூரிய அம்சங்கள்'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Virgo', 'Capricorn'], points: 3 }
                ]
            },
            {
                id: 'square_strong_jaw',
                text: {
                    en: 'Square face, strong jaw',
                    ta: 'சதுர முகம், வலுவான தாடை'
                },
                lagnas: [
                    { lagna: ['Leo', 'Scorpio'], points: 3 }
                ]
            },
            {
                id: 'small_delicate',
                text: {
                    en: 'Small face, delicate features',
                    ta: 'சிறிய முகம், நுட்பமான அம்சங்கள்'
                },
                lagnas: [
                    { lagna: ['Libra', 'Aquarius'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'complexion',
        category: 'physical',
        weight: 8,
        question: {
            en: 'What is your complexion?',
            ta: 'உங்கள் நிறம் எப்படி?'
        },
        options: [
            {
                id: 'reddish_coppery',
                text: {
                    en: 'Reddish/coppery',
                    ta: 'சிவப்பு/செம்பு நிறம்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Leo', 'Scorpio'], points: 3 }
                ]
            },
            {
                id: 'fair_wheatish',
                text: {
                    en: 'Fair/wheatish',
                    ta: 'வெள்ளை/சிவப்பு கலந்த'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Libra', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'yellowish_fair',
                text: {
                    en: 'Yellowish fair',
                    ta: 'மஞ்சள் கலந்த வெள்ளை'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Virgo', 'Sagittarius'], points: 3 }
                ]
            },
            {
                id: 'dark_dusky',
                text: {
                    en: 'Dark/dusky',
                    ta: 'கருமை'
                },
                lagnas: [
                    { lagna: ['Cancer', 'Capricorn', 'Aquarius'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'eyes',
        category: 'physical',
        weight: 8,
        question: {
            en: 'How are your eyes?',
            ta: 'உங்கள் கண்கள் எப்படி?'
        },
        options: [
            {
                id: 'large_sharp',
                text: {
                    en: 'Large, sharp eyes',
                    ta: 'பெரிய, கூர்மையான கண்கள்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Leo', 'Scorpio'], points: 3 }
                ]
            },
            {
                id: 'large_beautiful',
                text: {
                    en: 'Large, beautiful, sweet',
                    ta: 'பெரிய, அழகான, இனிமையான'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Libra', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'small_intelligent',
                text: {
                    en: 'Small, intelligent',
                    ta: 'சிறிய, புத்திசாலித்தனமான'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Virgo', 'Capricorn'], points: 3 }
                ]
            },
            {
                id: 'medium_attractive',
                text: {
                    en: 'Medium, attractive',
                    ta: 'நடுத்தர, அழகான'
                },
                lagnas: [
                    { lagna: ['Sagittarius', 'Aquarius'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'hair',
        category: 'physical',
        weight: 8,
        question: {
            en: 'How is your hair?',
            ta: 'உங்கள் முடி எப்படி?'
        },
        options: [
            {
                id: 'thick_straight',
                text: {
                    en: 'Thick, straight',
                    ta: 'அடர்த்தியான, நேரான'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Leo', 'Scorpio'], points: 3 }
                ]
            },
            {
                id: 'thin_curly',
                text: {
                    en: 'Thin, curly',
                    ta: 'மெல்லிய, சுருண்ட'
                },
                lagnas: [
                    { lagna: ['Aries', 'Gemini', 'Virgo'], points: 3 }
                ]
            },
            {
                id: 'medium_thickness',
                text: {
                    en: 'Medium thickness',
                    ta: 'நடுத்தர அடர்த்தி'
                },
                lagnas: [
                    { lagna: ['Libra', 'Sagittarius', 'Capricorn'], points: 3 }
                ]
            },
            {
                id: 'wavy',
                text: {
                    en: 'Wavy',
                    ta: 'அலை வடிவ'
                },
                lagnas: [
                    { lagna: ['Cancer', 'Pisces', 'Aquarius'], points: 3 }
                ]
            }
        ]
    },

    // ============ PERSONALITY TRAITS (5 questions, 35% weight) ============
    {
        id: 'temperament',
        category: 'personality',
        weight: 7,
        question: {
            en: 'What is your temperament?',
            ta: 'உங்கள் குணம் எப்படி?'
        },
        options: [
            {
                id: 'quick_temper_brave',
                text: {
                    en: 'Quick temper, brave',
                    ta: 'கோபம் வேகமாக வரும், தைரியமானவர்'
                },
                lagnas: [
                    { lagna: ['Aries'], points: 3 },
                    { lagna: ['Leo', 'Scorpio'], points: 1 }
                ]
            },
            {
                id: 'patient_calm',
                text: {
                    en: 'Patient, calm',
                    ta: 'பொறுமையான, அமைதியான'
                },
                lagnas: [
                    { lagna: ['Taurus'], points: 3 },
                    { lagna: ['Cancer', 'Libra'], points: 1 }
                ]
            },
            {
                id: 'intelligent_talkative',
                text: {
                    en: 'Intelligent, talkative',
                    ta: 'புத்திசாலி, பேசும் தன்மை'
                },
                lagnas: [
                    { lagna: ['Gemini'], points: 3 },
                    { lagna: ['Virgo', 'Aquarius'], points: 1 }
                ]
            },
            {
                id: 'emotional_caring',
                text: {
                    en: 'Emotional, caring',
                    ta: 'உணர்ச்சிவசப்படுபவர், அக்கறையுள்ளவர்'
                },
                lagnas: [
                    { lagna: ['Cancer', 'Pisces'], points: 3 },
                    { lagna: ['Scorpio'], points: 1 }
                ]
            },
            {
                id: 'proud_leadership',
                text: {
                    en: 'Proud, leadership qualities',
                    ta: 'அகந்தையுள்ளவர், தலைமை குணம்'
                },
                lagnas: [
                    { lagna: ['Leo'], points: 3 },
                    { lagna: ['Aries', 'Capricorn'], points: 1 }
                ]
            },
            {
                id: 'justice_balanced',
                text: {
                    en: 'Justice-loving, balanced',
                    ta: 'நீதி, சமநிலை விரும்பி'
                },
                lagnas: [
                    { lagna: ['Libra'], points: 3 },
                    { lagna: ['Sagittarius'], points: 1 }
                ]
            },
            {
                id: 'secretive_intense',
                text: {
                    en: 'Secretive, intense',
                    ta: 'ரகசியம், தீவிரம்'
                },
                lagnas: [
                    { lagna: ['Scorpio'], points: 3 },
                    { lagna: ['Capricorn'], points: 1 }
                ]
            },
            {
                id: 'freedom_adventurous',
                text: {
                    en: 'Freedom-loving, adventurous',
                    ta: 'சுதந்திரம் விரும்பி, சாகசம்'
                },
                lagnas: [
                    { lagna: ['Sagittarius'], points: 3 },
                    { lagna: ['Aquarius'], points: 1 }
                ]
            },
            {
                id: 'hardworking_disciplined',
                text: {
                    en: 'Hardworking, disciplined',
                    ta: 'கடின உழைப்பு, ஒழுக்கம்'
                },
                lagnas: [
                    { lagna: ['Capricorn'], points: 3 },
                    { lagna: ['Virgo'], points: 1 }
                ]
            },
            {
                id: 'dreamy_spiritual',
                text: {
                    en: 'Dreamy, spiritual',
                    ta: 'கனவான், ஆன்மீக'
                },
                lagnas: [
                    { lagna: ['Pisces'], points: 3 },
                    { lagna: ['Cancer'], points: 1 }
                ]
            }
        ]
    },
    {
        id: 'social_interaction',
        category: 'personality',
        weight: 7,
        question: {
            en: 'How do you interact with people?',
            ta: 'மக்களுடன் எப்படி பழகுவீர்கள்?'
        },
        options: [
            {
                id: 'easy_friends_social',
                text: {
                    en: 'Easy to make friends, very social',
                    ta: 'எளிதாக நண்பர்கள் ஆவேன், பேசுவேன்'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Libra', 'Sagittarius', 'Aquarius'], points: 3 }
                ]
            },
            {
                id: 'shy_then_close',
                text: {
                    en: 'Initially shy, then very close',
                    ta: 'முதலில் தயக்கம், பின் நெருக்கம்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Virgo', 'Capricorn'], points: 3 }
                ]
            },
            {
                id: 'selective_private',
                text: {
                    en: 'Selective, prefer privacy',
                    ta: 'தனிமை விரும்பி, தேர்ந்தெடுத்து பழகுவேன்'
                },
                lagnas: [
                    { lagna: ['Scorpio', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'take_charge_dominate',
                text: {
                    en: 'Take charge, like to dominate',
                    ta: 'தலைமை எடுப்பேன், கட்டுப்படுத்துவேன்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Leo'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'money_habits',
        category: 'personality',
        weight: 7,
        question: {
            en: 'How are you with money?',
            ta: 'பணம் விஷயத்தில் எப்படி?'
        },
        options: [
            {
                id: 'saving_accumulating',
                text: {
                    en: 'Saving nature, like to accumulate',
                    ta: 'சேமிக்கும் குணம், பொருள் சேர்ப்பு'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Capricorn'], points: 3 },
                    { lagna: ['Virgo'], points: 1 }
                ]
            },
            {
                id: 'spending_luxury',
                text: {
                    en: 'Spend easily, love luxury',
                    ta: 'செலவு செய்வேன், ஆடம்பரம் விரும்பி'
                },
                lagnas: [
                    { lagna: ['Leo'], points: 3 },
                    { lagna: ['Libra', 'Sagittarius'], points: 1 }
                ]
            },
            {
                id: 'business_minded',
                text: {
                    en: 'Business-minded, good at earning',
                    ta: 'வியாபாரம், பணம் சம்பாதிக்கும் திறன்'
                },
                lagnas: [
                    { lagna: ['Gemini'], points: 3 },
                    { lagna: ['Virgo', 'Scorpio'], points: 1 }
                ]
            },
            {
                id: 'not_important_spiritual',
                text: {
                    en: 'Money not important, spiritual focus',
                    ta: 'பணம் முக்கியமில்லை, ஆன்மீகம்'
                },
                lagnas: [
                    { lagna: ['Pisces'], points: 3 },
                    { lagna: ['Sagittarius'], points: 1 }
                ]
            },
            {
                id: 'frugal_earn_difficulty',
                text: {
                    en: 'Frugal, earn with difficulty',
                    ta: 'கஞ்சத்தனம், கடினமாக சம்பாதிப்பேன்'
                },
                lagnas: [
                    { lagna: ['Cancer', 'Capricorn'], points: 2 }
                ]
            }
        ]
    },
    {
        id: 'love_marriage',
        category: 'personality',
        weight: 7,
        question: {
            en: 'How are you in love & relationships?',
            ta: 'காதல் & திருமணத்தில் எப்படி?'
        },
        options: [
            {
                id: 'fall_quickly_passionate',
                text: {
                    en: 'Fall in love quickly, passionate',
                    ta: 'காதல் விரைவில், உணர்ச்சிவசப்படுவேன்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Leo', 'Sagittarius'], points: 3 }
                ]
            },
            {
                id: 'slow_need_trust',
                text: {
                    en: 'Slow to love, need trust first',
                    ta: 'மெதுவாக காதல், நம்பிக்கைக்கு பின்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Capricorn'], points: 3 }
                ]
            },
            {
                id: 'mental_connection',
                text: {
                    en: 'Need mental connection',
                    ta: 'புத்தி சம்பந்தமான காதல்'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Aquarius'], points: 3 }
                ]
            },
            {
                id: 'romantic_beauty',
                text: {
                    en: 'Very romantic, love beauty',
                    ta: 'ரொமான்டிக், அழகை விரும்பி'
                },
                lagnas: [
                    { lagna: ['Libra', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'intense_possessive',
                text: {
                    en: 'Intense, possessive',
                    ta: 'தீவிர, உடைமை குணம்'
                },
                lagnas: [
                    { lagna: ['Scorpio'], points: 3 }
                ]
            },
            {
                id: 'practical_work_first',
                text: {
                    en: 'Practical, work comes first',
                    ta: 'பிரயோகபூர்வமான, வேலை முக்கியம்'
                },
                lagnas: [
                    { lagna: ['Virgo', 'Capricorn'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'work_career_style',
        category: 'personality',
        weight: 7,
        question: {
            en: 'Your work & career style?',
            ta: 'உங்கள் வேலை & தொழில் பாணி?'
        },
        options: [
            {
                id: 'leadership_self_employment',
                text: {
                    en: 'Leadership roles, prefer self-employment',
                    ta: 'தலைமை, சுயதொழில் விரும்பி'
                },
                lagnas: [
                    { lagna: ['Aries', 'Leo', 'Sagittarius'], points: 3 }
                ]
            },
            {
                id: 'stable_job_security',
                text: {
                    en: 'Prefer stable job, need security',
                    ta: 'நிலையான வேலை, பாதுகாப்பு'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Virgo'], points: 3 }
                ]
            },
            {
                id: 'varied_work_freedom',
                text: {
                    en: 'Like varied work, need freedom',
                    ta: 'மாறுபட்ட வேலைகள், சுதந்திரம்'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Aquarius'], points: 3 }
                ]
            },
            {
                id: 'arts_beauty',
                text: {
                    en: 'Arts, beauty-related work',
                    ta: 'கலை, அழகு சம்பந்தம்'
                },
                lagnas: [
                    { lagna: ['Libra', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'investigation_research',
                text: {
                    en: 'Investigation, secrets, research',
                    ta: 'விசாரணை, ரகசியம், ஆராய்ச்சி'
                },
                lagnas: [
                    { lagna: ['Scorpio'], points: 3 }
                ]
            },
            {
                id: 'finance_management',
                text: {
                    en: 'Finance, accounts, management',
                    ta: 'பணம், கணக்கு, நிர்வாகம்'
                },
                lagnas: [
                    { lagna: ['Capricorn'], points: 3 }
                ]
            }
        ]
    },

    // ============ LIFE EVENTS (6 questions, 25% weight) ============
    {
        id: 'education',
        category: 'lifeEvents',
        weight: 4,
        question: {
            en: 'How was your education?',
            ta: 'உங்கள் கல்வி எப்படி இருந்தது?'
        },
        options: [
            {
                id: 'excellent_easy',
                text: {
                    en: 'Excellent marks, studies were easy',
                    ta: 'மிக நல்ல மதிப்பெண்கள், படிப்பு எளிது'
                },
                lagnas: [
                    { lagna: ['Gemini', 'Virgo', 'Sagittarius'], points: 3 }
                ]
            },
            {
                id: 'average_struggled',
                text: {
                    en: 'Average, had to struggle',
                    ta: 'சராசரி, கஷ்டப்பட்டு படித்தேன்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Taurus', 'Leo', 'Scorpio', 'Capricorn'], points: 2 }
                ]
            },
            {
                id: 'not_interested_work_early',
                text: {
                    en: 'Not very interested, started working early',
                    ta: 'படிப்பில் ஆர்வம் இல்லை, விரைவில் வேலைக்கு'
                },
                lagnas: [
                    { lagna: ['Cancer', 'Libra', 'Aquarius'], points: 2 }
                ]
            },
            {
                id: 'higher_education_foreign',
                text: {
                    en: 'Pursued higher education, possibly abroad',
                    ta: 'உயர் கல்வி, வெளிநாடு'
                },
                lagnas: [
                    { lagna: ['Sagittarius', 'Pisces', 'Aquarius'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'career_start_age',
        category: 'lifeEvents',
        weight: 4,
        question: {
            en: 'At what age did you start working?',
            ta: 'எந்த வயதில் வேலை தொடங்கினீர்கள்?'
        },
        options: [
            {
                id: 'age_18_22',
                text: {
                    en: '18-22 years',
                    ta: '18-22 வயதில்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Gemini', 'Leo'], points: 3 }
                ]
            },
            {
                id: 'age_23_27',
                text: {
                    en: '23-27 years',
                    ta: '23-27 வயதில்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Virgo', 'Libra', 'Scorpio', 'Capricorn'], points: 2 }
                ]
            },
            {
                id: 'age_28_plus',
                text: {
                    en: '28+ years',
                    ta: '28+ வயதுக்கு மேல்'
                },
                lagnas: [
                    { lagna: ['Sagittarius', 'Aquarius', 'Pisces'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'marriage_age',
        category: 'lifeEvents',
        weight: 5,
        question: {
            en: 'When did you marry (or expect to)?',
            ta: 'திருமணம் எப்போது நடந்தது? (இல்லை என்றால் எதிர்பார்க்கும் வயது)'
        },
        options: [
            {
                id: 'age_21_25',
                text: {
                    en: '21-25 years (early)',
                    ta: '21-25 வயதில்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Cancer', 'Libra', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'age_26_30',
                text: {
                    en: '26-30 years (normal)',
                    ta: '26-30 வயதில்'
                },
                lagnas: [
                    { lagna: ['Aries', 'Gemini', 'Leo', 'Virgo', 'Sagittarius'], points: 2 }
                ]
            },
            {
                id: 'age_30_plus',
                text: {
                    en: '30+ years (late)',
                    ta: '30+ வயதுக்கு மேல்'
                },
                lagnas: [
                    { lagna: ['Scorpio', 'Capricorn', 'Aquarius'], points: 3 }
                ]
            },
            {
                id: 'not_yet_delayed',
                text: {
                    en: 'Not yet, getting delayed',
                    ta: 'இன்னும் ஆகலை, தாமதம்'
                },
                lagnas: [
                    { lagna: ['Aquarius', 'Capricorn'], points: 3 }
                ]
            }
        ]
    },
    {
        id: 'father_relationship',
        category: 'lifeEvents',
        weight: 4,
        question: {
            en: 'Relationship with father?',
            ta: 'தந்தையுடன் உறவு எப்படி?'
        },
        options: [
            {
                id: 'very_good_supportive',
                text: {
                    en: 'Very good, very supportive',
                    ta: 'மிக நல்லது, ஆதரவு'
                },
                lagnas: [
                    { lagna: ['Leo', 'Sagittarius', 'Aries'], points: 3 }
                ]
            },
            {
                id: 'average_some_issues',
                text: {
                    en: 'Average, some issues',
                    ta: 'சராசரி, சில பிரச்சனைகள்'
                },
                lagnas: [
                    { lagna: ['Taurus', 'Gemini', 'Cancer', 'Virgo', 'Scorpio', 'Pisces'], points: 1 }
                ]
            },
            {
                id: 'not_good_problems',
                text: {
                    en: 'Not good, many problems',
                    ta: 'நல்லதல்ல, பிரச்சனைகள்'
                },
                lagnas: [
                    { lagna: ['Libra', 'Capricorn', 'Aquarius'], points: 3 }
                ]
            },
            {
                id: 'absent_distant',
                text: {
                    en: 'Father absent or distant',
                    ta: 'தந்தை இல்லை/விலகி'
                },
                lagnas: [
                    { lagna: ['Pisces', 'Virgo'], points: 2 }
                ]
            }
        ]
    },
    {
        id: 'mother_relationship',
        category: 'lifeEvents',
        weight: 4,
        question: {
            en: 'Relationship with mother?',
            ta: 'தாயுடன் உறவு எப்படி?'
        },
        options: [
            {
                id: 'very_close_loving',
                text: {
                    en: 'Very close, very loving',
                    ta: 'மிக நெருக்கம், அன்பு'
                },
                lagnas: [
                    { lagna: ['Cancer', 'Taurus', 'Pisces'], points: 3 }
                ]
            },
            {
                id: 'average_normal',
                text: {
                    en: 'Average, normal',
                    ta: 'சராசரி'
                },
                lagnas: [
                    { lagna: ['Aries', 'Gemini', 'Leo', 'Virgo', 'Libra', 'Sagittarius', 'Aquarius'], points: 1 }
                ]
            },
            {
                id: 'cold_relationship',
                text: {
                    en: 'Cold, distant relationship',
                    ta: 'குளிர்ச்சியான உறவு'
                },
                lagnas: [
                    { lagna: ['Scorpio', 'Capricorn'], points: 3 }
                ]
            },
            {
                id: 'mother_absent',
                text: {
                    en: 'Mother absent or distant',
                    ta: 'தாய் இல்லை/விலகி'
                },
                lagnas: [
                    { lagna: ['Scorpio', 'Capricorn'], points: 2 }
                ]
            }
        ]
    },
    {
        id: 'current_life_status',
        category: 'lifeEvents',
        weight: 4,
        question: {
            en: 'How is your life currently?',
            ta: 'தற்போது உங்கள் வாழ்க்கை எப்படி இருக்கு?'
        },
        options: [
            {
                id: 'excellent_success',
                text: {
                    en: 'Excellent, experiencing success',
                    ta: 'மிக நல்லது, வெற்றி'
                },
                lagnas: [
                    // This will be calculated dynamically based on current Dasa
                    { lagna: [], points: 0 }
                ]
            },
            {
                id: 'good_stable',
                text: {
                    en: 'Good, stable',
                    ta: 'நல்லது, நிலையானது'
                },
                lagnas: [
                    { lagna: [], points: 0 }
                ]
            },
            {
                id: 'average_ups_downs',
                text: {
                    en: 'Average, ups and downs',
                    ta: 'சராசரி, ஏற்ற இறக்கங்கள்'
                },
                lagnas: [
                    { lagna: [], points: 0 }
                ]
            },
            {
                id: 'difficult_struggling',
                text: {
                    en: 'Difficult, struggling',
                    ta: 'கஷ்டமாக இருக்கு'
                },
                lagnas: [
                    { lagna: [], points: 0 }
                ]
            }
        ]
    }
];

export default LAGNA_QUESTIONS;
