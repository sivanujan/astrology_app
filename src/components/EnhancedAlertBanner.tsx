import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, XCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface EnhancedAlertBannerProps {
    title: string;
    riskLevel: 'high' | 'medium' | 'low';
    description: string;
    avoidItems?: string[];
    focusItems?: string[];
    onViewRemedies?: () => void;
    onViewDetails?: () => void;
}

const EnhancedAlertBanner: React.FC<EnhancedAlertBannerProps> = ({
    title,
    riskLevel,
    description,
    avoidItems = [],
    focusItems = [],
    onViewRemedies,
    onViewDetails
}) => {
    const { language } = useLanguage();

    const riskConfig = {
        high: {
            icon: AlertTriangle,
            bgColor: 'bg-red-900/30',
            borderColor: 'border-red-500',
            textColor: 'text-red-400',
            badgeColor: 'bg-red-500'
        },
        medium: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-900/30',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-400',
            badgeColor: 'bg-yellow-500'
        },
        low: {
            icon: Shield,
            bgColor: 'bg-blue-900/30',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-400',
            badgeColor: 'bg-blue-500'
        }
    };

    const config = riskConfig[riskLevel];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl p-6 mb-6`}
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <Icon className={`w-8 h-8 ${config.textColor} animate-pulse`} />
                <div className="flex-1">
                    <h3 className={`text-xl font-bold ${config.textColor}`}>
                        {title}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">{description}</p>
                </div>
                <div className={`${config.badgeColor} text-white px-4 py-2 rounded-lg font-bold text-sm`}>
                    ⚡ {riskLevel.toUpperCase()} {language === 'ta' ? 'அபாய நிலை' : 'RISK'}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Avoid Items */}
                {avoidItems.length > 0 && (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <h4 className="font-semibold text-red-400">
                                {language === 'ta' ? '🚫 தவிர்க்கவும்' : '🚫 Avoid'}
                            </h4>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-300">
                            {avoidItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-red-400 mt-0.5">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Focus Items */}
                {focusItems.length > 0 && (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <h4 className="font-semibold text-green-400">
                                {language === 'ta' ? '✅ கவனம் செலுத்தவும்' : '✅ Focus On'}
                            </h4>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-300">
                            {focusItems.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-green-400 mt-0.5">•</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {onViewDetails && (
                <div className="flex flex-wrap gap-3">
                    {onViewDetails && (
                        <button
                            onClick={onViewDetails}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <span>📊</span>
                            <span>{language === 'ta' ? 'விவரங்கள்' : 'Details'}</span>
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default EnhancedAlertBanner;
