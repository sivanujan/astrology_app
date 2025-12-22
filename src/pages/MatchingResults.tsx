import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, CheckCircle, XCircle, AlertTriangle, Download, Share2, FileText, Image as ImageIcon, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MatchingResult } from '../utils/marriageMatching';
import {
    generateMatchingSummaryText,
    downloadMatchingResultsAsImage,
    shareMatchingResults,
    shareViaWhatsApp,
    copyToClipboard
} from '../utils/matchingResultsShare';
import { generateMarriageMatchingPDF } from '../utils/marriageMatchingPDF';

const MatchingResults: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const [downloading, setDownloading] = useState(false);
    const [sharing, setSharing] = useState(false);

    const result = location.state?.result as MatchingResult;
    const boyName = location.state?.boyName || 'Boy';
    const girlName = location.state?.girlName || 'Girl';
    const boyChart = location.state?.boyChart || null;
    const girlChart = location.state?.girlChart || null;

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl mb-4">No matching results found</p>
                    <button
                        onClick={() => navigate('/marriage-matching')}
                        className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/marriage-matching')}
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {isTamil ? 'திரும்பிச் செல்' : 'Back to Matching'}
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <Heart className="w-8 h-8 text-pink-500" />
                        <h1 className="text-4xl font-bold">
                            {isTamil ? 'திருமண பொருத்த முடிவுகள்' : 'Marriage Matching Results'}
                        </h1>
                    </div>
                    <p className="text-slate-400">
                        {boyName} ♂ & {girlName} ♀
                    </p>

                    {/* Share/Download Buttons */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <button
                            onClick={async () => {
                                setDownloading(true);
                                try {
                                    generateMarriageMatchingPDF(boyName, girlName, boyChart, girlChart, result, isTamil);
                                } catch (error) {
                                    console.error('Error downloading PDF:', error);
                                    alert('Error downloading PDF');
                                } finally {
                                    setDownloading(false);
                                }
                            }}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <FileText className="w-5 h-5" />
                            {downloading ? 'Downloading...' : (isTamil ? 'PDF பதிவிறக்கம்' : 'Download PDF')}
                        </button>

                        <button
                            onClick={async () => {
                                setDownloading(true);
                                try {
                                    await downloadMatchingResultsAsImage('results-container', boyName, girlName);
                                } catch (error) {
                                    console.error('Error downloading image:', error);
                                    alert('Error downloading image');
                                } finally {
                                    setDownloading(false);
                                }
                            }}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <ImageIcon className="w-5 h-5" />
                            {downloading ? 'Downloading...' : (isTamil ? 'படம் பதிவிறக்கம்' : 'Download Image')}
                        </button>

                        <button
                            onClick={async () => {
                                setSharing(true);
                                try {
                                    const text = generateMatchingSummaryText(boyName, girlName, result, isTamil);
                                    await shareMatchingResults(
                                        text,
                                        isTamil ? 'திருமண பொருத்த முடிவுகள்' : 'Marriage Matching Results'
                                    );
                                } catch (error) {
                                    console.error('Error sharing:', error);
                                } finally {
                                    setSharing(false);
                                }
                            }}
                            disabled={sharing}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Share2 className="w-5 h-5" />
                            {sharing ? 'Sharing...' : (isTamil ? 'பகிர்' : 'Share')}
                        </button>

                        <button
                            onClick={() => {
                                const text = generateMatchingSummaryText(boyName, girlName, result, isTamil);
                                shareViaWhatsApp(text);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                        >
                            <span className="text-xl">📱</span>
                            {isTamil ? 'WhatsApp' : 'WhatsApp'}
                        </button>
                    </div>
                </motion.div>

                {/* Results Container for Screenshot */}
                <div id="results-container">

                    {/* Chart Info Cards - Lagna & Rasi */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Boy's Chart Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-6 border border-blue-500/30"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-2xl">♂</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-blue-400">{boyName}</h3>
                                    <p className="text-sm text-slate-400">{isTamil ? 'மாப்பிள்ளை' : 'Groom'}</p>
                                </div>
                            </div>
                            {boyChart && boyChart.ascendant && boyChart.moonSign ? (
                                <div className="space-y-3">
                                    <div className="bg-blue-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'லக்னம்' : 'Lagna (Ascendant)'}</p>
                                        <p className="text-lg font-bold text-blue-300">{String(boyChart.ascendant)}</p>
                                    </div>
                                    <div className="bg-blue-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'ராசி' : 'Rasi (Moon Sign)'}</p>
                                        <p className="text-lg font-bold text-blue-300">{String(boyChart.moonSign)}</p>
                                    </div>
                                    <div className="bg-blue-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'தன்மை' : 'Nature'}</p>
                                        <p className="text-md font-semibold text-blue-300">{result.lagnaAnalysis.boyType}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-blue-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'தன்மை' : 'Nature'}</p>
                                        <p className="text-md font-semibold text-blue-300">{result.lagnaAnalysis.boyType}</p>
                                    </div>
                                    <p className="text-sm text-slate-400">{isTamil ? 'விவரங்கள் கணக்கிடப்படுகின்றன' : 'Chart details being calculated'}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Girl's Chart Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 rounded-xl p-6 border border-pink-500/30"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                                    <span className="text-2xl">♀</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-pink-400">{girlName}</h3>
                                    <p className="text-sm text-slate-400">{isTamil ? 'பெண்' : 'Bride'}</p>
                                </div>
                            </div>
                            {girlChart && girlChart.ascendant && girlChart.moonSign ? (
                                <div className="space-y-3">
                                    <div className="bg-pink-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'லக்னம்' : 'Lagna (Ascendant)'}</p>
                                        <p className="text-lg font-bold text-pink-300">{String(girlChart.ascendant)}</p>
                                    </div>
                                    <div className="bg-pink-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'ராசி' : 'Rasi (Moon Sign)'}</p>
                                        <p className="text-lg font-bold text-pink-300">{String(girlChart.moonSign)}</p>
                                    </div>
                                    <div className="bg-pink-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'தன்மை' : 'Nature'}</p>
                                        <p className="text-md font-semibold text-pink-300">{result.lagnaAnalysis.girlType}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-pink-900/30 rounded-lg p-3">
                                        <p className="text-xs text-slate-400 mb-1">{isTamil ? 'தன்மை' : 'Nature'}</p>
                                        <p className="text-md font-semibold text-pink-300">{result.lagnaAnalysis.girlType}</p>
                                    </div>
                                    <p className="text-sm text-slate-400">{isTamil ? 'விவரங்கள் கணக்கிடப்படுகின்றன' : 'Chart details being calculated'}</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Overall Score Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl p-8 mb-8 border border-purple-500/30"
                    >
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                {isTamil ? 'ஒட்டுமொத்த மதிப்பெண்' : 'Overall Compatibility Score'}
                            </h2>
                            <div className="text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {result.overallScore}/100
                            </div>
                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-semibold ${result.verdict === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                                result.verdict === 'Very Good' ? 'bg-blue-500/20 text-blue-400' :
                                    result.verdict === 'Good' ? 'bg-cyan-500/20 text-cyan-400' :
                                        result.verdict === 'Average' ? 'bg-yellow-500/20 text-yellow-400' :
                                            result.verdict === 'Risky' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-red-500/20 text-red-400'
                                }`}>
                                {result.verdict === 'Excellent' && (isTamil ? '🌟 சிறப்பு' : '🌟 Excellent')}
                                {result.verdict === 'Very Good' && (isTamil ? '⭐ மிகச் சிறப்பு' : '⭐ Very Good')}
                                {result.verdict === 'Good' && (isTamil ? '👍 நல்லது' : '👍 Good')}
                                {result.verdict === 'Average' && (isTamil ? '😐 சராசரி' : '😐 Average')}
                                {result.verdict === 'Risky' && (isTamil ? '⚠️ அபாயகரமான' : '⚠️ Risky')}
                                {result.verdict === 'Poor' && (isTamil ? '❌ மோசமான' : '❌ Poor')}
                            </div>
                        </div>
                    </motion.div>

                    {/* Auto-Reject Warnings */}
                    {result.autoReject && result.autoRejectReasons.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-900/40 border border-red-500 rounded-xl p-6 mb-8"
                        >
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-red-400 mb-3">
                                        {isTamil ? '⚠️ முக்கியமான எச்சரிக்கைகள் - திருமணத்தை தவிர்க்க பரிந்துரைக்கப்படுகிறது' : '⚠️ Critical Warnings - Marriage Not Recommended'}
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.autoRejectReasons.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                                                <span className="text-red-200">
                                                    {/* Display Tamil reason if available in the reason string */}
                                                    {isTamil && reason.includes('CRITICAL:')
                                                        ? reason.split('CRITICAL:')[1]?.trim() || reason
                                                        : isTamil && reason.includes('ABSOLUTE REJECT:')
                                                            ? reason.split('ABSOLUTE REJECT:')[1]?.trim() || reason
                                                            : isTamil && reason.includes('REJECT:')
                                                                ? reason.split('REJECT:')[1]?.trim() || reason
                                                                : reason}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Lagna Analysis */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 rounded-xl p-6"
                        >
                            <h3 className="text-2xl font-bold mb-4">
                                {isTamil ? 'லக்ன பகுப்பாய்வு' : 'Lagna Analysis'}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-400 text-sm">{boyName}'s Type:</p>
                                        <p className="text-xl font-bold text-blue-400">{result.lagnaAnalysis.boyType}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 text-sm">{girlName}'s Type:</p>
                                        <p className="text-xl font-bold text-pink-400">{result.lagnaAnalysis.girlType}</p>
                                    </div>
                                </div>
                                <p className="text-slate-300">{result.lagnaAnalysis.details}</p>
                                <div className="flex items-center gap-2">
                                    {result.lagnaAnalysis.compatible ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                    <span className={result.lagnaAnalysis.compatible ? 'text-green-400' : 'text-red-400'}>
                                        {result.lagnaAnalysis.compatible ? 'Compatible' : 'Incompatible'}
                                    </span>
                                    <span className="ml-auto text-yellow-400 font-bold">
                                        {result.lagnaAnalysis.score}/10
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* 12th House - Foreign vs Local */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white/5 rounded-xl p-6"
                        >
                            <h3 className="text-2xl font-bold mb-4">
                                {isTamil ? 'வெளிநாடு/சொந்த ஊர் யோகம்' : 'Foreign/Local Settlement Yoga'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-400 text-sm">{boyName}:</p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {result.houseMatching.house12.boyYoga === 'Foreign'
                                            ? 'Foreign Yoga (12th House Subathuva)'
                                            : 'Local Yoga (12th House Pavathuva)'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">{girlName}:</p>
                                    <p className="text-lg font-bold text-pink-400">
                                        {result.houseMatching.house12.girlYoga === 'Foreign'
                                            ? 'Foreign Yoga (12th House Subathuva)'
                                            : 'Local Yoga (12th House Pavathuva)'}
                                    </p>
                                </div>
                                <p className="text-slate-300">{result.houseMatching.house12.details}</p>
                                <div className="flex items-center gap-2">
                                    {result.houseMatching.house12.compatible ? (
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    )}
                                    <span className={result.houseMatching.house12.compatible ? 'text-green-400' : 'text-red-400'}>
                                        {result.houseMatching.house12.compatible
                                            ? 'Will live together happily'
                                            : 'Risk of separation/long-distance'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Dasa-Bhukti Analysis - NEW SECTION */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 rounded-xl p-6"
                        >
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Clock className="text-purple-400" />
                                {isTamil ? 'தசா-புக்தி பகுப்பாய்வு' : 'Dasa-Bhukti Analysis'}
                            </h3>
                            <div className="space-y-4">
                                {/* Current Dasa for Boy */}
                                <div className="bg-blue-900/30 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-2">{isTamil ? 'மாப்பிள்ளை தற்போதைய தசை' : `${boyName} Current Dasa`}</p>
                                    <p className="text-xl font-bold text-blue-300">
                                        {result.dasaMatching.boyCurrentDasa} / {result.dasaMatching.boyCurrentBhukti}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isTamil ? 'மஹா தசை / புக்தி' : 'Maha Dasa / Bhukti'}
                                    </p>
                                </div>

                                {/* Current Dasa for Girl */}
                                <div className="bg-pink-900/30 rounded-lg p-4">
                                    <p className="text-sm text-slate-400 mb-2">{isTamil ? 'பெண் தற்போதைய தசை' : `${girlName} Current Dasa`}</p>
                                    <p className="text-xl font-bold text-pink-300">
                                        {result.dasaMatching.girlCurrentDasa} / {result.dasaMatching.girlCurrentBhukti}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {isTamil ? 'மஹா தசை / புக்தி' : 'Maha Dasa / Bhukti'}
                                    </p>
                                </div>

                                {/* 6-8 Relationship Warning */}
                                {result.dasaMatching.sixEightRelationship && (
                                    <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 flex items-center gap-2">
                                        <AlertTriangle className="text-red-400" size={18} />
                                        <span className="text-red-300 font-semibold text-sm">
                                            {isTamil ? '⚠️ 6-8 தசை உறவு - சண்டை சச்சரவுகள்' : '⚠️ 6-8 Dasa Relationship - Ego Clashes Expected'}
                                        </span>
                                    </div>
                                )}

                                {/* Score */}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                    <span className="text-slate-400">{isTamil ? 'தசை பொருத்த மதிப்பெண்' : 'Dasa Score'}:</span>
                                    <span className="font-bold text-purple-400 text-lg">{result.dasaMatching.score}/100</span>
                                </div>

                                {/* Details */}
                                <div className="pt-3 border-t border-slate-700">
                                    <p className="text-sm text-slate-300">{result.dasaMatching.details}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* All House Matching */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 rounded-xl p-6 mt-6"
                    >
                        <h3 className="text-2xl font-bold mb-4">
                            {isTamil ? 'வீட்டு பொருத்தம்' : 'House Matching Analysis'}
                        </h3>
                        <div className="space-y-4">
                            {[
                                { house: 2, name: isTamil ? 'குடும்பம்/செல்வம்' : 'Family/Wealth', data: result.houseMatching.house2 },
                                { house: 5, name: isTamil ? 'குழந்தைகள்' : 'Children', data: result.houseMatching.house5 },
                                { house: 7, name: isTamil ? 'திருமணம்' : 'Marriage', data: result.houseMatching.house7 },
                                { house: 8, name: isTamil ? 'ஆயுள்' : 'Longevity', data: result.houseMatching.house8 }
                            ].map((item) => (
                                <div key={item.house} className="bg-slate-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-lg">{item.name} (House {item.house})</span>
                                        <span className="text-yellow-400 font-bold text-lg">{item.data.score}/10</span>
                                    </div>
                                    <p className="text-slate-300 text-sm">{item.data.details}</p>
                                    <div className="mt-2">
                                        {item.data.compatible ? (
                                            <CheckCircle className="w-5 h-5 text-green-400 inline mr-2" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-400 inline mr-2" />
                                        )}
                                        <span className={item.data.compatible ? 'text-green-400' : 'text-red-400'}>
                                            {item.data.compatible ? 'Compatible' : 'Attention Needed'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Dasa-Bhukti Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 rounded-xl p-6 mt-6"
                    >
                        <h3 className="text-2xl font-bold mb-4">
                            {isTamil ? 'தசா புத்தி பகுப்பாய்வு' : 'Dasa-Bhukti Analysis'}
                        </h3>

                        {/* Current Periods */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-900/30 rounded-lg p-4">
                                <p className="text-slate-400 text-sm mb-2">{boyName}'s Current Period:</p>
                                <p className="text-xl font-bold text-blue-400">
                                    {result.dasaMatching.boyCurrentDasa} Maha Dasa
                                </p>
                                <p className="text-sm text-blue-300">
                                    → {result.dasaMatching.boyCurrentBhukti} Bhukti
                                </p>
                            </div>
                            <div className="bg-pink-900/30 rounded-lg p-4">
                                <p className="text-slate-400 text-sm mb-2">{girlName}'s Current Period:</p>
                                <p className="text-xl font-bold text-pink-400">
                                    {result.dasaMatching.girlCurrentDasa} Maha Dasa
                                </p>
                                <p className="text-sm text-pink-300">
                                    → {result.dasaMatching.girlCurrentBhukti} Bhukti
                                </p>
                            </div>
                        </div>

                        {/* 6-8 Warning */}
                        {result.dasaMatching.sixEightRelationship && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
                                <p className="text-red-400 font-bold flex items-center gap-2">
                                    ⚠️ {isTamil ? '6-8 உறவு' : '6-8 Relationship'}
                                </p>
                                <p className="text-red-300 text-sm mt-1">
                                    {isTamil
                                        ? 'தற்போதைய தசா கிரகங்கள் 6-8 உறவில் - தொடர்ச்சியான முரண்பாடுகள்'
                                        : 'Current Dasa planets in 6-8 relationship - Constant conflicts expected'
                                    }
                                </p>
                            </div>
                        )}

                        <p className="text-slate-300 mb-4">{result.dasaMatching.details}</p>

                        {/* Future 10 Years */}
                        {result.dasaMatching.nextTenYears.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-xl font-bold mb-4">
                                    {isTamil ? 'அடுத்த 10 வருடங்கள்' : 'Next 10 Years Timeline'}
                                </h4>

                                {/* Future Problems */}
                                {result.dasaMatching.futureProblems.length > 0 && (
                                    <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 mb-4">
                                        <h5 className="font-bold text-orange-400 mb-2">
                                            ⚠️ {isTamil ? 'எதிர்கால சவால்கள்' : 'Future Challenges'}
                                        </h5>
                                        <ul className="space-y-2">
                                            {result.dasaMatching.futureProblems.map((problem: any, idx: number) => (
                                                <li key={idx} className={`text-sm ${problem.severity === 'high' ? 'text-red-300' :
                                                    problem.severity === 'medium' ? 'text-orange-300' :
                                                        'text-yellow-300'
                                                    }`}>
                                                    <span className="font-bold">{problem.period}:</span> {problem.issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Year by Year */}
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {result.dasaMatching.nextTenYears.map((yearData: any) => (
                                        <div
                                            key={yearData.year}
                                            className={`grid grid-cols-6 gap-2 p-3 rounded-lg ${yearData.compatible
                                                ? 'bg-green-900/20 border border-green-500/30'
                                                : 'bg-red-900/20 border border-red-500/30'
                                                }`}
                                        >
                                            <div className="font-bold">Year {yearData.year}</div>
                                            <div className="text-blue-400 text-sm">
                                                {boyName}: {yearData.boyMahaDasa}<br />
                                                <span className="text-xs opacity-75">→ {yearData.boyBhukti}</span>
                                            </div>
                                            <div className="text-pink-400 text-sm">
                                                {girlName}: {yearData.girlMahaDasa}<br />
                                                <span className="text-xs opacity-75">→ {yearData.girlBhukti}</span>
                                            </div>
                                            <div className="col-span-2 text-xs text-slate-300">
                                                {yearData.issues.length > 0 ? yearData.issues.join(', ') : 'No issues'}
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded text-xs ${yearData.compatible
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {yearData.compatible ? '✓' : '✗'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Recommendations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-6 mt-6 border border-cyan-500/30"
                    >
                        <h3 className="text-2xl font-bold mb-4">
                            💡 {isTamil ? 'பரிந்துரைகள்' : 'Recommendations'}
                        </h3>
                        <ul className="space-y-3">
                            {result.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="text-cyan-400 mt-1 text-xl">•</span>
                                    <span className="text-slate-200 text-lg">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Remaining content - House Matching, Dasa Analysis, etc. */}
                    {/* Add all the other sections from the inline display here */}
                </div>
                {/* End Results Container */}

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/marriage-matching')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                        {isTamil ? 'புதிய பொருத்தம் சரிபார்க்க' : 'Check Another Match'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchingResults;
