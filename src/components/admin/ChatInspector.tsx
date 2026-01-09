import React, { useState, useEffect } from 'react';
import { adminService, ChatLog } from '../../services/adminService';
import { ChevronDown, ChevronUp, Clock, User, MessageCircle, RefreshCw, History, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInspector = () => {
    const [logs, setLogs] = useState<ChatLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [indexLink, setIndexLink] = useState<string | null>(null);

    const fetchLogs = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        setIndexLink(null);
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/admin/chat-logs`);
            const data = await response.json();

            if (data.success) {
                // Convert backend data to ChatLog format
                const formattedLogs = data.logs.map((log: any) => ({
                    id: log.id,
                    question: log.userQuestion,
                    answer: log.aiResponse,
                    timestamp: log.timestamp ? { seconds: new Date(log.timestamp).getTime() / 1000 } : null,
                    userName: log.userId,
                    language: log.language,
                    intent: 'General'
                }));

                setLogs(formattedLogs);
            } else {
                setErrorMsg('Failed to load logs');
            }
        } catch (e: any) {
            console.error("Error fetching logs", e);
            setErrorMsg(e.message || "Failed to load logs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Helper to format timestamp
    const formatTime = (ts: any) => {
        if (!ts) return "Unknown";
        // Handle Firestore Timestamp
        if (ts.toDate) return ts.toDate().toLocaleString();
        // Handle JS Date
        return new Date(ts).toLocaleString();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">All User Interactions</h2>
                    <span className="bg-blue-900/30 text-blue-300 border border-blue-800 text-xs px-2 py-1 rounded">
                        Live & History
                    </span>
                </div>

                <button
                    onClick={fetchLogs}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-2"
                    title="Refresh Logs"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-bold hidden sm:inline">Refresh</span>
                </button>
            </div>

            {errorMsg && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200">
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {errorMsg}
                    </h3>
                    {indexLink && (
                        <div className="mt-2">
                            <a
                                href={indexLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-red-900/20"
                            >
                                Create Required Index
                                <span className="opacity-70 text-[10px]">(External Link)</span>
                            </a>
                            <p className="mt-2 text-xs text-red-400 opacity-80">
                                After clicking, wait 2-3 minutes for Firebase to build the index, then Refresh.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid gap-3">
                {logs.map((log) => (
                    <div key={log.id} className={`border rounded-xl overflow-hidden transition ${log.intent === "History" ? "bg-slate-900/20 border-slate-800/50" : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/60"}`}>
                        <div
                            onClick={() => toggleExpand(log.id)}
                            className="p-4 flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Time & User */}
                                <div className="flex flex-col min-w-[120px]">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(log.timestamp)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm md:text-md text-blue-300 font-medium truncate">
                                        <User className="w-3 h-3" />
                                        {log.userName || "Anonymous"}
                                    </div>
                                </div>

                                {/* Question Preview */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${log.intent === 'Marriage Timing' ? 'bg-pink-900/30 text-pink-400' :
                                            log.intent === 'History' ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                                                log.intent.includes('Job') ? 'bg-blue-900/30 text-blue-400' :
                                                    'bg-slate-800 text-slate-400'
                                            }`}>
                                            {log.intent || "General"}
                                        </span>
                                        {log.intent === "History" && (
                                            <span className="text-[10px] bg-yellow-900/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-900/30 flex items-center gap-1">
                                                <History className="w-3 h-3" /> Legacy
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-600 bg-slate-950 px-1 rounded">{log.language?.toUpperCase()}</span>
                                    </div>
                                    <p className="text-white text-sm truncate">{log.question !== "-" ? log.question : log.answer}</p>
                                </div>

                                {/* Feedback Badge */}
                                {log.feedback && (
                                    <div className="hidden sm:flex flex-col items-center justify-center px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg">
                                        <div className="flex items-center gap-1 text-yellow-400 font-bold">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{log.feedback.score}%</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Accuracy</span>
                                    </div>
                                )}
                            </div>

                            <div className="ml-4">
                                {expandedId === log.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedId === log.id && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="border-t border-slate-800/50 bg-slate-950/30 text-sm"
                                >
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* User Query */}
                                        {(!log.metadata?.legacy || log.metadata?.role === 'user') && (
                                            <div className={log.metadata?.role === 'ai' ? 'hidden' : ''}>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <User className="w-3 h-3" /> User Question
                                                </h4>
                                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300">
                                                    {log.question || "-"}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Response */}
                                        {(!log.metadata?.legacy || log.metadata?.role === 'ai') && (
                                            <div className={log.metadata?.role === 'user' ? 'hidden' : ''}>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <MessageCircle className="w-3 h-3" /> AI Answer
                                                </h4>
                                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    {log.answer === "-" ? "(See adjacent row for answer)" : log.answer}
                                                </div>
                                            </div>
                                        )}

                                        {/* User Feedback Display */}
                                        {log.feedback && (
                                            <div className="col-span-1 md:col-span-2 mt-2">
                                                <div className="bg-gradient-to-r from-purple-900/10 to-blue-900/10 border border-purple-500/20 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <h4 className="text-sm font-bold text-white">User Feedback: {log.feedback.score}% Accurate</h4>
                                                    </div>
                                                    {log.feedback.comment && (
                                                        <p className="text-sm text-slate-300 italic pl-6 border-l-2 border-purple-500/30">
                                                            "{log.feedback.comment}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadata Footer */}
                                    <div className="px-4 pb-4 pt-0 text-xs text-slate-600 font-mono break-all flex flex-col gap-1">
                                        <div className="flex justify-between">
                                            <span>
                                                <span className="font-bold text-slate-500">ID:</span> {log.id}
                                            </span>
                                            {log.intent === "History" && (
                                                <span className="text-yellow-700">Legacy Message Record</span>
                                            )}
                                        </div>
                                        {log.metadata?.dob && (
                                            <div className="flex gap-4 text-slate-400">
                                                <span><span className="font-bold text-slate-500">DOB:</span> {new Date(log.metadata.dob).toLocaleDateString()}</span>
                                                <span><span className="font-bold text-slate-500">Time:</span> {log.metadata.birthTime || "Unknown"}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {logs.length === 0 && !isLoading && (
                <div className="text-center p-12 text-slate-500">
                    No logs found. If this is a new deployment, historical logs may need an Index.
                    <br />Check Browser Console if 'History' logs are missing.
                </div>
            )}
        </div>
    );
};

export default ChatInspector;
