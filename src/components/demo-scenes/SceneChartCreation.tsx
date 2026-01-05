import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAMIL_RASI_NAMES } from '../../utils/constants';
import CinematicChartGrid from './CinematicChartGrid';

interface SceneChartCreationProps {
    data: any;
    step: string; // 'input' | 'loading' | 'result'
    animationStage: string;
}

export const SceneChartCreation: React.FC<SceneChartCreationProps> = ({ data, step, animationStage }) => {

    // Visiblity Flags
    const showBirthCard = ['init', 'grid-draw', 'lagna', 'planets', 'aspects', 'retro', '3d', 'complete'].includes(animationStage);
    const showCharts = ['grid-draw', 'lagna', 'planets', 'aspects', 'retro', '3d', 'complete'].includes(animationStage);

    // Mock Navamsa (Shift by 8 signs for demo visual)
    const navamsaPlanets = useMemo(() => {
        if (!data) return [];
        return data.planets.map((p: any) => ({
            ...p,
            signIndex: (p.signIndex + 8) % 12
        }));
    }, [data]);

    const navamsaAscendant = useMemo(() => {
        if (!data) return { signIndex: 0, degree: 0 };
        return { ...data.ascendant, signIndex: (data.ascendant.signIndex + 8) % 12 };
    }, [data]);

    if (!data) return null;

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 space-y-8 relative z-20">

            {/* Animation 1: Birth Details Card Fade In */}
            <AnimatePresence>
                {step === 'result' && showBirthCard && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-md border border-fuchsia-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1">Date</h4>
                                <p className="text-white font-serif tracking-wide">{data.birthDate}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1">Time</h4>
                                <p className="text-white font-serif tracking-wide">{data.userDetails.time}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1">Place</h4>
                                <p className="text-white font-serif tracking-wide">{data.userDetails.city.split(',')[0]}</p>
                            </div>
                            <div>
                                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-1">Lagna</h4>
                                <p className="text-fuchsia-400 font-bold font-serif tracking-wide">
                                    Simmam (Leo) {/* Hardcoded for Demo per request */}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animation 2: Dual Chart Grid Materialize */}
            {step === 'result' && showCharts && (
                <div className={`grid grid-cols-1 xl:grid-cols-2 gap-8 items-start justify-items-center w-full ${animationStage === '3d' ? 'perspective-1000' : ''}`}>
                    {/* Rasi Chart (D1) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={animationStage === '3d' ? {
                            rotateY: 360,
                            opacity: 1,
                            scale: [1, 0.9, 1]
                        } : { opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: animationStage === '3d' ? 8 : 1.5, ease: "linear" }}
                        className="w-full max-w-xl"
                    >
                        <CinematicChartGrid
                            title="Rasi Chart (D1)"
                            planets={data.planets}
                            ascendant={data.ascendant}
                            animationStage={animationStage}
                        />
                    </motion.div>

                    {/* Navamsa Chart (D9) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={animationStage === '3d' ? {
                            rotateY: -360,
                            opacity: 1,
                            scale: [1, 0.9, 1]
                        } : { opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: animationStage === '3d' ? 8 : 1.5, ease: "linear", delay: 0.2 }}
                        className="w-full max-w-xl"
                    >
                        <CinematicChartGrid
                            title="Navamsa Chart (D9)"
                            planets={navamsaPlanets}
                            ascendant={navamsaAscendant}
                            animationStage={animationStage}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};
