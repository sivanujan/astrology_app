// Dasa Predictions Generator
// Generates detailed predictions for different life areas based on Dasa analysis

import { DasaScore } from './dasaAnalysis';

export interface DasaPredictions {
    overall: string;
    career: string;
    wealth: string;
    marriage: string;
    health: string;
    family: string;
    advice: string;
}

export interface KeyEvent {
    area: string;
    prediction: string;
    probability: 'High' | 'Medium' | 'Low';
    timing: string;
}

export interface Warning {
    area: string;
    issue: string;
    severity: 'High' | 'Medium' | 'Low';
}

export interface DosAndDonts {
    do: string[];
    dont: string[];
}

export interface LuckyFactors {
    days: string[];
    colors: string[];
    directions: string[];
    numbers: number[];
}

// Planet-specific lucky factors
const LUCKY_FACTORS_MAP: Record<string, LuckyFactors> = {
    'Sun': {
        days: ['Sunday'],
        colors: ['Red', 'Orange', 'Gold'],
        directions: ['East'],
        numbers: [1, 10, 19, 28]
    },
    'Moon': {
        days: ['Monday'],
        colors: ['White', 'Cream', 'Pearl'],
        directions: ['Northwest'],
        numbers: [2, 11, 20, 29]
    },
    'Mars': {
        days: ['Tuesday'],
        colors: ['Red', 'Maroon'],
        directions: ['South'],
        numbers: [9, 18, 27]
    },
    'Mercury': {
        days: ['Wednesday'],
        colors: ['Green', 'Emerald'],
        directions: ['North'],
        numbers: [5, 14, 23]
    },
    'Jupiter': {
        days: ['Thursday'],
        colors: ['Yellow', 'Gold'],
        directions: ['Northeast'],
        numbers: [3, 12, 21, 30]
    },
    'Venus': {
        days: ['Friday'],
        colors: ['White', 'Pink', 'Light Blue'],
        directions: ['Southeast'],
        numbers: [6, 15, 24]
    },
    'Saturn': {
        days: ['Saturday'],
        colors: ['Blue', 'Black', 'Dark Grey'],
        directions: ['West'],
        numbers: [8, 17, 26]
    },
    'Rahu': {
        days: ['Saturday'],
        colors: ['Black', 'Dark Blue'],
        directions: ['Southwest'],
        numbers: [4, 13, 22, 31]
    },
    'Ketu': {
        days: ['Tuesday'],
        colors: ['Brown', 'Grey'],
        directions: ['Northwest'],
        numbers: [7, 16, 25]
    }
};

/**
 * Generate career predictions based on Dasa planet and score
 */
export function generateCareerPrediction(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): string {
    const rules10th = lordship.includes(10);
    const isSun = planetName === 'Sun';
    const isSaturn = planetName === 'Saturn';
    const isMercury = planetName === 'Mercury';

    if (language === 'ta') {
        if (score >= 75) {
            if (rules10th) return 'தொழிலில் உச்ச முன்னேற்றம், பதவி உயர்வு நிச்சயம். புதிய பொறுப்புகள் கிடைக்கும்.';
            if (isSun) return 'அரசாங்க வேலை அல்லது அதிகாரப் பதவி கிடைக்கும். தலைமைப் பொறுப்புகள் வரும்.';
            if (isSaturn) return 'மெதுவாக ஆனால் நிலையான முன்னேற்றம். கடின உழைப்பு பலன் தரும்.';
            return 'தொழில் வளர்ச்சி நல்லபடியாக இருக்கும். சம்பளம் உயரும்.';
        } else if (score >= 45) {
            return 'தொழிலில் நிலையான நிலை. சிறிய முன்னேற்றங்கள் உண்டு.';
        } else {
            return 'தொழிலில் போராட்டங்கள், தடைகள் இருக்கும். பொறுமை தேவை.';
        }
    } else {
        if (score >= 75) {
            if (rules10th) return 'Excellent career growth, promotion certain. New responsibilities coming.';
            if (isSun) return 'Government job or authoritative position. Leadership roles ahead.';
            if (isSaturn) return 'Slow but steady progress. Hard work will pay off.';
            if (isMercury) return 'Business ventures will succeed. Communication-based career growth.';
            return 'Very good career progress. Salary increase likely.';
        } else if (score >= 45) {
            return 'Steady career phase. Minor advancements possible.';
        } else {
            return 'Career challenges and obstacles. Patience required.';
        }
    }
}

