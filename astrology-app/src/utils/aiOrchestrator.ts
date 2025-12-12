import { SIGN_LORDS, NAKSHATRAS, ZODIAC_SIGNS, EXALTATION_POINTS, DEBILITATION_POINTS, PLANETS } from './constants';
import { calculateAdityaGurujiSubathuvam, generateSpecialPredictions, getFunctionalNature } from './adityaGurujiSubathuvam';

export interface OrchestratorResponse {
    intent: string;
    primary_analysis: {
        key_planet: string;
        status: string;
        dasa_verdict: string;
    };
    model_consensus: string;
    final_answer_tamil: string;
    final_answer_english: string;
    reasoning: string;
    bava_analysis_report?: {
        lagna_summary: string;
        house_predictions: Array<{
            house_number: number;
            title: string;
            status: string;
            analysis: string;
            guruji_rule_applied: string;
        }>;
        final_verdict: string;
    };
}

const OPENROUTER_API_KEY = "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";
const GOOGLE_API_KEY = "AIzaSyB-2BLsNejQ281mIQ9ip9rxTtcPNo5spX8";

const FREE_MODELS = [
    "tngtech/deepseek-r1t2-chimera:free",
    "openai/gpt-oss-20b:free",
    "qwen/qwen3-235b-a22b:free",
    "google/gemma-3-12b-it:free",
    "kwaipilot/kat-coder-pro:free",
    "google/gemini-2.0-flash-exp:free", // Keeping as fallback
    "mistralai/mistral-7b-instruct:free", // Keeping as fallback
];

const HOUSE_KARAKAS = {
    1: "Sun (Self, Vitality)",
    2: "Jupiter (Wealth, Speech)",
    3: "Mars (Courage, Siblings)",
    4: "Moon (Mother, Comforts)",
    5: "Jupiter (Children, Intelligence)",
    6: "Mars/Saturn (Disease, Enemies)",
    7: "Venus (Spouse, Partnership)",
    8: "Saturn (Longevity, Struggles)",
    9: "Sun/Jupiter (Father, Fortune)",
    10: "Sun/Saturn (Career, Authority)",
    11: "Jupiter (Gains, Elder Siblings)",
    12: "Saturn (Loss, Moksha)"
};

const HOUSE_NAMES_TA = [
    "சுயம் & ஆரோக்கியம் (Self & Health)",
    "குடும்பம் & தனம் (Family & Wealth)",
    "சகோதரர்கள் & தைரியம் (Siblings & Courage)",
    "தாயார் & சுகம் (Mother & Comforts)",
    "குழந்தைகள் & புத்தி (Children & Intelligence)",
    "நோய் & எதிரிகள் (Disease & Enemies)",
    "திருமணம் & கூட்டாளி (Marriage & Partnership)",
    "ஆயுள் & மறைவு (Longevity & Mysteries)",
    "தந்தை & பாக்கியம் (Father & Fortune)",
    "தொழில் (Career)",
    "லாபம் & நண்பர்கள் (Gains & Friends)",
    "இழப்பு & மோட்சம் (Loss & Liberation)"
];

