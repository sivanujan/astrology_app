import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Sparkles, ChevronRight, Timer } from 'lucide-react';

// Dummy Dasha data with Apple-style colors
const DASHA_DATA = [
    {
        planet: 'Moon',
        planetTamil: 'சந்திரன்',
        startAge: 0,
        endAge: 10,
        color: 'from-blue-400 to-cyan-400',
        glow: 'rgba(56, 189, 248, 0.5)',
        icon: '🌙',
        subPeriods: [
            { planet: 'Moon', years: '0-1.7', effect: 'Emotional growth' },
            { planet: 'Mars', years: '1.7-2.4', effect: 'Energy boost' },
            { planet: 'Rahu', years: '2.4-4.2', effect: 'Transformation' },
            { planet: 'Jupiter', years: '4.2-5.8', effect: 'Wisdom' },
            { planet: 'Saturn', years: '5.8-7.7', effect: 'Discipline' },
            { planet: 'Mercury', years: '7.7-9.4', effect: 'Learning' },
            { planet: 'Ketu', years: '9.4-10', effect: 'Spirituality' }
        ]
    },
    {
        planet: 'Mars',
        planetTamil: 'செவ்வாய்',
        startAge: 10,
        endAge: 17,
        color: 'from-red-500 to-orange-500',
        glow: 'rgba(239, 68, 68, 0.5)',
        icon: '🔥',
        subPeriods: [
            { planet: 'Mars', years: '10-10.5', effect: 'Action' },
            { planet: 'Rahu', years: '10.5-11.5', effect: 'Ambition' },
            { planet: 'Jupiter', years: '11.5-12.5', effect: 'Growth' },
            { planet: 'Saturn', years: '12.5-13.6', effect: 'Challenges' },
            { planet: 'Mercury', years: '13.6-14.6', effect: 'Skills' },
            { planet: 'Ketu', years: '14.6-15.1', effect: 'Detachment' },
            { planet: 'Venus', years: '15.1-16.3', effect: 'Creativity' },
            { planet: 'Sun', years: '16.3-17', effect: 'Confidence' }
        ]
    },
    {
        planet: 'Rahu',
        planetTamil: 'ராகு',
        startAge: 17,
        endAge: 35,
        color: 'from-purple-500 to-indigo-600',
        glow: 'rgba(168, 85, 247, 0.5)',
        icon: '🌑',
        subPeriods: [
            { planet: 'Rahu', years: '17-19.7', effect: 'Major changes' },
            { planet: 'Jupiter', years: '19.7-22.1', effect: 'Expansion' },
            { planet: 'Saturn', years: '22.1-25', effect: 'Responsibility' },
            { planet: 'Mercury', years: '25-27.5', effect: 'Communication' },
            { planet: 'Ketu', years: '27.5-29.6', effect: 'Spiritual shift' },
            { planet: 'Venus', years: '29.6-32.6', effect: 'Relationships' },
            { planet: 'Sun', years: '32.6-33.5', effect: 'Authority' },
            { planet: 'Moon', years: '33.5-35', effect: 'Emotions' }
        ]
    },
    {
        planet: 'Jupiter',
        planetTamil: 'குரு',
        startAge: 35,
        endAge: 51,
        color: 'from-yellow-400 to-amber-500',
        glow: 'rgba(251, 191, 36, 0.5)',
        icon: '⭐',
        subPeriods: [
            { planet: 'Jupiter', years: '35-37.6', effect: 'Prosperity' },
            { planet: 'Saturn', years: '37.6-40.1', effect: 'Maturity' },
            { planet: 'Mercury', years: '40.1-42.4', effect: 'Knowledge' },
            { planet: 'Ketu', years: '42.4-43.5', effect: 'Wisdom' },
            { planet: 'Venus', years: '43.5-46.7', effect: 'Abundance' },
            { planet: 'Sun', years: '46.7-47.7', effect: 'Recognition' },
            { planet: 'Moon', years: '47.7-49.4', effect: 'Peace' },
            { planet: 'Mars', years: '49.4-51', effect: 'Vitality' }
        ]
    },
    {
        planet: 'Saturn',
        planetTamil: 'சனி',
        startAge: 51,
        endAge: 70,
        color: 'from-blue-600 to-indigo-700',
        glow: 'rgba(79, 70, 229, 0.5)',
        icon: '⏳',
        subPeriods: [
            { planet: 'Saturn', years: '51-54', effect: 'Karma lessons' },
            { planet: 'Mercury', years: '54-56.7', effect: 'Practical wisdom' },
            { planet: 'Ketu', years: '56.7-57.8', effect: 'Liberation' },
            { planet: 'Venus', years: '57.8-61', effect: 'Comfort' },
            { planet: 'Sun', years: '61-62', effect: 'Legacy' },
            { planet: 'Moon', years: '62-64', effect: 'Reflection' },
            { planet: 'Mars', years: '64-65.1', effect: 'Resilience' },
            { planet: 'Rahu', years: '65.1-68', effect: 'Final transformation' },
            { planet: 'Jupiter', years: '68-70', effect: 'Grace' }
        ]
    },
    {
        planet: 'Mercury',
        planetTamil: 'புதன்',
        startAge: 70,
        endAge: 87,
        color: 'from-emerald-400 to-teal-500',
        glow: 'rgba(52, 211, 153, 0.5)',
        icon: '💚',
        subPeriods: [
            { planet: 'Mercury', years: '70-72.8', effect: 'Mental clarity' },
            { planet: 'Ketu', years: '72.8-73.8', effect: 'Detachment' },
            { planet: 'Venus', years: '73.8-76.8', effect: 'Enjoyment' },
            { planet: 'Sun', years: '76.8-77.7', effect: 'Dignity' },
            { planet: 'Moon', years: '77.7-79.4', effect: 'Contentment' },
            { planet: 'Mars', years: '79.4-80.4', effect: 'Strength' },
            { planet: 'Rahu', years: '80.4-83', effect: 'Unconventional' },
            { planet: 'Jupiter', years: '83-85.6', effect: 'Blessings' },
            { planet: 'Saturn', years: '85.6-87', effect: 'Completion' }
        ]
    }
];

