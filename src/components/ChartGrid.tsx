import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../utils/constants';
import { TAMIL_PLANET_NAMES } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { getFunctionalNature } from '../utils/adityaGurujiSubathuvam';

export interface ChartGridProps {
    title: string;
    planets: any[];
    ascendant: any;
    onCenterContent?: () => React.ReactNode;
}

const ChartGrid: React.FC<ChartGridProps> = ({ title, planets, ascendant, onCenterContent }) => {
    const { t, language } = useLanguage();

    // Determine functional nature based on Ascendant (Force English for stable logic keys)
    const nature = useMemo(() => getFunctionalNature(ascendant.signIndex, 'en'), [ascendant.signIndex]);

    // Calculate Moon illumination percentage
    const getMoonIllumination = useMemo(() => {
        const moon = planets.find((p: any) => p.name === 'Moon');
        const sun = planets.find((p: any) => p.name === 'Sun');

        if (!moon || !sun) return 50; // Default to middle if not found

        // Calculate angular separation between Sun and Moon
        let separation = Math.abs(moon.longitude - sun.longitude);
        if (separation > 180) separation = 360 - separation;

        // Convert to illumination percentage
        // 0° = New Moon (0%), 180° = Full Moon (100%)
        const illumination = (1 - Math.cos((separation * Math.PI) / 180)) * 50;

        return illumination;
    }, [planets]);

    // Helper to get color based on nature
    const getPlanetColor = (planetName: string) => {
        // Moon color based on brightness/illumination
        if (planetName === 'Moon') {
            const illumination = getMoonIllumination;

            if (illumination < 30) {
                // New Moon (Dark) - Red
                return 'text-red-400';
            } else if (illumination < 70) {
                // Waxing/Waning (Middle) - Orange
                return 'text-orange-400';
            } else {
                // Full Moon (Bright) - Green
                return 'text-green-400';
            }
        }

        // Other planet overrides
        if (planetName === 'Sun') return 'text-orange-400';
        if (planetName === 'Venus') return 'text-green-400';
        if (planetName === 'Mars') return 'text-red-400';
        if (planetName === 'Mercury') {
            const planet = planets.find((p: any) => p.name === 'Mercury');
            if (planet) {
                const count = planets.filter((p: any) => p.signIndex === planet.signIndex).length;
                return count === 1 ? 'text-green-400' : 'text-orange-400';
            }
        }

        // Default to Functional Nature for others
        const pNature = nature[planetName]?.nature;
        if (!pNature) return 'text-yellow-300';

        if (['Yogakaraka', 'Benefic'].includes(pNature)) return 'text-green-400 font-semibold';
        if (['Malefic', 'Maraka'].includes(pNature)) return 'text-red-400';
        return 'text-yellow-300';
    };

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
            <h3 className="text-xl font-semibold mb-4 text-slate-300 tracking-wide">{title}</h3>
            <div className="aspect-square w-full max-w-xl relative bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden ring-1 ring-slate-800">
                <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                    {gridMap.map((signIndex, gridIndex) => {
                        if (signIndex === -1) {
                            if (gridIndex === 5) {
                                return (
                                    <div key="center-content" className="col-span-2 row-span-2 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 m-1 rounded-2xl relative overflow-hidden group">
                                        {/* Cosmic Center Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-50" />
                                        {onCenterContent ? onCenterContent() : (
                                            <div className="text-center p-4 relative z-10">
                                                <div className="text-5xl font-serif text-slate-700 opacity-20 mb-2 animate-pulse">ॐ</div>
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
                  relative border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/60 transition-colors flex flex-col p-1
                  ${isAscendant ? 'ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-900/20 z-10' : ''}
                `}
                            >
                                {/* Rasi Name Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <span className="text-[10px] md:text-sm font-bold text-slate-800 uppercase tracking-widest rotate-[-45deg] opacity-40">
                                        {TAMIL_RASI_NAMES[signIndex]}
                                    </span>
                                </div>

                                {/* Ascendant Badge */}
                                {isAscendant && (
                                    <div className="absolute -top-px -right-px bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl shadow-sm z-20 uppercase tracking-wider">
                                        {t.chart.lagna} ({TAMIL_RASI_NAMES[signIndex]})
                                    </div>
                                )}

                                {/* House Number */}
                                <div className="absolute top-0.5 left-1 text-xs md:text-sm font-bold text-slate-500 font-mono opacity-60">
                                    {((signIndex - ascendant.signIndex + 12) % 12) + 1}
                                </div>

                                {/* Planet List */}
                                <div className={`relative z-10 flex flex-col justify-center h-full gap-0.5 mt-3 ${cellPlanets.length > 4 ? 'scale-90 origin-center' : ''}`}>
                                    {cellPlanets.map((planet: any, i: number) => (
                                        <div
                                            key={planet.name}
                                            className={`
                                                flex items-center justify-between px-1 rounded hover:bg-white/5 transition-colors
                                                text-[9px] md:text-[10px] lg:text-xs font-medium leading-tight
                                                ${getPlanetColor(planet.name)}
                                            `}
                                        >
                                            <div className="flex items-center gap-1">
                                                <span>
                                                    {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                </span>
                                                {planet.isRetro && (
                                                    <span className="text-[8px] text-red-500 font-bold bg-red-500/10 px-0.5 rounded ml-0.5">
                                                        {language === 'ta' ? 'வ' : '(R)'}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[8px] md:text-[9px] opacity-60 font-mono tracking-tighter">
                                                {Math.floor(planet.degree)}°
                                            </span>
                                        </div>
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