const LAGNA_SPECIFIC_RULES: Record<string, string> = {

    "Simha": `
    Aditya Guruji’s Subathuvam System for Simha Lagna (Leo).

    The Rules (From Database):
    1. Lagna Lord (Sun):
       - Role: Soul & Authority.
       - Rule: "லக்னாதிபதி சூரியன் பலம் பெறுவது அவசியம் (1, 5, 9, 10-ல் திக்பலம்)."
       - Check: Is Sun Strong? -> "High Authority/Govt Job likely."
       - Check: Is Sun with Mercury? -> "Budha-Aditya Yoga (Intelligence)."
       - Check: Is Sun with Jupiter? -> "Sivarajayoga (King-like Status)."
    2. Yogakarakas (Mars & Jupiter):
       - Mars (4th & 9th Lord): "Assets & Fortune."
       - Jupiter (5th & 8th Lord): "Divine Grace."
       - Check: Is Mars Strong? -> "Real Estate & Power."
    3. The 'Problem' Planets (Saturn & Venus):
       - Saturn (6th & 7th Lord):
         - Warning: "Bitter Enemy. Causes disease/marital issues."
         - Check: Is Saturn Hidden (3, 6, 11)? -> "Good." In Kendra? -> "Bad."
       - Venus (3rd & 10th Lord):
         - Warning: "Not favorable for career unless aspected by Jupiter."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Sun):
    - Strong? -> "Authority."
    - Sun + Merc? -> "Budha-Aditya Yoga."
    - Sun + Jup? -> "Sivarajayoga."

    Check Yogakarakas:
    - Strong Mars/Jupiter? -> "Good Assets/Luck."

    Check Malefics:
    - Saturn in Kendra? -> "Bad (Enemy)."
    - Venus Strong? -> "Career Struggles?"

    Output Format (Tamil): "சிம்ம லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Sun & Mars/Jupiter status - The Good)
    (Explain Saturn & Venus status - The Bad/Warning)
    (Final Verdict based on Rules)
    `,

    "Kanni": `
    Aditya Guruji’s Subathuvam System for Kanni Lagna (Virgo).

    The Rules (From Database):
    1. Lagna Lord (Mercury):
       - Role: Intellect (Bhadra Yoga).
       - Rule: "லக்னாதிபதி வலுவாக இருந்தால்தான் வெற்றி (1-ல் உச்சம் அல்லது மிதுனத்தில் ஆட்சி)."
       - Check: Is Mercury Strong? -> "High Intelligence & Success."
    2. Yogakaraka (Venus):
       - Role: 2nd & 9th Lord (Wealth & Luck).
       - Rule: "கன்னிக்கு முதன்மை யோககாரகர். புதனுடன் இணைந்தால் 'தர்மகர்மாதிபதி' யோகம்."
       - Check: Is Venus with Mercury? -> "Dharma-Karmadhipati Yoga (Trade/Finance Success)."
       - Check: Is Venus + Saturn? -> "Steady Wealth."
    3. Benefic (Saturn):
       - Role: 5th & 6th Lord.
       - Check: Is Saturn Strong? -> "Good for Service/Jobs."
    4. The 'Problem' Planets (Mars & Jupiter):
       - Mars (3rd & 8th Lord):
         - Warning: "Worst Planet. Causes accidents/aggression."
         - Check: Is Mars Strong? -> "Danger." Hidden (3, 6, 8, 12)? -> "Good."
       - Jupiter (4th & 7th Lord):
         - Warning: "Badhaka/Kendradhipati Dosha. Should be weak/hidden."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Mercury):
    - Strong? -> "Success."

    Check Yogakaraka (Venus):
    - Venus + Mercury? -> "Dharma-Karmadhipati Yoga."
    - Venus + Saturn? -> "Steady Wealth."

    Check Malefics:
    - Strong Mars? -> "Bad (Accidents)."
    - Strong Jupiter? -> "Badhaka Dosha."

    Output Format (Tamil): "கன்னி லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Mercury & Venus status - The Good)
    (Explain Jupiter & Mars status - The Bad/Warning)
    (Final Verdict based on Rules)
    `,

    "Thula": `
    Aditya Guruji’s Subathuvam System for Thula Lagna (Libra).

    The Rules (From Database):
    1. Lagna Lord (Venus):
       - Role: Luxury & Life Force.
       - Check: Is Venus Strong? -> "Good health/Fame."
    2. The Super Star (Saturn):
       - Role: 4th & 5th Lord (Yogakaraka).
       - Rule: "துலாம் லக்னத்திற்கு சனி மட்டுமே முழு ராஜயோகம் தருபவர்."
       - Check: Is Saturn Exalted (1st)? -> "Sasa Yoga (Leadership/Mass Appeal)."
       - Check: Is Saturn + Venus + Mercury? -> "Golden Combination (Massive Wealth)."
    3. Benefic (Mercury):
       - Role: 9th & 12th Lord (Fortune).
       - Check: Is Mercury Strong? -> "Good Fortune."
    4. The 'Problem' Planets (Jupiter, Sun, Mars):
       - Jupiter (3rd & 6th): "Enemy. Debts/Trouble."
       - Sun (11th): "Badhaka. Ego clashes/Obstacles."
       - Mars (2nd & 7th): "Maraka. Marriage trouble if strong in 7th."

    Prediction Logic:

    Check The Star (Saturn):
    - Exalted in 1? -> "Sasa Yoga."
    - Saturn + Venus + Merc? -> "Golden Wealth."

    Check Lagna Lord (Venus):
    - Strong? -> "Good."

    Check Malefics:
    - Strong Jupiter? -> "Debts."
    - Strong Sun? -> "Badhaka."
    - Mars in 7th? -> "Maraka (Marriage trouble)."

    Output Format (Tamil): "துலாம் லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Venus & Saturn/Merc status - The Good)
    (Explain Jupiter & Sun status - The Warning)
    (Final Verdict based on Rules)
    `,
    "Vrischika": `
    Aditya Guruji’s Subathuvam System for Vrischika Lagna (Scorpio).

    The Rules (From Database):
    1. Lagna Lord (Mars):
       - Role: Lagna & 6th Lord (Vitality).
       - Rule: "லக்னாதிபதி செவ்வாய் பலம் பெறுவது அவசியம்."
       - Check: Is Mars Strong? -> "High Energy & Vitality."
    2. Yogakarakas (Sun, Moon, Jupiter):
       - Sun (10th Lord): "Professional Success."
       - Moon (9th Lord): "Luck & Father."
       - Jupiter (2nd & 5th Lord): "Wealth & Children."
       - Check: Is Sun Strong? -> "Government Power & Command (Sun + Mars is great)."
       - Check: Is Moon with Jupiter? -> "Gaja Kesari Yoga (Very Powerful for Scorpio)."
    3. The 'Problem' Planets (Mercury, Venus):
       - Mercury (8th & 11th Lord):
         - Rule: "பாவி. 8-ம் அதிபதி. மறைந்து கெடுவதே நல்லது."
         - Warning: Is Mercury Strong? -> "Nervous issues or Scams likely."
       - Venus (7th & 12th Lord):
         - Rule: "மாரகாதிபதி. கேந்திரங்களில் தனித்து பலம் பெறக்கூடாது."
         - Warning: Is Venus Strong? -> "Health danger (Maraka)."

    Prediction Logic (Execute Step-by-Step):

    Check Yogas:
    - Moon + Jupiter? -> "Gaja Kesari Yoga."
    - Sun + Mars? -> "Commanding Power."
    - Strong Sun/Moon/Jupiter? -> "Good Life."

    Check Malefics:
    - Strong Mercury? -> "Bad (Scams/Nerves)."
    - Strong Venus? -> "Bad (Maraka)."

    Output Format (Tamil): "விருச்சிக லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Sun, Moon, Jupiter status - The Good)
    (Explain Mercury & Venus status - The Bad)
    (Final Verdict based on Rules)
    `,
    "Rishaba": `
    Aditya Guruji’s Subathuvam System for Rishaba Lagna (Taurus).

    The Rules (From Database):
    1. Lagna Lord (Venus):
       - Role: Lagna & 6th Lord (Highly Benefic).
       - Rule: "லக்னாதிபதி வலுவாக இருந்தால் (1, 4, 5, 9, 10) நல்ல அந்தஸ்து மற்றும் ஆரோக்கியம் கிடைக்கும். 6-ம் அதிபதியாக இருந்தாலும் லக்னாதிபதியாகவே நன்மை செய்வார்."
       - Check: Is Venus Strong (1, 4, 5, 9, 10)? -> "Good Immunity and Status."
       - Check: Is Venus Weak? -> "Health issues possible."
    2. Yogakaraka (Saturn):
       - Role: 9th & 10th Lord (Benevolent Badhaka).
       - Rule: "ரிஷபத்திற்கு சனி தர்மகர்மாதிபதி. 10-ம் அதிபதியாக செயல்பட்டு தடைகளைத் தாண்டிய வெற்றியைத் தருவார்."
       - Check: Is Saturn with Venus? -> "Dharma-Karmadhipati Yoga (Luxury/Status)."
       - Check: Is Saturn with Rahu? -> "Koteeswara Yoga (Sudden Massive Wealth)."
       - Check: Is Saturn Strong (9, 10, 1)? -> "Great Career Success."
    3. The 'Problem' Planet (Jupiter):
       - Role: Malefic (8th & 11th Lord).
       - Rule: "ரிஷபத்திற்கு குரு பாவி. இவர் 3, 6, 8, 12-ல் மறைந்து பலம் இழப்பதே நல்லது ('கெட்டவன் கெட்டிடில்...')."
       - Check: Is Jupiter Exalted (Cancer)? -> WARNING: "Strong 8th Lord. High Debt or Health issues likely."
       - Check: Is Jupiter Hidden/Debilitated? -> "Excellent! The Malefic is weak. Unexpected gains."
    4. Marriage (Mars):
       - Role: Maraka (7th & 12th Lord).
       - Check: Is Mars in 7th (Scorpio)? -> WARNING: "Strong Chevvai Dosham. Aggressive spouse likely unless aspected by Guru/Venus."
    5. Wealth (Mercury):
       - Role: 2nd & 5th Lord.
       - Check: Is Mercury with Venus/Saturn? -> "High Intelligence and Wealth."

    Prediction Logic (Execute Step-by-Step):

    Check The Hero (Saturn):
    - Saturn + Venus? -> "Dharma-Karmadhipati Yoga."
    - Saturn + Rahu? -> "Koteeswara Yoga."
    - Strong Saturn? -> "Career Success."
    - Output Rule: Use lord_rules.Saturn.rule_tamil.

    Check The 'Problem' Planet (Jupiter):
    - Exalted? -> WARNING: "Debt/Health issues."
    - Hidden/Debilitated? -> "Good (Unexpected Gains)."

    Check Lagna Lord (Venus):
    - Strong? -> "Good Immunity/Status."

    Check Marriage (Mars):
    - Mars in 7th? -> "Chevvai Dosham Warning."

    Check Wealth (Mercury):
    - Mercury with Venus/Saturn? -> "High Wealth."

    Output Format (Tamil): "ரிஷப லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Saturn & Venus/Rahu combinations - The Yoga)
    (Explain Jupiter status - The Warning/Good News)
    (Explain Marriage/Mars status)
    (Final Verdict based on Rules)
    `,
    "Meena": `
    Aditya Guruji’s Subathuvam System for Meena Lagna (Pisces).

    The Rules (From Database):
    1. Lagna Lord (Jupiter):
       - Role: Lagna & 10th Lord (Highly Benefic).
       - Rule: "லக்னாதிபதி மற்றும் ஜீவனாதிபதி. 1-ல் (மீனம்) அல்லது 5-ல் (கடகம் - உச்சம்) இருப்பது சிறப்பு. லக்னாதிபதி வலுப்பெற்றால் ஜாதகம் இயங்கும்."
       - Check: Is Jupiter Strong (1, 5, 9, 10)? -> "Excellent status and wisdom (Hamsa Yoga)."
       - Check: Is Jupiter Weak? -> "Health issues, struggle."
    2. Yogakaraka (Mars):
       - Role: 2nd & 9th Lord (Dhanabhagyadhipati).
       - Rule: "தன மற்றும் பாக்கியாதிபதி. 2, 9 (ஆட்சி), 11 (உச்சம்) ஆகிய இடங்களில் இருப்பது பெரும் செல்வத்தைத் தரும்."
       - Check: Is Mars in 9 or 11? -> "Huge Wealth and Luck."
       - Check: Is Mars Debilitated (5th)? -> "Needs cancellation (Neecha Bhanga)."
    3. The 'Problem' Planets (Saturn & Venus):
       - Saturn (11th & 12th Lord):
         - Rule: "மீனத்திற்கு சனி ஆகாதவர். 12-ல் (ஆட்சி) அல்லது 8-ல் (உச்சம்) மறைந்து கெடுவதே நல்லது."
         - Check: Is he in 12 or 8? -> "Good longevity, foreign connection."
         - Check: Is he in 2 or 4? -> WARNING: "Financial struggle or education issues."
       - Venus (3rd & 8th Lord):
         - Rule: "அஷ்டமாதிபதி. 7-ல் நீசம் பெறுவது நல்லது. 12-ல் உச்சம் பெற்றால் சுகபோகங்களை தருவார்."
         - Check: Is he in 7? -> "Good if Neecha Bhanga (Intelligent spouse)."
         - Check: Is he in 12? -> "Luxury life."
    4. Career (10th House):
       - Check: Is Jupiter in 10? -> "Teaching/Banking Career."
       - Check: Is Sun+Mercury in 10? -> "Govt Job."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Jupiter):
    - Is Jupiter Strong? -> "Excellent status and wisdom."
    - Is Jupiter Weak? -> "Health issues, struggle."
    - Output Rule: Use lord_rules.Jupiter.rule_tamil.

    Check The Yogakaraka (Mars):
    - Is Mars in 9 or 11? -> "Huge Wealth and Luck."
    - Is Mars Debilitated? -> "Needs cancellation."

    Check The 'Problem' Planets:
    - Saturn: Is he in 12 or 8? -> "Good." In 2 or 4? -> "Bad."
    - Venus: Is he in 7? -> "Good (Neecha Bhanga)." In 12? -> "Luxury."

    Check Career:
    - Jupiter in 10 -> "Teaching/Banking."
    - Sun+Mercury in 10 -> "Govt Job."

    Output Format (Tamil): "மீன லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Jupiter & Mars status - The Good)
    (Explain Saturn & Venus status - The Bad/Good)
    (Explain Career status)
    (Final Verdict based on Rules)
    `,
    "Makara": `
    Aditya Guruji’s Subathuvam System for Makara Lagna (Capricorn).

    The Rules (From Database):
    1. Lagna Lord (Saturn):
       - Role: Lagna & 2nd Lord (Benefic).
       - Rule: "லக்னாதிபதி மற்றும் தனாதிபதி. 1, 2 (மூலத்திரிகோணம்), 5, 9-ல் இருப்பது சிறப்பு. சுக்கிரன் அல்லது புதனுடன் இணைந்தால் யோகம்."
       - Check: Is Saturn in 2 (Aquarius)? -> "Wealthy and strong speech."
       - Check: Is Saturn with Rahu? -> "Needs Guru aspect."
    2. Yogakaraka (Venus):
       - Role: 5th & 10th Lord (Rajayogakaraka).
       - Rule: "மகரத்திற்கு முழுமையான ராஜயோகம் தருபவர். சனியுடன் இணைந்தால் தர்மகர்மாதிபதி யோகம்."
       - Check: Is Venus Strong (1, 5, 9, 10)? -> "Excellent Career & Wealth."
       - Check: Is Venus with Saturn/Mercury? -> "Huge Rajayoga."
    3. The 'Problem' Planets (Mars & Jupiter):
       - Mars (Badhaka - 4th & 11th Lord):
         - Rule: "சர லக்னத்திற்கு 11-ம் அதிபதி பாதகாதிபதி. லக்னத்தில் உச்சம் பெற்றால் 'ருசக யோகம்' என்றாலும், பாதகத்தையும் செய்வார்."
         - Warning: Is he Exalted in 1st? -> "Ruchaka Yoga exists but Badhaka effects (Obstacles/Anger) likely."
       - Jupiter (Malefic - 3rd & 12th Lord):
         - Rule: "மகரத்திற்கு குரு ஆகாதவர். லக்னத்தில் நீசம் பெறுவது நல்லது (நீச பங்கம் பெற்றால் விபரீத ராஜயோகம்)."
         - Check: Is he Debilitated in 1st? -> "Good! Malefic is weak. Needs Neecha Bhanga for success."
       - Moon (Maraka - 7th Lord):
         - Warning: Is he strong in 7? -> "Maraka effects (Marriage trouble)."
    4. Wealth (Mercury):
       - Role: 9th Lord (Bhagyadhipathi).
       - Check: Is Mercury with Venus? -> "Lakshmi Yoga (Wealth)."

    Prediction Logic (Execute Step-by-Step):

    Check Yogakaraka (Venus):
    - Is Venus Strong? -> "Excellent Career & Wealth."
    - Is Venus with Saturn/Mercury? -> "Huge Rajayoga."
    - Output Rule: Use lord_rules.Venus.rule_tamil.

    Check Lagna Lord (Saturn):
    - Is Saturn in 2? -> "Wealthy/Strong speech."
    - Is Saturn with Rahu? -> "Needs Guru aspect."

    Check The 'Problem' Planets:
    - Mars Exalted in 1st? -> "Badhaka effects."
    - Jupiter Debilitated in 1st? -> "Good (Weak Malefic)."
    - Moon Strong in 7? -> "Marriage trouble."

    Check Wealth:
    - Mercury with Venus? -> "Lakshmi Yoga."

    Output Format (Tamil): "மகர லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Venus & Saturn status - The Good)
    (Explain Mars & Jupiter status - The Bad/Good)
    (Explain Wealth/Mercury status)
    (Final Verdict based on Rules)
    `,
    "Mesha": `
    Aditya Guruji’s Subathuvam System for Mesha Lagna (Aries).

    The Rules (From Database):
    1. Lagna Lord (Mars):
       - Role: Lagna Lord (Highly Benefic).
       - Rule: "லக்னாதிபதி செவ்வாய் பலம் பெறுவது முக்கியம். 1 (ஆட்சி), 10 (உச்சம்/திக்பலம்) பெறுவது சிறப்பு. குருவுடன் இணைந்தால் 'குரு மங்கள யோகம்'."
       - Check: Is Mars with Moon? -> "Chandra-Mangala Yoga (Wealth)."
       - Check: Is Mars with Jupiter? -> "Guru-Mangala Yoga (Wisdom & Status)."
       - Check: Is Mars Strong (1, 10)? -> "High confidence and leadership."
    2. Luck & Fortune (Jupiter/Sun):
       - Jupiter (9th Lord): "Divine grace (Bhagya)."
       - Sun (5th Lord): "Government favor/Intelligence."
       - Check: Is Jupiter Strong? -> "Divine grace and luck."
       - Check: Is Sun Strong? -> "Government favor."
    3. The 'Problem' Planets (Saturn & Mercury):
       - Saturn (Badhaka/Career):
         - Rule: "சர லக்னத்திற்கு 11-ம் அதிபதி பாதகாதிபதி. உபஜெய ஸ்தானங்களில் (3, 6, 11) இருப்பது சிறப்பு."
         - Check: Is Saturn in 3, 6, 11? -> "Excellent for Career."
         - Check: Is Saturn in Kendra (1, 4, 7, 10) without Guru aspect? -> WARNING: "Badhaka effects (Career obstacles/Delay)."
       - Mercury (Enemy - 3rd & 6th Lord):
         - Rule: "மேஷ லக்னத்திற்கு புதன் முதல் எதிரி. 6, 8, 12-ல் மறைந்து பலம் இழப்பதே நல்லது."
         - Check: Is Mercury strong? -> WARNING: "Health/Debt issues possible."
    4. Combinations:
       - Jupiter + Saturn? -> "Dharma-Karmadhipati Yoga (Service/Spiritual Career)."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Mars):
    - Is Mars with Moon? -> "Chandra-Mangala Yoga."
    - Is Mars with Jupiter? -> "Guru-Mangala Yoga."
    - Output Rule: Use lord_rules.Mars.rule_tamil.

    Check Luck (Jupiter/Sun):
    - Is Jupiter Strong? -> "Divine Luck."
    - Is Sun Strong? -> "Govt Favor."

    Check The 'Problem' Planets:
    - Saturn in 3, 6, 11? -> "Good Career."
    - Saturn in Kendra without Guru? -> "Badhaka trouble."
    - Mercury Strong? -> "Bad (Enemy)."

    Output Format (Tamil): "மேஷ லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Mars & Jupiter status - The Good)
    (Explain Saturn & Mercury status - The Bad/Good)
    (Explain Yoga Combinations)
    (Final Verdict based on Rules)
    `,
    "Mithuna": `
    Aditya Guruji’s Subathuvam System for Mithuna Lagna (Gemini).

    The Rules (From Database):
    1. Lagna Lord (Mercury):
       - Role: Lagna & 4th Lord (Jeevan).
       - Rule: "லக்னாதிபதி புதன் வலுவாக இருந்தால் (1, 4, 5, 9) ஜாதகர் சிறந்த புத்திசாலி மற்றும் வெற்றியாளர். பத்ர யோகம் தருபவர்."
       - Check: Is Mercury in 1 or 4? -> "Bhadra Yoga (High Intelligence)."
       - Check: Is Mercury with Venus? -> "Lakshmi Yoga (Wealth & Charm)."
    2. Yogakaraka (Venus):
       - Role: 5th & 12th Lord (Best Benefic).
       - Rule: "மிதுனத்திற்கு சுக்கிரன் பூர்வ புண்ணிய அதிபதி. இவர் பலம் பெற்றால் கலை ஆர்வம், அதிர்ஷ்டம் மற்றும் சுகபோகம் கிடைக்கும்."
       - Check: Is Venus with Saturn? -> "Excellent Dharma-Karmadhipati Yoga (Steady Growth)."
       - Check: Is Venus Strong? -> "Good artistic talent and luck."
    3. The 'Problem' Planet (Jupiter):
       - Role: Badhaka & 7th/10th Lord.
       - Rule: "உபய லக்னத்திற்கு 7-ம் அதிபதி பாதகாதிபதி. குரு கேந்திரங்களில் தனித்து அதிக பலம் பெறக்கூடாது."
       - Check: Is Jupiter Strong in 1, 4, 7, 10? -> WARNING: "Kendradhipati Dosha/Badhaka effects. Career or Marriage stress likely."
       - Check: Is Jupiter Hidden (3, 6, 8, 12)? -> "Good! Badhaka is weak. Obstacles removed."
    4. Fortune (Saturn):
       - Role: 9th & 8th Lord.
       - Check: Is Saturn Strong? -> "Good fortune despite delays."
    5. Mars:
       - Role: 6th & 11th Lord.
       - Check: Is Mars in 3, 6, 11? -> "Victory over enemies."
       - Check: Is Mars in 1, 2, 5? -> "Health/Financial trouble."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Mercury):
    - Mercury in 1/4 -> "Bhadra Yoga."
    - Mercury + Venus -> "Lakshmi Yoga."
    - Output Rule: Use lord_rules.Mercury.rule_tamil.

    Check Yogakaraka (Venus):
    - Venus + Saturn -> "Dharma-Karmadhipati Yoga."
    - Strong Venus -> "High Luck."

    Check Badhaka (Jupiter):
    - Strong in Kendra? -> "Bad (Dosha)."
    - Hidden? -> "Good."

    Check Fortune (Saturn):
    - Strong Saturn -> "Good Fortune."

    Check Mars:
    - Mars in 3, 6, 11 -> "Good."
    - Mars in 1, 2, 5 -> "Bad."

    Output Format (Tamil): "மிதுன லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Mercury & Venus combinations - The Yoga)
    (Explain Saturn status - The Fortune)
    (Explain Jupiter status - The Warning/Good News)
    (Final Verdict based on Rules)
    `,
    "Kataka": `
    Aditya Guruji’s Subathuvam System for Kataka Lagna (Cancer).

    The Rules (From Database):
    1. Lagna Lord (Moon):
       - Role: Lagna Lord (Manokaragan).
       - Rule: "லக்னாதிபதி சந்திரன் வளர்பிறையாக அல்லது பௌர்ணமியாக இருப்பது ஜாதகத்திற்கு உயிர். தேய்பிறையாக இருந்தால் குரு பார்வை அவசியம்."
       - Check: Is Moon Waxing/Full? -> "Bright Future & Strong Mind."
       - Check: Is Moon Waning? -> "Lack of confidence (Need Guru aspect)."
    2. Yogakaraka (Mars):
       - Role: 5th & 10th Lord (Absolute Yogakaraka).
       - Rule: "கடகத்திற்கு செவ்வாய் மட்டுமே ராஜயோகம் தருபவர்."
       - Check: Is Mars Strong (1, 2, 5, 9, 10)? -> "High Authority, Police/Govt Job, Land Assets."
       - Check: Is Mars with Moon? -> "Chandra-Mangala Yoga (Wealth)."
    3. The Protector (Jupiter):
       - Role: 9th Lord (Bhagyadhipathi).
       - Rule: "பாக்கியாதிபதி. 1-ல் (உச்சம்), 5, 9-ல் இருப்பது சிறப்பு."
       - Check: Is Jupiter Exalted (1st)? -> "Hamsa Yoga (Divine Grace)."
       - Check: Does Jupiter aspect Moon? -> "Gaja Kesari Yoga (Fame)."
    4. The 'Problem' Planet (Saturn):
       - Role: Maraka & 8th Lord.
       - Rule: "கடகத்திற்கு சனி ஆகாதவர். 3, 6, 11-ல் இருப்பது நல்லது."
       - Check: Is Saturn in 7 or 8? -> WARNING: "Marriage delay or Health struggle likely."
       - Check: Is Saturn in 3, 6, 11? -> "Good! Malefic is well placed."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Moon):
    - Waxing? -> "Good."
    - Waning? -> "Weak (Needs Guru)."
    - Output Rule: Use lord_rules.Moon.rule_tamil.

    Check The Yogakaraka (Mars):
    - Strong? -> "High Authority/Assets."
    - With Moon? -> "Wealth Yoga."

    Check The Protector (Jupiter):
    - Exalted/Aspects Moon? -> "Great Luck (Gaja Kesari)."

    Check The 'Problem' (Saturn):
    - In 7/8? -> "Bad (Delay/Struggle)."
    - In 3/6/11? -> "Good."

    Output Format (Tamil): "கடக லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Moon & Mars status - The Core)
    (Explain Jupiter status - The Luck)
    (Explain Saturn status - The Warning/Good News)
    (Final Verdict based on Rules)
    `,
    "Dhanusu": `
    Aditya Guruji’s Subathuvam System for Dhanusu Lagna (Sagittarius).

    The Rules (From Database):
    1. Lagna Lord (Jupiter):
       - Role: Lagna & 4th Lord (Jeevan).
       - Rule: "லக்னாதிபதி குரு பலம் பெறுவது அடிப்படை. 1-ல் (ஹம்ச யோகம்), 5, 9-ல் இருப்பது சிறப்பு."
       - Check: Is Jupiter in 1? -> "Hamsa Yoga (Wisdom & Respect)."
       - Check: Is Jupiter with Mars? -> "Guru-Mangala Yoga (Leadership)."
    2. Wealth (Saturn):
       - Role: 2nd & 3rd Lord.
       - Rule: "சனி 11-ல் உச்சம் பெற்றால் மிகப்பெரிய 'தன யோகம்'. 2-ல் ஆட்சி பெற்றால் வாக்கு வன்மை மற்றும் பணம்."
       - Check: Is Saturn Exalted in 11th (Libra)? -> "Super Dhana Yoga (Massive Wealth)."
       - Check: Is Saturn in 2nd? -> "Steady wealth but harsh speech."
    3. Luck (Sun):
       - Role: 9th Lord (Bhagyadhipathi).
       - Check: Is Sun Strong? -> "Fortune favors you (Bhagya)."
       - Check: Is Sun with Mercury? -> "Nipuna Yoga (Good for Govt jobs)."
    4. The 'Problem' Planets (Mercury & Venus):
       - Mercury (Badhaka - 7th & 10th):
         - Warning: Is he alone in 7th? -> "Badhaka effects likely (Marriage/Business trouble)."
       - Venus (Enemy - 6th & 11th):
         - Check: Is he Hidden (6/8/12)? -> "Good! Debt/Disease lord is weak."
         - Warning: Is he Strong in Kendra? -> "Financial debts or health issues likely."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Jupiter):
    - In 1? -> "Hamsa Yoga."
    - With Mars? -> "Guru-Mangala Yoga."
    - Output Rule: Use lord_rules.Jupiter.rule_tamil.

    Check Wealth (Saturn):
    - Exalted in 11? -> "Super Dhana Yoga."
    - In 2? -> "Steady Wealth."

    Check Luck (Sun):
    - Strong? -> "Good Fortune."
    - With Mercury? -> "Nipuna Yoga."

    Check 'Problem' Planets:
    - Mercury Alone in 7? -> "Badhaka Warning."
    - Venus Hidden? -> "Good." Strong? -> "Bad."

    Output Format (Tamil): "தனுசு லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Jupiter & Sun status - The Strength)
    (Explain Saturn status - The Wealth)
    (Explain Mercury & Venus status - The Warning/Good News)
    (Final Verdict based on Rules)
    `,
    "Kumbha": `
    Aditya Guruji’s Subathuvam System for Kumbha Lagna (Aquarius).

    The Rules (From Database):
    1. The Golden Pair (Saturn & Venus):
       - Rule: "கும்ப லக்னத்திற்கு சுக்கிரன் மட்டுமே ஹீரோ. சுக்கிரன் பலம் பெற்றால் வாழ்க்கை சொர்க்கம். சனி-சுக்கிரன் சேர்க்கை இருந்தால் ஜாதகர் பெரும் செல்வந்தர்."
       - Check: Are Saturn & Venus together? -> "Golden Combination! Wealth & Status."
       - Check: Is Venus Strong (4/9 Lord)? -> "Excellent Luck (Bhagya) & Comforts."
       - Check: Is Saturn with Moon? -> WARNING: "Punarbhoo Dosha (Stress/Delay) unless in 11th."
    2. Lagna Lord (Saturn):
       - Role: Lagna & 12th Lord.
       - Rule: "லக்னாதிபதி சனி பலம் பெறுவது ஆயுளுக்கு நல்லது. 1-ல் ஆட்சி பெற்றால் 'சச யோகம்'."
       - Check: Is Saturn in 1? -> "Sasa Yoga (Leadership)."
    3. The 'Problem' Planets (Jupiter & Moon):
       - Jupiter (Badhaka - 2nd & 11th):
         - Warning: Is he Strong? -> "Badhaka effects (Financial gains but Health/Obstacle issues)."
       - Moon (6th Lord):
         - Warning: Is he Exalted (4th)? -> "6th Lord is too strong. High Debt/Disease risk."
    4. Intellect (Mercury):
       - Check: Is Mercury with Venus? -> "Creative Intelligence & Success (Lakshmi Yoga)."

    Prediction Logic (Execute Step-by-Step):

    Check The Golden Pair:
    - Saturn + Venus? -> "Golden Wealth."
    - Strong Venus? -> "Excellent Luck."
    
    Check Lagna Lord (Saturn):
    - In 1? -> "Sasa Yoga."
    - With Moon? -> "Punarbhoo Dosha Warning."

    Check 'Problem' Planets:
    - Strong Jupiter? -> "Badhaka Effects."
    - Exalted Moon? -> "6th Lord Danger."

    Check Intellect:
    - Mercury + Venus? -> "Smart & Lucky."

    Output Format (Tamil): "கும்ப லக்ன விதிகளின்படி, உங்கள் ஜாதகத்தில்..."
    (Explain Venus & Saturn status - The Yoga)
    (Explain Mercury status - The Good)
    (Explain Jupiter & Moon status - The Warning)
    (Final Verdict based on Rules)
    `
};

