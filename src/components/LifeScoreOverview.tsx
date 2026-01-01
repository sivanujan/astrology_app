import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star, StarHalf, GraduationCap, Coins, Briefcase, Heart,
    Activity, Users, Home, Smile, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LifeScoreOverviewProps {
    lifeQuality: {
        question: string;
        answer: string;
        reason: string;
        totalScore: number;
        starRating: number;
        categories: Record<string, number>;
    };
}

const LifeScoreOverview: React.FC<LifeScoreOverviewProps> = ({ lifeQuality }) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';
    const [isExpanded, setIsExpanded] = useState(false);

    // Helper: Star Render
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                    const isFull = i < Math.floor(rating);
                    const isHalf = i === Math.floor(rating) && rating % 1 !== 0;
                    return (
                        <div key={i} className="relative w-5 h-5">
                            <Star className="w-5 h-5 text-slate-700 absolute top-0 left-0" />
                            {isFull && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 absolute top-0 left-0" />}
                            {isHalf && <StarHalf className="w-5 h-5 text-yellow-400 fill-yellow-400 absolute top-0 left-0" />}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Helper: Progress Bar Color & Status Text
    const getStatusInfo = (score: number, type: string) => {
        if (score >= 71) return {
            color: 'bg-emerald-500',
            textColor: 'text-emerald-400',
            statusEn: 'Excellent',
            statusTa: 'மிகச்சிறப்பு',
            icon: '🟢'
        };
        if (score >= 51) return {
            color: 'bg-yellow-500',
            textColor: 'text-yellow-400',
            statusEn: 'Good/Average',
            statusTa: 'நன்று/சராசரி',
            icon: '🟡'
        };
        if (score >= 31) return {
            color: 'bg-orange-500',
            textColor: 'text-orange-400',
            statusEn: 'Needs Attention',
            statusTa: 'கவனம் தேவை',
            icon: '🟠'
        };
        return {
            color: 'bg-red-500',
            textColor: 'text-red-400',
            statusEn: 'Critical',
            statusTa: 'மிகவும் பலவீனம்',
            icon: '🔴'
        };
    };

    const categoryConfig: Record<string, { icon: React.ReactNode, labelEn: string, labelTa: string, descEn: string, descTa: string }> = {
        education: { icon: <GraduationCap className="w-4 h-4" />, labelEn: "Education", labelTa: "கல்வி", descEn: "Learning & Knowledge", descTa: "கல்வி மற்றும் அறிவு" },
        wealth: { icon: <Coins className="w-4 h-4" />, labelEn: "Wealth", labelTa: "செல்வம்", descEn: "Financial Stability", descTa: "பொருளாதார நிலை" },
        career: { icon: <Briefcase className="w-4 h-4" />, labelEn: "Career", labelTa: "தொழில்", descEn: "Job & Profession", descTa: "வேலை மற்றும் தொழில்" },
        marriage: { icon: <Heart className="w-4 h-4" />, labelEn: "Marriage", labelTa: "திருமணம்", descEn: "Relationship Harmony", descTa: "திருமண வாழ்க்கை" },
        health: { icon: <Activity className="w-4 h-4" />, labelEn: "Health", labelTa: "ஆரோக்கியம்", descEn: "Physical Well-being", descTa: "உடல் நலம்" },
        family: { icon: <Users className="w-4 h-4" />, labelEn: "Family", labelTa: "குடும்பம்", descEn: "Domestic Happiness", descTa: "குடும்ப மகிழ்ச்சி" },
        property: { icon: <Home className="w-4 h-4" />, labelEn: "Property", labelTa: "சொத்து", descEn: "Assets & Home", descTa: "சொத்து சுகம்" },
        happiness: { icon: <Smile className="w-4 h-4" />, labelEn: "Happiness", labelTa: "மகிழ்ச்சி", descEn: "Mental Peace", descTa: "மன அமைதி" }
    };

    return (
        <div className="glass-panel p-0 overflow-hidden mb-8 border border-slate-700/50">
            {/* Header Section */}
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">

                    {/* Left: Overall Score */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            {isTamil ? "வாழ்க்கை தர மதிப்பீடு" : "Life Quality Score"}
                        </h3>

                        <div className="flex items-end gap-4 mb-2">
                            <div className="text-5xl font-bold text-white tracking-tight">
                                {lifeQuality.totalScore}
                                <span className="text-xl text-slate-500 font-normal ml-1">/100</span>
                            </div>
                            <div className="pb-1.5 space-y-1">
                                {renderStars(lifeQuality.starRating)}
                                <div className={`text-sm font-bold ${getStatusInfo(lifeQuality.totalScore, '').textColor}`}>
                                    {isTamil ? getStatusInfo(lifeQuality.totalScore, '').statusTa : getStatusInfo(lifeQuality.totalScore, '').statusEn}
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                            {isTamil
                                ? "உங்கள் ஜாதகத்தின் முக்கிய 8 பிரிவுகளின் அடிப்படையில் கணக்கிடப்பட்ட ஒட்டுமொத்த வாழ்க்கை தரம்."
                                : "Calculated based on 8 key life areas from your birth chart."}
                        </p>
                    </div>

                    {/* Right: Toggle/Action */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition border border-slate-700"
                        >
                            {isExpanded ? (isTamil ? "சுருக்கவும்" : "Collapse") : (isTamil ? "விவரமாக பார்" : "View Breakdown")}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Initial Progress Bar (Visual Summary) */}
                <div className="mt-6 w-full bg-slate-800/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lifeQuality.totalScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${getStatusInfo(lifeQuality.totalScore, '').color}`}
                    />
                </div>
            </div>

            {/* Expanded Detailed Breakdown */}
            <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0 }}
                className="overflow-hidden bg-slate-950/30"
            >
                <div className="p-6 border-t border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-6">
                        {Object.entries(lifeQuality.categories).map(([key, scoreVal]) => {
                            const score = Number(scoreVal);
                            const config = categoryConfig[key];
                            if (!config) return null;
                            const status = getStatusInfo(score, key);

                            return (
                                <div key={key} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="text-slate-400 p-1.5 bg-slate-800 rounded-lg group-hover:text-white transition-colors">
                                                {config.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-200">
                                                    {isTamil ? config.labelTa : config.labelEn}
                                                </div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                    {isTamil ? config.descTa : config.descEn}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-200">
                                                {score}/100
                                            </div>
                                            <div className={`text-[10px] font-medium ${status.textColor} flex items-center justify-end gap-1`}>
                                                {status.icon} {isTamil ? status.statusTa : status.statusEn}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Progress Bar */}
                                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            className={`h-full rounded-full ${status.color}`}
                                        />
                                    </div>

                                    {/* Actionable Tip if Critical (Optional) */}
                                    {(score < 40) && (
                                        <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-red-400/80 italic">
                                            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                            {isTamil ? "பரிகாரம் தேவைப்படும் பகுதி" : "Requires remedial attention"}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LifeScoreOverview;
