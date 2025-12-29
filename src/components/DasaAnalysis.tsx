import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Star } from 'lucide-react';
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

const DASA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

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
