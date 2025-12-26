import React from 'react';
import { DasaScoreBreakdown, DasaQuality } from '../utils/dashaScoring';

interface Props {
    planetName: string;
    scoreBreakdown: DasaScoreBreakdown;
    language: 'en' | 'ta';
}

export const DashaScoreCard: React.FC<Props> = ({ planetName, scoreBreakdown, language }) => {
    const getQualityColor = (quality: DasaQuality): string => {
        switch (quality) {
            case DasaQuality.EXCELLENT:
                return 'bg-gradient-to-r from-green-500 to-emerald-600';
            case DasaQuality.VERY_GOOD:
                return 'bg-gradient-to-r from-blue-500 to-cyan-600';
            case DasaQuality.GOOD:
                return 'bg-gradient-to-r from-teal-500 to-green-500';
            case DasaQuality.AVERAGE:
                return 'bg-gradient-to-r from-yellow-500 to-orange-500';
            case DasaQuality.BAD:
                return 'bg-gradient-to-r from-orange-500 to-red-500';
            case DasaQuality.VERY_BAD:
                return 'bg-gradient-to-r from-red-600 to-pink-600';
            default:
                return 'bg-gray-500';
        }
    };

    const getScoreColor = (score: number, max: number, isNegative: boolean = false): string => {
        const percentage = isNegative ? Math.abs(score) / Math.abs(max) : score / max;
        if (percentage >= 0.7) return score >= 0 ? 'text-green-400' : 'text-red-400';
        if (percentage >= 0.4) return score >= 0 ? 'text-yellow-400' : 'text-orange-400';
        return 'text-gray-400';
    };

    const maxScores = {
        sthanaBala: 100,
        lordship: 40,
        subathuvam: 40,
        aspect: 20,
        nakshatra: 25
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {planetName} {language === 'ta' ? 'தசை மதிப்பெண்' : 'Dasa Score'}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {language === 'ta' ? scoreBreakdown.description.ta : scoreBreakdown.description.en}
                    </p>
                </div>
                <div className="text-right">
                    <div className={`inline-block px-4 py-2 rounded-lg ${getQualityColor(scoreBreakdown.quality)} text-white font-bold text-lg shadow-lg`}>
                        {scoreBreakdown.quality}
                    </div>
                </div>
            </div>

            {/* Total Score */}
            <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-gray-400">
                        {language === 'ta' ? 'மொத்த மதிப்பெண்' : 'Total Score'}
                    </span>
                    <span className="text-4xl font-bold text-white">
                        {scoreBreakdown.totalScore.toFixed(0)}
                        <span className="text-xl text-gray-400 ml-2">/ 225</span>
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                        className={`h-full ${getQualityColor(scoreBreakdown.quality)} transition-all duration-500 shadow-lg`}
                        style={{ width: `${Math.max(0, (scoreBreakdown.totalScore + 55) / 280 * 100)}%` }}
                    />
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wide mb-3">
                    {language === 'ta' ? 'மதிப்பெண் பிரிவுகள்' : 'Score Breakdown'}
                </h4>

                {/* Sthana Bala */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                        {language === 'ta' ? 'ஸ்தான பலம்' : 'House Strength'}
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-full rounded-full ${scoreBreakdown.sthanaBala >= 70 ? 'bg-green-500' : scoreBreakdown.sthanaBala >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${scoreBreakdown.sthanaBala}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${getScoreColor(scoreBreakdown.sthanaBala, maxScores.sthanaBala)}`}>
                            {scoreBreakdown.sthanaBala.toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Lordship Score */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                        {language === 'ta' ? 'அதிபத்திய மதிப்பெண்' : 'Lordship Score'}
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-full rounded-full ${scoreBreakdown.lordshipScore >= 20 ? 'bg-green-500' : scoreBreakdown.lordshipScore >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${(scoreBreakdown.lordshipScore + 30) / 70 * 100}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${getScoreColor(scoreBreakdown.lordshipScore, maxScores.lordship)}`}>
                            {scoreBreakdown.lordshipScore >= 0 ? '+' : ''}{scoreBreakdown.lordshipScore.toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Subathuvam Score */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                        {language === 'ta' ? 'சுபத்துவ மதிப்பெண்' : 'Subathuvam Score'}
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-full rounded-full ${scoreBreakdown.subathuvamScore >= 20 ? 'bg-green-500' : scoreBreakdown.subathuvamScore >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${(scoreBreakdown.subathuvamScore + 90) / 130 * 100}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${getScoreColor(scoreBreakdown.subathuvamScore, maxScores.subathuvam)}`}>
                            {scoreBreakdown.subathuvamScore >= 0 ? '+' : ''}{scoreBreakdown.subathuvamScore.toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Aspect Score */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                        {language === 'ta' ? 'பார்வை மதிப்பெண்' : 'Aspect Score'}
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-full rounded-full ${scoreBreakdown.aspectScore >= 10 ? 'bg-green-500' : scoreBreakdown.aspectScore >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${(scoreBreakdown.aspectScore + 15) / 35 * 100}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${getScoreColor(scoreBreakdown.aspectScore, maxScores.aspect)}`}>
                            {scoreBreakdown.aspectScore >= 0 ? '+' : ''}{scoreBreakdown.aspectScore.toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Nakshatra Score */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                        {language === 'ta' ? 'நட்சத்திர மதிப்பெண்' : 'Nakshatra Score'}
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-full rounded-full ${scoreBreakdown.nakshatraScore >= 15 ? 'bg-green-500' : scoreBreakdown.nakshatraScore >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${(scoreBreakdown.nakshatraScore + 20) / 45 * 100}%` }}
                            />
                        </div>
                        <span className={`text-sm font-bold w-12 text-right ${getScoreColor(scoreBreakdown.nakshatraScore, maxScores.nakshatra)}`}>
                            {scoreBreakdown.nakshatraScore >= 0 ? '+' : ''}{scoreBreakdown.nakshatraScore.toFixed(0)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
