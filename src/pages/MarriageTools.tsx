import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import ComprehensiveMarriageMatching from './ComprehensiveMarriageMatching';
import MarriageDateFinder from '../components/MarriageDateFinder';

const MarriageTools: React.FC = () => {
    const { language, t } = useLanguage();
    const isTamil = language === 'ta';
    const [searchParams, setSearchParams] = useSearchParams();

    // Check URL param 'tab'. If 'date', show DateFinder. Default to 'match'.
    const initialTab = searchParams.get('tab') === 'date' ? 'dateFinder' : 'matching';
    const [activeTab, setActiveTab] = useState<'matching' | 'dateFinder'>(initialTab);
    const [showConstructionModal, setShowConstructionModal] = useState(false);

    const handleTabChange = (tab: 'matching' | 'dateFinder') => {
        if (tab === 'matching') {
            setShowConstructionModal(true);
        }
        setActiveTab(tab);
        setSearchParams({ tab: tab === 'dateFinder' ? 'date' : 'match' });
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4 relative">
            {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4">
                    {isTamil ? 'திருமண சேவைகள்' : 'Marriage Astrology Services'}
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    {isTamil
                        ? 'உங்கள் திருமண வாழ்க்கைக்கான முழுமையான ஜோதிட தீர்வுகள்'
                        : 'Complete astrological solutions for your marital journey'}
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-md mx-auto mb-12 bg-slate-900/50 p-1 rounded-xl flex items-center justify-center border border-white/10">
                <button
                    onClick={() => handleTabChange('matching')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'matching'
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Heart className="w-4 h-4" />
                    {isTamil ? 'பொருத்தம் பார்க்க' : 'Match Making'}
                </button>
                <button
                    onClick={() => handleTabChange('dateFinder')}
                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'dateFinder'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    {isTamil ? 'திருமண காலம்' : 'Marriage Date Finder'}
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'matching' ? (
                        <motion.div
                            key="matching"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="marriage-matching-embed">
                                <ComprehensiveMarriageMatching embedded={true} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dateFinder"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <MarriageDateFinder />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Construction Modal */}
            <AnimatePresence>
                {showConstructionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowConstructionModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-slate-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-purple-500/20"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/40">
                                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-3">
                                {isTamil ? 'விரைவில் வருகிறது!' : 'Coming Soon!'}
                            </h3>

                            <p className="text-slate-300 mb-6 leading-relaxed">
                                {isTamil
                                    ? 'நாங்கள் இந்த சேவையை மேம்படுத்திக்கொண்டிருக்கிறோம். எனினும், தற்போதைய பதிப்பு செயல்படுகிறது, நீங்கள் அதைப் பயன்படுத்தலாம்!'
                                    : 'We are currently upgrading the Marriage Matching tool to provide the most accurate analysis. However, the current version is fully functional and you can use it now!'}
                            </p>

                            <button
                                onClick={() => setShowConstructionModal(false)}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25"
                            >
                                {isTamil ? 'சரி' : 'Okay, Got it'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarriageTools;
