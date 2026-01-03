import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, ArrowRight, Share2, ThumbsUp, ThumbsDown,
    MapPin, Briefcase, Heart, Coins, GraduationCap, Home,
    ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

// --- Interfaces ---
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    reason: string;
    category: 'career' | 'marriage' | 'finance' | 'health' | 'education' | 'travel';
    icon?: React.ReactNode;
    isTiming?: boolean;
}

interface LifeGuidanceSectionProps {
    items: FAQItem[];
    onAskAI: () => void;
}

// --- Helper Components ---

const FAQCard: React.FC<{ item: FAQItem; language: string }> = ({ item, language }) => {
    const isTamil = language === 'ta';
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Initial abstract (first 2-3 sentences)
    const abstract = item.answer.split('.').slice(0, 2).join('.') + '.';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-panel border-l-4 overflow-hidden transition-all duration-300 group
                ${item.category === 'career' ? 'border-l-blue-500 hover:border-blue-400' :
                    item.category === 'marriage' ? 'border-l-rose-500 hover:border-rose-400' :
                        item.category === 'finance' ? 'border-l-emerald-500 hover:border-emerald-400' :
                            item.category === 'travel' ? 'border-l-indigo-500 hover:border-indigo-400' :
                                'border-l-purple-500 hover:border-purple-400'}
            `}
        >
            <div className="p-5">
                {/* Header: Question & Category Icon */}
                <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                        <h3 className="text-lg font-bold text-slate-100 leading-snug flex-1">
                            {item.question}
                        </h3>
                        {item.icon && (
                            <div className="p-2 rounded-lg bg-slate-800/50 text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition">
                                {item.icon}
                            </div>
                        )}
                    </div>

                    {/* Quick Answer Preview */}
                    {!isExpanded && (
                        <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
                            {item.answer}
                        </p>
                    )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-2 border-t border-slate-800/50">
                                {/* "Quick Answer" Label if desired, or just text */}
                                <div className="mb-4">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        {isTamil ? "பதில்:" : "Answer:"}
                                    </span>
                                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                        {item.answer}
                                    </p>
                                </div>

                                {/* Reasoning Section */}
                                <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-800/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {isTamil ? "ஜோதிட காரணம்:" : "Astrological Basis:"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 italic leading-relaxed">
                                        {item.reason}
                                    </p>
                                </div>

                                {/* Action Buttons (Visual only for now) */}
                                <div className="flex justify-between items-center mt-4 pt-2">
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-slate-500 hover:text-green-400 hover:bg-green-500/10 rounded transition">
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition">
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/predictions', { state: { initialMessage: `I want to know more about: ${item.question}` } });
                                        }}
                                        className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                                    >
                                        {isTamil ? "மேலும் கேட்க" : "Ask Follow-up"} <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expansion Toggle (Visual Cue) */}
                <div onClick={() => setIsExpanded(!isExpanded)} className="flex justify-center mt-2 cursor-pointer opacity-50 hover:opacity-100 transition">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
            </div>
        </motion.div>
    );
};


const LifeGuidanceSection: React.FC<LifeGuidanceSectionProps> = ({ items, onAskAI }) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Filter Logic
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const qText = item.question || "";
            const aText = item.answer || "";
            const matchesSearch = qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                aText.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [items, searchQuery, activeFilter]);

    // Categories for Chips
    const filters = [
        { id: 'all', labelEn: 'All', labelTa: 'அனைத்தும்' },
        { id: 'career', labelEn: 'Career', labelTa: 'தொழில்' },
        { id: 'marriage', labelEn: 'Marriage', labelTa: 'திருமணம்' },
        { id: 'finance', labelEn: 'Wealth', labelTa: 'செல்வம்' },
        { id: 'travel', labelEn: 'Travel', labelTa: 'வெளிநாடு' },
        // { id: 'health', labelEn: 'Health', labelTa: 'ஆரோக்கியம்' } // Optional if we have health Qs
    ];

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-slate-800/50">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={isTamil ? "கேள்விகளைத் தேடுக..." : "Search questions..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-inner"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-wrap">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors
                                ${activeFilter === filter.id
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'}
                            `}
                        >
                            {isTamil ? filter.labelTa : filter.labelEn}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <FAQCard key={item.id} item={item} language={language} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{isTamil ? "கேள்விகள் எதுவும் இல்லை" : "No questions found matching your search."}</p>
                        <button
                            onClick={onAskAI}
                            className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium underline"
                        >
                            {isTamil ? "AI ஜோதிடரிடம் கேட்கவும்" : "Ask the AI Astrologer"}
                        </button>
                    </div>
                )}
            </div>

            {/* AI Chat Prompt (Bottom Card) */}
            <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-6 border border-white/5 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition pointer-events-none">
                    <Sparkles className="w-32 h-32" />
                </div>

                <h3 className="text-lg font-bold text-slate-200 mb-2">
                    {isTamil ? "வேறு கேள்விகள் உள்ளதா?" : "Have more questions?"}
                </h3>
                <p className="text-slate-400 text-sm mb-4 max-w-lg mx-auto">
                    {isTamil
                        ? "உங்கள் ஜாதகத்தைப் பற்றி தனிப்பட்ட கேள்விகளைக் கேட்க AI ஜோதிடரைப் பயன்படுத்தவும்."
                        : "Ask our AI Astrologer anything specific about your chart, relationships, or career."}
                </p>

                <button
                    onClick={onAskAI}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg shadow-purple-900/20 active:scale-95"
                >
                    <Sparkles className="w-4 h-4" />
                    {isTamil ? "AI ஜோதிடரிடம் கேட்க" : "Chat with AI Astrologer"}
                </button>
            </div>
        </div>
    );
};

export default LifeGuidanceSection;
