import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

const SceneEnding = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        // Animation sequence
        timers.push(setTimeout(() => setStep(1), 500));   // Logo
        timers.push(setTimeout(() => setStep(2), 1500));  // Tagline
        timers.push(setTimeout(() => setStep(3), 2500));  // URL
        timers.push(setTimeout(() => setStep(4), 3500));  // Buttons
        timers.push(setTimeout(() => setStep(5), 4500));  // Social proof

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] overflow-hidden">
            {/* Same Background as Chat Page - Cosmic with Moving Planets */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #0f172a 100%)"
                }}
            >
                {/* Animated Background Orbs (like chat page) */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Large moving orbs */}
                    <motion.div
                        className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                        animate={{
                            x: ["-25%", "125%"],
                            y: ["0%", "100%"],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                        style={{ top: "10%", left: "-10%" }}
                    />
                    <motion.div
                        className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                        animate={{
                            x: ["125%", "-25%"],
                            y: ["100%", "0%"],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                        style={{ bottom: "10%", right: "-10%" }}
                    />
                    <motion.div
                        className="absolute w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"
                        animate={{
                            x: ["50%", "-50%"],
                            y: ["-50%", "150%"],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        }}
                        style={{ top: "50%", left: "50%" }}
                    />
                </div>

                {/* Stars/Particles */}
                {[...Array(40)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.3,
                        }}
                        animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                {/* Logo */}
                {step >= 1 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: -30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.34, 1.56, 0.64, 1], // Bounce easing
                        }}
                        className="mb-8"
                    >
                        <motion.div
                            animate={{
                                opacity: [0, 0.3, 0.2],
                            }}
                            transition={{
                                duration: 1,
                                times: [0, 0.5, 1],
                            }}
                            className="absolute inset-0 bg-purple-500 blur-2xl rounded-full"
                        />
                        <div className="relative text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                            AstroZen
                        </div>
                    </motion.div>
                )}

                {/* Tagline */}
                {step >= 2 && (
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-2xl md:text-3xl font-semibold text-[#E0E7FF] mb-8 text-center"
                        style={{ textShadow: '0 2px 10px rgba(99, 51, 234, 0.5)' }}
                    >
                        Discover Your Cosmic Path
                    </motion.h2>
                )}

                {/* Website URL */}
                {step >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="mb-10"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="text-4xl md:text-5xl font-bold text-[#FFD700] text-center"
                            style={{
                                textShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                            }}
                        >
                            www.astrozen.app
                        </motion.div>
                    </motion.div>
                )}

                {/* CTA Buttons */}
                {step >= 4 && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-10">
                        <motion.button
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-10 py-4 bg-gradient-to-r from-[#6366F1] to-[#EC4899] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all"
                            style={{ boxShadow: '0 4px 20px rgba(147, 51, 234, 0.4)' }}
                        >
                            Get Started Free
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            className="px-10 py-4 bg-transparent border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all"
                        >
                            Learn More
                        </motion.button>
                    </div>
                )}

                {/* Social Proof */}
                {step >= 5 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 text-[#CBD5E1]"
                    >
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{
                                        duration: 0.3,
                                        delay: i * 0.1,
                                        ease: [0.34, 1.56, 0.64, 1],
                                    }}
                                >
                                    <Star className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
                                </motion.div>
                            ))}
                        </div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg font-medium"
                        >
                            100+ Happy Users
                        </motion.span>
                    </motion.div>
                )}

                {/* Subtle Breathing Animation for All Elements */}
                {step >= 5 && (
                    <motion.div
                        animate={{
                            scale: [1, 1.01, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 pointer-events-none"
                    />
                )}
            </div>
        </div>
    );
};

export default SceneEnding;
