import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Send, Sparkles } from 'lucide-react';

export const SceneAIChat = () => {
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const sequence = async () => {
            // 1. User asks
            await new Promise(r => setTimeout(r, 1000));
            setMessages(prev => [...prev, { role: 'user', text: "When will I get married?" }]);

            // 2. AI Thinks
            await new Promise(r => setTimeout(r, 500));
            setMessages(prev => [...prev, { role: 'ai', text: "Thinking...", isTyping: true }]);

            // 3. AI Responds
            await new Promise(r => setTimeout(r, 1500));
            setMessages(prev => [
                ...prev.filter(m => !m.isTyping),
                { role: 'ai', text: "Based on your chart, marriage prospects are strong during your Venus-Jupiter period (2026-2028). 💑" }
            ]);

            // 4. User asks career
            await new Promise(r => setTimeout(r, 2000));
            setMessages(prev => [...prev, { role: 'user', text: "What about my career?" }]);

            // 5. AI Responds
            await new Promise(r => setTimeout(r, 1000));
            setMessages(prev => [
                ...prev,
                { role: 'ai', text: "Your 10th house is powerful! A career in Technology or Business suits you best. Peak period starts 2025. 🚀" }
            ]);
        };
        sequence();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-slate-900/50 backdrop-blur-sm p-6 pt-24 max-w-md mx-auto border-x border-slate-800 relative">
            <div className="absolute top-0 inset-x-0 h-20 bg-slate-900/80 backdrop-blur-md flex items-center px-6 border-b border-slate-800 z-10">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold">AI Astrologer</h3>
                    <p className="text-purple-300 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pt-4 pb-20">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                            }`}>
                            {msg.isTyping ? (
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75" />
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150" />
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="absolute bottom-0 inset-x-0 p-4 bg-slate-900 border-t border-slate-800">
                <div className="relative">
                    <input disabled placeholder="Ask about your future..." className="w-full bg-slate-800 border border-slate-700 rounded-full py-3 px-5 text-slate-300 focus:outline-none focus:border-purple-500" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-full text-white">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
