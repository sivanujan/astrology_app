import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MessageSquare, LogOut, Database } from 'lucide-react';
import RulesManager from '../components/admin/RulesManager';
import ChatInspector from '../components/admin/ChatInspector';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'rules' | 'chats'>('rules');
    const navigate = useNavigate();

    // Basic Auth Check
    React.useEffect(() => {
        const auth = localStorage.getItem('admin_authenticated');
        if (auth !== 'true') {
            navigate('/admin/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 p-2 rounded-lg">
                                <Settings className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                Admin Control Panel
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${activeTab === 'rules'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        Rules Engine
                    </button>
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${activeTab === 'chats'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat Logs
                    </button>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'rules' ? <RulesManager /> : <ChatInspector />}
                </motion.div>

            </main>
        </div>
    );
};

export default AdminDashboard;