/**
 * Generate wealth predictions
 */
export function generateWealthPrediction(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): string {
    const rules2nd = lordship.includes(2);
    const rules11th = lordship.includes(11);
    const isJupiter = planetName === 'Jupiter';
    const isVenus = planetName === 'Venus';

    if (language === 'ta') {
        if (score >= 75) {
            if (rules2nd || rules11th) return 'பணவரவு அதிகரிக்கும். சேமிப்பு நன்றாக இருக்கும். முதலீடுகள் லாபம் தரும்.';
            if (isJupiter) return 'செல்வம் விரிவடையும். பல வழிகளில் பண வரவு.';
            if (isVenus) return 'ஆடம்பர பொருட்கள் வாங்கும் நிலை. சொத்துக்கள் சேரும்.';
            return 'பண நிலை மிக நல்லதாக இருக்கும். கடன்கள் தீரும்.';
        } else if (score >= 45) {
            return 'வருமானம் நிலையாக இருக்கும். சேமிப்பு சராசரி.';
        } else {
            return 'பண பற்றாக்குறை, கடன் பிரச்சனைகள் வரலாம். சிக்கனம் அவசியம்.';
        }
    } else {
        if (score >= 75) {
            if (rules2nd || rules11th) return 'Income will increase significantly. Good savings. Investments profitable.';
            if (isJupiter) return 'Wealth expansion. Multiple income sources.';
            if (isVenus) return 'Luxury purchases possible. Property acquisition.';
            return 'Financial situation very good. Debts will clear.';
        } else if (score >= 45) {
            return 'Steady income. Average savings.';
        } else {
            return 'Financial constraints, debt issues possible. Economy necessary.';
        }
    }
}

/**
 * Generate marriage predictions
 */
export function generateMarriagePrediction(
    planetName: string,
    score: number,
    lordship: number[],
    age: number,
    language: 'en' | 'ta' = 'en'
): string {
    const rules7th = lordship.includes(7);
    const isVenus = planetName === 'Venus';
    const isJupiter = planetName === 'Jupiter';
    const marriageAge = age >= 24 && age <= 35;

    if (language === 'ta') {
        if (score >= 75 && rules7th && marriageAge) {
            return 'திருமணம் நடக்கும் வாய்ப்பு அதிகம். நல்ல வாழ்க்கைத் துணை அமையும்.';
        } else if (score >= 75) {
            if (isVenus) return 'காதல், உறவுகள் மகிழ்ச்சியாக இருக்கும். திருமண சந்தோஷம்.';
            if (isJupiter) return 'வாழ்க்கைத் துணையின் ஆதரவு கிடைக்கும். குடும்ப இணக்கம்.';
            return 'திருமண வாழ்க்கை நல்லபடியாக இருக்கும்.';
        } else if (score >= 45) {
            return 'திருமண விஷயங்களில் சாதாரண நிலை. சிறு பிரச்சனைகள் உண்டாகலாம்.';
        } else {
            return 'திருமணத்தில் தாமதம் அல்லது சவால்கள். பொறுமை தேவை.';
        }
    } else {
        if (score >= 75 && rules7th && marriageAge) {
            return 'Marriage highly likely. Good life partner destined.';
        } else if (score >= 75) {
            if (isVenus) return 'Romance, relationships will be joyful. Marital happiness.';
            if (isJupiter) return 'Spouse support strong. Family harmony.';
            return 'Married life will be good.';
        } else if (score >= 45) {
            return 'Average marriage matters. Minor issues may arise.';
        } else {
            return 'Marriage delays or challenges. Patience needed.';
        }
    }
}

/**
 * Generate health predictions
 */