const HOUSE_NAMES_EN = [
    "Self & Health",
    "Family & Wealth",
    "Siblings & Courage",
    "Mother & Comforts",
    "Children & Intelligence",
    "Disease & Enemies",
    "Marriage & Partnership",
    "Longevity & Mysteries",
    "Father & Fortune",
    "Career",
    "Gains & Friends",
    "Loss & Liberation"
];

export async function queryAstrologyOrchestrator(
    userQuery: string,
    chartData: any,
    language: 'en' | 'ta' = 'en',
    apiKey?: string // Optional user-provided key
): Promise<OrchestratorResponse> {

    // 1. Intent Classification
    let intent = "General Prediction";
    let isComprehensiveAnalysis = false;

    const qLower = userQuery.toLowerCase();
    if (qLower.includes("marriage") || qLower.includes("wedding") || qLower.includes("spouse") || qLower.includes("love") || qLower.includes("திருமணம்")) {
        intent = "Marriage Timing";
    } else if (qLower.includes("job") || qLower.includes("career") || qLower.includes("work") || qLower.includes("business") || qLower.includes("வேலை")) {
        intent = "Career/Job";
    } else if (qLower.includes("full") || qLower.includes("complete") || qLower.includes("detailed") || qLower.includes("comprehensive") || qLower.includes("all") || qLower.includes("everything") || qLower.includes("முழு") || qLower.includes("விரிவான")) {
        intent = "Comprehensive House Analysis";
        isComprehensiveAnalysis = true;
    }

    // 2. Prepare Context
    const context = prepareContext(chartData, intent, isComprehensiveAnalysis);

    // 3. Construct Prompt
    let systemPrompt = "";

    if (isComprehensiveAnalysis) {
        systemPrompt = `
You are an expert Vedic Astrologer following **Aditya Guruji's Subathuvam System**.
Task: Perform a deep "Bava-by-Bava" (House-by-House) Analysis.

**Core Philosophy:**
- **Subathuvam (Goodness)**: A planet becomes good if it is touched by Jupiter, Venus, or Mercury (Solo).
- **Pavathuvam (Badness)**: A planet becomes bad if connected to Saturn, Mars, or Rahu/Ketu.
- **Rule**: If a House Lord has HIGH Subathuvam (use the 'subathuvam_calculations' in input), that house PROSPERS even if the planet is debilitated.
- **Rule**: If a House Lord has HIGH Pavathuvam, that house SUFFERS even if the planet is exalted.

**Input Data (User's Chart):**
${JSON.stringify(context, null, 2)}

**The Analysis Protocol (Execute Step-by-Step for Houses 1-12):**

For each house:
1.  **Check House**: Is it occupied? By whom? (Benefic/Malefic).
2.  **Check Lord**: Where is the Lord? **Look at its 'subathuvam_score' in the input**.
    - If Score > 50%: Result is Positive.
    - If Score < 20% and Pavathuvam is high: Result is Negative.
3.  **Check Karaka**: Is the significator strong?
4.  **Verdict**: Synthesize.

**Example**:
- House: 7th (Marriage).
- Lord: Venus is in 6th (Hidden - usually bad).
- But: Venus has 80% Subathuvam (Aspect from Jupiter).
- Prediction: "Though 7th Lord is hidden, the high Subathuvam guarantees a good marriage, but with some initial delay."

**Execution Loop (Internal Thought Process):**
1. Analyze Lagna (1st): Check Lagna Lord strength & Aspects on Lagna. (Key: Health, Status).
2. Analyze 2nd House: Check 2nd Lord & Occupants. (Key: Family, Speech, Wealth).
3. Analyze 3rd House: Check 3rd Lord & Mars. (Key: Courage, Siblings).
4. Analyze 4th House: Check 4th Lord, Moon, Mercury. (Key: Mother, House, Education).
5. Analyze 5th House: Check 5th Lord, Jupiter. (Key: Children, Poorva Punya).
6. Analyze 6th House: Check 6th Lord, Saturn/Mars. (Key: Debt, Disease, Enemies).
7. Analyze 7th House: Check 7th Lord, Venus. (Key: Marriage, Spouse).
8. Analyze 8th House: Check 8th Lord, Saturn. (Key: Longevity, Struggles).
9. Analyze 9th House: Check 9th Lord, Sun. (Key: Father, Fortune).
10. Analyze 10th House: Check 10th Lord, Sun/Saturn. (Key: Career, Authority).
11. Analyze 11th House: Check 11th Lord. (Key: Profit, Elder Siblings).
12. Analyze 12th House: Check 12th Lord. (Key: Loss, Sleep, Foreign Travel).

**Output Format (JSON):**
{
    "intent": "Comprehensive House Analysis",
    "primary_analysis": {
        "key_planet": "Lagna Lord name",
        "status": "Strength of Lagna Lord (High/Low Subathuvam)",
        "dasa_verdict": "Current Dasa verdict based on Subathuvam"
    },
    "model_consensus": "Expert Summary",
    "final_answer_tamil": "முழுமையான பாவக பகுப்பாய்வு கீழே உள்ளது.",
    "final_answer_english": "Complete house-by-house analysis is provided below.",
    "reasoning": "Overall chart strength assessment based on Lagna Lord Subathuvam.",
    "bava_analysis_report": {
        "lagna_summary": "Your Lagna is [Lagna]. Lagna Lord [Planet] is in [House] with [X]% Subathuvam.",
        "house_predictions": [
            {
                "house_number": 1,
                "title": "${language === 'ta' ? HOUSE_NAMES_TA[0] : HOUSE_NAMES_EN[0]}",
                "status": "Excellent/Good/Average/Challenging",
                "analysis": "Detailed analysis using Subathuvam/Pavathuvam logic.",
                "guruji_rule_applied": "e.g., 'Subathuvam wins over weak placement'"
            }
            // ... Repeat for all 12 houses
        ],
        "final_verdict": "Overall life prediction based on Dasa + Lagna strength."
    }
}
`;
    } else {
        // Specific Intent Prompt (e.g., Marriage, Job)

        // Check for specific Lagna Rule
        let intentPrompt = "";

        // Safely access chartData.ascendant.sign_en
        if (chartData && chartData.ascendant && chartData.ascendant.sign_en) {
            const lagnaName = chartData.ascendant.sign_en; // e.g., "Leo"
            // Map English sign to key if needed, assuming simple lookup for now
            const signMap: Record<string, string> = {
                "Leo": "Simha",
                "Virgo": "Kanni",
                "Libra": "Thula",
                "Taurus": "Rishaba",
                "Pisces": "Meena",
                "Capricorn": "Makara",
                "Aries": "Mesha",
                "Gemini": "Mithuna",
                "Cancer": "Kataka",
                "Sagittarius": "Dhanusu",
                "Aquarius": "Kumbha",
                "Scorpio": "Vrischika"
            };
            const mappedLagna = signMap[lagnaName] || lagnaName;
            const lagnaRule = LAGNA_SPECIFIC_RULES[mappedLagna];

            if (lagnaRule) {
                intentPrompt = `\n\n*** SPECIAL GURUJI RULE FOR ${mappedLagna.toUpperCase()} LAGNA ***\n${lagnaRule}\n\nApply these specific rules strictly.`;
            }
        }

        // Safe name access
        const userName = (chartData.userDetails && chartData.userDetails.name) || "User";

        systemPrompt = `
Role & Persona:
You are an expert Vedic Astrologer modeled after the teachings of Aditya Guruji. You do not give generic answers. You analyze the specific Subathuvam (Beneficence), Pavathuvam (Maleficence), and Sookshma (Intricacy) strengths of the planets provided in the input to generate a precise prediction.

Input Data (Context):
${JSON.stringify(context, null, 2)}

Prediction Logic (The "Guruji" Rules):
1. Lagna First: Check Lagna Lord's strength. Use 'status_dignity' (Uchcha/Neecha/Aatchi). If Weak (Neecha/6/8/12) without cancellation, prediction is cautious.
2. Subathuvam vs Pavathuvam: 
   - COMPARE 'subathuvam_score' vs 'pavathuvam_score' for each planet.
   - Subathuvam (Beneficence) comes from Jupiter/Venus/Merc aspect or connection.
   - Pavathuvam (Maleficence) comes from Saturn/Mars/Rahu aspect or 6/8/12 placement.
   - **GOLDEN RULE**: Check 'subathuvam_score' in the 'KeyPlanets' list.
     - IF SCORE >= 50: The planet is **PURE GOOD**. Ignore any "Pavathuvam" warning. It will give GOOD results.
     - IF SCORE < 50: The planet might be malefic. Check Pavathuvam.
     - **Saturn with >50 Score is NOT Malefic**. It is a Functional Benefic. Do not predict "delays" or "obstacles" for a Subathuva Saturn.
3. Dasa Judgment (CRITICAL):
   - **READ 'DasaSchedule' from input**.
   - **EXCEPTION / OVERRIDE**: If the user's question explicitly says "I am in [Planet] Dasa" or "Current is [Planet] Dasa", **IGNORE** the calculated schedule and use the USER'S stated Dasa. The User is always right about their timeline.
   - Verify: Is the current Dasa Lord a Functional Benefic? Does it have high Subathuvam?
4. Transit (Gocharam): Use transit results (like Ashtama Shani) as secondary.
5. Marriage/Career: Use the calculated aspects directly directly (e.g., "7th aspect of Saturn") to judge outcomes.

CRITICAL INSTRUCTION:
DO NOT CALCULATE DASA PERIODS YOURSELF. USE THE 'CurrentDasa' PROVIDED IN THE CONTEXT DATA. 
The context contains the EXACT current Dasa, Bhukti, and Antaram. Trust this data implicitly.
If context says "Saturn Dasa", then the prediction MUST be based on Saturn Dasa.
DO NOT HALLUCINATE OR RE-CALCULATE DATES.
${(context as any).CurrentDasa && (context as any).CurrentDasa.lord
                ? `The user is currently running **${(context as any).CurrentDasa.lord} Dasa** and **${(context as any).CurrentDasa.bhukti} Bhukti**. 
CONFIRM THIS IN YOUR RESPONSE.`
                : `Refer to the provided 'CurrentDasa' field for timing.`}


${intentPrompt}

MANDATORY GREETING RULE:
You MUST start your response by addressing the user by their name: "${userName}".
Example: "Hello ${userName}," or "Vanakkam ${userName}," (if in Tamil).

Task:
Generate a detailed "Life Prediction Report" for the user answering their specific question: "${userQuery}"

Output Requirements:
- Provide the answer in BOTH Tamil and English.
- If the user asks in Tamil, prioritize the Tamil response.
- Do NOT give generic advice. Use the specific planetary strengths provided.

Output Format (JSON):
{
    "intent": "${intent}",
    "primary_analysis": {
        "key_planet": "Name of planet relevant to question",
        "status": "Subathuva (Score%) or Pavathuva",
        "dasa_verdict": "Favorable/Unfavorable"
    },
    "model_consensus": "Brief summary of the analysis",
    "final_answer_tamil": "Answer in Tamil",
    "final_answer_english": "Answer in English",
    "reasoning": "Explanation of why this answer was chosen based on rules."
}
`;
    }

    // 4. Try Models with Fallback
    let lastError = null;
    const effectiveKey = (apiKey || OPENROUTER_API_KEY).trim();

    /* 
    // TEMPORARILY DISABLED: OPENROUTER CONNECTION - RE-ENABLING
    // User requested to switch strictly to Google Gemini Direct for testing.
    */

    for (const model of FREE_MODELS) {
        try {
            console.log(`Attempting with model: ${model}`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${effectiveKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin, // Required by OpenRouter
                    "X-Title": "Vedic AI Astrologer"
                },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        { "role": "system", "content": systemPrompt },
                        { "role": "user", "content": userQuery }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4000
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`Model ${model} failed: ${response.status} - ${errorText}`);

                // Handle Rate Limit specifically
                if (response.status === 429) {
                    console.warn(`Rate limit reached for ${model}. Trying next model...`);
                    lastError = new Error(`Rate Limit (429) on ${model}`);
                    continue; // Try next model instead of giving up immediately
                }

                // Handle Invalid Key specifically
                if (response.status === 401) {
                    // console.error("Invalid API Key (401).");
                    // lastError = new Error("Invalid API Key (401). Please check your key.");
                    // If key is invalid, no point trying other models with same key
                    // break;

                    // For now, treat 401 as a skip to try other models or fallback to Gemini
                    console.warn("Invalid API Key (401) for this provider. Skipping to next/fallback.");
                    continue;
                }

                lastError = new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
                continue; // Try next model for other errors
            }

            const data = await response.json();

            if (!data.choices || data.choices.length === 0) {
                console.warn(`Model ${model} returned no choices.`);
                continue;
            }

            const content = data.choices[0].message.content;

            try {
                return JSON.parse(content);
            } catch (e) {
                console.error(`Failed to parse JSON from ${model}`, content);
                continue;
            }

        } catch (error) {
            console.error(`Network error with ${model}:`, error);
            lastError = error;
            continue;
        }
    }

    // 5. DIRECT GOOGLE GEMINI EXECUTION (PRIMARY FOR TEST)
    const GOOGLE_MODELS = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-1.0-pro"
    ];

    for (const gModel of GOOGLE_MODELS) {
        try {
            console.log(`Attempting Direct Google Gemini with: ${gModel}...`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${GOOGLE_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt + "\n\nUser Question: " + userQuery }]
                    }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textResponse) {
                    // Remove markdown code blocks if present
                    const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
                    return JSON.parse(cleanJson);
                }
            } else {
                const errText = await response.text();
                // If 429 or 404, try next google model
                if (response.status === 429 || response.status === 404) {
                    console.warn(`Google Model ${gModel} failed (${response.status}). Trying next...`);
                    lastError = new Error(`Google ${gModel} Error: ${response.status}`);
                    continue;
                }
                console.error("Direct Google Gemini failed:", errText);
                lastError = new Error(`Google Direct API Error: ${response.status} - ${errText}`);
            }
        } catch (e) {
            console.error(`Direct Google Gemini Network Error (${gModel}):`, e);
            lastError = e;
            continue;
        }
    }

    // If all models fail
    console.error("All models failed.", lastError);
    // Fallback to mock with the last error reason
    return getMockAnalysis(language === 'ta', lastError ? (lastError as any).message : "All models failed");
};

