import React from 'react';
import { Target, TrendingUp, AlertOctagon, CheckCircle, HelpCircle } from 'lucide-react';
import { PLANET_UNICODE } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface FinalPredictionCardsProps {
    planets: any[];
    yogaResults: Record<string, any>;
}

const FinalPredictionCards: React.FC<FinalPredictionCardsProps> = ({ planets, yogaResults }) => {
    const { language, t } = useLanguage();

    return (
        <div className="glass-panel p-6 mt-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Target className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-pink-100">
                        {language === 'ta' ? 'இறுதி கணிப்பு பலன்கள்' : 'Final Prediction Outcome'}
                    </h3>
                    <p className="text-xs text-slate-400">
                        {language === 'ta' ? 'திக்பலம் + சுபத்துவம் + ஆதிபத்திய அடிப்படையில்' : 'Based on Digbala + Subathuvam + Lordship'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {planets.map((planet) => {
                    if (['Rahu', 'Ketu'].includes(planet.name)) return null;

                    const result = yogaResults[planet.name];
                    if (!result) return null;

                    // Determine Card Style based on Status
                    let cardStyle = 'bg-slate-800/40 border-slate-700';
                    let statusColor = 'text-slate-400';
                    let icon = <HelpCircle className="w-5 h-5 text-slate-500" />;

                    // Logic from existing code
                    if (['Rajayogam', 'Jackpot', 'Good', 'Excellent'].includes(result.yogaStatus)) {
                        cardStyle = 'bg-green-900/10 border-green-500/30 hover:bg-green-900/20';
                        statusColor = 'text-green-400';
                        icon = <TrendingUp className="w-5 h-5 text-green-400" />;
                    } else if (['Dangerously Strong', 'Severe Trouble', 'Bad', 'Malefic'].includes(result.yogaStatus)) {
                        cardStyle = 'bg-red-900/10 border-red-500/30 hover:bg-red-900/20';
                        statusColor = 'text-red-400';
                        icon = <AlertOctagon className="w-5 h-5 text-red-400" />;
                    } else {
                        cardStyle = 'bg-blue-900/10 border-blue-500/30 hover:bg-blue-900/20';
                        statusColor = 'text-blue-300';
                        icon = <CheckCircle className="w-5 h-5 text-blue-300" />;
                    }

                    return (
                        <div key={planet.name} className={`p-5 rounded-xl border transition-all duration-300 group hover:shadow-lg ${cardStyle}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
                                        {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-200">
                                            {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                        </h4>
                                        {result.digbalaStatus !== 'None' && (
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                                {result.digbalaStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg bg-slate-900/50 border border-slate-800`}>
                                    {icon}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                                        {language === 'ta' ? 'முடிவு' : 'Outcome'}
                                    </div>
                                    <div className={`font-bold text-lg ${statusColor}`}>
                                        {result.yogaStatus}
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-sm text-slate-300 leading-relaxed">
                                    {result.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FinalPredictionCards;
