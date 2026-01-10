import { SIGN_LORDS, NAKSHATRAS, ZODIAC_SIGNS, EXALTATION_POINTS, DEBILITATION_POINTS, PLANETS } from './constants';
import { calculateAdityaGurujiSubathuvam, generateSpecialPredictions, getFunctionalNature } from './adityaGurujiSubathuvam';
import { adminService } from '../services/adminService';
import { predictionService } from '../services/predictionService';
import {
    predictJobTiming,
    predictDetailedMarriageTiming,
    predictCareerPath,
    predictForeignTravel,
    predictMarriageType,
    TransitPositions,
    PredictionResult
} from './predictionRules';
import { calculatePlanetaryPositions, calculateDashaPeriods, getCurrentDasha, calculateCurrentTransits } from './astrology';
import { generateGurujiPersonaProfile } from './gurujiPersonaHelpers';

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
    life_guidance?: {
        job_timing: { answer: string; reason: string };
        marriage_timing: { answer: string; reason: string };
        marriage_type: { answer: string; reason: string };
        career_path: { answer: string; reason: string };
        foreign_travel: { answer: string; reason: string };
    };
    personality_report?: {
        user_profile: {
            lagna: string;
            lagna_lord: string;
        };
        planetary_scan: Array<{
            planet: string;
            role: string;
            house: number;
            is_subathuvam: boolean;
            is_papathuvam: boolean;
            strength_reason: string;
            aspects_received: string[];
        }>;
    };
}

const OPENROUTER_API_KEY = "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";
const GOOGLE_API_KEY = "AIzaSyBJTVK7y4U7Sb9V1oslE2uG_2t2ERq4Tdo";

const FREE_MODELS = [
    "google/gemini-2.0-flash-exp:free", // User Preference: Top Priority
    // "google/gemini-2.0-flash-thinking-exp:free", // 400 Error
    // "deepseek/deepseek-r1-distill-llama-70b:free", // 404 Error
    "tngtech/deepseek-r1t2-chimera:free", // Good but rate limited
    // "openai/gpt-oss-20b:free", // 404 Error
    // "qwen/qwen3-235b-a22b:free", // 404 Error
    "google/gemma-3-12b-it:free",
    "kwaipilot/kat-coder-pro:free", // Works!
    "mistralai/mistral-7b-instruct:free",
];

