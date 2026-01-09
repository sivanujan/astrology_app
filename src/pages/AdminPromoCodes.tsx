import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Plus, Edit2, Trash2, Calendar, Users, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PromoCode {
    code: string;
    duration: string;
    createdAt: Date;
    expiresAt: Date;
    maxUses: number;
    currentUses: number;
    createdBy: string;
    status: string;
}

const AdminPromoCodes: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        duration: 'week',
        maxUses: 100,
        expiresAt: ''
    });

    // Check if user is admin (you should implement proper admin check)
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // TODO: Add admin role check here
        // if (!user.isAdmin) navigate('/dashboard');
    }, [user, navigate]);

    // Fetch promo codes
    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/list`);
            const data = await response.json();

            if (data.success) {
                setPromoCodes(data.promoCodes);
            }
        } catch (error) {
            console.error('Error fetching promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    adminEmail: user?.email || 'admin'
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowCreateModal(false);
                setFormData({ code: '', duration: 'week', maxUses: 100, expiresAt: '' });
                fetchPromoCodes();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating promo code:', error);
            alert('Failed to create promo code');
        }
    };

    const handleDelete = async (code: string) => {
        if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;

        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/delete/${code}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                fetchPromoCodes();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting promo code:', error);
            alert('Failed to delete promo code');
        }
    };

    const handleToggleStatus = async (code: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/update/${code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                fetchPromoCodes();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating promo code:', error);
            alert('Failed to update promo code');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Gift className="w-8 h-8 text-purple-400" />
                            Promo Code Management
                        </h1>
                        <p className="text-slate-400 mt-2">Create and manage promotional codes</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Promo Code
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="text-slate-400 text-sm mb-2">Total Codes</div>
                        <div className="text-3xl font-bold text-white">{promoCodes.length}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="text-slate-400 text-sm mb-2">Active Codes</div>
                        <div className="text-3xl font-bold text-green-400">
                            {promoCodes.filter(p => p.status === 'active').length}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <div className="text-slate-400 text-sm mb-2">Total Uses</div>
                        <div className="text-3xl font-bold text-purple-400">
                            {promoCodes.reduce((sum, p) => sum + p.currentUses, 0)}
                        </div>
                    </div>
                </div>

                {/* Promo Codes Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Expires</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Uses</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {promoCodes.map((promo) => (
                                    <tr key={promo.code} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-mono font-semibold text-purple-400">{promo.code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-slate-300 capitalize">{promo.duration}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(promo.expiresAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Users className="w-4 h-4" />
                                                {promo.currentUses} / {promo.maxUses}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${promo.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {promo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(promo.code, promo.status)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title={promo.status === 'active' ? 'Disable' : 'Enable'}
                                                >
                                                    {promo.status === 'active' ? (
                                                        <X className="w-4 h-4 text-red-400" />
                                                    ) : (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.code)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-800"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Create Promo Code</h2>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="PROMO2026"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                                    <select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                                    >
                                        <option value="week">1 Week</option>
                                        <option value="month">1 Month</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Uses</label>
                                    <input
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Expires At</label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPromoCodes;
