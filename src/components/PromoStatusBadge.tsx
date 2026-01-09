import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PromoStatusBadgeProps {
    promoCode: string;
    expiresAt: Date | string;
    duration: string;
}

const PromoStatusBadge: React.FC<PromoStatusBadgeProps> = ({ promoCode, expiresAt, duration }) => {
    const { language } = useLanguage();

    // Convert to Date object if it's a string
    const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;

    const getDaysRemaining = () => {
        const now = new Date();
        const diff = expiryDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-3 mb-4"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-purple-400">
                            {language === 'ta' ? '🎁 வரம்பற்ற அணுகல்' : '🎁 Unlimited Access'}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs font-medium text-purple-300">
                            {promoCode}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-purple-300">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {language === 'ta'
                                ? `${daysRemaining} நாட்கள் மீதமுள்ளன`
                                : `${daysRemaining} days remaining`
                            }
                        </span>
                        <span className="text-purple-400/50">•</span>
                        <span>
                            {language === 'ta' ? 'காலாவதி:' : 'Expires:'} {' '}
                            {expiryDate.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PromoStatusBadge;
