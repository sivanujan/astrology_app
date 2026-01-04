import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const PlanetaryPositionsTable = React.lazy(() => import('./analysis/PlanetaryPositionsTable'));
const RetrogradeAnalysis = React.lazy(() => import('./analysis/RetrogradeAnalysis'));
const YogaDoshaAnalysis = React.lazy(() => import('./analysis/YogaDoshaAnalysis'));
const SubathuvamAnalysis = React.lazy(() => import('./analysis/SubathuvamAnalysis'));
const HouseStrengthAnalysis = React.lazy(() => import('./analysis/HouseStrengthAnalysis'));
const AdityaGurujiAnalysis = React.lazy(() => import('./analysis/AdityaGurujiAnalysis'));
const FinalPredictionCards = React.lazy(() => import('./analysis/FinalPredictionCards'));
const FunctionalStatusAnalysis = React.lazy(() => import('./analysis/FunctionalStatusAnalysis'));
const SpecialPredictionsAnalysis = React.lazy(() => import('./analysis/SpecialPredictionsAnalysis'));
const ShadowPlanetAnalysis = React.lazy(() => import('./analysis/ShadowPlanetAnalysis'));
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





            {/* Planetary Positions Table - Refactored Component */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl" />}>
                <PlanetaryPositionsTable planets={planets} ascendant={ascendant} />
            </React.Suspense>

            {/* Retrograde Analysis Section */}
            {/* Retrograde Analysis Section */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl mt-6" />}>
                <RetrogradeAnalysis planets={planets} />
            </React.Suspense>

            {/* Yogas & Doshas */}
            {/* Yogas & Doshas - Refactored Component */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl mt-6" />}>
                <YogaDoshaAnalysis yogas={yogas} doshas={doshas} />
            </React.Suspense>



            {/* Subathuvam & Pavathuvam Analysis - Refactored Components */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl mt-6" />}>
                <SubathuvamAnalysis planets={planets} planetScores={planetScores} />
                <HouseStrengthAnalysis houseScores={houseScores} />
            </React.Suspense>


            {/* Aditya Guruji Subathuvam Analysis */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl mt-6" />}>
                <AdityaGurujiAnalysis planets={planets} agScores={agScores} />
            </React.Suspense>

            {/* Final Prediction Outcome */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl mt-6" />}>
                <FinalPredictionCards planets={planets} yogaResults={yogaResults} />
            </React.Suspense>

            {/* Comprehensive Analysis (Functional Status & Special Predictions) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-full rounded-xl" />}>
                    <FunctionalStatusAnalysis planets={planets} functionalNature={functionalNature} />
                </React.Suspense>
                <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-full rounded-xl" />}>
                    <SpecialPredictionsAnalysis predictions={generateSpecialPredictions(planets, ascendant.signIndex, agScores)} />
                </React.Suspense>
            </div>

            {/* Shadow Planet Analysis (Rahu-Ketu) */}
            <React.Suspense fallback={<div className="glass-panel p-6 animate-pulse bg-slate-800/50 h-32 rounded-xl mt-6" />}>
                <ShadowPlanetAnalysis rkResults={rkResults} />
            </React.Suspense>

            {/* Guruji's Predictions (FAQ) - Moved to separate page */}
        </div>
    );
};

export default ChartAnalysis;