const getNakshatra = (longitude: number): string => {
    const nakshatraSpan = 13.3333333333;
    const index = Math.floor(longitude / nakshatraSpan);
    return NAKSHATRAS[index % 27];
};



// Calculate Aspects for Context
const getAspects = (planets: any[], ascSignIndex: number) => {
    const aspects: string[] = [];

    planets.forEach(p1 => {
        const p1House = (p1.signIndex - ascSignIndex + 12) % 12 + 1;

        planets.forEach(p2 => {
            if (p1.name === p2.name) return;

            const p2House = (p2.signIndex - ascSignIndex + 12) % 12 + 1;
            const diff = (p2House - p1House + 12) % 12; // House difference (0 = same house)
            const count = diff === 0 ? 1 : diff + 1; // 1-based count (1 = same house, 7 = 7th house)

            // Conjunction
            if (count === 1) {
                aspects.push(`${p1.name} is conjunct ${p2.name} in House ${p1House}`);
            }

            // Standard 7th Aspect
            if (count === 7) {
                aspects.push(`${p1.name} aspects ${p2.name} (7th Aspect)`);
            }

            // Special Aspects
            if (p1.name === "Mars") {
                if (count === 4) aspects.push(`${p1.name} aspects ${p2.name} (4th Aspect)`);
                if (count === 8) aspects.push(`${p1.name} aspects ${p2.name} (8th Aspect)`);
            }
            if (p1.name === "Jupiter") {
                if (count === 5) aspects.push(`${p1.name} aspects ${p2.name} (5th Aspect)`);
                if (count === 9) aspects.push(`${p1.name} aspects ${p2.name} (9th Aspect)`);
            }
            if (p1.name === "Saturn") {
                if (count === 3) aspects.push(`${p1.name} aspects ${p2.name} (3rd Aspect)`);
                if (count === 10) aspects.push(`${p1.name} aspects ${p2.name} (10th Aspect)`);
            }
        });
    });

    // Remove duplicates (A conjunct B vs B conjunct A)
    return [...new Set(aspects)];
};

