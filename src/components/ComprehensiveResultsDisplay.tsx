import React from 'react';
import { motion } from 'framer-motion';
import { ComprehensiveMatchResult } from '../utils/marriageMatchingMain';
import { User, Heart, Star, Calendar } from 'lucide-react';
import { getCurrentDasha } from '../utils/dashaCalculation';
import { ZODIAC_SIGNS, NAKSHATRAS } from '../utils/constants';

interface Props {
    result: ComprehensiveMatchResult;
    isTamil: boolean;
    boyName?: string;
    girlName?: string;
}

// Helper to get birth details from chart
const getBirthDetails = (chart: any) => {
    console.log('===== CHART DEBUG =====');
    console.log('chart.ascendant:', chart.ascendant);
    console.log('chart.lagna:', chart.lagna);

    // Lagna (Ascendant) - from calculatePlanetaryPositions it's in ascendant.longitude
    let lagnaSign;
    if (chart.ascendant?.longitude !== undefined) {
        // ascendant.longitude is the degree (0-360), convert to sign index
        lagnaSign = Math.floor(chart.ascendant.longitude / 30);
        console.log('Using chart.ascendant.longitude:', chart.ascendant.longitude, '-> Sign index:', lagnaSign);
    } else if (chart.ascendant?.signIndex !== undefined) {
        // Or it might have signIndex directly
        lagnaSign = chart.ascendant.signIndex;
        console.log('Using chart.ascendant.signIndex:', lagnaSign);
    } else if (chart.lagna !== undefined && chart.lagna !== null) {
        // Fallback to lagna field if present
        lagnaSign = Math.floor(Number(chart.lagna) / 30);
        console.log('Using chart.lagna:', chart.lagna, '-> Sign index:', lagnaSign);
    } else {
        console.log('NO LAGNA FOUND!');
    }
    const lagnaName = lagnaSign !== undefined ? ZODIAC_SIGNS[lagnaSign] : 'Unknown';
    console.log('Final: Sign index:', lagnaSign, 'Name:', lagnaName);
    console.log('======================');

    const moon = chart.planets?.find((p: any) => p.name === 'Moon');
    const rasiSign = moon ? Math.floor(moon.longitude / 30) : 0;
    const rasiName = ZODIAC_SIGNS[rasiSign] || 'Unknown';

    // Correct nakshatra calculation (each nakshatra is 13°20' or 13.333... degrees)
    // Nakshatra index: 0-26 for 27 nakshatras
    let nakshatraName = 'Unknown';
    if (moon) {
        const nakshatraIndex = Math.floor(moon.longitude / (360 / 27));
        const nakshatra = NAKSHATRAS[nakshatraIndex];
        nakshatraName = typeof nakshatra === 'string' ? nakshatra : (nakshatra?.name || 'Unknown');
    }

    let dashaInfo = 'Not available';
    if (moon && chart.birthDate) {
        try {
            const currentDasha = getCurrentDasha(moon.longitude, chart.birthDate, new Date());
            dashaInfo = `${currentDasha.maha.planet} Maha Dasha`;
            if (currentDasha.bhukti) {
                dashaInfo += `, ${currentDasha.bhukti.planet} Bhukti`;
            }
        } catch (e) {
            console.error('Dasha calculation error:', e);
            dashaInfo = 'Not available';
        }
    }

    return { lagnaName, rasiName, nakshatraName, dashaInfo };
};

