import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid, List, Filter, ArrowUpDown,
    TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import HouseAnalysisCard, { HouseData } from './HouseAnalysisCard';
import LagnaSummaryCard from './LagnaSummaryCard';

interface HouseAnalysisDashboardProps {
    houses: HouseData[];
    lagnaSummary: string;
    ascendantSign: string;
    ascendantLord: string;
    lagnaLordPosition?: string;
    lagnaStrength?: number;
    lagnaDescription?: string;
    isLoading?: boolean;
}

type SortOption = 'number' | 'strength' | 'status';
type FilterOption = 'all' | 'strong' | 'weak';

const HouseAnalysisDashboard: React.FC<HouseAnalysisDashboardProps> = ({
    houses,
    lagnaSummary,
    ascendantSign,
    ascendantLord,
    lagnaLordPosition = "Unknown",
    lagnaStrength = 50,
    lagnaDescription = "Moderate",
    isLoading = false
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    // State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<SortOption>('number');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    // Toggle logic
    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // Derived Stats
    const stats = useMemo(() => {
        const strongKeywords = ['Excellent', 'Good', 'Strong', 'Favorable', 'சிறப்பானது', 'நல்லது', 'வலுவானவை', 'மிகச்சிறப்பு', 'நன்று', 'பலமானது'];
        const weakKeywords = ['Weak', 'Critical', 'Challenging', 'Unfavorable', 'பலவீனமான', 'மோசமான', 'கடினம்', 'சவாலான', 'ஆபத்து'];

        const strong = houses.filter(h => strongKeywords.some(k => h.status.includes(k) || h.status === k)).length;
        const weak = houses.filter(h => weakKeywords.some(k => h.status.includes(k) || h.status === k)).length;
        const avg = houses.length - strong - weak;
        return { strong, weak, avg };
    }, [houses]);

    // Filtering & Sorting
    const processedHouses = useMemo(() => {
        let result = [...houses];
        const strongKeywords = ['Excellent', 'Good', 'Strong', 'Favorable', 'சிறப்பானது', 'நல்லது', 'வலுவானவை', 'மிகச்சிறப்பு', 'நன்று', 'பலமானது'];
        const weakKeywords = ['Weak', 'Critical', 'Challenging', 'Unfavorable', 'பலவீனமான', 'மோசமான', 'கடினம்', 'சவாலான', 'ஆபத்து'];

        // Filter
        if (filterBy === 'strong') {
            result = result.filter(h => strongKeywords.some(k => h.status.includes(k) || h.status === k));
        } else if (filterBy === 'weak') {
            result = result.filter(h => weakKeywords.some(k => h.status.includes(k) || h.status === k));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'number') return a.house_number - b.house_number;

            // Helper for strength value
            const getVal = (h: HouseData) => h.strength_score ||
                (strongKeywords.some(k => h.status.includes(k)) ? 80 :
                    weakKeywords.some(k => h.status.includes(k)) ? 30 : 50);

            if (sortBy === 'strength') return getVal(b) - getVal(a); // High to low

            // Status sort (simplified)
            const getStatusRank = (s: string) => {
                if (strongKeywords.some(k => s.includes(k))) return 3;
                if (weakKeywords.some(k => s.includes(k))) return 1;
                return 2;
            };
            return getStatusRank(b.status) - getStatusRank(a.status);
        });

        return result;
    }, [houses, filterBy, sortBy]);

    if (isLoading) return <div className="p-12 text-center text-slate-400">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Lagna Summary Section */}
            <LagnaSummaryCard
                lagnaSummary={lagnaSummary}
                ascendantSign={ascendantSign}
                ascendantLord={ascendantLord}
                lagnaLordPosition={lagnaLordPosition}
                strengthScore={lagnaStrength}
                strengthDescription={lagnaDescription}
            />

            {/* 2. Dashboard Controls & Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-white/5">

                {/* Stats Pills */}
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 font-medium text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 whitespace-nowrap">
                        <CheckCircle className="w-4 h-4" />
                        <span>{isTamil ? "வலுவானவை:" : "Strong:"} {stats.strong}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{isTamil ? "பலவீனமானவை:" : "Weak:"} {stats.weak}</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter Dropdown */}
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                        className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                    >
                        <option value="all">{isTamil ? "அனைத்தும்" : "All Houses"}</option>
                        <option value="strong">{isTamil ? "வலுவானவை" : "Strong Only"}</option>
                        <option value="weak">{isTamil ? "பலவீனமானவை" : "Weak Only"}</option>
                    </select>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-purple-500"
                    >
                        <option value="number">{isTamil ? "வீடு எண்" : "House #"}</option>
                        <option value="strength">{isTamil ? "பலம்" : "Strength"}</option>
                        <option value="status">{isTamil ? "நிலை" : "Status"}</option>
                    </select>
                </div>
            </div>

            {/* 3. House Grid / List */}
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence mode='popLayout'>
                    {processedHouses.map((house) => (
                        <HouseAnalysisCard
                            key={house.house_number}
                            house={house}
                            isExpanded={expandedIds.includes(house.house_number)}
                            onToggle={() => toggleExpand(house.house_number)}
                            showPlanetsAlways={true}
                        />
                    ))}
                </AnimatePresence>

                {processedHouses.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500 italic bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                        {isTamil ? "வீடுகள் எதுவும் இல்லை." : "No houses match the selected filter."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HouseAnalysisDashboard;
