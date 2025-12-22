import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Calendar, Info, Sparkles } from 'lucide-react';
import { DasaScore } from '../utils/dasaAnalysis';
import { useLanguage } from '../contexts/LanguageContext';

interface DasaPeriodCardProps {
    planetName: string;
    periodType: 'Maha' | 'Antar' | 'Pratyantar';
    startDate: string;
    endDate: string;
    dasaScore: DasaScore;
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

    // Helper functions
    const getQualityColor = () => {
        switch (dasaScore.quality) {
            case 'EXCELLENT':
                return 'from-green-500 to-emerald-500';
            case 'VERY GOOD':
                return 'from-blue-500 to-cyan-500';
            case 'GOOD':
                return 'from-purple-500 to-pink-500';
            case 'AVERAGE':
                return 'from-yellow-500 to-orange-500';
            case 'CHALLENGING':
                return 'from-orange-500 to-red-500';
            case 'DIFFICULT':
                return 'from-red-500 to-red-700';
            default:
                return 'from-slate-500 to-slate-600';
        }
    };

    const getPlanetNameTamil = (planet: string) => {
        const names: Record<string, string> = {
            'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்',
            'Mercury': 'புதன்', 'Jupiter': 'குரு', 'Venus': 'சுக்ரன்',
            'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
        };
        return names[planet] || planet;
    };

    const getQualityText = () => {
        if (!isTamil) return dasaScore.quality.replace('_', ' ');

        const tamilQuality: Record<string, string> = {
            'EXCELLENT': 'மிகச்சிறந்த காலம்',
            'VERY GOOD': 'மிக நல்ல காலம்',
            'GOOD': 'நல்ல காலம்',
            'AVERAGE': 'சராசரி காலம்',
            'CHALLENGING': 'கஷ்டமான காலம்',
            'DIFFICULT': 'மிக கஷ்டமான காலம்'
        };
        return tamilQuality[dasaScore.quality] || dasaScore.quality;
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300"
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
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
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
                                    className={`w-5 h-5 ${star <= dasaScore.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-600'
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
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dasaScore.totalScore}%` }}
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

            {/* Effect Percentage */}
            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                        {isTamil ? 'தாக்கம்' : 'Effect'}:
                    </span>
                    <span className="text-purple-400 font-bold text-lg">
                        {effectPercentage}% ({isTamil ? 'முக்கிய தாக்கம்' : 'Main influence'})
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={onViewDetails}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 font-medium transition-colors"
                >
                    <Info className="w-4 h-4" />
                    {isTamil ? 'விவரங்கள்' : 'View Details'}
                </button>
            </div>
        </motion.div>
    );
};

export default DasaPeriodCard;
