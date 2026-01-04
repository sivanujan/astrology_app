import React from 'react';
import { Home, Sparkles, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface HouseStrengthAnalysisProps {
    houseScores: Record<number, {
        subathuvam: { score: number; details: string[] };
        pavathuvam: { score: number; details: string[] };
    }>;
}

const HouseStrengthAnalysis: React.FC<HouseStrengthAnalysisProps> = ({ houseScores }) => {
    const { language, t } = useLanguage();

    const getHouseName = (num: number) => {
        const tamilNames = [
            'லக்னம் (உடல்)', 'தனம் (குடும்பம்)', 'தைரியம் (உடன்பிறப்பு)', 'சுகம் (தாய்/வீடு)',
            'பூர்வ புண்ணியம்', 'ருண ரோக சத்ரு', 'களத்திரம் (வாழ்க்கை துணை)', 'ஆயுள் (கஷ்டம்)',
            'பாக்யம் (தந்தை)', 'தொழில் (கர்மா)', 'லாபம்', 'விரையம்'
        ];
        const englishNames = [
            'Lagna (Self)', 'Wealth (Family)', 'Courage (Siblings)', 'Comforts (Mother)',
            'Creativity (Children)', 'Enemies/Debt', 'Spouse (Partner)', 'Longevity',
            'Fortune (Father)', 'Career (Karma)', 'Gains', 'Losses'
        ];
        return language === 'ta' ? tamilNames[num - 1] : englishNames[num - 1];
    };

    return (
        <div className="glass-panel p-6 mt-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Home className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-purple-200">
                        {t.subathuvam?.houseTitle || (language === 'ta' ? 'பாவ ஆதிபத்தியச் சுபத்துவம்' : 'House Strength Analysis')}
                    </h3>
                    <p className="text-xs text-slate-400">
                        {language === 'ta' ? '12 பாவங்களின் சுப/பாவ வலிமை' : 'Strength analysis of 12 Houses'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
                    const scores = houseScores[houseNum];
                    if (!scores) return null;

                    const subScore = scores.subathuvam.score;
                    const pavScore = scores.pavathuvam.score;
                    const isBenefic = subScore > pavScore;
                    const maxScore = 100; // Assuming 100 is visual max

                    // Specific Color Logic derived from house number purely for visual variety? No, keep meaning.
                    // Green for Good, Red for Bad.

                    const progress = Math.min(Math.max(subScore, pavScore), 100);
                    const strokeColor = isBenefic ? '#4ade80' : '#f87171'; // green-400 : red-400

                    return (
                        <div key={houseNum} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-all flex items-center justify-between group">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded text-xs font-bold text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200 transition-colors">
                                        {houseNum}
                                    </span>
                                    <h4 className="font-bold text-sm text-slate-200 truncate pr-2" title={getHouseName(houseNum)}>
                                        {getHouseName(houseNum).split('(')[0]}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    {isBenefic ? (
                                        <span className="text-green-400 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            {subScore}
                                        </span>
                                    ) : (
                                        <span className="text-red-400 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {pavScore}
                                        </span>
                                    )}
                                    <span className="text-slate-600">|</span>
                                    <span className="text-slate-500 text-[10px] truncate max-w-[80px]">
                                        {getHouseName(houseNum).match(/\(([^)]+)\)/)?.[1] || ''}
                                    </span>
                                </div>
                            </div>

                            {/* Circular Progress Micro-Chart */}
                            <div className="relative w-12 h-12 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="24" cy="24" r="18"
                                        className="stroke-slate-800 fill-none"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="24" cy="24" r="18"
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth="4"
                                        strokeDasharray={`${(progress / 100) * 113} 113`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                    {isBenefic ? 'S' : 'P'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HouseStrengthAnalysis;
