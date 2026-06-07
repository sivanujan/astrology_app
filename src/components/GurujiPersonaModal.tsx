import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGurujiPersona } from '../utils/aiOrchestrator';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface GurujiPersonaModalProps {
    isOpen: boolean;
    onClose: () => void;
    chartData: any;
    birthDetails: any;
    chartId?: string; // Optional because chart might not be saved yet
}

const GurujiPersonaModal: React.FC<GurujiPersonaModalProps> = ({ isOpen, onClose, chartData, birthDetails, chartId }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !result && !loading) {
            checkCacheAndFetch();
        }
    }, [isOpen]);

    const checkCacheAndFetch = async () => {
        setLoading(true);

        try {
            // 1. Try to load from Cache (if chartId exists)
            if (chartId) {
                const docRef = doc(db, 'charts', chartId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const cacheKey = language === 'ta' ? 'guruji_persona_ta' : 'guruji_persona_en';

                    if (data[cacheKey]) {
                        console.log("Loaded Persona from Cache!");
                        setResult(data[cacheKey]);
                        setLoading(false);
                        return; // Exit if found in cache
                    }
                }
            }

            // 2. If not in cache, Generate with AI
            const analysis = await generateGurujiPersona(chartData, birthDetails, language as 'en' | 'ta');
            setResult(analysis);

            // 3. Save to Cache (if chartId exists)
            if (chartId && analysis && !analysis.includes("System is busy")) {
                try {
                    const docRef = doc(db, 'charts', chartId);
                    const cacheKey = language === 'ta' ? 'guruji_persona_ta' : 'guruji_persona_en';
                    await updateDoc(docRef, {
                        [cacheKey]: analysis
                    });
                    console.log("Saved Persona to Cache!");
                } catch (saveError) {
                    console.error("Failed to save to cache", saveError);
                }
            }

        } catch (error) {
            console.error("Persona Generation Failed", error);
            setResult(language === 'ta' ? "பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." : "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl shadow-purple-900/50 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/40 to-slate-900">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                {language === 'ta' ? 'நான் யார்?' : 'Who Am I?'}
                                <span className="text-purple-400 text-sm font-normal block md:inline md:ml-2">
                                    {language === 'ta' ? '(குருஜி சுபத்துவ ஆய்வு)' : "(Guruji's Subathuvam Analysis)"}
                                </span>
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
                                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-purple-300 animate-pulse text-lg">
                                    {language === 'ta' ? 'சுபத்துவம் மற்றும் சூட்சும நிலைகளை ஆய்வு செய்கிறது...' : 'Analyzing Subathuvam & Sookshma...'}
                                </p>
                                <p className="text-slate-500 text-sm">
                                    {language === 'ta' ? 'மறைந்திருக்கும் உண்மைகள் & கடந்த கால நிகழ்வுகளை கணிக்கிறது' : 'Decoding Hidden Truths & Past Patterns'}
                                </p>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                {/* Disclaimer Alert */}
                                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6 flex gap-3 text-red-200 text-sm">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <p>
                                        {language === 'ta'
                                            ? <span>இந்த ஆய்வு ஆதித்ய குருஜியின் விதிகளை நேரடியாகப் பயன்படுத்துகிறது. சில கருத்துக்கள் உங்கள் கடந்த காலம் அல்லது குணாதிசயங்களைப் பற்றி <strong>மிகவும் நேரடியாகவும் அதிர்ச்சியாகவும்</strong> இருக்கலாம். இதை வழிகாட்டுதலாக மட்டும் எடுத்துக் கொள்ளவும்.</span>
                                            : <span>This analysis strictly follows Aditya Guruji's rules directly applied to your chart. Some points might be <strong>shockingly direct</strong> regarding your past or character. Take it as guidance.</span>
                                        }
                                    </p>
                                </div>

                                {/* AI Output Manual Renderer */}
                                <div className="space-y-4 text-slate-200 leading-relaxed max-w-none">
                                    {result?.split('\n').map((line, idx) => {
                                        // Headers (Markdown-like #)
                                        if (line.startsWith('## ')) {
                                            return <h3 key={idx} className="text-xl font-bold text-purple-300 mt-6 mb-3 border-b border-purple-500/20 pb-2">{line.replace('## ', '')}</h3>;
                                        }
                                        if (line.startsWith('### ')) {
                                            return <h4 key={idx} className="text-lg font-bold text-yellow-400 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                                        }
                                        if (line.trim().startsWith('**') && line.trim().endsWith('**') && !line.includes(' ')) {
                                            // Header style bold line
                                            return <h4 key={idx} className="text-lg font-bold text-purple-200 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                                        }

                                        // Standard Lines
                                        return (
                                            <p key={idx} className={`mb-2 min-h-[1em] ${line.trim().startsWith('-') ? 'ml-4 flex gap-2' : ''}`}>
                                                {line.trim().startsWith('-') && <span className="text-purple-500 mt-1">•</span>}
                                                <span>
                                                    {line.replace(/^- /, '').split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <span key={i} className="font-bold text-white bg-purple-500/20 px-1 rounded">{part.slice(2, -2)}</span>;
                                                        }
                                                        return part;
                                                    })}
                                                </span>
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GurujiPersonaModal;
