import React from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PeriodSelectorProps {
    selectedMaha: string;
    selectedBhukti: string;
    selectedAntaram: string;
    onMahaChange: (planet: string) => void;
    onBhuktiChange: (planet: string) => void;
    onAntaramChange: (planet: string) => void;
}

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const TAMIL_NAMES: Record<string, string> = {
    'Sun': 'சூரியன்',
    'Moon': 'சந்திரன்',
    'Mars': 'செவ்வாய்',
    'Mercury': 'புதன்',
    'Jupiter': 'குரு',
    'Venus': 'சுக்ரன்',
    'Saturn': 'சனி',
    'Rahu': 'ராகு',
    'Ketu': 'கேது'
};

const DasaPeriodSelector: React.FC<PeriodSelectorProps> = ({
    selectedMaha,
    selectedBhukti,
    selectedAntaram,
    onMahaChange,
    onBhuktiChange,
    onAntaramChange
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const getPlanetName = (planet: string) => {
        return isTamil ? (TAMIL_NAMES[planet] || planet) : planet;
    };

    return (
        <div className="glass-panel p-4 rounded-lg border border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {isTamil ? 'காலத்தை தேர்ந்தெடுக்கவும்' : 'Select Period to Analyze'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Maha Dasa Selector */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                        {isTamil ? 'மகா தசை' : 'Maha Dasa'}
                    </label>
                    <select
                        value={selectedMaha}
                        onChange={(e) => onMahaChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none hover:border-purple-400 transition-colors"
                    >
                        {PLANETS.map(planet => (
                            <option key={planet} value={planet}>
                                {getPlanetName(planet)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bhukti Selector */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                        {isTamil ? 'புக்தி' : 'Bhukti'}
                    </label>
                    <select
                        value={selectedBhukti}
                        onChange={(e) => onBhuktiChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none hover:border-pink-400 transition-colors"
                    >
                        {PLANETS.map(planet => (
                            <option key={planet} value={planet}>
                                {getPlanetName(planet)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Antaram Selector */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                        {isTamil ? 'அந்தரம்' : 'Antaram'}
                    </label>
                    <select
                        value={selectedAntaram}
                        onChange={(e) => onAntaramChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none hover:border-blue-400 transition-colors"
                    >
                        {PLANETS.map(planet => (
                            <option key={planet} value={planet}>
                                {getPlanetName(planet)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
                {isTamil ? 'மாற்றங்கள் உடனடியாக பகுப்பாய்வை புதுப்பிக்கும்' : 'Changes will update analysis instantly'}
            </p>
        </div>
    );
};

export default DasaPeriodSelector;
