import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, MessageCircle } from 'lucide-react';
import { ComprehensiveMatchResult } from '../utils/marriageMatchingMain';
import { ComprehensiveResultsDisplay } from '../components/ComprehensiveResultsDisplay';
import { useLanguage } from '../contexts/LanguageContext';

const ComprehensiveResultsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const result = location.state?.result as ComprehensiveMatchResult;
    const boyDetails = location.state?.boyDetails;
    const girlDetails = location.state?.girlDetails;

    if (!result) {
        navigate('/comprehensive-matching');
        return null;
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto py-8">
                {/* Header with Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/comprehensive-matching')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>{isTamil ? 'திரும்ப' : 'Back'}</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                <Download className="w-5 h-5" />
                                <span className="hidden sm:inline">{isTamil ? 'PDF' : 'Download PDF'}</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                                <Share2 className="w-5 h-5" />
                                <span className="hidden sm:inline">{isTamil ? 'பகிர்' : 'Share'}</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                                <MessageCircle className="w-5 h-5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 mb-2">
                            {isTamil ? 'விரிவான பொருத்த முடிவுகள்' : 'Comprehensive Matching Results'}
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
            </div>
        </div>
    );
};

export default ComprehensiveResultsPage;
