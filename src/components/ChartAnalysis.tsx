import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, AlertTriangle, Crown, Activity, Eye, ArrowRight, Share2 } from 'lucide-react';
import { NAKSHATRAS, ZODIAC_SIGNS, TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../utils/constants';
import {
    getNakshatra,
    calculateDignity,
    checkNeechaBhanga,
    checkParivartana,
    calculateAspects,
    calculateStrength,
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits,
    calculateYogas
} from '../utils/astrology';
import { calculateSubathuvamPavathuvam, calculateHouseSubathuvamPavathuvam } from '../utils/subathuvam';
import { calculateAdityaGurujiSubathuvam, calculateDigbalaAndYogas, getFunctionalNature, generateSpecialPredictions, calculateRahuKetuStrength } from '../utils/adityaGurujiSubathuvam';
// predictionRules imports removed as they are used in RuleBasedPredictions.tsx
import { useLanguage } from '../contexts/LanguageContext';
import { TAMIL_PLANET_NAMES, TAMIL_NAKSHATRAS } from '../utils/translations';
import GurujiPersonaModal from './GurujiPersonaModal';


interface ChartAnalysisProps {
    data: any;
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({ data }) => {
    const { t, language } = useLanguage();

    // Lazy load the PDF generator to avoid blocking initial render? 
    // For now simple import is fine.



    // If no data prop, try to load from URL or Context
    const [hydratedData, setHydratedData] = useState<any>(null);
    const [loading, setLoading] = useState(!data);

    React.useEffect(() => {
        if (!data) {
            const params = new URLSearchParams(window.location.search);
            import('../utils/urlUtils').then(({ deserializeChartDetails }) => {
                const details = deserializeChartDetails(params);
                if (details) {
                    import('../utils/astrology').then(({ calculatePlanetaryPositions }) => {
                        try {
                            const date = new Date(`${details.date}T${details.time}`);
                            const chart = calculatePlanetaryPositions(date, details.lat, details.lng);
                            setHydratedData({ ...chart, userDetails: details }); // mimic structure
                            setLoading(false);
                        } catch (e) { console.error(e); setLoading(false); }
                    });
                } else {
                    setLoading(false);
                }
            });
        }
    }, [data]);

    const activeChart = data || hydratedData;

    // Sync URL with state
    React.useEffect(() => {
        if (activeChart && activeChart.userDetails) {
            const params = new URLSearchParams(window.location.search);
            if (!params.has('n')) {
                import('../utils/urlUtils').then(({ generateSingleChartShareLink }) => {
                    const link = generateSingleChartShareLink('/analysis', activeChart.userDetails);
                    const query = link.split('?')[1];
                    if (query) {
                        const newUrl = `${window.location.pathname}?${query}`;
                        window.history.replaceState({ ...window.history.state }, '', newUrl);
                    }
                });
            }
        }
    }, [activeChart]);

    if (loading) return <div className="p-12 text-center text-slate-400">Loading Chart...</div>;
    if (!activeChart) return null;

    const { planets, ascendant } = activeChart;
    const userDetails = activeChart.userDetails || {}; // Fallback for name

    const handleShare = async () => {
        try {
            const { generateSingleChartShareLink } = await import('../utils/urlUtils');
            // Assuming we have access to user details from somewhere, but data might be clean chart data.
            // If data came from context, we might rely on props passed down or context state. 
            // For now, if hydrated, we have details. If from props? 
            // Ideally ChartAnalysis receives 'userDetails' in data prop too.
            if (activeChart.userDetails) {
                const link = generateSingleChartShareLink('/analysis', activeChart.userDetails);
                await navigator.clipboard.writeText(link);
                alert(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
            } else {
                alert("Cannot share this chart (missing details)");
            }
        } catch (e) {
            console.error("Share failed", e);
        }
    };

    // Header with Share Button (Only if details exist)
    const ShareButton = () => (
        <button
            onClick={handleShare}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30 w-fit"
        >
            <Share2 className="w-5 h-5" />
            {language === 'ta' ? 'பகிர்' : 'Share Chart'}
        </button>
    );
    const [expandedSection, setExpandedSection] = useState<string | null>('planets');
    const [isGurujiModalOpen, setIsGurujiModalOpen] = useState(false);

    // Use shared logic for Yogas
    // 'calculateYogas' is imported at top level.

    const { yogas, doshas } = calculateYogas(planets, ascendant, language as 'en' | 'ta');

    // Calculate all scores once before rendering to ensure fresh data
    const planetScores = React.useMemo(() => calculateSubathuvamPavathuvam(planets, language), [planets, language]);
    const houseScores = React.useMemo(() => calculateHouseSubathuvamPavathuvam(planets, ascendant.signIndex, language), [planets, ascendant.signIndex, language]);
    const agScores = React.useMemo(() => calculateAdityaGurujiSubathuvam(planets), [planets]);
    const yogaResults = React.useMemo(() => calculateDigbalaAndYogas(planets, ascendant.signIndex, agScores), [planets, ascendant.signIndex, agScores]);
    const functionalNature = React.useMemo(() => getFunctionalNature(ascendant.signIndex, language), [ascendant.signIndex, language]);
    const rkResults = React.useMemo(() => calculateRahuKetuStrength(planets, ascendant.signIndex), [planets, ascendant.signIndex]);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const getDignityColor = (dignity: string) => {
        switch (dignity) {
            case 'exalted': return 'text-yellow-400 font-bold';
            case 'ownSign': return 'text-green-400 font-semibold';
            case 'friend': return 'text-blue-300';
            case 'debilitated': return 'text-red-400';
            case 'enemy': return 'text-orange-300';
            default: return 'text-slate-400';
        }
    };

    const getDignityLabel = (dignity: string) => {
        return t.dignity[dignity as keyof typeof t.dignity] || dignity;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                    {language === 'ta' ? 'ஜாதக ஆய்வு' : 'Chart Analysis'}
                </h2>
                {activeChart.userDetails && <ShareButton />}
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <p className="text-slate-400 mb-4">{t.analysis.subtitle}</p>

            </motion.div>

            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setIsGurujiModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl shadow-lg shadow-purple-900/40 transition-all font-bold border border-white/10 animate-shimmer"
                >
                    <Activity className="w-5 h-5" />
                    {language === 'ta' ? 'நான் யார்? (குருஜி ஆய்வு)' : 'Who Am I? (Guruji Analysis)'}
                </button>
            </div>

            <GurujiPersonaModal
                isOpen={isGurujiModalOpen}
                onClose={() => setIsGurujiModalOpen(false)}
                chartData={data}
                birthDetails={data.birthDetails}
            />

            {/* Planetary Positions Table */}
            <div className="glass-panel overflow-hidden">
                <button
                    onClick={() => toggleSection('planets')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold">{t.analysis.planets}</h3>
                    </div>
                    {expandedSection === 'planets' ? <ChevronUp /> : <ChevronDown />}
                </button>

                <AnimatePresence>
                    {expandedSection === 'planets' && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                            <th className="p-4">{t.analysis.table.planet}</th>
                                            <th className="p-4">{t.analysis.table.sign}</th>
                                            <th className="p-4">{t.analysis.table.degree}</th>
                                            <th className="p-4">{t.analysis.table.nakshatra}</th>
                                            <th className="p-4">Dignity</th>
                                            <th className="p-4">Aspects</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        <tr className="bg-purple-900/10">
                                            <td className="p-4 font-medium text-purple-300">{t.chart.lagna}</td>
                                            <td className="p-4">{TAMIL_RASI_NAMES[ascendant.signIndex]} ({ZODIAC_SIGNS[ascendant.signIndex]})</td>
                                            <td className="p-4">{Math.floor(ascendant.degree)}° {Math.round((ascendant.degree % 1) * 60)}'</td>
                                            <td className="p-4">{language === 'ta' ? TAMIL_NAKSHATRAS[getNakshatra(ascendant.longitude).index] : NAKSHATRAS[getNakshatra(ascendant.longitude).index]}</td>
                                            <td className="p-4">-</td>
                                            <td className="p-4">-</td>
                                        </tr>
                                        {planets.map((planet: any) => {
                                            const nak = getNakshatra(planet.longitude);
                                            const dignity = calculateDignity(planet.name, planet.signIndex, planet.degree, planets);
                                            const aspects = calculateAspects(planet, planets);

                                            return (
                                                <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4 font-medium">
                                                        {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                        {planet.isRetro && (
                                                            <span className="ml-1 text-xs text-red-400 font-bold" title="Vakram (Retrograde)">
                                                                {language === 'ta' ? '(வ)' : '(Rx)'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">{TAMIL_RASI_NAMES[planet.signIndex]} ({ZODIAC_SIGNS[planet.signIndex]})</td>
                                                    <td className="p-4">{Math.floor(planet.degree)}° {Math.round((planet.degree % 1) * 60)}'</td>
                                                    <td className="p-4">{language === 'ta' ? TAMIL_NAKSHATRAS[nak.index] : NAKSHATRAS[nak.index]}</td>
                                                    <td className={`p-4 ${getDignityColor(dignity)}`}>
                                                        {getDignityLabel(dignity)}
                                                    </td>
                                                    <td className="p-4 text-xs">
                                                        {aspects.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {aspects.map((asp, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`px-1.5 py-0.5 rounded text-slate-900 font-medium ${asp.strength === 100 ? 'bg-green-400' : 'bg-yellow-400'
                                                                            }`}
                                                                        title={`${asp.strength}% Strength`}
                                                                    >
                                                                        {TAMIL_RASI_NAMES[asp.signIndex]} ({asp.type})
                                                                        {asp.planets.length > 0 && (
                                                                            <span className="ml-1 opacity-75">
                                                                                [{asp.planets.map(p => language === 'ta' ? TAMIL_PLANET_NAMES[p] : p).join(', ')}]
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Retrograde Analysis Section */}
            <div className="glass-panel overflow-hidden">
                <button
                    onClick={() => toggleSection('retrograde')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold">{language === 'ta' ? 'வக்ர கிரகங்கள் (Retrograde)' : 'Retrograde Analysis'}</h3>
                    </div>
                    {expandedSection === 'retrograde' ? <ChevronUp /> : <ChevronDown />}
                </button>

                <AnimatePresence>
                    {expandedSection === 'retrograde' && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="p-6 text-slate-300"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Current Status */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">{language === 'ta' ? 'தற்போதைய நிலை' : 'Current Status'}</h4>
                                    <div className="space-y-3">
                                        {planets.map((planet: any) => {
                                            if (['Sun', 'Moon', 'Rahu', 'Ketu'].includes(planet.name)) return null;
                                            return (
                                                <div key={planet.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{PLANET_SYMBOLS[planet.name as keyof typeof PLANET_SYMBOLS]}</span>
                                                        <span className="font-medium">{language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${planet.isRetro ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                        {planet.isRetro
                                                            ? (language === 'ta' ? 'வக்ரம்' : 'Retrograde')
                                                            : (language === 'ta' ? 'நேர்கதி' : 'Direct')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase mb-4">
                                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                        {language === 'ta' ? 'வக்ர கால அளவு' : 'Retrograde Cycles'}
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-start border-b border-slate-700/50 pb-2">
                                            <span>{language === 'ta' ? 'புதன் (☿)' : 'Mercury (☿)'}</span>
                                            <span className="text-right text-slate-400">{language === 'ta' ? 'வருடத்திற்கு 3-4 முறை (3 வாரங்கள்)' : '3-4 times a year (3 weeks)'}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-slate-700/50 pb-2">
                                            <span>{language === 'ta' ? 'சுக்கிரன் (♀)' : 'Venus (♀)'}</span>
                                            <span className="text-right text-slate-400">{language === 'ta' ? '18 மாதங்களுக்கு ஒருமுறை (40 நாட்கள்)' : 'Every 18 months (40 days)'}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-slate-700/50 pb-2">
                                            <span>{language === 'ta' ? 'செவ்வாய் (♂)' : 'Mars (♂)'}</span>
                                            <span className="text-right text-slate-400">{language === 'ta' ? '2 வருடங்களுக்கு ஒருமுறை (2-3 மாதங்கள்)' : 'Every 2 years (2-3 months)'}</span>
                                        </div>
                                        <div className="flex justify-between items-start border-b border-slate-700/50 pb-2">
                                            <span>{language === 'ta' ? 'குரு (♃)' : 'Jupiter (♃)'}</span>
                                            <span className="text-right text-slate-400">{language === 'ta' ? 'ஒவ்வொரு வருடமும் (4 மாதங்கள்)' : 'Every year (4 months)'}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span>{language === 'ta' ? 'சனி (♄)' : 'Saturn (♄)'}</span>
                                            <span className="text-right text-slate-400">{language === 'ta' ? 'ஒவ்வொரு வருடமும் (4.5 மாதங்கள்)' : 'Every year (4.5 months)'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Yogas & Doshas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yogas */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold">{t.analysis.yogas}</h3>
                    </div>
                    {yogas.length > 0 ? (
                        <ul className="space-y-3">
                            {yogas.map((yoga, idx) => (
                                <li key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <div className="font-medium text-yellow-200">{yoga.name}</div>
                                    <div className="text-sm text-slate-400">{yoga.description}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic">{t.analysis.noYogas}</p>
                    )}
                </div>

                {/* Doshas */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold">{t.analysis.doshas}</h3>
                    </div>
                    {doshas.length > 0 ? (
                        <ul className="space-y-3">
                            {doshas.map((dosha, idx) => (
                                <li key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-red-900/30">
                                    <div className="font-medium text-red-300">{dosha.name}</div>
                                    <div className="text-sm text-slate-400">{dosha.description}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic">{t.analysis.noDoshas}</p>
                    )}
                </div>
            </div>



            {/* Subathuvam & Pavathuvam Analysis */}
            <div className="glass-panel p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">{t.subathuvam.title}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                <th className="p-4">{t.analysis.table.planet}</th>
                                <th className="p-4 text-green-400">{t.subathuvam.subathuvam}</th>
                                <th className="p-4 text-red-400">{t.subathuvam.pavathuvam}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {planets.map((planet: any) => {
                                const pScores = planetScores[planet.name];
                                if (!pScores) return null;

                                return (
                                    <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium">
                                            {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${Math.min(pScores.subathuvam.score, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-green-400">{pScores.subathuvam.score}</span>
                                                </div>
                                                {pScores.subathuvam.details.length > 0 && (
                                                    <div className="text-xs text-slate-400">
                                                        {pScores.subathuvam.details.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-red-500"
                                                            style={{ width: `${Math.min(pScores.pavathuvam.score, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-red-400">{pScores.pavathuvam.score}</span>
                                                </div>
                                                {pScores.pavathuvam.details.length > 0 && (
                                                    <div className="text-xs text-slate-400">
                                                        {pScores.pavathuvam.details.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">{t.subathuvam.houseTitle}</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">{t.subathuvam.house}</th>
                                    <th className="p-4">{language === 'ta' ? 'இறுதி மதிப்பெண்' : 'Final Score'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
                                    const hScores = houseScores[houseNum];
                                    if (!hScores) return null;

                                    // Determine final score and color
                                    const hasSubathuvam = hScores.subathuvam.score > 0;
                                    const hasPavathuvam = hScores.pavathuvam.score > 0;

                                    const finalScore = hasSubathuvam ? hScores.subathuvam.score : hScores.pavathuvam.score;
                                    const scoreColor = hasSubathuvam ? 'text-green-400' : 'text-red-400';
                                    const barColor = hasSubathuvam ? 'bg-green-500' : 'bg-red-500';
                                    const label = hasSubathuvam
                                        ? (language === 'ta' ? 'சுபத்துவம்' : 'Subathuvam')
                                        : (language === 'ta' ? 'பாவத்துவம்' : 'Pavathuvam');
                                    const details = hasSubathuvam ? hScores.subathuvam.details : hScores.pavathuvam.details;

                                    return (
                                        <tr key={houseNum} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? `வீடு ${houseNum}` : `House ${houseNum}`}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${barColor}`}
                                                                style={{ width: `${Math.min(finalScore, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`font-bold ${scoreColor}`}>{finalScore}</span>
                                                        {finalScore > 0 && (
                                                            <span className={`text-xs ${scoreColor}`}>({label})</span>
                                                        )}
                                                    </div>
                                                    {details.length > 0 && (
                                                        <div className="text-xs text-slate-400">
                                                            {details.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aditya Guruji Subathuvam Analysis */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">Aditya Guruji Subathuvam Method</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Planet</th>
                                    <th className="p-4 text-center">Rasi Score</th>
                                    <th className="p-4 text-center">Navamsa Score</th>
                                    <th className="p-4 text-center">Total Score</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">{language === 'ta' ? 'சூட்சும வலு' : 'Sookshma Valu'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {planets.map((planet: any) => {
                                    const pScore = agScores[planet.name];
                                    if (!pScore) return null;

                                    return (
                                        <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                {pScore.details.length > 0 && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {pScore.details.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-slate-300">{pScore.rasiScore}</td>
                                            <td className="p-4 text-center text-slate-300">{pScore.navamsaScore}</td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold ${pScore.totalScore >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {pScore.totalScore}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {pScore.isSubathuva ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50">
                                                        Subathuva Planet
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                                        Normal
                                                    </span>
                                                )}
                                                {pScore.isNeutral && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50 ml-2">
                                                        Neutral
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {pScore.hasSookshmaValu ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-2xl" title="Sookshma Valu">🌟</span>
                                                        {pScore.sookshmaValuReason && (
                                                            <div className="text-xs text-amber-400 text-center max-w-xs">
                                                                {pScore.sookshmaValuReason}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-slate-400 italic text-center mt-1">
                                                            {planet.name === 'Saturn' && language === 'ta'
                                                                ? 'வலி இல்லாமல் வழி தரும்'
                                                                : planet.name === 'Saturn'
                                                                    ? 'Success without torture'
                                                                    : planet.name === 'Mars' && language === 'ta'
                                                                        ? 'விவேகமான வீரம்'
                                                                        : 'Wise courage'
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Final Prediction Outcome (Digbala + Subathuvam + Adhipathiyam) */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">Final Prediction Outcome (Digbala + Subathuvam + Adhipathiyam)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Planet</th>
                                    <th className="p-4 text-center">Digbala</th>
                                    <th className="p-4">Prediction Outcome</th>
                                    <th className="p-4">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {planets.map((planet: any) => {
                                    if (['Rahu', 'Ketu'].includes(planet.name)) return null;

                                    const result = yogaResults[planet.name];

                                    if (!result) return null;

                                    let statusColor = 'text-slate-400';
                                    if (result.yogaStatus === 'Rajayogam' || result.yogaStatus === 'Jackpot' || result.yogaStatus === 'Good') {
                                        statusColor = 'text-green-400';
                                    } else if (result.yogaStatus === 'Dangerously Strong' || result.yogaStatus === 'Severe Trouble') {
                                        statusColor = 'text-red-400';
                                    }

                                    return (
                                        <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                            </td>
                                            <td className="p-4 text-center">
                                                {result.digbalaStatus !== 'None' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700/30">
                                                        {result.digbalaStatus} ({result.digbalaScore})
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className={`p-4 font-bold ${statusColor}`}>
                                                {result.yogaStatus}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {result.description}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comprehensive Analysis (Functional Status & Special Predictions) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Functional Status Table */}
                    <div>
                        <h4 className="text-md font-semibold text-slate-300 mb-4">Functional Status (Lagna Based)</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="p-4">Planet</th>
                                        <th className="p-4">Nature</th>
                                        <th className="p-4">Roles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {planets.map((planet: any) => {
                                        const status = functionalNature[planet.name];
                                        if (!status) return null;

                                        let natureColor = 'text-slate-400';
                                        if (status.nature === 'Yogakaraka' || status.nature === 'Benefic') natureColor = 'text-green-400';
                                        else if (status.nature === 'Malefic' || status.nature === 'Maraka') natureColor = 'text-red-400';

                                        return (
                                            <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-medium">
                                                    {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                </td>
                                                <td className={`p-4 font-bold ${natureColor}`}>
                                                    {status.nature}
                                                </td>
                                                <td className="p-4 text-xs text-slate-500">
                                                    {status.roles.join(', ')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Special Predictions */}
                    <div>
                        <h4 className="text-md font-semibold text-slate-300 mb-4">{language === 'ta' ? 'சிறப்பு கணிப்புகள் (சுபத்துவம் வடிகட்டப்பட்டது)' : 'Special Predictions (Subathuvam Filtered)'}</h4>
                        <div className="space-y-4">
                            {(() => {
                                const predictions = generateSpecialPredictions(planets, data.ascendant.signIndex, agScores);

                                if (predictions.length === 0) {
                                    return <div className="text-slate-500 italic p-4">{language === 'ta' ? 'இந்த ஜாதகத்தில் சிறப்பு நிலைகள் இல்லை' : 'No special placements detected for this chart.'}</div>;
                                }

                                return predictions.map((pred, idx) => {
                                    // Tamil translation helpers
                                    const translatePlanet = (planet: string) => {
                                        if (language !== 'ta') return planet;
                                        const names: Record<string, string> = {
                                            'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்',
                                            'Mercury': 'புதன்', 'Jupiter': 'குரு', 'Venus': 'சுக்ரன்',
                                            'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
                                        };
                                        return names[planet] || planet;
                                    };

                                    const translateType = (type: string) => {
                                        if (language !== 'ta') return type;
                                        const types: Record<string, string> = {
                                            'Digbala (10th)': 'திக்பல (10வது)',
                                            'Progeny (Child Birth)': 'சந்ததி (குழந்தை பிறப்பு)',
                                            '8th House Subathuva': '8வது வீடு சுபத்துவம்',
                                            '8th House Affliction': '8வது வீடு துன்பம்',
                                            'Foreign Settlement': 'வெளிநாட்டு குடியேற்றம்',
                                            '6th House Subathuva': '6வது வீடு சுபத்துவம்',
                                            'Profession (Medical/Tech)': 'தொழில் (மருத்துவம்/தொழில்நுட்பம்)',
                                            'Lagna Lord in Dusthana': 'லக்னாதிபதி துஸ்தான ங்களில்',
                                            'Afflicted Full Moon': 'பாதிக்கப்பட்ட பௌர்ணமி',
                                            'Breakup/Conflict Indicator': 'பிரிவு/மோதல் குறிகாட்டி',
                                            'Retrograde Benefic (Vakram)': 'வக்கிர சுப கிரகம்'
                                        };
                                        return types[type] || type;
                                    };

                                    return (
                                        <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-purple-400">{translatePlanet(pred.planet)}</span>
                                                <span className="text-xs text-slate-500 uppercase tracking-wider">{translateType(pred.type)}</span>
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                {pred.prediction}
                                            </p>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                {/* Shadow Planet Analysis (Rahu-Ketu) */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">Shadow Planet Analysis (Rahu-Ketu)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Planet</th>
                                    <th className="p-4 text-center">House Score</th>
                                    <th className="p-4 text-center">Subathuvam</th>
                                    <th className="p-4 text-center">Soodshuma</th>
                                    <th className="p-4 text-center">Total</th>
                                    <th className="p-4">Prediction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {['Rahu', 'Ketu'].map((planetName) => {
                                    const result = rkResults[planetName];
                                    if (!result) return null;

                                    let totalColor = 'text-slate-300';
                                    if (result.totalScore >= 70) totalColor = 'text-green-400';
                                    else if (result.totalScore >= 40) totalColor = 'text-yellow-400';
                                    else totalColor = 'text-red-400';

                                    return (
                                        <tr key={planetName} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planetName] : planetName}
                                                {result.details.length > 0 && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {result.details.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-slate-300">{result.houseScore}</td>
                                            <td className="p-4 text-center text-slate-300">{result.subathuvamScore}</td>
                                            <td className="p-4 text-center text-slate-300">{result.soodshumaScore}</td>
                                            <td className={`p-4 text-center font-bold ${totalColor}`}>
                                                {result.totalScore}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {result.prediction}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Guruji's Predictions (FAQ) - Moved to separate page */}
            </div>
        </div >
    );
};

export default ChartAnalysis;
