import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SceneEndingPremium = () => {
    const [scene, setScene] = useState(0);
    const letters = ['A', 's', 't', 'r', 'o', 'Z', 'e', 'n'];

    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        // Extended scene progression
        timers.push(setTimeout(() => setScene(1), 0));     // Logo intro (longer)
        timers.push(setTimeout(() => setScene(2), 4000));  // Title reveal
        timers.push(setTimeout(() => setScene(3), 7000));  // Planets appear
        timers.push(setTimeout(() => setScene(4), 10000)); // Tagline
        timers.push(setTimeout(() => setScene(5), 13000)); // 3D transform
        timers.push(setTimeout(() => setScene(6), 16000)); // Particles
        timers.push(setTimeout(() => setScene(7), 19000)); // Final hold

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="fixed inset-0 z-[10000] bg-black overflow-hidden">
            {/* Cosmic particles background */}
            {scene >= 6 && (
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: Math.random() * 4 + 1,
                                height: Math.random() * 4 + 1,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: i % 2 === 0 ? '#8b5cf6' : '#3b82f6',
                                filter: 'blur(1px)',
                            }}
                            animate={{
                                x: [0, Math.random() * 200 - 100],
                                y: [0, Math.random() * 200 - 100],
                                opacity: [0, 0.8, 0],
                                scale: [0, 1, 0],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Orbiting Planets */}
            {scene >= 3 && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Planet 1 - Purple */}
                    <motion.div
                        className="absolute w-16 h-16 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #a78bfa, #7c3aed)',
                            boxShadow: '0 0 30px rgba(167, 139, 250, 0.6)',
                        }}
                        animate={{
                            x: ['-10%', '110%'],
                            y: ['20%', '80%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Planet 2 - Blue */}
                    <motion.div
                        className="absolute w-12 h-12 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb)',
                            boxShadow: '0 0 25px rgba(96, 165, 250, 0.6)',
                        }}
                        animate={{
                            x: ['110%', '-10%'],
                            y: ['30%', '70%'],
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Planet 3 - Cyan */}
                    <motion.div
                        className="absolute w-10 h-10 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 30% 30%, #22d3ee, #0891b2)',
                            boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
                        }}
                        animate={{
                            x: ['-10%', '110%'],
                            y: ['60%', '40%'],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                </div>
            )}

            {/* Main content container */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: '1000px' }}
            >
                <motion.div
                    animate={scene >= 5 ? {
                        rotateX: [0, 15, 0],
                        rotateY: [0, -10, 0],
                        scale: [1, 1.05, 1.02],
                    } : {}}
                    transition={{
                        duration: 3,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative flex flex-col items-center gap-6"
                >
                    {/* SCENE 1: Logo Introduction - ALWAYS VISIBLE */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={scene >= 1 ? {
                            scale: scene >= 2 ? 0.6 : [0, 0.1, 1.2, 1],
                            opacity: 1,
                            rotate: scene >= 2 ? 0 : [0, 180, 360],
                            y: scene >= 2 ? -80 : 0,
                        } : {}}
                        transition={{
                            duration: scene >= 2 ? 0.8 : 3,
                            ease: [0.34, 1.56, 0.64, 1],
                        }}
                        className="relative"
                    >
                        {/* Particle burst - only on initial reveal */}
                        {scene === 1 && [...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                }}
                                animate={{
                                    x: Math.cos((i / 12) * Math.PI * 2) * 120,
                                    y: Math.sin((i / 12) * Math.PI * 2) * 120,
                                    opacity: [1, 0],
                                    scale: [1, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: 1.5,
                                }}
                            />
                        ))}

                        {/* Logo with gradient glow */}
                        <div className="relative">
                            {/* Purple-blue gradient glow */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 70%)',
                                    filter: 'blur(20px)',
                                }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.6, 0.8, 0.6],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />

                            {/* Actual Logo */}
                            <motion.img
                                src="/logo2.png"
                                alt="AstroZen Logo"
                                className="relative w-32 h-32 object-contain"
                                style={{
                                    filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8))',
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* SCENE 2-7: Title and effects */}
                    {scene >= 2 && (
                        <div className="flex flex-col items-center gap-6">
                            {/* AstroZen Title - Letter by letter */}
                            <div className="flex items-center justify-center gap-1">
                                {letters.map((letter, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{
                                            y: 100,
                                            opacity: 0,
                                            scale: 0.5,
                                            rotate: -10,
                                            filter: 'blur(10px)',
                                        }}
                                        animate={{
                                            y: 0,
                                            opacity: 1,
                                            scale: letter === 'Z' ? [0.5, 1.2, 1] : [0.5, 1.05, 1],
                                            rotate: 0,
                                            filter: 'blur(0px)',
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            delay: i * 0.1,
                                            ease: [0.4, 0.0, 0.2, 1],
                                        }}
                                        className="font-bold text-white relative"
                                        style={{
                                            fontSize: '100px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                            letterSpacing: '-0.02em',
                                            textShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        {letter}
                                        {/* Glow pulse on 'r' */}
                                        {letter === 'r' && scene >= 2 && (
                                            <motion.span
                                                className="absolute inset-0"
                                                animate={{
                                                    opacity: [0, 0.5, 0],
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    delay: i * 0.1 + 0.3,
                                                }}
                                                style={{
                                                    filter: 'blur(20px)',
                                                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                                                }}
                                            />
                                        )}
                                    </motion.span>
                                ))}
                            </div>

                            {/* NEW: Tagline below AstroZen */}
                            {scene >= 3 && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                    className="text-2xl font-light text-gray-200 mt-3"
                                    style={{
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                        letterSpacing: '0.02em'
                                    }}
                                >
                                    Discover Your Cosmic Destiny
                                </motion.p>
                            )}

                            {/* NEW: Feature Highlights - Scene 4+ */}
                            {scene >= 4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="flex flex-col gap-3 mt-6"
                                >
                                    {[
                                        { icon: '✨', text: 'Free Birth Charts' },
                                        { icon: '🔮', text: 'AI Astrologer 24/7' },
                                        { icon: '💑', text: 'Marriage Compatibility' }
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + i * 0.1 }}
                                            className="flex items-center gap-3 text-gray-300"
                                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                        >
                                            <span className="text-2xl">{feature.icon}</span>
                                            <span className="text-lg font-light">{feature.text}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Website URL - Scene 5+ */}
                            {scene >= 5 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                                    className="flex flex-col items-center gap-4 mt-8"
                                >
                                    <motion.p
                                        className="text-sm font-light text-gray-400"
                                        style={{
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                        }}
                                    >
                                        Check out
                                    </motion.p>
                                    <motion.a
                                        href="https://astrozen.app"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-2xl font-semibold"
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        style={{
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
                                        }}
                                    >
                                        astrozen.app
                                    </motion.a>

                                    {/* NEW: Dual CTA Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="flex items-center gap-4 mt-3"
                                    >
                                        <motion.a
                                            href="https://astrozen.app"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 rounded-full font-semibold text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                            }}
                                        >
                                            Get Started Free
                                        </motion.a>
                                        <motion.a
                                            href="https://astrozen.app"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 rounded-full font-semibold text-white border-2 border-white/20"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                backdropFilter: 'blur(10px)',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                            }}
                                        >
                                            Learn More
                                        </motion.a>
                                    </motion.div>

                                    {/* NEW: Trust Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="flex items-center gap-2 mt-4 text-gray-400 text-sm"
                                    >
                                        <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                        <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                                            100+ Happy Users
                                        </span>
                                    </motion.div>

                                    {/* Copyright */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        className="text-xs text-gray-500 mt-6"
                                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                    >
                                        © 2026 Astrozen. All rights reserved by Saturn 🪐
                                    </motion.p>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* SCENE 7: Breathing animation */}
                    {scene >= 7 && (
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            animate={{
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    )}
                </motion.div>
            </div>

            {/* Background glow */}
            {scene >= 3 && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0.2] }}
                    transition={{ duration: 2 }}
                    style={{
                        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                    }}
                />
            )}
        </div>
    );
};

export default SceneEndingPremium;
