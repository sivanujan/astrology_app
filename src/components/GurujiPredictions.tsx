import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Sparkles, Loader, Briefcase, Heart, MessageCircle, Globe, Star, StarHalf, RotateCw, GraduationCap, Coins, Activity, Users, Home, Smile, ArrowRight, Clock, Zap, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits,
    DashaPeriod, PLANET_COLORS
} from '../utils/astrology';
import { format } from 'date-fns';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import { TAMIL_PLANET_NAMES, TAMIL_RASI_NAMES } from '../utils/translations';
import { DasaScoreSummary } from './DasaScoreSummary';
import DasaPeriodCard from './DasaPeriodCard';
import { generatePDF } from '../utils/pdfGenerator';
import {
    predictJobTiming,
    predictDetailedMarriageTiming,
    predictMarriageType,
    predictCareerPath,
    predictForeignTravel,
    predictCurrentLoveStatus,
    predictMarriageStatus,
    predictLifeQuality
} from '../utils/predictionRules';
import { queryAstrologyOrchestrator, OrchestratorResponse, translateAnalysisReport } from '../utils/aiOrchestrator';
import { useAuth } from '../contexts/AuthContext';
import { predictionService, generateChartId } from '../services/predictionService';
import { calculateDasaScore } from '../utils/dashaScoring';
import { generateDasaPrediction } from '../utils/dasaPredictionGenerator';



import DasaAnalysis from './DasaAnalysis';
import HouseAnalysisDashboard from './HouseAnalysisDashboard';
import { HouseData } from './HouseAnalysisCard';

interface GurujiPredictionsProps {
    data: any;
}

