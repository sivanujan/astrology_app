import React from 'react';
import { Crown, AlertTriangle, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface YogaDoshaAnalysisProps {
    yogas: Array<{ name: string; description: string }>;
    doshas: Array<{ name: string; description: string }>;
}

const YogaDoshaAnalysis: React.FC<YogaDoshaAnalysisProps> = ({ yogas, doshas }) => {
    const { language, t } = useLanguage();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Yogas Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Crown className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-yellow-100">{t.analysis?.yogas || (language === 'ta' ? 'யோகங்கள்' : 'Yogas')}</h3>
                        <p className="text-xs text-yellow-500/70">
                            {language === 'ta' ? 'உங்கள் ஜாதகத்தில் உள்ள அதிர்ஷ்ட அமைப்புகள்' : 'Lucky combinations in your chart'}
                        </p>
                    </div>
                </div>

                {yogas.length > 0 ? (
                    <div className="space-y-4">
                        {yogas.map((yoga, idx) => (
                            <div key={idx} className="group relative bg-slate-900/60 p-5 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:bg-slate-800/60">
                                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400/20 animate-pulse" />
                                </div>
                                <h4 className="font-bold text-lg text-yellow-200 mb-2">{yoga.name}</h4>
                                <div className="space-y-2">
                                    {yoga.description.split('. ').map((point, i) => (
                                        point.trim() && (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle className="w-3.5 h-3.5 text-yellow-500/50 mt-1 flex-shrink-0" />
                                                <span>{point.trim()}{point.endsWith('.') ? '' : '.'}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-yellow-500/10 flex justify-between items-center text-xs">
                                    <span className="text-slate-500">{language === 'ta' ? 'வலிமை:' : 'Strength:'}</span>
                                    <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-300 rounded border border-yellow-400/20">
                                        {language === 'ta' ? 'மிகவும் நன்று' : 'Very Good'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                        <p className="text-slate-500 italic">{t.analysis?.noYogas || (language === 'ta' ? 'குறிப்பிடத்தக்க யோகங்கள் இல்லை' : 'No major yogas found')}</p>
                    </div>
                )}
            </div>

            {/* Doshas Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-100">{t.analysis?.doshas || (language === 'ta' ? 'தோஷங்கள்' : 'Doshas')}</h3>
                        <p className="text-xs text-red-400/70">
                            {language === 'ta' ? 'கவனிக்க வேண்டிய அமைப்புகள்' : 'Combinations to be aware of'}
                        </p>
                    </div>
                </div>

                {doshas.length > 0 ? (
                    <div className="space-y-4">
                        {doshas.map((dosha, idx) => (
                            <div key={idx} className="group bg-slate-900/60 p-5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all hover:bg-slate-800/60">
                                <h4 className="font-bold text-lg text-red-300 mb-2">{dosha.name}</h4>
                                <div className="space-y-2">
                                    {dosha.description.split('. ').map((point, i) => (
                                        point.trim() && (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-1.5 flex-shrink-0" />
                                                <span>{point.trim()}{point.endsWith('.') ? '' : '.'}</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-red-500/10">
                                    <div className="flex items-center gap-2 text-xs text-red-300">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>{language === 'ta' ? ' பரிகாரங்கள் தேவைப்படலாம்' : 'Remedies may be required'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-green-500/5 rounded-xl border border-green-500/20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                        <ShieldCheck className="w-16 h-16 text-green-400 mb-4 relative z-10" />
                        <h4 className="text-xl font-bold text-green-300 relative z-10">
                            {language === 'ta' ? 'சிறப்பான அமைப்பு!' : 'Excellent!'}
                        </h4>
                        <p className="text-green-200/70 mt-2 relative z-10">
                            {t.analysis?.noDoshas || (language === 'ta' ? 'தோஷங்கள் எதுவும் காணப்படவில்லை.' : 'No major doshas found.')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YogaDoshaAnalysis;