export const ComprehensiveResultsDisplay: React.FC<Props> = ({ result, isTamil, boyName, girlName }) => {
    // Extract birth details if charts are available
    const boyDetails = result.boyChart ? getBirthDetails(result.boyChart) : null;
    const girlDetails = result.girlChart ? getBirthDetails(result.girlChart) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-6"
        >
            {/* Birth Details Section */}
            {(boyDetails || girlDetails) && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Boy's Details */}
                    {boyDetails && (
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 rounded-2xl p-6 border border-blue-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="w-6 h-6 text-blue-400" />
                                <h3 className="text-xl font-bold text-blue-300">
                                    {isTamil ? 'ஆண் விவரங்கள்' : "Boy's Details"}
                                </h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                {boyName && (
                                    <div className="flex items-center gap-2 pb-2 border-b border-blue-500/30">
                                        <User className="w-4 h-4 text-blue-400" />
                                        <span className="text-slate-100">
                                            <span className="font-bold text-blue-300 text-base">{boyName}</span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'லக்னம்' : 'Lagna'}:</span> {boyDetails.lagnaName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'ராசி' : 'Rasi'}:</span> {boyDetails.rasiName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}:</span> {boyDetails.nakshatraName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'தசை' : 'Current Dasha'}:</span> {boyDetails.dashaInfo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Girl's Details */}
                    {girlDetails && (
                        <div className="bg-gradient-to-br from-pink-900/40 to-pink-950/40 rounded-2xl p-6 border border-pink-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <Heart className="w-6 h-6 text-pink-400" />
                                <h3 className="text-xl font-bold text-pink-300">
                                    {isTamil ? 'பெண் விவரங்கள்' : "Girl's Details"}
                                </h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                {girlName && (
                                    <div className="flex items-center gap-2 pb-2 border-b border-pink-500/30">
                                        <Heart className="w-4 h-4 text-pink-400" />
                                        <span className="text-slate-100">
                                            <span className="font-bold text-pink-300 text-base">{girlName}</span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'லக்னம்' : 'Lagna'}:</span> {girlDetails.lagnaName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'ராசி' : 'Rasi'}:</span> {girlDetails.rasiName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}:</span> {girlDetails.nakshatraName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-yellow-400" />
                                    <span className="text-slate-300">
                                        <span className="font-semibold text-white">{isTamil ? 'தசை' : 'Current Dasha'}:</span> {girlDetails.dashaInfo}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Overall Score */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {isTamil ? 'மொத்த மதிப்பெண்' : 'Overall Score'}
                    </h2>
                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500 mb-2">
                        {result.overallScore.toFixed(1)}/100
                    </div>
                    <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${result.verdict === 'Excellent' ? 'bg-green-500' :
                        result.verdict === 'Very Good' ? 'bg-blue-500' :
                            result.verdict === 'Good' ? 'bg-cyan-500' :
                                result.verdict === 'Average' ? 'bg-yellow-500' :
                                    result.verdict === 'Risky' ? 'bg-orange-500' :
                                        result.verdict === 'Poor' ? 'bg-red-600' : 'bg-red-900'
                        }`}>
                        {result.verdict}
                    </div>
                </div>
            </div>

            {/* Auto-Reject Warning */}
            {result.autoReject && (
                <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-3">
                        ⚠️ {isTamil ? 'AUTO REJECT' : 'AUTO REJECT'}
                    </h3>
                    <ul className="space-y-2">
                        {result.autoRejectReasons.map((reason, idx) => (
                            <li key={idx} className="text-red-300">❌ {reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 9 Rules */}
            <div className="space-y-4">
                {/* Rule 1: Dasa Sync */}
                <RuleCard
                    title={isTamil ? '⭐ தசா-புத்தி பொருத்தம்' : '⭐ Dasa-Bhukti Sync'}
                    weight="35%"
                    score={result.dasaSync.score}
                    details={result.dasaSync.details}
                    color="purple"
                />

                {/* Rule 2: Dosha Balance */}
                <RuleCard
                    title={isTamil ? 'பாப-சுப சாம்யம்' : 'Dosha Balance'}
                    weight="15%"
                    score={result.doshaBalance.score}
                    details={result.doshaBalance.details}
                    color="blue"
                />

                {/* Rule 3: 2nd House */}
                <RuleCard
                    title={isTamil ? '2-ம் இடம்' : '2nd House'}
                    weight="10%"
                    score={result.house2nd.score}
                    details={result.house2nd.details}
                    color="emerald"
                />

                {/* Rule 4: 5th House */}
                <RuleCard
                    title={isTamil ? '5-ம் இடம்' : '5th House'}
                    weight="15%"
                    score={result.house5th.score}
                    details={result.house5th.details}
                    color="sky"
                />

                {/* Rule 5: 7th House */}
                <RuleCard
                    title={isTamil ? '7-ம் இடம்' : '7th House'}
                    weight="20%"
                    score={result.house7th.score}
                    details={result.house7th.details}
                    color="cyan"
                />

                {/* Rule 6: 8th House / Foreign */}
                <RuleCard
                    title={isTamil ? '8-ம் இடம் / வெளிநாடு' : '8th House / Foreign'}
                    weight="10%"
                    score={result.house8th.score}
                    details={result.house8th.details}
                    color="amber"
                />

                {/* Rule 7: Venus */}
                <RuleCard
                    title={isTamil ? 'சுக்கிரன்' : 'Venus'}
                    weight="10%"
                    score={result.venus.score}
                    details={result.venus.details}
                    color="pink"
                />

                {/* Rule 8: Jupiter-Venus */}
                <RuleCard
                    title={isTamil ? 'குரு-சுக்கிரன்' : 'Jupiter-Venus'}
                    weight="8%"
                    score={result.jupiterVenus.score}
                    details={result.jupiterVenus.details}
                    color="indigo"
                />

                {/* Rule 9: Lagna */}
                <RuleCard
                    title={isTamil ? 'லக்னம்' : 'Lagna'}
                    weight="7%"
                    score={result.lagna.score}
                    details={result.lagna.details}
                    color="green"
                />
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">
                        ✅ {isTamil ? 'பலம்' : 'Strengths'}
                    </h3>
                    <ul className="space-y-2">
                        {result.strengths.map((s, i) => (
                            <li key={i} className="text-green-200">• {s}</li>
                        ))}
                    </ul>
                </div>
                <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-400 mb-4">
                        ⚠️ {isTamil ? 'கவனிக்க' : 'Concerns'}
                    </h3>
                    <ul className="space-y-2">
                        {result.weaknesses.map((w, i) => (
                            <li key={i} className="text-orange-200">• {w}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-xl font-bold mb-4">
                    💡 {isTamil ? 'பரிந்துரைகள்' : 'Recommendations'}
                </h3>
                <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-slate-200">→ {rec}</li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
};

// Helper component for rule cards
const RuleCard: React.FC<{
    title: string;
    weight: string;
    score: number;
    details: string[];
    color: string;
}> = ({ title, weight, score, details, color }) => {
    return (
        <div className={`bg-white/5 rounded-xl p-6 border-l-4 border-${color}-500`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-sm text-slate-400">Weight: {weight}</p>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{score}/100</span>
            </div>
            <div className="space-y-1 text-sm text-slate-300">
                {details.map((d, i) => (
                    <p key={i}>• {d}</p>
                ))}
            </div>
        </div>
    );
};