export function generateHealthPrediction(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): string {
    const rules6th = lordship.includes(6);
    const rules8th = lordship.includes(8);
    const isSun = planetName === 'Sun';
    const isMoon = planetName === 'Moon';

    if (language === 'ta') {
        if (rules6th || rules8th) {
            if (score < 45) return 'உடல் ஆரோக்கியத்தில் கவனம் தேவை. மருத்துவ பரிசோதனை செய்யவும்.';
            return 'சிறிய உடல்நலப் பிரச்சனைகள் வரலாம். முன்னெச்சரிக்கை அவசியம்.';
        } else if (score >= 75) {
            if (isSun) return 'உடல் வலிமை அதிகரிக்கும். நல்ல ஆற்றல்.';
            if (isMoon) return 'மன அமைதி, உணர்ச்சி நிலைத்தன்மை நன்றாக இருக்கும்.';
            return 'உடல் ஆரோக்கியம் மிக நல்லதாக இருக்கும்.';
        } else {
            return 'உடல்நிலை சராசரியாக இருக்கும்.';
        }
    } else {
        if (rules6th || rules8th) {
            if (score < 45) return 'Health needs attention. Medical checkup advised.';
            return 'Minor health issues possible. Precaution necessary.';
        } else if (score >= 75) {
            if (isSun) return 'Physical strength will increase. Good vitality.';
            if (isMoon) return 'Mental peace, emotional stability good.';
            return 'Health will be very good.';
        } else {
            return 'Health will be average.';
        }
    }
}

/**
 * Generate children predictions
 */
export function generateChildrenPrediction(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): string {
    const rules5th = lordship.includes(5);
    const isJupiter = planetName === 'Jupiter';

    if (language === 'ta') {
        if (score >= 75 && (rules5th || isJupiter)) {
            return 'குழந்தைகள் மகிழ்ச்சி. குழ்ந்தை பிறப்பு சாத்தியம். பிள்ளைகள் நன்றாக படிப்பார்கள்.';
        } else if (score >= 75) {
            return 'குழந்தைகளுடன் நல்ல உறவு. அவர்களின் முன்னேற்றம்.';
        } else if (score >= 45) {
            return 'குழந்தைகள் விஷயத்தில் சராசரி நிலை.';
        } else {
            return 'குழந்தைகள் விஷயத்தில் கவலைகள் வரலாம்.';
        }
    } else {
        if (score >= 75 && (rules5th || isJupiter)) {
            return 'Children joy. Child birth possible. Kids will study well.';
        } else if (score >= 75) {
            return 'Good relationship with children. Their progress.';
        } else if (score >= 45) {
            return 'Average situation regarding children.';
        } else {
            return 'Concerns about children possible.';
        }
    }
}

/**
 * Generate property predictions
 */
export function generatePropertyPrediction(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): string {
    const rules4th = lordship.includes(4);
    const isMars = planetName === 'Mars';
    const isVenus = planetName === 'Venus';

    if (language === 'ta') {
        if (score >= 75 && rules4th) {
            return 'சொத்து வாங்கும் வாய்ப்பு. வீடு கட்டுதல் சாத்தியம்.';
        } else if (score >= 75) {
            if (isMars) return 'நிலம், வீடு வாங்கும் நிலை. சொத்துகள் சேரும்.';
            if (isVenus) return 'வாகனம், ஆடம்பரப் பொருட்கள் வாங்குவீர்கள்.';
            return 'சொத்து சம்பந்தமான விஷயங்கள் சாதகமாக இருக்கும்.';
        }
        return 'சொத்து விஷயத்தில் சாதாரண நிலை.';
    } else {
        if (score >= 75 && rules4th) {
            return 'Property purchase possible. House construction likely.';
        } else if (score >= 75) {
            if (isMars) return 'Land, house acquisition. Property gains.';
            if (isVenus) return 'Vehicle, luxury items purchase.';
            return 'Property matters favorable.';
        }
        return 'Average situation regarding property.';
    }
}

/**
 * Generate comprehensive predictions for all life areas
 */
