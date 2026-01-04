import React, { useState } from 'react';
import { Award, ChevronDown, ChevronUp, Star, Info } from 'lucide-react';
import { PLANET_UNICODE } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AdityaGurujiAnalysisProps {
    planets: any[];
    agScores: Record<string, any>;
}

const AdityaGurujiAnalysis: React.FC<AdityaGurujiAnalysisProps> = ({ planets, agScores }) => {
    const { language, t } = useLanguage();
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="glass-panel p-6 mt-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Award className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        {/* Using a generic name or the specific methodology title */}
                        <h3 className="text-xl font-bold text-amber-100">
                            {language === 'ta' ? 'ஆதித்ய குருஜி சுபத்துவ முறை' : 'Aditya Guruji Subathuvam Method'}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {language === 'ta' ? 'துல்லியமான பலன் அறியும் முறை' : 'Advanced Subathuvam Calculation System'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"
                >
                    {showDetails ? (language === 'ta' ? 'விவரங்களை மறை' : 'Hide Calculations') : (language === 'ta' ? 'விவரங்களைக் காட்டு' : 'Show Calculations')}
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="p-4 rounded-tl-lg">{t.analysis?.table?.planet || 'Planet'}</th>
                            <AnimatePresence>
                                {showDetails && (
                                    <>
                                        <motion.th initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="p-4 text-center whitespace-nowrap">Rasi Score</motion.th>
                                        <motion.th initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="p-4 text-center whitespace-nowrap">Navamsa Score</motion.th>
                                    </>
                                )}
                            </AnimatePresence>
                            <th className="p-4 text-center whitespace-nowrap">Total Score</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center rounded-tr-lg">{language === 'ta' ? 'சூட்சும வலு' : 'Sookshma Valu'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {planets.map((planet) => {
                            const pScore = agScores[planet.name];
                            if (!pScore) return null;

                            return (
                                <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 font-medium relative">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl filter drop-shadow opacity-80 group-hover:scale-110 transition-transform">
                                                {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                            </span>
                                            <div>
                                                <div className="text-slate-200 font-bold">
                                                    {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                </div>
                                                {/* Conditional Details shown as tooltip or subtext only if expanded */}
                                                {showDetails && pScore.details.length > 0 && (
                                                    <div className="text-[10px] text-slate-500 mt-1 max-w-[150px]">
                                                        {pScore.details.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <AnimatePresence>
                                        {showDetails && (
                                            <>
                                                <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 text-center text-slate-400 font-mono text-sm">{pScore.rasiScore}</motion.td>
                                                <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 text-center text-slate-400 font-mono text-sm">{pScore.navamsaScore}</motion.td>
                                            </>
                                        )}
                                    </AnimatePresence>

                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 ${pScore.totalScore >= 50
                                                ? 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {pScore.totalScore}
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {pScore.isSubathuva ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                    {language === 'ta' ? 'சுபத்துவம்' : 'Subathuva'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                                    Normal
                                                </span>
                                            )}

                                            {/* Neutral Tag if applicable */}
                                            {pScore.isNeutral && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-900/30 text-blue-300 border border-blue-700/30">
                                                    Neutral
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-4 text-center">
                                        {pScore.hasSookshmaValu ? (
                                            <div className="group/tooltip relative inline-block">
                                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400/20 animate-[spin_5s_linear_infinite]" />
                                                {/* Tooltip for reason */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-xs text-slate-300 rounded-lg border border-slate-700 shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 pointer-events-none">
                                                    <div className="font-bold text-yellow-400 mb-1">Reason:</div>
                                                    {pScore.sookshmaValuReason || 'Special Strength'}
                                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-700">-</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>
                    {language === 'ta'
                        ? 'குறிப்பு: 50க்கும் மேற்பட்ட மதிப்பெண் பெற்ற கிரகங்கள் தங்கள் தசா புத்தியில் நற்பலன்களைத் தரும்.'
                        : 'Note: Planets with score > 50 are considered Benefic and will deliver good results during their Dasa periods.'}
                </span>
            </div>
        </div>
    );
};

export default AdityaGurujiAnalysis;
