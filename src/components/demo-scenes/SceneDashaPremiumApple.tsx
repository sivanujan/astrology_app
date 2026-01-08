import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Calendar, Clock, Search, ChevronDown, ChevronRight, Timer, ArrowRight, Sparkles } from 'lucide-react';

// Dasha data with proper colors
const DASHA_PERIODS = [
    { planet: 'Rahu', planetTamil: 'ராகு', color: '#9333ea', icon: '🌑', start: '29 Apr 2000', end: '08 May 2008', progress: 100, years: 18 },
    { planet: 'Jupiter', planetTamil: 'குரு', color: '#fbbf24', icon: '⭐', start: '08 May 2008', end: '08 May 2024', progress: 100, years: 16 },
    {
        planet: 'Saturn',
        planetTamil: 'சனி',
        color: '#3b82f6',
        icon: '⏳',
        start: '08 May 2024',
        end: '08 May 2043',
        progress: 9,
        years: 19,
        isCurrent: true,
        remaining: '17y 3mo',
        subPeriods: [
            { planet: 'Saturn', color: '#9333ea', start: '08 May 2024', end: '11 May 2027', remaining: '16mo', status: 'current' },
            { planet: 'Mercury', color: '#10b981', start: '11 May 2027', end: '18 Jan 2030', remaining: '16mo', status: 'upcoming' },
            { planet: 'Ketu', color: '#f97316', start: '18 Jan 2030', end: '27 Feb 2031', remaining: '48mo', status: 'upcoming' },
            { planet: 'Venus', color: '#ec4899', start: '27 Feb 2031', end: '29 Apr 2034', remaining: '61mo', status: 'upcoming' },
            { planet: 'Sun', color: '#ff6b35', start: '29 Apr 2034', end: '13 Apr 2035', remaining: '85mo', status: 'upcoming' },
        ]
    },
    { planet: 'Mercury', planetTamil: 'புதன்', color: '#10b981', icon: '💚', start: '08 May 2043', end: '08 May 2060', progress: 0, years: 17 },
    { planet: 'Ketu', planetTamil: 'கேது', color: '#f97316', icon: '☄️', start: '08 May 2060', end: '08 May 2067', progress: 0, years: 7 },
    { planet: 'Venus', planetTamil: 'சுக்ரன்', color: '#ec4899', icon: '💗', start: '08 May 2067', end: '08 May 2087', progress: 0, years: 20 },
    { planet: 'Sun', planetTamil: 'சூரியன்', color: '#ff6b35', icon: '☀️', start: '08 May 2087', end: '08 May 2093', progress: 0, years: 6 },
    { planet: 'Moon', planetTamil: 'சந்திரன்', color: '#cbd5e1', icon: '🌙', start: '08 May 2093', end: '08 May 2103', progress: 0, years: 10 },
    { planet: 'Mars', planetTamil: 'செவ்வாய்', color: '#ef4444', icon: '🔥', start: '08 May 2103', end: '08 May 2110', progress: 0, years: 7 },
];