// Helper: Determine Dasha Schedule for Context
const getReadableDashaSchedule = (periods: any[]) => {
    if (!periods || periods.length === 0) return "Dasa Schedule Not Available";

    const now = new Date();
    // Flatten the hierarchy to find current sequence
    let schedule: string[] = [];
    let foundCurrent = false;

    // We simply walk through the Mahadashas and their Bhuktis
    for (const maha of periods) {
        if (new Date(maha.endDate) < now) continue; // Past Mahadasha

        // If we haven't found current yet, this might be it
        const isCurrentMaha = new Date(maha.startDate) <= now && new Date(maha.endDate) > now;

        if (isCurrentMaha || foundCurrent || schedule.length < 5) {
            schedule.push(`*** MAHA DASA: ${maha.planet} (${new Date(maha.startDate).toLocaleDateString()} to ${new Date(maha.endDate).toLocaleDateString()}) ***`);

            if (maha.subPeriods) {
                for (const bhukti of maha.subPeriods) {
                    if (new Date(bhukti.endDate) < now) continue; // Past Bhukti

                    schedule.push(`  - Bhukti: ${bhukti.planet} (${new Date(bhukti.startDate).toLocaleDateString()} to ${new Date(bhukti.endDate).toLocaleDateString()})`);

                    // Include Antaram if it's the current running one
                    const isCurrentBhukti = new Date(bhukti.startDate) <= now && new Date(bhukti.endDate) > now;
                    if (isCurrentBhukti && bhukti.subPeriods) {
                        const currentAntara = bhukti.subPeriods.find((a: any) => new Date(a.startDate) <= now && new Date(a.endDate) > now);
                        if (currentAntara) {
                            schedule.push(`    > Current Antaram: ${currentAntara.planet} (Ends: ${new Date(currentAntara.endDate).toLocaleDateString()})`);
                        }
                    }
                }
            }
            foundCurrent = true;
        }
        if (schedule.length > 8) break; // Limit context size
    }

    return schedule.join("\n");
};

