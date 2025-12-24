import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Sparkles } from 'lucide-react';

const EmailVerification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const oobCode = searchParams.get('oobCode');
            const mode = searchParams.get('mode');

            if (!oobCode || mode !== 'verifyEmail') {
                setStatus('error');
                setMessage('Invalid verification link. Please request a new one.');
                return;
            }

            try {
                await applyActionCode(auth, oobCode);
                setStatus('success');
                setMessage('Your email has been verified successfully!');

                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                if (error.code === 'auth/expired-action-code') {
                    setMessage('This verification link has expired. Please request a new one.');
                } else if (error.code === 'auth/invalid-action-code') {
                    setMessage('This verification link is invalid or has already been used.');
                } else {
                    setMessage('Failed to verify email. Please try again.');
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white flex items-center justify-center p-4">

            {/* Animated Background Stars */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {[...Array(100)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 max-w-md w-full"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">

                    <div className="text-center">
                        {/* Status Icon */}
                        <div className="mb-6">
                            {status === 'loading' && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="inline-block"
                                >
                                    <Loader className="w-16 h-16 text-purple-400" />
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                >
                                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                >
                                    <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                                </motion.div>
                            )}
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            {status === 'loading' && 'Verifying Your Email...'}
                            {status === 'success' && 'Email Verified! ✨'}
                            {status === 'error' && 'Verification Failed'}
                        </h1>

                        {/* Message */}
                        <p className="text-gray-300 mb-6 text-lg">
                            {message}
                        </p>

                        {/* Actions */}
                        {status === 'success' && (
                            <div className="space-y-3">
                                <p className="text-sm text-gray-400">
                                    Redirecting to dashboard in 3 seconds...
                                </p>
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3, ease: 'linear' }}
                                    className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                />
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/20"
                                >
                                    Request New Verification
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 font-semibold rounded-lg transition-all duration-200 border border-slate-700"
                                >
                                    Go to Login
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -z-10">
                        <Sparkles className="w-32 h-32 text-purple-500/10" />
                    </div>
                    <div className="absolute bottom-0 left-0 -z-10">
                        <Sparkles className="w-24 h-24 text-blue-500/10" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerification;
