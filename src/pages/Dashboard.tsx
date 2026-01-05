import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Star, LogOut, User as UserIcon, Trash2, MessageCircle, Sparkles, X, Clock, Activity, MapPin, Search, Filter, MoreVertical, Share2, Download, Copy, Moon, Bell, BellOff } from 'lucide-react';

import GurujiPredictions from '../components/GurujiPredictions';
import GurujiPersonaModal from '../components/GurujiPersonaModal';
import { useAuth } from '../contexts/AuthContext';
import { useChartData } from '../contexts/ChartContext';
import { calculatePlanetaryPositions, getNakshatra } from '../utils/astrology';
import { ZODIAC_SIGNS, TAMIL_RASI_NAMES, NAKSHATRAS, TAMIL_NAKSHATRAS } from '../utils/constants';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import SuccessToast from '../components/SuccessToast';

interface SavedChart {
    id: string;
    name: string;
    dob: Date;
    place: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    dasaAlerts?: boolean;
}

const ChartCard = ({ chart, onDelete, onViewPrediction, onViewPersona, onViewChart, onSubscribe, language, isSubscribed }: any) => {
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const data = calculatePlanetaryPositions(chart.dob, chart.latitude, chart.longitude);
        const moon = data.planets.find((p: any) => p.name === "Moon");
        const moonNak = getNakshatra(moon?.longitude || 0);
        const lagnaNak = getNakshatra(data.ascendant.longitude);
        const rasiIndex = moon?.signIndex || 0;
        const lagnaIndex = data.ascendant.signIndex;

        setDetails({
            rasi: language === 'ta' ? TAMIL_RASI_NAMES[rasiIndex] : ZODIAC_SIGNS[rasiIndex],
            lagna: language === 'ta' ? TAMIL_RASI_NAMES[lagnaIndex] : ZODIAC_SIGNS[lagnaIndex],
            nakshatra: language === 'ta' ? TAMIL_NAKSHATRAS[moonNak.index] : NAKSHATRAS[moonNak.index],
            nakshatraPada: moonNak.pada,
            dateStr: chart.dob.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            })
        });
    }, [chart, language]);

    if (!details) return (
        <div className="bg-slate-900/50 rounded-2xl p-6 h-[400px] animate-pulse flex items-center justify-center border border-white/5">
            <Sparkles className="w-8 h-8 text-slate-700 animate-spin" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col justify-between min-h-[420px]"
        >
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            {/* Header: Name, Subscribe, Delete */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-2xl font-bold text-white truncate leading-tight tracking-tight mb-1" title={chart.name}>
                        {chart.name || "Unknown Name"}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                        <span>{language === 'ta' ? 'உருவாக்கப்பட்டது:' : 'Created:'} {details.dateStr}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 transition-opacity">
                    {/* Subscription Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onSubscribe(chart); }}
                        className={`p-2 rounded-full transition-all duration-300 ${chart.dasaAlerts
                            ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                            : 'text-slate-500 hover:text-white hover:bg-white/10'
                            }`}
                        title={chart.dasaAlerts ? "Disable Alerts" : "Enable Dasa Alerts"}
                    >
                        {chart.dasaAlerts ? <Bell className="w-5 h-5 fill-current" /> : <Bell className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={(e) => onDelete(e, chart.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                        title="Delete Chart"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Key Astrological Details */}
            <div className="space-y-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors group/info">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300 group-hover/info:bg-purple-500 group-hover/info:text-white transition-colors">
                            <Moon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{language === 'ta' ? 'ராசி (Rasi)' : 'Rasi (Moon Sign)'}</p>
                            <p className="text-white font-medium">{details.rasi}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-yellow-500/30 transition-colors group/info">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-300 group-hover/info:bg-yellow-500 group-hover/info:text-slate-900 transition-colors">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{language === 'ta' ? 'நட்சத்திரம்' : 'Nakshatra'}</p>
                            <p className="text-white font-medium">{details.nakshatra} <span className="text-slate-500 text-xs">({details.nakshatraPada})</span></p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-blue-500/30 transition-colors group/info">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300 group-hover/info:bg-blue-500 group-hover/info:text-white transition-colors">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{language === 'ta' ? 'லக்னம் (Lagna)' : 'Lagna (Ascendant)'}</p>
                            <p className="text-white font-medium">{details.lagna}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button
                    onClick={() => onViewChart(chart)}
                    className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 hover:scale-[1.02]"
                >
                    <Activity className="w-4 h-4" />
                    <span>{language === 'ta' ? 'ஜாதகத்தைப் பார்க்க' : 'View Full Chart'}</span>
                </button>

                <button
                    onClick={() => onViewPrediction(chart)}
                    className="relative flex flex-col items-center justify-center p-3 gap-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 group/pred"
                >
                    {/* Notification Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-green-500/20 animate-pulse border border-white/10 z-10">
                        {language === 'ta' ? 'திருமண காலம்?' : 'Marriage Date?'}
                    </div>

                    <Sparkles className="w-5 h-5 text-teal-400 group-hover/pred:text-teal-300 transition-colors" />
                    <span className="text-xs font-medium">{language === 'ta' ? 'எங்கள் கணிப்புகள்' : 'Our Predictions'}</span>
                </button>

                <button
                    onClick={() => onViewPersona(chart)}
                    className="flex flex-col items-center justify-center p-3 gap-1 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                    <UserIcon className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-medium">{language === 'ta' ? 'யார் நான்?' : 'Who Am I?'}</span>
                </button>
            </div>
        </motion.div>
    );
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { setChartData } = useChartData();
    const { t, language } = useLanguage();
    const [charts, setCharts] = useState<SavedChart[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictionData, setPredictionData] = useState<any | null>(null);
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [personaData, setPersonaData] = useState<any | null>(null);
    const [showPersonaModal, setShowPersonaModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [toastState, setToastState] = useState({
        isVisible: false,
        message: '',
        subMessage: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadUserCharts();
    }, [user, navigate]);

    const loadUserCharts = async () => {
        if (!user) return;
        try {
            const chartsRef = collection(db, 'charts');
            const q = query(chartsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const loadedCharts: SavedChart[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                loadedCharts.push({
                    id: doc.id,
                    name: data.name || 'Unnamed Chart',
                    dob: data.birth_details?.dob?.toDate() || new Date(),
                    place: data.birth_details?.place || 'Unknown',
                    latitude: data.birth_details?.latitude || 0,
                    longitude: data.birth_details?.longitude || 0,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    dasaAlerts: data.dasaAlerts || false
                });
            });
            // Sort by Created At Descending
            loadedCharts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setCharts(loadedCharts);
        } catch (error) {
            console.error('Failed to load charts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleDeleteChart = async (e: React.MouseEvent, chartId: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this chart? This action cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'charts', chartId));
            setCharts(charts.filter(c => c.id !== chartId));
        } catch (error) {
            console.error('Error deleting chart:', error);
        }
    };

    const handleSubscribe = async (chart: SavedChart) => {
        if (!user || !user.email) {
            alert("Please ensure you are logged in with a valid email.");
            return;
        }

        const isSubscribed = chart.dasaAlerts;
        const action = isSubscribed ? 'unsubscribe' : 'subscribe';
        const endpoint = isSubscribed
            ? 'http://localhost:5000/api/notifications/unsubscribe-email'
            : 'http://localhost:5000/api/notifications/subscribe-email';

        // Optimistic UI Update
        const updatedCharts = charts.map(c =>
            c.id === chart.id ? { ...c, dasaAlerts: !isSubscribed } : c
        );
        setCharts(updatedCharts);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chartId: chart.id,
                    email: user.email,
                    uid: user.uid,
                    chartName: chart.name
                })
            });

            const data = await response.json();
            if (data.success) {
                // Update Firestore
                const chartRef = doc(db, 'charts', chart.id);
                await updateDoc(chartRef, { dasaAlerts: !isSubscribed });

                if (action === 'subscribe') {
                    setToastState({
                        isVisible: true,
                        message: 'Dasa Alerts Activated! 🌟',
                        subMessage: `You'll receive a welcome email at ${user.email}. We'll notify you of significant changes.`
                    });
                } else {
                    setToastState({
                        isVisible: true,
                        message: 'Unsubscribed Successfully',
                        subMessage: 'You will no longer receive alerts for this chart.'
                    });
                }
            } else {
                // Revert on failure
                setCharts(charts);
                setToastState({
                    isVisible: true,
                    message: 'Subscription Update Failed',
                    subMessage: data.message || 'Please try again later.'
                });
            }
        } catch (err) {
            console.error(err);
            setCharts(charts); // Revert
            setToastState({
                isVisible: true,
                message: 'Connection Error',
                subMessage: 'Failed to connect to server. Please check your internet connection.'
            });
        }
    };

    const handleNewChart = () => {
        navigate('/');
    };

    const handleViewChart = (chart: SavedChart) => {
        try {
            const calculatedData = calculatePlanetaryPositions(chart.dob, chart.latitude, chart.longitude);
            setChartData({
                ...calculatedData,
                userDetails: {
                    name: chart.name,
                    date: chart.dob.toISOString().split('T')[0],
                    time: chart.dob.toTimeString().slice(0, 5),
                    place: chart.place,
                    lat: chart.latitude,
                    lng: chart.longitude,
                    city: chart.place // Add city for consistency
                }
            });
            navigate('/chart');
        } catch (e) {
            console.error("Failed to calculate chart", e);
        }
    };

    const handleShowPrediction = (chart: SavedChart) => {
        const chartData = calculatePlanetaryPositions(chart.dob, chart.latitude, chart.longitude);
        setPredictionData({
            ...chartData,
            userDetails: {
                name: chart.name,
                date: chart.dob.toISOString().split('T')[0],
                time: chart.dob.toTimeString().slice(0, 5),
                city: chart.place,
                lat: chart.latitude,
                lng: chart.longitude
            },
            birthDate: chart.dob
        });
        setShowPredictionModal(true);
    };

    const handleShowPersona = (chart: SavedChart) => {
        const chartData = calculatePlanetaryPositions(chart.dob, chart.latitude, chart.longitude);
        setPersonaData({
            ...chartData,
            chartId: chart.id,
            userDetails: { name: chart.name, place: chart.place },
            birthDetails: {
                date: chart.dob,
                time: chart.dob.toTimeString().slice(0, 5),
                place: chart.place,
                latitude: chart.latitude,
                longitude: chart.longitude,
                nakshatra: 'Unknown' // Will be calculated inside modal if needed
            }
        });
        setShowPersonaModal(true);
    };

    const filteredCharts = charts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="relative z-10 p-6 backdrop-blur-md bg-slate-900/80 border-b border-white/5 sticky top-0">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <Activity className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            {t.dashboard.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search charts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-slate-800 rounded-xl p-1.5 border border-slate-700">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-medium text-slate-300 hidden sm:block pr-2">{user?.displayName || "User"}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-semibold text-slate-300 flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        <span>Saved Charts</span>
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{filteredCharts.length}</span>
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNewChart}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        {t.dashboard.createNew}
                    </motion.button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[400px] bg-slate-900/30 rounded-3xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filteredCharts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Charts Found</h3>
                        <p className="text-slate-400 mb-8 text-center max-w-md">Create your first astrological chart to reveal planetary insights.</p>
                        <button
                            onClick={handleNewChart}
                            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            Create New Chart
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                        {filteredCharts.map((chart) => (
                            <ChartCard
                                key={chart.id}
                                chart={chart}
                                onDelete={handleDeleteChart}
                                onSubscribe={handleSubscribe}
                                onViewChart={handleViewChart}
                                onViewPrediction={handleShowPrediction}
                                onViewPersona={handleShowPersona}
                                language={language}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Prediction Modal */}
            {
                showPredictionModal && predictionData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowPredictionModal(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition z-10"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                            <div className="p-6">
                                <GurujiPredictions data={predictionData} />
                            </div>
                        </motion.div>
                    </div>
                )
            }

            {/* Persona Modal */}
            {
                showPersonaModal && personaData && (
                    <GurujiPersonaModal
                        isOpen={showPersonaModal}
                        onClose={() => setShowPersonaModal(false)}
                        chartData={personaData}
                        birthDetails={personaData.birthDetails}
                        chartId={personaData.chartId}
                    />
                )}
            <SuccessToast
                isVisible={toastState.isVisible}
                onClose={() => setToastState(prev => ({ ...prev, isVisible: false }))}
                message={toastState.message}
                subMessage={toastState.subMessage}
            />
        </div >
    );
};

export default Dashboard;

