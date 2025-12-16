import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Star, LogOut, User as UserIcon, Trash2, MessageCircle, Sparkles, X, Clock } from 'lucide-react';

// ... (lines 5-223)


import GurujiPredictions from '../components/GurujiPredictions';
import { useAuth } from '../contexts/AuthContext';
import { useChartData } from '../contexts/ChartContext';
import { calculatePlanetaryPositions } from '../utils/astrology';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';

interface SavedChart {
    id: string;
    name: string;
    dob: Date;
    place: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { setChartData } = useChartData();
    const { t } = useLanguage();
    const [charts, setCharts] = useState<SavedChart[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictionData, setPredictionData] = useState<any | null>(null);
    const [showPredictionModal, setShowPredictionModal] = useState(false);

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
                });
            });

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
        if (!window.confirm('Are you sure you want to delete this chart?')) return;

        try {
            await deleteDoc(doc(db, 'charts', chartId));
            setCharts(charts.filter(c => c.id !== chartId));
        } catch (error) {
            console.error('Error deleting chart:', error);
        }
    };

    const handleNewChart = () => {
        navigate('/');
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

    return (
        <div className="min-h-screen">

            {/* Header */}
            <div className="relative z-10 p-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Star className="w-8 h-8 text-yellow-400" />
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500" style={{ fontFamily: "'Cinzel', serif" }}>
                            {t.dashboard.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-300">
                            <UserIcon className="w-5 h-5" />
                            <span>{user?.displayName || user?.email}</span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition border border-red-500/30"
                        >
                            <LogOut className="w-4 h-4" />
                            {t.dashboard.logout}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                {/* Add New Chart Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewChart}
                        className="flex items-center justify-center gap-3 px-6 py-8 bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:from-yellow-400 hover:to-orange-500 transition shadow-lg shadow-yellow-500/20"
                    >
                        <Plus className="w-6 h-6" />
                        {t.dashboard.createBtn}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/predictions-faq')}
                        className="flex items-center justify-center gap-3 px-6 py-8 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition shadow-lg backdrop-blur-sm"
                    >
                        <MessageCircle className="w-6 h-6 text-purple-400" />
                        Basic Questions & Answers
                    </motion.button>
                </div>

                {/* Charts Grid */}
                {loading ? (
                    <div className="text-center p-12 glass-panel">
                        <Star className="w-12 h-12 mx-auto mb-4 animate-spin text-yellow-400" />
                        <p className="text-slate-300">{t.dashboard.loading}</p>
                    </div>
                ) : charts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-12 backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20"
                    >
                        <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" />
                        <h2 className="text-2xl font-bold text-white mb-2">{t.dashboard.noCharts}</h2>
                        <p className="text-slate-400 mb-6">{t.dashboard.noChartsSub}</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleNewChart}
                            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 font-bold rounded-xl hover:from-yellow-400 hover:to-orange-500 transition"
                        >
                            {t.dashboard.getStarted}
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {charts.map((chart, index) => (
                            <motion.div
                                key={chart.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-yellow-500/50 transition"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                        <Star className="w-6 h-6 text-slate-900" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-xs text-slate-400">
                                            {new Date(chart.createdAt).toLocaleDateString()}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => handleDeleteChart(e, chart.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                            title="Delete Chart"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{chart.name}</h3>

                                <div className="space-y-2 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-yellow-400" />
                                        <span>{new Date(chart.dob).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-400" />
                                        <span>{new Date(chart.dob).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <span>{chart.place}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            const chartData = calculatePlanetaryPositions(chart.dob, chart.latitude, chart.longitude);
                                            setChartData({
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
                                            navigate('/chart');
                                        }}
                                        className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition text-sm font-semibold"
                                    >
                                        {t.dashboard.viewChart}
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleShowPrediction(chart)}
                                        className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition text-sm font-semibold flex items-center justify-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Predictions
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

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
        </div >

    );
};

export default Dashboard;
