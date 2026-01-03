import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface FeatureAccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeatureAccessPopup: React.FC<FeatureAccessPopupProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();

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
                        className="fixed inset-0 z-[60] bg-[#0d0a2c]/90 backdrop-blur-sm"
                    />

                    {/* Popup Modal */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="pointer-events-auto w-full max-w-[600px] bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 flex-shrink-0">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-500/20 p-2 rounded-lg">
                                        <Sparkles className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white font-orbitron">
                                        {t.featurePopup.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                                {/* Free Features Section */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                            Free
                                        </span>
                                        <h3 className="text-slate-300 font-medium">
                                            {t.featurePopup.subtitle}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {t.featurePopup.freeFeatures.map((feature: any, idx: number) => (
                                            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:bg-slate-800 transition-colors">
                                                <div className="text-2xl">{feature.icon}</div>
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{feature.title}</div>
                                                    <div className="text-[10px] text-slate-400 leading-tight mt-1">{feature.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Premium Benefits Section */}
                                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-5 border border-purple-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-purple-300 font-bold flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            {t.featurePopup.premiumTitle}
                                        </h3>
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                            Premium
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {t.featurePopup.premiumFeatures.map((feature: any, idx: number) => (
                                            <div key={idx} className="flex gap-3 items-start p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                <div className="text-xl flex-shrink-0 mt-0.5">{feature.icon}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{feature.title}</div>
                                                    <div className="text-xs text-purple-200/60 leading-snug">{feature.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer / CTA */}
                            <div className="p-6 bg-slate-900/80 border-t border-white/5 flex-shrink-0">
                                <div className="text-center mb-4">
                                    <div className="flex items-center justify-center gap-1 text-sm text-amber-400 font-medium mb-1">
                                        <span>⭐⭐⭐⭐⭐</span>
                                    </div>
                                    <p className="text-slate-400 text-xs">
                                        {t.featurePopup.ctaTitle}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { onClose(); navigate('/register'); }}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        {t.featurePopup.signupBtn}
                                    </motion.button>

                                    <div className="flex items-center justify-between px-2">
                                        <button
                                            onClick={() => { onClose(); navigate('/login'); }}
                                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            {t.featurePopup.loginBtn}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
                                        >
                                            {t.featurePopup.guestLink} <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FeatureAccessPopup;