// Paid models as fallback (Cheap options only - ~$0.001 per run)
const PAID_MODELS = [
    "openai/gpt-4o-mini",          // Highly reliable, very cheap ($0.15/M tokens)
    "google/gemini-2.0-flash-exp",        // Very cheap (paid version)
    "deepseek/deepseek-r1-distill-llama-70b", // Very cheap (paid version)
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

// ... (LAGNA_SPECIFIC_RULES moved to end or kept if needed, but for brevity assuming it's okay to skip re-declaring if not changing. 
// Actually, I must be careful not to delete it if I am replacing. I'll include it or better yet, assume the tool handles partial replacement? 
// The tool says "ReplacementContent". If I replace the whole file, I must include everything. 
// If I use StartLine/EndLine, I can target specific blocks. 
// It's safer to target the Top Imports block, then the Interface, then the Functions.
// But I need to modify `prepareContext`, `queryAstrologyOrchestrator` and `translateAnalysisReport`.
// These are scattered. I should use `multi_replace_file_content`.

// Re-thinking strategy: Use `multi_replace_file_content`.
// Chunk 1: Imports + Interface
// Chunk 2: queryAstrologyOrchestrator (prompt logic)
// Chunk 3: translateAnalysisReport
// Chunk 4: prepareContext
// Wait, `multi_replace_file_content` is perfect.



export const LAGNA_SPECIFIC_RULES: Record<string, string> = {

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
    1. Lagna Lord (Moon) - The Life Force:
       - Role: Lagna Lord (Manokaragan - Mind).
       - Rule: "லக்னாதிபதி சந்திரன் வளர்பிறையாக (Waxing) அல்லது பௌர்ணமியாக (Full) இருப்பது ஜாதகத்திற்கு உயிர் (Oli/Light). தேய்பிறையாக (Waning) இருந்தால் குரு பார்வை அவசியம்."
       - **CRITICAL**: Check 'MoonPhaseInfo' in the input.
       - Check: Is Moon Waxing or Full? -> "Excellent! The user has strong mental willpower, confidence, and a 'giving' nature (Lighting up others' lives)."
       - Check: Is Moon Waning? -> "Confidence might fluctuate. Needs Jupiter's aspect to stabilize. If Jupiter aspects, it fixes the flaw."
    2. Character & Personality:
       - If Moon has Light (Waxing/Full): "Motherly, Caring, Emotional, Resilient."
       - If Moon is Dark (New Moon/Waning) without Guru: "Moody, Over-sensitive, Dependent."
    3. Yogakaraka (Mars):
       - Role: 5th & 10th Lord (Absolute Yogakaraka).
       - Rule: "கடகத்திற்கு செவ்வாய் மட்டுமே ராஜயோகம் தருபவர்."
       - Check: Is Mars Strong (1, 2, 5, 9, 10)? -> "High Authority, Police/Govt Job, Land Assets."
       - Check: Is Mars with Moon? -> "Chandra-Mangala Yoga (Wealth)."
    4. The Protector (Jupiter):
       - Role: 9th Lord (Bhagyadhipathi).
       - Rule: "பாக்கியாதிபதி. 1-ல் (உச்சம்), 5, 9-ல் இருப்பது சிறப்பு."
       - Check: Is Jupiter Exalted (1st)? -> "Hamsa Yoga (Divine Grace)."
       - Check: Does Jupiter aspect Moon? -> "Gaja Kesari Yoga (Fame)."
    5. The 'Problem' Planet (Saturn):
       - Role: Maraka & 8th Lord.
       - Rule: "கடகத்திற்கு சனி ஆகாதவர். 3, 6, 11-ல் இருப்பது நல்லது."
       - Check: Is Saturn in 7 or 8? -> WARNING: "Marriage delay or Health struggle likely."
       - Check: Is Saturn in 3, 6, 11? -> "Good! Malefic is well placed."

    Prediction Logic (Execute Step-by-Step):

    Check Lagna Lord (Moon) & Character:
    - **MOON LIGHT CHECK**: Is 'MoonPhaseInfo.is_waxing' true? -> "Great Character/Strength."
    - Else -> "Weak (Needs Guru)."
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
    (Explain Moon's Light Status & Character - The Most Important)
    (Explain Mars & Jupiter status - The Luck)
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



export async function queryAstrologyOrchestrator(
    userQuery: string,
    chartData: any,
    language: 'en' | 'ta' = 'en',
    apiKey?: string // Optional user-provided key
): Promise<OrchestratorResponse> {

    // Store original language request
    const requestedLanguage = language;

    // ALWAYS generate predictions in English first to avoid Gemini API errors
    // We'll translate to Tamil afterwards if needed
    const generationLanguage = 'en';

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
    } else if (qLower.includes("who am i") || qLower.includes("personality") || qLower.includes("character") || qLower.includes("nature") || qLower.includes("behaviour") || qLower.includes("குணம்") || qLower.includes("ஆளுமை") || qLower.includes("நான் யார்")) {
        intent = "Who Am I";
    }

    // 2. Fetch Dynamic Rules from DB (with cache/fallback)
    let dynamicRulesMap: Record<string, string> = {};
    try {
        const rules = await adminService.getAllRules();
        rules.forEach(r => {
            if (r.key && r.content) {
                dynamicRulesMap[r.key] = r.content;
            }
        });
        console.log(`[AI] Loaded ${Object.keys(dynamicRulesMap).length} dynamic rules.`);
    } catch (e) {
        console.warn("[AI] Failed to fetch dynamic rules, using built-in defaults.", e);
    }

    // 2. Prepare Context (always in English for generation)
    // Pass dynamic rules to context preparer
    const context = prepareContext(chartData, intent, isComprehensiveAnalysis, generationLanguage, dynamicRulesMap);

    // Helper for Who Am I
    const getPlanetRole = (planet: string) => {
        switch (planet) {
            case 'Sun': return 'Ego/Soul';
            case 'Moon': return 'Mind';
            case 'Mars': return 'Anger/Action';
            case 'Mercury': return 'Speech/Intellect';
            case 'Jupiter': return 'Wisdom/Wealth';
            case 'Venus': return 'Luxury/Love';
            case 'Saturn': return 'Work/Karma';
            case 'Rahu': return 'Desire';
            case 'Ketu': return 'Detachment';
            default: return 'Planet';
        }
    };

    // 3. Construct Prompt
    let systemPrompt = "";

    const languageInstruction = language === 'ta'
        ? `\n\n**CRITICAL INSTRUCTION - TAMIL LANGUAGE:**\n1. The user has requested the output in TAMIL.\n2. You MUST write the 'analysis', 'title', 'reasons', 'final_verdict' and 'strength_reason' fields in TAMIL script.\n3. **FOR HOUSE TITLES**: You MUST use the exact strings provided in 'OutputFormatGuide.HouseTitles' array from the input. Do NOT translate them yourself.\n4. Do not use Tanglish. Use pure, high-quality Tamil.\n5. Ensure astrological terms are correctly translated (e.g., "Lagna" -> "லக்னம்", "Aspect" -> "பார்வை", "Subathuvam" -> "சுபத்துவம்").`
        : "";

    if (intent === "Who Am I") {
        const subathuvamResults = calculateAdityaGurujiSubathuvam(chartData.planets);
        const ascendantSignIndex = chartData.ascendant.signIndex;
        const lagnaLord = SIGN_LORDS[ascendantSignIndex];
        const lagnaName = ZODIAC_SIGNS[ascendantSignIndex];

        // Relationship Logic (7th House)
        const seventhHouseIndex = (ascendantSignIndex + 6) % 12;
        const seventhLord = SIGN_LORDS[seventhHouseIndex];

        // Helper: Get Element
        const getElement = (signIndex: number) => {
            const remainder = signIndex % 4;
            if (remainder === 0) return "Fire (Neruppu)";
            if (remainder === 1) return "Earth (Nilam)";
            if (remainder === 2) return "Air (Kaatru)";
            return "Water (Neer)";
        };
        const lagnaElement = getElement(ascendantSignIndex);
        const moon = chartData.planets.find((p: any) => p.name === 'Moon');
        const moonSign = ZODIAC_SIGNS[moon?.signIndex || 0];
        const nakshatra = getNakshatra(moon?.longitude || 0);

        // Prepare Planetary Scan Data
        const planetaryScan = chartData.planets.map((p: any) => {
            // Skip nodes for calculation if needed, but keeping them logic wise
            const subResult = subathuvamResults[p.name];
            const isSubathuvam = subResult?.isSubathuva || false;
            // Deriving Papathuvam: (simplified binary for AI)
            const isPapathuvam = !isSubathuvam && !subResult?.isNeutral;

            // Aspects Received
            const aspectsReceived = subResult?.details
                ?.filter((d: string) => d.includes("Aspected by") || d.includes("பார்வை"))
                ?.map((d: string) => d.replace(/[✅❌]/g, '').trim()) || [];

            const house = (p.signIndex - ascendantSignIndex + 12) % 12 + 1;

            return {
                planet: p.name,
                role: getPlanetRole(p.name),
                house: house,
                is_subathuvam: isSubathuvam,
                is_papathuvam: isPapathuvam,
                strength_reason: subResult?.details?.[0] || "Placement",
                aspects_received: aspectsReceived
            };
        });

        // Enrich Context for AI (Enhanced)
        (context as any).user_identity = {
            lagna: ZODIAC_SIGNS[ascendantSignIndex],
            lagna_lord: lagnaLord,
            lagna_element: lagnaElement,
            moon_sign: moonSign,
            nakshatra: nakshatra,
            seventh_lord: seventhLord
        };
        (context as any).planetary_scan = planetaryScan;

        systemPrompt = `
You are an expert Vedic Astrologer (Aditya Guruji Avatar).
Task: Combine Lagna/Rasi traits with Planetary status to give a "Deep Character Analysis" AND "Relationship Analysis".

**INPUT DATA:**
\`\`\`json
${JSON.stringify({ user_identity: (context as any).user_identity, planetary_scan: planetaryScan }, null, 2)}
\`\`\`

### 🧬 STEP 1: DECODE THE DNA (Lagna & Rasi Logic):

**1. கோபம் (Anger) - Base Nature:**
   - **If Lagna is Aries/Scorpio (Mars):** "You have 'Volcanic Anger' by birth. You explode quickly."
   - **If Lagna is Leo (Sun):** "You have 'Royal Ego'. You get angry if respect is denied."
   - **If Lagna is Taurus/Libra (Venus):** "You are naturally calm. You rarely get angry."
   - **If Lagna is Gemini/Virgo (Mercury):** "You argue with words rather than fighting."
   - **If Lagna is Capricorn/Aquarius (Saturn):** "You hide your anger inside for a long time."
   - **If Lagna is Cancer (Moon):** "You are emotional and moody."
   - **If Lagna is Sagittarius/Pisces (Jupiter):** "You get angry only for righteous reasons."

**2. நட்சத்திர குணம் (Nakshatra Nature):**
   - **Ashwini, Magam, Moolam (Ketu):** "You have a spiritual mindset and often feel confused (Ketu nature)."
   - **Bharani, Pooram, Pooradam (Venus):** "You have a natural attraction towards luxury and arts."
   - **Karthigai, Uthiram, Uthiradam (Sun):** "You are born to lead. You may be strict but fair."
   - **Rohini, Hastham, Thiruvonam (Moon):** "You are highly sensitive and emotionally connected to others."
   - **Mrigashirsha, Chitra, Avittam (Mars):** "You are active, courageous, and scientifically minded."
   - **Thiruvathirai, Swathi, Sathayam (Rahu):** "You are a deep thinker, secretive, and think outside the box."
   - **Punarpoosam, Visakam, Poorattathi (Jupiter):** "You value honesty, tradition, and wisdom."
   - **Poosam, Anusham, Uthirattathi (Saturn):** "You are hardworking, patient, and mature for your age."
   - **Ayilyam, Kettai, Revathi (Mercury):** "You are intelligent, calculative, and good at communication."

### ⚗️ STEP 2: SYNTHESIS RULES:

**A. RELATIONSHIPS (Friend/Spouse):**
   - **Check 'seventh_lord' status in planetary_scan:**
   - IF **7th Lord is Subathuvam (Pure):** "Your relationships (Spouse/Friends) will be supportive and long-lasting."
   - IF **7th Lord is Papathuvam (Impure):** "You may face misunderstandings, ego clashes, or distance in relationships."
   - IF **Venus is Subathuvam:** "You will have a happy romantic life."
   - IF **Venus is Papathuvam:** "You need to be careful in love matters. Disappointments possible."

**B. CORE CHARACTER EXPANSION:**
   - Mix Element + Lagna Lord Strength.
   - Fire Element + Strong Sun/Mars = "Dominant Leader".
   - Water Element + Weak Moon = "Overly Emotional".

**C. SHOCKING TRUTHS DETECTION (MUA):**
   - **Punarphoo Dosha (Saturn + Moon):** "You often have delays in marriage or constant mental worry."
   - **Venus + Rahu:** "You have secret desires or unconventional romantic interests."
   - **Mars + Rahu/Ketu:** "You are prone to accidents or sudden anger outbursts."
   - **6th/8th Lord in 1st/2nd:** "You may have hidden debts or health issues you hide from others."
   - **Debilitated Planets:** Identify the area of life where they struggle the most.

${languageInstruction}

**OUTPUT FORMAT:**
You MUST return a JSON object with this exact structure:
{
  "intent": "Who Am I",
  "personality_report": {
      "user_profile": { "lagna": "...", "lagna_lord": "..." },
      "planetary_scan": [ ... ]
  },
  "final_answer_tamil": "
**🦁 1. உங்கள் அடிப்படை வார்ப்பு (Deep Character):**
"நீங்கள் **${lagnaName}** லக்னத்தில் பிறந்தவர் ([Element]).
உங்கள் நட்சத்திரம் **${nakshatra}**.
இதன் விளைவாக, **[Detailed Character Analysis from Step 1 & 2B]**.
நீங்கள் இயல்பாகவே... (Describe positive & negative traits)."

**🤝 2. உறவுமுறை & நட்பு (Relationships):**
(Analyze 7th Lord & Venus).
"உங்கள் ஜாதகப்படி 7-ம் அதிபதி **${seventhLord}**... (Discuss Spouse/Friendship based on Subathuvam/Papathuvam).
நண்பர்கள்/வாழ்க்கை துணை எப்படி இருப்பார்கள்? (Predict)."

**😡 3. உங்கள் கோபம் (Mars Synthesis):**
(Scenario A/B/C from Mars Rules).

**🌚 4. உங்கள் மனநிலை (Moon Scan):**
(Analyze Moon Status).

**💰 5. பணம் & ஆடம்பரம் (Venus Scan):**
(Analyze Venus Status).

**🚧 6. வேலை & கர்மா (Saturn Scan):**
(Analyze Saturn Status).

**🔮 7. மறைந்திருக்கும் உண்மைகள் (Shocking Truths):**
"உங்களைப் பற்றிய 3 அதிர்ச்சியான உண்மைகள்:
1. **[Secret 1]:** (e.g., Punarphoo/Hidden Debt/Secret Worry).
2. **[Secret 2]:** (e.g., Family burden/Relationship struggle).
3. **[Secret 3]:** (e.g., Health or Career setback).
*இந்த விஷயங்கள் யாருக்கும் தெரியாது, ஆனால் இது உங்கள் வாழ்க்கையின் நிதர்சனம்.*"
"
}
`;

    } else if (isComprehensiveAnalysis) {
        systemPrompt = `
You are an expert Vedic Astrologer following ** Aditya Guruji's Subathuvam System**.
        Task: Perform a deep "Bava-by-Bava"(House - by - House) Analysis.${languageInstruction}

** Core Philosophy:**
- ** Subathuvam(Goodness) **: A planet becomes good if it is touched by Jupiter, Venus, or Mercury(Solo).
- ** Pavathuvam(Badness) **: A planet becomes bad if connected to Saturn, Mars, or Rahu / Ketu.
- ** Rule **: If a House Lord has HIGH Subathuvam(use the 'subathuvam_calculations' in input), that house PROSPERS even if the planet is debilitated.
- ** Rule **: If a House Lord has HIGH Pavathuvam, that house SUFFERS even if the planet is exalted.

** Input Data(User's Chart):**
${JSON.stringify(context, null, 2)}

        ** The Analysis Protocol(Execute Step - by - Step for Houses 1 - 12):**

            For each house:
        1. ** Check House **: Is it occupied ? By whom ? (Benefic / Malefic).
2. ** Check Lord **: Where is the Lord ? ** Look at its 'subathuvam_score' in the input **.
    - If Score > 50 %: Result is Positive.
    - If Score < 20 % and Pavathuvam is high: Result is Negative.
3. ** Check Karaka **: Is the significator strong ?
            4. ** Verdict **: Synthesize.

** Example **:
        - House: 7th(Marriage).
- Lord: Venus is in 6th(Hidden - usually bad).
- But: Venus has 80 % Subathuvam(Aspect from Jupiter).
- Prediction: "Though 7th Lord is hidden, the high Subathuvam guarantees a good marriage, but with some initial delay."

            ** Execution Loop(Internal Thought Process):**
                1. Analyze Lagna(1st): Check Lagna Lord strength & Aspects on Lagna. ** Describe User's Character/Nature based on Lagna Lord & Moon Phase.** (Key: Health, Status, Personality).
        2. Analyze 2nd House: Check 2nd Lord & Occupants. (Key: Family, Speech, Wealth).
3. Analyze 3rd House: Check 3rd Lord & Mars. (Key: Courage, Siblings).
4. Analyze 4th House: Check 4th Lord, Moon, Mercury. (Key: Mother, House, Education).
5. Analyze 5th House: Check 5th Lord, Jupiter. (Key: Children, Poorva Punya).
6. Analyze 6th House: Check 6th Lord, Saturn / Mars. (Key: Debt, Disease, Enemies).
7. Analyze 7th House: Check 7th Lord, Venus. (Key: Marriage, Spouse).
8. Analyze 8th House: Check 8th Lord, Saturn. (Key: Longevity, Struggles).
9. Analyze 9th House: Check 9th Lord, Sun. (Key: Father, Fortune).
10. Analyze 10th House: Check 10th Lord, Sun / Saturn. (Key: Career, Authority).
11. Analyze 11th House: Check 11th Lord. (Key: Profit, Elder Siblings).
12. Analyze 12th House: Check 12th Lord. (Key: Loss, Sleep, Foreign Travel).


    ** OUTPUT JSON STRUCTURE(Strictly follow this):**
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
                            "analysis": "${language === 'ta' ? 'பாவகத்தின் விரிவான ஆய்வு (தமிழில்).' : 'Detailed analysis using Subathuvam/Pavathuvam logic.'}",
                            "guruji_rule_applied": "e.g., 'Subathuvam wins over weak placement'"
                        }
                        // ... Repeat for all 12 houses
                    ],
                    "final_verdict": "Overall life prediction based on Dasa + Lagna strength."
                },
                "life_guidance": {
                    "job_timing": { "answer": "Refined Answer based on input", "reason": "Detailed Reason" },
                    "marriage_timing": { "answer": "Refined Answer", "reason": "Detailed Reason" },
                    "marriage_type": { "answer": "Refined Answer", "reason": "Detailed Reason" },
                    "career_path": { "answer": "Refined Answer", "reason": "Detailed Reason" },
                    "foreign_travel": { "answer": "Refined Answer", "reason": "Detailed Reason" }
                }
            }

            ** Life Guidance Instruction **:
    - ** Review the 'LifeGuidancePredictions' input.** containing: job, foreign, marriage_timing, marriage_type, career.
    - These are RULE - BASED Ground Truths. ** Do NOT contradict the 'answer' verdict ** (e.g., if it says Excellent / Date, you keep it).
    - ** Your Goal **: Expand and "humanize" the reasoning.
    - For 'answer', keep it punchy(e.g., "Expected around May 2025").
    - For 'reason', explain the planetary logic provided in the rules input but make it encouraging and clear.
    - If language is Tamil, ensure high - quality Tamil translation.
    `;
    } else {
        // Specific Intent Prompt (e.g., Marriage, Job)



        // Specific Intent Prompt (e.g., Marriage, Job)

        // --- NEW: Rule-Based Context Injection ---
        let ruleBasedInsight = "";
        let calculatedDasa: any = null;
        let calculatedPeriods: any[] = [];

        try {
            // 1. Prepare Data for Rules
            const now = new Date();
            // TODO: Use actual user lat/lng if available in context, else default
            const lat = 13.0827;
            const lng = 80.2707;

            const transitData = calculatePlanetaryPositions(now, lat, lng);
            const transits: TransitPositions = {
                jupiterSignIndex: transitData.planets.find(p => p.name === 'Jupiter')?.signIndex || 0,
                saturnSignIndex: transitData.planets.find(p => p.name === 'Saturn')?.signIndex || 0,
                rahuSignIndex: transitData.planets.find(p => p.name === 'Rahu')?.signIndex || 0,
                ketuSignIndex: transitData.planets.find(p => p.name === 'Ketu')?.signIndex || 0,
                sunSignIndex: transitData.planets.find(p => p.name === 'Sun')?.signIndex || 0,
                moonSignIndex: transitData.planets.find(p => p.name === 'Moon')?.signIndex || 0,
                marsSignIndex: transitData.planets.find(p => p.name === 'Mars')?.signIndex || 0,
                mercurySignIndex: transitData.planets.find(p => p.name === 'Mercury')?.signIndex || 0,
                venusSignIndex: transitData.planets.find(p => p.name === 'Venus')?.signIndex || 0,
            };

            const planets = chartData.planets;
            const ascendantSign = chartData.ascendant.signIndex;
            // Get Dasha data directly from database (no calculation)
            const moon = planets.find((p: any) => p.name === 'Moon');

            console.log("[Orchestrator] Using Dasha from database:", {
                hasCurrentDasa: !!chartData.currentDasa,
                hasDashaPeriods: !!chartData.dashaPeriods,
                maha: chartData.currentDasa?.maha?.planet,
                bhukti: chartData.currentDasa?.bhukti?.planet,
                antaram: chartData.currentDasa?.antaram?.planet
            });

            if (moon) {
                const subathuvamScores = calculateAdityaGurujiSubathuvam(planets);

                // Use Dasha from database directly
                calculatedDasa = chartData.currentDasa || null;
                calculatedPeriods = chartData.dashaPeriods || [];

                console.log('[AI Orchestrator] Using Dasha from database:', {
                    maha: calculatedDasa?.maha?.planet,
                    bhukti: calculatedDasa?.bhukti?.planet,
                    antaram: calculatedDasa?.antaram?.planet
                });

                // logic moved below to support fallback data
            } else {
                console.error("[Orchestrator DEBUG] MOON NOT FOUND in planets array!");
            }
        } catch (err) {
            console.error("Error calculating local dasha/transits:", err);
            // Fallback continues below
        }

        // FALLBACK: Use pre-calculated Dasha from chartData if our calculation failed
        if (!calculatedDasa && chartData.currentDasa) {
            console.log('[AI Orchestrator] Using pre-calculated Dasha from chartData');
            calculatedDasa = chartData.currentDasa;
        }
        if (!calculatedPeriods || calculatedPeriods.length === 0) {
            if (chartData.dashaPeriods && chartData.dashaPeriods.length > 0) {
                console.log('[AI Orchestrator] Using pre-calculated Dasha periods from chartData');
                calculatedPeriods = chartData.dashaPeriods;
            }
        }

        // --- GENERATE INSIGHTS (Now that we have Dasha data, either local or fallback) ---
        try {
            // Re-calculate basic data needed for insights if not already done
            const now = new Date();
            // TODO: Use actual user lat/lng if available
            const lat = 13.0827;
            const lng = 80.2707;

            // We need planets and transits for the rules
            const planets = chartData.planets;
            const transitData = calculatePlanetaryPositions(now, lat, lng);
            const transits: TransitPositions = {
                jupiterSignIndex: transitData.planets.find(p => p.name === 'Jupiter')?.signIndex || 0,
                saturnSignIndex: transitData.planets.find(p => p.name === 'Saturn')?.signIndex || 0,
                rahuSignIndex: transitData.planets.find(p => p.name === 'Rahu')?.signIndex || 0,
                ketuSignIndex: transitData.planets.find(p => p.name === 'Ketu')?.signIndex || 0,
                sunSignIndex: transitData.planets.find(p => p.name === 'Sun')?.signIndex || 0,
                moonSignIndex: transitData.planets.find(p => p.name === 'Moon')?.signIndex || 0,
                marsSignIndex: transitData.planets.find(p => p.name === 'Mars')?.signIndex || 0,
                mercurySignIndex: transitData.planets.find(p => p.name === 'Mercury')?.signIndex || 0,
                venusSignIndex: transitData.planets.find(p => p.name === 'Venus')?.signIndex || 0,
            };
            const ascendantSign = chartData.ascendant.signIndex;
            const moon = planets.find((p: any) => p.name === 'Moon');
            const subathuvamScores = calculateAdityaGurujiSubathuvam(planets);

            // Safely get birth date
            const rawDob = chartData.birthDetails?.date || chartData.birthDetails?.dob || chartData.birthDate || chartData.userParams?.dob;
            const birthDateObj = rawDob ? new Date(rawDob) : new Date(); // Fallback to now if missing (shouldn't happen)

            if (calculatedDasa && calculatedDasa.maha && moon) {
                let prediction: PredictionResult | null = null;
                const lowerIntent = intent.toLowerCase();

                if (lowerIntent.includes('job') || lowerIntent.includes('career') || lowerIntent.includes('profession')) {
                    // Run Job Timing AND Career Path
                    const jobTiming = predictJobTiming({ maha: calculatedDasa.maha, bhukti: calculatedDasa.bhukti }, transits, ascendantSign, moon.signIndex, planets, language);
                    const careerPath = predictCareerPath(planets, ascendantSign, subathuvamScores, { maha: calculatedDasa.maha, bhukti: calculatedDasa.bhukti }, language);
                    ruleBasedInsight = `\n ** Algorithmic Calculation Results(Ground Truth):**\n1.Job Timing: ${jobTiming.answer} \n   Reason: ${jobTiming.reason} \n2.Suitable Career Path: ${careerPath.answer} \n   Reason: ${careerPath.reason} `;
                }
                else if (lowerIntent.includes('marriage') || lowerIntent.includes('wedding') || lowerIntent.includes('spouse')) {
                    prediction = predictDetailedMarriageTiming({ maha: calculatedDasa.maha, bhukti: calculatedDasa.bhukti }, transits, ascendantSign, moon.signIndex, planets, birthDateObj, chartData.userDetails?.gender || 'male', calculatedPeriods, language);
                    ruleBasedInsight = `\n ** Algorithmic Calculation Results(Ground Truth):**\nMarriage Prediction: ${prediction.answer} \nReason: ${prediction.reason} `;
                }
                else if (lowerIntent.includes('abroad') || lowerIntent.includes('foreign') || lowerIntent.includes('travel')) {
                    prediction = predictForeignTravel(planets, ascendantSign, moon.signIndex, subathuvamScores, { maha: calculatedDasa.maha, bhukti: calculatedDasa.bhukti }, language);
                    ruleBasedInsight = `\n ** Algorithmic Calculation Results(Ground Truth):**\nForeign Settlement: ${prediction.answer} \nReason: ${prediction.reason} `;
                }
            }
        } catch (e) {
            console.error("Error generating rule-based insight:", e);
        }

        // Check for specific Lagna Rule
        let intentPrompt = "";

        if (ruleBasedInsight) {
            intentPrompt += `\n\n${ruleBasedInsight} \n\n ** INSTRUCTION **: The above 'Algorithmic Calculation Results' are derived from strict astrological formulas(Aditya Guruji System).USE THEM as the foundation of your answer.You can expand, explain, and soften the delivery, but DO NOT contradict the core calculated verdict unless you find a very specific canceling Yoga in the chart.Use the 'Reason' provided to explain the 'Why' to the user.`;
        }

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

            // PRIORITY: DB Rule > Static Rule
            const lagnaRule = (dynamicRulesMap && dynamicRulesMap[mappedLagna]) ? dynamicRulesMap[mappedLagna] : LAGNA_SPECIFIC_RULES[mappedLagna];

            if (lagnaRule) {
                intentPrompt = `\n\n *** SPECIAL GURUJI RULE FOR ${mappedLagna.toUpperCase()} LAGNA ***\n${lagnaRule} \n\nApply these specific rules strictly.`;
            }
        }

        // --- ROBUST DATE PARSING HELPER ---
        const parseDateSafe = (val: any): string => {
            if (!val) return "Unknown";
            try {
                if (val instanceof Date) return val.toLocaleDateString('en-IN');
                if (typeof val === 'string') return new Date(val).toLocaleDateString('en-IN');
                if (val && typeof val === 'object' && val.seconds) { // Firestore Timestamp check
                    return new Date(val.seconds * 1000).toLocaleDateString('en-IN');
                }
                return "Unknown";
            } catch { return "Unknown"; }
        };

        // --- PREPARE FORCED TEXT BLOCK ---
        const mahaP = calculatedDasa?.maha?.planet || chartData.currentDasa?.maha?.planet || "Unknown";
        const bhuktiP = calculatedDasa?.bhukti?.planet || chartData.currentDasa?.bhukti?.planet || "Unknown";
        const antaraP = calculatedDasa?.antaram?.planet || chartData.currentDasa?.antaram?.planet || "Unknown";

        const mahaStart = parseDateSafe(calculatedDasa?.maha?.start || chartData.currentDasa?.maha?.start);
        const mahaEnd = parseDateSafe(calculatedDasa?.maha?.end || chartData.currentDasa?.maha?.end);
        const bhuktiEnd = parseDateSafe(calculatedDasa?.bhukti?.end || chartData.currentDasa?.bhukti?.end);

        // Get current date for predictions
        const now = new Date();

        const forcedDashaString = `
!!! CRITICAL DATA - READ THIS FIRST !!!

**CURRENT DATE: ${now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**
**CURRENT YEAR: ${now.getFullYear()}**
⚠️ NEVER PREDICT DATES IN THE PAST! All predictions must be for ${now.getFullYear()} or later!

CURRENT DASHA STATUS:
- MAHA DASA: ${mahaP} (Ends: ${mahaEnd})
- BHUKTI: ${bhuktiP} (Ends: ${bhuktiEnd})
- ANTARA: ${antaraP}
- DATE RANGE: ${mahaStart} to ${mahaEnd}

🔴 VEDIC ASTROLOGY PROTOCOLS (MANDATORY - DO NOT MENTION THESE RULE NAMES IN YOUR RESPONSE):
1. **LAGNA IS SUPREME**: ALL predictions must be from Lagna (Ascendant), NOT Rasi (Moon Sign)
   - Marriage timing = 7th from Lagna
   - Career = 10th from Lagna  
   - Never say "because you are in [Nakshatra]" - that's just an address!

2. **STAR IS JUST AN ADDRESS**: 
   - ❌ WRONG: "You will get married because you are in Bharani star"
   - ✅ CORRECT: "You will get married because 7th lord is in Bharani (address) with Jupiter aspect (Subathuvam)"

3. **DASHA DETERMINISM**:
   - A planet CANNOT give results if its Dasha/Bhukti is NOT running
   - Always check: Is the relevant planet (7th lord for marriage, 10th lord for job) in CURRENT Dasha?
   - If NO → Predict when that planet's Dasha will come (give EXACT dates from DashaSchedule)

4. **TIMING MUST BE SPECIFIC**:
   - ❌ WRONG: "திருமணம் 2024 ஆம் ஆண்டில் நடக்கும்" (2024 is PAST!)
   - ❌ WRONG: "வீனஸ் தசை வரும் வரை காத்திருக்கவும்" (When does Venus Dasa come? Give date!)
   - ✅ CORRECT: "திருமணம் 2027 ஜனவரி முதல் 2028 மார்ச் வரை நடக்கும் (Venus Bhukti காலத்தில்)"

**IMPORTANT: In your response, DO NOT say "Based on Aditya Guruji system" or mention any astrologer names. Just provide the analysis directly.**

!!! END CRITICAL DATA !!!
`;

        // CREATE COMPREHENSIVE CONTEXT OBJECT FOR AI
        // Calculate House Lordship (Adhipathya)
        const houseLords: Record<number, string> = {};
        if (chartData.ascendant?.signIndex !== undefined) {
            for (let i = 1; i <= 12; i++) {
                const houseSignIndex = (chartData.ascendant.signIndex + i - 1) % 12;
                houseLords[i] = SIGN_LORDS[houseSignIndex];
            }
        }

        // Calculate 6-8-12 Connections
        const hiddenHouseConnections = {
            house6: {
                sign: chartData.ascendant?.signIndex !== undefined ? ZODIAC_SIGNS[(chartData.ascendant.signIndex + 5) % 12] : "Unknown",
                lord: houseLords[6] || "Unknown",
                planetsIn: chartData.planets?.filter((p: any) => p.house === 6).map((p: any) => p.name) || []
            },
            house8: {
                sign: chartData.ascendant?.signIndex !== undefined ? ZODIAC_SIGNS[(chartData.ascendant.signIndex + 7) % 12] : "Unknown",
                lord: houseLords[8] || "Unknown",
                planetsIn: chartData.planets?.filter((p: any) => p.house === 8).map((p: any) => p.name) || []
            },
            house12: {
                sign: chartData.ascendant?.signIndex !== undefined ? ZODIAC_SIGNS[(chartData.ascendant.signIndex + 11) % 12] : "Unknown",
                lord: houseLords[12] || "Unknown",
                planetsIn: chartData.planets?.filter((p: any) => p.house === 12).map((p: any) => p.name) || []
            }
        };

        const comprehensiveContext = {
            UserDetails: {
                name: chartData.userDetails?.name || "User",
                birthDate: parseDateSafe(chartData.birthDate || chartData.timestamp),
                birthPlace: chartData.userDetails?.place || "Unknown",
                gender: chartData.userDetails?.gender || "Unknown"
            },
            Lagna: {
                sign: chartData.ascendant?.sign_en || "Unknown",
                signIndex: chartData.ascendant?.signIndex,
                degree: chartData.ascendant?.degree,
                lord: chartData.ascendant?.signIndex !== undefined ? SIGN_LORDS[chartData.ascendant.signIndex] : "Unknown",
                lordPosition: chartData.planets?.find((p: any) => p.name === (chartData.ascendant?.signIndex !== undefined ? SIGN_LORDS[chartData.ascendant.signIndex] : null))
            },
            current_time_cycle: calculatedDasa ? {
                dasha: {
                    lord: calculatedDasa.maha?.planet || "Unknown",
                    end_date: parseDateSafe(calculatedDasa.maha?.end),
                    start_date: parseDateSafe(calculatedDasa.maha?.start),
                    years_remaining: calculatedDasa.maha?.end ? Math.round((new Date(calculatedDasa.maha.end).getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000) * 10) / 10 : null,
                    lord_status_in_chart: (() => {
                        const planet = chartData.planets?.find((p: any) => p.name === calculatedDasa.maha?.planet);
                        if (!planet) return "Unknown";
                        if (planet.isExalted) return "Strong (Exalted)";
                        if (planet.isOwnSign) return "Strong (Own Sign)";
                        if (planet.isDebilitated) return planet.neechaBhangaRaja ? "Weak but Neecha Bhanga" : "Weak (Debilitated)";
                        return "Moderate";
                    })(),
                    is_favourable_for_lagna: (() => {
                        const planet = calculatedDasa.maha?.planet;
                        const lagnaIndex = chartData.ascendant?.signIndex;
                        if (lagnaIndex === undefined) return false;
                        const housesRuled = Object.entries(houseLords).filter(([_, lord]) => lord === planet).map(([house]) => parseInt(house));
                        // Favorable if ruling 1,4,5,7,9,10
                        return housesRuled.some(h => [1, 4, 5, 7, 9, 10].includes(h));
                    })()
                },
                bhukti: {
                    lord: calculatedDasa.bhukti?.planet || "Unknown",
                    end_date: parseDateSafe(calculatedDasa.bhukti?.end),
                    start_date: parseDateSafe(calculatedDasa.bhukti?.start),
                    lord_status_in_chart: (() => {
                        const planet = chartData.planets?.find((p: any) => p.name === calculatedDasa.bhukti?.planet);
                        if (!planet) return "Unknown";
                        if (planet.isExalted) return "Strong (Exalted)";
                        if (planet.isOwnSign) return "Strong (Own Sign)";
                        if (planet.isDebilitated) return planet.neechaBhangaRaja ? "Weak but Neecha Bhanga" : "Weak (Debilitated)";
                        return "Moderate";
                    })(),
                    relationship_with_dasha_lord: "Friendly" // TODO: Calculate actual relationship
                },
                antharam: {
                    lord: calculatedDasa.antaram?.planet || "Unknown",
                    end_date: parseDateSafe(calculatedDasa.antaram?.end),
                    lord_status_in_chart: (() => {
                        const planet = chartData.planets?.find((p: any) => p.name === calculatedDasa.antaram?.planet);
                        if (!planet) return "Unknown";
                        if (planet.isExalted) return "Strong (Exalted)";
                        if (planet.isOwnSign) return "Strong (Own Sign)";
                        if (planet.isDebilitated) return planet.neechaBhangaRaja ? "Weak but Neecha Bhanga" : "Weak (Debilitated)";
                        return "Moderate";
                    })()
                }
            } : (chartData.currentDasa ? {
                dasha: {
                    lord: chartData.currentDasa.maha?.planet || "Unknown",
                    end_date: chartData.currentDasa.maha?.end || "Unknown",
                    start_date: chartData.currentDasa.maha?.start || "Unknown",
                    lord_status_in_chart: "From chartData (not recalculated)",
                    is_favourable_for_lagna: false
                },
                bhukti: {
                    lord: chartData.currentDasa.bhukti?.planet || "Unknown",
                    end_date: chartData.currentDasa.bhukti?.end || "Unknown",
                    lord_status_in_chart: "From chartData (not recalculated)"
                },
                antharam: {
                    lord: chartData.currentDasa.antaram?.planet || "Unknown",
                    lord_status_in_chart: "From chartData (not recalculated)"
                }
            } : {
                dasha: { lord: "NOT CALCULATED", end_date: "Unknown" },
                bhukti: { lord: "NOT CALCULATED", end_date: "Unknown" },
                antharam: { lord: "NOT CALCULATED" }
            }),
            HouseLordship: houseLords,
            HiddenHouses_6_8_12: hiddenHouseConnections,
            Planets: chartData.planets?.map((p: any) => ({
                name: p.name,
                sign: p.sign || ZODIAC_SIGNS[p.signIndex] || "Unknown",
                signIndex: p.signIndex,
                house: p.house,
                longitude: p.longitude,
                degree: Math.round((p.longitude % 30) * 100) / 100,
                isRetrograde: p.isRetrograde,
                nakshatra: p.nakshatra,
                isExalted: p.isExalted,
                isDebilitated: p.isDebilitated,
                isOwnSign: p.isOwnSign,
                subathuvamScore: chartData.subathuvam_calculations?.planetary_scores?.[p.name]?.totalScore || 0,
                isSubathuva: chartData.subathuvam_calculations?.planetary_scores?.[p.name]?.isSubathuva || false,
                rulesHouses: Object.entries(houseLords).filter(([_, lord]) => lord === p.name).map(([house]) => parseInt(house))
            })) || [],
            SubathuvamPavathuvam: {
                planetaryScores: chartData.subathuvam_calculations?.planetary_scores || {},
                houseScores: chartData.subathuvam_calculations?.house_scores || {},
                summary: "Subathuvam > 0 = Beneficial, < 0 = Malefic influence"
            },
            Yogas: chartData.yogas || [],
            Doshas: chartData.doshas || [],
            NeechaBhangaYogas: chartData.planets?.filter((p: any) => p.isDebilitated && p.neechaBhangaRaja).map((p: any) => ({
                planet: p.name,
                cancellationType: "Neecha Bhanga Raja Yoga",
                strength: "Converts debilitation to strength"
            })) || [],
            CriticalInstruction: "ALL DASHA-BHUKTI-ANTARA DATA IS COMPLETE ABOVE. Use this for TIMING predictions. Check House Lordship to understand which planet controls which life area. Use Subathuvam scores to determine quality of results."
        };

        // DYNAMIC LANGUAGE INSTRUCTION
        const languageInstruction = language === 'ta'
            ? `\n**CRITICAL LANGUAGE RULE**: \nThe user has requested the response in TAMIL (தமிழ்). \nYOU MUST OUTPUT THE 'final_answer_tamil' AND 'reasoning' COMPLETELY IN TAMIL SCRIPT. \nDO NOT USE ENGLISH FOR THE MAIN EXPLANATION. \nUse English only for specific technical terms if needed in brackets.`
            : `\n**CRITICAL LANGUAGE RULE**: \nThe user has requested the response in ENGLISH.`;

        systemPrompt = `
${languageInstruction}

${forcedDashaString}

        Role & Persona:
You are an expert Vedic Astrologer using advanced predictive techniques based on Subathuvam (Light) vs. Papathuvam (Darkness) theory.

**CRITICAL: DO NOT mention "Aditya Guruji" or any astrologer names in your responses. This is a proprietary system.**

**CRITICAL FORMATTING REQUIREMENT:**
Your response MUST be visually formatted. DO NOT give plain text paragraphs!
ALWAYS use:
- Emojis for categories (💼 🏛️ 🏗️ ⭐ ✓ ⚠️ 💡)
- Section dividers (use dashes: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━)
- Bullet points with checkmarks (✓)
- Star ratings (⭐⭐⭐⭐⭐)
- Progress bars for percentages (████████████████░░░░ 85%)

Example format:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Main Topic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rating: ⭐⭐⭐⭐⭐

Key Points:
  ✓ Point 1
  ✓ Point 2

Success Rate: ████████████████░░░░ 85%

You provide deep, rule-based predictions, not generic advice. You analyze charts strictly based on planetary strength, aspects, and timing.

Your goal is to determine if a planet has received the 'Light' of Jupiter or Venus to override its natural maleficence.

You MUST process the chart in this specific 6-step logical order for every analysis:

*** THE 6 PILLARS OF PREDICTION(GURUJI RULES) ***

            1. RULE 1: LAGNA & LAGNA LORD(Foundation)
                - The strength of the horoscope depends 100 % on the Lagna Lord.
   - Check: Is Lagna Lord in Kendra(1, 4, 7, 10) or Kona(1, 5, 9) ?
            - If Lagna Lord is weak(6, 8, 12 or Neecha) without cancellation, result is "Struggle".
   - If Lagna Lord is strong, the user can enjoy all Yogas.
   - * Action *: Start every answer by assessing the Lagna Lord's strength.

        2. RULE 2: SUBATHUVAM(Beneficence) - The Quality Check
            - This measures specific quality.A "Bad" planet becomes "Good" if it has Subathuvam.
   - Jupiter Aspect(Any distance: 5, 7, 9 houses) = 100 % Subathuvam(Top Tier).
   - Venus Association / Aspect = 75 % Subathuvam.
   - Mercury / Moon Association = 50 % Subathuvam.
   - * Action *: If a planet(e.g., Saturn) determines Career / Marriage, check its Subathuvam score.If high, predict success even if it's a Malefic planet.

        3. RULE 3: PAABATHUVAM(Maleficence) - The Negativity Check
            - Why do struggles happen ? Check for Paabathuvam.
   - Caused by: Association / Aspect of Saturn, Mars, Rahu, Ketu.
   - * Action *: If a planet has high Paabathuvam and LOW Subathuvam, predict "Delay", "Stress", or "Denial".

4. RULE 4: SOOTCHAMA(Intricate Strength) - Hidden Power
            - Look for hidden strengths not visible in Rasi.
   - ** Parivarthana ** (Exchange of Houses): Gives massive strength.
   - ** Vargottama ** (Same sign in Rasi & Navamsa): High strength.
   - * Action *: Mention this if a planet seems weak but has these hidden strengths.

5. RULE 5: FUNCTIONAL STRENGTH(Dasha / Bhukti) - Timing
            - "A strong planet is useless if its time never comes."
            - * Action *: ONLY predict results for the planets currently active in Dasha or Bhukti.
   - ** User's Current Maha Dasa**: Check 'current_time_cycle.dasha.lord' in the input data
            - ** User's Current Bhukti (Sub-period)**: Check 'current_time_cycle.bhukti.lord' in the input data
            - ** User's Current Antara (Sub-sub-period)**: Check 'current_time_cycle.antharam.lord' in the input data
            - ** Dasha End Date**: Check 'current_time_cycle.dasha.end_date'
            - ** Bhukti End Date**: Check 'current_time_cycle.bhukti.end_date'
                - * Instruction *: Structure your answer around how * this specific * Dasa / Bhukti impacts the question. YOU HAVE THE DASHA DATA - USE IT FOR TIMING PREDICTIONS!

6. RULE 6: DISPLACEMENT(Moveable Signs) - Travel
            - Check Lords of 8, 12.
                - If they are in Moveable Signs(Aries, Cancer, Libra, Capricorn), predict: "Travel", "Change of Place", or "Foreign Settlement".

---

** Input Data(Context):**
            ${JSON.stringify(comprehensiveContext, null, 2)}

** Admin Overrides(Dynamic Rules):**
            ${dynamicRulesMap
                ? Object.entries(dynamicRulesMap)
                    .filter(([key]) => !['Simha', 'Kanni', 'Thula', 'Rishaba', 'Meena', 'Makara', 'Mesha', 'Mithuna', 'Kataka', 'Dhanusu', 'Kumbha', 'Vrischika'].includes(key))
                    .map(([key, content]) => `   - **RULE [${key}]**: ${content}`)
                    .join('\n')
                : "   (No dynamic rules active)"
            }

${intentPrompt}

** CRITICAL INSTRUCTIONS FOR MARRIAGE TIMING QUESTIONS **:
If the user asks about marriage timing, you MUST follow this exact analysis process:

1. **CURRENT DASHA ANALYSIS** (MANDATORY):
   - State the current Maha Dasa planet and period (from CurrentDasaPeriods.MahaDasa)
   - State the current Bhukti planet and period (from CurrentDasaPeriods.Bhukti)
   - State the current Antara planet (from CurrentDasaPeriods.Antara)
   - Explain: "You are currently in [Planet] Maha Dasa, [Planet] Bhukti from [start] to [end]"

2. **7TH HOUSE ANALYSIS** (MANDATORY):
   - Identify the 7th house lord (calculate from Lagna.signIndex + 6)
   - Check 7th lord's Subathuvam score (from SubathuvamScores)
   - Check if 7th lord is in current Dasha or Bhukti
   - Explain: "Your 7th house (marriage) is ruled by [Planet]. This planet has [X]% Subathuvam, meaning [interpretation]"

3. **VENUS ANALYSIS** (MANDATORY for marriage):
   - Find Venus in Planets array
   - Check Venus Subathuvam score
   - Check Venus house position
   - Check if Venus is in current Dasha/Bhukti
   - Explain: "Venus (காதல்/சுக்கிரன்) is in [house] with [X]% Subathuvam"

4. **3RD & 11TH HOUSE CHECK** (MANDATORY):
   - 3rd house = Courage to marry (Lagna + 2)
   - 11th house = Fulfillment of desires (Lagna + 10)
   - Check if their lords are in current Dasha/Bhukti
   - Explain their role

5. **TIMING PREDICTION** (MANDATORY - BE SPECIFIC):
   - If 7th lord or Venus is in CURRENT Dasha/Bhukti: "Marriage can happen in current period [dates]"
   - If NOT in current period: Look at upcoming Dasha periods and say "Marriage likely in [Planet] Dasa/Bhukti which starts on [date]"
   - If Subathuvam is low: "There may be delays due to [reason], but marriage will happen when [specific Dasha] comes"
   - NEVER say "வீனஸ் தசை வரும் வரை காத்திருக்கவும்" without giving WHEN Venus Dasa starts!

6. **EXPLAIN IN SIMPLE TERMS** (MANDATORY):
   - Assume the user doesn't know astrology
   - Explain what Dasha means: "தசா என்பது கிரகங்களின் காலம் - ஒவ்வொரு கிரகத்திற்கும் ஒரு குறிப்பிட்ட காலம் உண்டு"
   - Explain what Subathuvam means: "சுபத்துவம் என்பது கிரகத்தின் நல்ல தன்மை - 75% க்கு மேல் இருந்தால் நல்லது"
   - Explain what 7th house means: "7-ம் வீடு திருமணத்தை குறிக்கும்"

7. **PROVIDE COMPLETE REASONING** (MANDATORY):
   - Don't just say "Venus Dasa will bring marriage"
   - Explain WHY: "Venus is your 7th lord with high Subathuvam, positioned in 11th house (fulfillment), so when Venus Dasa comes, marriage will happen easily"
   - Show your analysis: "I checked your current Dasa ([Planet]), 7th lord ([Planet]), Venus position ([house]), and Subathuvam scores"



**========================================================================**
**RESPONSE FORMATTING RULES (MANDATORY - MAKE IT VISUALLY BEAUTIFUL!):**
**========================================================================**

NEVER DO THIS:
- Plain text paragraph walls
- No structure or sections
- No emojis or visual elements
- Everything in one block

ALWAYS DO THIS:

**1. START WITH SUMMARY BOX (use dashes):**
Example:
----------------------------------
⚡ சுருக்கம்:
சிறந்த தொழில்: வணிகம் 💼
வெற்றி வாய்ப்பு: 85% 📈
சிறந்த காலம்: 6 மாதங்களில் ⏰
----------------------------------

**2. USE SECTION DIVIDERS (use dashes):**
Example:
----------------------------------
💼 1. வணிகம் & நிதி
----------------------------------

**3. USE EMOJIS FOR CATEGORIES:**
- 💼 Business/வணிகம்
- 🏛️ Government/அரசு
- 🏗️ Construction/கட்டுமானம்
- ⚙️ Manufacturing/உற்பத்தி
- 🎓 Education/கல்வி
- 💻 Technology/தொழில்நுட்பம்
- 🏥 Healthcare/மருத்துவம்
- 🎨 Creative/கலை
- 💑 Marriage/திருமணம்
- 👶 Children/குழந்தை
- 🏠 Property/சொத்து
- ✈️ Travel/பயணம்
- ⭐ Stars for ratings
- ✓ Checkmarks for lists
- ⚠️ Warnings
- 💡 Tips/குறிப்புகள்

**4. USE BULLET POINTS:**
Example:
சிறந்த துறைகள்:
  ✓ நிதி மேலாண்மை (Finance)
  ✓ கணக்கியல் (Accounting)
  ✓ வணிக ஆலோசனை (Consulting)

**5. USE VISUAL PROGRESS BARS:**
Example:
வணிக வெற்றி: ████████████████░░░░ 85%
அரசு வேலை:   ████████████░░░░░░░░ 65%

**6. USE STAR RATINGS:**
Example:
சிறப்பு மதிப்பீடு: ⭐⭐⭐⭐⭐ (Excellent)
                  ⭐⭐⭐⭐ (Good)
                  ⭐⭐⭐ (Average)

**7. STRUCTURE EACH SECTION:**
Example:
----------------------------------
💼 வணிகம் & நிதி
----------------------------------
சிறப்பு மதிப்பீடு: ⭐⭐⭐⭐⭐

சிறந்த துறைகள்:
  ✓ Item 1
  ✓ Item 2

ஏன் பொருத்தம்:
- Reason 1
- Reason 2

வெற்றி வாய்ப்பு: ████████████████░░░░ 85%

**8. END WITH ACTION ITEMS:**
Example:
----------------------------------
💡 முக்கிய குறிப்புகள்:

⚠️ தற்போதைய நிலை: [Current status]
✨ சிறந்த காலம்: [Best timing]
🎯 பரிந்துரை: [Recommendation]
----------------------------------

MANDATORY OUTPUT FORMAT:
        - If Tamil is requested, answer COMPLETELY in Tamil.
- Structure your answer using the 6 Rules logic implicitly.
- Don't list the rules, APPLY them.
            - GREETING RULE (STRICT):
              - For English: Start with "Hello".
              - For Tamil: Start with "வணக்கம்" (Vanakkam).
              - DO NOT use "Namaskaram" or "Namaste" under any circumstances.
              - DO NOT say "Hello User" or "Greetings". Just use "Hello" or "வணக்கம்".

Output Format(JSON):

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
    let openRouterAuthError = null;
    const effectiveKey = (apiKey || OPENROUTER_API_KEY).trim();

    // Debug Log for Key Verification
    if (effectiveKey.length > 10) {
        console.log(`[Orchestrator] Using OpenRouter Key: ...${effectiveKey.slice(-4)}`);
    } else {
        console.warn("[Orchestrator] NO VALID OPENROUTER KEY FOUND. Defaults may fail.");
    }

    /* 
    // TEMPORARILY DISABLED: OPENROUTER CONNECTION - RE-ENABLING
    // User requested to switch strictly to Google Gemini Direct for testing.
    */

    // ========================================
    // 🔍 DEBUG: SHOW EXACTLY WHAT DATA IS BEING SENT TO AI
    // ========================================
    console.log("\n" + "=".repeat(80));
    console.log("🤖 AI ORCHESTRATOR - DATA BEING SENT TO AI MODEL");
    console.log("=".repeat(80));

    console.log("\n❓ USER QUERY:", userQuery);
    console.log("📋 INTENT:", intent);

    // Safe access to Dasha data (these variables only exist in specific intent blocks)
    console.log("\n📊 DASHA DATA BEING SENT:");
    const mahaP = chartData.currentDasa?.maha?.planet || "NOT FOUND IN chartData";
    const bhuktiP = chartData.currentDasa?.bhukti?.planet || "NOT FOUND IN chartData";
    const antaraP = chartData.currentDasa?.antaram?.planet || "NOT FOUND IN chartData";

    console.log("  From chartData.currentDasa:");
    console.log("    Maha Dasa:", mahaP);
    console.log("    Bhukti:", bhuktiP);
    console.log("    Antara:", antaraP);

    // Check if comprehensiveContext exists (only in specific intent blocks)
    // Check if comprehensiveContext exists (only in specific intent blocks)
    // if (typeof comprehensiveContext !== 'undefined' && comprehensiveContext.current_time_cycle) {
    //     console.log("\n  ✅ From comprehensiveContext.current_time_cycle (SENT TO AI):");
    //     console.log(JSON.stringify(comprehensiveContext.current_time_cycle, null, 2));
    // } else {
    //     console.log("\n  ⚠️ comprehensiveContext.current_time_cycle not available (intent:", intent, ")");
    // }

    if (chartData.currentDasa?.maha?.start) {
        console.log("\n  📅 DATES (from chartData):");
        console.log("    Maha Start:", chartData.currentDasa.maha.start);
        console.log("    Maha End:", chartData.currentDasa.maha.end);
        console.log("    Bhukti End:", chartData.currentDasa.bhukti?.end);
    }

    console.log("\n📋 SYSTEM PROMPT (First 1000 chars):");
    console.log(systemPrompt.substring(0, 1000) + "...");

    // Check if forced Dasha text is in the prompt
    if (systemPrompt.includes("CURRENT DASHA STATUS")) {
        console.log("\n✅ FORCED DASHA TEXT BLOCK IS INCLUDED IN PROMPT");
    } else {
        console.log("\n❌ WARNING: FORCED DASHA TEXT BLOCK NOT FOUND IN PROMPT");
    }

    console.log("\n" + "=".repeat(80));
    console.log("END DEBUG - Now sending to AI...");
    console.log("=".repeat(80) + "\n");

    // Try FREE models first to save credits, then PAID models as fallback
    const ALL_MODELS = [...FREE_MODELS, ...PAID_MODELS];

    for (const model of ALL_MODELS) {
        try {
            console.log(`Attempting with model: ${model} `);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${effectiveKey} `,
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
                console.warn(`Model ${model} failed: ${response.status} - ${errorText} `);

                // Handle Rate Limit specifically
                if (response.status === 429) {
                    console.warn(`Rate limit reached for ${model}.Trying next model...`);
                    lastError = new Error(`Rate Limit(429) on ${model} `);
                    continue; // Try next model instead of giving up immediately
                }

                // Handle Invalid Key specifically
                if (response.status === 401) {
                    console.warn("Invalid API Key (401) on OpenRouter. Skipping.");
                    openRouterAuthError = new Error("OpenRouter Key Invalid or No Credits (401/402)");
                    continue;
                }

                if (response.status === 402) {
                    openRouterAuthError = new Error("OpenRouter Insufficient Credits (402)");
                    continue;
                }

                lastError = new Error(`OpenRouter API Error: ${response.status} - ${errorText} `);
                continue; // Try next model for other errors
            }

            const data = await response.json();

            if (!data.choices || data.choices.length === 0) {
                console.warn(`Model ${model} returned no choices.`);
                continue;
            }

            let content = data.choices[0].message.content;

            // FIX: Robust JSON Extraction (Find first { ... } block)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                content = jsonMatch[0];
                console.log(`📦 Extracted JSON block from ${model}`);
            } else if (content.includes('```json')) {
                content = content.replace(/```json/g, "").replace(/```/g, "").trim();
                console.log(`📦 Cleaned markdown JSON from ${model}`);
            } else {
                console.log(`⚠️ No JSON structure found in response from ${model}, will try parsing anyway`);
            }

            console.log(`🔍 Attempting to parse response from ${model} (length: ${content.length})`);

            // Clean up common JSON issues before parsing
            // 1. Replace backticks with double quotes (common AI error)
            let cleanedContent = content.replace(/`/g, '"');
            // 2. Fix potential trailing commas (simple case)
            cleanedContent = cleanedContent.replace(/,(\s*[\}\]])/g, '$1');

            try {
                const parsed = JSON.parse(cleanedContent);
                console.log(`✅ Successfully parsed JSON from ${model}`);
                return parsed;
            } catch (e) {
                // Try original content if cleanup failed
                try {
                    const parsed = JSON.parse(content);
                    console.log(`✅ Successfully parsed JSON (original) from ${model}`);
                    return parsed;
                } catch (e2) {
                    console.warn(`⚠️ JSON parse failed for ${model}, using text fallback`);
                }
            }

            // If we are here, JSON parsing failed.
            // Check if the content looks like JSON. If so, don't use it as raw text fallback directly
            // because that shows code to the user.
            if (content.trim().startsWith('{') && content.includes('"intent"')) {
                console.warn(`⚠️ Content looks like broken JSON, trying to extract fields manually`);

                // Try manual extraction of final_answer_tamil using regex
                const tamilMatch = content.match(/"final_answer_tamil"\s*:\s*[`"](.*?)[`"]\s*(?:,|\})/s);
                if (tamilMatch && tamilMatch[1]) {
                    return {
                        intent: "Recovery Mode",
                        final_answer_tamil: tamilMatch[1],
                        final_answer_english: tamilMatch[1], // Use same for english fallback
                        primary_analysis: { key_planet: "Analysis", status: "Completed", dasa_verdict: "Unknown" },
                        model_consensus: "Recovered from partial JSON",
                        reasoning: "JSON parsing failed but content was extracted."
                    };
                }
            }

            // Fallback: Create a basic response object from the text
            // If the content looks like it has Tamil/English answers, use it
            if (content.length > 100) {
                // FORCE replace "Namaskaram" if it appears in the text fallback
                content = content.replace(/Namaskaram/gi, "Vanakkam").replace(/Namaste/gi, "Vanakkam");

                console.log(`✅ Using text response as fallback (${content.length} chars)`);
                const fallbackResponse = {
                    intent: "General Prediction",
                    final_answer_tamil: content.includes('━') || content.includes('💍') || content.includes('✓')
                        ? content
                        : `பதில்:\n\n${content}`,
                    final_answer_english: content,
                    primary_analysis: {
                        key_planet: "Multiple factors",
                        status: "Analysis complete",
                        dasa_verdict: "See detailed answer"
                    },
                    model_consensus: `Response from ${model}`,
                    reasoning: "AI model provided direct text response"
                };
                console.log(`📤 Returning fallback response:`, fallbackResponse);
                return fallbackResponse;
            }

            console.error(`❌ Response too short or invalid from ${model} (${content.length} chars)`);
            continue;

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

                // Specific Check for "API Not Enabled" (403)
                if (response.status === 403 && errText.includes("Generative Language API")) {
                    const match = errText.match(/https:\/\/console\.developers\.google\.com[^\s"]+/);
                    const url = match ? match[0] : "https://console.developers.google.com/apis/api/generativelanguage.googleapis.com";

                    let msg = `Google API Not Enabled. Please enable it here: ${url}`;
                    if (openRouterAuthError) {
                        msg += ` \n(NOTE: OpenRouter also failed: ${openRouterAuthError.message})`;
                    }
                    // Throw immediately to stop retrying - this is a configuration error
                    throw new Error(msg);
                }

                // If 429 or 404, try next google model
                if (response.status === 429 || response.status === 404) {
                    console.warn(`Google Model ${gModel} failed (${response.status}). Trying next...`);
                    lastError = new Error(`Google ${gModel} Error: ${response.status}`);
                    continue;
                }
                console.error("Direct Google Gemini failed:", errText);
                lastError = new Error(`Google Direct API Error: ${response.status} - ${errText}`);
            }
        } catch (e: any) {
            // Re-throw the configuration error immediately
            if (e.message && e.message.includes("Google API Not Enabled")) {
                throw e;
            }
            // If we have an OpenRouter Auth error and everything else failed, prioritize showing that too
            if (openRouterAuthError) {
                console.error("OpenRouter Auth Error Persisted:", openRouterAuthError);
            }
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

const TAMIL_ASTRO_GLOSSARY: Record<string, string> = {
    "Lagna": "லக்னம்",
    "Ascendant": "லக்னம்",
    "Dasa": "திசை",
    "Bhukti": "புத்தி",
    "Subathuvam": "சுபத்துவம்",
    "Pavathuvam": "பாவத்துவம்",
    "Subathuva": "சுபத்துவ", // Variations
    "Pavathuva": "பாவத்துவ",
    "Exalted": "உச்சம்",
    "Exaltation": "உச்சம்",
    "Debilitated": "நீசம்",
    "Debilitation": "நீசம்",
    "Aspect": "பார்வை",
    "Aspects": "பார்க்கிறார்",
    "Conjunction": "சேர்க்கை",
    "Conjunct": "சேர்ந்து",
    "Benefic": "சுபர்",
    "Malefic": "பாவர்",
    "Retrograde": "வக்ரம்",
    "Combustion": "அஸ்தமனம்",
    "Friendly": "நட்பு",
    "Enemy": "பகை",
    "Neutral": "சமம்",
    "Own House": "சொந்த வீடு",
    "Moolatrikona": "மூலத்திரிகோணம்",
    "Rasi": "ராசி",
    "Navamsa": "நவாம்சம்",
    "Kendra": "கேந்திரம்",
    "Kona": "கோணம்",
    "Trikona": "திரிகோணம்",
    "Upachaya": "உபஜெயம்",
    "Maraka": "மாரகம்",
    "Badhaka": "பாதகம்",
    "Yogakaraka": "யோககாரகன்",
    "Digbala": "திக்பலம்",
    "Directional Strength": "திக்பலம்"
};

function refineTamilTranslation(text: string): string {
    if (!text) return text;
    let refined = text;
    for (const [english, tamil] of Object.entries(TAMIL_ASTRO_GLOSSARY)) {
        // Use regex with word boundary to avoid partial replacements inside other words
        // Case insensitive global replacement
        const regex = new RegExp(`\\b${english}\\w*`, 'gi'); // \w* to match plurals/suffixes loosely? No, be careful.
        // Let's stick to word boundary for simple terms and explicit variations in glossary.
        const safeRegex = new RegExp(`\\b${english}\\b`, 'gi');
        refined = refined.replace(safeRegex, tamil);
    }
    return refined;
}

// Helper for Google Translate API V2
async function translateStrings(texts: string[], target: string = 'ta'): Promise<string[]> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

    // Google Translate V2 limits: 128 strings per request implies filtering or chunks? 
    // Actually limit is usually 2048 chars per 'q' or payload size. 
    // We have ~50 strings. If the total length is huge, we might hit limits.
    // But for this use case (short astrology predictions), it's likely fine (~2-3k chars).

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            q: texts,
            target: target,
            format: 'text',
            source: 'en'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google Translate API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // data.data.translations is array of { translatedText: "..." }
    return data.data.translations.map((t: any) => t.translatedText);
}