export const SceneDashaPremiumApple: React.FC = () => {
    const [phase, setPhase] = useState<'logo' | 'title' | 'stats' | 'timeline' | 'expand' | 'scroll' | 'detail' | 'final'>('logo');
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [visibleCards, setVisibleCards] = useState<number>(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Animation sequence controller
    useEffect(() => {
        const sequence = async () => {
            // Logo phase (0-2s)
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPhase('title');

            // Title phase (2-4s)
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPhase('stats');

            // Stats cards (4-7s)
            await new Promise(resolve => setTimeout(resolve, 3000));
            setPhase('timeline');

            // Timeline cards appear one by one (7-10s)
            for (let i = 0; i < 3; i++) {
                setVisibleCards(i + 1);
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // Expand Saturn card (10-13s)
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPhase('expand');
            setExpandedCard(2);

            // Scroll reveal (13-16s)
            await new Promise(resolve => setTimeout(resolve, 3000));
            setPhase('scroll');

            // Show remaining cards
            for (let i = 3; i < DASHA_PERIODS.length; i++) {
                setVisibleCards(i + 1);
                await new Promise(resolve => setTimeout(resolve, 400));
            }

            // Detail view (18-22s)
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPhase('detail');

            // Final composition (22-25s)
            await new Promise(resolve => setTimeout(resolve, 4000));
            setPhase('final');
        };

        sequence();
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a0014] via-[#1a0b2e] to-[#0a0014] overflow-hidden"
            style={{ perspective: '1200px' }}>

            {/* Floating particles */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Logo reveal (0-2s) */}
            <AnimatePresence>
                {phase === 'logo' && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                duration: 1.5
                            }}
                            className="relative"
                        >
                            <div className="text-8xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                AstroZen
                            </div>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-3xl opacity-50"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Title sequence (2-4s) */}
            <AnimatePresence>
                {(phase === 'title' || phase === 'stats' || phase === 'timeline' || phase === 'expand' || phase === 'scroll' || phase === 'detail' || phase === 'final') && (
                    <motion.div
                        className="absolute top-20 left-0 right-0 text-center z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <motion.h1 className="text-7xl font-bold text-white mb-4">
                            {"Vimshottari Dasha Periods".split('').map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ y: 50, opacity: 0, filter: 'blur(10px)' }}
                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                    transition={{
                                        delay: i * 0.08,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20
                                    }}
                                    className="inline-block"
                                    style={{ textShadow: '0 0 30px rgba(147, 51, 234, 0.5)' }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 0.7, scale: 1 }}
                            transition={{ delay: 2, duration: 0.8 }}
                            className="text-2xl text-gray-400 font-light"
                        >
                            Dasha Timeline
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats cards (4-7s) */}
            <AnimatePresence>
                {(phase === 'stats' || phase === 'timeline' || phase === 'expand' || phase === 'scroll') && (
                    <motion.div className="absolute top-64 left-0 right-0 flex justify-center gap-6 z-10">
                        {[
                            { label: 'Current Period', value: 'Saturn', sublabel: '17y 3mo left', color: '#3b82f6', delay: 0 },
                            { label: 'Next Period', value: 'Mercury', sublabel: 'in 17y 3mo', color: '#10b981', delay: 0.3 },
                            { label: 'Total Periods', value: '10', sublabel: 'Maha Dashas', color: '#9333ea', delay: 0.6 },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -200, rotateX: -30, opacity: 0 }}
                                animate={{ y: 0, rotateX: 0, opacity: 1 }}
                                exit={{ y: -100, opacity: 0 }}
                                transition={{
                                    delay: stat.delay,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 15
                                }}
                                className="relative"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-64"
                                    style={{
                                        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${stat.color}40`
                                    }}>
                                    <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                                    <p className="text-4xl font-bold text-white mb-1" style={{ color: stat.color }}>
                                        {stat.value}
                                    </p>
                                    <p className="text-gray-500 text-sm flex items-center gap-2">
                                        <Timer className="w-4 h-4" />
                                        {stat.sublabel}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeline cards (7-16s) */}
            {(phase === 'timeline' || phase === 'expand' || phase === 'scroll') && (
                <div
                    ref={scrollRef}
                    className="absolute top-[28rem] left-0 right-0 bottom-32 overflow-y-auto overflow-x-hidden px-20 scrollbar-hide"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="max-w-4xl mx-auto space-y-6 pb-20">
                        {DASHA_PERIODS.slice(0, visibleCards).map((dasha, index) => (
                            <DashaCard
                                key={index}
                                dasha={dasha}
                                index={index}
                                isExpanded={expandedCard === index}
                                phase={phase}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Current period detail view (18-22s) */}
            <AnimatePresence>
                {phase === 'detail' && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, rotateY: -30, opacity: 0 }}
                            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12 max-w-5xl"
                            style={{
                                transformStyle: 'preserve-3d',
                                boxShadow: '0 40px 100px rgba(147, 51, 234, 0.6)'
                            }}
                        >
                            <h2 className="text-5xl font-bold text-white mb-8 text-center">
                                Your Current Dasha Period
                            </h2>

                            <div className="grid grid-cols-3 gap-8 mb-8">
                                <div className="text-center">
                                    <p className="text-gray-400 mb-2">Maha Dasha</p>
                                    <div className="text-6xl mb-2">⏳</div>
                                    <p className="text-4xl font-bold text-blue-400">Saturn</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 mb-2">Bhukti</p>
                                    <div className="text-5xl mb-2">⏳</div>
                                    <p className="text-3xl font-bold text-purple-400">Saturn</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 mb-2">Antaram</p>
                                    <div className="text-4xl mb-2">☀️</div>
                                    <p className="text-2xl font-bold text-orange-400">Sun</p>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-gray-400 mb-2">Period</p>
                                <p className="text-2xl text-white mb-4">08 May 2024 - 08 May 2043</p>
                                <p className="text-3xl font-bold text-cyan-400 flex items-center justify-center gap-3">
                                    <Clock className="w-8 h-8" />
                                    17 years 3 months remaining
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Final composition (22-25s) */}
            <AnimatePresence>
                {phase === 'final' && (
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.p
                            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-5xl font-light text-white mb-12 text-center"
                        >
                            Your Cosmic Journey, Mapped Out
                        </motion.p>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 20 }}
                            className="text-8xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-8"
                        >
                            AstroZen
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2, duration: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-semibold rounded-full shadow-2xl"
                            style={{ boxShadow: '0 20px 60px rgba(147, 51, 234, 0.6)' }}
                        >
                            Start Your Journey Today
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hide scrollbar */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

// Individual Dasha Card Component
const DashaCard: React.FC<{
    dasha: typeof DASHA_PERIODS[0];
    index: number;
    isExpanded: boolean;
    phase: string;
}> = ({ dasha, index, isExpanded, phase }) => {
    return (
        <motion.div
            initial={{ y: -400, rotateX: -45, rotateZ: -5, scale: 0.8, opacity: 0, filter: 'blur(15px)' }}
            animate={{
                y: 0,
                rotateX: 0,
                rotateZ: 0,
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
                height: isExpanded ? 'auto' : '120px'
            }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: index * 0.15
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative"
        >
            <div
                className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border rounded-3xl p-6 overflow-hidden ${dasha.isCurrent ? 'border-purple-500/60' : 'border-white/10'
                    }`}
                style={{
                    boxShadow: dasha.isCurrent
                        ? `0 30px 80px ${dasha.color}80, 0 0 100px ${dasha.color}40`
                        : '0 20px 60px rgba(0,0,0,0.5)'
                }}
            >
                {/* Planet dot with glow */}
                <motion.div
                    className="absolute -left-4 top-8 w-8 h-8 rounded-full flex items-center justify-center text-xl"
                    style={{
                        background: dasha.color,
                        boxShadow: `0 0 30px ${dasha.color}, 0 0 60px ${dasha.color}80`
                    }}
                    animate={dasha.isCurrent ? {
                        boxShadow: [
                            `0 0 30px ${dasha.color}, 0 0 60px ${dasha.color}80`,
                            `0 0 50px ${dasha.color}, 0 0 100px ${dasha.color}`,
                            `0 0 30px ${dasha.color}, 0 0 60px ${dasha.color}80`,
                        ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {dasha.icon}
                </motion.div>

                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-1">{dasha.planet} Maha Dasha</h3>
                        <p className="text-gray-400">{dasha.planetTamil} தசை</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">{dasha.start} - {dasha.end}</p>
                        <p className="text-lg text-gray-300">{dasha.years} years</p>
                    </div>
                </div>

                {/* Current period badge */}
                {dasha.isCurrent && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                        className="inline-block px-4 py-2 bg-pink-500/20 border border-pink-500/40 rounded-full text-pink-400 text-sm font-semibold mb-4"
                    >
                        ⚡ Current Period
                    </motion.div>
                )}

                {/* Progress bar */}
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                            background: dasha.progress === 100 ? '#10b981' : dasha.color,
                            width: `${dasha.progress}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${dasha.progress}%` }}
                        transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                    />
                    {dasha.isCurrent && dasha.progress < 100 && (
                        <motion.div
                            className="absolute top-0 bottom-0 w-3 bg-white rounded-full"
                            style={{ left: `${dasha.progress}%` }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </div>

                {/* Sub-periods (expanded) */}
                <AnimatePresence>
                    {isExpanded && dasha.subPeriods && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="mt-6 space-y-3"
                        >
                            <p className="text-purple-300 font-semibold mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Sub-Periods (Bhukti)
                            </p>
                            {dasha.subPeriods.map((sub, subIndex) => (
                                <motion.div
                                    key={subIndex}
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: subIndex * 0.15, type: "spring", stiffness: 100, damping: 20 }}
                                    className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ background: sub.color, boxShadow: `0 0 10px ${sub.color}` }}
                                        />
                                        <div>
                                            <p className="text-white font-semibold">{sub.planet} Bhukti</p>
                                            <p className="text-gray-400 text-sm">{sub.start} - {sub.end}</p>
                                        </div>
                                    </div>
                                    <p className="text-cyan-400 text-sm font-mono">
                                        {sub.status === 'current' ? `⏱ ${sub.remaining} remaining` : `Starts in ${sub.remaining}`}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
