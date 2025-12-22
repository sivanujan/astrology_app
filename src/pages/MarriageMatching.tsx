import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Clock, User, Home, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PlaceSearch from '../components/PlaceSearch';
import { analyzeMarriageCompatibility, MatchingResult } from '../utils/marriageMatching';
import { calculatePlanetaryPositions } from '../utils/astrology';

interface PersonDetails {
    name: string;
    gender: 'male' | 'female';
    date: string;
    time: string;
    birthPlace: string;
    birthLat: number;
    birthLng: number;
    currentPlace: string;
    currentLat: number;
    currentLng: number;
}

// Move PersonForm OUTSIDE to prevent re-creation on every render
interface PersonFormProps {
    person: PersonDetails;
    setPerson: (p: PersonDetails) => void;
    title: string;
    titleTamil: string;
    icon: React.ElementType;
    color: string;
    isTamil: boolean;
}

const PersonForm: React.FC<PersonFormProps> = ({
    person,
    setPerson,
    title,
    titleTamil,
    icon: Icon,
    color,
    isTamil
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-2xl border border-white/10`}
    >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">{isTamil ? titleTamil : title}</h2>
                <p className="text-sm opacity-75">
                    {isTamil ? 'பிறப்பு மற்றும் தற்போதைய விவரங்கள்' : 'Birth & Current Details'}
                </p>
            </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
            {/* Name */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    {isTamil ? 'பெயர்' : 'Name'}
                </label>
                <input
                    type="text"
                    value={person.name}
                    onChange={(e) => setPerson({ ...person, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
                    placeholder={isTamil ? 'பெயரை உள்ளிடவும்' : 'Enter name'}
                />
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {isTamil ? 'பிறந்த தேதி' : 'Date of Birth'}
                </label>
                <input
                    type="date"
                    value={person.date}
                    onChange={(e) => setPerson({ ...person, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                />
            </div>

            {/* Time */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {isTamil ? 'பிறந்த நேரம்' : 'Time of Birth'}
                </label>
                <input
                    type="time"
                    value={person.time}
                    onChange={(e) => setPerson({ ...person, time: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
                />
            </div>

            {/* Birth Place */}
            <div>
                <PlaceSearch
                    value={person.birthPlace}
                    onChange={(place) => setPerson({
                        ...person,
                        birthPlace: place.name,
                        birthLat: place.lat,
                        birthLng: place.lng
                    })}
                    label={isTamil ? 'பிறந்த இடம்' : 'Birth Place'}
                    placeholder={isTamil ? 'இடத்தைத் தேடவும்...' : 'Search location...'}
                />
            </div>

            {/* Current Living Place */}
            <div>
                <PlaceSearch
                    value={person.currentPlace}
                    onChange={(place) => setPerson({
                        ...person,
                        currentPlace: place.name,
                        currentLat: place.lat,
                        currentLng: place.lng
                    })}
                    label={isTamil ? 'தற்போதைய வசிப்பிடம்' : 'Current Living Place'}
                    placeholder={isTamil ? 'இடத்தைத் தேடவும்...' : 'Search location...'}
                />
                <p className="text-xs opacity-75 mt-1">
                    {isTamil ? '8-12 விதி சரிபார்ப்புக்கு தேவை' : 'Required for 8-12 rule verification'}
                </p>
            </div>
        </div>
    </motion.div>
);

const MarriageMatching: React.FC = () => {
    const { language, t } = useLanguage();
    const isTamil = language === 'ta';
    const navigate = useNavigate();

    const [boyDetails, setBoyDetails] = useState<PersonDetails>({
        name: '',
        gender: 'male',
        date: '',
        time: '',
        birthPlace: '',
        birthLat: 0,
        birthLng: 0,
        currentPlace: '',
        currentLat: 0,
        currentLng: 0
    });

    const [girlDetails, setGirlDetails] = useState<PersonDetails>({
        name: '',
        gender: 'female',
        date: '',
        time: '',
        birthPlace: '',
        birthLat: 0,
        birthLng: 0,
        currentPlace: '',
        currentLat: 0,
        currentLng: 0
    });

    const [analyzing, setAnalyzing] = useState(false);
    const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);

    const handleAnalyze = async () => {
        // Validation
        if (!boyDetails.name || !boyDetails.date || !boyDetails.time || !boyDetails.birthPlace) {
            alert(isTamil ? 'தயவுசெய்து ஆணின் அனைத்து விவரங்களையும் நிரப்பவும்' : 'Please fill all details for Boy');
            return;
        }
        if (!girlDetails.name || !girlDetails.date || !girlDetails.time || !girlDetails.birthPlace) {
            alert(isTamil ? 'தயவுசெய்து பெண்ணின் அனைத்து விவரங்களையும் நிரப்பவும்' : 'Please fill all details for Girl');
            return;
        }

        setAnalyzing(true);
        try {
            const result = await analyzeMarriageCompatibility(boyDetails, girlDetails);

            // Generate charts for display and PDF
            try {
                const boyBirthDate = new Date(`${boyDetails.date}T${boyDetails.time}`);
                const girlBirthDate = new Date(`${girlDetails.date}T${girlDetails.time}`);

                console.log('Generating charts...', { boyBirthDate, girlBirthDate, boyDetails, girlDetails });

                const boyChart = calculatePlanetaryPositions(boyBirthDate, boyDetails.birthLat, boyDetails.birthLng);
                const girlChart = calculatePlanetaryPositions(girlBirthDate, girlDetails.birthLat, girlDetails.birthLng);

                console.log('Charts generated:', { boyChart, girlChart });

                // Helper to get sign name from index
                const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

                const getMoonSign = (chart: any) => {
                    const moon = chart.planets.find((p: any) => p.name === 'Moon');
                    return moon ? SIGNS[moon.signIndex] : 'Unknown';
                };

                // Helper to extract ascendant sign name
                const getAscendantSign = (chart: any): string => {
                    if (!chart || !chart.ascendant) return 'Unknown';

                    // Ascendant is an object with {name, longitude, signIndex, degree}
                    if (typeof chart.ascendant === 'object') {
                        const signIndex = chart.ascendant.signIndex;
                        if (typeof signIndex === 'number' && signIndex >= 0 && signIndex < 12) {
                            return SIGNS[signIndex];
                        }
                    }

                    // Fallback if it's already a string
                    if (typeof chart.ascendant === 'string') {
                        return chart.ascendant;
                    }

                    return 'Unknown';
                };

                // Navigate to results page with chart data
                navigate('/matching-results', {
                    state: {
                        result,
                        boyName: boyDetails.name,
                        girlName: girlDetails.name,
                        boyChart: {
                            ascendant: getAscendantSign(boyChart),
                            moonSign: getMoonSign(boyChart),
                            planets: boyChart.planets
                        },
                        girlChart: {
                            ascendant: getAscendantSign(girlChart),
                            moonSign: getMoonSign(girlChart),
                            planets: girlChart.planets
                        }
                    }
                });
            } catch (chartError) {
                console.error('Error generating charts:', chartError);
                // Navigate without charts if chart generation fails
                navigate('/matching-results', {
                    state: {
                        result,
                        boyName: boyDetails.name,
                        girlName: girlDetails.name,
                        boyChart: null,
                        girlChart: null
                    }
                });
            }
        } catch (error) {
            console.error('Error analyzing compatibility:', error);
            alert('Error analyzing compatibility. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Heart className="w-12 h-12 text-pink-400" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
                            {isTamil ? 'திருமண பொருத்தம்' : 'Marriage Matching'}
                        </h1>
                    </div>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                        {isTamil
                            ? 'குருஜி முறைப்படி விரிவான திருமண பொருத்த பகுப்பாய்வு - சுபத்துவம், வீட்டுப் பொருத்தம், தசா காலம்'
                            : 'Comprehensive Marriage Compatibility Analysis using Guruji Method - Subathuvam, House Matching, Dasa Timing'
                        }
                    </p>
                </motion.div>

                {/* Dual Forms */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <PersonForm
                        person={boyDetails}
                        setPerson={setBoyDetails}
                        title="Boy's Details"
                        titleTamil="ஆணின் விவரங்கள்"
                        icon={User}
                        color="from-blue-900/50 to-blue-950/50"
                        isTamil={isTamil}
                    />
                    <PersonForm
                        person={girlDetails}
                        setPerson={setGirlDetails}
                        title="Girl's Details"
                        titleTamil="பெண்ணின் விவரங்கள்"
                        icon={Heart}
                        color="from-pink-900/50 to-pink-950/50"
                        isTamil={isTamil}
                    />
                </div>

                {/* Analyze Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="group relative px-12 py-5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span className="flex items-center gap-3">
                            {analyzing ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isTamil ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing...'}
                                </>
                            ) : (
                                <>
                                    {isTamil ? '🔮 பொருத்தம் பார்க்க' : '🔮 Analyze Compatibility'}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                    <p className="text-sm text-slate-400 mt-4">
                        {isTamil
                            ? 'இரண்டு ஜாதகங்களும் முழுமையான பகுப்பாய்வுக்கு உட்படுத்தப்படும்'
                            : 'Both charts will undergo comprehensive analysis'
                        }
                    </p>
                </motion.div>

                {/* Results Section */}
                {matchingResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 space-y-6"
                    >
                        {/* Overall Score */}
                        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-4">
                                    {isTamil ? 'மொத்த மதிப்பெண்' : 'Overall Score'}
                                </h2>
                                <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500 mb-2">
                                    {matchingResult.overallScore.toFixed(1)}/100
                                </div>
                                <div className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${matchingResult.verdict === 'Excellent' ? 'bg-green-500' :
                                    matchingResult.verdict === 'Very Good' ? 'bg-blue-500' :
                                        matchingResult.verdict === 'Good' ? 'bg-cyan-500' :
                                            matchingResult.verdict === 'Average' ? 'bg-yellow-500' :
                                                matchingResult.verdict === 'Risky' ? 'bg-orange-500' :
                                                    'bg-red-500'
                                    }`}>
                                    {matchingResult.verdict}
                                </div>
                            </div>
                        </div>

                        {/* Auto-Reject Warnings */}
                        {matchingResult.autoReject && (
                            <div className="bg-red-900/30 border-2 border-red-500 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-red-400 mb-3">
                                    ⚠️ {isTamil ? 'முக்கிய எச்சரிக்கை' : 'Critical Warnings'}
                                </h3>
                                <ul className="space-y-2">
                                    {matchingResult.autoRejectReasons.map((reason, idx) => (
                                        <li key={idx} className="text-red-300">❌ {reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Lagna Analysis */}
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4">
                                {isTamil ? 'லக்ன பகுப்பாய்வு' : 'Lagna Analysis'}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-slate-400">Boy's Type:</p>
                                    <p className="text-lg font-bold text-blue-400">{matchingResult.lagnaAnalysis.boyType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Girl's Type:</p>
                                    <p className="text-lg font-bold text-pink-400">{matchingResult.lagnaAnalysis.girlType}</p>
                                </div>
                            </div>
                            <p className="text-slate-300">{matchingResult.lagnaAnalysis.details}</p>
                            <div className="mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm ${matchingResult.lagnaAnalysis.compatible ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {matchingResult.lagnaAnalysis.compatible ? '✓ Compatible' : '✗ Incompatible'}
                                </span>
                            </div>
                        </div>

                        {/* House Matching */}
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4">
                                {isTamil ? 'வீட்டு பொருத்தம்' : 'House Matching'}
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { house: 2, name: isTamil ? 'குடும்பம்/செல்வம்' : 'Family/Wealth', data: matchingResult.houseMatching.house2 },
                                    { house: 5, name: isTamil ? 'குழந்தைகள்' : 'Children', data: matchingResult.houseMatching.house5 },
                                    { house: 7, name: isTamil ? 'திருமணம்' : 'Marriage', data: matchingResult.houseMatching.house7 },
                                    { house: 8, name: isTamil ? 'ஆயுள்' : 'Longevity', data: matchingResult.houseMatching.house8 },
                                    { house: 12, name: isTamil ? 'பிரிவு/வெளிநாடு' : 'Separation/Foreign', data: matchingResult.houseMatching.house12 }
                                ].map((item) => (
                                    <div key={item.house} className="bg-slate-800/50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold">{item.name} (House {item.house})</span>
                                            <span className="text-yellow-400 font-bold">{item.data.score}/10</span>
                                        </div>
                                        <p className="text-sm text-slate-400">{item.data.details}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dasa-Bhukti Analysis */}
                        <div className="bg-white/5 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4">
                                {isTamil ? 'தசா புத்தி பகுப்பாய்வு' : 'Dasa-Bhukti Analysis'}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-900/30 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm mb-2">Boy's Current Period:</p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {matchingResult.dasaMatching.boyCurrentDasa} Maha Dasa
                                    </p>
                                    <p className="text-sm text-blue-300">
                                        → {matchingResult.dasaMatching.boyCurrentBhukti} Bhukti
                                    </p>
                                </div>
                                <div className="bg-pink-900/30 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm mb-2">Girl's Current Period:</p>
                                    <p className="text-lg font-bold text-pink-400">
                                        {matchingResult.dasaMatching.girlCurrentDasa} Maha Dasa
                                    </p>
                                    <p className="text-sm text-pink-300">
                                        → {matchingResult.dasaMatching.girlCurrentBhukti} Bhukti
                                    </p>
                                </div>
                            </div>

                            {/* 6-8 Warning */}
                            {matchingResult.dasaMatching.sixEightRelationship && (
                                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-3">
                                    <p className="text-red-400 font-bold flex items-center gap-2">
                                        ⚠️ {isTamil ? '6-8 உறவு' : '6-8 Relationship'}
                                    </p>
                                    <p className="text-red-300 text-sm mt-1">
                                        {isTamil
                                            ? 'தற்போதைய தசா கிரகங்கள் 6-8 உறவில் - தொடர்ச்சியான முரண்பாடுகள்'
                                            : 'Current Dasa planets in 6-8 relationship - Constant conflicts expected'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Separation Risk */}
                            {matchingResult.dasaMatching.futureSeparationRisk && (
                                <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 mb-3">
                                    <p className="text-orange-400 font-bold flex items-center gap-2">
                                        ⚠️ {isTamil ? 'பிரிவு அபாயம்' : 'Separation Risk'}
                                    </p>
                                    <p className="text-orange-300 text-sm mt-1">
                                        {isTamil
                                            ? 'இரு தரப்பிலும் பிரிவை ஏற்படுத்தும் தசா காலம்'
                                            : 'Both in separation-prone Dasa periods'
                                        }
                                    </p>
                                </div>
                            )}

                            <p className="text-slate-300 text-sm">{matchingResult.dasaMatching.details}</p>
                            <div className="mt-3">
                                <span className={`px-3 py-1 rounded-full text-sm ${matchingResult.dasaMatching.currentCompatible
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {matchingResult.dasaMatching.currentCompatible
                                        ? '✓ Compatible Timing'
                                        : '✗ Timing Issues'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Future 10 Years Analysis */}
                        {matchingResult.dasaMatching.nextTenYears.length > 0 && (
                            <div className="bg-white/5 rounded-xl p-6">
                                <h3 className="text-xl font-bold mb-4">
                                    {isTamil ? 'அடுத்த 10 வருட தசா பகுப்பாய்வு' : 'Next 10 Years Dasa Analysis'}
                                </h3>

                                {/* Future Problems Summary */}
                                {matchingResult.dasaMatching.futureProblems.length > 0 && (
                                    <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 mb-4">
                                        <h4 className="font-bold text-orange-400 mb-2">
                                            ⚠️ {isTamil ? 'எதிர்கால சவால்கள்' : 'Future Challenges'}
                                        </h4>
                                        <ul className="space-y-2">
                                            {matchingResult.dasaMatching.futureProblems.map((problem, idx) => (
                                                <li key={idx} className={`text-sm ${problem.severity === 'high' ? 'text-red-300' :
                                                    problem.severity === 'medium' ? 'text-orange-300' :
                                                        'text-yellow-300'
                                                    }`}>
                                                    <span className="font-bold">{problem.period}:</span> {problem.issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Year by Year Timeline */}
                                <div className="space-y-2 overflow-x-auto">
                                    <div className="min-w-max">
                                        {matchingResult.dasaMatching.nextTenYears.map((yearData) => (
                                            <div
                                                key={yearData.year}
                                                className={`grid grid-cols-6 gap-2 p-3 rounded-lg mb-2 ${yearData.compatible
                                                    ? 'bg-green-900/20 border border-green-500/30'
                                                    : 'bg-red-900/20 border border-red-500/30'
                                                    }`}
                                            >
                                                <div className="font-bold">
                                                    Year {yearData.year}
                                                </div>
                                                <div className="text-blue-400 text-sm">
                                                    Boy: {yearData.boyMahaDasa}<br />
                                                    <span className="text-xs opacity-75">→ {yearData.boyBhukti}</span>
                                                </div>
                                                <div className="text-pink-400 text-sm">
                                                    Girl: {yearData.girlMahaDasa}<br />
                                                    <span className="text-xs opacity-75">→ {yearData.girlBhukti}</span>
                                                </div>
                                                <div className="col-span-2 text-xs text-slate-300">
                                                    {yearData.issues.length > 0 ? yearData.issues.join(', ') : 'No issues'}
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded text-xs ${yearData.compatible
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {yearData.compatible ? '✓' : '✗'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-6 border border-cyan-500/30">
                            <h3 className="text-xl font-bold mb-4">
                                💡 {isTamil ? 'பரிந்துரைகள்' : 'Recommendations'}
                            </h3>
                            <ul className="space-y-2">
                                {matchingResult.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-cyan-400 mt-1">•</span>
                                        <span className="text-slate-200">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="font-bold text-lg mb-2">
                            {isTamil ? '✨ சுபத்துவம்' : '✨ Quality Matching'}
                        </h3>
                        <p className="text-sm text-slate-300">
                            {isTamil
                                ? 'லக்னம் மற்றும் ராசியின் தன்மை பகுப்பாய்வு'
                                : 'Lagna and Rasi nature analysis'
                            }
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="font-bold text-lg mb-2">
                            {isTamil ? '🏠 வீட்டு பொருத்தம்' : '🏠 House Matching'}
                        </h3>
                        <p className="text-sm text-slate-300">
                            {isTamil
                                ? '2, 5, 7, 8, 12 வீடுகளின் பகுப்பாய்வு'
                                : '2nd, 5th, 7th, 8th, 12th houses analysis'
                            }
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="font-bold text-lg mb-2">
                            {isTamil ? '⏰ தசா காலம்' : '⏰ Dasa Timing'}
                        </h3>
                        <p className="text-sm text-slate-300">
                            {isTamil
                                ? '6-8 உறவு மற்றும் எதிர்கால கணிப்பு'
                                : '6-8 relationship & future prediction'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarriageMatching;
