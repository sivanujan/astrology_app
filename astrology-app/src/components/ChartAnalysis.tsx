import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, AlertTriangle, Crown } from 'lucide-react';
import { NAKSHATRAS, ZODIAC_SIGNS, TAMIL_RASI_NAMES } from '../utils/constants';
import { getNakshatra } from '../utils/astrology';

interface ChartAnalysisProps {
    data: any;
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({ data }) => {
    if (!data) return null;

    const { planets, ascendant } = data;
    const [expandedSection, setExpandedSection] = useState<string | null>('planets');

    // Helper to calculate basic Yogas/Doshas
    const calculateYogas = () => {
        const yogas = [];
        const doshas = [];

        // Simple Gajakesari Yoga (Jupiter in Kendra from Moon) - Simplified check
        // Need house positions relative to Moon.
        const moon = planets.find((p: any) => p.name === 'Moon');
        const jupiter = planets.find((p: any) => p.name === 'Jupiter');

        if (moon && jupiter) {
            const diff = Math.abs(moon.signIndex - jupiter.signIndex);
            if ([0, 3, 6, 9].includes(diff)) {
                yogas.push({ name: 'Gajakesari Yoga', description: 'Indicates wisdom, wealth, and fame.' });
            }
        }

        // Manglik Dosha (Mars in 1, 2, 4, 7, 8, 12 from Ascendant)
        const mars = planets.find((p: any) => p.name === 'Mars');
        if (mars) {
            // Calculate house of Mars relative to Ascendant
            let house = (mars.signIndex - ascendant.signIndex + 12) % 12 + 1;
            if ([1, 2, 4, 7, 8, 12].includes(house)) {
                doshas.push({ name: 'Manglik Dosha', description: 'Mars is in a position that may cause delay or difficulty in marriage.' });
            }
        }

        return { yogas, doshas };
    };

    const { yogas, doshas } = calculateYogas();

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    Detailed Analysis
                </h2>
                <p className="text-slate-400">Planetary Positions & Yogas</p>
            </motion.div>

            {/* Planetary Positions Table */}
            <div className="glass-panel overflow-hidden">
                <button
                    onClick={() => toggleSection('planets')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold">Planetary Positions</h3>
                    </div>
                    {expandedSection === 'planets' ? <ChevronUp /> : <ChevronDown />}
                </button>

                <AnimatePresence>
                    {expandedSection === 'planets' && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                            <th className="p-4">Planet</th>
                                            <th className="p-4">Sign (Rasi)</th>
                                            <th className="p-4">Degree</th>
                                            <th className="p-4">Nakshatra</th>
                                            <th className="p-4">Pada</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        <tr className="bg-purple-900/10">
                                            <td className="p-4 font-medium text-purple-300">Ascendant</td>
                                            <td className="p-4">{TAMIL_RASI_NAMES[ascendant.signIndex]} ({ZODIAC_SIGNS[ascendant.signIndex]})</td>
                                            <td className="p-4">{Math.floor(ascendant.degree)}° {Math.round((ascendant.degree % 1) * 60)}'</td>
                                            <td className="p-4">{NAKSHATRAS[getNakshatra(ascendant.longitude).index]}</td>
                                            <td className="p-4">{getNakshatra(ascendant.longitude).pada}</td>
                                        </tr>
                                        {planets.map((planet: any) => {
                                            const nak = getNakshatra(planet.longitude);
                                            return (
                                                <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4 font-medium">{planet.name}</td>
                                                    <td className="p-4">{TAMIL_RASI_NAMES[planet.signIndex]} ({ZODIAC_SIGNS[planet.signIndex]})</td>
                                                    <td className="p-4">{Math.floor(planet.degree)}° {Math.round((planet.degree % 1) * 60)}'</td>
                                                    <td className="p-4">{NAKSHATRAS[nak.index]}</td>
                                                    <td className="p-4">{nak.pada}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Yogas & Doshas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yogas */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold">Yogas (Fortunes)</h3>
                    </div>
                    {yogas.length > 0 ? (
                        <ul className="space-y-3">
                            {yogas.map((yoga, idx) => (
                                <li key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <div className="font-medium text-yellow-200">{yoga.name}</div>
                                    <div className="text-sm text-slate-400">{yoga.description}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic">No major yogas detected in this simplified analysis.</p>
                    )}
                </div>

                {/* Doshas */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold">Doshas (Challenges)</h3>
                    </div>
                    {doshas.length > 0 ? (
                        <ul className="space-y-3">
                            {doshas.map((dosha, idx) => (
                                <li key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-red-900/30">
                                    <div className="font-medium text-red-300">{dosha.name}</div>
                                    <div className="text-sm text-slate-400">{dosha.description}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 italic">No major doshas detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartAnalysis;
