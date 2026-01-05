import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

export const SceneOutro = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden bg-transparent">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="z-10 text-center"
            >
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Star className="w-10 h-10 text-purple-600 fill-purple-600" />
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Start Your Cosmic Journey</h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">Get your personalized horoscope, AI predictions, and more.</p>

                <motion.button
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center gap-2 mx-auto"
                >
                    Create Free Chart <ArrowRight className="w-5 h-5" />
                </motion.button>

                <div className="mt-12 text-slate-500 text-sm">
                    www.astrozen.app
                </div>
            </motion.div>
        </div>
    );
};
