import React, { useMemo } from 'react';
import { calculateDasaScore, DasaQuality } from '../utils/dashaScoring';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TAMIL_PLANET_NAMES } from '../utils/translations';

interface Props {
    chart: any;
    language: 'en' | 'ta';
}

export const DasaScoreSummary: React.FC<Props> = ({ chart, language }) => {
    const planetScores = useMemo(() => {
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        return planets.map(planetName => ({
            planet: planetName,
            score: calculateDasaScore(planetName, chart)
        })).sort((a, b) => b.score.totalScore - a.score.totalScore);
    }, [chart]);

    const getQualityColor = (quality: DasaQuality): string => {
        switch (quality) {
            case DasaQuality.EXCELLENT: return 'bg-green-500/20 text-green-400 border-green-500/30';
            case DasaQuality.VERY_GOOD: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case DasaQuality.GOOD: return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
            case DasaQuality.AVERAGE: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case DasaQuality.BAD: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case DasaQuality.VERY_BAD: return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 150) return 'text-green-400';
        if (score >= 100) return 'text-blue-400';
        if (score >= 60) return 'text-teal-400';
        if (score >= 30) return 'text-yellow-400';
        if (score >= 0) return 'text-orange-400';
        return 'text-red-400';
    };

    const getQualityIcon = (quality: DasaQuality) => {
        if (quality === DasaQuality.EXCELLENT || quality === DasaQuality.VERY_GOOD) return <TrendingUp className="w-3 h-3" />;
        if (quality === DasaQuality.BAD || quality === DasaQuality.VERY_BAD) return <TrendingDown className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    return (
        <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-white mb-4">
                {language === 'ta' ? 'தசா மதிப்பெண் சுருக்கம்' : 'Dasa Period Quality Scores'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
                {language === 'ta'
                    ? 'ஒவ்வொரு கிரக தசா காலத்தின் மொத்த மதிப்பெண் (0-225)'
                    : 'Comprehensive scoring for each planetary period (0-225 range)'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {planetScores.map(({ planet, score }) => (
                    <div key={planet} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">
                                {language === 'ta' ? TAMIL_PLANET_NAMES[planet] : planet}
                            </span>
                            {getQualityIcon(score.quality)}
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(score.totalScore)} mb-2`}>
                            {score.totalScore.toFixed(0)}
                        </div>
                        <div className={`inline-block px-2 py-1 rounded text-xs border ${getQualityColor(score.quality)}`}>
                            {score.quality}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            {language === 'ta' ? score.description.ta : score.description.en}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 text-xs text-gray-400">
                <p className="mb-2 font-semibold">{language === 'ta' ? 'மதிப்பெண் பகுதிகள்:' : 'Score Components:'}</p>
                <ul className="space-y-1 pl-4">
                    <li>{language === 'ta' ? 'ஸ்தான பலம்: 0-100 (வீட்டு வலிமை)' : 'House Strength: 0-100'}</li>
                    <li>{language === 'ta' ? 'அதிபத்ய: -30 to +40 (ஆட்சி மதிப்பெண்)' : 'Lordship: -30 to +40'}</li>
                    <li>{language === 'ta' ? 'சுபத்துவம்: -90 to +40' : 'Subathuvam: -90 to +40'}</li>
                    <li>{language === 'ta' ? 'பார்வை: -15 to +20' : 'Aspect: -15 to +20'}</li>
                    <li>{language === 'ta' ? 'நட்சத்திரம்: -20 to +25' : 'Nakshatra: -20 to +25'}</li>
                </ul>
            </div>
        </div>
    );
};
