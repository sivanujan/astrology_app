import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const SceneAnalysis = () => {
    return (
        <div className="min-h-screen bg-transparent p-6 pt-24 text-white">
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold mb-8"
            >
                Deep Astrological Analysis
            </motion.h2>

            <div className="space-y-6">
                {/* Strength Bars */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-slate-400 mb-4 text-sm font-bold uppercase">Planetary Strengths</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Sun', score: 78, color: 'bg-orange-500' },
                            { name: 'Moon', score: 45, color: 'bg-slate-400' },
                            { name: 'Jupiter', score: 92, color: 'bg-yellow-500' },
                            { name: 'Venus', score: 88, color: 'bg-pink-500' },
                        ].map((p, i) => (
                            <div key={p.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{p.name}</span>
                                    <span>{p.score}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${p.score}%` }}
                                        transition={{ duration: 1, delay: i * 0.2 }}
                                        className={`h-full ${p.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Yoga Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div
                        initial={{ rotateX: 90 }}
                        animate={{ rotateX: 0 }}
                        transition={{ delay: 1 }}
                        className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl text-center"
                    >
                        <h3 className="text-purple-300 font-bold text-lg mb-1">Gaja Kesari</h3>
                        <p className="text-xs text-purple-200">Wealth & Fame</p>
                    </motion.div>
                    <motion.div
                        initial={{ rotateX: 90 }}
                        animate={{ rotateX: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl text-center"
                    >
                        <h3 className="text-yellow-300 font-bold text-lg mb-1">Budha Aditya</h3>
                        <p className="text-xs text-yellow-200">Intelligence</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