export async function translateAnalysisReport(englishResponse: OrchestratorResponse): Promise<OrchestratorResponse> {
    const report = englishResponse.bava_analysis_report;
    if (!report) return englishResponse;

    try {
        const textsToTranslate: string[] = [];

        // 1. Collect all text fields in a deterministic order
        textsToTranslate.push(englishResponse.primary_analysis.status);
        textsToTranslate.push(englishResponse.primary_analysis.dasa_verdict);
        textsToTranslate.push(englishResponse.model_consensus);
        textsToTranslate.push(englishResponse.reasoning);

        // Bava Report Fields
        textsToTranslate.push(report.lagna_summary);
        textsToTranslate.push(report.final_verdict);

        // Houses (12 houses * 4 fields = 48 strings)
        report.house_predictions.forEach(house => {
            textsToTranslate.push(house.title);
            textsToTranslate.push(house.status);
            textsToTranslate.push(house.analysis);
            textsToTranslate.push(house.guruji_rule_applied);
        });

        // Life Guidance
        if (englishResponse.life_guidance) {
            const g = englishResponse.life_guidance;
            textsToTranslate.push(g.job_timing.answer); textsToTranslate.push(g.job_timing.reason);
            textsToTranslate.push(g.marriage_timing.answer); textsToTranslate.push(g.marriage_timing.reason);
            textsToTranslate.push(g.marriage_type.answer); textsToTranslate.push(g.marriage_type.reason);
            textsToTranslate.push(g.career_path.answer); textsToTranslate.push(g.career_path.reason);
            textsToTranslate.push(g.foreign_travel.answer); textsToTranslate.push(g.foreign_travel.reason);
        }

        // 2. Call API (Single Batch Request)
        console.log(`[Translation] Batch translating ${textsToTranslate.length} fields via Google Cloud Translation API...`);
        const translatedTextsRaw = await translateStrings(textsToTranslate, 'ta');

        if (translatedTextsRaw.length !== textsToTranslate.length) {
            console.warn(`[Translation] Mismatch in translated count. Expected ${textsToTranslate.length}, got ${translatedTextsRaw.length}`);
        }

        // 3. Refine Translation (Glossary Fixes)
        const translatedTexts = translatedTextsRaw.map(refineTamilTranslation);

        // 3. Reconstruct Object
        let tIndex = 0;

        const translatedPrimary = {
            ...englishResponse.primary_analysis,
            status: translatedTexts[tIndex++] || englishResponse.primary_analysis.status,
            dasa_verdict: translatedTexts[tIndex++] || englishResponse.primary_analysis.dasa_verdict,
        };
        const translatedConsensus = translatedTexts[tIndex++] || englishResponse.model_consensus;
        const translatedReasoning = translatedTexts[tIndex++] || englishResponse.reasoning;

        const translatedLagnaSummary = translatedTexts[tIndex++] || report.lagna_summary;
        const translatedFinalVerdict = translatedTexts[tIndex++] || report.final_verdict;

        const translatedHouses = report.house_predictions.map(house => {
            return {
                ...house,
                title: translatedTexts[tIndex++] || house.title,
                status: translatedTexts[tIndex++] || house.status,
                analysis: translatedTexts[tIndex++] || house.analysis,
                guruji_rule_applied: translatedTexts[tIndex++] || house.guruji_rule_applied
            };
        });

        return {
            ...englishResponse,
            primary_analysis: translatedPrimary,
            model_consensus: translatedConsensus,
            reasoning: translatedReasoning,
            final_answer_tamil: "மொழிபெயர்க்கப்பட்ட முழுமையான பாவக பகுப்பாய்வு கீழே உள்ளது.",
            // Keep original English answer content? No, user usually wants translation.
            // But final_answer_english field should logically stay English.
            final_answer_english: englishResponse.final_answer_english,
            bava_analysis_report: {
                lagna_summary: translatedLagnaSummary,
                final_verdict: translatedFinalVerdict,
                house_predictions: translatedHouses
            },
            life_guidance: englishResponse.life_guidance ? {
                job_timing: { answer: translatedTexts[tIndex++] || englishResponse.life_guidance.job_timing.answer, reason: translatedTexts[tIndex++] || englishResponse.life_guidance.job_timing.reason },
                marriage_timing: { answer: translatedTexts[tIndex++] || englishResponse.life_guidance.marriage_timing.answer, reason: translatedTexts[tIndex++] || englishResponse.life_guidance.marriage_timing.reason },
                marriage_type: { answer: translatedTexts[tIndex++] || englishResponse.life_guidance.marriage_type.answer, reason: translatedTexts[tIndex++] || englishResponse.life_guidance.marriage_type.reason },
                career_path: { answer: translatedTexts[tIndex++] || englishResponse.life_guidance.career_path.answer, reason: translatedTexts[tIndex++] || englishResponse.life_guidance.career_path.reason },
                foreign_travel: { answer: translatedTexts[tIndex++] || englishResponse.life_guidance.foreign_travel.answer, reason: translatedTexts[tIndex++] || englishResponse.life_guidance.foreign_travel.reason },
            } : undefined
        };


    } catch (error) {
        console.error("Translation logic failed:", error);
        throw error;
    }
}