export function generateComprehensivePredictions(
    planetName: string,
    dasaScore: DasaScore,
    lordship: number[],
    userAge: number,
    language: 'en' | 'ta' = 'en'
): DasaPredictions {
    const score = dasaScore.totalScore;
    const quality = dasaScore.quality;

    const overall = language === 'ta'
        ? `இந்த ${planetName} தசா காலம் ${score >= 75 ? 'மிக நல்ல' : score >= 45 ? 'சராசரி' : 'சவாலான'} பலன்களை தரும்.`
        : `This ${planetName} Dasa period will bring ${score >= 75 ? 'very good' : score >= 45 ? 'average' : 'challenging'} results.`;

    const career = generateCareerPrediction(planetName, score, lordship, language);
    const wealth = generateWealthPrediction(planetName, score, lordship, language);
    const marriage = generateMarriagePrediction(planetName, score, lordship, userAge, language);
    const health = generateHealthPrediction(planetName, score, lordship, language);
    const family = generateChildrenPrediction(planetName, score, lordship, language);

    const advice = language === 'ta'
        ? score >= 75
            ? 'இந்த நல்ல காலத்தை பயன்படுத்தி முக்கிய முடிவுகள் எடுக்கலாம். புதிய முயற்சிகளைத் தொடங்கலாம்.'
            : score >= 45
                ? 'பொறுமையாக செயல்படவும். அவசரமான முடிவுகள் எடுக்க வேண்டாம்.'
                : 'கடினமான நேரம். ஆன்மீக முறைகளைப் பின்பற்றவும். பரிகாரங்கள் செய்யவும்.'
        : score >= 75
            ? 'Use this favorable period for important decisions. Start new ventures.'
            : score >= 45
                ? 'Act patiently. Avoid hasty decisions.'
                : 'Difficult time. Follow spiritual practices. Perform remedies.';

    return {
        overall,
        career,
        wealth,
        marriage,
        health,
        family,
        advice
    };
}

/**
 * Generate key events timeline
 */
export function generateKeyEvents(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): KeyEvent[] {
    const events: KeyEvent[] = [];

    if (score >= 75) {
        if (lordship.includes(10)) {
            events.push({
                area: language === 'ta' ? 'தொழில்' : 'Career',
                prediction: language === 'ta' ? 'பதவி உயர்வு அல்லது வேலை மாற்றம்' : 'Promotion or job change',
                probability: 'High',
                timing: language === 'ta' ? 'காலத்தின் நடுப்பகுதி' : 'Mid-period'
            });
        }
        if (lordship.includes(2) || lordship.includes(11)) {
            events.push({
                area: language === 'ta' ? 'செல்வம்' : 'Wealth',
                prediction: language === 'ta' ? 'சொத்து வாங்குதல் சாத்தியம்' : 'Property purchase possible',
                probability: 'Medium',
                timing: language === 'ta' ? 'பிற்பகுதி' : 'Later part'
            });
        }
        if (lordship.includes(7)) {
            events.push({
                area: language === 'ta' ? 'திருமணம்' : 'Marriage',
                prediction: language === 'ta' ? 'திருமணம் அல்லது நிச்சயதார்த்தம்' : 'Marriage or engagement',
                probability: 'High',
                timing: language === 'ta' ? 'ஆரம்பம்/நடுப்பகுதி' : 'Early/mid-period'
            });
        }
    }

    return events;
}

/**
 * Generate warnings
 */
export function generateWarnings(
    planetName: string,
    score: number,
    lordship: number[],
    language: 'en' | 'ta' = 'en'
): Warning[] {
    const warnings: Warning[] = [];

    if (score < 45) {
        if (lordship.includes(6) || lordship.includes(8)) {
            warnings.push({
                area: language === 'ta' ? 'உடல்நலம்' : 'Health',
                issue: language === 'ta' ? 'சிறிய உடல்நல பிரச்சனைகள் சாத்தியம்' : 'Minor health issues possible',
                severity: 'Medium'
            });
        }
        if (lordship.includes(7)) {
            warnings.push({
                area: language === 'ta' ? 'உறவுகள்' : 'Relationships',
                issue: language === 'ta' ? 'உறவுகளில் மோதல்கள்' : 'Conflicts in relationships',
                severity: 'Low'
            });
        }
    }

    if (planetName === 'Saturn' && score < 60) {
        warnings.push({
            area: language === 'ta' ? 'பொது' : 'General',
            issue: language === 'ta' ? 'மெதுவான முன்னேற்றம், தாமதங்கள்' : 'Slow progress, delays',
            severity: 'Medium'
        });
    }

    return warnings;
}

