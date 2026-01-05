import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SubathuvamIntroModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubathuvamIntroModal: React.FC<SubathuvamIntroModalProps> = ({ isOpen, onClose }) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-slate-900 border border-purple-500/30 w-full max-w-lg rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="relative h-32 bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex flex-col justify-center overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <button
                                        onClick={onClose}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="z-10">
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {isTamil ? 'சுபத்துவம் & பாபத்துவம்' : 'Subathuvam & Papathuvam'}
                                    </h2>
                                    <p className="text-indigo-100 opacity-90 text-sm">
                                        {isTamil ? 'கிரகங்களின் வலிமையை அறிவது எப்படி?' : 'Understanding Planetary Strength'}
                                    </p>
                                </div>

                                {/* Decor */}
                                <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Subathuvam Section */}
                                <div className="flex gap-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-green-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-green-400 mb-1">
                                            {isTamil ? 'சுபத்துவம் (நன்மை)' : 'Subathuvam (Beneficence)'}
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {isTamil
                                                ? 'ஒரு கிரகம் குரு, சுக்கிரன், வளர்பிறை சந்திரன் அல்லது தனித்த புதன் ஆகிய சுப கிரகங்களின் பார்வை அல்லது சேர்க்கை பெறுவது. இது நல்ல பலன்களைத் தரும்.'
                                                : 'When a planet receives light from benefic planets like Jupiter, Venus, Waxing Moon, or Mercury. This gives positive results and strength to do good.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Papathuvam Section */}
                                <div className="flex gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-400 mb-1">
                                            {isTamil ? 'பாபத்துவம் (தீமை)' : 'Papathuvam (Maleficence)'}
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {isTamil
                                                ? 'சனி, செவ்வாய், ராகு, கேது போன்ற பாப கிரகங்களுடன் சேருவது அல்லது அவற்றின் பார்வையை பெறுவது. இது போராட்டங்களையும் தாமதத்தையும் தரும்.'
                                                : 'When a planet is in darkness or influenced by malefic planets like Saturn, Mars, Rahu, or Ketu. This causes struggles, delays, or harsh results.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="flex items-start gap-3 text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg">
                                    <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                                    <p>
                                        {isTamil
                                            ? 'சுபத்துவம் பெற்ற கிரகம் தனது தசா புத்தியில் நன்மையை செய்யும். பாபத்துவம் பெற்ற கிரகம் சோதனைகளை தரும்.'
                                            : 'A planet with high Subathuvam will deliver good results during its Dasha period. Papathuvam brings challenges.'}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-950/50 border-t border-white/5 flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/25"
                                >
                                    {isTamil ? 'புரிந்தது' : 'Got it'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SubathuvamIntroModal;
