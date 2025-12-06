import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits,
    calculateStrength
} from '../utils/astrology';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import {
    predictJobTiming,
    predictDetailedMarriageTiming,
    predictMarriageType,
    predictCareerPath
} from '../utils/predictionRules';

interface GurujiPredictionsProps {
    data: any;
}

const GurujiPredictions: React.FC<GurujiPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    if (!data) return null;

    const { planets, ascendant, birthDate, userDetails } = data;
    const isTamil = language === 'ta';

    // Calculations
    const moon = planets.find((p: any) => p.name === 'Moon');
    if (!moon) return <div className="text-center p-8 text-slate-400">{isTamil ? "சந்திரன் நிலை காணப்படவில்லை." : "Moon position not found."}</div>;

    const dashaPeriods = calculateDashaPeriods(moon.longitude, birthDate);
    const currentDasha = getCurrentDasha(dashaPeriods);
    const transits = calculateCurrentTransits();
    const agScores = calculateAdityaGurujiSubathuvam(planets);

    if (!currentDasha) return <div className="text-center p-8 text-slate-400">{isTamil ? "தசை காலங்களை கணக்கிட முடியவில்லை." : "Unable to calculate Dasa periods."}</div>;

    const predictions = [
        predictJobTiming(currentDasha, transits, ascendant.signIndex, moon.signIndex, planets, language),
        predictDetailedMarriageTiming(currentDasha, transits, ascendant.signIndex, moon.signIndex, planets, birthDate, userDetails?.gender || 'male', dashaPeriods, language),
        predictMarriageType(planets, ascendant.signIndex, agScores, currentDasha, language),
        predictCareerPath(planets, ascendant.signIndex, agScores, { maha: currentDasha.maha, bhukti: currentDasha.bhukti }, language)
    ];

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    {isTamil ? "அடிப்படை கேள்விகள் மற்றும் பதில்கள்" : "Basic Question and Answers"}
                </h2>
                <p className="text-slate-400 mt-2">
                    {isTamil
                        ? "ஆதித்ய குருஜியின் தனித்துவமான விதிகளின் அடிப்படையில் உங்கள் வாழ்க்கையின் மிக முக்கியமான கேள்விகளுக்கு நேரடி பதில்கள்."
                        : "Direct answers to your life's most important questions based on Aditya Guruji's unique rules."}
                </p>
            </motion.div>

            <div className="space-y-4">
                {predictions.map((pred, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`glass-panel overflow-hidden border transition-colors duration-300 ${expandedId === idx
                            ? 'border-purple-500/50 bg-slate-900/80'
                            : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/50'
                            }`}
                    >
                        <button
                            onClick={() => toggleExpand(idx)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${expandedId === idx ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <h3 className={`text-lg font-semibold ${expandedId === idx ? 'text-white' : 'text-slate-300'}`}>
                                    {pred.question}
                                </h3>
                            </div>
                            {expandedId === idx ? (
                                <ChevronUp className="w-5 h-5 text-purple-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-500" />
                            )}
                        </button>

                        <AnimatePresence>
                            {expandedId === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-6 pb-6 pt-2 border-t border-slate-800/50">
                                        <div className={`p-4 rounded-lg mb-4 ${pred.isFavorable
                                            ? 'bg-green-900/20 border border-green-900/30'
                                            : 'bg-yellow-900/20 border border-yellow-900/30'
                                            }`}>
                                            <span className={`text-sm font-bold uppercase tracking-wider ${pred.isFavorable ? 'text-green-400' : 'text-yellow-400'
                                                }`}>
                                                {isTamil ? "பதில்:" : "Answer:"}
                                            </span>
                                            <p className={`text-xl font-medium mt-1 whitespace-pre-line ${pred.isFavorable ? 'text-green-100' : 'text-yellow-100'
                                                }`}>
                                                {pred.answer}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                {isTamil ? "ஜோதிட காரணம்:" : "Astrological Reason:"}
                                            </span>
                                            <p className="text-slate-300 mt-1 italic leading-relaxed whitespace-pre-line">
                                                "{pred.reason}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default GurujiPredictions;
