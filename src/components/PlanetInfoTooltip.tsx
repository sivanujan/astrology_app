import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { PLANET_INFO, PLANET_INFO_TA } from '../utils/planetInfo';

interface PlanetInfoTooltipProps {
    planetName: string;
}

const PlanetInfoTooltip: React.FC<PlanetInfoTooltipProps> = ({ planetName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { language } = useLanguage();

    const info = language === 'ta' ? PLANET_INFO_TA[planetName as keyof typeof PLANET_INFO_TA] : PLANET_INFO[planetName as keyof typeof PLANET_INFO];
    const color = PLANET_INFO[planetName as keyof typeof PLANET_INFO]?.color || '#94a3b8';

    if (!info) return null;

    return (
        <div className="relative inline-block">
            <span
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="ml-1 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer inline-flex items-center"
            >
                <Info className="w-4 h-4" />
            </span>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute left-0 top-full mt-2 z-50 w-72 glass-panel p-4 border-2 shadow-xl"
                            style={{ borderColor: color }}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Planet name with color */}
                            <h4 className="font-bold text-lg mb-3" style={{ color }}>
                                {planetName}
                            </h4>

                            {/* Info grid */}
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="text-slate-400 w-24 flex-shrink-0">
                                        {language === 'ta' ? 'இயல்பு:' : 'Nature:'}
                                    </span>
                                    <span className="text-white font-medium">{info.nature}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-slate-400 w-24 flex-shrink-0">
                                        {language === 'ta' ? 'உறுப்பு:' : 'Element:'}
                                    </span>
                                    <span className="text-white font-medium">{info.element}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-slate-400 w-24 flex-shrink-0">
                                        {language === 'ta' ? 'காரகம்:' : 'Karaka:'}
                                    </span>
                                    <span className="text-white font-medium">{info.karaka}</span>
                                </div>
                                <div className="border-t border-slate-700 pt-2 mt-2">
                                    <span className="text-slate-400 text-xs">
                                        {language === 'ta' ? 'விளைவுகள்:' : 'Effects:'}
                                    </span>
                                    <p className="text-white mt-1">{info.effects}</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlanetInfoTooltip;