/**
 * Generate do's and don'ts
 */
export function generateDosAndDonts(
    planetName: string,
    score: number,
    language: 'en' | 'ta' = 'en'
): DosAndDonts {
    if (language === 'ta') {
        if (score >= 75) {
            return {
                do: [
                    'புதிய திட்டங்களைத் தொடங்கவும்',
                    'முதலீடுகள் செய்யவும்',
                    'சொத்து/வாகனம் வாங்கவும்',
                    'தொழில் வளர்ச்சியில் கவனம் செலுத்தவும்'
                ],
                dont: [
                    'பெரிய கடன்களைத் தவிர்க்கவும்',
                    'உடல்நலத்தை புறக்கணிக்க வேண்டாம்',
                    'தேவையில்லாத செலவுகள் வேண்டாம்'
                ]
            };
        } else {
            return {
                do: [
                    'பொறுமையாக இருக்கவும்',
                    'பரிகாரங்கள் செய்யவும்',
                    'ஆன்மீக முறைகளைப் பின்பற்றவும்',
                    'சிக்கனமாக இருக்கவும்'
                ],
                dont: [
                    'அவசர முடிவுகள் எடுக்க வேண்டாம்',
                    'பெரிய ரிஸ்க் எடுக்க வேண்டாம்',
                    'மோதல்களில் ஈடுபட வேண்டாம்',
                    'கடன் வாங்க வேண்டாம்'
                ]
            };
        }
    } else {
        if (score >= 75) {
            return {
                do: [
                    'Start new projects',
                    'Make investments',
                    'Buy property/vehicle',
                    'Focus on career growth'
                ],
                dont: [
                    'Avoid major debts',
                    "Don't neglect health",
                    'Avoid unnecessary expenses'
                ]
            };
        } else {
            return {
                do: [
                    'Be patient',
                    'Perform remedies',
                    'Follow spiritual practices',
                    'Be economical'
                ],
                dont: [
                    "Don't make hasty decisions",
                    "Don't take big risks",
                    "Don't engage in conflicts",
                    "Don't borrow money"
                ]
            };
        }
    }
}

/**
 * Generate remedies specific to planet
 */
