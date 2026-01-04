
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, MessageCircle, Calendar, User, Save, FileText, Activity, Clock, Heart, Search, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WelcomeFeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeFeaturesModal: React.FC<WelcomeFeaturesModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Activity className="w-6 h-6 text-blue-400" />,
            title: "12 House Analysis",
            desc: "Complete life areas breakdown"
        },
        {
            icon: <MessageCircle className="w-6 h-6 text-green-400" />,
            title: "AI Astrologer Chat",
            desc: "Ask unlimited questions 24/7"
        },
        {
            icon: <Calendar className="w-6 h-6 text-orange-400" />,
            title: "Daily Predictions",
            desc: "Never miss important transits"
        },
        {
            icon: <Sparkles className="w-6 h-6 text-purple-400" />,
            title: "Our Predictions",
            desc: "Personalized insights"
        },
        {
            icon: <User className="w-6 h-6 text-pink-400" />,
            title: "Who Am I",
            desc: "Discover yourself"
        },
        {
            icon: <Save className="w-6 h-6 text-teal-400" />,
            title: "Save & Track",
            desc: "Access charts anytime"
        },
        {
            icon: <FileText className="w-6 h-6 text-yellow-400" />,
            title: "Birth Details",
            desc: "Enter & generate chart"
        },
        {
            icon: <Star className="w-6 h-6 text-indigo-400" />,
            title: "Vedic Chart",
            desc: "View Rasi chart"
        },
        {
            icon: <Clock className="w-6 h-6 text-red-400" />,
            title: "Dasha Periods",
            desc: "Timeline analysis"
        },
        {
            icon: <Heart className="w-6 h-6 text-rose-500" />,
            title: "Marriage Date",
            desc: "Find timing"
        },
        {
            icon: <Search className="w-6 h-6 text-cyan-400" />,
            title: "Compatibility",
            desc: "Match making"
        },
        {
            icon: <Lock className="w-6 h-6 text-gray-400" />,
            title: "Secret Analysis",
            desc: "Find your hidden truths"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0d0a2c]/90 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                            className="pointer-events-auto w-full max-w-4xl bg-slate-900/90 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 flex-shrink-0 border-b border-white/10">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="text-center">
                                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 font-orbitron mb-2">
                                        Welcome to Zen Astrology
                                    </h2>
                                    <p className="text-slate-400 text-sm md:text-base">
                                        Your complete guide to Vedic Astrology
                                    </p>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {features.map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-purple-500/30 rounded-xl p-4 flex items-start gap-4 transition-all group"
                                        >
                                            <div className="bg-slate-900/80 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-200 text-sm mb-1 group-hover:text-purple-300 transition-colors">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-xs text-slate-400 leading-relaxed">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-slate-900/95 border-t border-white/10 flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-base shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Start Your Journey
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WelcomeFeaturesModal;
