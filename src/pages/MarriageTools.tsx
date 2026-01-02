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

    const handleTabChange = (tab: 'matching' | 'dateFinder') => {
        setActiveTab(tab);
        setSearchParams({ tab: tab === 'dateFinder' ? 'date' : 'match' });
    };

    return (
        <div className="min-h-screen pt-20 pb-12 px-4">
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
        </div>
    );
};

export default MarriageTools;