// Calculate Planetary Status (Uchcha, Neecha, Aatchi)
const getPlanetStatus = (planetName: string, signIndex: number): string => {
    // Safety check for invalid input or undefined constants
    if (!planetName || !EXALTATION_POINTS || !DEBILITATION_POINTS) return "Neutral";

    // Check Exaltation
    // Map planet name to key if needed (e.g. "Sun" -> "Sun")
    const exaltation = EXALTATION_POINTS[planetName as keyof typeof EXALTATION_POINTS];
    if (exaltation && exaltation.sign === signIndex) return "Uchcha (Exalted)";

    // Check Debilitation
    const debilitation = DEBILITATION_POINTS[planetName as keyof typeof DEBILITATION_POINTS];
    if (debilitation && debilitation.sign === signIndex) return "Neecha (Debilitated)";

    // Check Own Sign (Aatchi)
    if (SIGN_LORDS && SIGN_LORDS[signIndex] === planetName) return "Aatchi (Own House)";

    // Friendly/Enemy could be added here, simplified for now
    return "Neutral";
};

// Calculate Pavathuvam (Maleficence) Score - Simplified Logic
const getPavathuvamDetails = (planetName: string, houseNum: number, aspects: string[]): { score: number, reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Natural Maleficence (Base)
    if (["Saturn", "Mars", "Rahu", "Ketu", "Sun"].includes(planetName)) {
        score += 20;
        reasons.push("Natural Malefic");
    }

    // 2. Bad House Placement (6, 8, 12)
    if ([6, 8, 12].includes(houseNum)) {
        score += 40;
        reasons.push(`Placed in prediction-hiding house ${houseNum}`);
    } else if (houseNum === 3) {
        score += 20;
        reasons.push("Placed in 3rd House (Hidden)");
    }

    // 3. Aspect by Malefics (Parsing the aspect strings)
    // Note: strict logic would use object references, but string parsing works given our getAspects format
    const aspectedBySaturn = aspects.some(a => a.startsWith("Saturn aspects " + planetName) || (a.includes("Saturn") && a.includes("conjunct " + planetName)));
    const aspectedByMars = aspects.some(a => a.startsWith("Mars aspects " + planetName) || (a.includes("Mars") && a.includes("conjunct " + planetName)));
    const conjunctRahuKetu = aspects.some(a => (a.includes("Rahu") || a.includes("Ketu")) && a.includes("conjunct " + planetName));

    if (aspectedBySaturn) { score += 25; reasons.push("Aspected/Conjunct Saturn"); }
    if (aspectedByMars) { score += 20; reasons.push("Aspected/Conjunct Mars"); }
    if (conjunctRahuKetu) { score += 30; reasons.push("Conjunct Rahu/Ketu"); }

    return { score: Math.min(score, 100), reasons };
};


