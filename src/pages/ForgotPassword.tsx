import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sparkles, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiCall, API_CONFIG } from '../config/api';

const ForgotPassword: React.FC = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiCall(API_CONFIG.endpoints.auth.sendPasswordReset, {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                        <p className="text-slate-300 mb-6">
                            We've sent a password reset link to <span className="text-yellow-400">{email}</span>
                        </p>
                        <p className="text-slate-400 text-sm mb-6">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition shadow-lg"
                        >
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="inline-block"
                        >
                            <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500" style={{ fontFamily: "'Cinzel', serif" }}>
                            Forgot Password
                        </h1>
                        <p className="text-slate-300 mt-2">Enter your email to reset your password</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/50 flex items-center gap-2"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </motion.button>
                    </form>

                    {/* Back to Login Link */}
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-slate-400 hover:text-yellow-400 transition flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
