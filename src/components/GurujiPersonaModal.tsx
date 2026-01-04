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
    const [isDarkSideActivated, setIsDarkSideActivated] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setResult(null);
            setIsDarkSideActivated(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            checkCacheAndFetch();
        }
    }, [isOpen, isDarkSideActivated]);

    const checkCacheAndFetch = async () => {
        // If we already have a result for the CURRENT mode, don't re-fetch
        // But checking 'result' content is hard. 
        // Better: We trust the effect dependency. If isDarkSideActivated changed, we likely need to fetch/check cache.
        // However, if we just opened the modal (isOpen changed), we want to fetch the standard one.

        setLoading(true);

        try {
            const cacheSuffix = isDarkSideActivated ? '_dark' : '';
            const baseKey = language === 'ta' ? 'guruji_persona_ta' : 'guruji_persona_en';
            const cacheKey = baseKey + cacheSuffix;

            // 1. Try to load from Cache (if chartId exists)
            if (chartId) {
                const docRef = doc(db, 'charts', chartId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data[cacheKey]) {
                        console.log(`Loaded Persona from Cache! (${cacheKey})`);
                        setResult(data[cacheKey]);
                        setLoading(false);
                        return; // Exit if found in cache
                    }
                }
            }

            // 2. If not in cache, Generate with AI
            // Pass isDarkSideActivated flag
            const analysis = await generateGurujiPersona(chartData, birthDetails, language as 'en' | 'ta', isDarkSideActivated);
            setResult(analysis);

            // 3. Save to Cache (if chartId exists)
            if (chartId && analysis && !analysis.includes("System is busy")) {
                try {
                    const docRef = doc(db, 'charts', chartId);
                    await updateDoc(docRef, {
                        [cacheKey]: analysis
                    });
                    console.log(`Saved Persona to Cache! (${cacheKey})`);
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

    const handleActivateDarkSide = () => {
        const warningMsg = language === 'ta'
            ? "எச்சரிக்கை: இந்த ஆய்வு உங்கள் தனிப்பட்ட வாழ்க்கையின் மிகவும் ரகசியமான மற்றும் அதிர்ச்சிகரமான பக்கங்களை வெளிப்படுத்தும் (குடிப்பழக்கம், கெட்ட வார்த்தை, மோசடி போன்றவை). தொடர விரும்புகிறீர்களா?"
            : "WARNING: This analysis will reveal SHOCKING & DARK secrets about your personality (Addiction, Abusive Speech, Scam tendencies). This is strict and direct. Are you sure you want to proceed?";

        if (window.confirm(warningMsg)) {
            setIsDarkSideActivated(true);
        }
    };

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
                    <div className={`p-4 md:p-6 border-b border-white/10 flex justify-between items-start gap-4 bg-gradient-to-r ${isDarkSideActivated ? 'from-red-900/60 to-slate-900' : 'from-purple-900/40 to-slate-900'}`}>
                        <div className="flex items-center gap-3">
                            <Sparkles className={`w-6 h-6 ${isDarkSideActivated ? 'text-red-500' : 'text-yellow-400'} animate-pulse`} />
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                {language === 'ta' ? 'நான் யார்?' : 'Who Am I?'}
                                <span className={`${isDarkSideActivated ? 'text-red-400' : 'text-purple-400'} text-sm font-normal block md:inline md:ml-2`}>
                                    {isDarkSideActivated
                                        ? (language === 'ta' ? '(ஷாக் ஆயிடுவீங்க! - Dark Scan)' : '(Shocking Life Scan)')
                                        : (language === 'ta' ? '(குருஜி சுபத்துவ ஆய்வு)' : "(Guruji's Subathuvam Analysis)")}
                                </span>
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors shrink-0 rounded-full hover:bg-white/10"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
                                <div className={`w-16 h-16 border-4 ${isDarkSideActivated ? 'border-red-600' : 'border-purple-500'} border-t-transparent rounded-full animate-spin`}></div>
                                <p className={`${isDarkSideActivated ? 'text-red-400' : 'text-purple-300'} animate-pulse text-lg`}>
                                    {isDarkSideActivated
                                        ? (language === 'ta' ? 'ரகசியங்களை அலசுகிறது (Dark Scan)...' : 'Scanning Dark Secrets...')
                                        : (language === 'ta' ? 'சுபத்துவம் மற்றும் சூட்சும நிலைகளை ஆய்வு செய்கிறது...' : 'Analyzing Subathuvam & Sookshma...')}
                                </p>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none pb-12">
                                {/* Disclaimer Alert */}
                                <div className={`${isDarkSideActivated ? 'bg-red-950/40 border-red-600/50 text-red-100' : 'bg-red-900/20 border-red-500/30 text-red-200'} border p-4 rounded-lg mb-6 flex gap-3 text-sm`}>
                                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isDarkSideActivated ? 'text-red-500' : ''}`} />
                                    <p>
                                        {isDarkSideActivated
                                            ? (language === 'ta'
                                                ? "எச்சரிக்கை: இந்த முடிவுகள் மிகவும் நேரடியாகவும், சில சமயங்களில் அதிர்ச்சியாகவும் இருக்கலாம். உங்கள் ஜாதக ரீதியான 'நிழல் பக்கங்களை' (Shadow Side) மட்டுமே இது காட்டுகிறது."
                                                : "CAUTION: These results are strictly based on planetary flaws. They highlight your 'Shadow Side' and may be offensive. Proceed with maturity.")
                                            : (language === 'ta'
                                                ? <span>இந்த ஆய்வு ஆதித்ய குருஜியின் விதிகளை நேரடியாகப் பயன்படுத்துகிறது. சில கருத்துக்கள் உங்கள் குணாதிசயங்களைப் பற்றி நேரடியாக இருக்கலாம்.</span>
                                                : <span>This analysis follows Aditya Guruji's rules. Some points might be direct regarding your character.</span>
                                            )
                                        }
                                    </p>
                                </div>

                                {/* AI Output Manual Renderer */}
                                <div className="space-y-4 text-slate-200 leading-relaxed max-w-none animate-fadeIn">
                                    {result?.split('\n').map((line, idx) => {
                                        // Headers
                                        if (line.startsWith('## ')) return <h3 key={idx} className="text-xl font-bold text-purple-300 mt-6 mb-3 border-b border-purple-500/20 pb-2">{line.replace('## ', '')}</h3>;
                                        if (line.startsWith('### ')) return <h4 key={idx} className="text-lg font-bold text-yellow-400 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                                        if (line.trim().startsWith('**') && line.trim().endsWith('**') && !line.includes(' ')) {
                                            return <h4 key={idx} className={`text-lg font-bold ${isDarkSideActivated ? 'text-red-300' : 'text-purple-200'} mt-4 mb-2`}>{line.replace(/\*\*/g, '')}</h4>;
                                        }

                                        return (
                                            <p key={idx} className={`mb-2 min-h-[1em] ${line.trim().startsWith('-') ? 'ml-4 flex gap-2' : ''}`}>
                                                {line.trim().startsWith('-') && <span className={`${isDarkSideActivated ? 'text-red-500' : 'text-purple-500'} mt-1`}>•</span>}
                                                <span>
                                                    {line.replace(/^- /, '').split(/(\*\*.*?\*\*)/g).map((part, i) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return <span key={i} className={`font-bold text-white ${isDarkSideActivated ? 'bg-red-900/40' : 'bg-purple-500/20'} px-1 rounded`}>{part.slice(2, -2)}</span>;
                                                        }
                                                        return part;
                                                    })}
                                                </span>
                                            </p>
                                        );
                                    })}
                                </div>

                                {/* Dark Mode Trigger Button */}
                                {!isDarkSideActivated && !loading && result && (
                                    <div className="mt-12 pt-8 border-t border-white/10 text-center">
                                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                            <h4 className="text-lg font-semibold text-slate-300 mb-2">
                                                {language === 'ta' ? 'இன்னும் ஆழமான ரகசியங்கள் வேண்டுமா?' : 'Want to go deeper?'}
                                            </h4>
                                            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                                                {language === 'ta'
                                                    ? 'உங்கள் வாழ்வின் மறைக்கப்பட்ட பக்கங்கள், போதை பழக்கங்கள் மற்றும் ஆபத்துகளை அறிய வேண்டுமா?'
                                                    : 'Reveal hidden truths, potential addictions, and dark personality traits.'}
                                            </p>
                                            <button
                                                onClick={handleActivateDarkSide}
                                                className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/50 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center gap-2 mx-auto ring-1 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                            >
                                                <AlertTriangle className="w-5 h-5" />
                                                {language === 'ta' ? 'எச்சரிக்கை: அதிர்ச்சியான உண்மைகளைக் காட்டு' : 'WARNING: Show Shocking Secrets'}
                                            </button>
                                        </div>
                                        {!loading && (
                                            <div className="pt-8 pb-4 flex justify-center">
                                                <button
                                                    onClick={onClose}
                                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-sm font-medium transition-colors border border-slate-700"
                                                >
                                                    {language === 'ta' ? 'மூடுக' : 'Close'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GurujiPersonaModal;