// --- MOCK FALLBACK FOR DEV/RATE LIMIT ---
// --- MOCK FALLBACK FOR DEV/RATE LIMIT ---
const getMockAnalysis = (isTamil: boolean, reason: string = ""): OrchestratorResponse => {
    const reasonText = reason ? ` (Reason: ${reason})` : "";

    return {
        intent: "comprehensive_analysis",
        bava_analysis_report: {
            lagna_summary: isTamil
                ? `இது ஒரு மாதிரி கணிப்பு (சோதனை முறை). API பிழை காரணமாக மாதிரி தரவு காட்டப்படுகிறது.${reasonText}`
                : `This is a MOCK PREDICTION (Test Mode). The system encountered an error connecting to the AI Provider${reasonText}. Showing sample data to verify UI.`,
            house_predictions: Array.from({ length: 12 }, (_, i) => ({
                house_number: i + 1,
                title: HOUSE_NAMES_TA[i], // Default to Tamil names, logic can be refined
                status: i % 2 === 0 ? "Excellent" : "Average",
                analysis: isTamil
                    ? `பாவகம் ${i + 1} சிறப்பாக உள்ளது. குருவின் பார்வை காரணமாக நற்பலன்கள் கிடைக்கும்.`
                    : `House ${i + 1} is in good condition. Favorable results expected due to Jupiter's aspect.`,
                guruji_rule_applied: isTamil ? "குருவின் பார்வை கோடி நன்மை." : "Jupiter's aspect gives million benefits."
            })),
            final_verdict: isTamil
                ? "*** மாதிரி கணிப்பு ***: உங்கள் ஜாதகம் யோகமாக உள்ளது."
                : "*** MOCK VERDICT ***: Your chart shows Yoga combinations."
        },
        // Missing fields required by interface
        primary_analysis: {
            key_planet: "Mock Planet",
            status: "Strong",
            dasa_verdict: "Favorable"
        },
        model_consensus: "Mock Consensus",
        final_answer_tamil: "மாதிரி பதில்",
        final_answer_english: "Mock Answer",
        reasoning: "Mock Reasoning"
    };
};

