import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TAMIL_RASI_NAMES, PLANET_SYMBOLS } from '../utils/constants';
import { TAMIL_PLANET_ABBREVIATIONS, TAMIL_PLANET_NAMES } from '../utils/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { getNavamsaChartData } from '../utils/astrology';

import ChartGrid from './ChartGrid';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Save, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import ShareModal from './ShareModal';
import { ShareData } from '../utils/shareUtils';

interface SouthIndianChartProps {
    data: any;
}

const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ data }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [saving, setSaving] = React.useState(false);
    const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error' | 'exists'>('idle');
    const [showShareModal, setShowShareModal] = React.useState(false);

    const handleSaveChart = async () => {
        if (!user || !data) return;

        setSaving(true);
        setSaveStatus('idle');

        try {
            // Check for duplicates
            const chartsRef = collection(db, 'charts');
            const q = query(
                chartsRef,
                where('userId', '==', user.uid),
                where('birth_details.dob', '==', data.birthDate),
                where('birth_details.place', '==', data.userDetails.city)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setSaveStatus('exists');
                setTimeout(() => setSaveStatus('idle'), 3000);
                return;
            }

            await addDoc(collection(db, 'charts'), {
                userId: user.uid,
                name: data.userDetails.name,
                birth_details: {
                    dob: data.birthDate,
                    place: data.userDetails.city,
                    latitude: data.userDetails.lat,
                    longitude: data.userDetails.lng
                },
                createdAt: serverTimestamp()
            });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Error saving chart:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const navamsaData = useMemo(() => getNavamsaChartData(data), [data]);

    // Sync URL with state
    React.useEffect(() => {
        if (data && data.userDetails) {
            const params = new URLSearchParams(window.location.search);
            if (!params.has('n')) {
                import('../utils/urlUtils').then(({ generateSingleChartShareLink }) => {
                    // We just need the query string really
                    const link = generateSingleChartShareLink('/chart', {
                        name: data.userDetails.name,
                        date: data.userDetails.date,
                        time: data.userDetails.time,
                        lat: data.userDetails.lat,
                        lng: data.userDetails.lng,
                        place: data.userDetails.city
                    });
                    // Extract query part
                    const query = link.split('?')[1];
                    if (query) {
                        const newUrl = `${window.location.pathname}?${query}`;
                        window.history.replaceState({ ...window.history.state }, '', newUrl);
                    }
                });
            }
        }
    }, [data]);

    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    {t.chart.title}
                </h2>
                <p className="text-slate-400">
                    {data.userDetails.name} • {new Date(data.userDetails.date).toLocaleDateString()}
                </p>
            </motion.div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareData={{
                    name: data.userDetails.name,
                    lagna: TAMIL_RASI_NAMES[data.ascendant.signIndex],
                    moonSign: TAMIL_RASI_NAMES[data.planets.find((p: any) => p.name === 'Moon')?.signIndex || 0],
                    birthDate: new Date(data.userDetails.date).toLocaleDateString(),
                    birthTime: data.userDetails.time,
                    birthPlace: data.userDetails.city
                }}
            />

            {user && (
                <div className="flex justify-end gap-3 mb-4 px-4">
                    {/* Share Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                    >
                        <Share2 className="w-4 h-4" />
                        Share Chart
                    </motion.button>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveChart}
                        disabled={saving || saveStatus === 'success'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-lg ${saveStatus === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : saveStatus === 'error'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : saveStatus === 'exists'
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                            }`}
                    >
                        {saveStatus === 'success' ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Saved!
                            </>
                        ) : saveStatus === 'error' ? (
                            <>
                                <AlertCircle className="w-4 h-4" />
                                Failed to Save
                            </>
                        ) : saveStatus === 'exists' ? (
                            <>
                                <AlertCircle className="w-4 h-4" />
                                Already Saved
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Chart'}
                            </>
                        )}
                    </motion.button>
                </div>
            )}

            <div id="chart-container" className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start justify-items-center">
                {/* Rasi Chart */}
                <ChartGrid
                    title="Rasi Chart (D1)"
                    planets={data.planets}
                    ascendant={data.ascendant}
                    onCenterContent={() => (
                        <div className="text-center p-4">
                            <div className="text-4xl font-serif text-slate-700 opacity-20 mb-2">ॐ</div>
                            <div className="text-sm text-slate-500">{t.chart.lagna}: {TAMIL_RASI_NAMES[data.ascendant.signIndex]}</div>
                            <div className="text-xs text-slate-600 mt-1">
                                {Math.floor(data.ascendant.degree)}° {Math.round((data.ascendant.degree % 1) * 60)}'
                            </div>
                        </div>
                    )}
                />

                {/* Navamsa Chart */}
                {navamsaData && (
                    <ChartGrid
                        title="Navamsa Chart (D9)"
                        planets={navamsaData.planets}
                        ascendant={navamsaData.ascendant}
                        onCenterContent={() => (
                            <div className="text-center p-4">
                                <div className="text-4xl font-serif text-slate-700 opacity-20 mb-2">D9</div>
                                <div className="text-sm text-slate-500">Navamsa</div>
                            </div>
                        )}
                    />
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    {t.chart.note}
                </p>
            </div>
        </div >
    );
};

export default SouthIndianChart;
