import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // LEGACY BYPASS (Optional - kept for user's existing habit if they really want it, but warned)
        if (username === 'astrosivanujan' && (password === 'ROOtkiller#2238')) {
            localStorage.setItem('admin_authenticated', 'true');
            // Note: This bypasses Firebase Auth, so Firestore will likely FAIL.
            // We encourage using real email/pass.
            navigate('/admin/dashboard');
            return;
        }

        try {
            // Attempt Real Firebase Login
            // Ensure input is treated as email
            let email = username;
            if (!email.includes('@')) {
                // Heuristic: If they typed a username but we need email, maybe clean it up?
                // But for now, let's assume they enter a valid email or we fail.
                // Or we can try to append a domain if known.
                // For safety, let's just try to allow them to fail and see error.
                setError('Please enter a valid Admin Email Address');
                return;
            }

            // Using the existing auth instance from firebase.ts
            const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
            const auth = getAuth(); // or import { auth } from '../lib/firebase'

            await signInWithEmailAndPassword(auth, email, password);

            localStorage.setItem('admin_authenticated', 'true'); // Keep this for existing route guards
            navigate('/admin/dashboard');

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-email') {
                setError('Invalid email format.');
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid credentials.');
            } else {
                setError('Login failed: ' + err.message);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 max-w-md w-full border border-slate-800 bg-slate-900/50"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                        <Shield className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Restricted Access only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Enter Username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                placeholder="Enter Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        Access Dashboard
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
