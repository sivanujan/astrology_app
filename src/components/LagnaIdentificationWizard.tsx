import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { LAGNA_QUESTIONS } from '../utils/lagnaQuestions';
import { identifyLagna, getLagnaName, estimateBirthTime, IdentificationResult } from '../utils/lagnaIdentification';
import { useLanguage } from '../contexts/LanguageContext';

interface LagnaIdentificationWizardProps {
    onClose: () => void;
    onComplete: (result: IdentificationResult, estimatedTime?: string) => void;
    birthDate: Date;
    birthPlace: { latitude: number; longitude: number };
}

const LagnaIdentificationWizard: React.FC<LagnaIdentificationWizardProps> = ({
    onClose,
    onComplete,
    birthDate,
    birthPlace
}) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const [step, setStep] = useState(0); // 0 = welcome, 1-16 = questions, 17 = results
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<IdentificationResult | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const totalQuestions = LAGNA_QUESTIONS.length;
    const progress = step === 0 ? 0 : step > totalQuestions ? 100 : ((step / totalQuestions) * 100);

    const handleAnswer = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleNext = () => {
        if (step === totalQuestions) {
            // Calculate result
            const identificationResult = identifyLagna(answers, language);
            setResult(identificationResult);
            setStep(step + 1);
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleComplete = () => {
        if (result) {
            // Estimate time based on identified Lagna
            const timeEstimate = estimateBirthTime(
                result.primary.lagna,
                birthDate,
                birthPlace.latitude,
                birthPlace.longitude
            );
            onComplete(result, timeEstimate.approximateTime);
        }
    };

    const currentQuestion = step > 0 && step <= totalQuestions ? LAGNA_QUESTIONS[step - 1] : null;
    const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-purple-500/30"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">
                                {isTamil ? 'லக்னம் கண்டறிதல்' : 'Lagna Identification'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {step > 0 && step <= totalQuestions && (
                        <div className="mt-3">
                            <div className="flex justify-between text-sm text-slate-400 mb-1">
                                <span>{isTamil ? 'முன்னேற்றம்' : 'Progress'}</span>
                                <span>{step}/{totalQuestions}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <AnimatePresence mode="wait">
                        {/* Welcome Screen */}
                        {step === 0 && (
                            <motion.div
                                key="welcome"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-10 h-10 text-purple-400" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {isTamil ? 'வரவேற்பு!' : 'Welcome!'}
                                    </h3>
                                    <p className="text-slate-300">
                                        {isTamil
                                            ? 'இந்த கேள்விகள் உங்கள் லக்னத்தை கண்டறிய உதவும்'
                                            : 'These questions will help identify your Lagna (Ascendant)'
                                        }
                                    </p>
                                </div>

                                {/* Disclaimer */}
                                {showDisclaimer && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-left">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-slate-300">
                                                <p className="font-semibold text-yellow-400 mb-2">
                                                    {isTamil ? 'முக்கிய எச்சரிக்கை:' : 'Important Disclaimer:'}
                                                </p>
                                                <ul className="space-y-1 list-disc list-inside">
                                                    <li>
                                                        {isTamil
                                                            ? 'இது மதிப்பீடு மட்டுமே, 100% துல்லியமானது அல்ல'
                                                            : 'This is an ESTIMATE, not 100% accurate'
                                                        }
                                                    </li>
                                                    <li>
                                                        {isTamil
                                                            ? 'பலன்கள் மாறுபடலாம்'
                                                            : 'Predictions may vary from actual'
                                                        }
                                                    </li>
                                                    <li>
                                                        {isTamil
                                                            ? 'சரியான பிறந்த நேரம் எப்போதும் சிறந்தது'
                                                            : 'Exact birth time is always preferred'
                                                        }
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!showDisclaimer}
                                                onChange={() => setShowDisclaimer(false)}
                                                className="w-4 h-4 rounded border-yellow-500/50 bg-slate-800"
                                            />
                                            <span className="text-xs text-slate-400">
                                                {isTamil ? 'புரிந்து கொண்டேன்' : 'I understand'}
                                            </span>
                                        </label>
                                    </div>
                                )}

                                <div className="text-sm text-slate-400">
                                    <p>{totalQuestions} {isTamil ? 'கேள்விகள்' : 'questions'}</p>
                                    <p>{isTamil ? 'சுமார் 5 நிமிடங்கள்' : 'Approximately 5 minutes'}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Question Screens */}
                        {currentQuestion && (
                            <motion.div
                                key={`question-${step}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <div className="text-sm text-purple-400 mb-2">
                                        {currentQuestion.category === 'physical' && (isTamil ? 'உடல் அம்சங்கள்' : 'Physical Features')}
                                        {currentQuestion.category === 'personality' && (isTamil ? 'ஆளுமை' : 'Personality')}
                                        {currentQuestion.category === 'lifeEvents' && (isTamil ? 'வாழ்க்கை நிகழ்வுகள்' : 'Life Events')}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {isTamil ? currentQuestion.question.ta : currentQuestion.question.en}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {currentQuestion.options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleAnswer(currentQuestion.id, option.id)}
                                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${currentAnswer === option.id
                                                    ? 'border-purple-500 bg-purple-500/20 text-white'
                                                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${currentAnswer === option.id
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-slate-600'
                                                    }`}>
                                                    {currentAnswer === option.id && (
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <span>{isTamil ? option.text.ta : option.text.en}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Results Screen */}
                        {step > totalQuestions && result && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-10 h-10 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {isTamil ? 'முடிவுகள்!' : 'Results!'}
                                    </h3>
                                </div>

                                {/* Primary Result */}
                                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/30">
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-slate-400 mb-2">
                                            {isTamil ? 'உங்கள் லக்னம்' : 'Your Lagna'}
                                        </p>
                                        <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                            {getLagnaName(result.primary.lagna, language)}
                                        </h4>
                                        <p className="text-lg text-purple-300 mt-2">
                                            {result.primary.confidence}% {isTamil ? 'நம்பிக்கை' : 'Confidence'}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">
                                                {isTamil ? 'உடல் அம்சங்கள்' : 'Physical'}
                                            </span>
                                            <span className="text-white">{result.primary.breakdown.physical}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">
                                                {isTamil ? 'ஆளுமை' : 'Personality'}
                                            </span>
                                            <span className="text-white">{result.primary.breakdown.personality}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">
                                                {isTamil ? 'வாழ்க்கை நிகழ்வுகள்' : 'Life Events'}
                                            </span>
                                            <span className="text-white">{result.primary.breakdown.lifeEvents}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Alternative Lagnas */}
                                {result.secondary && (
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">
                                            {isTamil ? 'மாற்று சாத்தியங்கள்:' : 'Alternatives:'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                                <p className="text-white font-semibold">
                                                    {getLagnaName(result.secondary.lagna, language)}
                                                </p>
                                                <p className="text-sm text-slate-400">
                                                    {result.secondary.confidence}%
                                                </p>
                                            </div>
                                            {result.tertiary && (
                                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                                    <p className="text-white font-semibold">
                                                        {getLagnaName(result.tertiary.lagna, language)}
                                                    </p>
                                                    <p className="text-sm text-slate-400">
                                                        {result.tertiary.confidence}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendation */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-sm text-slate-300">{result.recommendation}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-700 p-4 bg-slate-900/50">
                    <div className="flex justify-between">
                        <button
                            onClick={handleBack}
                            disabled={step === 0 || step > totalQuestions}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {isTamil ? 'முந்தைய' : 'Back'}
                        </button>

                        <button
                            onClick={step > totalQuestions ? handleComplete : handleNext}
                            disabled={(step > 0 && step <= totalQuestions && !currentAnswer) || (step === 0 && showDisclaimer)}
                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            {step === 0 && (isTamil ? 'தொடங்கு' : 'Start')}
                            {step > 0 && step < totalQuestions && (isTamil ? 'அடுத்து' : 'Next')}
                            {step === totalQuestions && (isTamil ? 'முடிவுகளைக் காண்பி' : 'Show Results')}
                            {step > totalQuestions && (isTamil ? 'பயன்படுத்து' : 'Use This')}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LagnaIdentificationWizard;
