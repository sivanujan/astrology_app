import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, AlertTriangle, Crown, Activity, Eye, ArrowRight } from 'lucide-react';
import { NAKSHATRAS, ZODIAC_SIGNS, TAMIL_RASI_NAMES } from '../utils/constants';
import {
    getNakshatra,
    calculateDignity,
    checkNeechaBhanga,
    checkParivartana,
    calculateAspects,
    calculateStrength,
    calculateDashaPeriods,
    getCurrentDasha,
    calculateCurrentTransits,
    calculateYogas
} from '../utils/astrology';
import { calculateSubathuvamPavathuvam, calculateHouseSubathuvamPavathuvam } from '../utils/subathuvam';
import { calculateAdityaGurujiSubathuvam, calculateDigbalaAndYogas, getFunctionalNature, generateSpecialPredictions, calculateRahuKetuStrength } from '../utils/adityaGurujiSubathuvam';
// predictionRules imports removed as they are used in RuleBasedPredictions.tsx
import { useLanguage } from '../contexts/LanguageContext';
import { TAMIL_PLANET_NAMES, TAMIL_NAKSHATRAS } from '../utils/translations';
import RuleBasedPredictions from './RuleBasedPredictions';

interface ChartAnalysisProps {
    data: any;
}

const ChartAnalysis: React.FC<ChartAnalysisProps> = ({ data }) => {
    const { t, language } = useLanguage();

    // Lazy load the PDF generator to avoid blocking initial render? 
    // For now simple import is fine.

    const handleDownloadPDF = async () => {
        try {
            const { generatePDF } = await import('../utils/pdfGenerator');

            // Always calculate Dasha periods for PDF to ensure latest data
            let pdfData = { ...data };
            const moon = data.planets.find((p: any) => p.name === 'Moon');
            if (moon && data.userDetails?.date && data.userDetails?.time) {
                const birthDate = new Date(`${data.userDetails.date}T${data.userDetails.time}`);
                if (!isNaN(birthDate.getTime())) {
                    pdfData.dashaPeriods = calculateDashaPeriods(birthDate, moon.longitude);
                    console.log("Calculated Dasha periods for PDF:", pdfData.dashaPeriods?.length);
                } else {
                    console.error("Invalid birth date for Dasha calculation");
                }
            } else {
                console.error("Missing Moon or User Details for Dasha calculation", { moon: !!moon, date: data.userDetails?.date, time: data.userDetails?.time });
            }

            console.log("Generating PDF with data:", { ...pdfData, dashaPeriodsLength: pdfData.dashaPeriods?.length });
            await generatePDF(pdfData, language as 'en' | 'ta');
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (!data) return null;

    const { planets, ascendant } = data;
    const [expandedSection, setExpandedSection] = useState<string | null>('planets');

    // Use shared logic for Yogas
    // 'calculateYogas' is imported at top level.

    const { yogas: rawYogas, doshas: rawDoshas } = calculateYogas(planets, ascendant);


    // Filter/Map for Localization if needed
    // The shared function returns English strings. We can display them as is or map specific names if we have translation keys.
    // For now, let's just use the raw results as they are decently descriptive.
    // Or we can map strict names like "Parivartana Yoga" to `t.advancedYogas.parivartana`

    const yogas = rawYogas.map(y => {
        if (y.name === 'Parivartana Yoga') return { ...y, name: t.advancedYogas.parivartana || y.name };
        if (y.name === 'Neecha Bhanga Raja Yoga') return { ...y, name: t.advancedYogas.neechaBhangaRajaYoga || y.name };
        return y;
    });

    const doshas = rawDoshas;

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const getDignityColor = (dignity: string) => {
        switch (dignity) {
            case 'exalted': return 'text-yellow-400 font-bold';
            case 'ownSign': return 'text-green-400 font-semibold';
            case 'friend': return 'text-blue-300';
            case 'debilitated': return 'text-red-400';
            case 'enemy': return 'text-orange-300';
            default: return 'text-slate-400';
        }
    };

    const getDignityLabel = (dignity: string) => {
        return t.dignity[dignity as keyof typeof t.dignity] || dignity;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    {t.analysis.title}
                </h2>
                <p className="text-slate-400 mb-4">{t.analysis.subtitle}</p>
                <div className="flex justify-center">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        {language === 'ta' ? 'PDF பதிவிறக்கம்' : 'Download PDF'}
                    </button>
                </div>
            </motion.div>

            {/* Planetary Positions Table */}
            <div className="glass-panel overflow-hidden">
                <button
                    onClick={() => toggleSection('planets')}
                    className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold">{t.analysis.planets}</h3>
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
                                            <th className="p-4">{t.analysis.table.planet}</th>
                                            <th className="p-4">{t.analysis.table.sign}</th>
                                            <th className="p-4">{t.analysis.table.degree}</th>
                                            <th className="p-4">{t.analysis.table.nakshatra}</th>
                                            <th className="p-4">Dignity</th>
                                            <th className="p-4">Aspects</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        <tr className="bg-purple-900/10">
                                            <td className="p-4 font-medium text-purple-300">{t.chart.lagna}</td>
                                            <td className="p-4">{TAMIL_RASI_NAMES[ascendant.signIndex]} ({ZODIAC_SIGNS[ascendant.signIndex]})</td>
                                            <td className="p-4">{Math.floor(ascendant.degree)}° {Math.round((ascendant.degree % 1) * 60)}'</td>
                                            <td className="p-4">{language === 'ta' ? TAMIL_NAKSHATRAS[getNakshatra(ascendant.longitude).index] : NAKSHATRAS[getNakshatra(ascendant.longitude).index]}</td>
                                            <td className="p-4">-</td>
                                            <td className="p-4">-</td>
                                        </tr>
                                        {planets.map((planet: any) => {
                                            const nak = getNakshatra(planet.longitude);
                                            const dignity = calculateDignity(planet.name, planet.signIndex, planet.degree, planets);
                                            const aspects = calculateAspects(planet, planets);

                                            return (
                                                <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="p-4 font-medium">
                                                        {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                        {planet.isRetro && (
                                                            <span className="ml-1 text-xs text-red-400 font-bold" title="Vakram (Retrograde)">
                                                                {language === 'ta' ? '(வ)' : '(Rx)'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">{TAMIL_RASI_NAMES[planet.signIndex]} ({ZODIAC_SIGNS[planet.signIndex]})</td>
                                                    <td className="p-4">{Math.floor(planet.degree)}° {Math.round((planet.degree % 1) * 60)}'</td>
                                                    <td className="p-4">{language === 'ta' ? TAMIL_NAKSHATRAS[nak.index] : NAKSHATRAS[nak.index]}</td>
                                                    <td className={`p-4 ${getDignityColor(dignity)}`}>
                                                        {getDignityLabel(dignity)}
                                                    </td>
                                                    <td className="p-4 text-xs">
                                                        {aspects.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {aspects.map((asp, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`px-1.5 py-0.5 rounded text-slate-900 font-medium ${asp.strength === 100 ? 'bg-green-400' : 'bg-yellow-400'
                                                                            }`}
                                                                        title={`${asp.strength}% Strength`}
                                                                    >
                                                                        {TAMIL_RASI_NAMES[asp.signIndex]} ({asp.type})
                                                                        {asp.planets.length > 0 && (
                                                                            <span className="ml-1 opacity-75">
                                                                                [{asp.planets.map(p => language === 'ta' ? TAMIL_PLANET_NAMES[p] : p).join(', ')}]
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : '-'}
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

            {/* Yogas & Doshas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yogas */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold">{t.analysis.yogas}</h3>
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
                        <p className="text-slate-500 italic">{t.analysis.noYogas}</p>
                    )}
                </div>

                {/* Doshas */}
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold">{t.analysis.doshas}</h3>
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
                        <p className="text-slate-500 italic">{t.analysis.noDoshas}</p>
                    )}
                </div>
            </div>

            {/* Rule Based Predictions (Guruji's Q&A) */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <Star className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-bold text-white">{t.predictions?.title || "Guruji's Predictions"}</h3>
                </div>
                <RuleBasedPredictions data={data} language={language as 'en' | 'ta'} />
            </div>

            {/* Subathuvam & Pavathuvam Analysis */}
            <div className="glass-panel p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">{t.subathuvam.title}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                <th className="p-4">{t.analysis.table.planet}</th>
                                <th className="p-4 text-green-400">{t.subathuvam.subathuvam}</th>
                                <th className="p-4 text-red-400">{t.subathuvam.pavathuvam}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {planets.map((planet: any) => {
                                const scores = calculateSubathuvamPavathuvam(planets);
                                const pScores = scores[planet.name];
                                if (!pScores) return null;

                                return (
                                    <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium">
                                            {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${Math.min(pScores.subathuvam.score, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-green-400">{pScores.subathuvam.score}</span>
                                                </div>
                                                {pScores.subathuvam.details.length > 0 && (
                                                    <div className="text-xs text-slate-400">
                                                        {pScores.subathuvam.details.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-red-500"
                                                            style={{ width: `${Math.min(pScores.pavathuvam.score, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-red-400">{pScores.pavathuvam.score}</span>
                                                </div>
                                                {pScores.pavathuvam.details.length > 0 && (
                                                    <div className="text-xs text-slate-400">
                                                        {pScores.pavathuvam.details.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">{t.subathuvam.houseTitle}</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">{t.subathuvam.house}</th>
                                    <th className="p-4 text-green-400">{t.subathuvam.subathuvam}</th>
                                    <th className="p-4 text-red-400">{t.subathuvam.pavathuvam}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((houseNum) => {
                                    const houseScores = calculateHouseSubathuvamPavathuvam(ascendant.signIndex, planets);
                                    const hScores = houseScores[houseNum];
                                    if (!hScores) return null;

                                    return (
                                        <tr key={houseNum} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                House {houseNum}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-500"
                                                                style={{ width: `${Math.min(hScores.subathuvam.score, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-green-400">{hScores.subathuvam.score}</span>
                                                    </div>
                                                    {hScores.subathuvam.details.length > 0 && (
                                                        <div className="text-xs text-slate-400">
                                                            {hScores.subathuvam.details.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-red-500"
                                                                style={{ width: `${Math.min(hScores.pavathuvam.score, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-bold text-red-400">{hScores.pavathuvam.score}</span>
                                                    </div>
                                                    {hScores.pavathuvam.details.length > 0 && (
                                                        <div className="text-xs text-slate-400">
                                                            {hScores.pavathuvam.details.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aditya Guruji Subathuvam Analysis */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">Aditya Guruji Subathuvam Method</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Planet</th>
                                    <th className="p-4 text-center">Rasi Score</th>
                                    <th className="p-4 text-center">Navamsa Score</th>
                                    <th className="p-4 text-center">Total Score</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {planets.map((planet: any) => {
                                    const agScores = calculateAdityaGurujiSubathuvam(planets);
                                    const pScore = agScores[planet.name];
                                    if (!pScore) return null;

                                    return (
                                        <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                {pScore.details.length > 0 && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {pScore.details.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-slate-300">{pScore.rasiScore}</td>
                                            <td className="p-4 text-center text-slate-300">{pScore.navamsaScore}</td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold ${pScore.totalScore >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {pScore.totalScore}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {pScore.isSubathuva ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50">
                                                        Subathuva Planet
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Final Prediction Outcome (Digbala + Subathuvam + Adhipathiyam) */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">Final Prediction Outcome (Digbala + Subathuvam + Adhipathiyam)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Planet</th>
                                    <th className="p-4 text-center">Digbala</th>
                                    <th className="p-4">Prediction Outcome</th>
                                    <th className="p-4">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {planets.map((planet: any) => {
                                    if (['Rahu', 'Ketu'].includes(planet.name)) return null;

                                    const agScores = calculateAdityaGurujiSubathuvam(planets);
                                    const yogaResults = calculateDigbalaAndYogas(planets, data.ascendant.signIndex, agScores);
                                    const result = yogaResults[planet.name];

                                    if (!result) return null;

                                    let statusColor = 'text-slate-400';
                                    if (result.yogaStatus === 'Rajayogam' || result.yogaStatus === 'Jackpot' || result.yogaStatus === 'Good') {
                                        statusColor = 'text-green-400';
                                    } else if (result.yogaStatus === 'Dangerously Strong' || result.yogaStatus === 'Severe Trouble') {
                                        statusColor = 'text-red-400';
                                    }

                                    return (
                                        <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                            </td>
                                            <td className="p-4 text-center">
                                                {result.digbalaStatus !== 'None' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700/30">
                                                        {result.digbalaStatus} ({result.digbalaScore})
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className={`p-4 font-bold ${statusColor}`}>
                                                {result.yogaStatus}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {result.description}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comprehensive Analysis (Functional Status & Special Predictions) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Functional Status Table */}
                    <div>
                        <h4 className="text-md font-semibold text-slate-300 mb-4">Functional Status (Lagna Based)</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="p-4">Planet</th>
                                        <th className="p-4">Nature</th>
                                        <th className="p-4">Roles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {planets.map((planet: any) => {
                                        const functionalNature = getFunctionalNature(data.ascendant.signIndex);
                                        const status = functionalNature[planet.name];
                                        if (!status) return null;

                                        let natureColor = 'text-slate-400';
                                        if (status.nature === 'Yogakaraka' || status.nature === 'Benefic') natureColor = 'text-green-400';
                                        else if (status.nature === 'Malefic' || status.nature === 'Maraka') natureColor = 'text-red-400';

                                        return (
                                            <tr key={planet.name} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-medium">
                                                    {language === 'ta' ? TAMIL_PLANET_NAMES[planet.name] : planet.name}
                                                </td>
                                                <td className={`p-4 font-bold ${natureColor}`}>
                                                    {status.nature}
                                                </td>
                                                <td className="p-4 text-xs text-slate-500">
                                                    {status.roles.join(', ')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Special Predictions */}
                    <div>
                        <h4 className="text-md font-semibold text-slate-300 mb-4">Special Predictions (Subathuvam Filtered)</h4>
                        <div className="space-y-4">
                            {(() => {
                                const agScores = calculateAdityaGurujiSubathuvam(planets);
                                const predictions = generateSpecialPredictions(planets, data.ascendant.signIndex, agScores);

                                if (predictions.length === 0) {
                                    return <div className="text-slate-500 italic p-4">No special placements detected for this chart.</div>;
                                }

                                return predictions.map((pred, idx) => (
                                    <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-purple-400">{pred.planet}</span>
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">{pred.type}</span>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {pred.prediction}
                                        </p>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* Shadow Planet Analysis (Rahu-Ketu) */}
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-slate-300 mb-4">Shadow Planet Analysis (Rahu-Ketu)</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Planet</th>
                                    <th className="p-4 text-center">House Score</th>
                                    <th className="p-4 text-center">Subathuvam</th>
                                    <th className="p-4 text-center">Soodshuma</th>
                                    <th className="p-4 text-center">Total</th>
                                    <th className="p-4">Prediction</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {['Rahu', 'Ketu'].map((planetName) => {
                                    const rkResults = calculateRahuKetuStrength(planets, data.ascendant.signIndex);
                                    const result = rkResults[planetName];
                                    if (!result) return null;

                                    let totalColor = 'text-slate-300';
                                    if (result.totalScore >= 70) totalColor = 'text-green-400';
                                    else if (result.totalScore >= 40) totalColor = 'text-yellow-400';
                                    else totalColor = 'text-red-400';

                                    return (
                                        <tr key={planetName} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-medium">
                                                {language === 'ta' ? TAMIL_PLANET_NAMES[planetName] : planetName}
                                                {result.details.length > 0 && (
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {result.details.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-slate-300">{result.houseScore}</td>
                                            <td className="p-4 text-center text-slate-300">{result.subathuvamScore}</td>
                                            <td className="p-4 text-center text-slate-300">{result.soodshumaScore}</td>
                                            <td className={`p-4 text-center font-bold ${totalColor}`}>
                                                {result.totalScore}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">
                                                {result.prediction}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Guruji's Predictions (FAQ) - Moved to separate page */}
            </div>
        </div>
    );
};

export default ChartAnalysis;
