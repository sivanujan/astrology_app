import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, Calendar, ArrowRight, Search, Filter } from 'lucide-react';
import { calculateDashaPeriods, getCurrentDasha, DashaPeriod, PLANET_COLORS } from '../utils/astrology';
import { useLanguage } from '../contexts/LanguageContext';
import { TAMIL_PLANET_NAMES } from '../utils/translations';
import { format } from 'date-fns';
import DasaAnalysis from './DasaAnalysis';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import { calculateDasaScore, DasaQuality } from '../utils/dashaScoring';
import DashaStatsCard from './DashaStatsCard';
import DashaProgressBar from './DashaProgressBar';
import PlanetInfoTooltip from './PlanetInfoTooltip';


interface DashaPeriodsProps {
    data: any;
}

const DashaPeriods: React.FC<DashaPeriodsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const [periods, setPeriods] = useState<DashaPeriod[]>([]);
    const [currentDasha, setCurrentDasha] = useState<any>(null);
    const [expandedMaha, setExpandedMaha] = useState<number | null>(null);
    const [expandedBhukti, setExpandedBhukti] = useState<string | null>(null);

    // Search and Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'current' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        if (data) {
            const moon = data.planets.find((p: any) => p.name === 'Moon');
            if (moon) {
                // Reconstruct birthDate if it's missing or serialized
                let birthDate = data.birthDate;
                if (!birthDate || typeof birthDate === 'string' || !(birthDate instanceof Date)) {
                    // Try to reconstruct from userDetails
                    if (data.userDetails?.date && data.userDetails?.time) {
                        birthDate = new Date(`${data.userDetails.date}T${data.userDetails.time}`);
                        console.log('[DashaPeriods] Reconstructed birthDate from userDetails:', birthDate);
                    } else {
                        console.error('[DashaPeriods] Cannot reconstruct birthDate - missing userDetails');
                        return;
                    }
                }

                const dashaPeriods = calculateDashaPeriods(birthDate, moon.longitude);
                console.log('[DashaPeriods] Total periods calculated:', dashaPeriods.length);
                console.log('[DashaPeriods] First period:', dashaPeriods[0]);
                console.log('[DashaPeriods] Has subPeriods:', !!dashaPeriods[0]?.subPeriods);
                if (dashaPeriods[0]?.subPeriods) {
                    console.log('[DashaPeriods] First Bhukti:', dashaPeriods[0].subPeriods[0]);
                }
                setPeriods(dashaPeriods);
                const current = getCurrentDasha(dashaPeriods);
                console.log('[DashaPeriods] Current Dasha:', {
                    maha: current?.maha?.planet,
                    bhukti: current?.bhukti?.planet,
                    antaram: current?.antaram?.planet
                });
                setCurrentDasha(current);

                // Auto-expand current Maha Dasha
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

    // Filter periods based on search and filter mode
    const filteredPeriods = periods.filter(period => {
        const now = new Date();
        const periodStart = period.startDate.getTime();
        const periodEnd = period.endDate.getTime();
        const currentTime = now.getTime();

        // Search filter
        const planetName = getPlanetName(period.planet).toLowerCase();
        const matchesSearch = searchQuery === '' || planetName.includes(searchQuery.toLowerCase());

        // Time-based filter
        let matchesTimeFilter = true;
        if (filterMode === 'current') {
            matchesTimeFilter = currentTime >= periodStart && currentTime < periodEnd;
        } else if (filterMode === 'upcoming') {
            matchesTimeFilter = currentTime < periodStart;
        } else if (filterMode === 'past') {
            matchesTimeFilter = currentTime >= periodEnd;
        }

        return matchesSearch && matchesTimeFilter;
    });

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

            {/* Stats Dashboard */}
            <DashaStatsCard currentDasha={currentDasha} periods={periods} />

            {/* Search and Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-4"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={language === 'ta' ? 'கிரகத்தை தேடவும்...' : 'Search planet...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800/60 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 items-center">
                        <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
                        <div className="flex gap-2 flex-wrap">
                            {(['all', 'current', 'upcoming', 'past'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setFilterMode(mode)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterMode === mode
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {language === 'ta'
                                        ? mode === 'all' ? 'அனைத்தும்'
                                            : mode === 'current' ? 'தற்போதைய'
                                                : mode === 'upcoming' ? 'வரப்போகும்'
                                                    : 'கடந்த'
                                        : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {(searchQuery || filterMode !== 'all') && (
                    <div className="mt-3 text-sm text-slate-400">
                        {language === 'ta'
                            ? `${filteredPeriods.length} காலங்கள் கண்டறியப்பட்டன`
                            : `Found ${filteredPeriods.length} period${filteredPeriods.length !== 1 ? 's' : ''}`}
                    </div>
                )}
            </motion.div>

            {/* Current Dasha Card */}
            {currentDasha ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <Clock className="w-6 h-6 text-purple-400 animate-pulse" />
                        <h3 className="text-xl font-bold">
                            {language === 'ta' ? '🎯 உங்கள் தற்போதைய தசா காலம்' : '🎯 Your Current Dasha Period'}
                        </h3>
                    </div>

                    {/* Flow Visualization */}
                    <div className="space-y-6">
                        {/* Desktop: Horizontal Flow */}
                        <div className="hidden md:flex items-center justify-center gap-4">
                            {/* Maha Dasha */}
                            <div className="flex-1 text-center">
                                <div className="text-xs text-slate-400 mb-2">
                                    {t.dasha.maha}
                                    <br />
                                    <span className="text-[10px]">(Main Period)</span>
                                </div>
                                <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                                    <div className="text-3xl font-bold mb-1" style={{ color: PLANET_COLORS[currentDasha.maha?.planet || 'Sun'] }}>
                                        {currentDasha.maha ? getPlanetName(currentDasha.maha.planet) : '-'}
                                    </div>
                                </div>
                            </div>

                            <ArrowRight className="w-8 h-8 text-purple-400" />

                            {/* Bhukti */}
                            <div className="flex-1 text-center">
                                <div className="text-xs text-slate-400 mb-2">
                                    {t.dasha.bhukti}
                                    <br />
                                    <span className="text-[10px]">(Sub Period)</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold mb-1" style={{ color: PLANET_COLORS[currentDasha.bhukti?.planet || 'Sun'] }}>
                                        {currentDasha.bhukti ? getPlanetName(currentDasha.bhukti.planet) : '-'}
                                    </div>
                                </div>
                            </div>

                            <ArrowRight className="w-8 h-8 text-slate-600" />

                            {/* Antaram */}
                            <div className="flex-1 text-center">
                                <div className="text-xs text-slate-400 mb-2">
                                    {t.dasha.antaram}
                                    <br />
                                    <span className="text-[10px]">(Minor)</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold mb-1" style={{ color: PLANET_COLORS[currentDasha.antaram?.planet || 'Sun'] }}>
                                        {currentDasha.antaram ? getPlanetName(currentDasha.antaram.planet) : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Vertical Stack */}
                        <div className="md:hidden space-y-4">
                            <div className="text-center">
                                <div className="text-xs text-slate-400 mb-2">
                                    {t.dasha.maha} (Main Period)
                                </div>
                                <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                                    <div className="text-3xl font-bold" style={{ color: PLANET_COLORS[currentDasha.maha?.planet || 'Sun'] }}>
                                        {currentDasha.maha ? getPlanetName(currentDasha.maha.planet) : '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
                                    <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <div className="text-center">
                                <div className="text-xs text-slate-400 mb-2">
                                    {t.dasha.bhukti} (Sub Period)
                                </div>
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold" style={{ color: PLANET_COLORS[currentDasha.bhukti?.planet || 'Sun'] }}>
                                        {currentDasha.bhukti ? getPlanetName(currentDasha.bhukti.planet) : '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-600">
                                    <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <div className="text-center">
                                <div className="text-xs text-slate-400 mb-2">
                                    {t.dasha.antaram} (Minor)
                                </div>
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                    <div className="text-3xl font-bold" style={{ color: PLANET_COLORS[currentDasha.antaram?.planet || 'Sun'] }}>
                                        {currentDasha.antaram ? getPlanetName(currentDasha.antaram.planet) : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Period Info */}
                        <div className="border-t border-slate-700 pt-4 mt-6">
                            <div className="text-center space-y-2">
                                <div className="text-sm text-slate-400">
                                    {currentDasha.maha ? `${formatDate(currentDasha.maha.startDate)} - ${formatDate(currentDasha.maha.endDate)}` : ''}
                                </div>
                                {currentDasha.maha && (
                                    <div className="text-lg font-semibold text-green-400">
                                        ⏳ {(() => {
                                            const now = new Date();
                                            const end = new Date(currentDasha.maha.endDate);
                                            const diff = end.getTime() - now.getTime();
                                            const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
                                            const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
                                            return years > 0 ? `${years} years ${months} months remaining` : `${months} months remaining`;
                                        })()}
                                    </div>
                                )}
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

                </motion.div>
            )}

            {/* Timeline Accordion */}
            <div className="space-y-4">
                {filteredPeriods.length === 0 ? (
                    <div className="glass-panel p-8 text-center text-slate-400">
                        <p>{language === 'ta' ? 'முடிவுகள் இல்லை' : 'No periods found'}</p>
                        <p className="text-sm mt-2">{language === 'ta' ? 'தேடலை மாற்றவும் அல்லது வடிப்பானை அகற்றவும்' : 'Try changing your search or filter'}</p>
                    </div>
                ) : (
                    filteredPeriods.map((maha, idx) => {
                        const isCurrentMaha = currentDasha?.maha?.planet === maha.planet && currentDasha?.maha?.startDate.getTime() === maha.startDate.getTime();

                        return (
                            <div key={idx} className={`glass-panel overflow-hidden transition-all duration-300 ${isCurrentMaha ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : ''}`}>
                                <button
                                    onClick={() => setExpandedMaha(expandedMaha === idx ? null : idx)}
                                    className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${isCurrentMaha ? 'bg-purple-900/20' : 'bg-slate-900/50 hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] flex-shrink-0"
                                            style={{ backgroundColor: PLANET_COLORS[maha.planet], color: PLANET_COLORS[maha.planet] }}
                                        />
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="font-bold text-lg flex items-center gap-2 mb-2">
                                                {getPlanetName(maha.planet)} {t.dasha.maha}
                                                <PlanetInfoTooltip planetName={maha.planet} />
                                                {isCurrentMaha && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full animate-pulse">{t.dasha.current}</span>}
                                            </div>
                                            <div className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(maha.startDate)} - {formatDate(maha.endDate)}
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="max-w-md">
                                                <DashaProgressBar
                                                    startDate={maha.startDate}
                                                    endDate={maha.endDate}
                                                    showPercentage={isCurrentMaha}
                                                    showMarker={isCurrentMaha}
                                                />
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
                                            <div className="p-4 pl-8 space-y-3">
                                                {maha.subPeriods?.map((bhukti, bIdx) => {
                                                    const isCurrentBhukti = isCurrentMaha && currentDasha?.bhukti?.planet === bhukti.planet && currentDasha?.bhukti?.startDate.getTime() === bhukti.startDate.getTime();
                                                    const isLastBhukti = bIdx === (maha.subPeriods?.length || 0) - 1;

                                                    // Calculate time remaining or time until
                                                    const now = new Date();
                                                    const start = bhukti.startDate.getTime();
                                                    const end = bhukti.endDate.getTime();
                                                    const currentTime = now.getTime();

                                                    let timeInfo = '';
                                                    if (currentTime >= start && currentTime < end) {
                                                        // Current period
                                                        const diff = end - currentTime;
                                                        const months = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
                                                        timeInfo = `⏳ ${months}mo remaining`;
                                                    } else if (currentTime < start) {
                                                        // Future period
                                                        const diff = start - currentTime;
                                                        const months = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
                                                        timeInfo = `Starts in ${months}mo`;
                                                    }

                                                    return (
                                                        <div key={bIdx} className="relative">
                                                            {/* Tree connector */}
                                                            <div className="absolute left-0 top-0 bottom-0 w-8 flex items-start justify-center pt-6">
                                                                <div className={`border-l-2 ${isLastBhukti ? 'h-6' : 'h-full'} border-slate-700`}>
                                                                    <div className="absolute top-6 left-0 w-6 border-t-2 border-slate-700"></div>
                                                                </div>
                                                            </div>

                                                            <div className={`ml-6 rounded-lg overflow-hidden border transition-all ${isCurrentBhukti ? 'bg-purple-900/10 border-purple-500/50' : 'bg-slate-950/50 border-slate-800/50'}`}>
                                                                <button
                                                                    onClick={() => setExpandedBhukti(expandedBhukti === `${idx}-${bIdx}` ? null : `${idx}-${bIdx}`)}
                                                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <div
                                                                            className="w-2 h-2 rounded-full"
                                                                            style={{ backgroundColor: PLANET_COLORS[bhukti.planet] }}
                                                                        />
                                                                        <div className="flex-1 text-left">
                                                                            <div className="font-medium text-sm flex items-center gap-2">
                                                                                {getPlanetName(bhukti.planet)} {t.dasha.bhukti}
                                                                                {isCurrentBhukti && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 mt-1">
                                                                                {formatDate(bhukti.startDate)} - {formatDate(bhukti.endDate)}
                                                                            </div>
                                                                            {timeInfo && (
                                                                                <div className={`text-xs mt-1 ${isCurrentBhukti ? 'text-green-400' : 'text-slate-400'}`}>
                                                                                    {timeInfo}
                                                                                </div>
                                                                            )}
                                                                        </div>
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
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }))
                }
            </div>
        </div>
    );
};

export default DashaPeriods;
