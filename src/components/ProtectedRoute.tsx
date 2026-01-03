import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, LogOut, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
    const { user, loading, resendVerification, logout } = useAuth();
    const { t } = useLanguage();
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    if (requireAuth && !user) {
        return <Navigate to="/login" />;
    }

    if (requireAuth && user && !user.emailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 text-center"
                >
                    <Mail className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">{t.auth.verificationRequired}</h2>
                    <p className="text-slate-300 mb-6">
                        {t.auth.verificationRequiredMsg}
                    </p>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>{message.text}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={async () => {
                                setResendLoading(true);
                                setMessage(null);
                                try {
                                    await resendVerification();
                                    setMessage({ type: 'success', text: 'Verification email resent!' });
                                } catch (err) {
                                    setMessage({ type: 'error', text: 'Failed to send email. Please try again later.' });
                                } finally {
                                    setResendLoading(false);
                                }
                            }}
                            disabled={resendLoading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {resendLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                            {t.auth.resend}
                        </button>

                        <button
                            onClick={logout}
                            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            {t.dashboard.logout}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
