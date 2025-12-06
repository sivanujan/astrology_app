import React from 'react';
import { motion } from 'framer-motion';
import { TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../utils/constants';
import { TAMIL_PLANET_ABBREVIATIONS, TAMIL_PLANET_NAMES } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';

export interface ChartGridProps {
    title: string;
    planets: any[];
    ascendant: any;
    onCenterContent?: () => React.ReactNode;
}

const ChartGrid: React.FC<ChartGridProps> = ({ title, planets, ascendant, onCenterContent }) => {
    const { t, language } = useLanguage();

    // Helper to get planets in a specific sign index
    const getPlanetsInSign = (signIndex: number) => {
        const inSign = planets.filter((p: any) => p.signIndex === signIndex);
        const isAscendant = ascendant.signIndex === signIndex;
        return { planets: inSign, isAscendant };
    };

    const gridMap = [
        11, 0, 1, 2,
        10, -1, -1, 3,
        9, -1, -1, 4,
        8, 7, 6, 5
    ];

    return (
        <div className="flex flex-col items-center w-full">
            <h3 className="text-xl font-semibold mb-4 text-slate-300">{title}</h3>
            <div className="aspect-square w-full max-w-xl relative bg-slate-900/50 rounded-lg border-2 border-slate-700 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                    {gridMap.map((signIndex, gridIndex) => {
                        if (signIndex === -1) {
                            if (gridIndex === 5) {
                                return (
                                    <div key={gridIndex} className="col-span-2 row-span-2 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 m-1 rounded-lg">
                                        {onCenterContent ? onCenterContent() : (
                                            <div className="text-center p-4">
                                                <div className="text-4xl font-serif text-slate-700 opacity-20 mb-2">ॐ</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        }

                        const { planets: cellPlanets, isAscendant } = getPlanetsInSign(signIndex);

                        return (
                            <motion.div
                                key={signIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: gridIndex * 0.05 }}
                                className={`
                  relative border border-slate-700/50 bg-slate-900/30 hover:bg-slate-800/50 transition-colors p-1 flex flex-col
                  ${isAscendant ? 'ring-1 ring-purple-500/50 bg-purple-900/10' : ''}
                `}
                            >
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-widest rotate-[-45deg] opacity-50">
                                        {TAMIL_RASI_NAMES[signIndex]}
                                    </span>
                                </div>

                                {isAscendant && (
                                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-1 rounded-bl shadow-sm z-10">
                                        {t.chart.lagna}
                                    </div>
                                )}

                                <div className="absolute top-0 left-0 text-[10px] text-slate-500 font-mono px-1">
                                    {((signIndex - ascendant.signIndex + 12) % 12) + 1}
                                </div>

                                <div className="relative z-10 grid grid-cols-2 gap-0.5 mt-auto">
                                    {cellPlanets.map((planet: any, i: number) => (
                                        <motion.div
                                            key={planet.name}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + (i * 0.1) }}
                                            className={`
                        text-[10px] md:text-xs font-medium px-0.5 py-0.5 rounded
                        ${planet.name === 'Sun' ? 'text-yellow-400' :
                                                    planet.name === 'Moon' ? 'text-white' :
                                                        planet.name === 'Mars' ? 'text-red-400' :
                                                            planet.name === 'Mercury' ? 'text-green-400' :
                                                                planet.name === 'Jupiter' ? 'text-yellow-200' :
                                                                    planet.name === 'Venus' ? 'text-pink-300' :
                                                                        planet.name === 'Saturn' ? 'text-blue-300' :
                                                                            'text-slate-300'}
                      `}
                                            title={`${language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}: ${Math.floor(planet.degree)}°`}
                                        >
                                            {language === 'ta' ? TAMIL_PLANET_ABBREVIATIONS[planet.name] : PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS]}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ChartGrid;
