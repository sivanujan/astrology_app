import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, AlertCircle, BrainCircuit, Clock, Heart, Briefcase, Shield, Star, Users, BarChart2, Zap, FileText } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation, useNavigate
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { queryAstrologyOrchestrator, OrchestratorResponse } from '../utils/aiOrchestrator';
import FeedbackWidget from './FeedbackWidget';

interface AIPredictionsProps {
    data: any;
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const isTamil = language === 'ta';
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get navigation state
    const [prediction, setPrediction] = useState<OrchestratorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [question, setQuestion] = useState('');
    const [responseLanguage, setResponseLanguage] = useState<'en' | 'ta'>('en');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth(); // Auth context

    // Check for initial message from navigation (e.g., from "Wrong Prediction" button)
    useEffect(() => {
        if (location.state && location.state.initialMessage) {
            setQuestion(location.state.initialMessage);
            // Optional: clear state so it doesn't persist on refresh? 
            // window.history.replaceState({}, document.title)
        }
    }, [location]);

    // Firestore Integration
    useEffect(() => {
        if (!user || !data) return;

        // Generate a simplified chart ID or use Name+DOB key
        const chartId = `${data.userDetails.name}_${new Date(data.birthDate).getTime()}`.replace(/[^a-zA-Z0-9]/g, '_');
        const messagesRef = collection(db, `users/${user.uid}/charts/${chartId}/messages`);
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Add welcome message if chat is empty
            if (msgs.length === 0) {
                const userName = data.userDetails.name || 'there';
                const welcomeMsg = {
                    id: 'welcome',
                    role: 'assistant',
                    content: language === 'ta'
                        ? `வணக்கம் ${userName}! 🙏✨\n\nநான் உங்கள் ஜோதிட ஆலோசகர். உங்கள் ஜாதகம் பற்றி எந்த கேள்வியும் கேளுங்கள்.\n\n💼 தொழில்\n💑 திருமணம்\n🏠 சொத்து\n✈️ வெளிநாடு\n👶 குழந்தை\n\nஎன்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?`
                        : `Hello ${userName}! 🙏✨\n\nI'm your Vedic Astrology advisor. Ask me anything about your birth chart.\n\n💼 Career\n💑 Marriage\n🏠 Property\n✈️ Foreign Travel\n👶 Children\n\nWhat would you like to know?`,
                    timestamp: new Date(),
                    isWelcome: true
                };
                setChatHistory([welcomeMsg]);
            } else {
                setChatHistory(msgs);
            }

            // Scroll to bottom on load
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [user, data, language]);

    // Internal save function
    const saveMessageToFirestore = async (msg: any) => {
        if (!user || !data) return;
        try {
            const chartId = `${data.userDetails.name}_${new Date(data.birthDate).getTime()}`.replace(/[^a-zA-Z0-9]/g, '_');
            await addDoc(collection(db, `users/${user.uid}/charts/${chartId}/messages`), {
                ...msg,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Error saving message:", e);
        }
    };

    // Sync initial response language with app language
    useEffect(() => {
        setResponseLanguage(language);
    }, [language]);

    // Calculate Dasa locally for display (Consistency Check)
    const [systemDasa, setSystemDasa] = useState<any>(null);

    useEffect(() => {
        const loadDasa = async () => {
            if (data.birthDate && data.planets) {
                const moon = data.planets.find((p: any) => p.name === 'Moon');
                if (moon) {
                    const { calculateDashaPeriods, getCurrentDasha } = await import('../utils/astrology');
                    const periods = calculateDashaPeriods(new Date(data.birthDate), moon.longitude);
                    const current = getCurrentDasha(periods);
                    setSystemDasa(current);
                }
            }
        };
        loadDasa();
    }, [data]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (!data) return null;

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        // Optimistic Update (will apply only if not logged in, otherwise Firestore syncs)
        const userMsg = { role: 'user', content: question, timestamp: new Date() };
        if (!user) {
            setChatHistory(prev => [...prev, userMsg]);
        } else {
            saveMessageToFirestore(userMsg);
        }

        setQuestion('');
        setIsLoading(true);
        setError('');

        try {
            // Use Dasha data directly from database (no calculation)
            let enrichedData = { ...data };

            console.log("[AI Predictions] Using Dasha from database:", {
                hasCurrentDasa: !!data.currentDasa,
                hasDashaPeriods: !!data.dashaPeriods,
                maha: data.currentDasa?.maha?.planet,
                bhukti: data.currentDasa?.bhukti?.planet,
                antaram: data.currentDasa?.antaram?.planet
            });

            // --- PROACTIVE ENRICHMENT: Calculate Yogas & Subathuvam if missing ---
            // The AI needs these pre-calculated values to follow rules accurately.

            // 1. Calculate Subathuvam/Pavathuvam
            const { calculateSubathuvamPavathuvam, calculateHouseSubathuvamPavathuvam } = await import('../utils/subathuvam');
            const subathuvamScores = calculateSubathuvamPavathuvam(data.planets, language);
            // Assuming ascendant Sign Index is available. If not, derive from data.ascendant.
            // data.ascendant usually has 'signIndex' or we can find it.
            // Fallback: If no ascendant index, skip House Subathuvam.
            let houseScores = {};
            if (data.ascendant && typeof data.ascendant.signIndex === 'number') {
                houseScores = calculateHouseSubathuvamPavathuvam(data.planets, data.ascendant.signIndex, language);
            }

            enrichedData = {
                ...enrichedData,
                userDetails: {
                    ...data.userDetails,
                    uid: user?.uid // Inject UID for logging
                },
                subathuvam_calculations: {
                    planetary_scores: subathuvamScores,
                    house_scores: houseScores
                }
            };

            // 2. Calculate Yogas
            // Check if yoga calculation function exists or if we need to call it.
            // Usually 'calculateYogas' in 'astrology.ts' or 'yogas.ts'.
            // Let's assume basic yogas are in 'data.yogas' if calculated previously. 
            // If not present, we should calculate.
            if (!enrichedData.yogas || !enrichedData.doshas) {
                const { calculateYogas } = await import('../utils/astrology');
                const { yogas, doshas } = calculateYogas(data.planets, data.ascendant?.signIndex || 0);
                enrichedData = { ...enrichedData, yogas, doshas };
            }

            // VALIDATION: Log Dasha status but don't block (AI can still answer without perfect Dasha data)
            if (!enrichedData.currentDasa || !enrichedData.dashaPeriods || enrichedData.dashaPeriods.length === 0) {
                console.warn('[AI Chat] Dasha calculation incomplete (will proceed anyway):', {
                    hasDasa: !!enrichedData.currentDasa,
                    hasSchedule: !!enrichedData.dashaPeriods,
                    scheduleLength: enrichedData.dashaPeriods?.length || 0,
                    birthDate: data.birthDate,
                    hasMoon: !!data.planets?.find((p: any) => p.name === 'Moon')
                });

                // Don't block - AI can still provide useful answers without Dasha
                // Just add a note to the enriched data
                enrichedData.dashaWarning = "Dasha calculation incomplete - predictions may be limited";
            }

            // Debug: Log what we're sending to AI
            console.log('[AI Chat] Sending to AI:', {


                question: question,
                hasDasha: !!enrichedData.currentDasa,
                dashaLord: enrichedData.currentDasa?.maha?.planet,
                bhuktiLord: enrichedData.currentDasa?.bhukti?.planet,
                hasSchedule: !!enrichedData.dashaPeriods,
                scheduleLength: enrichedData.dashaPeriods?.length || 0,
                hasSubathuvam: !!enrichedData.subathuvam_calculations,
                responseLanguage: responseLanguage
            });

            // Call the Orchestrator with enriched data
            const response = await queryAstrologyOrchestrator(question, enrichedData, responseLanguage);

            setPrediction(response);

            // Add AI response to history
            const aiContent = responseLanguage === 'ta' ? response.final_answer_tamil : response.final_answer_english;
            const aiMsg = { role: 'ai', content: aiContent, details: response, timestamp: new Date() };

            if (!user) {
                setChatHistory(prev => [...prev, aiMsg]);
            } else {
                saveMessageToFirestore(aiMsg);
            }

        } catch (err: any) {
            setError(err.message || "Failed to get prediction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-12rem)] flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center flex-shrink-0"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-purple-400" />
                    {t.predictions.title}
                </h2>
                <p className="text-slate-400">{t.predictions.subtitle}</p>
            </motion.div>

            {/* Chat Interface */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 py-8">

                            {/* Welcome Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-8"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 mb-2">
                                    {isTamil ? "வணக்கம்! உங்கள் ஜோதிட கேள்விகளை கேளுங்கள் 🔮" : "Namaste! Ask me your astrology questions 🔮"}
                                </h3>
                                <p className="text-slate-400">
                                    {isTamil
                                        ? "உங்கள் ஜாதகத்தின் அடிப்படையில் துல்லியமான பதில்களைப் பெறுங்கள்."
                                        : "Get accurate predictions based on your unique birth chart."}
                                </p>
                            </motion.div>

                            {/* Trust Elements */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap justify-center gap-3 mb-8"
                            >
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-400">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span>{t.predictions.subtitle}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-400">
                                    <Users className="w-3 h-3 text-blue-400" />
                                    <span>100+ Happy Users</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs text-slate-400">
                                    <Shield className="w-3 h-3 text-emerald-400" />
                                    <span>100% Confidential</span>
                                </div>
                            </motion.div>

                            {/* Feature Highlights Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
                                {[
                                    { icon: Zap, label: "Instant Answer", labelTa: "உடனடி பதில்", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
                                    { icon: BrainCircuit, label: "Deep Analysis", labelTa: "ஆழமான ஆய்வு", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
                                    { icon: BarChart2, label: "Dasa Check", labelTa: "தசா கணிப்பு", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
                                    { icon: Heart, label: "Match Check", labelTa: "பொருத்தம்", color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.05) }}
                                        className={`p-3 rounded-xl border ${feature.border} ${feature.bg} flex flex-col items-center justify-center gap-2 text-center`}
                                    >
                                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${feature.color.replace('text-', 'text-opacity-80-')}`}>
                                            {isTamil ? feature.labelTa : feature.label}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Suggested Questions Grid */}
                            <div className="w-full">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
                                    {isTamil ? "பரிந்துரைக்கப்பட்ட கேள்விகள்" : "Suggested Questions"}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { qEn: "When will I get married?", qTa: "எப்போது திருமணம் நடக்கும்?", icon: Heart, color: "text-pink-400" },
                                        { qEn: "When will I get a job?", qTa: "எப்போது வேலை கிடைக்கும்?", icon: Briefcase, color: "text-blue-400" },
                                        { qEn: "How is my current Dasa?", qTa: "எனது தற்போதைய தசா புத்தி எப்படி உள்ளது?", icon: Clock, color: "text-purple-400" },
                                        { qEn: "Rahu Ketu Transit effects?", qTa: "ராகு கேது பெயர்ச்சி பலன்கள்?", icon: AlertCircle, color: "text-orange-400" }
                                    ].map((item, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + (i * 0.05) }}
                                            onClick={() => {
                                                setQuestion(isTamil ? item.qTa : item.qEn);
                                                // Ideally auto-submit, but setState is async. 
                                                // We can just set it and let user press send, or trigger submit logic.
                                                // For now, just set. User can hit enter.
                                            }}
                                            className="group flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/30 transition-all text-left"
                                        >
                                            <div className={`p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors ${item.color}`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                                {isTamil ? item.qTa : item.qEn}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions (Footer of empty state) */}
                            <div className="flex flex-wrap justify-center gap-2 mt-8 pt-6 border-t border-slate-800/50 w-full opacity-60 hover:opacity-100 transition-opacity">
                                <button onClick={() => navigate('/chart')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                                    <FileText className="w-3 h-3" /> {isTamil ? "ஜாதகம் பார்" : "Show Chart"}
                                </button>
                                <button onClick={() => navigate('/dasha')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                                    <Clock className="w-3 h-3" /> {isTamil ? "தசா காலங்கள்" : "Dasa Periods"}
                                </button>
                                <button onClick={() => navigate('/predictions-faq')} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
                                    <Sparkles className="w-3 h-3" /> {isTamil ? "பொது பலன்கள்" : "Predictions"}
                                </button>
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <span className="text-xl">🔮</span>}
                            </div>
                            <div className={`rounded-2xl p-5 max-w-[80%] shadow-lg text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/40 border border-blue-500/30 shadow-blue-500/10 text-blue-50' : 'bg-indigo-900/30 border border-indigo-500/20 shadow-indigo-500/10 text-slate-100'}`} style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                                {msg.content}
                                {msg.details?.bava_analysis_report && (
                                    <div className="mt-6 space-y-4">
                                        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                                            <h3 className="text-lg font-bold text-purple-300 mb-2">📊 Comprehensive House Analysis</h3>
                                            <p className="text-slate-300">{msg.details.bava_analysis_report.lagna_summary}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {msg.details.bava_analysis_report.house_predictions.map((house: any) => (
                                                <div
                                                    key={house.house_number}
                                                    className={`p-3 rounded-lg border ${house.status === 'Strong' || house.status === 'Excellent'
                                                        ? 'bg-green-900/20 border-green-800/30'
                                                        : house.status === 'Weak'
                                                            ? 'bg-red-900/20 border-red-800/30'
                                                            : 'bg-yellow-900/20 border-yellow-800/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-slate-400">House {house.house_number}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${house.status === 'Strong' || house.status === 'Excellent'
                                                            ? 'bg-green-700/30 text-green-300'
                                                            : house.status === 'Weak'
                                                                ? 'bg-red-700/30 text-red-300'
                                                                : 'bg-yellow-700/30 text-yellow-300'
                                                            }`}>
                                                            {house.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-white mb-1">{house.title}</h4>
                                                    <p className="text-xs text-slate-300 mb-2">{house.analysis}</p>
                                                    <p className="text-xs text-slate-500 italic">Rule: {house.guruji_rule_applied}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                                            <h3 className="text-sm font-bold text-blue-300 mb-1">📝 Final Verdict</h3>
                                            <p className="text-sm text-slate-300">{msg.details.bava_analysis_report.final_verdict}</p>
                                        </div>
                                    </div>
                                )}
                                {msg.details && !msg.details.bava_analysis_report && (
                                    <div className="mt-6 space-y-3">
                                        {msg.details.intent && (
                                            <div className="bg-slate-800/40 rounded-xl border border-indigo-500/30 p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span>📋</span>
                                                    <span className="font-bold text-indigo-300 text-sm">Intent</span>
                                                </div>
                                                <p className="text-slate-300 text-sm">{msg.details.intent}</p>
                                            </div>
                                        )}
                                        {msg.details.primary_analysis?.key_planet && (
                                            <div className="bg-slate-800/40 rounded-xl border border-purple-500/30 p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span>🪐</span>
                                                    <span className="font-bold text-purple-300 text-sm">Key Planet</span>
                                                </div>
                                                <p className="text-slate-300 text-sm">
                                                    {msg.details.primary_analysis.key_planet}
                                                    {msg.details.primary_analysis.status && ` (${msg.details.primary_analysis.status})`}
                                                </p>
                                            </div>
                                        )}
                                        {msg.details.reasoning && (
                                            <div className="bg-slate-800/40 rounded-xl border border-cyan-500/30 p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span>💭</span>
                                                    <span className="font-bold text-cyan-300 text-sm">Reasoning</span>
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed">{msg.details.reasoning}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* FEEDBACK WIDGET */}
                                {msg.role === 'ai' && user && msg.id && (
                                    <FeedbackWidget
                                        messageId={msg.id}
                                        messagePath={`users/${user.uid}/charts/${`${data.userDetails.name}_${new Date(data.birthDate).getTime()}`.replace(/[^a-zA-Z0-9]/g, '_')}/messages/${msg.id}`}
                                        existingFeedback={msg.feedback}
                                    />
                                )}

                                {/* TIMESTAMP */}
                                {msg.timestamp && (
                                    <div className={`flex items-center gap-1 text-xs text-slate-500 mt-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {new Date(msg.timestamp.seconds ? msg.timestamp.seconds * 1000 : msg.timestamp).toLocaleTimeString(isTamil ? 'ta-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-xl">🔮</span>
                            </div>
                            <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-2xl p-5 shadow-lg shadow-indigo-500/10">
                                <div className="flex items-center gap-3 text-indigo-300">
                                    <span className="text-sm">{isTamil ? 'AI ஜோதிடர் உங்கள் ஜாதகத்தை பார்க்கிறார்...' : 'AI Astrologer is analyzing your chart...'}</span>
                                    <div className="flex gap-1">
                                        <span className="animate-bounce">●</span>
                                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                                        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg whitespace-pre-wrap">
                            <AlertCircle className="w-5 h-5 inline mr-2" />
                            {error.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                /(https?:\/\/[^\s]+)/g.test(part) ? (
                                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-300 hover:text-white break-all">
                                        {part}
                                    </a>
                                ) : (
                                    <span key={i}>{part}</span>
                                )
                            )}
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
                    {/* Language Toggle */}
                    <div className="flex justify-end gap-2 text-xs">
                        <span className="text-slate-400 self-center">Answer in:</span>
                        <button
                            onClick={() => setResponseLanguage('en')}
                            className={`px-3 py-1 rounded-full border transition-colors ${responseLanguage === 'en' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setResponseLanguage('ta')}
                            className={`px-3 py-1 rounded-full border transition-colors ${responseLanguage === 'ta' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                            தமிழ்
                        </button>
                    </div>

                    <form onSubmit={handleAskQuestion} className="flex gap-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={t.predictions.askPlaceholder}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-6 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIPredictions;
