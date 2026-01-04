import React from 'react';
import { Sparkles, MapPin, Briefcase, Heart, Skull, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SpecialPredictionsAnalysisProps {
    predictions: Array<{
        planet: string;
        type: string;
        prediction: string;
    }>;
}

const SpecialPredictionsAnalysis: React.FC<SpecialPredictionsAnalysisProps> = ({ predictions }) => {
    const { language, t } = useLanguage();

    const getPredictionIcon = (type: string) => {
        if (type.includes('Foreign')) return <MapPin className="w-5 h-5 text-blue-400" />;
        if (type.includes('Profession') || type.includes('Tech') || type.includes('Medical')) return <Briefcase className="w-5 h-5 text-purple-400" />;
        if (type.includes('Breakup') || type.includes('Conflict')) return <Heart className="w-5 h-5 text-red-400" />;
        if (type.includes('Digbala')) return <Zap className="w-5 h-5 text-yellow-400" />;
        if (type.includes('8th House') || type.includes('Dusthana')) return <AlertTriangle className="w-5 h-5 text-orange-400" />;
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    };

    const translateType = (type: string) => {
        if (language !== 'ta') return type;
        const types: Record<string, string> = {
            'Digbala (10th)': 'திக்பல (10வது)',
            'Progeny (Child Birth)': 'சந்ததி (குழந்தை பிறப்பு)',
            '8th House Subathuva': '8வது வீடு சுபத்துவம்',
            '8th House Affliction': '8வது வீடு துன்பம்',
            'Foreign Settlement': 'வெளிநாட்டு குடியேற்றம்',
            '6th House Subathuva': '6வது வீடு சுபத்துவம்',
            'Profession (Medical/Tech)': 'தொழில் (மருத்துவம்/தொழில்நுட்பம்)',
            'Lagna Lord in Dusthana': 'லக்னாதிபதி துஸ்தானங்களில்',
            'Afflicted Full Moon': 'பாதிக்கப்பட்ட பௌர்ணமி',
            'Breakup/Conflict Indicator': 'பிரிவு/மோதல் குறிகாட்டி',
            'Retrograde Benefic (Vakram)': 'வக்கிர சுப கிரகம்'
        };
        return types[type] || type;
    };

    const translatePlanet = (planet: string) => {
        if (language !== 'ta') return planet;
        const names: Record<string, string> = {
            'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்',
            'Mercury': 'புதன்', 'Jupiter': 'குரு', 'Venus': 'சுக்ரன்',
            'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
        };
        return names[planet] || planet;
    };

    if (predictions.length === 0) {
        return (
            <div className="glass-panel p-6 border border-slate-700/50 shadow-xl h-full flex flex-col items-center justify-center text-center">
                <Sparkles className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-slate-500 italic">
                    {language === 'ta' ? 'இந்த ஜாதகத்தில் சிறப்பு நிலைகள் இல்லை' : 'No significant special predictive combinations found.'}
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 border border-slate-700/50 shadow-xl h-full overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-indigo-100">
                        {language === 'ta' ? 'சிறப்பு கணிப்புகள்' : 'Special Predictions'}
                    </h3>
                    <p className="text-xs text-slate-400">
                        {language === 'ta' ? 'சுபத்துவம் அடிப்படையில்' : 'Based on Subathuvam Filter'}
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {predictions.map((pred, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/30 transition-all hover:bg-slate-800/40 group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 group-hover:border-slate-600">
                                {getPredictionIcon(pred.type)}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                                    {translateType(pred.type)}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                    {translatePlanet(pred.planet)}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed pl-10 border-l-2 border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                            {pred.prediction}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecialPredictionsAnalysis;