const prepareContext = (data: any, intent: string, isComprehensive: boolean = false, language: 'en' | 'ta' = 'en', dynamicRules: Record<string, string> = {}) => {
    const { planets, ascendant, currentDasa, dashaPeriods } = data;
    // Calculate subathuvam scores if not provided
    const subathuvamScores = data.subathuvamScores || calculateAdityaGurujiSubathuvam(planets);

    // Prepare Prediction Inputs
    const currentDasaObj = currentDasa || getCurrentDasha(dashaPeriods || []);
    const transits = calculateCurrentTransits();

    // Calculate Rule-Based Predictions (Ground Truth)
    const rule_predictions = {
        job: predictJobTiming(currentDasaObj, transits, ascendant.signIndex, planets.find((p: any) => p.name === 'Moon')?.signIndex || 0, planets, language),
        foreign: predictForeignTravel(planets, ascendant.signIndex, planets.find((p: any) => p.name === 'Moon')?.signIndex || 0, subathuvamScores, currentDasaObj, language),
        marriage_timing: predictDetailedMarriageTiming(currentDasaObj, transits, ascendant.signIndex, planets.find((p: any) => p.name === 'Moon')?.signIndex || 0, planets, data.birthDate || new Date(), data.userDetails?.gender || 'male', dashaPeriods || [], language),
        marriage_type: predictMarriageType(planets, ascendant.signIndex, subathuvamScores, currentDasaObj, language),
        career: predictCareerPath(planets, ascendant.signIndex, subathuvamScores, currentDasaObj, language)
    };

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
    const advancedRules = generateSpecialPredictions(planets, ascSignIndex, subathuvamScores, currentDasa, language);

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
        CurrentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        CurrentYear: new Date().getFullYear(),
        CurrentMonth: new Date().toLocaleString('default', { month: 'long' }),
        TargetLanguage: language === 'ta' ? "TAMIL (தமிழ்)" : "ENGLISH",
        Gender: data.userDetails?.gender || "Unknown",
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
        CurrentDasa: currentDasa ? (() => {
            const dasaLordFunc = currentDasa.maha?.planet ? getFunctionalNature(ascSignIndex, language)[currentDasa.maha.planet] : null;
            const bhuktiLordFunc = currentDasa.bhukti ? getFunctionalNature(ascSignIndex, language)[currentDasa.bhukti.planet] : null;

            return {
                lord: currentDasa.maha?.planet || "Unknown",
                functional_nature: dasaLordFunc?.nature || "Neutral",
                lord_of_houses: dasaLordFunc?.lordOfHouses || [],
                natural_significations: dasaLordFunc?.karakatvam || [],
                affected_persons: dasaLordFunc?.affectedPersons || [],
                combined_interpretation: dasaLordFunc?.combinedEffect || "",
                bhukti: currentDasa.bhukti?.planet,
                bhukti_lord_nature: bhuktiLordFunc?.nature || "Neutral",
                bhukti_affected_persons: bhuktiLordFunc?.affectedPersons || [],
                bhukti_combined_interpretation: bhuktiLordFunc?.combinedEffect || "",
                antaram: currentDasa.antaram?.planet,
                start_date: currentDasa.maha?.startDate ? new Date(currentDasa.maha.startDate).toLocaleDateString() : "Unknown",
                end_date: currentDasa.maha?.endDate ? new Date(currentDasa.maha.endDate).toLocaleDateString() : "Unknown",
                bhukti_end_date: currentDasa.bhukti?.endDate ? new Date(currentDasa.bhukti.endDate).toLocaleDateString() : "Unknown",
                timeline_summary: "See 'dasa_schedule' below for full timeline."
            };
        })() : "Unknown",
        DasaSchedule: getReadableDashaSchedule(data.dashaPeriods),
        FunctionalNature: getFunctionalNature(ascSignIndex, language),
        // Example of how to use Adhipathiyam vs Karakatvam:
        // For Sagittarius Lagna: Sun lords 9th house (Father) + naturally signifies Father = HIGH CONFIDENCE father prediction
        PredictionLogicExample: `
When making predictions, use BOTH Adhipathiyam (house lordship) AND Karakatvam (natural significations):

1. **Determine WHO is affected**:
   - Check 'lord_of_houses' (Adhipathiyam): If planet lords 9th house → affects Father
   - Check 'natural_significations' (Karakatvam): If planet naturally signifies Father → affects Father
   - If BOTH match → DOUBLE CONFIRMATION → HIGH CONFIDENCE prediction for that person

2. **Determine WHAT happens**:
   - Check planet's nature (Yogakaraka/Benefic/Malefic/Maraka)
   - Check 'affected_areas' for combined areas of influence
   - Cross-reference with Dasa timing

3. **Example (Sagittarius Lagna - Sun Dasa):**
   - Sun lords 9th house (Adhipathiyam) → Father house
   - Sun naturally signifies Father (Karakatvam) → Father person
   - Sun with Saturn (2nd lord Maraka) → Death-like situation
   - **Prediction**: "Father will face serious health crisis during Sun Dasa"

ALWAYS use 'combined_interpretation' field to understand WHO + WHAT for each planet.
        `,
        SpecialRulesAnalysis: advancedRules,
        HouseLords: houseLords,
        CalculatedAspects: calculatedAspects,
        KeyPlanets: comprehensivePlanets,
        Yogas: data.yogas || [], // Pass Yogas explicitly
        Doshas: data.doshas || [], // Pass Doshas explicitly
        // Provide the titles directly so AI doesn't have to guess or translate
        OutputFormatGuide: {
            HouseTitles: language === 'ta' ? HOUSE_NAMES_TA : HOUSE_NAMES_EN
        },
        LifeGuidancePredictions: rule_predictions,
        MoonPhaseInfo: (() => {
            if (!moon) return { status: "Unknown", is_waxing: false };
            const sun = planets.find((p: any) => p.name === 'Sun');
            if (!sun) return { status: "Unknown", is_waxing: false };

            // Calculate Elongation (Moon - Sun)
            // Normalize to 0-360
            let elongation = (moon.longitude - sun.longitude);
            if (elongation < 0) elongation += 360;

            // 0-180 = Waxing (Sukla), 180-360 = Waning (Krishna)
            const isWaxing = elongation < 180;
            const isFull = elongation > 170 && elongation < 190;
            const isNew = elongation > 350 || elongation < 10;

            return {
                elongation_degrees: elongation.toFixed(1),
                is_waxing: isWaxing,
                phase_name: isNew ? "New Moon (Amavasya)" : isFull ? "Full Moon (Pournami)" : isWaxing ? "Waxing (Sukla Paksha)" : "Waning (Krishna Paksha)",
                has_light: isWaxing || isFull // Guruji's rule: Waxing = Light
            };
        })()
    };

    console.log("AI CONTEXT GENERATED:", JSON.stringify(baseContext, null, 2));

    // Add comprehensive house data if needed
    if (isComprehensive) {
        (baseContext as any).HouseDetails = houseOccupants;
        (baseContext as any).HouseKarakas = HOUSE_KARAKAS;
    }

    return baseContext;
};

