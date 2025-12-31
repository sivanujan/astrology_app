import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MessageSquare, LogOut, Database, User } from 'lucide-react';
import RulesManager from '../components/admin/RulesManager';
import ChatInspector from '../components/admin/ChatInspector';
import { useNavigate } from 'react-router-dom';

import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';

import UserList from '../components/admin/UserList';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'rules' | 'chats' | 'users'>('rules');
    const [totalUsers, setTotalUsers] = useState<number | null>(null);
    const navigate = useNavigate();

    // Basic Auth Check
    React.useEffect(() => {
        const auth = localStorage.getItem('admin_authenticated');
        if (auth !== 'true') {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Fetch User Count
    React.useEffect(() => {
        async function fetchStats() {
            try {
                const coll = collection(db, 'users');
                const snapshot = await getCountFromServer(coll);
                setTotalUsers(snapshot.data().count);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        }
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-purple-900/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-900/10 blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/20">
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                                    Cosmic Admin
                                </h1>
                                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Control Center</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <span className="text-sm font-medium">Sign Out</span>
                            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
                        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-white/20 transition duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                    +12% vs last week
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-1">
                                    {totalUsers !== null ? totalUsers.toLocaleString() : '...'}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium">Total Registered Users</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Content Tabs area */}
                <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 p-1 bg-slate-900/50 backdrop-blur rounded-xl border border-white/5 w-fit">
                        <button
                            onClick={() => setActiveTab('rules')}
                            className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'rules'
                                ? 'text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {activeTab === 'rules' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-purple-600 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Rules Engine
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('chats')}
                            className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'chats'
                                ? 'text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {activeTab === 'chats' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Chat Logs
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('users')}
                            className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'users'
                                ? 'text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {activeTab === 'users' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-indigo-600 rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <User className="w-4 h-4" />
                                User List
                            </span>
                        </button>
                    </div>

                    {/* Active View */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm min-h-[500px]"
                    >
                        {activeTab === 'rules' && <RulesManager />}
                        {activeTab === 'chats' && <ChatInspector />}
                        {activeTab === 'users' && <UserList />}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
