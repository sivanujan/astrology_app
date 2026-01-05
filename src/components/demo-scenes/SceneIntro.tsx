import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

export const SceneIntro = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white relative overflow-hidden bg-transparent">
            {/* Background Particles */}
            <div className="absolute inset-0 z-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full opacity-20"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                        style={{ width: Math.random() * 4, height: Math.random() * 4 }}
                    />
                ))}
            </div>

            <div className="z-10 text-center space-y-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 leading-tight">
                        What if you could<br />predict your future?
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-widest uppercase">AstroZen</h2>
                    <p className="text-purple-300 mt-2">Your Cosmic Blueprint</p>
                </motion.div>
            </div>
        </div>
    );
};
