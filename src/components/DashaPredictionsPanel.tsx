import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { DashaScoreCard } from './DashaScoreCard';
import { calculateDasaScore, calculateBhuktiScore, DasaQuality } from '../utils/dashaScoring';
import { getCurrentDasha } from '../utils/astrology';
import { TAMIL_PLANET_NAMES } from '../utils/translations';

interface Props {
    chart: any;
    language: 'en' | 'ta';
}

export const DashaPredictionsPanel: React.FC<Props> = ({ chart, language }) => {
    const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'score' | 'planet'>('score');

    // Get current dasha/bhukti
    const currentDasha = useMemo(() => {
        try {
            return getCurrentDasha(chart);
        } catch {
            return null;
        }
    }, [chart]);

    // Calculate scores for all planets
    const planetScores = useMemo(() => {
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        return planets.map(planetName => ({
            planet: planetName,
            score: calculateDasaScore(planetName, chart)
        }));
    }, [chart]);

    // Sort planets
    const sortedPlanets = useMemo(() => {
        if (sortBy === 'score') {
            return [...planetScores].sort((a, b) => b.score.totalScore - a.score.totalScore);
        }
        return planetScores;
    }, [planetScores, sortBy]);

    // Calculate current bhukti score if available
    const currentBhuktiScore = useMemo(() => {
        if (!currentDasha?.planet || !currentDasha?.bhukti?.planet) return null;
        return calculateBhuktiScore(currentDasha.planet.name, currentDasha.bhukti.planet.name, chart);
    }, [currentDasha, chart]);

    const getQualityIcon = (quality: DasaQuality) => {
        switch (quality) {
            case DasaQuality.EXCELLENT:
            case DasaQuality.VERY_GOOD:
                return <TrendingUp className="w-4 h-4" />;
            case DasaQuality.BAD:
            case DasaQuality.VERY_BAD:
                return <TrendingDown className="w-4 h-4" />;
            default:
                return <Minus className="w-4 h-4" />;
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

    const getQualityBadgeColor = (quality: DasaQuality): string => {
        switch (quality) {
            case DasaQuality.EXCELLENT:
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case DasaQuality.VERY_GOOD:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case DasaQuality.GOOD:
                return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
            case DasaQuality.AVERAGE:
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case DasaQuality.BAD:
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case DasaQuality.VERY_BAD:
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {language === 'ta' ? 'தசா-புக்தி மதிப்பீடு' : 'Dasa-Bhukti Analysis'}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {language === 'ta'
                            ? 'ஒவ்வொரு கிரகத்தின் தசா காலத்தின் விரிவான மதிப்பெண்'
                            : 'Comprehensive scoring for each planetary period'}
                    </p>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'planet')}
                    className="px-4 py-2 bg-gray-800 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="score">{language === 'ta' ? 'மதிப்பெண் வரிசை' : 'Sort by Score'}</option>
                    <option value="planet">{language === 'ta' ? 'கிரக வரிசை' : 'Sort by Planet'}</option>
                </select>
            </div>

            {/* Current Dasha/Bhukti Overview */}
            {currentDasha && (
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/50 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-lg font-semibold text-white">
                            {language === 'ta' ? 'தற்போதைய தசா-புக்தி' : 'Current Dasa-Bhukti'}
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dasa */}
                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="text-sm text-gray-400 mb-1">
                                {language === 'ta' ? 'மகா தசை' : 'Maha Dasa'}
                            </div>
                            <div className="text-xl font-bold text-white mb-2">
                                {language === 'ta'
                                    ? TAMIL_PLANET_NAMES[currentDasha.planet.name]
                                    : currentDasha.planet.name}
                            </div>
                            {currentDasha.planet.name && (
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold ${getScoreColor(planetScores.find(p => p.planet === currentDasha.planet.name)?.score.totalScore || 0)}`}>
                                        {planetScores.find(p => p.planet === currentDasha.planet.name)?.score.total Score.toFixed(0)}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs border ${getQualityBadgeColor(planetScores.find(p => p.planet === currentDasha.planet.name)?.score.quality || DasaQuality.AVERAGE)}`}>
                                        {planetScores.find(p => p.planet === currentDasha.planet.name)?.score.quality}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Bhukti */}
                        {currentBhuktiScore && currentDasha.bhukti && (
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-1">
                                    {language === 'ta' ? 'புக்தி' : 'Bhukti'}
                                </div>
                                <div className="text-xl font-bold text-white mb-2">
                                    {language === 'ta'
                                        ? TAMIL_PLANET_NAMES[currentDasha.bhukti.planet.name]
                                        : currentDasha.bhukti.planet.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold ${getScoreColor(currentBhuktiScore.combinedScore)}`}>
                                        {currentBhuktiScore.combinedScore.toFixed(0)}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs border ${getQualityBadgeColor(currentBhuktiScore.quality)}`}>
                                        {currentBhuktiScore.quality}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    {language === 'ta' ? 'சூத்திரம்:' : 'Formula:'} ({currentBhuktiScore.dasaScore.toFixed(0)} × 60%) + ({currentBhuktiScore.bhuktiScore.toFixed(0)} × 40%)
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* All Planets Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {sortedPlanets.map(({ planet, score }) => {
                    const isCurrentDasa = currentDasha?.planet?.name === planet;
                    const isCurrentBhukti = currentDasha?.bhukti?.planet?.name === planet;

                    return (
                        <motion.div
                            key={planet}
                            whileHover={{ scale: 1.02 }}
                            className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border cursor-pointer transition-all ${isCurrentDasa
                                    ? 'border-yellow-400 shadow-lg shadow-yellow-400/20'
                                    : isCurrentBhukti
                                        ? 'border-purple-400 shadow-lg shadow-purple-400/20'
                                        : 'border-gray-700 hover:border-purple-500/50'
                                }`}
                            onClick={() => setExpandedPlanet(expandedPlanet === planet ? null : planet)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-white">
                                    {language === 'ta' ? TAMIL_PLANET_NAMES[planet] : planet}
                                </span>
                                {isCurrentDasa && <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />}
                                {isCurrentBhukti && !isCurrentDasa && <Star className="w-4 h-4 text-purple-400" />}
                            </div>

                            <div className={`text-2xl font-bold ${getScoreColor(score.totalScore)} mb-1`}>
                                {score.totalScore.toFixed(0)}
                            </div>

                            <div className="flex items-center gap-1 text-xs">
                                {getQualityIcon(score.quality)}
                                <span className="text-gray-400 truncate">{score.quality}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Detailed Score Cards */}
            <AnimatePresence>
                {expandedPlanet && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <DashaScoreCard
                            planetName={expandedPlanet}
                            scoreBreakdown={planetScores.find(p => p.planet === expandedPlanet)!.score}
                            language={language}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h5 className="text-sm font-semibold text-gray-300 mb-3">
                    {language === 'ta' ? 'குறியீடு' : 'Legend'}
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        <span className="text-gray-400">
                            {language === 'ta' ? 'தற்போதைய மகா தசை' : 'Current Maha Dasa'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400">
                            {language === 'ta' ? 'தற்போதைய புக்தி' : 'Current Bhukti'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-gradient-to-r from-green-500 to-red-500 rounded" />
                        <span className="text-gray-400">
                            {language === 'ta' ? '225 முதல் -55' : '225 to -55'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