export function generateRemedies(
    planetName: string,
    score: number,
    language: 'en' | 'ta' = 'en'
): string[] {
    const planetRemedies: Record<string, { ta: string[], en: string[] }> = {
        'Sun': {
            ta: ['சூரியனை வணங்குங்கள்', 'ஞாயிற்றுக்கிழமை தானம் செய்யுங்கள்', 'சிவப்பு ஆடை அணியுங்கள்', 'ஆதித்ய ஹிருதய ஸ்தோத்திரம் படியுங்கள்'],
            en: ['Worship Sun God', 'Donate on Sundays', 'Wear red clothes', 'Recite Aditya Hrudayam']
        },
        'Moon': {
            ta: ['சந்திரனை வணங்குங்கள்', 'திங்கட்கிழமை தானம் செய்யுங்கள்', 'வெள்ளை ஆடை அணியுங்கள்', 'சந்திர மந்திரம் ஜபியுங்கள்'],
            en: ['Worship Moon God', 'Donate on Mondays', 'Wear white clothes', 'Chant Moon mantras']
        },
        'Mars': {
            ta: ['செவ்வாயை வணங்குங்கள்', 'செவ்வாய்க்கிழமை தானம் செய்யுங்கள்', 'ஹனுமான் சாலீசா படியுங்கள்', 'சிவப்பு பவளம் அணியுங்கள்'],
            en: ['Worship Mars/Hanuman', 'Donate on Tuesdays', 'Recite Hanuman Chalisa', 'Wear red coral']
        },
        'Mercury': {
            ta: ['புதனை வணங்குங்கள்', 'புதன்கிழமை தானம் செய்யுங்கள்', 'பச்சை ஆடை அணியுங்கள்', 'விஷ்ணு சஹஸ்ரநாமம் படியுங்கள்'],
            en: ['Worship Mercury/Vishnu', 'Donate on Wednesdays', 'Wear green clothes', 'Recite Vishnu Sahasranamam']
        },
        'Jupiter': {
            ta: ['குருவை வணங்குங்கள்', 'வியாழக்கிழமை தானம் செய்யுங்கள்', 'மஞ்சள் ஆடை அணியுங்கள்', 'குரு மந்திரம் ஜபியுங்கள்'],
            en: ['Worship Jupiter/Guru', 'Donate on Thursdays', 'Wear yellow clothes', 'Chant Guru mantras']
        },
        'Venus': {
            ta: ['சுக்ரனை வணங்குங்கள்', 'வெள்ளிக்கிழமை தானம் செய்யுங்கள்', 'வெள்ளை/இளஞ்சிவப்பு ஆடை', 'லக்ஷ்மி ஸ்தோத்திரம் படியுங்கள்'],
            en: ['Worship Venus/Lakshmi', 'Donate on Fridays', 'Wear white/pink clothes', 'Recite Lakshmi stotram']
        },
        'Saturn': {
            ta: ['சனியை வணங்குங்கள்', 'சனிக்கிழமை தானம் செய்யுங்கள்', 'நீல நிற ஆடை அணியுங்கள்', 'ஹனுமான் சாலீசா படியுங்கள்'],
            en: ['Worship Saturn/Shani', 'Donate on Saturdays', 'Wear blue/black clothes', 'Recite Hanuman Chalisa']
        },
        'Rahu': {
            ta: ['ராகுவை வணங்குங்கள்', 'சனிக்கிழமை தானம் செய்யுங்கள்', 'துர்கா ஸ்தோத்திரம் படியுங்கள்', 'கருப்பு ஆடை அணியுங்கள்'],
            en: ['Worship Rahu/Durga', 'Donate on Saturdays', 'Recite Durga stotram', 'Wear black clothes']
        },
        'Ketu': {
            ta: ['கேதுவை வணங்குங்கள்', 'செவ்வாய்க்கிழமை தானம் செய்யுங்கள்', 'கணபதி மந்திரம் ஜபியுங்கள்', 'பழுப்பு ஆடை அணியுங்கள்'],
            en: ['Worship Ketu/Ganesha', 'Donate on Tuesdays', 'Chant Ganesha mantras', 'Wear brown clothes']
        }
    };

    return planetRemedies[planetName]?.[language] || [];
}

/**
 * Get lucky factors for planet
 */
export function getLuckyFactors(planetName: string, language: 'en' | 'ta' = 'en'): LuckyFactors {
    const factors = LUCKY_FACTORS_MAP[planetName] || LUCKY_FACTORS_MAP['Sun'];

    if (language === 'ta') {
        const daysMap: Record<string, string> = {
            'Sunday': 'ஞாயிறு', 'Monday': 'திங்கள்', 'Tuesday': 'செவ்வாய்',
            'Wednesday': 'புதன்', 'Thursday': 'வியாழன்', 'Friday': 'வெள்ளி',
            'Saturday': 'சனி'
        };
        const directionsMap: Record<string, string> = {
            'East': 'கிழக்கு', 'West': 'மேற்கு', 'North': 'வடக்கு', 'South': 'தெற்கு',
            'Northeast': 'வடகிழக்கு', 'Northwest': 'வடமேற்கு',
            'Southeast': 'தென்கிழக்கு', 'Southwest': 'தென்மேற்கு'
        };

        return {
            ...factors,
            days: factors.days.map(d => daysMap[d] || d),
            directions: factors.directions.map(d => directionsMap[d] || d)
        };
    }

    return factors;
}
