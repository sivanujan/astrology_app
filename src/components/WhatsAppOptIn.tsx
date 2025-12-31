/// <reference types="vite/client" />
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WhatsAppOptInProps {
    isOpen: boolean;
    onClose: () => void;
    uid: string;
    currentUserPhone?: string;
}

const WhatsAppOptIn: React.FC<WhatsAppOptInProps> = ({ isOpen, onClose, uid, currentUserPhone }) => {
    const { language, t } = useLanguage();
    const isTamil = language === 'ta';

    const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
    const [phone, setPhone] = useState(currentUserPhone || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API Base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/whatsapp/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone })
            });
            const data = await response.json();

            if (data.success) {
                setStep('verify');
            } else {
                setError(data.message || 'Failed to send code');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/whatsapp/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: phone,
                    code: otp,
                    uid,
                    language
                })
            });
            const data = await response.json();

            if (data.success) {
                setStep('success');
                // Auto close after 3 seconds
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setError(data.message || 'Invalid code');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-green-500/30 w-full max-w-md overflow-hidden relative">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>

                            {/* Decorative Background Icon */}
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-5">
                                <MessageCircle className="w-48 h-48" />
                            </div>

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 ring-2 ring-green-500/30">
                                        <MessageCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white text-center">
                                        {isTamil ? 'தினசரி ஜோதிட அறிவிப்புகள்' : 'Get Daily Predictions'}
                                    </h2>
                                    <p className="text-slate-400 text-center mt-2 text-sm">
                                        {isTamil
                                            ? 'உங்கள் ராசிபலனை தினமும் WhatsAppல் பெறுங்கள்'
                                            : 'Receive your personalized daily forecast directly on WhatsApp.'}
                                    </p>
                                </div>

                                {/* Steps */}
                                {step === 'input' && (
                                    <form onSubmit={handleSendCode} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                {isTamil ? 'WhatsApp எண்' : 'WhatsApp Number'}
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="e.g., 919876543210"
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {isTamil ? 'நாடு குறியீடுடன் உள்ளிடவும் (எ.கா: 91...)' : 'Include country code (e.g., 91...)'}
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                <AlertCircle className="w-4 h-4" />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                            {isTamil ? 'குறியீடு அனுப்பு' : 'Send Code'}
                                        </button>
                                    </form>
                                )}

                                {step === 'verify' && (
                                    <form onSubmit={handleVerify} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                                {isTamil ? 'சரிபார்ப்பு குறியீடு' : 'Verification Code'}
                                            </label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="123456"
                                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all tracking-widest text-center text-xl font-mono"
                                                maxLength={6}
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                <AlertCircle className="w-4 h-4" />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-medium shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                            {isTamil ? 'சரிபார்' : 'Verify & Enable'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStep('input')}
                                            className="w-full text-slate-400 text-sm hover:text-white transition-colors"
                                        >
                                            {isTamil ? 'எண்ணை மாற்றவும்' : 'Change Number'}
                                        </button>
                                    </form>
                                )}

                                {step === 'success' && (
                                    <div className="flex flex-col items-center justify-center py-4 animate-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 ring-2 ring-green-500/30">
                                            <CheckCircle className="w-10 h-10 text-green-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {isTamil ? 'வெற்றி!' : 'Success!'}
                                        </h3>
                                        <p className="text-slate-300 text-center">
                                            {isTamil
                                                ? 'தினசரி ஜோதிட அறிவிப்புகள் செயல்படுத்தப்பட்டன.'
                                                : 'Daily Astrozen alerts have been enabled for your number.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WhatsAppOptIn;
