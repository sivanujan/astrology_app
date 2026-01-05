import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, AlertTriangle } from 'lucide-react';

export const SceneMatching = () => {
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowResult(true), 1500);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-20 bg-transparent">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500 mb-8">
                Compatibility Match
            </h2>

            <div className="flex items-center justify-center gap-4 md:gap-12 mb-12">
                {/* Profile 1 */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center w-32 md:w-48"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">👨</div>
                    <h3 className="font-bold text-white">Raj</h3>
                    <p className="text-xs text-slate-400">10/03/1995</p>
                </motion.div>

                {/* Heart */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                >
                    <div className="w-16 h-16 bg-gradient-to-tr from-pink-600 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-600/30">
                        <Heart className="w-8 h-8 text-white fill-current" />
                    </div>
                </motion.div>

                {/* Profile 2 */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center w-32 md:w-48"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-600/20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">👩</div>
                    <h3 className="font-bold text-white">Priya</h3>
                    <p className="text-xs text-slate-400">15/08/1995</p>
                </motion.div>
            </div>

            {/* Result Overlay */}
            {showResult && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-green-500/30 shadow-2xl max-w-sm w-full text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center">
                            <span className="text-3xl font-bold text-green-400">7.5</span>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Excellent Match! 💚</h3>
                    <p className="text-slate-400 text-sm mb-6">Great mental and spiritual harmony.</p>

                    <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-200">Dina Porutham (Health)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-200">Gana Porutham (Nature)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-200">Nadi Porutham (Genes)</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
