import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DasaScore } from '../utils/dasaAnalysis';
import { useLanguage } from '../contexts/LanguageContext';

interface DasaScoreBreakdownProps {
    dasaScore: DasaScore;
    planetName: string;
}

const DasaScoreBreakdown: React.FC<DasaScoreBreakdownProps> = ({ dasaScore, planetName }) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';
    const [isExpanded, setIsExpanded] = useState(false);

    const components = [
        {
            name: isTamil ? 'வீட்டு அதிபத்யம்' : 'House Lordship',
            score: dasaScore.breakdown.lordship.score,
            percentage: dasaScore.breakdown.lordship.percentage,
            maxScore: 20,
            weight: 40,
            details: dasaScore.breakdown.lordship.details,
            color: 'from-purple-500 to-purple-700'
        },
        {
            name: isTamil ? 'வீட்டு நிலைப்பாடு' : 'House Placement',
            score: dasaScore.breakdown.placement.score,
            percentage: dasaScore.breakdown.placement.percentage,
            maxScore: 15,
            weight: 20,
            details: dasaScore.breakdown.placement.quality,
            color: 'from-blue-500 to-blue-700'
        },
        {
            name: isTamil ? 'சுபத்துவம்' : 'Subathuvam',
            score: dasaScore.breakdown.subathuvam.score,
            percentage: dasaScore.breakdown.subathuvam.percentage,
            maxScore: 12,
            weight: 15,
            details: dasaScore.breakdown.subathuvam.nature,
            color: 'from-green-500 to-green-700'
        },
        {
            name: isTamil ? 'கிரக பலம்' : 'Dignity',
            score: dasaScore.breakdown.dignity.score,
            percentage: dasaScore.breakdown.dignity.percentage,
            maxScore: 13,
            weight: 15,
            details: dasaScore.breakdown.dignity.dignity,
            color: 'from-yellow-500 to-yellow-700'
        },
        {
            name: isTamil ? 'சேர்க்கை & பார்வை' : 'Aspects',
            score: dasaScore.breakdown.aspects.score,
            percentage: dasaScore.breakdown.aspects.percentage,
            maxScore: 10,
            weight: 10,
            details: `${dasaScore.breakdown.aspects.conjunctions.length + dasaScore.breakdown.aspects.aspects.length} ${isTamil ? 'தாக்கங்கள்' : 'influences'}`,
            color: 'from-pink-500 to-pink-700'
        }
    ];

    return (
        <div className="glass-panel p-6 rounded-lg border border-slate-700/50">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
            >
                <h3 className="text-lg font-bold text-purple-300">
                    {isTamil ? 'மதிப்பெண் பிரிவு' : 'Score Breakdown'}
                </h3>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </button>

            {/* Component Scores */}
            <div className="space-y-4">
                {components.map((component, idx) => (
                    <motion.div
                        key={component.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-300 font-medium">{component.name}</span>
                                <span className="text-xs text-slate-500">({component.weight}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 text-sm">
                                    {component.score}/{component.maxScore}
                                </span>
                                <span className="text-white font-bold">
                                    {Math.round(component.percentage)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(component.score / component.maxScore) * 100}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className={`h-full bg-gradient-to-r ${component.color}`}
                            />
                        </div>

                        {/* Details */}
                        {component.details && (
                            <p className="text-xs text-slate-500 mt-1">{component.details}</p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-6 border-t border-slate-700/50 space-y-4"
                    >
                        {/* Lordship Details */}
                        <div>
                            <h4 className="text-sm font-semibold text-purple-300 mb-2">
                                {isTamil ? 'வீட்டு அதிபத்யம் விவரம்' : 'Lordship Details'}
                            </h4>
                            <p className="text-sm text-slate-300">{dasaScore.breakdown.lordship.details}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {dasaScore.breakdown.lordship.houses.map(house => (
                                    <span key={house} className="px-2 py-1 bg-purple-900/30 border border-purple-700/50 rounded text-xs text-purple-300">
                                        {isTamil ? `வீடு ${house}` : `House ${house}`}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Subathuvam Adjustments */}
                        {dasaScore.breakdown.subathuvam.adjustments.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-green-300 mb-2">
                                    {isTamil ? 'சுபத்துவ சரிக்கட்டுதல்கள்' : 'Subathuvam Adjustments'}
                                </h4>
                                <div className="space-y-1">
                                    {dasaScore.breakdown.subathuvam.adjustments.map((adj, idx) => (
                                        <p key={idx} className="text-sm text-slate-300">• {adj}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dignity Factors */}
                        {dasaScore.breakdown.dignity.factors.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-300 mb-2">
                                    {isTamil ? 'கிரக பல காரணிகள்' : 'Dignity Factors'}
                                </h4>
                                <div className="space-y-1">
                                    {dasaScore.breakdown.dignity.factors.map((factor, idx) => (
                                        <p key={idx} className="text-sm text-slate-300">• {factor}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conjunctions & Aspects */}
                        {(dasaScore.breakdown.aspects.conjunctions.length > 0 || dasaScore.breakdown.aspects.aspects.length > 0) && (
                            <div>
                                <h4 className="text-sm font-semibold text-pink-300 mb-2">
                                    {isTamil ? 'சேர்க்கை & பார்வைகள்' : 'Conjunctions & Aspects'}
                                </h4>
                                {dasaScore.breakdown.aspects.conjunctions.length > 0 && (
                                    <div className="mb-2">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'சேர்க்கைகள்:' : 'Conjunctions:'}</p>
                                        {dasaScore.breakdown.aspects.conjunctions.map((conj, idx) => (
                                            <p key={idx} className="text-sm text-slate-300">• {conj}</p>
                                        ))}
                                    </div>
                                )}
                                {dasaScore.breakdown.aspects.aspects.length > 0 && (
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'பார்வைகள்:' : 'Aspects:'}</p>
                                        {dasaScore.breakdown.aspects.aspects.map((asp, idx) => (
                                            <p key={idx} className="text-sm text-slate-300">• {asp}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DasaScoreBreakdown;
