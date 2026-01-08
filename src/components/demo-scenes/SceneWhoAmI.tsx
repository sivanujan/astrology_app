import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, User } from 'lucide-react';

interface SceneWhoAmIProps {
    onClose: () => void;
}

// Dummy personality data for 4 key planets (reduced for demo speed)
const PLANET_PERSONALITY = [
    {
        planet: "Sun",
        emoji: "☀️",
        trait: "Leadership & Confidence",
        description: "You possess natural leadership qualities and radiate confidence. Your strong sense of self drives you to take charge in challenging situations. People are naturally drawn to your authoritative presence and clear vision."
    },
    {
        planet: "Moon",
        emoji: "🌙",
        trait: "Emotions & Intuition",
        description: "Your emotional intelligence is remarkably strong. You have a deep connection to your feelings and possess powerful intuitive abilities. Your nurturing nature makes you a caring and empathetic individual."
    },
    {
        planet: "Mars",
        emoji: "⚔️",
        trait: "Energy & Courage",
        description: "You are driven by tremendous energy and possess exceptional courage. Your competitive spirit and determination help you overcome obstacles. You approach challenges with boldness and unwavering resolve."
    },
    {
        planet: "Mercury",
        emoji: "💬",
        trait: "Communication & Intelligence",
        description: "Your communication skills are exceptional, and your intellect is sharp. You have a natural ability to articulate complex ideas clearly. Your analytical mind helps you solve problems with ease and creativity."
    }
];

const SceneWhoAmI: React.FC<SceneWhoAmIProps> = ({ onClose }) => {
    const [visibleSections, setVisibleSections] = useState(0);
    const [typingText, setTypingText] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState<boolean[]>([]);  // Track which cards are typing

    useEffect(() => {
        const sequence = async () => {
            // Wait for card to settle
            await new Promise(resolve => setTimeout(resolve, 800));

            // Show sections one by one
            for (let i = 0; i < PLANET_PERSONALITY.length; i++) {
                setVisibleSections(i + 1);

                // Mark as typing started
                setIsTyping(prev => {
                    const newArr = [...prev];
                    newArr[i] = true;
                    return newArr;
                });

                // Typewriter effect for description
                const description = PLANET_PERSONALITY[i].description;
                let currentText = '';

                for (let j = 0; j <= description.length; j++) {
                    currentText = description.substring(0, j);
                    setTypingText(prev => {
                        const newArr = [...prev];
                        newArr[i] = currentText;
                        return newArr;
                    });
                    await new Promise(resolve => setTimeout(resolve, 8)); // Faster typing: 8ms per character
                }

                // Mark as typing finished
                setIsTyping(prev => {
                    const newArr = [...prev];
                    newArr[i] = false;
                    return newArr;
                });

                // Wait before next section
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // Wait at end before closing
            await new Promise(resolve => setTimeout(resolve, 2000));
            onClose();
        };

        sequence();
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.5, rotateY: -90, z: -500, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, z: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotateY: 90, z: -500, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
                style={{ perspective: 1500, transformStyle: 'preserve-3d' }}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 3D Card */}
                <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-slate-800/80 rounded-full hover:bg-slate-700 transition z-20"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/30 p-6"
                    >
                        <div className="flex items-center gap-3 justify-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300">
                                Who Am I?
                            </h2>
                            <Sparkles className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="text-center text-slate-400 text-sm mt-2">
                            Your Personality Based on Planetary Influences
                        </p>
                    </motion.div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-4">
                        <AnimatePresence>
                            {PLANET_PERSONALITY.map((planet, index) => (
                                index < visibleSections && (
                                    <motion.div
                                        key={planet.planet}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            z: isTyping[index] ? 50 : 0,  // Come forward while typing
                                            scale: isTyping[index] ? 1.05 : 1,  // Slightly larger while typing
                                            transition: { type: "spring", stiffness: 100, damping: 15 }
                                        }}
                                        exit={{ opacity: 0, x: 50 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 shadow-lg hover:shadow-purple-500/10 transition-shadow"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Planet Emoji */}
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: 0.2, type: "spring" }}
                                                className="text-4xl flex-shrink-0"
                                            >
                                                {planet.emoji}
                                            </motion.div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <motion.h3
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-xl font-bold text-white mb-1"
                                                >
                                                    {planet.planet}
                                                </motion.h3>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="text-purple-300 text-sm font-semibold mb-2"
                                                >
                                                    {planet.trait}
                                                </motion.p>
                                                <p className="text-slate-300 text-sm leading-relaxed">
                                                    {typingText[index] || ''}
                                                    {typingText[index] && typingText[index].length < planet.description.length && (
                                                        <span className="inline-block w-1 h-4 bg-purple-400 ml-1 animate-pulse" />
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>

                        {/* Loading indicator when not all sections visible */}
                        {visibleSections < PLANET_PERSONALITY.length && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 text-purple-400 py-4"
                            >
                                <Sparkles className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Analyzing your chart...</span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SceneWhoAmI;
