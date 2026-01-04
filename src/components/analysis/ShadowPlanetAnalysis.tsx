import React from 'react';
import { Ghost, Orbit, AlertOctagon, HelpCircle } from 'lucide-react';
import { PLANET_UNICODE } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface ShadowPlanetAnalysisProps {
    rkResults: Record<string, any>;
}

const ShadowPlanetAnalysis: React.FC<ShadowPlanetAnalysisProps> = ({ rkResults }) => {
    const { language, t } = useLanguage();

    return (
        <div className="glass-panel p-6 mt-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700 rounded-lg">
                    <Ghost className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-200">
                        {language === 'ta' ? 'நிழல் கிரக ஆய்வு (ராகு-கேது)' : 'Shadow Planet Analysis (Rahu-Ketu)'}
                    </h3>
                    <p className="text-xs text-slate-400">
                        {language === 'ta' ? 'கர்ம வினைகளை அறியும் முறை' : 'Karmic Indicator Analysis'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Rahu', 'Ketu'].map((planetName) => {
                    const result = rkResults[planetName];
                    if (!result) return null;

                    // Theme Colors: Rahu (Smoky/Blue-Black), Ketu (Reddish/Brown)
                    // Visual simplified: Rahu -> Indigo/Purple, Ketu -> Red/Orange
                    const isRahu = planetName === 'Rahu';
                    const themeColor = isRahu ? 'indigo' : 'orange';
                    const borderColor = isRahu ? 'border-indigo-500/30' : 'border-orange-500/30';
                    const hoverBg = isRahu ? 'hover:bg-indigo-900/10' : 'hover:bg-orange-900/10';
                    const textColor = isRahu ? 'text-indigo-400' : 'text-orange-400';

                    return (
                        <div key={planetName} className={`relative bg-slate-900/40 p-6 rounded-xl border ${borderColor} ${hoverBg} transition-all duration-300 group overflow-hidden`}>
                            {/* Absorb element */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${themeColor}-500/10 rounded-full blur-3xl pointer-events-none`}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-lg ring-1 ring-${themeColor}-500/50`}>
                                        {PLANET_UNICODE[planetName as keyof typeof PLANET_UNICODE]}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-100">
                                            {language === 'ta' ? TAMIL_PLANET_NAMES[planetName] : planetName}
                                        </h4>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">
                                            {isRahu ? (language === 'ta' ? 'ஆசை காரகன்' : 'Reviewer of Desires') : (language === 'ta' ? 'மோட்ச காரகன்' : 'Reviewer of Liberation')}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-slate-500 mb-1">Total Strength</div>
                                    <div className={`text-2xl font-bold ${result.totalScore >= 50 ? 'text-green-400' : 'text-slate-400'}`}>
                                        {result.totalScore}<span className="text-sm font-normal text-slate-600">/100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                                <div className="p-2 bg-slate-900/50 rounded-lg">
                                    <div className="text-[10px] text-slate-500 uppercase">House</div>
                                    <div className="font-mono text-slate-300">{result.houseScore}</div>
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded-lg">
                                    <div className="text-[10px] text-slate-500 uppercase">Subathuva</div>
                                    <div className="font-mono text-slate-300">{result.subathuvamScore}</div>
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded-lg">
                                    <div className="text-[10px] text-slate-500 uppercase">Soodshuma</div>
                                    <div className="font-mono text-slate-300">{result.soodshumaScore}</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                                    <Orbit className={`w-5 h-5 ${textColor} mt-0.5 flex-shrink-0`} />
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {result.prediction}
                                    </p>
                                </div>

                                {result.details.length > 0 && (
                                    <div className="text-[10px] text-slate-500 pl-2 border-l border-slate-700">
                                        <span className="font-bold mr-1">Factors:</span>
                                        {result.details.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShadowPlanetAnalysis;