export const SceneDashaPremium: React.FC = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll animation - 40 seconds for smooth video
    useEffect(() => {
        const duration = 40000; // 40 seconds total
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setScrollProgress(progress);

            // Actually scroll the container
            if (scrollContainerRef.current) {
                const maxScroll = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight;
                scrollContainerRef.current.scrollTop = progress * maxScroll;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        const timer = setTimeout(() => {
            animate();
        }, 1000); // Start after 1 second

        return () => clearTimeout(timer);
    }, []);

    // Auto-expand cards as they come into view
    useEffect(() => {
        const currentIndex = Math.floor(scrollProgress * DASHA_DATA.length);
        if (currentIndex < DASHA_DATA.length) {
            setExpandedIndex(currentIndex);
        }
    }, [scrollProgress]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a0014] via-[#1a0b2e] to-[#0a0014] overflow-hidden"
            style={{ perspective: '1200px' }}>

            {/* Animated Background Particles */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 5 + Math.random() * 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Header & Stats */}
            <div className="absolute top-0 left-0 right-0 z-20 pt-8 pb-4 bg-gradient-to-b from-[#0a0014] to-transparent">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Vimshottari Dasha Periods</h1>
                    <p className="text-purple-300 text-xl font-light tracking-wide">உங்கள் விம்சோத்தரி தசா காலங்கள்</p>
                </motion.div>

                {/* Apple-Style Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center gap-4 mb-4"
                >
                    {[
                        { label: 'Current Period', value: 'Saturn', sublabel: 'Running', color: '#60a5fa' },
                        { label: 'Next Period', value: 'Mercury', sublabel: 'In 17 Years', color: '#34d399' },
                        { label: 'Life Span', value: '120y', sublabel: 'Total Journey', color: '#a78bfa' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-48 text-center shadow-lg">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mb-1" style={{ color: stat.color }}>{stat.value}</p>
                            <p className="text-white/40 text-xs">{stat.sublabel}</p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scrollable Timeline Container */}
            <div
                ref={scrollContainerRef}
                className="absolute top-64 bottom-24 left-0 right-0 overflow-y-auto overflow-x-hidden px-4 md:px-8 pb-32 scrollbar-hide pt-10"
                style={{
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                <div className="max-w-6xl mx-auto relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 -translate-x-1/2" />

                    {/* Dasha Cards */}
                    <div className="space-y-24 py-8">
                        {DASHA_DATA.map((dasha, index) => {
                            const isExpanded = expandedIndex === index;
                            const isPast = index < (expandedIndex || 0);

                            return (
                                <motion.div
                                    key={dasha.planet}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: isExpanded ? 1.02 : 0.95,
                                        filter: isExpanded ? 'blur(0px)' : 'blur(0px)', // removed blur to ensure clarity
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "circOut"
                                    }}
                                    className={`relative flex items-center ${index % 2 === 0 ? 'justify-end pr-12 md:pr-24' : 'justify-start pl-12 md:pl-24 pl-12'}`}
                                >
                                    {/* Timeline Dot & Connector */}
                                    <div className="absolute left-1/2 top-10 -translate-x-1/2 flex items-center justify-center">
                                        <motion.div
                                            animate={{
                                                scale: isExpanded ? 1.2 : 1,
                                                boxShadow: isExpanded ? `0 0 20px ${dasha.glow}` : `0 0 0px ${dasha.glow}`
                                            }}
                                            className={`w-4 h-4 rounded-full bg-gradient-to-br ${dasha.color} z-20`}
                                        />
                                        <div className={`absolute top-2 w-[100px] h-[1px] bg-gradient-to-r from-transparent to-${dasha.color.split('-')[1]}-500/50 ${index % 2 === 0 ? 'right-full rotate-0' : 'left-full rotate-180'}`} />
                                    </div>

                                    {/* Card */}
                                    <motion.div
                                        className={`w-full max-w-xl group relative`}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className={`
                                            relative bg-[#130b24]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 overflow-hidden transition-all duration-500
                                            ${isExpanded ? 'shadow-2xl border-purple-500/30' : 'shadow-lg hover:border-white/20'}
                                        `}
                                            style={{
                                                boxShadow: isExpanded
                                                    ? `0 20px 50px -12px ${dasha.glow}`
                                                    : '0 10px 30px -10px rgba(0,0,0,0.5)'
                                            }}
                                        >
                                            {/* Glow Overlay */}
                                            {isExpanded && (
                                                <div className={`absolute inset-0 bg-gradient-to-br ${dasha.color} opacity-5 rounded-[2rem]`} />
                                            )}

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dasha.color} p-[1px] shadow-lg`}>
                                                            <div className="w-full h-full bg-[#1a0b2e] rounded-2xl flex items-center justify-center text-2xl">
                                                                {dasha.icon}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-bold text-white tracking-tight">{dasha.planet}</h3>
                                                            <p className="text-purple-300/80 text-sm font-medium uppercase tracking-widest">{dasha.planetTamil}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-3xl font-bold text-white/90 font-mono tracking-tighter">
                                                            {dasha.startAge}<span className="text-white/40 text-xl mx-1">-</span>{dasha.endAge}
                                                        </div>
                                                        <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Years Old</p>
                                                    </div>
                                                </div>

                                                {/* Sub-periods */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.5 }}
                                                            className="border-t border-white/5 pt-6 mt-2"
                                                        >
                                                            <div className="flex items-center gap-2 text-white/60 mb-4 text-xs font-medium uppercase tracking-wider">
                                                                <Sparkles className="w-3 h-3" />
                                                                <span>Bhukti Periods</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {dasha.subPeriods.map((sub, idx) => (
                                                                    <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 flex justify-between items-center group/item cursor-default border border-transparent hover:border-white/5">
                                                                        <div className="flex items-center gap-2">
                                                                            <ChevronRight className="w-3 h-3 text-white/20 group-hover/item:text-white/60" />
                                                                            <div>
                                                                                <p className="text-white font-medium text-sm">{sub.planet}</p>
                                                                                <p className="text-white/30 text-[10px]">{sub.effect}</p>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-white/40 font-mono text-xs">{sub.years}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Progress Bar Header - Replaces Bottom Bar for cleaner look */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-[#130b24]/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 flex items-center gap-4 shadow-2xl">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${scrollProgress * 100}%` }}
                        />
                    </div>
                    <span className="text-white/60 text-xs font-mono w-10 text-right">{Math.round(scrollProgress * 100)}%</span>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};