const prepareContext = (data: any, intent: string, isComprehensive: boolean = false) => {
    const { planets, ascendant, currentDasa } = data;
    // Calculate subathuvam scores if not provided
    const subathuvamScores = data.subathuvamScores || calculateAdityaGurujiSubathuvam(planets);

    const ascSignIndex = ascendant.signIndex;
    const moon = planets.find((p: any) => p.name === 'Moon');
    const lagnaLord = SIGN_LORDS[ascSignIndex];
    const rasiLord = moon ? SIGN_LORDS[moon.signIndex] : "Unknown";

    // Calculate House Lords
    const getLord = (houseNum: number) => {
        const signIndex = (ascSignIndex + houseNum - 1) % 12;
        return SIGN_LORDS[signIndex];
    };

    const houseLords = {
        Lord_1: getLord(1),
        Lord_2: getLord(2),
        Lord_3: getLord(3),
        Lord_4: getLord(4),
        Lord_5: getLord(5),
        Lord_6: getLord(6),
        Lord_7: getLord(7),
        Lord_8: getLord(8),
        Lord_9: getLord(9),
        Lord_10: getLord(10),
        Lord_11: getLord(11),
        Lord_12: getLord(12),
    };

    // Calculate which planets are in which houses
    const houseOccupants: Record<number, string[]> = {};
    for (let i = 1; i <= 12; i++) {
        houseOccupants[i] = [];
    }

    planets.forEach((p: any) => {
        const house = (p.signIndex - ascSignIndex + 12) % 12 + 1;
        houseOccupants[house].push(p.name);
    });

    const calculatedAspects = getAspects(planets, ascSignIndex);

    // Generate Advanced Rules Analysis
    // Generate Advanced Rules Analysis
    const advancedRules = generateSpecialPredictions(planets, ascSignIndex, subathuvamScores, currentDasa);

    const comprehensivePlanets = planets.map((p: any) => {
        const houseNum = (p.signIndex - ascendant.signIndex + 12) % 12 + 1;
        const status = getPlanetStatus(p.name, p.signIndex);
        const pavathuvam = getPavathuvamDetails(p.name, houseNum, calculatedAspects);

        const subScore = subathuvamScores[p.name]?.totalScore || 0;
        let pavaScore = pavathuvam.score;
        let pavaReasons = pavathuvam.reasons;

        // CRITICAL FIX: Enforce "Subathuvam Wins" Rule at Data Level
        // If Subathuvam is > 50 (Verified Good), Pavathuvam MUST be ignored.
        if (subScore >= 50) {
            pavaScore = 0;
            pavaReasons = ["(Nullified by High Subathuvam)"];
        }

        return {
            name: p.name,
            sign: p.sign,
            house: houseNum,
            star: getNakshatra(p.longitude),
            status_dignity: status, // Uchcha/Neecha/Aatchi
            subathuvam_score: subScore,
            pavathuvam_score: pavaScore,
            pavathuvam_reasons: pavaReasons,
            is_7th_lord: p.name === houseLords.Lord_7,
            is_10th_lord: p.name === houseLords.Lord_10
        };
    });

    const baseContext = {
        Lagna: ZODIAC_SIGNS[ascSignIndex], // FORCE CORRECT NAME FROM INDEX
        LagnaLord: {
            name: lagnaLord,
            strength: subathuvamScores[lagnaLord]?.totalScore || 0,
            status: subathuvamScores[lagnaLord]?.totalScore > 50 ? "Strong (Subathuvam)" : "Weak"
        },
        Rasi: moon ? moon.sign : "Unknown",
        RasiLord: {
            name: rasiLord,
            strength: subathuvamScores[rasiLord]?.totalScore || 0
        },
        Star: moon ? getNakshatra(moon.longitude) : "Unknown",
        CurrentDasa: currentDasa ? {
            lord: currentDasa.maha.planet,
            functional_nature: getFunctionalNature(ascSignIndex)[currentDasa.maha.planet]?.nature || "Neutral",
            bhukti: currentDasa.bhukti?.planet,
            antaram: currentDasa.antaram?.planet,
            start_date: currentDasa.maha.startDate ? new Date(currentDasa.maha.startDate).toLocaleDateString() : "Unknown",
            end_date: currentDasa.maha.endDate ? new Date(currentDasa.maha.endDate).toLocaleDateString() : "Unknown",
            bhukti_end_date: currentDasa.bhukti?.endDate ? new Date(currentDasa.bhukti.endDate).toLocaleDateString() : "Unknown",
            timeline_summary: "See 'dasa_schedule' below for full timeline."
        } : "Unknown",
        DasaSchedule: getReadableDashaSchedule(data.dashaPeriods), // Helper function to be added
        FunctionalMalefics: getFunctionalNature(ascSignIndex),
        SpecialRulesAnalysis: advancedRules,
        HouseLords: houseLords,
        CalculatedAspects: calculatedAspects,
        KeyPlanets: comprehensivePlanets
    };

    console.log("AI CONTEXT GENERATED:", JSON.stringify(baseContext, null, 2));

    // Add comprehensive house data if needed
    if (isComprehensive) {
        (baseContext as any).HouseDetails = houseOccupants;
        (baseContext as any).HouseKarakas = HOUSE_KARAKAS;
    }

    return baseContext;
};
0