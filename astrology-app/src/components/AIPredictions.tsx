import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Bot, User, Key, AlertCircle } from 'lucide-react';
import { NAKSHATRAS, ZODIAC_SIGNS, TAMIL_RASI_NAMES } from '../utils/constants';
import { getNakshatra } from '../utils/astrology';

interface AIPredictionsProps {
    data: any;
}

const AIPredictions: React.FC<AIPredictionsProps> = ({ data }) => {
    const [apiKey, setApiKey] = useState('');
    const [prediction, setPrediction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [question, setQuestion] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, prediction]);

    if (!data) return null;

    const generatePrompt = (context: string) => {
        const { userDetails, planets, ascendant } = data;

        const planetDetails = planets.map((p: any) =>
            `${p.name} in ${TAMIL_RASI_NAMES[p.signIndex]} (${ZODIAC_SIGNS[p.signIndex]}) at ${Math.floor(p.degree)} degrees`
        ).join(', ');

        const ascendantDetail = `Ascendant in ${TAMIL_RASI_NAMES[ascendant.signIndex]} (${ZODIAC_SIGNS[ascendant.signIndex]})`;

        return `
      You are an expert Vedic Astrologer. Analyze this birth chart:
      Name: ${userDetails.name}
      Birth Date: ${userDetails.date}
      Birth Time: ${userDetails.time}
      Place: ${userDetails.city}
      
      Planetary Positions:
      ${ascendantDetail}
      ${planetDetails}
      
      ${context}
      
      Provide predictions for career, relationships, health, and favorable periods. 
      Consider planetary positions, house placements, and current dasha period (estimate).
      Be positive but realistic. Use Vedic terminology where appropriate but explain it.
    `;
    };

    const handleGeneratePrediction = async () => {
        if (!apiKey) {
            setError('Please enter your Anthropic API Key first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setPrediction('');

        try {
            const prompt = generatePrompt("Provide a comprehensive initial reading.");

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'dangerously-allow-browser': 'true' // Only for demo/local apps
                },
                body: JSON.stringify({
                    model: "claude-3-sonnet-20240229",
                    max_tokens: 1024,
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'Failed to fetch prediction');
            }

            const data = await response.json();
            const text = data.content[0].text;

            // Simulate streaming effect
            let i = 0;
            const interval = setInterval(() => {
                setPrediction(prev => prev + text.charAt(i));
                i++;
                if (i >= text.length) clearInterval(interval);
            }, 10);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !apiKey) return;

        const newHistory = [...chatHistory, { role: 'user', content: question }];
        setChatHistory(newHistory);
        setQuestion('');
        setIsLoading(true);

        try {
            const prompt = generatePrompt(`User Question: ${question}\nAnswer based on the chart.`);

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'dangerously-allow-browser': 'true'
                },
                body: JSON.stringify({
                    model: "claude-3-sonnet-20240229",
                    max_tokens: 1024,
                    messages: [
                        ...newHistory.map(h => ({ role: h.role === 'ai' ? 'assistant' : 'user', content: h.content })),
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();
            const text = data.content[0].text;

            setChatHistory(prev => [...prev, { role: 'ai', content: text }]);

        } catch (err: any) {
            setError(err.message);
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
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    AI Astrologer
                </h2>
                <p className="text-slate-400">Powered by Claude 3.5 Sonnet</p>
            </motion.div>

            {/* API Key Input */}
            {!prediction && chatHistory.length === 0 && (
                <div className="glass-panel p-6 max-w-md mx-auto w-full">
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4" /> Enter Anthropic API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded px-4 py-2 mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    {error && (
                        <div className="text-red-400 text-sm mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    <button
                        onClick={handleGeneratePrediction}
                        disabled={isLoading || !apiKey}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Sparkles className="animate-spin" /> : <Sparkles />}
                        Generate Full Reading
                    </button>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                        Your key is used directly in your browser and not stored.
                    </p>
                </div>
            )}

            {/* Chat Interface */}
            {(prediction || chatHistory.length > 0) && (
                <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {prediction && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-4 text-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {prediction}
                                </div>
                            </div>
                        )}

                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                                </div>
                                <div className={`rounded-lg p-4 max-w-[80%] ${msg.role === 'user' ? 'bg-blue-900/30 text-blue-100' : 'bg-slate-800/50 text-slate-200'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleAskQuestion} className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a follow-up question..."
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
            )}
        </div>
    );
};

export default AIPredictions;
