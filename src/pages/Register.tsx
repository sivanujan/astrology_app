import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, AlertCircle, CheckCircle, Send, Eye, EyeOff, Shield, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { isDisposableEmail } from '../utils/emailValidation';
import { validatePassword, PasswordStrength } from '../utils/passwordValidation';
import PrivacyPolicyModal from './PrivacyPolicy';
import TermsOfServiceModal from './TermsOfService';

// Note: Although the files are named PrivacyPolicy.tsx and TermsOfService.tsx, 
// I exported them as PrivacyPolicyModal and TermsOfServiceModal.
// I should update the imports to match the file paths but the component names.
// Wait, the files are still in `src/pages/`. 
// `import PrivacyPolicyModal from './PrivacyPolicy';` (since file is PrivacyPolicy.tsx but default export is PrivacyPolicyModal)

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
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);

    // Modal States
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    // Real-time Email Validation
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.length > 0) {
            setIsEmailValid(emailRegex.test(email));
        } else {
            setIsEmailValid(null);
        }
    }, [email]);

    // Match Password Check
    useEffect(() => {
        if (confirmPassword.length > 0) {
            setPasswordsMatch(password === confirmPassword);
        } else {
            setPasswordsMatch(null);
        }
    }, [password, confirmPassword]);

    const handlePasswordChange = (val: string) => {
        setPassword(val);
        if (val) {
            const result = validatePassword(val);
            setPasswordStrength(result);
        } else {
            setPasswordStrength(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreedToTerms) {
            setError('Please agree to the Terms & Conditions.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength && !passwordStrength.isValid) {
            setError('Password does not meet requirements');
            return;
        }

        if (isDisposableEmail(email)) {
            setError(t.auth.disposableEmail);
            return;
        }

        setLoading(true);

        try {
            await register(email, password, name);
            setShowVerificationModal(true);
        } catch (err: any) {
            if (err.code === 'DEVICE_LIMIT_EXCEEDED') {
                setError(err.message || 'You can only create 1 account per day from this device. Please try again tomorrow or log in to your existing account.');
            } else if (err.code === 'auth/email-already-in-use') {
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
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-lg relative z-10"
            >
                {/* Glassmorphism Card */}
                <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                        >
                            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-serif">
                            {t.auth.registerTitle}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">{t.auth.registerSubtitle}</p>
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-200 text-sm font-medium">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-slate-300 mb-1.5 text-xs font-bold uppercase tracking-wider">{t.auth.name}</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition shadow-inner"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email Field with Real-time Validation */}
                        <div>
                            <label className="block text-slate-300 mb-1.5 text-xs font-bold uppercase tracking-wider">{t.auth.email}</label>
                            <div className="relative group">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEmailValid === false ? 'text-red-400' : 'text-slate-500 group-focus-within:text-yellow-400'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className={`w-full bg-slate-900/50 border rounded-xl px-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition shadow-inner ${isEmailValid === false
                                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/50'
                                        }`}
                                    placeholder="you@example.com"
                                />
                                {isEmailValid !== null && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        {isEmailValid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-slate-300 mb-1.5 text-xs font-bold uppercase tracking-wider">{t.auth.password}</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition shadow-inner"
                                    placeholder="Create password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password Strength Meter & Requirements */}
                            <AnimatePresence>
                                {password && passwordStrength && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 bg-slate-900/40 rounded-lg p-3 border border-slate-800"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-slate-400">Strength</span>
                                            <span className={`text-xs font-bold ${passwordStrength.level === 'Too Weak' ? 'text-red-500' :
                                                passwordStrength.level === 'Weak' ? 'text-orange-500' :
                                                    passwordStrength.level === 'Fair' ? 'text-yellow-500' :
                                                        passwordStrength.level === 'Good' ? 'text-lime-400' : 'text-green-500'
                                                }`}>{passwordStrength.level}</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-3">
                                            <div
                                                className={`h-full transition-all duration-500 ${passwordStrength.score <= 1 ? 'bg-red-500 w-1/5' :
                                                    passwordStrength.score === 2 ? 'bg-orange-500 w-2/5' :
                                                        passwordStrength.score === 3 ? 'bg-yellow-500 w-3/5' :
                                                            passwordStrength.score === 4 ? 'bg-lime-400 w-4/5' : 'bg-green-500 w-full'
                                                    }`}
                                            ></div>
                                        </div>

                                        {/* Missing Requirements List */}
                                        {passwordStrength.missing.length > 0 && (
                                            <ul className="space-y-1">
                                                {passwordStrength.missing.map((req, idx) => (
                                                    <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                                        <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                                        Missing: {req}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {passwordStrength.isValid && (
                                            <div className="text-[11px] text-green-400 flex items-center gap-1.5">
                                                <Check className="w-3 h-3" /> All requirements met
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-slate-300 mb-1.5 text-xs font-bold uppercase tracking-wider">Confirm Password</label>
                            <div className="relative group">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    className={`w-full bg-slate-900/50 border rounded-xl px-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition shadow-inner ${passwordsMatch === false
                                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-slate-700 focus:border-yellow-500/50 focus:ring-yellow-500/50'
                                        }`}
                                    placeholder="Repeat password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition p-1"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Match Indicator */}
                            {passwordsMatch === false && confirmPassword.length > 0 && (
                                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Passwords do not match
                                </p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="rounded text-yellow-500 focus:ring-yellow-500 bg-slate-700 border-slate-600 w-4 h-4"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer select-none leading-relaxed">
                                I agree to the <span onClick={() => setShowTermsModal(true)} className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 cursor-pointer">Terms of Data Privacy</span> and <span onClick={() => setShowPrivacyModal(true)} className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
                            </label>
                        </div>


                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading || !agreedToTerms}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3.5 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? 'Creating Account...' : t.auth.registerBtn}
                        </motion.button>
                    </form>

                    {/* Social Login */}
                    <div className="mt-6">
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-700/50"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
                            <div className="flex-grow border-t border-slate-700/50"></div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                                try {
                                    await loginWithGoogle();
                                    navigate('/dashboard');
                                } catch (err: any) {
                                    setError(err.message || 'Failed to sign in with Google');
                                }
                            }}
                            className="w-full mt-3 bg-white text-slate-900 font-bold py-3 rounded-xl transition flex items-center justify-center gap-3 shadow-lg shadow-black/10 border border-slate-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {t.auth.googleBtn}
                        </motion.button>
                    </div>

                    {/* Footer Link */}
                    <div className="text-center mt-6 pt-4 border-t border-white/5">
                        <p className="text-slate-400 text-sm">
                            {t.auth.hasAccount}{' '}
                            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-bold hover:underline transition">
                                {t.auth.loginBtn}
                            </Link>
                        </p>
                    </div>
                </div >
            </motion.div >

            {/* Email Verification Modal */}
            <AnimatePresence>
                {
                    showVerificationModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-500" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-3">{t.auth.verifyEmail}</h2>
                                    <p className="text-slate-300 mb-6 leading-relaxed">
                                        {t.auth.verifySubtitle} <span className="text-yellow-400 font-semibold block mt-1">{email}</span>
                                    </p>
                                    <div className="bg-slate-800/50 rounded-lg p-3 mb-6 border border-slate-700/50">
                                        <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {t.auth.checkSpam}
                                        </p>
                                    </div>

                                    {resendSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                                        >
                                            <p className="text-green-400 text-sm font-medium">Verification link sent!</p>
                                        </motion.div>
                                    )}

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={resendLoading}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium border border-slate-700"
                                        >
                                            <Send className="w-4 h-4" />
                                            {resendLoading ? 'Sending...' : t.auth.resend}
                                        </button>

                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3.5 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition shadow-lg shadow-orange-500/20"
                                        >
                                            {t.auth.backToLogin}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Privacy Policy Modal */}
            <AnimatePresence>
                {
                    showPrivacyModal && (
                        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
                    )
                }
            </AnimatePresence >

            {/* Terms of Service Modal */}
            <AnimatePresence>
                {
                    showTermsModal && (
                        <TermsOfServiceModal onClose={() => setShowTermsModal(false)} />
                    )
                }
            </AnimatePresence >

        </div >
    );
};

export default Register;
