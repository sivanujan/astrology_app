import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Lightbulb, Calendar, Heart, Home, Briefcase, DollarSign, Activity } from 'lucide-react';
import { DasaPredictions as Predictions, KeyEvent, Warning, DosAndDonts, LuckyFactors } from '../utils/dasaPredictions';
import { useLanguage } from '../contexts/LanguageContext';

interface DasaPredictionsProps {
    predictions: Predictions;
    keyEvents: KeyEvent[];
    warnings: Warning[];
    dosAndDonts: DosAndDonts;
    luckyFactors: LuckyFactors;
}

const DasaPredictionsComponent: React.FC<DasaPredictionsProps> = ({
    predictions,
    keyEvents,
    warnings,
    dosAndDonts,
    luckyFactors
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const lifeAreas = [
        { icon: Briefcase, label: isTamil ? 'தொழில்' : 'Career', prediction: predictions.career },
        { icon: DollarSign, label: isTamil ? 'செல்வம்' : 'Wealth', prediction: predictions.wealth },
        { icon: Heart, label: isTamil ? 'திருமணம்' : 'Marriage', prediction: predictions.marriage },
        { icon: Activity, label: isTamil ? 'உடல்நலம்' : 'Health', prediction: predictions.health },
        { icon: Home, label: isTamil ? 'குடும்பம்' : 'Family', prediction: predictions.family }
    ];

    return (
        <div className="space-y-6">
            {/* Overall Prediction */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-lg border border-purple-500/30"
            >
                <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    {isTamil ? 'ஒட்டுமொத்த முன்னறிவிப்பு' : 'Overall Prediction'}
                </h3>
                <p className="text-slate-200 leading-relaxed">{predictions.overall}</p>
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-slate-300 italic">{predictions.advice}</p>
                </div>
            </motion.div>

            {/* Life Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lifeAreas.map((area, idx) => (
                    <motion.div
                        key={area.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel p-4 rounded-lg border border-slate-700/50"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-600/20 rounded-lg">
                                <area.icon className="w-5 h-5 text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-purple-300">{area.label}</h4>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">{area.prediction}</p>
                    </motion.div>
                ))}
            </div>

            {/* Key Events */}
            {keyEvents.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-lg border border-green-500/30"
                >
                    <h3 className="text-lg font-bold text-green-300 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {isTamil ? 'முக்கிய நிகழ்வுகள்' : 'Key Events'}
                    </h3>
                    <div className="space-y-3">
                        {keyEvents.map((event, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-green-900/10 rounded-lg border border-green-700/30">
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-green-300">{event.area}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${event.probability === 'High' ? 'bg-green-600/30 text-green-300' :
                                            event.probability === 'Medium' ? 'bg-yellow-600/30 text-yellow-300' :
                                                'bg-blue-600/30 text-blue-300'
                                            }`}>
                                            {event.probability === 'High' ? (isTamil ? 'அதிகம்' : 'High') :
                                                event.probability === 'Medium' ? (isTamil ? 'நடுத்தரம்' : 'Medium') :
                                                    (isTamil ? 'குறைவு' : 'Low')}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm">{event.prediction}</p>
                                    <p className="text-slate-500 text-xs mt-1">{isTamil ? 'நேரம்' : 'Timing'}: {event.timing}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-lg border border-orange-500/30"
                >
                    <h3 className="text-lg font-bold text-orange-300 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {isTamil ? 'எச்சரிக்கைகள்' : 'Warnings'}
                    </h3>
                    <div className="space-y-3">
                        {warnings.map((warning, idx) => (
                            <div key={idx} className="p-3 bg-orange-900/10 rounded-lg border border-orange-700/30">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-orange-300">{warning.area}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${warning.severity === 'High' ? 'bg-red-600/30 text-red-300' :
                                                warning.severity === 'Medium' ? 'bg-orange-600/30 text-orange-300' :
                                                    'bg-yellow-600/30 text-yellow-300'
                                                }`}>
                                                {warning.severity === 'High' ? (isTamil ? 'அதிகம்' : 'High') :
                                                    warning.severity === 'Medium' ? (isTamil ? 'நடுத்தரம்' : 'Medium') :
                                                        (isTamil ? 'குறைவு' : 'Low')}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm">{warning.issue}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Do's */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-5 rounded-lg border border-green-500/30"
                >
                    <h4 className="font-bold text-green-300 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {isTamil ? 'செய்ய வேண்டியவை' : "Do's"}
                    </h4>
                    <ul className="space-y-2">
                        {dosAndDonts.do.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                                <span className="text-green-400 mt-0.5">✓</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Don'ts */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-panel p-5 rounded-lg border border-red-500/30"
                >
                    <h4 className="font-bold text-red-300 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {isTamil ? 'செய்யக் கூடாதவை' : "Don'ts"}
                    </h4>
                    <ul className="space-y-2">
                        {dosAndDonts.dont.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                                <span className="text-red-400 mt-0.5">✗</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>

            {/* Lucky Factors */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 rounded-lg border border-yellow-500/30"
            >
                <h3 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2">
                    ✨ {isTamil ? 'அதிர்ஷ்ட காரணிகள்' : 'Lucky Factors'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-slate-400 text-sm mb-2">{isTamil ? 'நாட்கள்' : 'Days'}</p>
                        {luckyFactors.days.map((day, idx) => (
                            <div key={idx} className="text-yellow-300 font-medium">{day}</div>
                        ))}
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-2">{isTamil ? 'நிறங்கள்' : 'Colors'}</p>
                        {luckyFactors.colors.map((color, idx) => (
                            <div key={idx} className="text-yellow-300 font-medium">{color}</div>
                        ))}
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-2">{isTamil ? 'திசைகள்' : 'Directions'}</p>
                        {luckyFactors.directions.map((direction, idx) => (
                            <div key={idx} className="text-yellow-300 font-medium">{direction}</div>
                        ))}
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-2">{isTamil ? 'எண்கள்' : 'Numbers'}</p>
                        <div className="text-yellow-300 font-medium">
                            {luckyFactors.numbers.join(', ')}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DasaPredictionsComponent;
