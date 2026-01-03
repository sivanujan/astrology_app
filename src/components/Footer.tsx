import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
    return (
        <footer className="relative z-10 w-full mt-auto py-8 text-center">
            {/* Divider Line */}
            <div className="w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-8" />

            {/* Content Container */}
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0.5, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-2 group"
                >
                    <p className="text-sm md:text-base font-normal text-purple-100/70 tracking-wide font-sans">
                        &copy; 2026 Astrozen. All rights reserved by{' '}
                        <span className="inline-flex items-center gap-2 transition-all duration-300 hover:text-white cursor-default">
                            Saturn
                            <motion.span
                                className="inline-block text-xl"
                                whileHover={{
                                    rotate: 360,
                                    scale: 1.2,
                                    filter: "brightness(1.2)"
                                }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                🪐
                            </motion.span>
                        </span>
                    </p>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
