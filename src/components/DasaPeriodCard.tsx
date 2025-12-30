import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Calendar, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DasaScoreBreakdown } from '../utils/dashaScoring';
import { useLanguage } from '../contexts/LanguageContext';

interface DasaPeriodCardProps {
    planetName: string;
    periodType: 'Maha' | 'Antar' | 'Pratyantar';
    startDate: string;
    endDate: string;
    dasaScore: DasaScoreBreakdown;
    effectPercentage: number;
    onViewDetails?: () => void;
    onViewRemedies?: () => void;
}

const DasaPeriodCard: React.FC<DasaPeriodCardProps> = ({
    planetName,
    periodType,
    startDate,
    endDate,
    dasaScore,
    effectPercentage,
    onViewDetails,
    onViewRemedies
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';
    const [showBreakdown, setShowBreakdown] = useState(false);

    // Helper functions
    const getQualityColor = () => {
        // Updated thresholds for 0-100 scale
        // Excellent (75+), Very Good (60+), Good (45+), Average (30+), Bad (15+), Very Bad (<15)
        const score = dasaScore.totalScore;
        if (score >= 75) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-blue-500 to-cyan-500';
        if (score >= 45) return 'from-purple-500 to-pink-500';
        if (score >= 30) return 'from-yellow-500 to-orange-500';
        if (score >= 15) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-red-700'; // Negative score
    };

    const getQualityText = () => {
        return isTamil ? dasaScore.description.ta.split(' - ')[0] : dasaScore.description.en.split(' - ')[0];
    };

    const getPlanetNameTamil = (planet: string) => {
        const names: Record<string, string> = {
            'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்',
            'Mercury': 'புதன்', 'Jupiter': 'குரு', 'Venus': 'சுக்ரன்',
            'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
        };
        return names[planet] || planet;
    };

    const getPeriodTypeText = () => {
        if (!isTamil) {
            return periodType === 'Maha' ? 'Maha Dasa' :
                periodType === 'Antar' ? 'Bhukti' : 'Antaram';
        }

        const tamilTypes: Record<string, string> = {
            'Maha': 'மகா தசை',
            'Antar': 'புக்தி',
            'Pratyantar': 'அந்தரம்'
        };
        return tamilTypes[periodType] || periodType + ' தசை';
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const displayPlanetName = isTamil ? getPlanetNameTamil(planetName) : planetName;

    // Normalize score for progress bar (now 0-100)
    const progressPercent = Math.min(100, Math.max(0, dasaScore.totalScore));

    // Calculate Star Rating based on quality
    const getStarCount = () => {
        const s = dasaScore.totalScore;
        if (s >= 75) return 5;
        if (s >= 60) return 4;
        if (s >= 45) return 3;
        if (s >= 15) return 2;
        return 1;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 p-6 rounded-lg border border-slate-600 hover:border-purple-400 transition-all duration-300 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {displayPlanetName} {getPeriodTypeText()}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                        <Calendar className="w-4 h-4 text-purple-300" />
                        <span className="font-medium">{formatDate(startDate)} - {formatDate(endDate)}</span>
                    </div>
                </div>
            </div>

            {/* Score Display */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {/* Star Rating */}
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= getStarCount()
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-500'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-2xl font-bold text-white">
                            {dasaScore.totalScore}/100
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2 relative border border-slate-700">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${getQualityColor()}`}
                    />
                </div>

                {/* Quality Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getQualityColor()} bg-opacity-20 border border-current text-sm font-semibold`}>
                    <TrendingUp className="w-4 h-4" />
                    {getQualityText()}
                </div>
            </div>

            {/* Breakdown Accordion */}
            <div className="mb-4 bg-slate-700/30 rounded-lg overflow-hidden border border-slate-700">
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                    <span>{isTamil ? 'மதிப்பெண் விவரம்' : 'Score Breakdown'}</span>
                    {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                    {showBreakdown && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 pt-0 text-sm space-y-2 border-t border-slate-700/50">
                                <div className="flex justify-between text-slate-400">
                                    <span>{isTamil ? 'ஸ்தான பலம்' : 'Sthana Bala'}:</span>
                                    <span className="font-mono text-white flex items-center gap-2">
                                        <span className="text-xs text-slate-500">[{dasaScore.sthanaBalaDetails}]</span> {dasaScore.sthanaBala}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>{isTamil ? 'ஆதிபத்திய பலம்' : 'Lordship Score'}:</span>
                                    <span className={`font-mono ${dasaScore.lordshipScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {dasaScore.lordshipScore > 0 ? '+' : ''}{dasaScore.lordshipScore}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>{isTamil ? 'சுபத்துவம்/பாபத்துவம்' : 'Subathuvam Score'}:</span>
                                    <span className={`font-mono ${dasaScore.subathuvamScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {dasaScore.subathuvamScore > 0 ? '+' : ''}{dasaScore.subathuvamScore}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>{isTamil ? 'பார்வை பலம்' : 'Aspect Score'}:</span>
                                    <span className={`font-mono ${dasaScore.aspectScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {dasaScore.aspectScore > 0 ? '+' : ''}{dasaScore.aspectScore}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>{isTamil ? 'நட்சத்திர பலம்' : 'Nakshatra Score'}:</span>
                                    <span className={`font-mono ${dasaScore.nakshatraScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {dasaScore.nakshatraScore > 0 ? '+' : ''}{dasaScore.nakshatraScore}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Effect Percentage */}
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                    <span className="text-slate-100 text-sm font-medium">
                        {isTamil ? 'தாக்கம்' : 'Effect'}:
                    </span>
                    <span className="text-purple-200 font-bold text-lg">
                        {effectPercentage}% ({isTamil ? 'முக்கிய தாக்கம்' : 'Main influence'})
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={onViewDetails}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded-lg text-white font-medium transition-colors shadow-sm"
                >
                    <Info className="w-4 h-4" />
                    {isTamil ? 'விவரங்கள்' : 'View Details'}
                </button>
            </div>
        </motion.div >
    );
};

export default DasaPeriodCard;
