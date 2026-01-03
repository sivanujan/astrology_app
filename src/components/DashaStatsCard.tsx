import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PLANET_COLORS } from '../utils/astrology';
import { TAMIL_PLANET_NAMES } from '../utils/translations';

interface DashaStatsCardProps {
    currentDasha: {
        maha?: { planet: string; endDate: Date };
        bhukti?: { planet: string };
        antaram?: { planet: string };
    } | null;
    periods: any[];
}

const DashaStatsCard: React.FC<DashaStatsCardProps> = ({ currentDasha, periods }) => {
    const { language } = useLanguage();

    const getPlanetName = (name: string) => {
        return language === 'ta' ? TAMIL_PLANET_NAMES[name] : name;
    };

    // Calculate time remaining for current Maha Dasha
    const getTimeRemaining = () => {
        if (!currentDasha?.maha?.endDate) return '-';

        const now = new Date();
        const end = new Date(currentDasha.maha.endDate);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return '-';

        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

        if (years > 0) {
            return `${years}y ${months}mo`;
        }
        return `${months}mo`;
    };

    // Get next Maha Dasha period
    const getNextPeriod = () => {
        if (!currentDasha?.maha) return null;

        const currentIndex = periods.findIndex(
            p => p.planet === currentDasha.maha!.planet &&
                p.startDate.getTime() === (currentDasha.maha as any).startDate.getTime()
        );

        if (currentIndex === -1 || currentIndex === periods.length - 1) return null;
        return periods[currentIndex + 1];
    };

    const nextPeriod = getNextPeriod();

    // Calculate time until next period
    const getTimeUntilNext = () => {
        if (!currentDasha?.maha?.endDate) return '-';

        const now = new Date();
        const start = new Date(currentDasha.maha.endDate);
        const diff = start.getTime() - now.getTime();

        if (diff <= 0) return 'Starting soon';

        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

        if (years > 0) {
            return `in ${years}y ${months}mo`;
        }
        return `in ${months}mo`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 mb-8"
        >
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">
                    {language === 'ta' ? 'தசா கண்ணோட்டம்' : 'Dasha Overview'}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Period */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/30">
                    <div className="text-xs text-slate-400 mb-2">
                        {language === 'ta' ? 'தற்போதைய காலம்' : 'Current Period'}
                    </div>
                    <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: PLANET_COLORS[currentDasha?.maha?.planet || 'Sun'] }}
                    >
                        {currentDasha?.maha ? getPlanetName(currentDasha.maha.planet) : '-'}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining()} {language === 'ta' ? 'மீதம்' : 'left'}
                    </div>
                </div>

                {/* Next Period */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        {language === 'ta' ? 'அடுத்த காலம்' : 'Next Period'}
                        <ArrowRight className="w-3 h-3" />
                    </div>
                    <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: nextPeriod ? PLANET_COLORS[nextPeriod.planet] : '#94a3b8' }}
                    >
                        {nextPeriod ? getPlanetName(nextPeriod.planet) : '-'}
                    </div>
                    <div className="text-sm text-slate-400">
                        {nextPeriod ? getTimeUntilNext() : '-'}
                    </div>
                </div>

                {/* Total */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="text-xs text-slate-400 mb-2">
                        {language === 'ta' ? 'மொத்தம்' : 'Total Periods'}
                    </div>
                    <div className="text-2xl font-bold mb-1 text-blue-400">
                        {periods.length}
                    </div>
                    <div className="text-sm text-slate-400">
                        {language === 'ta' ? 'மகா தசைகள்' : 'Maha Dashas'}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashaStatsCard;
