import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits
} from '../utils/astrology';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import { queryAstrologyOrchestrator, OrchestratorResponse } from '../utils/aiOrchestrator';

interface GurujiPredictionsProps {
    data: any;
}

const GurujiPredictions: React.FC<GurujiPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [aiResponse, setAiResponse] = useState<OrchestratorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    // Prepare data for AI
    const chartData = {
        planets,
        ascendant,
        subathuvamScores: agScores,
        currentDasa: currentDasha
    };

    // Auto-fetch comprehensive analysis on mount
    useEffect(() => {
        const fetchAnalysis = async () => {
            setIsLoading(true);
            setError('');
            try {
                const question = isTamil ? "முழுமையான பாவக பகுப்பாய்வு தாருங்கள்" : "Give me a comprehensive house-by-house analysis";
                const response = await queryAstrologyOrchestrator(question, chartData, language);
                setAiResponse(response);
            } catch (err: any) {
                setError(err.message || "Failed to generate predictions");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [language]); // Re-fetch when language changes

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    {isTamil ? "எங்கள் கணிப்புகள்" : "Our Predictions"}
                </h2>
                <p className="text-slate-400 mt-2">
                    {isTamil
                        ? "ஆதித்ய குருஜியின் பாவக பகுப்பாய்வு முறையின் அடிப்படையில் உங்கள் ஜாதக கணிப்புகள்."
                        : "Your chart predictions based on Aditya Guruji's house-by-house analysis method."}
                </p>
            </motion.div>

            {isLoading && (
                <div className="text-center p-12 glass-panel">
                    <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
                    <p className="text-slate-300">{isTamil ? "பகுப்பாய்வு செய்யப்படுகிறது..." : "Analyzing your chart..."}</p>
                </div>
            )}

            {error && (
                <div className="text-center p-8 glass-panel border border-red-800/30 bg-red-900/10">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {aiResponse?.bava_analysis_report && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Lagna Summary */}
                    <div className="glass-panel p-6 border border-purple-800/30 bg-purple-900/10">
                        <h3 className="text-xl font-bold text-purple-300 mb-3">
                            {isTamil ? "லக்னா சுருக்கம்" : "Lagna Summary"}
                        </h3>
                        <p className="text-slate-200 leading-relaxed">{aiResponse.bava_analysis_report.lagna_summary}</p>
                    </div>

                    {/* House Predictions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiResponse.bava_analysis_report.house_predictions.map((house, idx) => (
                            <motion.div
                                key={house.house_number}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`glass-panel overflow-hidden border transition-colors duration-300 ${expandedId === idx
                                    ? 'border-purple-500/50 bg-slate-900/80'
                                    : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/50'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleExpand(idx)}
                                    className="w-full px-4 py-4 flex items-center justify-between text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${house.status === 'Strong' || house.status === 'Excellent'
                                            ? 'bg-green-600/30 text-green-300'
                                            : house.status === 'Weak'
                                                ? 'bg-red-600/30 text-red-300'
                                                : 'bg-yellow-600/30 text-yellow-300'
                                            }`}>
                                            {house.house_number}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{house.title}</h3>
                                            <span className={`text-xs ${house.status === 'Strong' || house.status === 'Excellent'
                                                ? 'text-green-400'
                                                : house.status === 'Weak'
                                                    ? 'text-red-400'
                                                    : 'text-yellow-400'
                                                }`}>
                                                {house.status}
                                            </span>
                                        </div>
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
                                            <div className="px-4 pb-4 pt-2 border-t border-slate-800/50">
                                                <p className="text-slate-300 text-sm leading-relaxed mb-3">{house.analysis}</p>
                                                <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/30">
                                                    <span className="text-xs font-bold text-purple-400">{isTamil ? "குருஜி விதி:" : "Guruji Rule:"}</span>
                                                    <p className="text-xs text-slate-400 mt-1 italic">{house.guruji_rule_applied}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final Verdict */}
                    <div className="glass-panel p-6 border border-blue-800/30 bg-blue-900/10">
                        <h3 className="text-xl font-bold text-blue-300 mb-3">
                            {isTamil ? "இறுதி தீர்ப்பு" : "Final Verdict"}
                        </h3>
                        <p className="text-slate-200 leading-relaxed">{aiResponse.bava_analysis_report.final_verdict}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default GurujiPredictions;
