import React from 'react';
import { motion } from 'framer-motion';
import { TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../utils/constants';

interface SouthIndianChartProps {
    data: any;
}

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ data }) => {
    if (!data) return null;

    const { planets, ascendant } = data;

    // Helper to get planets in a specific sign index (0 = Aries, 11 = Pisces)
    const getPlanetsInSign = (signIndex: number) => {
        const inSign = planets.filter((p: any) => p.signIndex === signIndex);
        const isAscendant = ascendant.signIndex === signIndex;
        return { planets: inSign, isAscendant };
    };

    // South Indian Chart Layout (Fixed Signs)
    // We need to map the 12 signs to the 12 grid positions.
    // Grid is 4x4.
    // Row 1: Pisces(11), Aries(0), Taurus(1), Gemini(2)
    // Row 2: Aquarius(10), Center, Center, Cancer(3)
    // Row 3: Capricorn(9), Center, Center, Leo(4)
    // Row 4: Sagittarius(8), Scorpio(7), Libra(6), Virgo(5)

    // We can represent this as a flat array of 16 cells for a 4x4 grid.
    // 0: Pisces, 1: Aries, 2: Taurus, 3: Gemini
    // 4: Aquarius, 5: null, 6: null, 7: Cancer
    // 8: Capricorn, 9: null, 10: null, 11: Leo
    // 12: Sagittarius, 13: Scorpio, 14: Libra, 15: Virgo

    const gridMap = [
        11, 0, 1, 2,
        10, -1, -1, 3,
        9, -1, -1, 4,
        8, 7, 6, 5
    ];

    return (
        <div className="max-w-4xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    South Indian Chart
                </h2>
                <p className="text-slate-400">
                    {data.userDetails.name} • {new Date(data.userDetails.date).toLocaleDateString()}
                </p>
            </motion.div>

            <div className="aspect-square max-w-2xl mx-auto relative bg-slate-900/50 rounded-lg border-2 border-slate-700 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                    {gridMap.map((signIndex, gridIndex) => {
                        if (signIndex === -1) {
                            // Center area (merged)
                            if (gridIndex === 5) {
                                return (
                                    <div key={gridIndex} className="col-span-2 row-span-2 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 m-1 rounded-lg">
                                        <div className="text-center p-4">
                                            <div className="text-4xl font-serif text-slate-700 opacity-20 mb-2">ॐ</div>
                                            <div className="text-sm text-slate-500">Lagna (Asc): {TAMIL_RASI_NAMES[ascendant.signIndex]}</div>
                                            <div className="text-xs text-slate-600 mt-1">
                                                {Math.floor(ascendant.degree)}° {Math.round((ascendant.degree % 1) * 60)}'
                                            </div>
                                        </div>
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
                                {/* Rasi Name (Background) */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-800 uppercase tracking-widest rotate-[-45deg] opacity-50">
                                        {TAMIL_RASI_NAMES[signIndex]}
                                    </span>
                                </div>

                                {/* Ascendant Marker */}
                                {isAscendant && (
                                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-1 rounded-bl shadow-sm z-10">
                                        Lagna
                                    </div>
                                )}

                                {/* Planets Grid */}
                                <div className="relative z-10 grid grid-cols-2 gap-0.5 mt-auto">
                                    {cellPlanets.map((planet: any, i: number) => (
                                        <motion.div
                                            key={planet.name}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + (i * 0.1) }}
                                            className={`
                        text-[10px] md:text-xs font-medium px-1 py-0.5 rounded
                        ${planet.name === 'Sun' ? 'text-yellow-400' :
                                                    planet.name === 'Moon' ? 'text-white' :
                                                        planet.name === 'Mars' ? 'text-red-400' :
                                                            planet.name === 'Mercury' ? 'text-green-400' :
                                                                planet.name === 'Jupiter' ? 'text-yellow-200' :
                                                                    planet.name === 'Venus' ? 'text-pink-300' :
                                                                        planet.name === 'Saturn' ? 'text-blue-300' :
                                                                            'text-slate-300'}
                      `}
                                            title={`${planet.name}: ${Math.floor(planet.degree)}°`}
                                        >
                                            {PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS]}
                                            <span className="text-[8px] opacity-70 ml-0.5">
                                                {Math.floor(planet.degree)}°
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    * Chart calculated using Lahiri Ayanamsa (Sidereal)
                </p>
            </div>
        </div>
    );
};

export default SouthIndianChart;
