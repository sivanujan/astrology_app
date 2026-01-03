import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashaPredictionsPanel } from '../components/DashaPredictionsPanel';
import { useLanguage } from '../contexts/LanguageContext';

const DashaPredictionsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { language } = useLanguage();

    const chart = location.state?.chart;

    if (!chart) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {language === 'ta' ? 'பிறப்பு விவரங்கள் இல்லை' : 'No Birth Data Available'}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {language === 'ta'
                            ? 'தயவுசெய்து முதலில் பிறப்பு விவரங்களை உள்ளிடவும்'
                            : 'Please enter birth details first'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                    >
                        {language === 'ta' ? 'முகப்புக்கு செல்' : 'Go to Home'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {language === 'ta' ? 'பின்செல்' : 'Back'}
                </button>

                {/* Main Panel */}
                <DashaPredictionsPanel chart={chart} language={language} />
            </div>
        </div>
    );
};

export default DashaPredictionsPage;
