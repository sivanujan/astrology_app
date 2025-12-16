import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Sparkles, Loader, Briefcase, Heart, MessageCircle, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits
} from '../utils/astrology';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import {
    predictJobTiming,
    predictDetailedMarriageTiming,
    predictMarriageType,
    predictCareerPath,
    predictForeignTravel
} from '../utils/predictionRules';
import { queryAstrologyOrchestrator, OrchestratorResponse } from '../utils/aiOrchestrator';
import { useAuth } from '../contexts/AuthContext';
import { predictionService, generateChartId } from '../services/predictionService';
import { generatePDF } from '../utils/pdfGenerator';

interface GurujiPredictionsProps {
    data: any;
}

const GurujiPredictions: React.FC<GurujiPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [aiResponse, setAiResponse] = useState<OrchestratorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!data) return null;

    const { planets, ascendant, birthDate } = data;
    const isTamil = language === 'ta';

    // Calculations
    const moon = planets.find((p: any) => p.name === 'Moon');
    if (!moon) return <div className="text-center p-8 text-slate-400">{isTamil ? "சந்திரன் நிலை காணப்படவில்லை." : "Moon position not found."}</div>;

    const dashaPeriods = calculateDashaPeriods(new Date(birthDate), moon.longitude);
    const currentDasha = getCurrentDasha(dashaPeriods);
    const transits = calculateCurrentTransits();
    const agScores = calculateAdityaGurujiSubathuvam(planets);

    if (!currentDasha) return <div className="text-center p-8 text-slate-400">{isTamil ? "தசை காலங்களை கணக்கிட முடியவில்லை." : "Unable to calculate Dasa periods."}</div>;

    // --- Rule Based Answers ---
    const jobPrediction = predictJobTiming(currentDasha, transits, ascendant.signIndex, moon.signIndex, planets, language);
    const foreignTravel = predictForeignTravel(planets, ascendant.signIndex, moon.signIndex, agScores, currentDasha, language);
    const marriageTiming = predictDetailedMarriageTiming(currentDasha, transits, ascendant.signIndex, moon.signIndex, planets, new Date(birthDate), 'male', dashaPeriods, language);
    const marriageType = predictMarriageType(planets, ascendant.signIndex, agScores, currentDasha, language);
    const careerPath = predictCareerPath(planets, ascendant.signIndex, agScores, currentDasha, language);

    // Prepare data for AI
    const chartData = {
        planets,
        ascendant,
        subathuvamScores: agScores,
        currentDasa: currentDasha
    };

    const fetchAnalysis = async (forceRecheck = false) => {
        if (!user) return; // Guard for no user (though likely protected route)

        setIsLoading(true);
        setError('');

        try {
            const chartId = generateChartId({ name: data.userDetails.name }, birthDate, language);

            // 1. Check Cache first (if not forcing recheck)
            if (!forceRecheck) {
                const cached = await predictionService.getStoredPrediction(user.uid, chartId);
                if (cached && cached.data) {
                    console.log("Loaded prediction from cache");
                    setAiResponse(cached.data);
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Fallback to API
            const question = isTamil ? "முழுமையான பாவக பகுப்பாய்வு தாருங்கள்" : "Give me a comprehensive house-by-house analysis";
            const response = await queryAstrologyOrchestrator(question, chartData, language);

            // 3. Save to Cache
            if (response && response.bava_analysis_report) {
                await predictionService.savePrediction(user.uid, chartId, response, language);
            }

            setAiResponse(response);

        } catch (err: any) {
            console.error("Prediction Error:", err);
            const errorMessage = err.message || "Failed to generate predictions";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch comprehensive analysis on mount
    useEffect(() => {
        if (user) {
            fetchAnalysis();
        }
    }, [language, user]);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleDownloadPDF = () => {
        if (!data) return;
        const pdfData = {
            ...data,
            housePredictions: aiResponse?.bava_analysis_report?.house_predictions
        };
        generatePDF(pdfData, language);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    {isTamil ? "எங்கள் கணிப்புகள்" : "Our Predictions"}
                </h2>
                <div className="flex justify-center items-center gap-4 mt-2">
                    <p className="text-slate-400">
                        {isTamil
                            ? "விதிமுறை அடிப்படையிலான கேள்விகள் மற்றும் பாவக பகுப்பாய்வு."
                            : "Rule-based answers and comprehensive house analysis."}
                    </p>

                    {/* Recheck Button */}
                    <button
                        onClick={() => fetchAnalysis(true)}
                        disabled={isLoading}
                        className="text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full border border-slate-700 transition"
                        title={isTamil ? "மீண்டும் ஆய்வு செய்" : "Force Re-analysis"}
                    >
                        <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isTamil ? "புதுப்பி" : "Recheck"}
                    </button>

                    {/* Download PDF Button */}
                    <button
                        onClick={handleDownloadPDF}
                        className="text-sm flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full border border-slate-700 transition"
                        title={isTamil ? "PDF பதிவிறக்கம்" : "Download PDF"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        {isTamil ? "PDF" : "PDF"}
                    </button>
                </div>
            </motion.div>

            {/* --- Lagna Summary (Moved Top) --- */}
            {aiResponse?.bava_analysis_report && (
                <div className="glass-panel p-6 border border-purple-800/30 bg-purple-900/10 mb-8">
                    <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        {isTamil ? "லக்னா சுருக்கம்" : "Lagna Summary"}
                    </h3>
                    <p className="text-slate-200 leading-relaxed font-medium">
                        {aiResponse.bava_analysis_report.lagna_summary}
                    </p>
                </div>
            )}

            {/* --- Key Life Answers (Grid) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">

                {/* 1. Job Timing */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 border-l-4 border-blue-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                        <Briefcase className="w-24 h-24 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-200 mb-2 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {jobPrediction.question}
                    </h3>
                    <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line">
                        {jobPrediction.answer}
                    </p>
                    <div className="text-xs text-blue-400 italic border-t border-blue-900/30 pt-2">
                        {isTamil ? "காரணம்:" : "Reasoning:"} {jobPrediction.reason}
                    </div>
                </motion.div>

                {/* 2. Foreign Settlement (New - Top Right) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12 }}
                    className="glass-panel p-6 border-l-4 border-indigo-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                        <Globe className="w-24 h-24 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-indigo-200 mb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {foreignTravel.question}
                    </h3>
                    <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line">
                        {foreignTravel.answer}
                    </p>
                    <div className="text-xs text-indigo-400 italic border-t border-indigo-900/30 pt-2">
                        {isTamil ? "காரணம்:" : "Reasoning:"} {foreignTravel.reason}
                    </div>
                </motion.div>

                {/* 3. Career Path */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="glass-panel p-6 border-l-4 border-cyan-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                        <Briefcase className="w-24 h-24 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-cyan-200 mb-2 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {careerPath.question}
                    </h3>
                    <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line">
                        {careerPath.answer}
                    </p>
                    <div className="text-xs text-cyan-400 italic border-t border-cyan-900/30 pt-2">
                        {isTamil ? "காரணம்:" : "Reasoning:"} {careerPath.reason}
                    </div>
                </motion.div>

                {/* 4. Marriage Timing */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 border-l-4 border-pink-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                        <Heart className="w-24 h-24 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-bold text-pink-200 mb-2 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        {marriageTiming.question}
                    </h3>
                    <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line">
                        {marriageTiming.answer}
                    </p>
                    <div className="text-xs text-pink-400 italic border-t border-pink-900/30 pt-2">
                        {isTamil ? "காரணம்:" : "Reasoning:"} {marriageTiming.reason}
                    </div>
                </motion.div>

                {/* 5. Marriage Type */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-6 border-l-4 border-purple-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition"
                >
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                        <Sparkles className="w-24 h-24 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-200 mb-2 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {marriageType.question}
                    </h3>
                    <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line">
                        {marriageType.answer}
                    </p>
                    <div className="text-xs text-purple-400 italic border-t border-purple-900/30 pt-2">
                        {isTamil ? "காரணம்:" : "Reasoning:"} {marriageType.reason}
                    </div>
                </motion.div>
            </div>


            {/* Existing House Analysis (Kept as per implicit request, assuming user meant only remove verdict) */}
            {isLoading && (
                <div className="text-center p-12 glass-panel mt-8">
                    <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />
                    <p className="text-slate-300">{isTamil ? "பகுப்பாய்வு செய்யப்படுகிறது..." : "Analyzing your chart..."}</p>
                </div>
            )}

            {error && (
                <div className="text-center p-8 glass-panel border border-red-800/30 bg-red-900/10 mt-8">
                    <p className="text-red-400">{error}</p>
                    <button
                        onClick={() => fetchAnalysis(true)}
                        className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 transition"
                    >
                        {isTamil ? "மீண்டும் முயற்சி" : "Retry"}
                    </button>
                </div>
            )}

            {aiResponse?.bava_analysis_report && (
                <div className="space-y-6 mt-8">
                    {/* Lagna Summary - MOVED TO TOP */}

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
                </div>
            )}

            {/* Ask AI Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
            >
                <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
                    <button
                        onClick={() => navigate('/predictions')}
                        className="px-8 py-4 bg-slate-950 rounded-full flex items-center gap-3 text-lg font-bold text-white hover:bg-slate-900 transition-all group"
                    >
                        <MessageCircle className="w-6 h-6 text-purple-400 group-hover:text-pink-400 transition-colors" />
                        {isTamil ? "AI ஜோதிடரிடம் மேலும் கேட்கவும்" : "Ask More Questions via AI"}
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded ml-2 border border-purple-500/30">
                            {isTamil ? "புதியது" : "NEW"}
                        </span>
                    </button>
                </div>
                <p className="text-slate-500 text-sm mt-3">
                    {isTamil
                        ? "உங்கள் ஜாதகம் பற்றிய தனிப்பட்ட கேள்விகளுக்கு AI உடன் பேசுங்கள்."
                        : "Chat with our AI Astrologer for personalized insights and remedies."}
                </p>
            </motion.div>
        </div>
    );
};

export default GurujiPredictions;
