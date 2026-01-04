import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, Info, Smile, Meh, Frown, Eye } from 'lucide-react';
import { NAKSHATRAS, ZODIAC_SIGNS, TAMIL_RASI_NAMES, PLANET_UNICODE } from '../../utils/constants';
import { getNakshatra, calculateDignity, calculateAspects } from '../../utils/astrology';
import { TAMIL_PLANET_NAMES, TAMIL_NAKSHATRAS } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface PlanetaryPositionsTableProps {
    planets: any[];
    ascendant: any;
}

const PlanetaryPositionsTable: React.FC<PlanetaryPositionsTableProps> = ({ planets, ascendant }) => {
    const { language, t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleSection = () => setIsExpanded(!isExpanded);

    const getDignityIcon = (dignity: string) => {
        switch (dignity) {
            case 'exalted':
            case 'ownSign':
            case 'friend': return <Smile className="w-4 h-4" />;
            case 'debilitated':
            case 'enemy': return <Frown className="w-4 h-4" />;
            default: return <Meh className="w-4 h-4" />;
        }
    };

    const getDignityColor = (dignity: string) => {
        switch (dignity) {
            case 'exalted': return 'text-yellow-400 font-bold bg-yellow-400/10 border-yellow-400/30';
            case 'ownSign': return 'text-green-400 font-semibold bg-green-400/10 border-green-400/30';
            case 'friend': return 'text-blue-300 bg-blue-400/10 border-blue-400/30';
            case 'debilitated': return 'text-red-400 bg-red-400/10 border-red-400/30';
            case 'enemy': return 'text-orange-300 bg-orange-400/10 border-orange-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    const getDignityLabel = (dignity: string) => {
        // Safe access to translation
        const dignityMap: Record<string, string> = t.dignity || {};
        return dignityMap[dignity] || dignity;
    };

    return (
        <div className="glass-panel overflow-hidden border border-slate-700/50 shadow-xl">
            <button
                onClick={toggleSection}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Star className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-200">
                        {t.analysis?.planets || (language === 'ta' ? 'கிரக நிலைகள்' : 'Planetary Positions')}
                    </h3>
                </div>
                {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Mobile View: Cards */}
                        <div className="md:hidden p-4 space-y-4">
                            {/* Ascendant Card */}
                            <div className="bg-slate-800/60 p-4 rounded-xl border border-purple-500/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Star className="w-24 h-24 text-purple-500" />
                                </div>
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🌅</span>
                                        <div>
                                            <h4 className="font-bold text-purple-300">{language === 'ta' ? 'லக்னம் (Lagna)' : 'Ascendant'}</h4>
                                            <p className="text-sm text-slate-300">
                                                {TAMIL_RASI_NAMES[ascendant.signIndex]} ({ZODIAC_SIGNS[ascendant.signIndex]})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-400">Degree</div>
                                        <div className="font-mono text-purple-200">
                                            {Math.floor(ascendant.degree)}° {Math.round((ascendant.degree % 1) * 60)}'
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center relative z-10">
                                    <span className="text-xs text-slate-400">Nakshatra</span>
                                    <span className="text-sm font-medium text-slate-200">
                                        {language === 'ta' ? TAMIL_NAKSHATRAS[getNakshatra(ascendant.longitude).index] : NAKSHATRAS[getNakshatra(ascendant.longitude).index]}
                                    </span>
                                </div>
                            </div>

                            {/* Planet Cards */}
                            {planets.map((planet) => {
                                const nak = getNakshatra(planet.longitude);
                                const dignity = calculateDignity(planet.name, planet.signIndex, planet.degree, planets);
                                const aspects = calculateAspects(planet, planets);
                                const isRetro = planet.isRetro;

                                return (
                                    <div key={planet.name} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl filter drop-shadow-lg">
                                                    {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                                </span>
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                                                        {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                        {isRetro && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wide font-bold">
                                                                Rx
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-xs text-slate-400">
                                                        {TAMIL_RASI_NAMES[planet.signIndex]} ({ZODIAC_SIGNS[planet.signIndex]})
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${getDignityColor(dignity)}`}>
                                                {getDignityIcon(dignity)}
                                                <span className="font-semibold uppercase tracking-wide">{getDignityLabel(dignity)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mt-4 bg-slate-900/30 p-3 rounded-lg">
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Degree</div>
                                                <div className="font-mono text-slate-300">
                                                    {Math.floor(planet.degree)}° {Math.round((planet.degree % 1) * 60)}'
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 mb-1">Nakshatra</div>
                                                <div className="text-slate-300">
                                                    {language === 'ta' ? TAMIL_NAKSHATRAS[nak.index] : NAKSHATRAS[nak.index]}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Aspects Pills */}
                                        {aspects.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {aspects.map((asp, i) => (
                                                    <div key={i} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600/50 flex items-center gap-1">
                                                        <Eye className="w-3 h-3 text-slate-400" />
                                                        <span>{TAMIL_RASI_NAMES[asp.signIndex]} ({asp.type})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>


                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                                        <th className="p-4 pl-6">{t.analysis?.table?.planet || 'Planet'}</th>
                                        <th className="p-4">{t.analysis?.table?.sign || 'Sign'}</th>
                                        <th className="p-4">{t.analysis?.table?.degree || 'Degree'}</th>
                                        <th className="p-4">{t.analysis?.table?.nakshatra || 'Nakshatra'}</th>
                                        <th className="p-4">Dignity</th>
                                        <th className="p-4">Aspects</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {/* Lagna Row - Highlighted */}
                                    <tr className="bg-purple-900/10 hover:bg-purple-900/20 transition-colors group">
                                        <td className="p-4 pl-6 font-bold text-purple-300 flex items-center gap-3">
                                            <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">🌅</span>
                                            {t.chart?.lagna || 'Ascendant'}
                                        </td>
                                        <td className="p-4 text-purple-200">
                                            {TAMIL_RASI_NAMES[ascendant.signIndex]} <span className="text-slate-500 text-xs ml-1">({ZODIAC_SIGNS[ascendant.signIndex]})</span>
                                        </td>
                                        <td className="p-4 font-mono text-purple-200 text-sm">
                                            {Math.floor(ascendant.degree)}° {Math.round((ascendant.degree % 1) * 60)}'
                                        </td>
                                        <td className="p-4 text-purple-200">
                                            {language === 'ta' ? TAMIL_NAKSHATRAS[getNakshatra(ascendant.longitude).index] : NAKSHATRAS[getNakshatra(ascendant.longitude).index]}
                                        </td>
                                        <td className="p-4">-</td>
                                        <td className="p-4">-</td>
                                    </tr>

                                    {planets.map((planet) => {
                                        const nak = getNakshatra(planet.longitude);
                                        const dignity = calculateDignity(planet.name, planet.signIndex, planet.degree, planets);
                                        const aspects = calculateAspects(planet, planets);
                                        const isRetro = planet.isRetro;

                                        return (
                                            <tr key={planet.name} className="hover:bg-slate-800/40 transition-colors group">
                                                <td className="p-4 pl-6 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl w-8 text-center filter drop-shadow text-amber-100 group-hover:scale-110 transition-transform">
                                                            {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                                        </span>
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-200 font-bold">
                                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                            </span>
                                                            {isRetro && (
                                                                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider animate-pulse">
                                                                    {language === 'ta' ? 'வக்ரம்' : 'Retrograde'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-300">
                                                    {TAMIL_RASI_NAMES[planet.signIndex]} <span className="text-slate-500 text-xs ml-1">({ZODIAC_SIGNS[planet.signIndex]})</span>
                                                </td>
                                                <td className="p-4 font-mono text-slate-300 text-sm">
                                                    {Math.floor(planet.degree)}° {Math.round((planet.degree % 1) * 60)}'
                                                </td>
                                                <td className="p-4 text-slate-300">
                                                    {language === 'ta' ? TAMIL_NAKSHATRAS[nak.index] : NAKSHATRAS[nak.index]}
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${getDignityColor(dignity)}`}>
                                                        {getDignityIcon(dignity)}
                                                        <span className="font-semibold uppercase tracking-wide">{getDignityLabel(dignity)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                        {aspects.length > 0 ? aspects.map((asp, i) => (
                                                            <div
                                                                key={i}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 cursor-help transition-transform hover:scale-105 ${asp.strength === 100
                                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                                    }`}
                                                                title={`${language === 'ta' ? TAMIL_RASI_NAMES[asp.signIndex] : ZODIAC_SIGNS[asp.signIndex]} (${asp.type}) - ${asp.strength}%`}
                                                            >
                                                                {TAMIL_RASI_NAMES[asp.signIndex].substring(0, 3)}
                                                            </div>
                                                        )) : <span className="text-slate-600">-</span>}
                                                    </div>
                                                </td>
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
    );
};

export default PlanetaryPositionsTable;
