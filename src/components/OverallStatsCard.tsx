import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PlanetStatus {
    good: number;
    moderate: number;
    difficult: number;
}

interface OverallStatsCardProps {
    stats: PlanetStatus;
}

const OverallStatsCard: React.FC<OverallStatsCardProps> = ({ stats }) => {
    const { language } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 mb-6"
        >
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold">
                    {language === 'ta' ? '📊 ஒட்டுமொத்த கிரக நிலை' : '📊 Overall Planetary Status'}
                </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Good */}
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="text-xs text-green-400 mb-2 font-medium">
                        {language === 'ta' ? 'நல்லது' : 'Good'}
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                        {stats.good}
                    </div>
                    <div className="flex justify-center gap-1">
                        {Array.from({ length: stats.good }).map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-green-400 rounded-full"></div>
                        ))}
                    </div>
                </div>

                {/* Moderate */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p- text-center">
                    <div className="text-xs text-yellow-400 mb-2 font-medium">
                        {language === 'ta' ? 'சாதாரணம்' : 'Moderate'}
                    </div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                        {stats.moderate}
                    </div>
                    <div className="flex justify-center gap-1">
                        {Array.from({ length: stats.moderate }).map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        ))}
                    </div>
                </div>

                {/* Difficult */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
                    <div className="text-xs text-red-400 mb-2 font-medium">
                        {language === 'ta' ? 'கடினம்' : 'Difficult'}
                    </div>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                        {stats.difficult}
                    </div>
                    <div className="flex justify-center gap-1">
                        {Array.from({ length: stats.difficult }).map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-red-400 rounded-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OverallStatsCard;
