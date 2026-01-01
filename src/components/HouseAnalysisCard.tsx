import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, Star, StarHalf, AlertTriangle,
    User, Coins, MessageCircle, Home, Baby, Stethoscope,
    Heart, GraduationCap, Briefcase, TrendingUp, LogOut,
    Shield, Target, Zap
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface HouseData {
    house_number: number;
    title: string;
    subtitle?: string; // e.g. "Simha (Leo)"
    status: 'Excellent' | 'Good' | 'Average' | 'Weak' | 'Critical';
    strength_score?: number; // 0-100
    planets: string[]; // List of planets in this house
    analysis: string;
    guruji_rule_applied?: string;
    moon_phase?: string; // e.g. "Waning Moon"
    recommendations?: string[];
}

interface HouseAnalysisCardProps {
    house: HouseData;
    isExpanded: boolean;
    onToggle: () => void;
    showPlanetsAlways?: boolean;
}

// Map house number to Lucide icon
const getHouseIcon = (num: number) => {
    switch (num) {
        case 1: return <User className="w-5 h-5" />;
        case 2: return <Coins className="w-5 h-5" />;
        case 3: return <MessageCircle className="w-5 h-5" />;
        case 4: return <Home className="w-5 h-5" />;
        case 5: return <Baby className="w-5 h-5" />;
        case 6: return <Stethoscope className="w-5 h-5" />;
        case 7: return <Heart className="w-5 h-5" />;
        case 8: return <AlertTriangle className="w-5 h-5" />;
        case 9: return <GraduationCap className="w-5 h-5" />;
        case 10: return <Briefcase className="w-5 h-5" />;
        case 11: return <TrendingUp className="w-5 h-5" />;
        case 12: return <LogOut className="w-5 h-5" />;
        default: return <Star className="w-5 h-5" />;
    }
};

const getStatusColor = (status: string) => {
    // English & Tamil mappings
    if (['Excellent', 'Strong', 'Positive', 'சிறப்பானது', 'மிகச்சிறப்பு', 'வலுவானவை', 'உச்சம்', 'நல்லது'].some(k => status.includes(k))) {
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
    if (['Good', 'Favorable', 'நன்று', 'பலமானது'].some(k => status.includes(k))) {
        return 'text-green-400 bg-green-500/10 border-green-500/30';
    }
    if (['Average', 'Moderate', 'Mixed', 'Neutral', 'சராசரி', 'மத்திமம்', 'கலவையான'].some(k => status.includes(k))) {
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
    if (['Weak', 'Challenging', 'Unfavorable', 'பலவீனமான', 'கடினம்', 'சவாலான'].some(k => status.includes(k))) {
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    }
    if (['Critical', 'Bad', 'Negative', 'மோசமான', 'ஆபத்து'].some(k => status.includes(k))) {
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
    // Default
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
};

const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
};

const HouseAnalysisCard: React.FC<HouseAnalysisCardProps> = ({
    house,
    isExpanded,
    onToggle,
    showPlanetsAlways = true
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    // Normalize score if missing (fallback logic)
    const score = house.strength_score ||
        (
            ['Excellent', 'Strong', 'Positive', 'சிறப்பானது', 'மிகச்சிறப்பு', 'வலுவானவை', 'உச்சம்', 'நல்லது'].some(k => house.status.includes(k)) ? 90 :
                ['Good', 'Favorable', 'நன்று', 'பலமானது'].some(k => house.status.includes(k)) ? 75 :
                    ['Average', 'Moderate', 'Mixed', 'Neutral', 'சராசரி', 'மத்திமம்', 'கலவையான'].some(k => house.status.includes(k)) ? 50 :
                        ['Weak', 'Challenging', 'Unfavorable', 'பலவீனமான', 'கடினம்', 'சவாலான'].some(k => house.status.includes(k)) ? 30 :
                            ['Critical', 'Bad', 'Negative', 'மோசமான', 'ஆபத்து'].some(k => house.status.includes(k)) ? 20 :
                                50
        );

    const statusStyle = getStatusColor(house.status);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-panel overflow-hidden border transition-all duration-300 ${isExpanded
                ? 'border-purple-500/50 bg-slate-900/90 shadow-xl shadow-purple-900/20'
                : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-600'
                }`}
        >
            {/* Header / Summary View */}
            <div
                onClick={onToggle}
                className="cursor-pointer p-4 group"
            >
                <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Number */}
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border
                            transition-all duration-300 group-hover:scale-105
                            ${house.status === 'Weak' || house.status === 'Critical'
                                ? 'bg-red-900/20 border-red-500/30 text-red-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'}
                        `}>
                            {house.house_number}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base font-bold text-slate-100 leading-tight">
                                    {house.title}
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold tracking-wide whitespace-nowrap flex-shrink-0 ${statusStyle}`}>
                                    {house.status}
                                </span>
                            </div>

                            {/* Strength Bar (Mini) */}
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="w-24 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${getProgressBarColor(score)}`}
                                        style={{ width: `${score}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-slate-400">{score}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Toggle Icon */}
                    <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300'}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>

                {/* Planets Preview (Visible when collapsed if active) */}
                {(showPlanetsAlways || isExpanded) && house.planets && house.planets.length > 0 && (
                    <div className={`mt-3 flex items-center gap-2 text-xs text-slate-400 ${!isExpanded && 'opacity-70'}`}>
                        <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            {house.planets.join(", ")}
                        </span>
                    </div>
                )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 pb-5 pt-0 border-t border-slate-700/30">
                            {/* Icon Strip for Visual Interest */}
                            <div className="flex gap-2 mb-4 -mt-3 justify-end">
                                <div className="bg-slate-900 border border-slate-700 p-1.5 rounded-b-lg shadow-sm">
                                    {getHouseIcon(house.house_number)}
                                </div>
                            </div>

                            {/* Main Analysis Text */}
                            <div className="relative pl-4 border-l-2 border-slate-700 hover:border-purple-500/50 transition-colors mb-5">
                                <p className="text-slate-300 text-sm leading-7">
                                    {house.analysis}
                                </p>
                            </div>

                            {/* Additional Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {/* Guruji Rule */}
                                {house.guruji_rule_applied && (
                                    <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="w-3.5 h-3.5 text-purple-400" />
                                            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                                {isTamil ? "குருஜி விதி" : "Guruji's Rule"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 italic">
                                            {house.guruji_rule_applied}
                                        </p>
                                    </div>
                                )}

                                {/* Recommendations / Tips */}
                                {house.recommendations && house.recommendations.length > 0 && (
                                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                                                {isTamil ? "பரிகாரம்" : "Remedy / Tip"}
                                            </span>
                                        </div>
                                        <ul className="text-xs text-slate-300 space-y-1 ml-1 list-disc list-inside opacity-90">
                                            {house.recommendations.map((rec, i) => (
                                                <li key={i}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HouseAnalysisCard;
