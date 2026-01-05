import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Search, Heart, User } from 'lucide-react';

export const SceneDashboard = () => {
    const cards = [
        { title: 'Predictions', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'AI Chat', icon: Search, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { title: 'Matching', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        { title: 'Profile', icon: User, color: 'text-green-400', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="min-h-screen bg-transparent p-6 pt-24">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h2 className="text-2xl font-bold text-white">Welcome back, Priya! ✨</h2>
                <p className="text-slate-400">Your cosmic summary for today.</p>
            </motion.div>

            {/* Dasa Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-900 to-purple-900 p-6 rounded-2xl mb-8 border border-white/10"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Current Period</p>
                        <h3 className="text-3xl font-bold text-white mt-1">Saturn Maha Dasa</h3>
                        <p className="text-indigo-200">Until 2043</p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-bold text-indigo-300">64</span>
                        <span className="text-sm text-indigo-400">/100</span>
                    </div>
                </div>
                <div className="mt-4 h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '64%' }}
                        className="h-full bg-indigo-400"
                    />
                </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                        <div className={`w-10 h-10 ${card.bg} rounded-full flex items-center justify-center mb-3`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <h3 className="text-white font-medium">{card.title}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="mt-8 space-y-4">
                <h3 className="text-slate-400 text-sm font-semibold uppercase">Recent Activity</h3>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                        <p className="text-white text-sm">Viewed Career Analysis</p>
                        <p className="text-slate-500 text-xs">2 hours ago</p>
                    </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <div>
                        <p className="text-white text-sm">AI Chat Session</p>
                        <p className="text-slate-500 text-xs">Yesterday</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
