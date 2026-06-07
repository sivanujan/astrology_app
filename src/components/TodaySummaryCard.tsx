import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Sun } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TodaySummaryCardProps {
    date: string;
    dayQuality: 'good' | 'moderate' | 'challenging';
    nakshatra?: string;
    tithi?: string;
    yoga?: string;
    goodTime?: string;
    badTime?: string;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({
    date,
    dayQuality,
    nakshatra,
    tithi,
    yoga,
    goodTime,
    badTime
}) => {
    const { language } = useLanguage();

    const qualityConfig = {
        good: {
            label: language === 'ta' ? 'நல்ல நாள்' : 'Good Day',
            color: 'text-green-400',
            bgColor: 'bg-green-900/20',
            borderColor: 'border-green-500/30',
            icon: '🌟'
        },
        moderate: {
            label: language === 'ta' ? 'சாதாரண நாள்' : 'Moderate Day',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-900/20',
            borderColor: 'border-yellow-500/30',
            icon: '⚡'
        },
        challenging: {
            label: language === 'ta' ? 'சவாலான நாள்' : 'Challenging Day',
            color: 'text-red-400',
            bgColor: 'bg-red-900/20',
            borderColor: 'border-red-500/30',
            icon: '⚠️'
        }
    };

    const config = qualityConfig[dayQuality];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel p-6 border-2 ${config.borderColor}`}
        >
            <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold">
                    {language === 'ta' ? '📅 இன்றைய சுருக்கம்' : '📅 Today\'s Quick Summary'}
                </h3>
            </div>

            <div className="space-y-4">
                {/* Date and Quality */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-slate-400">
                            {language === 'ta' ? 'தேதி' : 'Date'}
                        </div>
                        <div className="text-lg font-semibold">{date}</div>
                    </div>
                    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg px-4 py-2`}>
                        <div className="text-xs text-slate-400 mb-1">
                            {language === 'ta' ? 'நாள் தரம்' : 'Day Quality'}
                        </div>
                        <div className={`font-bold ${config.color} flex items-center gap-2`}>
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                        </div>
                    </div>
                </div>

                {/* Panchang Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {nakshatra && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-400 mb-1">
                                {language === 'ta' ? '🌟 நட்சத்திரம்' : '🌟 Nakshatra'}
                            </div>
                            <div className="font-medium text-white">{nakshatra}</div>
                        </div>
                    )}
                    {tithi && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-400 mb-1">
                                {language === 'ta' ? '🌙 திதி' : '🌙 Tithi'}
                            </div>
                            <div className="font-medium text-white">{tithi}</div>
                        </div>
                    )}
                    {yoga && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-400 mb-1">
                                {language === 'ta' ? '🕉️ யோகம்' : '🕉️ Yoga'}
                            </div>
                            <div className="font-medium text-white">{yoga}</div>
                        </div>
                    )}
                </div>

                {/* Good and Bad Times */}
                {(goodTime || badTime) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {goodTime && (
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-green-400" />
                                    <div className="text-xs text-green-400 font-medium">
                                        {language === 'ta' ? 'நல்ல நேரம்' : 'Good Time'}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-green-300">{goodTime}</div>
                            </div>
                        )}
                        {badTime && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-red-400" />
                                    <div className="text-xs text-red-400 font-medium">
                                        {language === 'ta' ? 'தவிர்க்க வேண்டிய நேரம்' : 'Avoid Time'}
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-red-300">{badTime}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TodaySummaryCard;
