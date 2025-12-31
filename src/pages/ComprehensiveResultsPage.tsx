import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, MessageCircle } from 'lucide-react';
import { ComprehensiveMatchResult } from '../utils/marriageMatchingMain';
import { ComprehensiveResultsDisplay } from '../components/ComprehensiveResultsDisplay';
import { MarriageDasaForecast } from '../components/MarriageDasaForecast';
import { useLanguage } from '../contexts/LanguageContext';
import { saveMarriageResult, loadMarriageResult, generateShareableUrl } from '../services/marriageResultService';
import MarriageAIModal from '../components/MarriageAIModal';

const ComprehensiveResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const [result, setResult] = useState<ComprehensiveMatchResult | null>(location.state?.result || null);
    const [boyDetails, setBoyDetails] = useState(location.state?.boyDetails);
    const [girlDetails, setGirlDetails] = useState(location.state?.girlDetails);
    const [shareableUrl, setShareableUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);

    // Load result from Firestore if coming from shared link
    useEffect(() => {
        const resultId = searchParams.get('id');
        if (resultId) {
            loadSharedResult(resultId);
        } else if (result && !shareableUrl) {
            // Save new result to Firestore
            saveResult();
        }
    }, []);

    const loadSharedResult = async (id: string) => {
        setLoading(true);
        try {
            const data = await loadMarriageResult(id);
            if (data) {
                setResult(data.result);
                setBoyDetails(data.boyDetails);
                setGirlDetails(data.girlDetails);
                setShareableUrl(generateShareableUrl(id));
            } else {
                alert(isTamil ? 'முடிவுகள் கிடைக்கவில்லை' : 'Results not found');
                navigate('/marriage-matching');
            }
        } catch (error) {
            console.error('Error loading result:', error);
            alert(isTamil ? 'பிழை ஏற்பட்டது' : 'Error loading results');
        } finally {
            setLoading(false);
        }
    };

    const saveResult = async () => {
        if (!result) return;

        try {
            const resultId = await saveMarriageResult(result, boyDetails, girlDetails, language);
            const url = generateShareableUrl(resultId);
            setShareableUrl(url);

            // Update browser URL without reload
            window.history.replaceState({}, '', `/comprehensive-results?id=${resultId}`);
        } catch (error) {
            console.error('Error saving result:', error);
        }
    };

    if (!result) {
        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-slate-300">{isTamil ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
                    </div>
                </div>
            );
        }
        navigate('/marriage-matching');
        return null;
    }

    // PDF Download Handler
    const handleDownloadPDF = () => {
        window.print();
    };

    // Share Handler with unique URL
    const handleShare = async () => {
        const url = shareableUrl || window.location.href;
        const shareData = {
            title: isTamil ? 'திருமண பொருத்த முடிவுகள்' : 'Marriage Matching Results',
            text: isTamil
                ? `மொத்த மதிப்பெண்: ${result.overallScore.toFixed(1)}/100\nதீர்ப்பு: ${result.verdict}\n\n${boyDetails?.name || 'ஆண்'} & ${girlDetails?.name || 'பெண்'}`
                : `Overall Score: ${result.overallScore.toFixed(1)}/100\nVerdict: ${result.verdict}\n\n${boyDetails?.name || 'Boy'} & ${girlDetails?.name || 'Girl'}`,
            url: url
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
                alert(isTamil ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // WhatsApp Handler with unique URL
    const handleWhatsApp = () => {
        const url = shareableUrl || window.location.href; // Fallback to Firestore URL if available, otherwise current URL
        const message = isTamil
            ? `🌟 திருமண பொருத்த முடிவுகள் 🌟\n\nமொத்த மதிப்பெண்: ${result.overallScore.toFixed(1)}/100\nதீர்ப்பு: ${result.verdict}\n\n${boyDetails?.name || 'ஆண்'} & ${girlDetails?.name || 'பெண்'}\n\nமுடிவுகளைப் பார்க்க: ${url}`
            : `🌟 Marriage Matching Results 🌟\n\nOverall Score: ${result.overallScore.toFixed(1)}/100\nVerdict: ${result.verdict}\n\n${boyDetails?.name || 'Boy'} & ${girlDetails?.name || 'Girl'}\n\nView full results: ${url}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto py-8">
                {/* Header with Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <button
                            onClick={() => navigate('/marriage-matching')}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors self-start md:self-auto"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {isTamil ? 'திரும்ப' : 'Back'}
                        </button>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
                            >
                                <Share2 className="w-5 h-5" />
                                {isTamil ? 'பகிர்' : 'Share'}
                            </button>

                            <button
                                onClick={handleWhatsApp}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {isTamil ? 'வாட்ஸ்அப்' : 'WhatsApp'}
                            </button>

                            <button
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                <Download className="w-5 h-5" />
                                {downloading ? (isTamil ? 'பதிவிறக்குகிறது...' : 'Downloading...') : (isTamil ? 'PDF பதிவிறக்கம்' : 'Download PDF')}
                            </button>

                            <button
                                onClick={() => setShowAIModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 rounded-lg transition-colors text-white font-semibold shadow-lg shadow-amber-900/50"
                            >
                                <span className="text-xl">🔮</span>
                                {isTamil ? 'AI கணிப்பு' : 'AI Prediction'}
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 mb-2">
                            {isTamil ? 'விரிவான பொருத்த முடிவ்கள்' : 'Comprehensive Matching Results'}
                        </h1>
                        <p className="text-slate-300">
                            {isTamil ? 'அடித்ய குருஜியின் 7 விதிகள் படி பகுப்பாய்வு' : 'Analysis Based on Aditya Guruji\'s 7 Rules'}
                        </p>
                    </div>
                </motion.div>

                {/* Results Display */}
                <ComprehensiveResultsDisplay
                    result={result}
                    isTamil={isTamil}
                    boyName={boyDetails?.name}
                    girlName={girlDetails?.name}
                />

                {/* 10-Year Dasa Forecast */}
                {
                    result && boyDetails && girlDetails && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8"
                        >
                            <MarriageDasaForecast
                                boyChart={result.boyChart}
                                girlChart={result.girlChart}
                                boyBirthDate={result.boyChart.birthDate}
                                girlBirthDate={result.girlChart.birthDate}
                                language={isTamil ? 'ta' : 'en'}
                            />
                        </motion.div>
                    )
                }
            </div >

            <MarriageAIModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                boyDetails={boyDetails || { name: 'Boy', date: 'Unknown' }}
                girlDetails={girlDetails || { name: 'Girl', date: 'Unknown' }}
                matchingResult={result}
            />
        </div >
    );
};

export default ComprehensiveResultsPage;
