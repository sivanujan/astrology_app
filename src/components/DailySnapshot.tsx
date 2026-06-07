import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, AlertTriangle, CheckCircle, Shield, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
    calculateDashaPeriods,
    getCurrentDasha,
    calculateFullTransitChart
} from '../utils/astrology';
import { getFunctionalNature } from '../utils/adityaGurujiSubathuvam';
import { getDailySnapshot } from '../utils/gocharam';
import { getOrGenerateDailyForecast } from '../utils/dailyForecastAI';
import ChartGrid from './ChartGrid';
import PushOptIn from './PushOptIn';
import TodaySummaryCard from './TodaySummaryCard';
import EnhancedAlertBanner from './EnhancedAlertBanner';
import OverallStatsCard from './OverallStatsCard';
import PlanetaryPositionCard from './PlanetaryPositionCard';
import ForecastDayCard from './ForecastDayCard';

interface DailySnapshotProps {
    data: any;
}

const DailySnapshot: React.FC<DailySnapshotProps> = ({ data }) => {
    const { t, language } = useLanguage();

    if (!data) return null;

    const { planets, ascendant, userDetails } = data;
    const moon = planets.find((p: any) => p.name === 'Moon');

    if (!moon) return <div className="text-center p-8 text-slate-400">Moon position not found.</div>;

    // Reconstruct birthDate if needed (same fix as DashaPeriods)
    let birthDate = data.birthDate;
    if (!birthDate || typeof birthDate === 'string' || !(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
        if (userDetails?.date && userDetails?.time) {
            birthDate = new Date(`${userDetails.date}T${userDetails.time}`);
            console.log('[DailySnapshot] Reconstructed birthDate from userDetails:', birthDate);
        } else {
            console.error('[DailySnapshot] Cannot reconstruct birthDate - missing userDetails');
            return <div className="text-center p-8 text-slate-400">Birth date information missing.</div>;
        }
    }

    //1. Calculate Dasa Status
    const dashaPeriods = calculateDashaPeriods(birthDate, moon.longitude);
    const currentDasha = getCurrentDasha(dashaPeriods);

    let dasaStatus: 'Good' | 'Bad' | 'Neutral' = 'Neutral';
    let dasaDescription = "Neutral Period";

    if (currentDasha && currentDasha.maha) {
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
    const fullTransitChart = calculateFullTransitChart();

    // 3. Get Snapshot
    const snapshot = getDailySnapshot(
        moon.signIndex,
        ascendant.signIndex,
        dasaStatus,
        fullTransitChart,
        { ...data, birthDate },
        language as 'en' | 'ta'
    );

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400 border-green-500/30 bg-green-500/10';
            case 'warning': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
            case 'danger': return 'text-red-400 border-red-500/30 bg-red-500/10';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
        }
    };

    // AI FORECAST GENERATION
    const [aiPredictions, setAiPredictions] = React.useState<Record<string, { text: string; lang: string }>>({});
    const [generatingDate, setGeneratingDate] = React.useState<string | null>(null);
    // Push Opt In manages its own state

    React.useEffect(() => {
        if (!snapshot?.forecast15Days || snapshot.forecast15Days.length === 0) return;

        const generateForecasts = async () => {
            // Process sequentially to be nice to API
            for (const day of snapshot.forecast15Days) {
                const dateKey = day.dateString;

                // Skip if already has AI prediction for CURRENT language
                if (aiPredictions[dateKey]?.lang === language) continue;

                setGeneratingDate(dateKey);
                try {
                    const prediction = await getOrGenerateDailyForecast(
                        data.userDetails?.uid || "anonymous",
                        {
                            date: day.date,
                            dasaLord: day.dasaLord,
                            bhuktiLord: day.bhuktiLord,
                            dasaStatus: day.verdict === 'Danger' ? 'Danger' : 'Neutral', // Approximation map
                            transitStatus: day.verdict === 'Excellent' || day.verdict === 'Good' ? 'Good' : 'Neutral',
                            starRating: day.starRating,
                            keyTransits: day.keyFactors, // Map keyFactors to keyTransits
                            taraBala: { score: 0, type: "Calculated" }, // Gocharam doesn't export raw tara score easily, simplified
                            verdict: day.verdict
                        },
                        language as 'en' | 'ta'
                    );

                    setAiPredictions(prev => ({
                        ...prev,
                        [dateKey]: { text: prediction, lang: language }
                    }));
                } catch (e) {
                    console.error("AI Generation failed for", dateKey, e);
                } finally {
                    // Small delay
                    await new Promise(r => setTimeout(r, 500));
                }
            }
            setGeneratingDate(null);
        };

        generateForecasts();
    }, [snapshot?.forecast15Days, language]);

    // PREPARE DATA FOR UI
    const todayForecast = snapshot?.forecast15Days?.[0];

    // Calculate Planet Stats
    const planetStats = { good: 0, moderate: 0, difficult: 0 };
    if (snapshot) {
        [snapshot.jupiter, snapshot.saturn, snapshot.sun, snapshot.mars,
        snapshot.mercury, snapshot.venus, snapshot.rahu, snapshot.ketu].forEach(p => {
            // Map status to keys. Note: 'Excellent' maps to 'Good', 'Sade Sati' etc map to 'Difficult' usually? 
            // Actually Gocharam returns specific strings.
            // Let's simplify maps based on isFavorable roughly or status text.
            // Using simple logic:
            const s = p.status;
            if (s === 'Excellent' || s === 'Good') planetStats.good++;
            else if (s === 'Moderate') planetStats.moderate++;
            else planetStats.difficult++; // Covers Difficult, Sade Sati, Ashtama etc.
        });
    }

    const mapVerdictToQuality = (v: string): 'good' | 'moderate' | 'challenging' => {
        if (v?.includes('Excellent') || v?.includes('Good')) return 'good';
        if (v?.includes('Danger')) return 'challenging';
        return 'moderate';
    };

    const riskLevel: 'high' | 'medium' | 'low' = snapshot?.verdict.type === 'danger' ? 'high' : snapshot?.verdict.type === 'warning' ? 'medium' : 'low';

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

                {/* Push Notification Trigger */}
                <div className="mt-4 flex justify-center">
                    <PushOptIn uid={data.userDetails?.uid || "anonymous"} />
                </div>
            </motion.div>

            {/* NEW UI COMPONENTS */}

            {/* 1. Today's Summary */}
            {todayForecast && (
                <TodaySummaryCard
                    date={new Date(todayForecast.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    dayQuality={mapVerdictToQuality(todayForecast.verdict)}
                    nakshatra={todayForecast.extended?.nakshatra || "Unknown"}
                    tithi={todayForecast.extended?.tithi || "Thithi Unavailable"}
                    yoga={todayForecast.extended?.yoga || "Yoga Unavailable"}
                    goodTime={todayForecast.extended?.luckyTime || "-"}
                    badTime={todayForecast.extended?.unluckyTime || "-"}
                />
            )}

            {/* 2. Alert Banner (Replaces Verdict Card) */}
            <EnhancedAlertBanner
                title={snapshot.verdict.title}
                riskLevel={riskLevel}
                description={snapshot.verdict.message}
                avoidItems={todayForecast?.extended?.donts || []}
                focusItems={todayForecast?.extended?.dos || []}
                onViewRemedies={() => {
                    // Scroll to remedies or open modal (Future)
                    console.log("View Remedies Clicked");
                }}
            />

            {/* 3. Overall Stats */}
            <OverallStatsCard stats={planetStats} />

            {/* Current Transit Chart */}
            <div className="flex justify-center">
                <div className="w-full max-w-md">
                    <ChartGrid
                        title={`Current Transit Chart (Gocharam) - ${new Date().toLocaleDateString('en-GB')}`}
                        planets={fullTransitChart}
                        ascendant={ascendant}
                    />
                    <p className="text-center text-xs text-slate-500 mt-2">
                        * Chart shows current planetary positions. Your Lagna is marked.
                    </p>
                </div>
            </div>

            {/* Unified Planetary Transits Grid */}
            <h3 className="text-xl font-bold text-slate-300 mt-8 mb-4 border-l-4 border-purple-500 pl-3">
                {t.analysis.planets} (Gocharam)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    snapshot.sun,
                    snapshot.mars,
                    snapshot.mercury,
                    snapshot.jupiter,
                    snapshot.venus,
                    snapshot.saturn,
                    snapshot.rahu,
                    snapshot.ketu
                ].map((p, idx) => (
                    <PlanetaryPositionCard
                        key={p.planet}
                        planet={p.planet}
                        localizedName={t.planets[p.planet as keyof typeof t.planets] || p.planet}
                        status={p.status} // Gocharam returns english status as key
                        description={p.description}
                        isFavorable={p.isFavorable}
                        aspects={p.aspects}
                    />
                ))}
            </div>

            {/* Dasa Context */}
            <div className="glass-panel p-4 flex items-center justify-between text-sm text-slate-400 mt-8">
                <span>{t.forecast?.dasaContext || "Current Dasa Context"}:</span>
                <span className={`font-bold ${dasaStatus === 'Good' ? 'text-green-400' :
                    dasaStatus === 'Bad' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                    {dasaDescription}
                </span>
            </div>

            {/* 15-Day Forecast Section */}
            {
                snapshot.forecast15Days && snapshot.forecast15Days.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                            <span className="bg-blue-500/10 p-1 rounded">📅</span>
                            {t.forecast?.title || "Next 15 Days Forecast (Dasa + Gocharam)"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {snapshot.forecast15Days.map((day, idx) => {
                                const isExtended = !!day.extended;
                                return (
                                    <ForecastDayCard
                                        key={idx}
                                        date={new Date(day.date)}
                                        dayName={new Date(day.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB', { weekday: 'long' })}
                                        fullDate={day.dateString}
                                        verdict={day.verdict}
                                        score={day.extended?.totalScore || day.starRating}
                                        dasa={`${day.dasaLord}-${day.bhuktiLord}`}
                                        prediction={day.prediction}
                                        keyFactors={day.keyFactors}
                                        lifeAreas={day.extended?.lifeAreas}
                                        aiPrediction={aiPredictions[day.dateString]?.text}
                                        isGeneratingAI={generatingDate === day.dateString}
                                        luckyTime={day.extended?.luckyTime}
                                        nakshatra={day.extended?.nakshatra}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )
            }
        </div >
    );
};// End of component
export default DailySnapshot;
