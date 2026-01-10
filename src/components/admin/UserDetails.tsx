import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, MessageSquare, Globe, Smartphone, Loader2, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface UserDetailsProps {
    uid: string;
    onClose: () => void;
}

interface UserInfo {
    uid: string;
    email: string;
    displayName: string;
    phone: string;
    dob: string;
    birthTime: string;
    location: string;
    createdAt: Date | null;
    lastLogin: Date | null;
    totalChats: number;
    hasActivePromo: boolean;
    promoCode: string | null;
    promoExpiresAt: Date | null;
    ipAddresses: string[];
    deviceFingerprints: string[];
    latestUsage?: {
        date: string;
        count: number;
        lastChatAt: string;
    } | null;
}

interface Message {
    id: string;
    role: string;
    content: string;
    timestamp: Date;
    language: string;
    ipAddress: string;
    deviceFingerprint: string;
}

interface Chart {
    chartId: string;
    chartName: string;
    createdAt: Date | null;
    messageCount: number;
    messages: Message[];
}

const UserDetails: React.FC<UserDetailsProps> = ({ uid, onClose }) => {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [charts, setCharts] = useState<Chart[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChart, setExpandedChart] = useState<string | null>(null);
    const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchUserDetails();
        fetchUserChats();
    }, [uid]);

    const fetchUserDetails = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/admin/user/${uid}`);
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserChats = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/admin/user/${uid}/chats`);
            const data = await response.json();

            if (data.success) {
                setCharts(data.charts || []);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
            setCharts([]);
        }
    };

    const formatDate = (date: Date | null | string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportChats = () => {
        const allMessages = charts.flatMap(chart =>
            chart.messages.map(msg => ({
                chartId: chart.chartId,
                chartName: chart.chartName,
                ...msg
            }))
        );
        const data = JSON.stringify(allMessages, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_${uid}_chats.json`;
        a.click();
    };

    const handleResetLimit = async () => {
        if (!user || !user.latestUsage) return;

        if (!confirm(`Are you sure you want to reset the limit for ${user.displayName}? \nThis will clear the usage for ${user.latestUsage.date}.`)) {
            return;
        }

        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/admin/user/${uid}/reset-limit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: user.latestUsage.date })
            });
            const data = await response.json();

            if (data.success) {
                alert('Limit reset successfully!');
                fetchUserDetails(); // Refresh data
            } else {
                alert('Failed to reset limit: ' + data.message);
            }
        } catch (error) {
            console.error('Error resetting limit:', error);
            alert('Error resetting limit');
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
                                <p className="text-slate-400">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 space-y-6">
                        {/* User Profile */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                    <Phone className="w-4 h-4" />
                                    Phone
                                </div>
                                <div className="text-white font-medium">{user.phone}</div>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    DOB
                                </div>
                                <div className="text-white font-medium">{user.dob}</div>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                    <Calendar className="w-4 h-4" />
                                    Registered
                                </div>
                                <div className="text-white font-medium">{formatDate(user.createdAt)}</div>
                            </div>
                            <div className="bg-slate-800/30 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                    <MessageSquare className="w-4 h-4" />
                                    Total Chats
                                </div>
                                <div className="text-purple-400 font-bold text-xl">{user.totalChats}</div>
                            </div>
                        </div>

                        {/* Daily Limit Status */}
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-purple-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-white font-semibold mb-2">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                        Daily Limit Status
                                    </div>
                                    {user.latestUsage ? (
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-slate-400">
                                                Date: <span className="text-white font-mono">{user.latestUsage.date}</span>
                                            </div>
                                            <div className="text-slate-400">
                                                Used: <span className={`font-bold ${user.latestUsage.count >= 2 ? 'text-red-400' : 'text-green-400'}`}>
                                                    {user.latestUsage.count}/2
                                                </span>
                                            </div>
                                            <div className="text-slate-400">
                                                Last: <span className="text-white">{formatDate(user.latestUsage.lastChatAt)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-sm">No chats used today</div>
                                    )}
                                </div>
                                {user.latestUsage && (
                                    <button
                                        onClick={handleResetLimit}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Reset Limit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* IP Addresses */}
                        <div className="bg-slate-800/30 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-white font-semibold mb-3">
                                <Globe className="w-5 h-5 text-purple-400" />
                                IP Addresses ({user.ipAddresses.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {user.ipAddresses.map((ip, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-700/50 rounded-lg text-sm font-mono text-slate-300">
                                        {ip}
                                    </span>
                                ))}
                                {user.ipAddresses.length === 0 && <span className="text-slate-500">No IP data</span>}
                            </div>
                        </div>

                        {/* Device Fingerprints */}
                        <div className="bg-slate-800/30 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-white font-semibold mb-3">
                                <Smartphone className="w-5 h-5 text-blue-400" />
                                Devices ({user.deviceFingerprints.length})
                            </div>
                            <div className="space-y-1">
                                {user.deviceFingerprints.map((fp, i) => (
                                    <div key={i} className="text-xs font-mono text-slate-400 break-all">{fp}</div>
                                ))}
                                {user.deviceFingerprints.length === 0 && <span className="text-slate-500">No device data</span>}
                            </div>
                        </div>

                        {/* Charts & Messages */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-purple-400" />
                                    Charts ({charts.length})
                                </h3>
                                {charts.length > 0 && (
                                    <button
                                        onClick={exportChats}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {charts.map((chart) => (
                                    <div key={chart.chartId} className="bg-slate-800/30 rounded-lg overflow-hidden border border-white/5">
                                        <div
                                            onClick={() => setExpandedChart(expandedChart === chart.chartId ? null : chart.chartId)}
                                            className="p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="text-white font-medium mb-1">{chart.chartName}</div>
                                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                                        <span>{chart.messageCount} messages</span>
                                                        <span>{formatDate(chart.createdAt)}</span>
                                                    </div>
                                                </div>
                                                {expandedChart === chart.chartId ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                            </div>
                                        </div>

                                        {expandedChart === chart.chartId && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="border-t border-white/5 p-4 bg-slate-900/50 space-y-2"
                                            >
                                                {chart.messages.map((msg) => (
                                                    <div key={msg.id} className="bg-slate-800/50 rounded p-3">
                                                        <div className="flex items-start gap-2">
                                                            <div className={`px-2 py-0.5 rounded text-xs font-medium ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                                                                {msg.role === 'user' ? 'USER' : 'AI'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="text-sm text-white whitespace-pre-wrap">{msg.content}</div>
                                                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                                                    <span>{formatDate(msg.timestamp)}</span>
                                                                    <span>{msg.ipAddress}</span>
                                                                    <span>{msg.language}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}

                                {charts.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        No charts found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserDetails;
