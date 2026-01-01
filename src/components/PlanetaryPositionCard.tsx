import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PlanetaryPositionCardProps {
    planet: string;
    localizedName: string;
    status: string;
    description: string;
    isFavorable: boolean;
    aspects?: string[];
    // Future props
    // strength?: number; 
    // details?: string;
}

const PlanetaryPositionCard: React.FC<PlanetaryPositionCardProps> = ({
    planet,
    localizedName,
    status,
    description,
    isFavorable,
    aspects
}) => {
    const { language } = useLanguage();
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Calculate simulated strength based on status
    const getStrength = () => {
        if (status.includes('Excellent')) return 95;
        if (status.includes('Good')) return 80;
        if (status.includes('Moderate')) return 50;
        if (status.includes('Neutral')) return 50;
        if (status.includes('Sade')) return 15; // Sade Sati
        if (status.includes('Ashtama')) return 10;
        return 30; // Difficult
    };

    const strength = getStrength();

    const getStatusColor = () => {
        if (isFavorable) return 'text-green-400';
        if (status.includes('Moderate')) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getBarColor = () => {
        if (isFavorable) return 'bg-green-500';
        if (status.includes('Moderate')) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-5 border border-slate-700/50 hover:border-slate-500/50 transition-all group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 ${getStatusColor()}`}>
                        <span className="font-bold text-xs">{planet.substring(0, 2)}</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-100">{localizedName}</h4>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${getStatusColor()}`}>
                            {status}
                        </div>
                    </div>
                </div>
                {aspects && aspects.length > 0 && (
                    <Shield className="w-4 h-4 text-yellow-400" />
                )}
            </div>

            {/* Strength Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{language === 'ta' ? 'பலம்' : 'Strength'}</span>
                    <span>{strength}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${getBarColor()}`}
                    />
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed min-h-[3rem]">
                {description}
            </p>

            {/* Aspects / Extras */}
            {aspects && aspects.length > 0 && (
                <div className="mt-3 text-xs bg-yellow-900/10 border border-yellow-500/20 p-2 rounded text-yellow-200">
                    <span className="font-bold">✨ Protection:</span> {aspects.join(', ')}
                </div>
            )}

            {/* Expandable (Future) */}
            {/* 
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
             */}
        </motion.div>
    );
};

export default PlanetaryPositionCard;
