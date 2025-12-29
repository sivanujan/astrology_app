import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, Calendar, ArrowRight } from 'lucide-react';
import { calculateDashaPeriods, getCurrentDasha, DashaPeriod, PLANET_COLORS } from '../utils/astrology';
import { useLanguage } from '../contexts/LanguageContext';
import { TAMIL_PLANET_NAMES } from '../utils/translations';
import { format } from 'date-fns';
import DasaAnalysis from './DasaAnalysis';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import { calculateDasaScore, DasaQuality } from '../utils/dashaScoring';
import { DasaScoreSummary } from './DasaScoreSummary';

interface DashaPeriodsProps {
    data: any;
}

const DashaPeriods: React.FC<DashaPeriodsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const [periods, setPeriods] = useState<DashaPeriod[]>([]);
    const [currentDasha, setCurrentDasha] = useState<any>(null);
    const [expandedMaha, setExpandedMaha] = useState<number | null>(null);
    const [expandedBhukti, setExpandedBhukti] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            const moon = data.planets.find((p: any) => p.name === 'Moon');
            if (moon) {
                const dashaPeriods = calculateDashaPeriods(data.birthDate, moon.longitude);
                setPeriods(dashaPeriods);
                setCurrentDasha(getCurrentDasha(dashaPeriods));

                // Auto-expand current Maha Dasha
                const current = getCurrentDasha(dashaPeriods);
                if (current && current.maha) {
                    const index = dashaPeriods.findIndex(p => p.planet === current.maha.planet && p.startDate.getTime() === current.maha.startDate.getTime());
                    if (index !== -1) setExpandedMaha(index);
                }
            }
        }
    }, [data]);

    if (!data) return null;

    const getPlanetName = (name: string) => {
        return language === 'ta' ? TAMIL_PLANET_NAMES[name] : name;
    };

    const formatDate = (date: Date) => {
        try {
            if (!date || isNaN(date.getTime())) return 'Invalid Date';
            return format(date, 'dd MMM yyyy');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    {t.dasha.title}
                </h2>
                <p className="text-slate-400">{t.dasha.timeline}</p>
            </motion.div>

            {/* Current Dasha Card */}
            {currentDasha ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-6 h-6 text-purple-400 animate-pulse" />
                        <h3 className="text-xl font-bold">{t.dasha.current}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        {/* Maha Dasha */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                            <div className="text-sm text-slate-400 mb-1">{t.dasha.maha}</div>
                            <div className="text-2xl font-bold mb-2" style={{ color: PLANET_COLORS[currentDasha.maha.planet] }}>
                                {getPlanetName(currentDasha.maha.planet)}
                            </div>
                            <div className="text-xs text-slate-500">
                                {formatDate(currentDasha.maha.startDate)} - {formatDate(currentDasha.maha.endDate)}
                            </div>
                        </div>

                        {/* Bhukti */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 relative">
                            <ArrowRight className="absolute -left-3 top-1/2 -translate-y-1/2 text-slate-700 hidden md:block" />
                            <div className="text-sm text-slate-400 mb-1">{t.dasha.bhukti}</div>
                            <div className="text-2xl font-bold mb-2" style={{ color: PLANET_COLORS[currentDasha.bhukti?.planet || 'Sun'] }}>
                                {currentDasha.bhukti ? getPlanetName(currentDasha.bhukti.planet) : '-'}
                            </div>
                            <div className="text-xs text-slate-500">
                                {currentDasha.bhukti ? `${formatDate(currentDasha.bhukti.startDate)} - ${formatDate(currentDasha.bhukti.endDate)}` : ''}
                            </div>
                        </div>

                        {/* Antaram */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 relative">
                            <ArrowRight className="absolute -left-3 top-1/2 -translate-y-1/2 text-slate-700 hidden md:block" />
                            <div className="text-sm text-slate-400 mb-1">{t.dasha.antaram}</div>
                            <div className="text-2xl font-bold mb-2" style={{ color: PLANET_COLORS[currentDasha.antaram?.planet || 'Sun'] }}>
                                {currentDasha.antaram ? getPlanetName(currentDasha.antaram.planet) : '-'}
                            </div>
                            <div className="text-xs text-slate-500">
                                {currentDasha.antaram ? `${formatDate(currentDasha.antaram.startDate)} - ${formatDate(currentDasha.antaram.endDate)}` : ''}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="text-center p-8 glass-panel text-slate-400">
                    <p>Current date is outside the calculated 120-year Dasha period.</p>
                </div>
            )}

            {/* Comprehensive Dasa Analysis */}
            {currentDasha && data.planets && data.ascendant && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                >
                    <DasaAnalysis
                        chart={{
                            planets: data.planets,
                            ascendant: data.ascendant,
                            birthDate: data.birthDate
                        }}
                        currentDasa={{
                            maha: {
                                planet: currentDasha.maha?.planet || 'Unknown',
                                startDate: currentDasha.maha?.startDate || '',
                                endDate: currentDasha.maha?.endDate || ''
                            },
                            bhukti: currentDasha.bhukti ? {
                                planet: currentDasha.bhukti.planet,
                                startDate: currentDasha.bhukti.startDate || '',
                                endDate: currentDasha.bhukti.endDate || ''
                            } : undefined,
                            antaram: currentDasha.antaram ? {
                                planet: currentDasha.antaram.planet,
                                startDate: currentDasha.antaram.startDate || '',
                                endDate: currentDasha.antaram.endDate || ''
                            } : undefined
                        }}
                        agScores={calculateAdityaGurujiSubathuvam(data.planets)}
                    />
                    <div className="mt-8">
                        <DasaScoreSummary
                            chart={{ planets: data.planets, ascendant: data.ascendant }}
                            language={language}
                        />
                    </div>
                </motion.div>
            )}

            {/* Timeline Accordion */}
            <div className="space-y-4">
                {periods.map((maha, idx) => {
                    const isCurrentMaha = currentDasha?.maha?.planet === maha.planet && currentDasha?.maha?.startDate.getTime() === maha.startDate.getTime();

                    return (
                        <div key={idx} className={`glass-panel overflow-hidden transition-all duration-300 ${isCurrentMaha ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : ''}`}>
                            <button
                                onClick={() => setExpandedMaha(expandedMaha === idx ? null : idx)}
                                className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${isCurrentMaha ? 'bg-purple-900/20' : 'bg-slate-900/50 hover:bg-slate-800/50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                                        style={{ backgroundColor: PLANET_COLORS[maha.planet], color: PLANET_COLORS[maha.planet] }}
                                    />
                                    <div className="text-left">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {getPlanetName(maha.planet)} {t.dasha.maha}
                                            {isCurrentMaha && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t.dasha.current}</span>}
                                        </div>
                                        <div className="text-sm text-slate-400 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(maha.startDate)} - {formatDate(maha.endDate)}
                                        </div>
                                    </div>
                                </div>
                                {expandedMaha === idx ? <ChevronUp /> : <ChevronDown />}
                            </button>

                            <AnimatePresence>
                                {expandedMaha === idx && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="border-t border-slate-800"
                                    >
                                        <div className="p-4 space-y-2">
                                            {maha.subPeriods?.map((bhukti, bIdx) => {
                                                const isCurrentBhukti = isCurrentMaha && currentDasha?.bhukti?.planet === bhukti.planet && currentDasha?.bhukti?.startDate.getTime() === bhukti.startDate.getTime();

                                                return (
                                                    <div key={bIdx} className={`rounded-lg overflow-hidden border transition-all ${isCurrentBhukti ? 'bg-purple-900/10 border-purple-500/50' : 'bg-slate-950/50 border-slate-800/50'}`}>
                                                        <button
                                                            onClick={() => setExpandedBhukti(expandedBhukti === `${idx}-${bIdx}` ? null : `${idx}-${bIdx}`)}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: PLANET_COLORS[bhukti.planet] }}
                                                                />
                                                                <span className="font-medium text-sm flex items-center gap-2">
                                                                    {getPlanetName(bhukti.planet)} {t.dasha.bhukti}
                                                                    {isCurrentBhukti && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                                                                </span>
                                                                <span className="text-xs text-slate-500 ml-2">
                                                                    {formatDate(bhukti.startDate)} - {formatDate(bhukti.endDate)}
                                                                </span>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedBhukti === `${idx}-${bIdx}` ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedBhukti === `${idx}-${bIdx}` && (
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: 'auto' }}
                                                                    exit={{ height: 0 }}
                                                                    className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2"
                                                                >
                                                                    {bhukti.subPeriods?.map((antaram, aIdx) => {
                                                                        const isCurrentAntaram = isCurrentBhukti && currentDasha?.antaram?.planet === antaram.planet && currentDasha?.antaram?.startDate.getTime() === antaram.startDate.getTime();

                                                                        return (
                                                                            <div key={aIdx} className={`text-xs flex items-center justify-between p-2 rounded border ${isCurrentAntaram ? 'bg-purple-900/30 border-purple-500 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                                                                                <span style={{ color: isCurrentAntaram ? '#e9d5ff' : PLANET_COLORS[antaram.planet] }} className="font-medium">
                                                                                    {getPlanetName(antaram.planet)}
                                                                                </span>
                                                                                <span className={isCurrentAntaram ? 'text-purple-300' : 'text-slate-500'}>
                                                                                    {formatDate(antaram.startDate)} - {formatDate(antaram.endDate)}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashaPeriods;
