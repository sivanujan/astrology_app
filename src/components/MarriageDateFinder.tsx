import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Sparkles, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PlaceSearch from './PlaceSearch';
import { calculatePlanetaryPositions, calculateDashaPeriods, calculateCurrentTransits } from '../utils/astrology';
import { predictDetailedMarriageTiming } from '../utils/predictionRules';
import { calculateSubathuvamPavathuvam } from '../utils/subathuvam';

interface DateFinderDetails {
    name: string;
    gender: 'male' | 'female';
    date: string;
    time: string;
    birthPlace: string;
    birthLat: number;
    birthLng: number;
}

const MarriageDateFinder: React.FC = () => {
    const { language, t } = useLanguage();
    const isTamil = language === 'ta';

    const [details, setDetails] = useState<DateFinderDetails>({
        name: '',
        gender: 'male',
        date: '',
        time: '',
        birthPlace: '',
        birthLat: 0,
        birthLng: 0
    });

    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = () => {
        if (!details.date || !details.time || !details.birthPlace) {
            alert(isTamil ? 'அனைத்து விவரங்களையும் உள்ளிடவும்' : 'Please fill all details');
            return;
        }

        setAnalyzing(true);
        try {
            const birthDate = new Date(`${details.date}T${details.time}`);
            if (isNaN(birthDate.getTime())) {
                throw new Error('Invalid Date/Time format');
            }
            const chartData = calculatePlanetaryPositions(birthDate, details.birthLat, details.birthLng);
            const moon = chartData.planets.find(p => p.name === 'Moon');

            if (!moon) throw new Error('Moon position not found');

            // 1. Calculate Dasa Periods
            const dasaPeriods = calculateDashaPeriods(birthDate, moon.longitude);

            // 2. Identify Current Dasa
            // Helper to check if date is within range
            const isCurrent = (start: Date, end: Date) => {
                const now = new Date();
                return now >= start && now <= end;
            };

            const currentMaha = dasaPeriods.find(d => isCurrent(d.startDate, d.endDate));
            const currentBhukti = currentMaha?.subPeriods?.find(b => isCurrent(b.startDate, b.endDate));

            if (!currentMaha) throw new Error('Current Dasa not found');

            // 3. Calculate Transits (Current)
            // predictDetailedMarriageTiming expects TransitPositions { jupiterSignIndex, ... }
            const transits = calculateCurrentTransits();

            // 4. Calculate Subathuvam
            const subathuvamResult = calculateSubathuvamPavathuvam(chartData.planets, language);

            // 5. Run Prediction Engine
            const prediction = predictDetailedMarriageTiming(
                {
                    maha: currentMaha,
                    bhukti: currentBhukti
                },
                transits,
                chartData.ascendant.signIndex,
                moon.signIndex,
                chartData.planets,
                birthDate,
                details.gender,
                dasaPeriods,
                language,
                subathuvamResult
            );

            setResult(prediction);

        } catch (error) {
            console.error(error);
            alert(isTamil ? 'கணிப்பதில் பிழை ஏற்பட்டது' : 'Error calculating prediction');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl p-4 md:p-8 backdrop-blur-xl border border-white/10 relative z-20"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                            {isTamil ? 'திருமண காலம் அறிய' : 'Find Marriage Timing'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {isTamil
                                ? 'உங்கள் ஜாதகப்படி திருமண யோகம் எப்போது?'
                                : 'When is the favorable time for marriage based on your chart?'}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            {isTamil ? 'பெயர்' : 'Name'}
                        </label>
                        <input
                            type="text"
                            value={details.name}
                            onChange={(e) => setDetails({ ...details, name: e.target.value })}
                            className="w-full min-w-0 appearance-none px-3 md:px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base text-white"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            {isTamil ? 'பாலினம்' : 'Gender'}
                        </label>
                        <select
                            value={details.gender}
                            onChange={(e) => setDetails({ ...details, gender: e.target.value as 'male' | 'female' })}
                            className="w-full min-w-0 appearance-none px-3 md:px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base text-white"
                        >
                            <option value="male">{isTamil ? 'ஆண்' : 'Male'}</option>
                            <option value="female">{isTamil ? 'பெண்' : 'Female'}</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            {isTamil ? 'பிறந்த தேதி' : 'Date of Birth'}
                        </label>
                        <input
                            type="date"
                            value={details.date}
                            onChange={(e) => setDetails({ ...details, date: e.target.value })}
                            className="w-full min-w-0 appearance-none px-3 md:px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base text-white"
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            {isTamil ? 'பிறந்த நேரம்' : 'Time of Birth'}
                        </label>
                        <input
                            type="time"
                            value={details.time}
                            onChange={(e) => setDetails({ ...details, time: e.target.value })}
                            className="w-full min-w-0 appearance-none px-3 md:px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-base text-white"
                        />
                    </div>

                    {/* Place */}
                    <div className="md:col-span-2">
                        <PlaceSearch
                            value={details.birthPlace}
                            onChange={(place) => setDetails({
                                ...details,
                                birthPlace: place.name,
                                birthLat: place.lat,
                                birthLng: place.lng
                            })}
                            label={isTamil ? 'பிறந்த இடம்' : 'Birth Place'}
                            placeholder={isTamil ? 'இடத்தைத் தேடவும்...' : 'Search location...'}
                        />
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                    {analyzing
                        ? (isTamil ? 'கணிக்கிறது...' : 'Analyzing Chart...')
                        : (isTamil ? 'திருமண காலத்தை அறிய' : 'Calculate Marriage Timing')}
                </button>
            </motion.div>

            {/* Results Section */}
            {/* Results Section */}
            {result && (
                <div className="mt-8 space-y-6">
                    {/* Main Verdict Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/80 rounded-2xl p-6 border border-purple-500/30 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-24 h-24 text-purple-400" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                {result.question}
                            </h3>

                            {/* If we have structured details, show timeline. Else show generic text */}
                            {result.predictionDetails?.periods && result.predictionDetails.periods.length > 0 ? (
                                <div className="space-y-4">
                                    {result.verdict ? (
                                        <div className={`rounded-xl p-4 mb-6 border ${result.predictionDetails?.isLateMarriage ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                                                {result.verdict}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-300 mb-6">
                                            {isTamil
                                                ? 'உங்கள் ஜாதகப்படி திருமணம் நடைபெற வாய்ப்புள்ள மிக முக்கியமான காலங்கள் கீழே கொடுக்கப்பட்டுள்ளன:'
                                                : 'Based on your chart, here are the most favorable periods for marriage:'}
                                        </p>
                                    )}

                                    <div className="grid gap-4">
                                        {result.predictionDetails.periods.slice(0, 5).map((period: any, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`relative p-4 rounded-xl border ${period.isPriority1
                                                    ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/50'
                                                    : 'bg-white/5 border-white/10'}`}
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <Calendar className={`w-4 h-4 ${period.isPriority1 ? 'text-yellow-400' : 'text-slate-400'}`} />
                                                            <span className="font-bold text-white text-lg">
                                                                {new Date(period.start).toLocaleDateString(language, { month: 'short', year: 'numeric' })}
                                                                {' - '}
                                                                {new Date(period.end).toLocaleDateString(language, { month: 'short', year: 'numeric' })}
                                                            </span>
                                                            {period.isPriority1 && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                                    {isTamil ? 'முக்கிய காலம்' : 'Primary'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                                                {period.dasa}
                                                            </span>
                                                            <span>/</span>
                                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                                                {period.bhukti}
                                                            </span>
                                                            <span>/</span>
                                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                                                                {period.antaram}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
                                                            {isTamil ? 'பலம்' : 'Strength'}
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${period.score > 4 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                                                    style={{ width: `${Math.min(period.score * 10, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-bold text-white">{(period.score || 0).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                                    {result.answer}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Reasoning Section */}
                    {result.reason && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-slate-800/50 rounded-xl p-6 border border-white/5"
                        >
                            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                {isTamil ? 'ஜோதிட விளக்கம்' : 'Astrological Reasoning'}
                            </h4>
                            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {result.reason}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarriageDateFinder;
