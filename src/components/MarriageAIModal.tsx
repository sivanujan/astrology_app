
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMarriageMatchingAI } from '../utils/aiOrchestrator';
import { useLanguage } from '../contexts/LanguageContext';

interface MarriageAIModalProps {
    isOpen: boolean;
    onClose: () => void;
    boyDetails: any;
    girlDetails: any;
    matchingResult: any;
}

const MarriageAIModal: React.FC<MarriageAIModalProps> = ({ isOpen, onClose, boyDetails, girlDetails, matchingResult }) => {
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && !result && !loading) {
            generateAnalysis();
        }
    }, [isOpen]);

    const generateAnalysis = async () => {
        setLoading(true);
        try {
            const analysis = await generateMarriageMatchingAI(boyDetails, girlDetails, matchingResult, language as 'en' | 'ta');
            setResult(analysis);
        } catch (error) {
            console.error("AI Generation Failed", error);
            setResult(language === 'ta' ? "பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." : "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Helper to format Bold text
    const formatText = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            // Headers
            if (line.startsWith('###') || line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={index} className="text-lg font-bold text-yellow-400 mt-4 mb-2">{line.replace(/#/g, '').replace(/\*\*/g, '')}</h3>;
            }
            // Bullet points
            if (line.trim().startsWith('-')) {
                return (
                    <div key={index} className="flex gap-2 mb-2 ml-4">
                        <span className="text-pink-400 mt-1.5">•</span>
                        <p className="text-slate-300 leading-relaxed">
                            {line.replace('-', '').trim().split('**').map((part, i) =>
                                i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                            )}
                        </p>
                    </div>
                );
            }
            // Normal text
            return (
                <p key={index} className="text-slate-300 mb-2 leading-relaxed">
                    {line.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
                    )}
                </p>
            );
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-pink-500/30 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl shadow-pink-900/50 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-pink-900/40 to-slate-900">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                {language === 'ta' ? 'AI திருமண பொருத்தம் கணிப்பு' : 'AI Marriage Prediction'}
                                <span className="text-pink-400 text-sm font-normal block md:inline md:ml-2">
                                    {language === 'ta' ? '(குருஜி முறை)' : "(Aditya Guruji Method)"}
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
                            <div className="flex flex-col items-center justify-center py-20">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Heart className="w-16 h-16 text-pink-500 mb-6" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {language === 'ta' ? 'ஜாதகங்களை ஒப்பிடுகிறது...' : 'Analyzing Charts...'}
                                </h3>
                                <p className="text-slate-400 text-center max-w-md">
                                    {language === 'ta'
                                        ? 'தசா சந்திப்பு, சுபத்துவம் மற்றும் எதிர்கால பலன்களை கணிக்கிறது...'
                                        : 'Checking Dasa Sandhi, Subathuvam, and Future Presdictions...'}
                                </p>
                            </div>
                        ) : result ? (
                            <div className="prose prose-invert max-w-none">
                                {formatText(result)}
                                <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                                    <p className="text-sm text-yellow-200/80 text-center italic">
                                        {language === 'ta'
                                            ? 'மறுப்பு: இது ஒரு AI கணிப்பு மட்டுமே. இறுதி முடிவெடுக்கும் முன் அனுபவம் வாய்ந்த ஜோதிடரை அணுகவும்.'
                                            : 'Disclaimer: This is an AI prediction. Please consult an experienced astrologer before making final decisions.'}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MarriageAIModal;
