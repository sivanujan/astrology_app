import React from 'react';
import { motion } from 'framer-motion';
import { TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';
import ChartCinematics from '../ChartCinematics';

// Helper to get color based on premium cinematic palette
const getPremiumPlanetColor = (planetName: string) => {
    if (planetName === 'Sun') return 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]'; // Vibrant Orange
    if (planetName === 'Moon') return 'text-indigo-100 drop-shadow-[0_0_8px_rgba(224,231,255,0.8)]'; // Mystical Shimmer
    if (planetName === 'Mars') return 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]'; // Red Glow
    if (planetName === 'Mercury') return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]';
    if (planetName === 'Jupiter') return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]';
    if (planetName === 'Venus') return 'text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]';
    if (planetName === 'Saturn') return 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]';
    if (planetName === 'Rahu' || planetName === 'Ketu') return 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]';
    return 'text-slate-200';
};

interface CinematicChartGridProps {
    title: string;
    planets: any[];
    ascendant: any;
    animationStage?: string;
}

const CinematicChartGrid: React.FC<CinematicChartGridProps> = ({ title, planets, ascendant, animationStage = 'complete' }) => {
    const { language } = useLanguage();

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

    // Visibility Flags
    const showHouseNums = ['grid-draw', 'lagna', 'planets', 'aspects', 'retro', '3d', 'complete'].includes(animationStage);
    const showLagna = ['lagna', 'planets', 'aspects', 'retro', '3d', 'complete'].includes(animationStage);
    const showPlanets = ['planets', 'aspects', 'retro', '3d', 'complete'].includes(animationStage);

    return (
        <div className="flex flex-col items-center w-full relative">
            <h3 className="text-xl font-semibold mb-4 text-amber-100/80 tracking-widest font-serif uppercase drop-shadow-md">{title}</h3>

            <div className={`aspect-square w-full max-w-xl relative mx-auto select-none ${animationStage === '3d' ? 'perspective-1000' : ''}`}>

                {/* Cinema: Magic Golden Glow Overlay */}
                <ChartCinematics stage={animationStage} />

                {/* Grid Container - Navy Blue Transparent */}
                <div className={`grid grid-cols-4 grid-rows-4 h-full w-full relative z-10 border-2 border-amber-500/30 rounded-lg overflow-hidden bg-slate-950/40 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)] ${animationStage === '3d' ? 'animate-spin-slow-3d' : ''}`}>
                    {gridMap.map((signIndex, gridIndex) => {
                        if (signIndex === -1) {
                            if (gridIndex === 5) {
                                return (
                                    <div key="center-content" className="col-span-2 row-span-2 flex items-center justify-center m-1 relative z-10">
                                        <div className="text-center p-4">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 0.3, scale: 1 }}
                                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                                className="text-4xl font-serif text-amber-500/30 mb-2"
                                            >
                                                ॐ
                                            </motion.div>
                                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto" />
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }

                        const { planets: cellPlanets, isAscendant } = getPlanetsInSign(signIndex);
                        const houseNum = ((signIndex - ascendant.signIndex + 12) % 12) + 1;

                        return (
                            <div
                                key={signIndex}
                                className={`
                                    relative border-amber-500/10 p-1 flex flex-col
                                    border-r border-b last:border-0
                                    ${(gridIndex + 1) % 4 === 0 ? 'border-r-0' : ''}
                                    ${gridIndex >= 12 ? 'border-b-0' : ''}
                                    transition-colors
                                    ${isAscendant && showLagna ? 'bg-fuchsia-900/10' : ''}
                                `}
                            >
                                {/* Animation 3: House Numbers Reveal */}
                                {showHouseNums && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 0.4, scale: 1 }}
                                        transition={{ delay: 0.5 + (houseNum * 0.1) }} // Sequential 1-12
                                        className="absolute bottom-1 right-1 text-[10px] md:text-xs font-serif text-amber-200"
                                    >
                                        {houseNum}
                                    </motion.div>
                                )}

                                {/* Animation 5: Lagna Pulse */}
                                {isAscendant && showLagna && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-0 right-0 z-20"
                                    >
                                        <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-bold text-fuchsia-100 bg-fuchsia-600 rounded shadow-[0_0_15px_rgba(217,70,239,0.5)] animate-pulse">
                                            LAGNA
                                        </span>
                                    </motion.div>
                                )}

                                {/* Animation 4: Planet Entrance (Bounce + Rotate) */}
                                {showPlanets && (
                                    <div className="grid grid-cols-2 gap-0.5 mt-1 relative z-10">
                                        {cellPlanets.map((planet: any, i: number) => (
                                            <motion.div
                                                key={planet.name}
                                                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    damping: 12,
                                                    stiffness: 200,
                                                    delay: 1.5 + (houseNum * 0.05) + (i * 0.2)
                                                }}
                                                className={`
                                                    flex items-center gap-1 text-[9px] md:text-[10px] font-medium
                                                    ${getPremiumPlanetColor(planet.name)}
                                                    ${planet.name === 'Mars' ? 'font-bold' : ''}
                                                `}
                                            >
                                                <span>{language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name.slice(0, 2)}</span>
                                                {planet.isRetro && <span className="text-[7px] text-red-500">R</span>}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CinematicChartGrid;
