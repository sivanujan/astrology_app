import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Sparkles, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeDasaPlanet } from '../utils/dasaAnalysis';
import {
    generateComprehensivePredictions,
    generateKeyEvents,
    generateWarnings,
    generateDosAndDonts,
    getLuckyFactors
} from '../utils/dasaPredictions';
import DasaPeriodCard from './DasaPeriodCard';
import DasaScoreBreakdown from './DasaScoreBreakdown';
import DasaPredictionsComponent from './DasaPredictions';
import DasaPeriodSelector from './DasaPeriodSelector';

interface DasaAnalysisProps {
    chart: any;
    currentDasa: any;
    agScores?: any;
}

const DasaAnalysis: React.FC<DasaAnalysisProps> = ({ chart, currentDasa, agScores }) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';
    const [selectedPeriod, setSelectedPeriod] = useState<'maha' | 'antar' | 'pratyantar'>('maha');
    const [showPredictions, setShowPredictions] = useState(false);

    // State for selecting different periods
    const [selectedMahaPlanet, setSelectedMahaPlanet] = useState<string>(currentDasa.maha?.planet || '');
    const [selectedBhuktiPlanet, setSelectedBhuktiPlanet] = useState<string>(currentDasa.bhukti?.planet || '');
    const [selectedAntaramPlanet, setSelectedAntaramPlanet] = useState<string>(currentDasa.antaram?.planet || '');

    // Calculate Dasa analysis
    const dasaAnalysis = useMemo(() => {
        try {
            console.log('[DasaAnalysis] Starting analysis...', {
                hasCurrentDasa: !!currentDasa,
                hasPlanets: !!chart.planets,
                hasAscendant: !!chart.ascendant,
                planetsCount: chart.planets?.length,
                currentDasa
            });

            if (!currentDasa || !chart.planets || !chart.ascendant) {
                console.log('[DasaAnalysis] Missing required data');
                return null;
            }

            const lagnaIndex = chart.ascendant.signIndex || 0;

            // Helper function to ensure planet has house property
            const ensurePlanetHouse = (planet: any) => {
                if (planet.house) return planet;

                // Calculate house from signIndex if missing
                if (planet.signIndex !== undefined) {
                    const house = ((planet.signIndex - lagnaIndex + 12) % 12) + 1;
                    return { ...planet, house };
                }

                return planet;
            };

            // Get planet data for selected periods (not just current Dasa)
            const mahaPlanet = chart.planets.find((p: any) => p.name === selectedMahaPlanet);
            const antarPlanet = chart.planets.find((p: any) => p.name === selectedBhuktiPlanet);
            const pratyantarPlanet = chart.planets.find((p: any) => p.name === selectedAntaramPlanet);

            console.log('[DasaAnalysis] Found planets:', {
                mahaPlanet: mahaPlanet?.name,
                mahaPlanetHouse: mahaPlanet?.house,
                mahaPlanetSignIndex: mahaPlanet?.signIndex,
                antarPlanet: antarPlanet?.name,
                pratyantarPlanet: pratyantarPlanet?.name
            });

            if (!mahaPlanet) {
                console.log('[DasaAnalysis] Maha planet not found');
                return null;
            }

            // Ensure planet has required properties
            const mahaPlanetWithHouse = ensurePlanetHouse(mahaPlanet);

            if (!mahaPlanetWithHouse.house || mahaPlanetWithHouse.signIndex === undefined) {
                console.error('[DasaAnalysis] Missing planet properties:', mahaPlanetWithHouse);
                return null;
            }

            console.log('[DasaAnalysis] Using maha planet:', mahaPlanetWithHouse);

            // Ensure all planets have house property for aspects calculation
            const planetsWithHouses = chart.planets.map((p: any) => ensurePlanetHouse(p));

            // Analyze each period
            const mahaAnalysis = analyzeDasaPlanet(
                mahaPlanetWithHouse.name,
                mahaPlanetWithHouse,
                lagnaIndex,
                planetsWithHouses,
                language
            );

            console.log('[DasaAnalysis] Maha analysis:', mahaAnalysis);

            const antarAnalysis = antarPlanet ? analyzeDasaPlanet(
                antarPlanet.name,
                ensurePlanetHouse(antarPlanet),
                lagnaIndex,
                planetsWithHouses,
                language
            ) : null;

            const pratyantarAnalysis = pratyantarPlanet ? analyzeDasaPlanet(
                pratyantarPlanet.name,
                ensurePlanetHouse(pratyantarPlanet),
                lagnaIndex,
                planetsWithHouses,
                language
            ) : null;

            // Calculate combined score (weighted average)
            const combinedScore = Math.round(
                mahaAnalysis.totalScore * 0.6 +
                (antarAnalysis?.totalScore || 0) * 0.3 +
                (pratyantarAnalysis?.totalScore || 0) * 0.1
            );

            const result = {
                maha: mahaAnalysis,
                antar: antarAnalysis,
                pratyantar: pratyantarAnalysis,
                combined: combinedScore
            };

            console.log('[DasaAnalysis] Analysis complete:', result);
            return result;
        } catch (error) {
            console.error('[DasaAnalysis] Error in analysis:', error);
            return null;
        }
    }, [selectedMahaPlanet, selectedBhuktiPlanet, selectedAntaramPlanet, chart, language]);

    // Get user age (approximate from birth date)
    const userAge = useMemo(() => {
        if (!chart.birthDate) return 30;
        const birthYear = new Date(chart.birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        return currentYear - birthYear;
    }, [chart.birthDate]);

    // Get selected period analysis
    const selectedAnalysis = useMemo(() => {
        if (!dasaAnalysis) return null;

        switch (selectedPeriod) {
            case 'antar':
                return dasaAnalysis.antar;
            case 'pratyantar':
                return dasaAnalysis.pratyantar;
            default:
                return dasaAnalysis.maha;
        }
    }, [dasaAnalysis, selectedPeriod]);

    // Get selected planet name based on current period tab
    const selectedPlanetName = useMemo(() => {
        switch (selectedPeriod) {
            case 'antar':
                return selectedBhuktiPlanet;
            case 'pratyantar':
                return selectedAntaramPlanet;
            default:
                return selectedMahaPlanet;
        }
    }, [selectedPeriod, selectedMahaPlanet, selectedBhuktiPlanet, selectedAntaramPlanet]);

    if (!dasaAnalysis || !selectedAnalysis || !selectedPlanetName) {
        return (
            <div className="text-center p-8 glass-panel rounded-lg">
                <p className="text-slate-400">
                    {isTamil ? 'தசை பகுப்பாய்வு கிடைக்கவில்லை' : 'Dasa analysis not available'}
                </p>
            </div>
        );
    }

    // Generate predictions for selected period
    const predictions = generateComprehensivePredictions(
        selectedPlanetName,
        selectedAnalysis,
        selectedAnalysis.breakdown.lordship.houses,
        userAge,
        language
    );

    const keyEvents = generateKeyEvents(
        selectedPlanetName,
        selectedAnalysis.totalScore,
        selectedAnalysis.breakdown.lordship.houses,
        language
    );

    const warnings = generateWarnings(
        selectedPlanetName,
        selectedAnalysis.totalScore,
        selectedAnalysis.breakdown.lordship.houses,
        language
    );

    const dosAndDonts = generateDosAndDonts(
        selectedPlanetName,
        selectedAnalysis.totalScore,
        language
    );

    const luckyFactors = getLuckyFactors(selectedPlanetName, language);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-3 mb-2">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        {isTamil ? 'விரிவான தசை பகுப்பாய்வு' : 'Comprehensive Dasa Analysis'}
                    </h2>
                </div>
                <p className="text-slate-400">
                    {isTamil
                        ? 'உங்கள் கிரக காலங்களின் விரிவான மதிப்பீடு'
                        : 'Detailed evaluation of your planetary periods'}
                </p>
            </motion.div>

            {/* Period Selector */}
            <DasaPeriodSelector
                selectedMaha={selectedMahaPlanet}
                selectedBhukti={selectedBhuktiPlanet}
                selectedAntaram={selectedAntaramPlanet}
                onMahaChange={(planet) => {
                    setSelectedMahaPlanet(planet);
                    setSelectedBhuktiPlanet(planet);
                    setSelectedAntaramPlanet(planet);
                }}
                onBhuktiChange={(planet) => {
                    setSelectedBhuktiPlanet(planet);
                    setSelectedAntaramPlanet(planet);
                }}
                onAntaramChange={setSelectedAntaramPlanet}
            />

            {/* Overall Current Combined Score */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 rounded-lg border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20"
            >
                <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-purple-300 mb-1 flex items-center justify-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        {isTamil ? 'தற்போதைய மொத்த மதிப்பீடு' : 'Overall Current Score'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {isTamil ? 'எல்லா தசை மட்டங்களின் கூட்டு மதிப்பீடு' : 'Combined weighted score from all Dasa levels'}
                    </p>
                </div>

                {/* Combined Score Display */}
                <div className="flex flex-col items-center mb-4">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
                        {dasaAnalysis.combined}/100
                    </div>

                    {/* Star Rating for Combined */}
                    <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(star => {
                            // Use ceil to ensure: 1-20=1★, 21-40=2★, 41-60=3★, 61-80=4★, 81-100=5★
                            const combinedRating = Math.ceil(dasaAnalysis.combined / 20);
                            return (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 ${star <= combinedRating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-600'
                                        }`}
                                />
                            );
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md h-4 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${dasaAnalysis.combined}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
                        />
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">{isTamil ? 'மகா தசை' : 'Maha Dasa'}</div>
                        <div className="text-lg font-bold text-purple-300">{dasaAnalysis.maha.totalScore}</div>
                        <div className="text-xs text-slate-500">60% {isTamil ? 'எடை' : 'weight'}</div>
                    </div>
                    {dasaAnalysis.antar && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-xs text-slate-400 mb-1">{isTamil ? 'புக்தி' : 'Bhukti'}</div>
                            <div className="text-lg font-bold text-pink-300">{dasaAnalysis.antar.totalScore}</div>
                            <div className="text-xs text-slate-500">30% {isTamil ? 'எடை' : 'weight'}</div>
                        </div>
                    )}
                    {dasaAnalysis.pratyantar && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="text-xs text-slate-400 mb-1">{isTamil ? 'அந்தரம்' : 'Antaram'}</div>
                            <div className="text-lg font-bold text-blue-300">{dasaAnalysis.pratyantar.totalScore}</div>
                            <div className="text-xs text-slate-500">10% {isTamil ? 'எடை' : 'weight'}</div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Period Selection Tabs */}
            <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <button
                    onClick={() => setSelectedPeriod('maha')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${selectedPeriod === 'maha'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {isTamil ? 'மகா தசை' : 'Maha Dasa'}
                    </div>
                    <div className="text-xs opacity-75">60% {isTamil ? 'தாக்கம்' : 'influence'}</div>
                </button>
                {dasaAnalysis.antar && (
                    <button
                        onClick={() => setSelectedPeriod('antar')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${selectedPeriod === 'antar'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {isTamil ? 'புக்தி' : 'Bhukti'}
                        </div>
                        <div className="text-xs opacity-75">30% {isTamil ? 'தாக்கம்' : 'influence'}</div>
                    </button>
                )}
                {dasaAnalysis.pratyantar && (
                    <button
                        onClick={() => setSelectedPeriod('pratyantar')}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${selectedPeriod === 'pratyantar'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {isTamil ? 'அந்தரம்' : 'Antaram'}
                        </div>
                        <div className="text-xs opacity-75">10% {isTamil ? 'தாக்கம்' : 'influence'}</div>
                    </button>
                )}
            </div>

            {/* Current Period Card */}
            <DasaPeriodCard
                planetName={selectedPlanetName}
                periodType={selectedPeriod === 'maha' ? 'Maha' : selectedPeriod === 'antar' ? 'Antar' : 'Pratyantar'}
                startDate={selectedPeriod === 'maha' ? currentDasa.maha.startDate : selectedPeriod === 'antar' ? currentDasa.bhukti.startDate : currentDasa.antaram?.startDate || ''}
                endDate={selectedPeriod === 'maha' ? currentDasa.maha.endDate : selectedPeriod === 'antar' ? currentDasa.bhukti.endDate : currentDasa.antaram?.endDate || ''}
                dasaScore={selectedAnalysis}
                effectPercentage={selectedPeriod === 'maha' ? 60 : selectedPeriod === 'antar' ? 30 : 10}
                onViewDetails={() => setShowPredictions(!showPredictions)}
            />

            {/* Score Breakdown */}
            <DasaScoreBreakdown
                dasaScore={selectedAnalysis}
                planetName={selectedPlanetName}
            />

            {/* Predictions (Toggle) */}
            {showPredictions && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <DasaPredictionsComponent
                        predictions={predictions}
                        keyEvents={keyEvents}
                        warnings={warnings}
                        dosAndDonts={dosAndDonts}
                        luckyFactors={luckyFactors}
                    />
                </motion.div>
            )}
        </div>
    );
};

export default DasaAnalysis;
