import React from 'react';
import { Activity, Star, Info, Crown, AlertTriangle } from 'lucide-react';
import { PLANET_UNICODE } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface SubathuvamAnalysisProps {
    planets: any[];
    planetScores: Record<string, {
        subathuvam: { score: number; details: string[] };
        pavathuvam: { score: number; details: string[] };
    }>;
}

const SubathuvamAnalysis: React.FC<SubathuvamAnalysisProps> = ({ planets, planetScores }) => {
    const { language, t } = useLanguage();

    const getScoreLabel = (score: number, type: 'subathuvam' | 'pavathuvam') => {
        if (score === 0) return language === 'ta' ? 'இல்லை' : 'None';
        if (score < 25) return language === 'ta' ? 'குறைவு' : 'Low';
        if (score < 50) return language === 'ta' ? 'மிதமானது' : 'Moderate';
        if (score < 75) return language === 'ta' ? 'நன்று' : 'Good';
        return language === 'ta' ? 'மிகவும் நன்று' : 'Excellent';
    };

    return (
        <div className="glass-panel p-6 mt-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                            {t.subathuvam.title}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {language === 'ta' ? 'கிரகங்களின் நன்மை மற்றும் தீமை வலிமை பகுப்பாய்வு' : 'Analysis of beneficial vs malefic strength of planets'}
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                        <span className="text-green-300">{language === 'ta' ? 'சுபத்துவம் (நன்மை)' : 'Subathuvam (Beneficial)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        <span className="text-red-300">{language === 'ta' ? 'பாவத்துவம் (தீமை)' : 'Pavathuvam (Malefic)'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planets.map((planet) => {
                    const scores = planetScores[planet.name];
                    if (!scores) return null;

                    const subScore = Math.min(scores.subathuvam.score, 100);
                    const pavScore = Math.min(scores.pavathuvam.score, 100);
                    const totalScore = subScore + pavScore;
                    const subPercent = totalScore > 0 ? (subScore / totalScore) * 100 : 0;

                    // Interpretive Status
                    const isBenefic = subScore > pavScore;
                    const statusColor = isBenefic ? 'text-green-400' : 'text-red-400';

                    return (
                        <div key={planet.name} className="relative bg-slate-900/40 p-5 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/40 transition-all group overflow-hidden">
                            {/* Background Glow based on Dominant Energy */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isBenefic ? 'from-green-500/10' : 'from-red-500/10'} to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`}></div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl filter drop-shadow-lg">
                                        {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-200">
                                            {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                        </h4>
                                        <p className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                            {isBenefic
                                                ? (language === 'ta' ? 'நன்மை அதிகம்' : 'Benefic Dominant')
                                                : (language === 'ta' ? 'தீமை அதிகம்' : 'Malefic Dominant')}
                                        </p>
                                    </div>
                                </div>

                                {isBenefic ? <Crown className="w-5 h-5 text-green-500/50" /> : <AlertTriangle className="w-5 h-5 text-red-500/50" />}
                            </div>

                            <div className="space-y-4 relative z-10">
                                {/* Subathuvam Bar */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-xs font-bold text-green-400 uppercase tracking-wide flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            {language === 'ta' ? 'சுபத்துவம்' : 'Subathuvam'}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-green-300">{subScore}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out"
                                            style={{ width: `${subScore}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 text-right">
                                        {getScoreLabel(subScore, 'subathuvam')}
                                    </p>
                                </div>

                                {/* Pavathuvam Bar */}
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {language === 'ta' ? 'பாவத்துவம்' : 'Pavathuvam'}
                                        </span>
                                        <span className="text-sm font-mono font-bold text-red-300">{pavScore}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out"
                                            style={{ width: `${pavScore}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 text-right">
                                        {getScoreLabel(pavScore, 'pavathuvam')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Internal icon for Sparkles to avoid import error if Lucide version mismatch 
// (Wait, I imported Sparkles at top, so it should be fine if available. If not, I'll fallback or remove)
import { Sparkles } from 'lucide-react';

export default SubathuvamAnalysis;
