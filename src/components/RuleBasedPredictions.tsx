import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Heart, HelpCircle, Star, Globe } from 'lucide-react';
import { calculatePlanetaryPositions, getCurrentDasha, calculateDashaPeriods } from '../utils/astrology';
import { calculateAdityaGurujiSubathuvam } from '../utils/adityaGurujiSubathuvam';
import {
    predictJobTiming,
    predictDetailedMarriageTiming,
    predictMarriageType,
    predictCareerPath,
    predictForeignTravel,
    PredictionResult,
    TransitPositions
} from '../utils/predictionRules';

interface RuleBasedPredictionsProps {
    data: any; // Chart Data
    language?: 'en' | 'ta';
}

const RuleBasedPredictions: React.FC<RuleBasedPredictionsProps> = ({ data, language = 'en' }) => {
    const [predictions, setPredictions] = useState<PredictionResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!data) return;

        const calculatePredictions = () => {
            const { planets, ascendant, userDetails } = data;

            // 1. Calculate Current Transits
            const now = new Date();
            // We need lat/lng from userDetails, or default to Chennai/User's location
            // Assuming userDetails has lat/lng, otherwise default
            const lat = userDetails.lat || 13.0827;
            const lng = userDetails.lng || 80.2707;

            const transitData = calculatePlanetaryPositions(now, lat, lng);

            const transits: TransitPositions = {
                jupiterSignIndex: transitData.planets.find(p => p.name === 'Jupiter')?.signIndex || 0,
                saturnSignIndex: transitData.planets.find(p => p.name === 'Saturn')?.signIndex || 0,
                rahuSignIndex: transitData.planets.find(p => p.name === 'Rahu')?.signIndex || 0,
                ketuSignIndex: transitData.planets.find(p => p.name === 'Ketu')?.signIndex || 0,
                sunSignIndex: transitData.planets.find(p => p.name === 'Sun')?.signIndex || 0,
                moonSignIndex: transitData.planets.find(p => p.name === 'Moon')?.signIndex || 0,
                marsSignIndex: transitData.planets.find(p => p.name === 'Mars')?.signIndex || 0,
                mercurySignIndex: transitData.planets.find(p => p.name === 'Mercury')?.signIndex || 0,
                venusSignIndex: transitData.planets.find(p => p.name === 'Venus')?.signIndex || 0,
            };

            // 2. Calculate Current Dasa
            // We need moon longitude from birth chart
            const moon = planets.find((p: any) => p.name === 'Moon');
            if (!moon) return;

            // Re-calculate dasa periods to get current
            // Note: In a real app, we might pass this in props if already calculated
            const periods = calculateDashaPeriods(userDetails.birthDate, moon.longitude);
            const currentDasa = getCurrentDasha(periods, now);

            if (!currentDasa || !currentDasa.maha) return;

            // 3. Calculate Subathuvam Scores (needed for some rules)
            const subathuvamScores = calculateAdityaGurujiSubathuvam(planets);

            // 4. Run Predictions
            const results: PredictionResult[] = [];


            // Job
            results.push(predictJobTiming(
                { maha: currentDasa.maha, bhukti: currentDasa.bhukti },
                transits,
                ascendant.signIndex,
                moon.signIndex,
                planets,
                language
            ));

            // Foreign Settlement (New - Moved to Top)
            results.push(predictForeignTravel(
                planets,
                ascendant.signIndex,
                moon.signIndex,
                subathuvamScores,
                { maha: currentDasa.maha, bhukti: currentDasa.bhukti },
                language
            ));

            // Marriage
            // Assuming gender is passed or default to male. 
            // TODO: Add gender to user input if missing.
            results.push(predictDetailedMarriageTiming(
                { maha: currentDasa.maha, bhukti: currentDasa.bhukti },
                transits,
                ascendant.signIndex,
                moon.signIndex,
                planets,
                userDetails.birthDate, // Pass birthDate
                'male', // Defaulting to male for now
                periods, // Pass all dasha periods for future prediction
                language
            ));

            // Marriage Type
            results.push(predictMarriageType(
                planets,
                ascendant.signIndex,
                subathuvamScores,
                { maha: currentDasa.maha, bhukti: currentDasa.bhukti },
                language
            ));

            // Career Path
            results.push(predictCareerPath(
                planets,
                ascendant.signIndex,
                subathuvamScores,
                { maha: currentDasa.maha, bhukti: currentDasa.bhukti },
                language
            ));



            setPredictions(results);
            setLoading(false);
        };

        calculatePredictions();
    }, [data, language]);

    if (loading) {
        return <div className="p-6 text-center text-slate-400">Calculating Predictions...</div>;
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {predictions.map((pred, index) => (
                    <div key={index} className="glass-panel p-6 relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            {(pred.question.includes('Job') || pred.question.includes('Career') || pred.question.includes('வேலை')) && <Briefcase className="w-12 h-12" />}
                            {(pred.question.includes('Married') || pred.question.includes('Marriage') || pred.question.includes('திருமணம்')) && <Heart className="w-12 h-12" />}
                            {(pred.question.includes('Abroad') || pred.question.includes('Foreign') || pred.question.includes('வெளிநாடு')) && <Globe className="w-12 h-12" />}
                        </div>

                        <h3 className="text-lg font-semibold text-purple-300 mb-2">{pred.question}</h3>

                        <div className="mb-4">
                            <p className="text-xl font-bold text-white mb-1 whitespace-pre-line">{pred.answer}</p>
                            <p className="text-sm text-slate-400 whitespace-pre-line">{pred.reason}</p>
                        </div>

                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${pred.isFavorable ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                            {pred.isFavorable ? 'Favorable' : 'Neutral / Mixed'}
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default RuleBasedPredictions;
