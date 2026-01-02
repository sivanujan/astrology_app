import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, Clock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PlaceSearch from '../components/PlaceSearch';
import { analyzeMarriageMatchingNew } from '../utils/marriageMatchingMain';

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

const PersonForm: React.FC<{
    person: PersonDetails;
    setPerson: (p: PersonDetails) => void;
    title: string;
    titleTamil: string;
    icon: React.ElementType;
    color: string;
    isTamil: boolean;
}> = ({ person, setPerson, title, titleTamil, icon: Icon, color, isTamil }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-2xl border border-white/10`}
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">{isTamil ? titleTamil : title}</h2>
                <p className="text-sm opacity-75">
                    {isTamil ? 'பிறப்பு விவரங்கள்' : 'Birth Details'}
                </p>
            </div>
        </div>

        <div className="space-y-4">
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
            </div>
        </div>
    </motion.div>
);

const ComprehensiveMarriageMatching: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
    const { language } = useLanguage();
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

    const handleAnalyze = async () => {
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
            const result = await analyzeMarriageMatchingNew(boyDetails, girlDetails);
            // Navigate to results page with data
            navigate('/comprehensive-results', {
                state: {
                    result,
                    boyDetails,
                    girlDetails
                }
            });
        } catch (error) {
            console.error('Error analyzing compatibility:', error);
            alert('Error analyzing compatibility. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className={embedded ? "" : "min-h-screen p-4"}>
            <div className={embedded ? "max-w-7xl mx-auto" : "max-w-7xl mx-auto py-8"}>
                {/* Page Header - Only show if not embedded */}
                {!embedded && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                                {isTamil ? 'விரிவான திருமண பொருத்தம்' : 'Comprehensive Marriage Matching'}
                            </h1>
                            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
                        </div>
                        <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-4">
                            {isTamil
                                ? 'குருஜியின் 7 விதிகள் அடிப்படையில் முழுமையான பகுப்பாய்வு'
                                : 'Complete Analysis Based on Aditya Guruji\'s 7 Rules'}
                        </p>
                        <div className="inline-block bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border border-yellow-500/50 rounded-lg px-4 py-2">
                            <p className="text-sm text-yellow-300">
                                ⭐ {isTamil ? 'புதிய விரிவான அமைப்பு' : 'NEW Comprehensive System'}
                            </p>
                        </div>
                    </motion.div>
                )}

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
                        className="group relative px-12 py-5 bg-gradient-to-r from-yellow-600 via-pink-600 to-purple-600 hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span className="flex items-center gap-3">
                            {analyzing ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isTamil ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    {isTamil ? 'விரிவான பகுப்பாய்வு' : 'Comprehensive Analysis'}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                    {!embedded && (
                        <p className="text-sm text-slate-400 mt-4">
                            {isTamil
                                ? '7 விதிகள் + தசா-புத்தி + முழுமையான மதிப்பீடு'
                                : '7 Rules + Dasa-Bhukti + Complete Evaluation'}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ComprehensiveMarriageMatching;
