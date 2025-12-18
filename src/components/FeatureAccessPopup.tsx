import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Lock, Sparkles, Lightbulb } from 'lucide-react';
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
                        className="fixed inset-0 z-[60] bg-[#0d0a2c]/80 backdrop-blur-sm"
                    />

                    {/* Popup Card */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="pointer-events-auto w-full max-w-[500px] bg-[rgba(139,92,246,0.15)] backdrop-blur-xl border border-[rgba(139,92,246,0.4)] rounded-[20px] shadow-[0_0_50px_rgba(139,92,246,0.2)] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative p-8 pb-4">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:rotate-90 transition-all duration-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                                    <h2 className="text-2xl font-bold font-orbitron text-white">
                                        {t.featurePopup.title}
                                    </h2>
                                </div>

                                {/* Available Features */}
                                <div className="mb-6">
                                    <h3 className="text-[#10b981] font-semibold mb-3 flex items-center gap-2">
                                        <Check className="w-5 h-5" />
                                        {t.featurePopup.availableTitle}
                                    </h3>
                                    <ul className="space-y-3 pl-2">
                                        {t.featurePopup.availableItems.map((item: string, idx: number) => (
                                            <motion.li
                                                key={idx}
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-3 text-slate-200 text-[15px]"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981]" />
                                                {item}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-6" />

                                {/* Locked Features */}
                                <div className="mb-8">
                                    <h3 className="text-[#a855f7] font-semibold mb-3 flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        {t.featurePopup.lockedTitle}
                                    </h3>
                                    <ul className="space-y-3 pl-2">
                                        {t.featurePopup.lockedItems.map((item: string, idx: number) => (
                                            <motion.li
                                                key={idx}
                                                whileHover={{ x: 5 }}
                                                className="flex items-center gap-3 text-slate-300/80 text-[15px]"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-[0_0_5px_#a855f7]" />
                                                {item}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Footer CTA */}
                                <div className="bg-purple-900/20 -mx-8 -mb-8 p-6 text-center border-t border-purple-500/20">
                                    <div className="flex items-center justify-center gap-2 mb-4 text-purple-200">
                                        <Lightbulb className="w-4 h-4 ml-1" />
                                        <p className="text-sm font-medium">{t.featurePopup.loginMsg}</p>
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => { onClose(); navigate('/login'); }}
                                            className="px-6 py-2.5 rounded-lg border border-purple-500 text-purple-100 font-medium hover:bg-purple-500/10 transition-colors"
                                        >
                                            {t.featurePopup.loginBtn}
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => { onClose(); navigate('/register'); }}
                                            className="text-white underline underline-offset-4 hover:text-purple-200 transition-colors font-medium"
                                        >
                                            {t.featurePopup.signupBtn}
                                        </motion.button>
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