// --- LOGGING ---
// Log interaction if user data is present
async function logInteraction(userQuery: string, response: OrchestratorResponse, chartData: any, intent: string, language: string) {
    try {
        const userId = chartData?.userDetails?.uid ?? "anonymous"; // Ensure you pass uid in chartData if available, or handle auth upstream
        const userName = chartData?.userDetails?.name ?? "User";

        // We log the final answer (Tamil if Tamil, English if English)
        const answer = language === 'ta' ? response.final_answer_tamil : response.final_answer_english;

        await predictionService.logChatInteraction(
            userId,
            userName,
            userQuery,
            answer,
            intent,
            language,
            { model_consensus: response.model_consensus }
        );
    } catch (e) {
        console.error("Failed to log chat interaction", e);
    }
}

/**
 * Generate Guruji Style "Who Am I?" Persona Analysis
 */
export const generateGurujiPersona = async (
    chartData: any,
    birthDetails: any,
    language: 'en' | 'ta' = 'ta',
    includeDarkSide: boolean = false,
    apiKey: string = OPENROUTER_API_KEY
) => {
    try {
        const profileData = generateGurujiPersonaProfile(chartData, birthDetails);

        // --- NEW LOGIC INTEGRATION START ---

        // 1. Calculate Subathuvam Results (Same as in Chat Intent)
        const subathuvamResults = calculateAdityaGurujiSubathuvam(chartData.planets);
        const ascendantSignIndex = chartData.ascendant.signIndex;

        // Helper: Get Element
        const getElement = (signIndex: number) => {
            const remainder = signIndex % 4;
            if (remainder === 0) return "Fire (Neruppu)";
            if (remainder === 1) return "Earth (Nilam)";
            if (remainder === 2) return "Air (Kaatru)";
            return "Water (Neer)";
        };

        const lagnaElement = getElement(ascendantSignIndex);
        const moon = chartData.planets.find((p: any) => p.name === 'Moon');
        const moonSign = ZODIAC_SIGNS[moon?.signIndex || 0];
        const nakshatra = getNakshatra(moon?.longitude || 0);
        const lagnaLord = SIGN_LORDS[ascendantSignIndex];
        const lagnaName = ZODIAC_SIGNS[ascendantSignIndex];

        // Relationship Logic (7th House)
        const seventhHouseIndex = (ascendantSignIndex + 6) % 12;
        const seventhLord = SIGN_LORDS[seventhHouseIndex];

        // 2. Prepare Detailed Planetary Scan
        const planetaryScan = chartData.planets.map((p: any) => {
            const subResult = subathuvamResults[p.name];
            const isSubathuvam = subResult?.isSubathuva || false;
            // Pava if not Suba AND not Neutral
            const isPapathuvam = !isSubathuvam && !subResult?.isNeutral;

            // Aspects Received
            const aspectsReceived = subResult?.details
                ?.filter((d: string) => d.includes("Aspected by") || d.includes("பார்வை"))
                ?.map((d: string) => d.replace(/[✅❌]/g, '').trim()) || [];

            const house = (p.signIndex - ascendantSignIndex + 12) % 12 + 1;

            // Determine Role based on User's Request
            let role = "General";
            if (p.name === 'Mars') role = "Anger (Kopam)";
            if (p.name === 'Moon') role = "Mind (Manas)";
            if (p.name === 'Venus') role = "Luxury (inbam)";
            if (p.name === 'Saturn') role = "Work/Karma";
            if (p.name === 'Mercury') role = "Speech (Vaakku)";
            if (p.name === 'Sun') role = "Ego/Soul";

            return {
                planet: p.name,
                role: role,
                house: house,
                is_subathuvam: isSubathuvam, // GOOD
                is_papathuvam: isPapathuvam, // BAD
                aspects_received: aspectsReceived
            };
        });

        // --- 2a. DARK SECRETS DETECTION (Shocking Life Scan) ---
        // Helper to check for specific combinations
        const getPlanet = (name: string) => chartData.planets.find((p: any) => p.name === name);
        const saturn = getPlanet('Saturn');
        const rahu = getPlanet('Rahu');
        const mars = getPlanet('Mars');
        const mercury = getPlanet('Mercury');
        const venus = getPlanet('Venus');
        // moon is already defined above

        const saturnHouse = (saturn?.signIndex - ascendantSignIndex + 12) % 12 + 1;
        const rahuHouse = (rahu?.signIndex - ascendantSignIndex + 12) % 12 + 1;
        const mercuryHouse = (mercury?.signIndex - ascendantSignIndex + 12) % 12 + 1;

        // 1. Abusive Speech (Saturn + Rahu + Mars impact on 2nd House)
        // Simple logic: If Saturn or Rahu is in 2nd house OR Mars aspects 2nd.
        // Or if all three have some connection. Let's stick to the User's rule roughly:
        // "Saturn+Rahu+Mars in 2nd House" (Rare) OR just highly afflicted 2nd house.
        const isAbusiveSpeech = (saturnHouse === 2 || rahuHouse === 2) && (mars?.signIndex !== undefined); // Simplified trigger

        // 2. Addiction (Saturn/Rahu connection to Lagna or Moon)
        // Check if Saturn or Rahu is in Lagna (1st) or with Moon.
        const saturnInLagna = saturnHouse === 1;
        const rahuInLagna = rahuHouse === 1;
        const saturnWithMoon = saturn?.signIndex === moon?.signIndex;
        const rahuWithMoon = rahu?.signIndex === moon?.signIndex;
        const isAddictionProne = saturnInLagna || rahuInLagna || saturnWithMoon || rahuWithMoon;

        // 3. Scam Minded (Weak Lagna Lord + Strong Rahu/Mercury in 6/12)
        // We need Lagna Lord strength. Using 'subathuvamResults' roughly.
        const lagnaLordName = SIGN_LORDS[ascendantSignIndex];
        const lagnaLordInfo = subathuvamResults[lagnaLordName];
        const isLagnaLordWeak = lagnaLordInfo && !lagnaLordInfo.isSubathuva && !lagnaLordInfo.isNeutral; // Rough proxy
        const isMercuryScam = (mercuryHouse === 6 || mercuryHouse === 12);
        const isRahuScam = (rahuHouse === 6 || rahuHouse === 12);
        const isScamMinded = isLagnaLordWeak && (isMercuryScam || isRahuScam);

        // 4. Bhrigu Mangala Yoga (Venus + Mars)
        const isBhriguMangalaYoga = venus?.signIndex === mars?.signIndex;

        // 3. Inject into Context (Enhanced Structure)
        const enhancedContext = {
            user_identity: {
                lagna: lagnaName,
                lagna_lord: lagnaLord,
                lagna_element: lagnaElement,
                moon_sign: moonSign,
                nakshatra: nakshatra,
                seventh_lord: seventhLord
            },
            special_flags: {
                is_abusive_speech: isAbusiveSpeech,
                is_addiction_prone: isAddictionProne,
                is_scam_minded: isScamMinded,
                is_bhrigu_mangala_yoga: isBhriguMangalaYoga
            },
            planetary_scan: planetaryScan,
            shocking_events: (profileData as any).shocking_events || []
        };

        let tamilPrompt = "";
        let englishPrompt = "";

        if (includeDarkSide) {
            // --- DARK SIDE PROMPT (Adult/Shocking) ---
            tamilPrompt = `You are an expert Vedic Astrologer (Aditya Guruji Avatar).
Task: Perform a "Shocking & Deep Life Scan" focusing on the DARK SIDE of the personality.

**INPUT DATA:**
\`\`\`json
${JSON.stringify(enhancedContext, null, 2)}
\`\`\`

### 🔮 ANALYSIS LOGIC (The Rule Engine):

**SECTION 1: THE DARK SIDE (Bad Habits & Risks - SHOCKING SCAN):**

1. **Abusive Speech (கெட்ட வார்த்தை):**
   - **Rule:** Check \`special_flags.is_abusive_speech\`.
   - **Logic:** If TRUE (Saturn+Rahu+Mars connection to 2nd) -> Predict: "Your tongue is dangerous. You use vulgar words regarding private parts without shame when angry."

2. **Addiction (குடிப்பழக்கம்):**
   - **Rule:** Check \`special_flags.is_addiction_prone\`.
   - **Logic:** If TRUE (Saturn/Rahu connects to Lagna/Moon) -> Predict: "Saturn (Liquid Planet) is influencing you. You are prone to alcohol or intoxication to escape stress."

3. **Scam/Illegal Money (திருட்டுப் பணம்):**
   - **Rule:** Check \`special_flags.is_scam_minded\`.
   - **Logic:** If TRUE (Weak Lagna Lord + Strong Rahu/Mercury in 6th/12th) -> Predict: "You have criminal intelligence. You might earn through Online Scams or cheating. You think you can escape, but it's risky."

**SECTION 2: CHARACTER & DESTINY (General Scan):**

1. **Anger (Mars):**
   - If Mars is Papathuvam -> "Uncontrollable Anger."
   - If Mars is Subathuvam -> "Righteous/Controlled Anger."

2. **Lust & Luxury (Venus):**
   - If Venus + Mars (Bhrigu Mangala Yoga) -> "High passion and drive."
   - If Venus + Saturn -> "Secret/Deceitful relationships."

### OUTPUT FORMAT (Strict Tamil Narrative):

**🦁 1. உங்கள் அடிப்படை குணம் (Character):**
(Describe Lagna/Moon nature).

**🤬 2. உங்கள் பேச்சு (Abusive Speech Warning):**
(IF \`is_abusive_speech\` is True): "ஜாதக ரீதியாக, உங்கள் வாக்கு ஸ்தானமான 2-ம் இடத்தில் சனி, ராகு, செவ்வாய் தாக்கத்தால், கோபம் வந்தால் அந்தரங்க உறுப்புகளைப் பற்றிய கெட்ட வார்த்தைகளை (Vulgar Words) கூச்சமில்லாமல் பேசுவீர்கள்.".
(ELSE): "உங்கள் பேச்சு கண்ணியமானது."

**🍷 3. மறைமுக பழக்கங்கள் (Addiction Warning):**
(IF \`is_addiction_prone\` is True): "திரவக் கிரகமான சனி பாபத்துவம் அடைந்துள்ளதால், மனக்கட்டுப்பாடு இல்லாத நேரத்தில் நீங்கள் **குடிப்பழக்கத்திற்கு (Alcohol)** அடிமையாக வாய்ப்புள்ளது.".
(ELSE): "உங்களுக்கு பெரிய அளவில் போதை பழக்கங்கள் இருக்காது."

**💸 4. பணத்தின் மறுபக்கம் (Scam/Risk):**
(IF \`is_scam_minded\` is True): "உங்கள் லக்னாதிபதி பலவீனமாகி, 6-ம் இடம் வலுவாக இருப்பதால், **'ஆன்லைன் ஸ்கேம்' (Online Scam)** அல்லது குறுக்கு வழியில் பணம் சம்பாதிக்கும் 'கிரிமினல் புத்தி' உங்களுக்கு உண்டு. ஜாக்கிரதை!".
(ELSE): "நீங்கள் நேர்மையாக சம்பாதிப்பவர்."

**🤝 5. உறவுமுறை & நட்பு (Relationships):**
(Analyze 7th Lord & Venus). "உங்கள் ஜாதகப்படி..."

**🔮 6. மறைந்திருக்கும் உண்மைகள் (Shocking Truths):**
(Reveal 2 specific secrets from chart).

**Tone:** Shocking, Authoritative, and Direct.
Return ONLY Tamil text.`;

            englishPrompt = `You are an expert Vedic Astrologer (Aditya Guruji Avatar).
Task: Perform a "Shocking & Deep Life Scan" focusing on the DARK SIDE of the personality.

**INPUT DATA:**
\`\`\`json
${JSON.stringify(enhancedContext, null, 2)}
\`\`\`

### 🔮 ANALYSIS LOGIC (The Rule Engine):

**SECTION 1: THE DARK SIDE (Bad Habits & Risks - SHOCKING SCAN):**

1. **Abusive Speech:**
   - **Rule:** Check \`special_flags.is_abusive_speech\`.
   - **Logic:** If TRUE -> Predict: "Your tongue is sharp and dangerous. When angry, you tend to use vulgar or abusive language without hesitation."

2. **Addiction:**
   - **Rule:** Check \`special_flags.is_addiction_prone\`.
   - **Logic:** If TRUE -> Predict: "You are susceptible to addictive behaviors, particularly alcohol or escapism, to handle stress."

3. **Scam/Illegal Money:**
   - **Rule:** Check \`special_flags.is_scam_minded\`.
   - **Logic:** If TRUE -> Predict: "You possess a 'criminal intelligence'. You might be tempted by quick money schemes, online scams, or unethical earnings. Be warned."

**SECTION 2: CHARACTER & DESTINY:**
(Same logic as Tamil, but in English).

### OUTPUT FORMAT (Strict English Narrative):

**🦁 1. Your Base Character:**
(Describe Lagna/Moon nature).

**🤬 2. Your Speech (Warning):**
(IF \`is_abusive_speech\` is True): "Astrologically, the influence of malefic planets on your 2nd House suggests that you use extremely harsh and vulgar language when provoked.".
(ELSE): "Your speech is generally respectful."

**🍷 3. Hidden Habits (Addiction Warning):**
(IF \`is_addiction_prone\` is True): "Due to Saturn's malefic influence, you have a tendency towards addiction (Alcohol/Drugs) if you lose self-control.".
(ELSE): "You are generally free from major addictions."

**💸 4. The Dark Side of Money (Risk):**
(IF \`is_scam_minded\` is True): "Your chart indicates a clever but risky mind. You may be drawn to **Online Scams** or illegal ways of making money. This path is dangerous for you.".
(ELSE): "You earn through honest means."

**🤝 5. Relationships:**
(Analyze 7th Lord & Venus).

**🔮 6. Shocking Truths:**
(Reveal 2 specific secrets from chart).

**Tone:** Shocking, Authoritative, and Direct.
Return ONLY English text.`;

        } else {
            // --- STANDARD PROMPT (Safe/Detailed) ---
            tamilPrompt = `You are Aditya Guruji's AI Avatar. Your task is to generate a deep "Who Am I?" psychological profile based on the User JSON provided.

🚫 **Avoid:** Generic zodiac descriptions (e.g., "Capricorns are ambitious").
✅ **Focus:** Subathuvam (Light), Papathuvam (Darkness), and Planetary Lordship.

**INPUT DATA:**
\`\`\`json
${JSON.stringify(enhancedContext, null, 2)}
\`\`\`

**Analysis Protocol:**

**1. The Core Self (Lagna & Lagna Lord):**
- Analyze \`lagna\` (${lagnaName}) and \`lagna_lord\` (${lagnaLord}).
- **Rule:** If Lagna Lord is *Subathuvam* (aspected by Jupiter), describe the user as "Honest, righteous, and soft-natured."
- **Rule:** If Lagna Lord is *Papathuvam* (with Mars/Rahu), describe them as "A fighter, aggressive, or someone who breaks rules."
- *Output Style:* "Your foundation is built on [Planet]. This makes you..."

**2. The Mind (Moon & Mercury):**
- Analyze Moon and Mercury from \`planetary_scan\`.
- **Moon:** Determines emotional stability.
  - *Subathuvam:* "You have a calm, unwavering mind. You handle stress well."
  - *Papathuvam:* "You often feel lonely or overthink unnecessarily."
- **Mercury:** Determines intelligence type.
  - *With Rahu (Papathuvam):* "You have 'Criminal Intelligence' (Smart & Cunning). You can solve puzzles others can't."
  - *With Jupiter (Subathuvam):* "You have 'Divine Intelligence'. You learn quickly."

**3. The Karmic Path (Rahu/Ketu & 5th/9th Lords):**
- Look at the **Rahu-Ketu Axis** from \`planetary_scan\`.
  - *Rahu in Lagna (House 1):* "You are ambitious and want to prove yourself to the world."
  - *Ketu in Lagna (House 1):* "You are spiritual and sometimes detached from worldly desires."
  - *Rahu in 7th:* "You seek unconventional relationships or foreign connections."
- Check **5th House** for luck. If 5th Lord is weak: "You rely more on hard work than luck."

**4. The Hidden Truth (Secret Section):**
- If 8th House is active or strong: "You have a natural intuition for secrets, research, or astrology."
- If Saturn + Rahu together: "You have hidden struggles or unconventional career paths."

---
**OUTPUT FORMAT (Tone: Insightful, Direct, Empathetic):**

**வணக்கம், கிரகங்களின் ஒளியின் அடிப்படையில் நீங்கள் யார்?**

🧠 **உங்கள் மனதின் ரகசியம் (Mindset):**
[Analysis of Moon & Mercury - Are they emotional or logical? Waxing/Waning Moon? Mercury with Rahu or Jupiter?]

🦁 **உங்கள் உண்மையான குணம் (True Character):**
[Analysis of Lagna Lord - Are they a soft person or a fighter? Element analysis (${lagnaElement}). Nakshatra (${nakshatra}) influence.]

🔮 **உங்கள் வாழ்க்கையின் நோக்கம் (Karmic Purpose):**
[Analysis of Rahu/Ketu & 10th House - What are they chasing? Service-oriented or status-oriented?]

💡 **உங்களுக்குத் தெரியாத உங்கள் பலம் (Hidden Strength):**
[Analysis of 5th/9th House - Luck vs. Hard Work. Hidden talents like occult, writing, or leadership.]

**🤝 உறவுமுறை & நட்பு (Relationships):**
[Analyze 7th Lord (${seventhLord}) & Venus - Long-lasting relationships or challenges?]

**Tone:** Highly personalized, Authoritative, Empathetic.
Return ONLY Tamil text.`;

            englishPrompt = `You are Aditya Guruji's AI Avatar. Your task is to generate a deep "Who Am I?" psychological profile based on the User JSON provided.

🚫 **Avoid:** Generic zodiac descriptions (e.g., "Capricorns are ambitious").
✅ **Focus:** Subathuvam (Light), Papathuvam (Darkness), and Planetary Lordship.

**INPUT DATA:**
\`\`\`json
${JSON.stringify(enhancedContext, null, 2)}
\`\`\`

**Analysis Protocol:**

**1. The Core Self (Lagna & Lagna Lord):**
- Analyze \`lagna\` (${lagnaName}) and \`lagna_lord\` (${lagnaLord}).
- **Rule:** If Lagna Lord is *Subathuvam* (aspected by Jupiter), describe the user as "Honest, righteous, and soft-natured."
- **Rule:** If Lagna Lord is *Papathuvam* (with Mars/Rahu), describe them as "A fighter, aggressive, or someone who breaks rules."
- *Output Style:* "Your foundation is built on [Planet]. This makes you..."

**2. The Mind (Moon & Mercury):**
- Analyze Moon and Mercury from \`planetary_scan\`.
- **Moon:** Determines emotional stability.
  - *Subathuvam:* "You have a calm, unwavering mind. You handle stress well."
  - *Papathuvam:* "You often feel lonely or overthink unnecessarily."
- **Mercury:** Determines intelligence type.
  - *With Rahu (Papathuvam):* "You have 'Criminal Intelligence' (Smart & Cunning). You can solve puzzles others can't."
  - *With Jupiter (Subathuvam):* "You have 'Divine Intelligence'. You learn quickly."

**3. The Karmic Path (Rahu/Ketu & 5th/9th Lords):**
- Look at the **Rahu-Ketu Axis** from \`planetary_scan\`.
  - *Rahu in Lagna (House 1):* "You are ambitious and want to prove yourself to the world."
  - *Ketu in Lagna (House 1):* "You are spiritual and sometimes detached from worldly desires."
  - *Rahu in 7th:* "You seek unconventional relationships or foreign connections."
- Check **5th House** for luck. If 5th Lord is weak: "You rely more on hard work than luck."

**4. The Hidden Truth (Secret Section):**
- If 8th House is active or strong: "You have a natural intuition for secrets, research, or astrology."
- If Saturn + Rahu together: "You have hidden struggles or unconventional career paths."

---
**OUTPUT FORMAT (Tone: Insightful, Direct, Empathetic):**

**Welcome, Who Are You Based on Planetary Light?**

🧠 **The Secret of Your Mind (Mindset):**
[Analysis of Moon & Mercury - Are they emotional or logical? Waxing/Waning Moon? Mercury with Rahu or Jupiter?]

🦁 **Your True Character:**
[Analysis of Lagna Lord - Are they a soft person or a fighter? Element analysis (${lagnaElement}). Nakshatra (${nakshatra}) influence.]

🔮 **Your Life Purpose (Karmic Path):**
[Analysis of Rahu/Ketu & 10th House - What are they chasing? Service-oriented or status-oriented?]

💡 **Your Hidden Strength:**
[Analysis of 5th/9th House - Luck vs. Hard Work. Hidden talents like occult, writing, or leadership.]

**🤝 Relationships & Friendships:**
[Analyze 7th Lord (${seventhLord}) & Venus - Long-lasting relationships or challenges?]

**Tone:** Highly personalized, Authoritative, Empathetic.
Return ONLY English text.`;
        }

        const systemPrompt = language === 'ta' ? tamilPrompt : englishPrompt;

        const userContext = JSON.stringify(enhancedContext, null, 2);

        // Updated Model List - Prioritize efficient models for this specific task
        const models = [
            "mistralai/mistral-7b-instruct:free", // Often reliable for structured text
            "google/gemini-2.0-flash-exp:free",
            "google/gemini-flash-1.5",
            "openai/gpt-4o"
        ];

        let retries = models.length;
        let modelIndex = 0;

        while (retries > 0) {
            const currentModel = models[modelIndex % models.length];
            console.log(`🤖 Attempting Guruji Persona with model: ${currentModel} `);

            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey} `,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://astrology-app.com",
                        "X-Title": "Astrology App"
                    },
                    body: JSON.stringify({
                        "model": currentModel,
                        "messages": [
                            { "role": "system", "content": systemPrompt },
                            { "role": "user", "content": userContext }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                        const content = data.choices[0].message.content;
                        if (content && content.length > 50) { // Basic validation
                            console.log("✅ AI Generation Successful!");
                            return content;
                        }
                    }
                }

                // If we get here, response wasn't good
                console.warn(`⚠️ Issue with ${currentModel} response.`);
                modelIndex++;
                retries--;
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (err) {
                console.warn(`❌ Error on ${currentModel}: `, err);
                modelIndex++;
                retries--;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return "System is busy. Please try again in 1 minute.";

    } catch (error) {
        console.error("Guruji Persona Gen Error:", error);
        return "உங்களின் ஜாதகத்தை கணிப்பதில் சிரமம் உள்ளது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.";
    }
};

/**
 * Generate Comprehensive Marriage Matching Analysis
 */
export const generateMarriageMatchingAI = async (
    boyDetails: any,
    girlDetails: any,
    matchingResult: any,
    language: 'en' | 'ta' = 'ta',
    apiKey: string = OPENROUTER_API_KEY
): Promise<string> => {
    // Normalize data (Handle both Standard and Comprehensive Result structures)
    try {
        const isComprehensive = 'dasaSync' in matchingResult;

        const overallScore = matchingResult.overallScore;
        const verdict = matchingResult.verdict;

        // Dasa Matching
        const dasaScore = isComprehensive
            ? matchingResult.dasaSync.score
            : matchingResult.dasaMatching?.score || 0;

        const dasaWarning = isComprehensive
            ? (matchingResult.dasaSync.warnings?.length > 0 || matchingResult.autoRejectReasons?.some((r: string) => r.includes('6-8')))
            : matchingResult.dasaMatching?.sixEightRelationship || false;

        // House Matching
        const house2Score = isComprehensive ? matchingResult.house2nd?.score : matchingResult.houseMatching?.house2?.score || 0;
        const house7Score = isComprehensive ? matchingResult.house7th?.score : matchingResult.houseMatching?.house7?.score || 0;
        const house8Score = isComprehensive ? matchingResult.house8th?.score : matchingResult.houseMatching?.house8?.score || 0;

        const tamilPrompt = `You are an expert Vedic Astrologer specializing in Marriage Matching(Thirumana Porutham) using Aditya Guruji's Subathuvam & Dasa methods.
Your task is to analyze the provided Marriage Matching Result and give a ** Detailed, Honest, and Predictive Analysis ** in Tamil.

USER DATA:
            - Boy: ${boyDetails.name} (${boyDetails.date})
            - Girl: ${girlDetails.name} (${girlDetails.date})
            - Compatibility Score: ${overallScore}/100
                - Verdict: ${verdict}
            - Dasa Compatibility: Score ${dasaScore}/100
                - 6 - 8 Dasa Issue: ${dasaWarning ? "YES (Warning)" : "NO"}
            - House Matching:
            - 2nd House(Family): ${house2Score}
            - 7th House(Kalathra): ${house7Score}
            - 8th House(Longevity): ${house8Score}

RULES FOR ANALYSIS(Strictly in Tamil Language):
            0. ** LANGUAGE INSTRUCTION:** You MUST output the entire analysis ONLY in Tamil(தமிழ்).Do not use English words unless absolutely necessary for technical terms.
1. ** START WITH A CLEAR VERDICT:**
                - "இந்த திருமணம் சிறப்பாக இருக்கும்"(Recommended) OR "இந்த திருமணத்தை தவிர்ப்பது நல்லது"(Not Recommended).
   - Base this on the 'Verdict' and 'Overall Score'.

2. ** ANALYZE DASA SANDHI(Crucial):**
                - Look at 'dasaMatching'.If there is a 6 - 8 relationship(Sashtashtama), WARN THEM seriously.
   - Explain what will happen: "தசா நாதர்கள் 6-8 க இருப்பதால், ஈகோ பிரச்சனைகள் வரும்..."
                - If Dasa is good: Predict growth after marriage.

3. ** PREDICT THE FUTURE(Next 5 - 10 Years):**
                - Use the 'nextTenYears' timeline(if good) to predict: "குழந்தை பாக்கியம்", "சொத்து சேரும் காலம்".
   - If verified risks exist: Mention "பிரிவு ஏற்பட வாய்ப்பு"(Possibility of separation) honestly but gently.

OUTPUT STRUCTURE(Return plain Tamil text with headers):
            1. ** திருமண பொருத்த முடிவு(Final Verdict):**
                2. ** மனயீர்ப்பு & ஒற்றுமை(Psychological Compatibility):**
                    3. ** தசா - புத்தி சவால்கள்(Dasa Predictions):** (Explain 6 - 8 issues if any).
4. ** எதிர்கால வாழ்க்கை(Future Prediction):** (Career, Wealth after marriage).

            Tone: Trusted Guruji, Caring, Protective but Truthful.
`;

        const englishPrompt = `You are an expert Vedic Astrologer specializing in Marriage Matching using Aditya Guruji's Subathuvam & Dasa methods.
Your task is to analyze the provided Marriage Matching Result and give a ** Detailed, Honest, and Predictive Analysis ** in English.

USER DATA:
            - Boy: ${boyDetails.name} (${boyDetails.date})
            - Girl: ${girlDetails.name} (${girlDetails.date})
            - Compatibility Score: ${overallScore}/100
                - Verdict: ${verdict}
            - Dasa Compatibility: Score ${dasaScore}/100
                - 6 - 8 Dasa Issue: ${dasaWarning ? "YES (Warning)" : "NO"}
            - House Matching:
            - 2nd House(Family): ${house2Score}
            - 7th House(Kalathra): ${house7Score}
            - 8th House(Longevity): ${house8Score}

OUTPUT STRUCTURE(Return plain English text with headers):
            1. ** Final Verdict(Marriage Decision):**
                2. ** Compatibility & Understanding:**
                    3. ** Dasa & Timing Analysis:** (Crucial for long term).
4. ** Future Predictions(Post - Marriage):** (Wealth, Children, Career).

                Tone: Professional, Insightful, and Honest.
`;

        const systemPrompt = language === 'ta' ? tamilPrompt : englishPrompt;
        const contextData = JSON.stringify(matchingResult, null, 2);

        // Model List (Smartest First)
        const models = [
            'google/gemini-2.0-flash-exp:free',
            'google/gemini-2.0-flash-thinking-exp:free',
            'meta-llama/llama-3.1-70b-instruct:free',
            'mistralai/mistral-7b-instruct:free',
            'openai/gpt-4o', // Paid Fallback
            'google/gemini-flash-1.5' // Paid Fallback
        ];

        let modelIndex = 0;
        let retries = models.length;

        while (retries > 0 && modelIndex < models.length) {
            const currentModel = models[modelIndex];
            console.log(`🤖 Attempting Marriage AI with model: ${currentModel} `);

            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey} `,
                        "HTTP-Referer": "https://astrology-app.com",
                        "X-Title": "Astrology App",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": currentModel,
                        "messages": [
                            {
                                "role": "system",
                                "content": systemPrompt
                            },
                            {
                                "role": "user",
                                "content": `Analyze this matching result: \n${contextData} \n\nIMPORTANT: Output the analysis STRICTLY in ${language === 'ta' ? 'TAMIL (தமிழ்)' : 'ENGLISH'} language.`
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices.length > 0) {
                        return data.choices[0].message.content;
                    }
                }

                // If failed, try next model
                console.warn(`⚠️ Model ${currentModel} failed or returned empty.`);
                modelIndex++;
                retries--;

            } catch (e) {
                console.error(`Error with ${currentModel}: `, e);
                modelIndex++;
                retries--;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        throw new Error("All models failed");

    } catch (error) {
        console.error("Error in Marriage AI:", error);
        return language === 'ta'
            ? "மன்னிக்கவும், தொழில்நுட்ப கோளாறு உள்ளது."
            : "Sorry, error generating analysis.";
    }
};