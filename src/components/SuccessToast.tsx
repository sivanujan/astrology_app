import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
    isVisible: boolean;
    onClose: () => void;
    message: string;
    subMessage?: string;
    duration?: number;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ isVisible, onClose, message, subMessage, duration = 5000 }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
                >
                    <div className="bg-slate-900 border border-green-500/30 rounded-2xl shadow-2xl shadow-green-500/20 p-4 relative overflow-hidden backdrop-blur-xl">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

                        <div className="flex gap-4 relative z-10">
                            <div className="shrink-0 pt-1">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/20 animate-pulse">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-base mb-1">{message}</h4>
                                {subMessage && (
                                    <p className="text-slate-400 text-sm leading-relaxed">{subMessage}</p>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="shrink-0 pt-1 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: duration / 1000, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-green-500/30 w-full"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessToast;
