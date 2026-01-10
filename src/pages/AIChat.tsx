import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, TrendingUp, Heart, Clock, Star, ThumbsUp, ThumbsDown, BarChart3, Share2, Bookmark, User, Bot, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { apiCall, API_CONFIG } from '../config/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const AIChat: React.FC = () => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questionsRemaining, setQuestionsRemaining] = useState(2);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const suggestedQuestions = language === 'ta' ? [
        { icon: TrendingUp, text: 'எனக்கு ஏற்ற தொழில் எது?', emoji: '💼' },
        { icon: Heart, text: 'நான் எப்போது திருமணம் செய்வேன்?', emoji: '💑' },
        { icon: Clock, text: 'எனது தற்போதைய திசை காலம் எப்படி?', emoji: '⏰' },
        { icon: Star, text: 'ராகு-கேது மாற்றங்கள் என்ன அர்த்தம்?', emoji: '🌟' }
    ] : [
        { icon: TrendingUp, text: 'Which career path is best for me?', emoji: '💼' },
        { icon: Heart, text: 'When will I get married?', emoji: '💑' },
        { icon: Clock, text: 'How is my current Dasa period?', emoji: '⏰' },
        { icon: Star, text: 'What do Rahu-Ketu transits mean?', emoji: '🌟' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (questionsRemaining <= 0) {
            // Show upgrade modal
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setQuestionsRemaining(prev => prev - 1);

        try {
            // Call AI API
            const response = await apiCall(API_CONFIG.endpoints.chat.send, {
                method: 'POST',
                body: JSON.stringify({
                    message: input,
                    language
                })
            });

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer || 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: language === 'ta'
                    ? 'மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
                    : 'Sorry, an error occurred. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedClick = (question: string) => {
        setInput(question);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white">
            {/* Animated Background Stars */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Main Container */}
            <div className="relative z-10 max-w-6xl mx-auto h-screen flex flex-col">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-6 backdrop-blur-md bg-slate-950/50 border-b border-purple-500/20"
                >
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                            AstroZen AI
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/chart')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors border border-purple-500/30"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span className="hidden md:inline">{language === 'ta' ? 'ஜாதகம்' : 'View Chart'}</span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </motion.header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto px-4 py-8">
                    {messages.length === 0 ? (
                        /* Welcome State */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-3xl mx-auto text-center space-y-8"
                        >
                            {/* Hero Icon */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="inline-block"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                                    <Bot className="w-12 h-12 text-white" />
                                </div>
                            </motion.div>

                            {/* Title */}
                            <div className="space-y-3">
                                <h2 className="text-4xl font-bold">
                                    {language === 'ta' ? 'உங்கள் தனிப்பட்ட AI ஜோதிடர்' : 'Your Personal AI Astrologer'}
                                </h2>
                                <p className="text-lg text-slate-400">
                                    {language === 'ta'
                                        ? 'உங்கள் ஜாதகத்தின் அடிப்படையில் உடனடி பதில்களைப் பெறுங்கள்'
                                        : 'Get instant answers based on your birth chart'}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                            {/* Suggested Questions */}
                            <div className="space-y-4">
                                <p className="text-slate-300 flex items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-purple-400" />
                                    {language === 'ta' ? 'நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?' : 'What would you like to know?'}
                                </p>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                >
                                    {suggestedQuestions.map((q, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + idx * 0.1 }}
                                            whileHover={{
                                                scale: 1.02,
                                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                                                y: -2
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSuggestedClick(q.text)}
                                            className="flex items-center gap-3 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl hover:bg-purple-600/15 transition-all text-left group"
                                        >
                                            <span className="text-2xl">{q.emoji}</span>
                                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{q.text}</span>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Messages */
                        <div className="max-w-4xl mx-auto space-y-6">
                            <AnimatePresence>
                                {messages.map((message, idx) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20, x: message.role === 'user' ? 20 : -20 }}
                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] md:max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                                            {/* Message Header */}
                                            <div className={`flex items-center gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {message.role === 'assistant' && (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                        <Bot className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                                <span className="text-sm text-slate-400">
                                                    {message.role === 'user'
                                                        ? (language === 'ta' ? 'நீங்கள்' : 'You')
                                                        : (language === 'ta' ? 'AI ஜோதிடர்' : 'AI Astrologer')}
                                                    {' • '}
                                                    {language === 'ta' ? 'இப்போது' : 'Just now'}
                                                </span>
                                                {message.role === 'user' && (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message Bubble */}
                                            <div
                                                className={`p-4 rounded-2xl ${message.role === 'user'
                                                    ? 'bg-purple-600/15 border-l-4 border-purple-500'
                                                    : 'bg-slate-900/60 border border-purple-500/20 shadow-lg'
                                                    }`}
                                            >
                                                <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                                                    {message.content}
                                                </p>

                                                {/* AI Message Actions */}
                                                {message.role === 'assistant' && (
                                                    <div className="mt-4 pt-4 border-t border-purple-500/20 flex items-center gap-2 flex-wrap">
                                                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors">
                                                            <ThumbsUp className="w-3 h-3" />
                                                            {language === 'ta' ? 'பயனுள்ளது' : 'Helpful'}
                                                        </button>
                                                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
                                                            <ThumbsDown className="w-3 h-3" />
                                                        </button>
                                                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
                                                            <Bookmark className="w-3 h-3" />
                                                            {language === 'ta' ? 'சேமி' : 'Save'}
                                                        </button>
                                                        <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/50 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
                                                            <Share2 className="w-3 h-3" />
                                                            {language === 'ta' ? 'பகிர்' : 'Share'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-2 h-2 bg-purple-400 rounded-full"
                                                        animate={{
                                                            scale: [1, 1.5, 1],
                                                            opacity: [0.5, 1, 0.5]
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            delay: i * 0.2
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-purple-300">
                                                {language === 'ta' ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing...'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 backdrop-blur-md bg-slate-950/50 border-t border-purple-500/20"
                >
                    <div className="max-w-4xl mx-auto space-y-3">
                        {/* Input Box */}
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={language === 'ta'
                                    ? 'உங்கள் ஜாதகத்தைப் பற்றி எதையும் கேளுங்கள்...'
                                    : 'Ask me anything about your birth chart...'}
                                className="w-full bg-slate-900/60 border border-purple-500/30 rounded-2xl px-6 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition resize-none"
                                rows={3}
                                style={{ minHeight: '80px', maxHeight: '200px' }}
                                disabled={questionsRemaining <= 0}
                            />

                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading || questionsRemaining <= 0}
                                className="absolute right-3 bottom-3 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Bottom Bar */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/chart')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">{language === 'ta' ? 'ஜாதகத்தைக் காண்க' : 'View Chart'}</span>
                                </button>
                            </div>

                            <div className={`text-xs ${questionsRemaining > 0 ? 'text-slate-400' : 'text-orange-400'}`}>
                                {questionsRemaining > 0
                                    ? `${questionsRemaining} ${language === 'ta' ? 'கேள்விகள் எஞ்சியுள்ளன' : 'questions remaining'}`
                                    : (language === 'ta' ? 'தினசரி வரம்பு எட்டியது' : 'Daily limit reached')}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AIChat;
