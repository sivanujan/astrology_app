import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, AlertCircle, CheckCircle, Send, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { isDisposableEmail } from '../utils/emailValidation';
import { validatePassword } from '../utils/passwordValidation';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, resendVerification, loginWithGoogle } = useAuth();
    const { t } = useLanguage();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{ level: 'weak' | 'medium' | 'strong', label: string, color: string } | null>(null);
    const [showFullscreenLoader, setShowFullscreenLoader] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

    // Calculate password strength
    const calculatePasswordStrength = (pwd: string) => {
        if (!pwd) {
            setPasswordStrength(null);
            return;
        }

        let strength = 0;

        // Length check
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;

        // Character variety
        if (/[a-z]/.test(pwd)) strength++; // lowercase
        if (/[A-Z]/.test(pwd)) strength++; // uppercase
        if (/[0-9]/.test(pwd)) strength++; // numbers
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++; // special chars

        // Determine strength level
        if (strength <= 2) {
            setPasswordStrength({ level: 'weak', label: 'Weak', color: 'text-red-400' });
        } else if (strength <= 4) {
            setPasswordStrength({ level: 'medium', label: 'Medium', color: 'text-yellow-400' });
        } else {
            setPasswordStrength({ level: 'strong', label: 'Strong', color: 'text-green-400' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(t.auth[passwordValidation.errorKey as keyof typeof t.auth]);
            return;
        }

        if (isDisposableEmail(email)) {
            setError(t.auth.disposableEmail);
            return;
        }

        setLoading(true);
        setShowFullscreenLoader(true);

        try {
            await register(email, password, name);
            // Wait a moment for smooth transition
            setTimeout(() => {
                setShowFullscreenLoader(false);
                setShowVerificationModal(true);
            }, 800);
        } catch (err: any) {
            setShowFullscreenLoader(false);
            if (err.code === 'auth/email-already-in-use') {
                setError(t.auth.emailInUse);
            } else {
                setError(err.message || 'Failed to register');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendSuccess(false);

        try {
            await resendVerification();
            setResendSuccess(true);
        } catch (err) {
            setError('Failed to resend verification email');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
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
                            {t.auth.registerTitle}
                        </h1>
                        <p className="text-slate-300 mt-2">{t.auth.registerSubtitle}</p>
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

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">{t.auth.name}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">{t.auth.email}</label>
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

                        {/* Password Field */}
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">{t.auth.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        calculatePasswordStrength(e.target.value);
                                    }}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-10 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            <AnimatePresence>
                                {passwordStrength && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-2 flex items-center gap-2"
                                    >
                                        <Shield className={`w-4 h-4 ${passwordStrength.color}`} />
                                        <span className={`text-sm font-medium ${passwordStrength.color}`}>
                                            Password Strength: {passwordStrength.label}
                                        </span>
                                        <div className="flex-1 flex gap-1">
                                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.level === 'weak' ? 'bg-red-400' : 'bg-gray-600'
                                                }`} />
                                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.level === 'medium' || passwordStrength.level === 'strong' ? 'bg-yellow-400' : 'bg-gray-600'
                                                }`} />
                                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength.level === 'strong' ? 'bg-green-400' : 'bg-gray-600'
                                                }`} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-slate-300 mb-2 text-sm">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        // Check if passwords match
                                        if (e.target.value && password) {
                                            setPasswordsMatch(e.target.value === password);
                                        } else {
                                            setPasswordsMatch(null);
                                        }
                                    }}
                                    required
                                    className="w-full bg-white/5 border border-white/20 rounded-xl px-10 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            <AnimatePresence>
                                {passwordsMatch !== null && confirmPassword && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-2 flex items-center gap-2"
                                    >
                                        {passwordsMatch ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                <span className="text-sm font-medium text-green-400">
                                                    Passwords match ✓
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                                <span className="text-sm font-medium text-red-400">
                                                    Passwords do not match
                                                </span>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? 'Creating Account...' : t.auth.registerBtn}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/20"></div>
                        <span className="text-slate-400 text-sm">or</span>
                        <div className="flex-1 h-px bg-white/20"></div>
                    </div>

                    {/* Google Sign-In */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                            try {
                                await loginWithGoogle();
                                navigate('/dashboard');
                            } catch (err: any) {
                                setError(err.message || 'Failed to sign in with Google');
                            }
                        }}
                        className="w-full bg-white text-slate-900 font-semibold py-3 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {t.auth.googleBtn}
                    </motion.button>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/20"></div>
                        <span className="text-slate-400 text-sm">or</span>
                        <div className="flex-1 h-px bg-white/20"></div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-slate-400">
                            {t.auth.hasAccount}{' '}
                            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition">
                                {t.auth.loginBtn}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>


            {/* Email Verification Modal */}
            <AnimatePresence>
                {showVerificationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 max-w-md w-full border border-white/20"
                        >
                            <div className="text-center">
                                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">{t.auth.verifyEmail}</h2>
                                <p className="text-slate-300 mb-6">
                                    {t.auth.verifySubtitle} <span className="text-yellow-400">{email}</span>.
                                    <br />
                                    <span className="text-sm text-slate-400 mt-2 block">{t.auth.checkSpam}</span>
                                </p>

                                {resendSuccess && (
                                    <div className="mb-4 p-3 rounded-lg bg-green-900/30 border border-green-500/50">
                                        <p className="text-green-300 text-sm">Verification email resent!</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={resendLoading}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-5 h-5" />
                                        {resendLoading ? 'Sending...' : t.auth.resend}
                                    </button>

                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition"
                                    >
                                        {t.auth.backToLogin}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Loader */}
            <AnimatePresence>
                {showFullscreenLoader && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1, repeat: Infinity }
                                }}
                                className="inline-block mb-4"
                            >
                                <Sparkles className="w-16 h-16 text-yellow-400" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">Creating Your Account</h3>
                            <p className="text-slate-300">Please wait a moment...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Register;
