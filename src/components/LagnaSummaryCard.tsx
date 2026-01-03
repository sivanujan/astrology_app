import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, ArrowRight, Activity, Crown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LagnaSummaryCardProps {
    lagnaSummary: string;
    ascendantSign: string;
    ascendantLord: string;
    lagnaLordPosition: string; // e.g. "9th House"
    strengthScore: number;
    strengthDescription: string;
}

const LagnaSummaryCard: React.FC<LagnaSummaryCardProps> = ({
    lagnaSummary,
    ascendantSign,
    ascendantLord,
    lagnaLordPosition,
    strengthScore,
    strengthDescription
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 border border-purple-800/30 bg-gradient-to-br from-purple-900/20 to-slate-900/40 relative overflow-hidden"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Crown className="w-32 h-32 text-purple-400" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Key Stats */}
                    <div className="flex-shrink-0 w-full md:w-1/3 space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            {isTamil ? "லக்னா விவரம்" : "Lagna Profile"}
                        </h3>

                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                <div className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-1">
                                    {isTamil ? "லக்னம்" : "Ascendant"}
                                </div>
                                <div className="text-lg font-bold text-white">{ascendantSign}</div>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                <div className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-1">
                                    {isTamil ? "அதிபதி" : "Lagna Lord"}
                                </div>
                                <div className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sun className="w-4 h-4 text-orange-400" />
                                    {ascendantLord}
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 col-span-2 lg:col-span-1">
                                <div className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-1">
                                    {isTamil ? "அதிபதி நிலை" : "Position"}
                                </div>
                                <div className="text-lg font-bold text-white mb-2">{lagnaLordPosition}</div>

                                {/* Strength Bar */}
                                <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-1">
                                    <div
                                        className={`h-1.5 rounded-full ${strengthScore > 60 ? 'bg-green-500' : strengthScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(strengthScore, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">{isTamil ? "பலம்" : "Strength"}</span>
                                    <span className={strengthScore > 60 ? 'text-green-400' : strengthScore > 40 ? 'text-yellow-400' : 'text-red-400'}>
                                        {strengthDescription}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Narrative Summary */}
                    <div className="flex-grow border-l border-white/10 pl-0 md:pl-6 pt-4 md:pt-0">
                        <div className="mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold text-purple-200 uppercase tracking-wider">
                                {isTamil ? "முக்கிய பண்புகள்" : "Key Traits & Summary"}
                            </span>
                        </div>
                        <p className="text-slate-200 leading-relaxed text-sm md:text-base whitespace-pre-line">
                            {lagnaSummary}
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 italic">
                            <ArrowRight className="w-3 h-3 text-purple-400" />
                            {isTamil ? "உங்கள் ஜாதகத்தின் அடித்தளம் இதுவே." : "This forms the foundation of your chart analysis."}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LagnaSummaryCard;