const GurujiPredictions: React.FC<GurujiPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState<'Maha' | 'Bhukti' | 'Antaram'>('Maha');
    const [viewingSpecificDetails, setViewingSpecificDetails] = useState<{
        planet: string,
        score: any,
        type: string,
        prediction: string
    } | null>(null);
    const [viewingDasa, setViewingDasa] = useState<{ maha: any, bhukti: any, antaram: any } | null>(null);
    const [aiResponse, setAiResponse] = useState<OrchestratorResponse | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0); // Progress counter state
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'houses' | 'questions' | 'dasha'>('questions'); // Default to questions or houses
    const isFetchingRef = useRef(false);

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

    // Calculate Current Dasa Score
    const currentMahaPlanet = planets.find((p: any) => p.name === currentDasha?.maha?.planet);

    const currentDasaScore = currentMahaPlanet ? calculateDasaScore(
        currentMahaPlanet.name,
        data // Pass full data as chart
    ) : null;

    if (!currentDasha) return <div className="text-center p-8 text-slate-400">{isTamil ? "தசை காலங்களை கணக்கிட முடியவில்லை." : "Unable to calculate Dasa periods."}</div>;

    // Helper Functions
    const getPlanetName = (name: string) => {
        return language === 'ta' ? TAMIL_PLANET_NAMES[name] : name;
    };

    const formatDate = (date: Date) => {
        try {
            if (!date || isNaN(date.getTime())) return 'Invalid Date';
            return format(date, 'dd MMM yyyy');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // --- Rule Based Answers (Enriched by AI) ---
    const rawJob = predictJobTiming(currentDasha, transits, ascendant.signIndex, moon.signIndex, planets, language);
    const rawForeign = predictForeignTravel(planets, ascendant.signIndex, moon.signIndex, agScores, currentDasha, language);
    const rawMarriageTime = predictDetailedMarriageTiming(currentDasha, transits, ascendant.signIndex, moon.signIndex, planets, new Date(birthDate), 'male', dashaPeriods, language);
    const rawMarriageType = predictMarriageType(planets, ascendant.signIndex, agScores, currentDasha, language);
    const rawCareer = predictCareerPath(planets, ascendant.signIndex, agScores, currentDasha, language);
    const rawLoveStatus = predictCurrentLoveStatus(planets, ascendant.signIndex, moon.signIndex, currentDasha, agScores, language); // New Prediction

    // Apply AI Refinements if available
    const jobPrediction = aiResponse?.life_guidance?.job_timing ? { ...rawJob, answer: aiResponse.life_guidance.job_timing.answer, reason: aiResponse.life_guidance.job_timing.reason } : rawJob;
    const foreignTravel = rawForeign; // Strictly use Rule-Based logic for Foreign Travel (User Requirement)
    const marriageTiming = aiResponse?.life_guidance?.marriage_timing ? { ...rawMarriageTime, answer: aiResponse.life_guidance.marriage_timing.answer, reason: aiResponse.life_guidance.marriage_timing.reason } : rawMarriageTime;
    const marriageType = aiResponse?.life_guidance?.marriage_type ? { ...rawMarriageType, answer: aiResponse.life_guidance.marriage_type.answer, reason: aiResponse.life_guidance.marriage_type.reason } : rawMarriageType;
    const careerPath = rawCareer; // Strictly use Rule-Based logic (New Guruji Rules Update)
    // Note: AI support for loveStatus is not yet in OrchestratorResponse interface, using raw for now or if user expands schema later.
    const loveStatus = rawLoveStatus;
    const marriageStatus = predictMarriageStatus(planets, ascendant.signIndex, currentDasha, new Date(birthDate), language);
    const lifeQuality = predictLifeQuality(planets, ascendant.signIndex, moon.signIndex, currentDasha, new Date(birthDate), agScores, language);

    // Prepare data for AI
    const chartData = {
        planets,
        ascendant,
        subathuvamScores: agScores,
        currentDasa: currentDasha,
        dashaPeriods, // Pass full periods for detailed prediction
        userDetails: {
            ...data.userDetails,
            uid: user?.uid // Inject UID for logging
        }
    };

    const fetchAnalysis = async (forceRecheck = false) => {
        if (!user) return;
        if (isFetchingRef.current) {
            console.log("Fetch already in progress, skipping...");
            return;
        }

        isFetchingRef.current = true;
        setIsLoading(true);
        setProgress(0); // Reset progress
        setError('');

        // Simulate progress - slower increment
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90; // Stop at 90% until actual completion
                }
                return Math.min(90, Math.round(prev + Math.random() * 3)); // Slower random increment, rounded
            });
        }, 500); // Slower interval (500ms instead of 300ms)

        try {
            const chartId = generateChartId({ name: data.userDetails.name }, birthDate, language);

            // 1. Check Cache first (if not forcing recheck)
            if (!forceRecheck) {
                const cached = await predictionService.getStoredPrediction(user.uid, chartId);
                if (cached && cached.data) {
                    console.log("Loaded prediction from cache");

                    // AUTO-FIX: Check if Tamil cache actually has English content (Bad Cache from previous errors)
                    let isValidCache = true;
                    if (isTamil) {
                        const firstHouseTitle = cached.data.bava_analysis_report?.house_predictions?.[0]?.title;
                        // Check for English title "Self & Health" or missing Tamil answer
                        if (firstHouseTitle === "Self & Health" || !cached.data.final_answer_tamil) {
                            console.warn("[Fix] Found English content in Tamil cache. Ignoring cache to force clean translation...");
                            isValidCache = false;
                        }
                    }

                    if (isValidCache) {
                        setAiResponse(cached.data);
                        setProgress(100); // Instant complete for cache
                        setIsLoading(false);
                        isFetchingRef.current = false;
                        return;
                    }
                    // If invalid, fall through to fallback logic below
                }

                // NEW: If Tamil, check if English version exists to translate
                if (isTamil) {
                    let sourceData: OrchestratorResponse | null = null;

                    // Strategy A: Check in-memory state (User just switched from English)
                    if (aiResponse && aiResponse.bava_analysis_report) {
                        console.log("[Debug] Using current in-memory response as source for translation.");
                        sourceData = aiResponse;
                    }
                    // Strategy B: Check English Cache (User loaded app directly in Tamil or state is empty)
                    else {
                        const englishChartId = generateChartId({ name: data.userDetails.name }, birthDate, 'en');
                        console.log("[Debug] Checking English Cache:", englishChartId);
                        const cachedEnglish = await predictionService.getStoredPrediction(user.uid, englishChartId);
                        if (cachedEnglish && cachedEnglish.data) {
                            console.log("[Debug] English Cache Found.");
                            sourceData = cachedEnglish.data;
                        }
                    }

                    if (sourceData) {
                        console.log("Found source data, starting translation...");
                        try {
                            const translatedData = await translateAnalysisReport(sourceData);
                            console.log("[Debug] Translation completed.");

                            // Save to Tamil cache
                            await predictionService.savePrediction(user.uid, chartId, translatedData, language);
                            setAiResponse(translatedData);
                            setIsLoading(false);
                            return;
                        } catch (transErr) {
                            console.error("Translation failed, falling back to API:", transErr);
                            // Do NOT set isLoading(false) here, so it continues to the API fallback below
                        }
                    } else {
                        console.log("[Debug] No English source found. Proceeding to fresh generation.");
                    }
                }
            }

            // 2. Fallback to API (Fresh Generation)
            // Strategy: ALWAYS generate in English first, then translate to Tamil.
            // This ensures we have both versions saved and avoids Tamil generation issues.

            const question_en = "Give me a comprehensive house-by-house analysis";
            console.log("[Debug] Generating fresh English prediction...");
            const englishResponse = await queryAstrologyOrchestrator(question_en, chartData, 'en');

            if (englishResponse && englishResponse.bava_analysis_report) {
                // 1. Save English Version
                const enChartId = generateChartId({ name: data.userDetails.name }, birthDate, 'en');
                await predictionService.savePrediction(user.uid, enChartId, englishResponse, 'en');
                console.log("[Debug] Saved English prediction.");

                // 2. Generate & Save Tamil Version (Auto-Translate)
                try {
                    console.log("[Debug] Auto-translating to Tamil...");
                    const tamilResponse = await translateAnalysisReport(englishResponse);
                    const taChartId = generateChartId({ name: data.userDetails.name }, birthDate, 'ta');
                    await predictionService.savePrediction(user.uid, taChartId, tamilResponse, 'ta');
                    console.log("[Debug] Saved Tamil prediction.");

                    // 3. Set State based on Current Language
                    if (isTamil) {
                        setAiResponse(tamilResponse);
                    } else {
                        setAiResponse(englishResponse);
                    }
                } catch (transErr) {
                    console.error("Auto-translation failed:", transErr);
                    // Fallback: If translation fails, show English
                    setAiResponse(englishResponse);
                }
            } else {
                throw new Error("Failed to generate valid prediction.");
            }

        } catch (err: any) {
            console.error("Prediction Error:", err);
            setError(err.message || "Failed to generate prediction. Please try again.");
            // Only set AI response if we don't have one (keep partial/old data if useful?)
            // setAiResponse(null); 
        } finally {
            setProgress(100); // Complete progress
            setTimeout(() => {
                setIsLoading(false);
                isFetchingRef.current = false;
            }, 300); // Small delay to show 100%
        }
    };

    // Auto-fetch comprehensive analysis on mount
    useEffect(() => {
        if (user) {
            fetchAnalysis();
        }
    }, [language, user]);

    // Initialize viewingDasa with currentDasha when calculated
    useEffect(() => {
        if (currentDasha && !viewingDasa) {
            setViewingDasa(currentDasha);
        }
    }, [currentDasha]);

    const handleMahaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMahaPlanet = e.target.value;
        const maha = dashaPeriods.find(d => d.planet === selectedMahaPlanet);
        if (maha && maha.subPeriods && maha.subPeriods.length > 0) {
            const bhukti = maha.subPeriods[0];
            const antaram = bhukti.subPeriods && bhukti.subPeriods.length > 0 ? bhukti.subPeriods[0] : undefined;
            setViewingDasa({ maha, bhukti, antaram });
            setSelectedPeriod('Maha'); // Reset view to Maha to avoid confusion
        }
    };

    const handleBhuktiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!viewingDasa) return;
        const selectedBhuktiPlanet = e.target.value;
        const bhukti = viewingDasa.maha.subPeriods.find((d: any) => d.planet === selectedBhuktiPlanet);
        if (bhukti) {
            const antaram = bhukti.subPeriods && bhukti.subPeriods.length > 0 ? bhukti.subPeriods[0] : undefined;
            setViewingDasa({ ...viewingDasa, bhukti, antaram });
            setSelectedPeriod('Bhukti');
        }
    };

    const handleAntaramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!viewingDasa) return;
        const selectedAntaramPlanet = e.target.value;
        const antaram = viewingDasa.bhukti.subPeriods.find((d: any) => d.planet === selectedAntaramPlanet);
        if (antaram) {
            setViewingDasa({ ...viewingDasa, antaram });
            setSelectedPeriod('Antaram');
        }
    };

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

    // Prepare House Data for Dashboard
    const houseDashboardData: HouseData[] = React.useMemo(() => {
        if (!aiResponse?.bava_analysis_report?.house_predictions) return [];

        return aiResponse.bava_analysis_report.house_predictions.map((h: any) => {
            // Calculate target sign for this house number
            // House 1 = Ascendant Sign
            // House N = (Ascendant + N - 1) % 12
            const targetSignIndex = (ascendant.signIndex + h.house_number - 1) % 12;

            const housePlanets = planets
                .filter((p: any) => p.signIndex === targetSignIndex)
                .map((p: any) => language === 'ta' ? (TAMIL_PLANET_NAMES[p.name] || p.name) : p.name);

            return {
                house_number: h.house_number,
                title: h.title,
                status: h.status, // "Strong", "Weak", etc.
                analysis: h.analysis,
                guruji_rule_applied: h.guruji_rule_applied,
                // If API adds score later, map it here. For now rely on status-based fallback in Card.
                planets: housePlanets,
                recommendations: []
            };
        });
    }, [aiResponse, planets, ascendant.signIndex, language]);

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

            {/* --- Tab Navigation --- */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 sticky top-4 z-40 bg-slate-950/80 backdrop-blur-xl p-2 rounded-2xl border border-white/5 mx-auto max-w-fit shadow-2xl">
                <button
                    onClick={() => setActiveTab('houses')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'houses' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Home className="w-4 h-4" />
                    {isTamil ? "பாவக பலன்கள்" : "Houses"}
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <MessageCircle className="w-4 h-4" />
                    {isTamil ? "வாழ்க்கை வழிகாட்டி" : "Life Guidance"}
                </button>
                <button
                    onClick={() => setActiveTab('dasha')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'dasha' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    <Clock className="w-4 h-4" />
                    {isTamil ? "தசை & காலம்" : "Dasha & Timeline"}
                </button>
            </div>

            {/* --- Loading State with Progress --- */}
            {isLoading && (
                <div className="text-center p-12 glass-panel mt-8">
                    <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-400" />

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto mb-4">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-purple-300 font-bold text-lg mt-2">{progress}%</p>
                    </div>

                    <p className="text-slate-300 mb-2">
                        {isTamil ? "பகுப்பாய்வு செய்யப்படுகிறது..." : "Analyzing your chart..."}
                    </p>
                    <p className="text-slate-400 text-sm">
                        {isTamil ? "இது சில நொடிகள் எடுக்கும், தயவுசெய்து காத்திருக்கவும்" : "This may take a few moments, please wait"}
                    </p>
                </div>
            )}

            {/* --- Error State with Friendly Message --- */}
            {error && (
                <div className="text-center p-8 glass-panel border border-red-800/30 bg-red-900/10 mt-8">
                    <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-red-300 font-medium mb-2">
                        {isTamil ? "தொழில்நுட்ப சிக்கல்" : "Technical Issue"}
                    </p>
                    <p className="text-red-400 text-sm mb-4">
                        {isTamil
                            ? "உங்கள் ஜாதகத்தைப் பகுப்பாய்வு செய்வதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
                            : "We encountered an issue analyzing your chart. Please try again."}
                    </p>
                    <button
                        onClick={() => fetchAnalysis(true)}
                        className="mt-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                    >
                        {isTamil ? "🔄 மீண்டும் முயற்சி" : "🔄 Try Again"}
                    </button>
                </div>
            )}

            {activeTab === 'houses' && aiResponse?.bava_analysis_report && (
                <HouseAnalysisDashboard
                    houses={houseDashboardData}
                    lagnaSummary={aiResponse.bava_analysis_report.lagna_summary}
                    ascendantSign={language === 'ta' ? (TAMIL_RASI_NAMES[ascendant.signIndex] || ascendant.rashi_ta || ascendant.name) : (ascendant.rashi_en || ascendant.name)}
                    ascendantLord={language === 'ta' ? (TAMIL_PLANET_NAMES[ascendant.lord] || ascendant.lord) : ascendant.lord}
                    lagnaLordPosition={(() => {
                        const lordPlanet = planets.find((p: any) => p.name === ascendant.lord || p.name === ascendant.lord_en);
                        if (!lordPlanet) return "?";
                        const houseNum = (lordPlanet.signIndex - ascendant.signIndex + 12) % 12 + 1;
                        return language === 'ta' ? `${houseNum}-ம் வீடு` : `House ${houseNum}`;
                    })()}
                    // Calculate basic strength for Lagna Lord (Subathuvam Score)
                    lagnaStrength={agScores[ascendant.lord]?.totalScore || 50}
                    lagnaDescription={agScores[ascendant.lord]?.totalScore > 60 ? (language === 'ta' ? 'வலுவானது' : 'Strong') : (language === 'ta' ? 'சராசரி' : 'Average')}
                    isLoading={isLoading}
                />
            )}

            {activeTab === 'questions' && (
                <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            {isTamil ? "வாழ்க்கை வழிகாட்டி (Questions)" : "Life Guidance (Questions)"}
                        </h3>
                        <button
                            onClick={() => fetchAnalysis(true)}
                            disabled={isLoading}
                            className="text-xs flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full border border-blue-500/30 transition"
                        >
                            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            {isTamil ? "மீண்டும் ஆய்வு செய்" : "Check Again"}
                        </button>
                    </div>

                    {/* 0. NEW: Life Quality Analysis (The First Card) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-6 border-l-4 border-yellow-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition mb-6"
                    >
                        <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                            <Star className="w-32 h-32 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-yellow-200 mb-2 flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            {lifeQuality.question}
                        </h3>

                        {/* Score & Verdict Header */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl font-bold text-white">
                                {lifeQuality.totalScore}<span className="text-lg text-slate-400 font-normal">/100</span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => {
                                        const rating = lifeQuality.starRating;
                                        const isFull = i < Math.floor(rating);
                                        const isHalf = i === Math.floor(rating) && rating % 1 !== 0;

                                        return (
                                            <div key={i} className="relative w-4 h-4">
                                                {/* Base empty star */}
                                                <Star className="w-4 h-4 text-yellow-400 opacity-30 absolute top-0 left-0" />

                                                {/* Full or Half Overlay */}
                                                {isFull && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute top-0 left-0" />}
                                                {isHalf && <StarHalf className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute top-0 left-0" />}
                                            </div>
                                        );
                                    })}
                                </div>
                                <span className={`text-sm font-bold ${lifeQuality.totalScore >= 60 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                    {lifeQuality.answer.split('\n\n')[1]?.replace('**Rating:** ', '').replace('**தரமதிப்பீடு:** ', '')}
                                </span>
                            </div>
                        </div>

                        {/* 8 Category Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {Object.entries(lifeQuality.categories).map(([key, scoreVal]: [string, any]) => {
                                const score = Number(scoreVal);

                                // Config for icons and labels
                                const categoryConfig: Record<string, { icon: React.ReactNode, labelEn: string, labelTa: string }> = {
                                    education: { icon: <GraduationCap className="w-4 h-4" />, labelEn: "Education", labelTa: "கல்வி" },
                                    wealth: { icon: <Coins className="w-4 h-4" />, labelEn: "Wealth", labelTa: "செல்வம்" },
                                    career: { icon: <Briefcase className="w-4 h-4" />, labelEn: "Career", labelTa: "தொழில்" },
                                    marriage: { icon: <Heart className="w-4 h-4" />, labelEn: "Marriage", labelTa: "திருமணம்" },
                                    health: { icon: <Activity className="w-4 h-4" />, labelEn: "Health", labelTa: "ஆரோக்கியம்" },
                                    family: { icon: <Users className="w-4 h-4" />, labelEn: "Family", labelTa: "குடும்பம்" },
                                    property: { icon: <Home className="w-4 h-4" />, labelEn: "Property", labelTa: "சொத்து" },
                                    happiness: { icon: <Smile className="w-4 h-4" />, labelEn: "Happiness", labelTa: "மகிழ்ச்சி" }
                                };

                                const config = categoryConfig[key];
                                if (!config) return null;

                                let colorClass = '';
                                if (score >= 81) colorClass = 'text-emerald-400 border-emerald-500';
                                else if (score >= 61) colorClass = 'text-blue-400 border-blue-500';
                                else if (score >= 41) colorClass = 'text-orange-400 border-orange-500';
                                else colorClass = 'text-red-400 border-red-500';

                                return (
                                    <div key={key} className={`bg-slate-800/50 p-3 rounded border-l-2 ${colorClass}`}>
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className="text-base">{config.icon}</span>
                                            <div className="text-xs text-slate-400 leading-tight">{isTamil ? config.labelTa : config.labelEn}</div>
                                        </div>
                                        <div className={`text-lg font-bold ${colorClass.split(' ')[0]}`}>{score}<span className="text-xs text-slate-500">/100</span></div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-slate-700/50 rounded-full h-1 mt-1">
                                            <div
                                                className={`h-1 rounded-full ${colorClass.includes('emerald') ? 'bg-emerald-500' : colorClass.includes('blue') ? 'bg-blue-500' : colorClass.includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`}
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Detailed Reasoning */}
                        <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line text-sm">
                            {lifeQuality.answer.split('\n\n').slice(2).join('\n\n')}
                        </p>

                        <div className="text-xs text-yellow-400/80 italic border-t border-yellow-900/30 pt-2">
                            <pre className="whitespace-pre-wrap mt-1 font-sans opacity-80">{lifeQuality.reason}</pre>
                        </div>
                    </motion.div>

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
                            <div className="text-xs text-blue-400 italic border-t border-blue-900/30 pt-2 flex justify-between items-center">
                                <span>{isTamil ? "காரணம்:" : "Reasoning:"} {jobPrediction.reason}</span>
                                <button
                                    onClick={() => navigate('/predictions', { state: { initialMessage: `I think the Job Timing prediction is wrong. ${jobPrediction.answer}` } })}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition"
                                >
                                    {isTamil ? "தவறா?" : "Wrong?"}
                                </button>
                            </div>
                        </motion.div>

                        {/* 2. Foreign Settlement */}
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
                            <div className="text-xs text-indigo-400 italic border-t border-indigo-900/30 pt-2 flex justify-between items-center">
                                <span>{isTamil ? "காரணம்:" : "Reasoning:"} {foreignTravel.reason}</span>
                                <button
                                    onClick={() => navigate('/predictions', { state: { initialMessage: `I think the Foreign Travel prediction is wrong. ${foreignTravel.answer}` } })}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition"
                                >
                                    {isTamil ? "தவறா?" : "Wrong?"}
                                </button>
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
                            <div className="text-xs text-cyan-400 italic border-t border-cyan-900/30 pt-2 flex justify-between items-center">
                                <span>{isTamil ? "காரணம்:" : "Reasoning:"} {careerPath.reason}</span>
                                <button
                                    onClick={() => navigate('/predictions', { state: { initialMessage: `I think the Career Path prediction is wrong. ${careerPath.answer}` } })}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition"
                                >
                                    {isTamil ? "தவறா?" : "Wrong?"}
                                </button>
                            </div>
                        </motion.div>

                        {/* 4. Current Love Status */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.18 }}
                            className="glass-panel p-6 border-l-4 border-rose-500 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition"
                        >
                            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition">
                                <Heart className="w-24 h-24 text-rose-400" />
                            </div>
                            <h3 className="text-lg font-bold text-rose-200 mb-2 flex items-center gap-2">
                                <Heart className="w-5 h-5" />
                                {loveStatus.question}
                            </h3>
                            <p className="text-slate-300 font-medium leading-relaxed mb-3 whitespace-pre-line">
                                {loveStatus.answer}
                            </p>
                            <div className="text-xs text-rose-400 italic border-t border-rose-900/30 pt-2 flex justify-between items-center">
                                <span className="whitespace-pre-line">{isTamil ? "காரணம்:" : "Reasoning:"} {loveStatus.reason}</span>
                                <button
                                    onClick={() => navigate('/predictions', { state: { initialMessage: `I think the Current Love Status prediction is wrong. ${loveStatus.answer}` } })}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition"
                                >
                                    {isTamil ? "தவறா?" : "Wrong?"}
                                </button>
                            </div>
                        </motion.div>

                        {/* 5. Marriage Timing */}
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
                            <div className="text-xs text-pink-400 italic border-t border-pink-900/30 pt-2 flex justify-between items-center">
                                <span>{isTamil ? "காரணம்:" : "Reasoning:"} {marriageTiming.reason}</span>
                                <button
                                    onClick={() => navigate('/predictions', { state: { initialMessage: `I think the Marriage Timing prediction is wrong. ${marriageTiming.answer}. My Age is ${new Date().getFullYear() - new Date(birthDate).getFullYear()}` } })}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition"
                                >
                                    {isTamil ? "தவறா?" : "Wrong?"}
                                </button>
                            </div>
                        </motion.div>

                        {/* 6. Marriage Type */}
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
                            <div className="text-xs text-purple-400 italic border-t border-purple-900/30 pt-2 flex justify-between items-center">
                                <span>{isTamil ? "காரணம்:" : "Reasoning:"} {marriageType.reason}</span>
                                <button
                                    onClick={() => navigate('/predictions', { state: { initialMessage: `I think the Marriage Type prediction is wrong. ${marriageType.answer}` } })}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-900/20 px-2 py-1 rounded transition"
                                >
                                    {isTamil ? "தவறா?" : "Wrong?"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            {activeTab === 'dasha' && viewingDasa && (
                <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-purple-400 animate-pulse" />
                            <h3 className="text-xl font-bold">{t.dasha.current} (Analysis)</h3>
                        </div>

                        {/* Period Selectors */}
                        <div className="flex flex-wrap gap-2">
                            {/* Maha Selector */}
                            <select
                                value={viewingDasa.maha.planet}
                                onChange={handleMahaChange}
                                className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            >
                                {dashaPeriods.map(d => (
                                    <option key={d.planet} value={d.planet}>
                                        {getPlanetName(d.planet)}
                                    </option>
                                ))}
                            </select>

                            {/* Bhukti Selector */}
                            <select
                                value={viewingDasa.bhukti.planet}
                                onChange={handleBhuktiChange}
                                className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            >
                                {viewingDasa.maha.subPeriods?.map((d: any) => (
                                    <option key={d.planet} value={d.planet}>
                                        {getPlanetName(d.planet)}
                                    </option>
                                ))}
                            </select>

                            {/* Antaram Selector */}
                            <select
                                value={viewingDasa.antaram?.planet || ''}
                                onChange={handleAntaramChange}
                                className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                            >
                                {viewingDasa.bhukti.subPeriods?.map((d: any) => (
                                    <option key={d.planet} value={d.planet}>
                                        {getPlanetName(d.planet)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Timeline Visual (Interactive Steps) */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-4 scrollbar-hide">
                        {/* Maha Step */}
                        <button
                            onClick={() => setSelectedPeriod('Maha')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-r-full rounded-l-lg relative group transition-all min-w-fit ${selectedPeriod === 'Maha'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 z-30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 z-10'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedPeriod === 'Maha' ? 'bg-white/20' : 'bg-slate-900'
                                }`}>
                                {viewingDasa.maha.planet.substring(0, 2)}
                            </div>
                            <div className="text-left">
                                <span className="text-xs opacity-70 block uppercase tracking-wider">Maha Dasa</span>
                                <span className="font-bold">{getPlanetName(viewingDasa.maha.planet)}</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 ml-2 ${selectedPeriod === 'Maha' ? 'text-white' : 'text-slate-600'}`} />
                        </button>

                        {/* Bhukti Step */}
                        <button
                            onClick={() => setSelectedPeriod('Bhukti')}
                            className={`flex items-center gap-2 px-4 py-3 rounded-r-full rounded-l-lg relative group transition-all min-w-fit -ml-2 ${selectedPeriod === 'Bhukti'
                                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 z-30'
                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 z-20'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedPeriod === 'Bhukti' ? 'bg-white/20' : 'bg-slate-900'
                                }`}>
                                {viewingDasa.bhukti.planet.substring(0, 2)}
                            </div>
                            <div className="text-left">
                                <span className="text-xs opacity-70 block uppercase tracking-wider">Bhukti</span>
                                <span className="font-bold">{getPlanetName(viewingDasa.bhukti.planet)}</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 ml-2 ${selectedPeriod === 'Bhukti' ? 'text-white' : 'text-slate-600'}`} />
                        </button>

                        {/* Antaram Step */}
                        {viewingDasa.antaram && (
                            <button
                                onClick={() => setSelectedPeriod('Antaram')}
                                className={`flex items-center gap-2 px-4 py-3 rounded-r-full rounded-l-lg relative group transition-all min-w-fit -ml-2 ${selectedPeriod === 'Antaram'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 z-30'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 z-10'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedPeriod === 'Antaram' ? 'bg-white/20' : 'bg-slate-900'
                                    }`}>
                                    {viewingDasa.antaram.planet.substring(0, 2)}
                                </div>
                                <div className="text-left">
                                    <span className="text-xs opacity-70 block uppercase tracking-wider">Antaram</span>
                                    <span className="font-bold">{getPlanetName(viewingDasa.antaram.planet)}</span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Period Details Card */}
                        <div className="lg:col-span-2">
                            {(() => {
                                const currentP = viewingDasa[selectedPeriod.toLowerCase() as 'maha' | 'bhukti' | 'antaram'];
                                if (!currentP) return null;
                                const scoreData = calculateDasaScore(currentP.planet, data);
                                const periodTypeMap = { 'Maha': 'Maha', 'Bhukti': 'Antar', 'Antaram': 'Pratyantar' } as const;

                                return (
                                    <DasaPeriodCard
                                        planetName={currentP.planet}
                                        periodType={periodTypeMap[selectedPeriod]}
                                        startDate={currentP.startDate}
                                        endDate={currentP.endDate}
                                        dasaScore={scoreData}
                                        effectPercentage={selectedPeriod === 'Maha' ? 100 : selectedPeriod === 'Bhukti' ? 40 : 15}
                                        onViewDetails={() => {
                                            const prediction = generateDasaPrediction(
                                                currentP.planet,
                                                scoreData,
                                                selectedPeriod === 'Antaram' ? 'Antaram' : periodTypeMap[selectedPeriod] === 'Antar' ? 'Bhukti' : 'Maha',
                                                language
                                            );
                                            setViewingSpecificDetails({
                                                planet: currentP.planet,
                                                score: scoreData,
                                                type: selectedPeriod,
                                                prediction
                                            });
                                        }}
                                    />
                                );
                            })()}
                        </div>

                        {/* Scores & Quick Analysis */}
                        <div className="space-y-6">
                            {(() => {
                                const currentP = viewingDasa[selectedPeriod.toLowerCase() as 'maha' | 'bhukti' | 'antaram'];
                                if (!currentP) return null;
                                const scoreData = calculateDasaScore(currentP.planet, data);

                                return (
                                    <div className="glass-panel p-6 border border-purple-500/30 bg-purple-900/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <Activity className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-purple-300 uppercase tracking-wider font-bold">
                                                    {isTamil ? "மொத்த வலிமை" : "Total Strength"}
                                                </div>
                                                <div className="text-2xl font-bold text-white">
                                                    {scoreData.totalScore}<span className="text-sm text-slate-400 font-normal">/100</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${scoreData.totalScore > 75 ? 'bg-green-500' : scoreData.totalScore > 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${Math.min(100, Math.max(0, scoreData.totalScore))}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-400 text-right">
                                                {scoreData.totalScore > 75 ? (isTamil ? "மிகச்சிறப்பு" : "Excellent") : scoreData.totalScore > 50 ? (isTamil ? "நன்று" : "Good") : (isTamil ? "சராசரி" : "Average")}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Upchaya / Kendra Check Helper */}
                            <div className="glass-panel p-4 border border-slate-800">
                                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    {isTamil ? "விரைவான பார்வை" : "Quick Insight"}
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">{isTamil ? "இயற்கை சுபர்?" : "Benefic?"}</span>
                                        <span className={['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(viewingDasa[selectedPeriod.toLowerCase() as keyof typeof viewingDasa]?.planet) ? "text-green-400" : "text-orange-400"}>
                                            {['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(viewingDasa[selectedPeriod.toLowerCase() as keyof typeof viewingDasa]?.planet) ? "Yes" : "No (Malefic)"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs border-t border-slate-800 pt-2">
                                        <span className="text-slate-400">{isTamil ? "ஆட்சி/உச்சம்?" : "Positional Strength"}</span>
                                        <span className="text-blue-400">
                                            {Math.round(calculateDasaScore(viewingDasa[selectedPeriod.toLowerCase() as keyof typeof viewingDasa]?.planet, data).sthanaBala)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {viewingSpecificDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setViewingSpecificDetails(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                            {isTamil ? `${getPlanetName(viewingSpecificDetails.planet)} தசை பலன்கள்` : `${getPlanetName(viewingSpecificDetails.planet)} Period Analysis`}
                                        </h3>
                                        <p className="text-slate-400 mt-1">
                                            {isTamil ? 'AI ஜோதிட கணிப்பு' : 'AI Astrological Prediction'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setViewingSpecificDetails(null)}
                                        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Score Summary */}
                                    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 flex gap-4 items-center">
                                        <div className="p-3 bg-purple-500/20 rounded-full">
                                            <Sparkles className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-purple-300 font-medium">
                                                {isTamil ? 'மொத்த மதிப்பெண்' : 'Total Score'}
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                {viewingSpecificDetails.score.totalScore}<span className="text-base font-normal text-slate-400">/100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prediction Text */}
                                    <div className="prose prose-invert max-w-none">
                                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 leading-relaxed whitespace-pre-line text-slate-200 text-lg">
                                            {viewingSpecificDetails.prediction}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setViewingSpecificDetails(null)}
                                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        {isTamil ? 'மூடு' : 'Close'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
