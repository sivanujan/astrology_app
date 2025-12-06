import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, AlertTriangle, CheckCircle, Shield, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits,
    calculateFullTransitChart
} from '../utils/astrology';
import { getFunctionalNature } from '../utils/adityaGurujiSubathuvam';
import { getDailySnapshot } from '../utils/gocharam';
import ChartGrid from './ChartGrid';

interface DailySnapshotProps {
    data: any;
}

const DailySnapshot: React.FC<DailySnapshotProps> = ({ data }) => {
    const { t, language } = useLanguage();

    if (!data) return null;

    const { planets, ascendant, birthDate } = data;
    const moon = planets.find((p: any) => p.name === 'Moon');

    if (!moon) return <div className="text-center p-8 text-slate-400">Moon position not found.</div>;

    // 1. Calculate Dasa Status
    const dashaPeriods = calculateDashaPeriods(moon.longitude, birthDate);
    const currentDasha = getCurrentDasha(dashaPeriods);

    let dasaStatus: 'Good' | 'Bad' | 'Neutral' = 'Neutral';
    let dasaDescription = "Neutral Period";

    if (currentDasha) {
        const dasaLord = currentDasha.maha.planet;
        const functionalNature = getFunctionalNature(ascendant.signIndex);
        const nature = functionalNature[dasaLord]?.nature;

        if (nature === 'Yogakaraka' || nature === 'Benefic') {
            dasaStatus = 'Good';
            dasaDescription = `${dasaLord} Dasa (Benefic)`;
        } else if (nature === 'Malefic' || nature === 'Maraka') {
            dasaStatus = 'Bad';
            dasaDescription = `${dasaLord} Dasa (Malefic)`;
        }
    }

    // 2. Calculate Transits
    const transits = calculateCurrentTransits();
    const fullTransitChart = calculateFullTransitChart();

    // 3. Get Snapshot
    const snapshot = getDailySnapshot(
        moon.signIndex,
        ascendant.signIndex,
        dasaStatus,
        transits
    );

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400 border-green-500/30 bg-green-500/10';
            case 'warning': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
            case 'danger': return 'text-red-400 border-red-500/30 bg-red-500/10';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center gap-3">
                    <Sun className="w-8 h-8 text-orange-400" />
                    Daily Planetary Snapshot
                </h2>
                <p className="text-slate-400 mt-2">
                    Your personalized daily forecast based on Gocharam & Dasa Balance.
                </p>
            </motion.div>

            {/* Verdict Card */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-8 rounded-2xl border-2 text-center relative overflow-hidden ${getStatusColor(snapshot.verdict.type)}`}
            >
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide">
                        {snapshot.verdict.title}
                    </h3>
                    <p className="text-lg opacity-90 leading-relaxed max-w-2xl mx-auto">
                        {snapshot.verdict.message}
                    </p>
                </div>

                {/* Background Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${snapshot.verdict.type === 'success' ? 'bg-green-500' :
                        snapshot.verdict.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
            </motion.div>

            {/* Current Transit Chart */}
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <ChartGrid
                        title="Current Transit Chart (Gocharam)"
                        planets={fullTransitChart}
                        ascendant={ascendant}
                    />
                    <p className="text-center text-xs text-slate-500 mt-2">
                        * Chart shows current planetary positions. Your Lagna is marked.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Jupiter Transit */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-6 border-t-4 border-t-yellow-500"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-yellow-100 flex items-center gap-2">
                            Guru Gocharam
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${snapshot.jupiter.isFavorable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {snapshot.jupiter.status}
                        </span>
                    </div>
                    <p className="text-slate-300 mb-4 min-h-[3rem]">
                        {snapshot.jupiter.description}
                    </p>
                    {snapshot.jupiter.aspects && snapshot.jupiter.aspects.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-yellow-300 bg-yellow-900/20 p-3 rounded-lg">
                            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-bold block mb-1">Special Protection:</span>
                                {snapshot.jupiter.aspects.join(', ')}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Saturn Transit */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-6 border-t-4 border-t-blue-500"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                            Sani Gocharam
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${snapshot.saturn.isFavorable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {snapshot.saturn.status}
                        </span>
                    </div>
                    <p className="text-slate-300 mb-4">
                        {snapshot.saturn.description}
                    </p>
                    <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg flex gap-2">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                            Saturn's effects are slow and teach discipline.
                            {snapshot.saturn.status === 'Sade Sati' && " Chant Hanuman Chalisa."}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Dasa Context */}
            <div className="glass-panel p-4 flex items-center justify-between text-sm text-slate-400">
                <span>Current Dasa Context:</span>
                <span className={`font-bold ${dasaStatus === 'Good' ? 'text-green-400' :
                        dasaStatus === 'Bad' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                    {dasaDescription}
                </span>
            </div>
        </div>
    );
};

export default DailySnapshot;
