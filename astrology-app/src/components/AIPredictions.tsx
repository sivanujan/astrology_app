import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, AlertCircle, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { queryAstrologyOrchestrator, OrchestratorResponse } from '../utils/aiOrchestrator';

interface AIPredictionsProps {
    data: any;
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ data }) => {
    const { t, language } = useLanguage();
    const [prediction, setPrediction] = useState<OrchestratorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [question, setQuestion] = useState('');
    const [responseLanguage, setResponseLanguage] = useState<'en' | 'ta'>('en');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Sync initial response language with app language
    useEffect(() => {
        setResponseLanguage(language);
    }, [language]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, prediction]);

    if (!data) return null;

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        const newHistory = [...chatHistory, { role: 'user', content: question }];
        setChatHistory(newHistory);
        setQuestion('');
        setIsLoading(true);
        setError('');

        try {
            // Call the Orchestrator with selected response language
            const response = await queryAstrologyOrchestrator(question, data, responseLanguage);

            setPrediction(response);

            // Add AI response to history
            const aiContent = responseLanguage === 'ta' ? response.final_answer_tamil : response.final_answer_english;
            setChatHistory(prev => [...prev, { role: 'ai', content: aiContent, details: response }]);

        } catch (err: any) {
            setError(err.message || "Failed to get prediction");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-12rem)] flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center flex-shrink-0"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-purple-400" />
                    {t.predictions.title} (AI Orchestrator)
                </h2>
                <p className="text-slate-400">{t.predictions.subtitle}</p>
            </motion.div>

            {/* Chat Interface */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-slate-500 mt-10">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Ask a question to start the AI analysis.</p>
                            <p className="text-sm mt-2">Examples: "When will I get married?", "Is government job possible?"</p>
                        </div>
                    )}

                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>
                            <div className={`rounded-lg p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-900/30 text-blue-100' : 'bg-slate-800/50 text-slate-200'}`}>
                                {msg.content}
                                {msg.details?.bava_analysis_report && (
                                    <div className="mt-6 space-y-4">
                                        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/30">
                                            <h3 className="text-lg font-bold text-purple-300 mb-2">📊 Comprehensive House Analysis</h3>
                                            <p className="text-slate-300">{msg.details.bava_analysis_report.lagna_summary}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {msg.details.bava_analysis_report.house_predictions.map((house: any) => (
                                                <div
                                                    key={house.house_number}
                                                    className={`p-3 rounded-lg border ${house.status === 'Strong' || house.status === 'Excellent'
                                                            ? 'bg-green-900/20 border-green-800/30'
                                                            : house.status === 'Weak'
                                                                ? 'bg-red-900/20 border-red-800/30'
                                                                : 'bg-yellow-900/20 border-yellow-800/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-slate-400">House {house.house_number}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${house.status === 'Strong' || house.status === 'Excellent'
                                                                ? 'bg-green-700/30 text-green-300'
                                                                : house.status === 'Weak'
                                                                    ? 'bg-red-700/30 text-red-300'
                                                                    : 'bg-yellow-700/30 text-yellow-300'
                                                            }`}>
                                                            {house.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-white mb-1">{house.title}</h4>
                                                    <p className="text-xs text-slate-300 mb-2">{house.analysis}</p>
                                                    <p className="text-xs text-slate-500 italic">Rule: {house.guruji_rule_applied}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
                                            <h3 className="text-sm font-bold text-blue-300 mb-1">📝 Final Verdict</h3>
                                            <p className="text-sm text-slate-300">{msg.details.bava_analysis_report.final_verdict}</p>
                                        </div>
                                    </div>
                                )}
                                {msg.details && !msg.details.bava_analysis_report && (
                                    <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400">
                                        <p><strong>Intent:</strong> {msg.details.intent}</p>
                                        <p><strong>Key Planet:</strong> {msg.details.primary_analysis.key_planet} ({msg.details.primary_analysis.status})</p>
                                        <p><strong>Reasoning:</strong> {msg.details.reasoning}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4 text-slate-200">
                                <Sparkles className="w-5 h-5 animate-spin" /> Thinking...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 inline mr-2" /> {error}
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
                    {/* Language Toggle */}
                    <div className="flex justify-end gap-2 text-xs">
                        <span className="text-slate-400 self-center">Answer in:</span>
                        <button
                            onClick={() => setResponseLanguage('en')}
                            className={`px-3 py-1 rounded-full border transition-colors ${responseLanguage === 'en' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setResponseLanguage('ta')}
                            className={`px-3 py-1 rounded-full border transition-colors ${responseLanguage === 'ta' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                            தமிழ்
                        </button>
                    </div>

                    <form onSubmit={handleAskQuestion} className="flex gap-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={t.predictions.askPlaceholder}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-6 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !question.trim()}
                            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIPredictions;
