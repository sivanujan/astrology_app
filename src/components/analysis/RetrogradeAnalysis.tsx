import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Activity, AlertTriangle, RotateCw, Info, Calendar } from 'lucide-react';
import { PLANET_UNICODE } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface RetrogradeAnalysisProps {
    planets: any[];
}

const RetrogradeAnalysis: React.FC<RetrogradeAnalysisProps> = ({ planets }) => {
    const { language, t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSection = () => setIsExpanded(!isExpanded);

    const retrogradePlanets = planets.filter(p => p.isRetro);
    const hasRetrograde = retrogradePlanets.length > 0;

    return (
        <div className="glass-panel overflow-hidden mt-6 border border-slate-700/50 shadow-xl">
            <button
                onClick={toggleSection}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg relative">
                        <Activity className={`w-5 h-5 ${hasRetrograde ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                        {hasRetrograde && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-200 to-pink-200">
                            {language === 'ta' ? 'வக்ர கிரகங்கள் (Retrograde)' : 'Retrograde Analysis'}
                        </h3>
                        <p className="text-xs text-slate-400 text-left">
                            {hasRetrograde
                                ? (language === 'ta' ? `${retrogradePlanets.length} கிரகங்கள் வக்ரம்` : `${retrogradePlanets.length} Planets in Retrograde`)
                                : (language === 'ta' ? 'வக்ர கிரகங்கள் இல்லை' : 'No Retrograde Planets')}
                        </p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="p-6 text-slate-300"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Current Status Cards */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <RotateCw className="w-4 h-4" />
                                    {language === 'ta' ? 'தற்போதைய நிலை' : 'Current Status'}
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    {planets.map((planet) => {
                                        if (['Sun', 'Moon', 'Rahu', 'Ketu'].includes(planet.name)) return null;

                                        const isRetro = planet.isRetro;

                                        return (
                                            <div
                                                key={planet.name}
                                                className={`relative p-4 rounded-xl border transition-all duration-300 ${isRetro
                                                        ? 'bg-red-900/10 border-red-500/50 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                                        : 'bg-slate-800/40 border-slate-700 hover:border-green-500/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="text-4xl filter drop-shadow-lg">
                                                        {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isRetro
                                                            ? 'bg-red-500 text-white animate-pulse'
                                                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        }`}>
                                                        {isRetro
                                                            ? (language === 'ta' ? 'வக்ரம்' : 'RETRO')
                                                            : (language === 'ta' ? 'நேர்கதி' : 'DIRECT')}
                                                    </span>
                                                </div>
                                                <div className="mt-3">
                                                    <h5 className="font-bold text-slate-200">
                                                        {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                    </h5>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {isRetro
                                                            ? (language === 'ta' ? 'மெதுவான இயக்கம்' : 'Slower movement')
                                                            : (language === 'ta' ? 'சீரான இயக்கம்' : 'Steady movement')}
                                                    </p>
                                                </div>

                                                {/* Pulse Effect Background for Retro */}
                                                {isRetro && (
                                                    <div className="absolute inset-0 bg-red-500/5 rounded-xl animate-pulse pointer-events-none"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Column: Timeline & Info */}
                            <div className="space-y-6">
                                {/* Educational Card */}
                                <div className="bg-slate-800/60 p-5 rounded-xl border border-blue-500/20 relative overflow-hidden">
                                    <div className="absolute -right-6 -top-6 text-blue-500/10">
                                        <Info className="w-32 h-32" />
                                    </div>
                                    <h4 className="flex items-center gap-2 font-bold text-blue-300 mb-2 relative z-10">
                                        <Info className="w-4 h-4" />
                                        {language === 'ta' ? 'வக்ரம் என்றால் என்ன?' : 'What is Retrograde?'}
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                                        {language === 'ta'
                                            ? 'பூமியிலிருந்து பார்க்கும்போது, ஒரு கிரகம் பின்னோக்கி நகர்வது போல் தோன்றுவது வக்ரம். இது கர்ம வினை மற்றும் மறுபரிசீலனையை குறிக்கிறது.'
                                            : 'An optical illusion where a planet appears to move backward from Earth. It signifies reviewing past actions, karmic lessons, and introspection.'}
                                    </p>
                                </div>

                                {/* Cycle Timeline Visuals */}
                                <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-4">
                                        <Calendar className="w-4 h-4 text-orange-400" />
                                        {language === 'ta' ? 'வக்ர கால சுழற்சிகள்' : 'Retrograde Cycles'}
                                    </h4>

                                    <div className="space-y-4">
                                        {/* Mercury Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-300">
                                                <span>Mercury (☿)</span>
                                                <span className="text-slate-500">3-4 times/year</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-slate-700 w-[20%]"></div>
                                                <div className="h-full bg-orange-400 w-[15%]" title="Retrograde"></div>
                                                <div className="h-full bg-slate-700 w-[20%]"></div>
                                                <div className="h-full bg-orange-400 w-[15%]" title="Retrograde"></div>
                                                <div className="h-full bg-slate-700 w-[20%]"></div>
                                                <div className="h-full bg-orange-400 w-[10%]" title="Retrograde"></div>
                                            </div>
                                        </div>

                                        {/* Venus Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-300">
                                                <span>Venus (♀)</span>
                                                <span className="text-slate-500">Every 1.5 years</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-slate-700 w-[80%]"></div>
                                                <div className="h-full bg-pink-400 w-[20%]" title="Retrograde"></div>
                                            </div>
                                        </div>

                                        {/* Mars Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-300">
                                                <span>Mars (♂)</span>
                                                <span className="text-slate-500">Every 2 years</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-slate-700 w-[90%]"></div>
                                                <div className="h-full bg-red-500 w-[10%]" title="Retrograde (Rare)"></div>
                                            </div>
                                        </div>

                                        {/* Jupiter/Saturn Bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-300">
                                                <span>Jupiter/Saturn</span>
                                                <span className="text-slate-500">Every year (4-5 months)</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-slate-700 w-[60%]"></div>
                                                <div className="h-full bg-purple-400 w-[40%]" title="Retrograde (Long)"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-4 text-[10px] text-slate-500 justify-end">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                                            <span>Direct</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                            <span>Retrograde</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RetrogradeAnalysis;
