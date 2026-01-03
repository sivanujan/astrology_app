import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Star, ChevronDown, ChevronUp, Briefcase, Heart,
    Zap, Activity, Sparkles, Clock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ForecastDayCardProps {
    date: Date;
    dayName: string; // e.g. "Monday"
    fullDate: string; // e.g. "Jan 12 2026"
    verdict: string;
    score: number; // 0-5 or 0-100
    dasa: string; // "Saturn-Venus"
    prediction: string;
    keyFactors: string[];
    // Extended Data
    lifeAreas?: {
        career: number;
        finance: number;
        health: number;
        relationships: number;
    };
    aiPrediction?: string;
    isGeneratingAI?: boolean;
    luckyTime?: string;
    nakshatra?: string;
}

const ForecastDayCard: React.FC<ForecastDayCardProps> = ({
    date,
    dayName,
    fullDate,
    verdict,
    score,
    dasa,
    prediction,
    keyFactors,
    lifeAreas,
    aiPrediction,
    isGeneratingAI,
    luckyTime,
    nakshatra
}) => {
    const { language } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);

    // Normalize score to 0-5 scale if it comes as percentage
    const normalizedScore = score > 5 ? Math.round(score / 20) : score;

    // Determine color scheme based on score/verdict
    const getColorScheme = () => {
        // Normalize verdict to lowercase for checking
        const v = verdict.toLowerCase();

        // Danger / Red
        if (v.includes('danger') || v.includes('ஆபத்து') || normalizedScore <= 1) return 'red';

        // Caution / Orange
        if (v.includes('caution') || v.includes('எச்சரிக்கை') || normalizedScore <= 2) return 'orange';

        // Average / Yellow
        if (v.includes('average') || v.includes('சராசரி') || v.includes('moderate') || normalizedScore === 3) return 'yellow';

        // Good / Blue
        if (v.includes('good') || v.includes('நன்று') || normalizedScore === 4) return 'green';

        // Excellent / Green
        if (v.includes('excellent') || v.includes('மிகச்சிறப்பு') || normalizedScore >= 5) return 'green';

        return 'slate';
    };

    const color = getColorScheme();
    const borderClass = `border-${color}-500/30`;
    const bgClass = `bg-${color}-500/10`;
    const textClass = `text-${color}-400`;

    // Render Stars
    const renderStars = () => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`w-3 h-3 ${s <= normalizedScore ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <motion.div
            layout
            className={`glass-panel mb-4 overflow-hidden border ${isExpanded ? 'border-purple-500/50' : 'border-slate-700/50'}`}
        >
            {/* SUMMARY HEADER (Clickable) */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors grid grid-cols-12 gap-4 items-center"
            >
                {/* Date Col */}
                <div className="col-span-3 md:col-span-2 text-center border-r border-slate-700/50 pr-2">
                    <div className="text-xs uppercase font-bold text-slate-400">{dayName.substring(0, 3)}</div>
                    <div className="text-xl font-bold">{date.getDate()}</div>
                </div>

                {/* Info Col */}
                <div className="col-span-7 md:col-span-8">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${bgClass} ${textClass}`}>
                            {verdict}
                        </span>
                        {renderStars()}
                    </div>
                    <div className="text-sm text-slate-300 line-clamp-1">
                        {prediction}
                    </div>
                </div>

                {/* Action Col */}
                <div className="col-span-2 md:col-span-2 flex justify-end">
                    {isExpanded ? (
                        <ChevronUp className="text-slate-400 w-5 h-5" />
                    ) : (
                        <ChevronDown className="text-slate-400 w-5 h-5" />
                    )}
                </div>
            </div>

            {/* EXPANDED CONTENT */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-700/50 bg-slate-900/40"
                    >
                        <div className="p-4 space-y-6">

                            {/* 1. Life Areas Grid */}
                            {lifeAreas && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="bg-blue-500/20 p-2 rounded-full text-blue-400"><Briefcase size={16} /></div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Career</div>
                                            <div className="text-base font-bold text-slate-100">{lifeAreas.career}%</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="bg-green-500/20 p-2 rounded-full text-green-400"><Zap size={16} /></div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Finance</div>
                                            <div className="text-base font-bold text-slate-100">{lifeAreas.finance}%</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="bg-red-500/20 p-2 rounded-full text-red-400"><Heart size={16} /></div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Health</div>
                                            <div className="text-base font-bold text-slate-100">{lifeAreas.health}%</div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="bg-purple-500/20 p-2 rounded-full text-purple-400"><Activity size={16} /></div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Relations</div>
                                            <div className="text-base font-bold text-slate-100">{lifeAreas.relationships}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Key Details */}
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-yellow-400" />
                                    <span>Lucky Time: <span className="text-slate-200 font-medium">{luckyTime || '-'}</span></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-purple-400" />
                                    <span>Nakshatra: <span className="text-slate-200 font-medium">{nakshatra || '-'}</span></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Sparkles size={14} className="text-blue-400" />
                                    <span>Dasa: <span className="text-slate-200 font-medium">{dasa}</span></span>
                                </div>
                            </div>

                            {/* 3. AI Forecast */}
                            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                                <h4 className="flex items-center gap-2 font-bold mb-3 text-purple-300">
                                    <Sparkles size={16} />
                                    {language === 'ta' ? 'AI கணிப்பு' : 'AI Forecast'}
                                </h4>
                                {isGeneratingAI ? (
                                    <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                        Generating personalized insights...
                                    </div>
                                ) : aiPrediction ? (
                                    <div className="text-slate-300 text-sm leading-relaxed space-y-2">
                                        {aiPrediction.split('. ').map((sentence, idx) => (
                                            <p key={idx} className="flex gap-2">
                                                <span className="text-purple-500 mt-1">•</span>
                                                <span>{sentence}.</span>
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-500 text-sm italic">
                                        Prediction unavailable
                                    </div>
                                )}
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ForecastDayCard;
