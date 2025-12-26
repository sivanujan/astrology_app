import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, AlertCircle, BrainCircuit } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // Import useLocation
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
            setChatHistory(msgs);
            // Scroll to bottom on load
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [user, data]);

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
            // Calculate Dasa if missing (similar to GurujiPredictions)
            let enrichedData = { ...data };
            // FORCE RE-CALCULATION of Dasa (Consistency with DashaPeriods component)
            if (data.birthDate && data.planets) {
                const moon = data.planets.find((p: any) => p.name === 'Moon');
                if (moon) {
                    const { calculateDashaPeriods, getCurrentDasha } = await import('../utils/astrology');
                    const dashaPeriods = calculateDashaPeriods(new Date(data.birthDate), moon.longitude);
                    const currentDasha = getCurrentDasha(dashaPeriods);

                    // Overwrite with fresh calculation
                    enrichedData = {
                        ...enrichedData,
                        currentDasa: currentDasha,
                        dashaPeriods: dashaPeriods
                    };
                }
            }

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
            if (!enrichedData.yogas) {
                const { calculateYogas } = await import('../utils/astrology'); // Assuming this export exists
                const yogas = calculateYogas(data.planets, data.ascendant?.signIndex || 0);
                enrichedData = { ...enrichedData, yogas };
            }

            // Call the Orchestrator with enriched data
            // Call the Orchestrator with enriched data

            // Call the Orchestrator with selected response language
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
                        <div className="text-center text-slate-500 mt-10">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Ask a question to start the AI analysis.</p>
                            <p className="text-sm mt-2">Examples: "When will I get married?", "Is government job possible?"</p>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>
                            <div className={`rounded-lg p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-900/30 text-blue-100' : 'bg-slate-800/50 text-slate-200'}`}>
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
                                    <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400">
                                        <p><strong>Intent:</strong> {msg.details.intent}</p>
                                        <p><strong>Key Planet:</strong> {msg.details.primary_analysis.key_planet} ({msg.details.primary_analysis.status})</p>
                                        <p><strong>Reasoning:</strong> {msg.details.reasoning}</p>
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
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4 text-slate-200">
                                <Sparkles className="w-5 h-5 animate-spin" /> Thinking...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 inline mr-2" /> {error}
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* System Context Info (Debug/Transparency) */}
                {data.currentDasa && (
                    <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                        <span>
                            System Calculation:
                            <span className="text-purple-400 font-semibold ml-1">
                                {data.currentDasa.maha?.planet || '?'} Dasa - {data.currentDasa.bhukti?.planet || '?'} Bhukti
                            </span>
                        </span>
                        <span className="opacity-50 text-[10px]">
                            (If wrong, tell the AI: "I am in [Planet] Dasa")
                        </span>
                    </div>
                )}

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
