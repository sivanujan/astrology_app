
import { DasaScoreBreakdown } from './dashaScoring';

export const generateDasaPrediction = (
    planetName: string,
    dasaScore: DasaScoreBreakdown,
    periodType: 'Maha' | 'Bhukti' | 'Antaram',
    language: 'en' | 'ta' = 'en'
): string => {
    const isTamil = language === 'ta';
    let prediction = "";

    // 1. Introduction based on Total Score
    const score = dasaScore.totalScore;
    let quality = "";
    if (score >= 75) quality = isTamil ? "மிகச்சிறந்த" : "Excellent";
    else if (score >= 60) quality = isTamil ? "நல்ல" : "Very Good";
    else if (score >= 50) quality = isTamil ? "சராசரிக்கு மேல்" : "Above Average";
    else if (score >= 40) quality = isTamil ? "சராசரி" : "Average";
    else quality = isTamil ? "சவாலான" : "Challenging";

    if (isTamil) {
        prediction += `${planetName} ${periodType === 'Maha' ? 'தசை' : periodType === 'Bhukti' ? 'புத்தி' : 'அந்தரம்'} ஒரு **${quality}** காலமாக அமையும் (மதிப்பெண்: ${score}/100).\n\n`;
    } else {
        prediction += `The ${planetName} ${periodType} period will be a **${quality}** phase (Score: ${score}/100).\n\n`;
    }

    // 2. Sthana Bala Analysis (Positional Strength)
    const sthanaBala = dasaScore.sthanaBala;
    if (isTamil) {
        prediction += `**ஸ்தான பலம் (Positional Strength):**\n`;
        if (sthanaBala > 60) {
            prediction += `- ${planetName} லக்னத்திற்கு மிகச் மிகச்சிறந்த இடத்தில் அமைந்துள்ளார். இது ஜாதகருக்கு நிலையான வளர்ச்சியை தரும்.\n`;
        } else if (sthanaBala > 40) {
            prediction += `- ${planetName} ஜாதகத்தில் நல்ல இடத்தில் உள்ளார். இது நற்பலன்களைத் தரும்.\n`;
        } else {
            prediction += `- ${planetName} மறைவு ஸ்தானம் அல்லது பலவீனமான இடத்தில் உள்ளார். இதனால் உடல்நலம் அல்லது மன அமைதியில் கவனம் தேவை.\n`;
        }
    } else {
        prediction += `**Positional Strength (Sthana Bala):**\n`;
        if (sthanaBala > 60) {
            prediction += `- ${planetName} is exceptionally well-placed from the Lagna. This indicates steady growth and stability.\n`;
        } else if (sthanaBala > 40) {
            prediction += `- ${planetName} is in a favorable position. This generally brings positive results.\n`;
        } else {
            prediction += `- ${planetName} is in a hidden or weak house (Dusthana). Attention to health or peace of mind may be required.\n`;
        }
    }

    // 3. Subathuvam Analysis (Beneficence)
    const subathuvam = dasaScore.subathuvamScore;
    if (isTamil) {
        prediction += `\n**சுபத்துவம் (Beneficence):**\n`;
        if (subathuvam > 15) {
            prediction += `- இந்த கிரகம் அதிக சுபத்தன்மை பெற்றுள்ளது. இது மகிழ்ச்சி, அதிர்ஷ்டம் மற்றும் நற்பெயரைத் தரும்.\n`;
        } else if (subathuvam > 5) {
            prediction += `- சுபத்தன்மை உள்ளது, ஆனால் சிறிது பாபத்துவமும் இருக்கலாம்.\n`;
        } else {
            prediction += `- சுபத்தன்மை குறைவு. கடின உழைப்பு மூலமே பலன்கள் கிடைக்கும். \n`;
        }
    } else {
        prediction += `\n**Beneficence (Subathuvam):**\n`;
        if (subathuvam > 15) {
            prediction += `- This planet has high beneficence (Subathuvam). It brings happiness, luck, and good reputation.\n`;
        } else if (subathuvam > 5) {
            prediction += `- Moderate beneficence present. Mixed results expected.\n`;
        } else {
            prediction += `- Low beneficence. Success will come primarily through hard work and perseverance.\n`;
        }
    }

    // 4. Detailed Period Specifics based on Planet Nature (Karaka)
    if (isTamil) {
        prediction += `\n**எதிர்பார்க்கக்கூடிய பலன்கள்:**\n`;
        switch (planetName) {
            case 'Sun': prediction += `- அரசு வழி ஆதாயம், தந்தை வழி உறவு மேம்பாடு, நிர்வாகத் திறன் வெளிப்படும்.\n`; break;
            case 'Moon': prediction += `- மன அமைதி, பயணம், உணவு சார்ந்த தொழிலில் ஆர்வம், இடமாற்றம்.\n`; break;
            case 'Mars': prediction += `- சகோதர வழி ஆதரவு, தைரியம், பூமி/சொத்து சேர்க்கை, தொழில்நுட்பத் துறையில் வெற்றி.\n`; break;
            case 'Mercury': prediction += `- வியாபார விருத்தி, கல்வி, புதிய நண்பர்கள், நுட்பமான அறிவு வெளிப்படும்.\n`; break;
            case 'Jupiter': prediction += `- பணவரவு, குழந்தை பாக்கியம், ஆன்மீக சிந்தனை, பெரியோர்கள் ஆசி.\n`; break;
            case 'Venus': prediction += `- வாகனம் வாங்குதல், திருமணம், ஆபரணச் சேர்க்கை, உல்லாசப் பயணங்கள்.\n`; break;
            case 'Saturn': prediction += `- தொழில் முன்னேற்றம் (கடின உழைப்புக்கு பின்), பொறுப்புகள் அதிகரிக்கும், நீண்ட கால முதலீடுகள்.\n`; break;
            case 'Rahu': prediction += `- வெளிநாட்டு பயணம், திடீர் அதிர்ஷ்டம், புதிய அனுபவங்கள் (கவனமுடன் இருக்கவும்).\n`; break;
            case 'Ketu': prediction += `- ஞானம், ஆன்மீகம், மருத்துவ செலவுகள் அல்லது மருத்துவத் துறையில் ஈடுபாடு.\n`; break;
        }
    } else {
        prediction += `\n**Expected Outcomes:**\n`;
        switch (planetName) {
            case 'Sun': prediction += `- Gains from government, better relationship with father, administrative skills will shine.\n`; break;
            case 'Moon': prediction += `- Peace of mind, travel, interest in food/liquid industries, change of place.\n`; break;
            case 'Mars': prediction += `- Support from siblings, courage, acquisition of land/property, success in technical fields.\n`; break;
            case 'Mercury': prediction += `- Business growth, education, networking, analytical skills will be highlighted.\n`; break;
            case 'Jupiter': prediction += `- Wealth accumulation, progeny (children), spiritual inclination, blessings from elders.\n`; break;
            case 'Venus': prediction += `- Buying vehicles, marriage/relationships, jewelry, luxury travel.\n`; break;
            case 'Saturn': prediction += `- Career growth (after hard work), increased responsibilities, long-term investments.\n`; break;
            case 'Rahu': prediction += `- Foreign travel, sudden luck, unconventional experiences (stay cautious).\n`; break;
            case 'Ketu': prediction += `- Wisdom, spirituality, detachment, medical involvement or expenses.\n`; break;
        }
    }

    // 5. Final Verdict
    if (isTamil) {
        if (score < 40) {
            prediction += `\n**பரிகாரம்:** முறையான வழிபாடும், தியானமும் இந்த காலத்தில் ஏற்படும் தடைகளை குறைக்க உதவும்.`;
        } else {
            prediction += `\n**முடிவு:** இது ஒரு முன்னேற்றமான காலகட்டமாக இருக்கும். வாய்ப்புகளை சரியாக பயன்படுத்திக் கொள்ளவும்.`;
        }
    } else {
        if (score < 40) {
            prediction += `\n**Remedy:** Regular prayers and meditation will help minimize obstacles during this period.`;
        } else {
            prediction += `\n**Verdict:** This will be a progressive period. Make good use of the opportunities.`;
        }
    }

    return prediction;
};
