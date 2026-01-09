import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PromoCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActivate: (code: string) => Promise<{ success: boolean; message: string; expiresAt?: Date; duration?: string }>;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({ isOpen, onClose, onActivate }) => {
    const { language } = useLanguage();
    const [promoCode, setPromoCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ message: string; expiresAt?: Date; duration?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!promoCode.trim()) {
            setError(language === 'ta' ? 'ப்ரோமோ குறியீட்டை உள்ளிடவும்' : 'Please enter a promo code');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(null);

        try {
            const result = await onActivate(promoCode.toUpperCase());

            if (result.success) {
                setSuccess({
                    message: result.message,
                    expiresAt: result.expiresAt,
                    duration: result.duration
                });
                setPromoCode('');

                // Auto-close after 3 seconds
                setTimeout(() => {
                    onClose();
                    setSuccess(null);
                }, 3000);
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            setError(err.message || (language === 'ta' ? 'தோல்வி' : 'Failed to activate'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>

                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                    <Gift className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {language === 'ta' ? 'ப்ரோமோ குறியீடு' : 'Promo Code'}
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        {language === 'ta' ? 'வரம்பற்ற அணுகல் பெறுங்கள்' : 'Get unlimited access'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-6">
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-500/30 rounded-lg">
                                            <Check className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-green-400 mb-1">
                                                {language === 'ta' ? 'வெற்றி!' : 'Success!'}
                                            </h3>
                                            <p className="text-sm text-green-300">
                                                {success.message}
                                            </p>
                                            {success.expiresAt && (
                                                <p className="text-xs text-green-400 mt-2">
                                                    {language === 'ta' ? 'காலாவதி:' : 'Expires:'} {' '}
                                                    {new Date(success.expiresAt).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            {language === 'ta' ? 'உங்கள் குறியீட்டை உள்ளிடவும்' : 'Enter your code'}
                                        </label>
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder={language === 'ta' ? 'PROMO2026' : 'PROMO2026'}
                                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all uppercase"
                                            disabled={loading}
                                            maxLength={20}
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-start gap-2"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-300">{error}</p>
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !promoCode.trim()}
                                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {language === 'ta' ? 'சரிபார்க்கிறது...' : 'Activating...'}
                                            </span>
                                        ) : (
                                            language === 'ta' ? 'செயல்படுத்து' : 'Activate'
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Info */}
                            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <p className="text-xs text-blue-300">
                                    {language === 'ta'
                                        ? '💡 ப்ரோமோ குறியீடு 1 வாரம் அல்லது 1 மாதத்திற்கு வரம்பற்ற அணுகலை வழங்குகிறது'
                                        : '💡 Promo codes provide unlimited access for 1 week or 1 month'
                                    }
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PromoCodeModal;
