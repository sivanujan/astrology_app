import React from 'react';
import { Shield, ShieldAlert, Zap, Meh, Settings } from 'lucide-react';
import { PLANET_UNICODE } from '../../utils/constants';
import { TAMIL_PLANET_NAMES } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';

interface FunctionalStatusAnalysisProps {
    planets: any[];
    functionalNature: Record<string, { nature: string; roles: string[] }>;
}

const FunctionalStatusAnalysis: React.FC<FunctionalStatusAnalysisProps> = ({ planets, functionalNature }) => {
    const { language, t } = useLanguage();

    const getNatureIcon = (nature: string) => {
        switch (nature) {
            case 'Yogakaraka': return <Zap className="w-4 h-4 text-purple-400" />;
            case 'Benefic': return <Shield className="w-4 h-4 text-green-400" />;
            case 'Malefic': return <ShieldAlert className="w-4 h-4 text-red-400" />;
            case 'Maraka': return <ShieldAlert className="w-4 h-4 text-orange-400" />;
            default: return <Meh className="w-4 h-4 text-slate-400" />;
        }
    };

    const getNatureColor = (nature: string) => {
        switch (nature) {
            case 'Yogakaraka': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Benefic': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Malefic': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Maraka': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="glass-panel p-6 border border-slate-700/50 shadow-xl h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                    <Settings className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">
                    {language === 'ta' ? 'லக்ன ரீதியான செயல்பாடு' : 'Functional Status (Lagna Based)'}
                </h3>
            </div>

            <div className="space-y-3">
                {planets.map((planet) => {
                    const status = functionalNature[planet.name];
                    if (!status) return null;

                    return (
                        <div key={planet.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-xl filter drop-shadow">
                                    {PLANET_UNICODE[planet.name as keyof typeof PLANET_UNICODE]}
                                </span>
                                <span className="font-medium text-slate-300">
                                    {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                </span>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${getNatureColor(status.nature)}`}>
                                    {getNatureIcon(status.nature)}
                                    <span>{status.nature}</span>
                                </div>
                                <div className="text-[10px] text-slate-500">
                                    {status.roles.join(', ')}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FunctionalStatusAnalysis;
