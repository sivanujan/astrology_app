import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Clock, Save, AlertCircle, Loader2 } from 'lucide-react';
import { collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PromoCode {
    id: string;
    code: string;
    duration: string; // '1_day', '1_week', '1_month', 'lifetime'
    maxUses: number;
    currentUses: number;
    expiresAt?: any; // Timestamp
    status: 'active' | 'disabled';
    createdAt?: any;
}

const PromoCodeManager = () => {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
    const [error, setError] = useState('');

    // Form State
    const [newCode, setNewCode] = useState('');
    const [newDuration, setNewDuration] = useState('1_week');
    const [newExpiry, setNewExpiry] = useState('');
    const [newMaxUses, setNewMaxUses] = useState('100');

    // Fetch Promos
    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            // Use backend API instead of direct Firestore read
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/list`);

            if (!response.ok) {
                throw new Error('Failed to fetch promo codes');
            }

            const data = await response.json();

            if (data.success && data.promoCodes) {
                setPromos(data.promoCodes);
            } else {
                console.warn('No promo codes found or invalid response');
                setPromos([]);
            }
        } catch (err: any) {
            console.error("Error fetching promo codes:", err);
            setPromos([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const codeId = newCode.toUpperCase().trim();
            if (!codeId) throw new Error("Code is required");

            // Default expiry if not set: 1 year from now
            let finalExpiry = new Date();
            if (newExpiry) {
                finalExpiry = new Date(newExpiry);
            } else {
                finalExpiry.setFullYear(finalExpiry.getFullYear() + 1);
            }

            // Use backend API instead of direct Firestore write
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: codeId,
                    duration: newDuration,
                    maxUses: Number(newMaxUses),
                    expiresAt: finalExpiry.toISOString(),
                    adminEmail: 'admin' // You can get this from auth context if needed
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create promo code');
            }

            const result = await response.json();
            console.log('Promo code created:', result);

            // Reset Form
            setIsCreating(false);
            setNewCode('');
            setNewDuration('1_week');
            setNewExpiry('');
            setNewMaxUses('100');

            // Refresh
            fetchPromos();

        } catch (err: any) {
            console.error("Error creating promo:", err);
            setError(err.message || "Failed to create promo code");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this promo code?')) return;
        try {
            // Use backend API instead of direct Firestore delete
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/delete/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete promo code');
            }

            // Update local state
            setPromos(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error deleting promo:", err);
            alert("Failed to delete promo code");
        }
    };

    const handleEdit = (promo: PromoCode) => {
        setEditingCode(promo);
        setIsEditing(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCode) return;

        setError('');
        setLoading(true);

        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/promo/admin/update/${editingCode.code}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: editingCode.status,
                    maxUses: editingCode.maxUses,
                    expiresAt: editingCode.expiresAt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update promo code');
            }

            // Refresh list
            fetchPromos();
            setIsEditing(false);
            setEditingCode(null);

        } catch (err: any) {
            console.error("Error updating promo:", err);
            setError(err.message || 'Failed to update promo code');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format duration display
    const formatDuration = (d: string) => {
        switch (d) {
            case '1_day': return '24 Hours Access';
            case '3_days': return '3 Days Access';
            case '1_week': return '1 Week Access';
            case '1_month': return '1 Month Access';
            case 'lifetime': return 'Lifetime Access';
            case 'week': return '1 Week Access'; // Legacy support
            case 'month': return '1 Month Access'; // Legacy support
            default: return d.replace('_', ' ') + ' Access';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Tag className="w-6 h-6 text-purple-400" />
                        Chat Access Codes
                    </h2>
                    <p className="text-slate-400 text-sm">Create codes for free AI Chat access</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/20"
                >
                    <Plus className="w-4 h-4" />
                    Create New
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* CREATE MODAL / INLINE FORM */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-900/50 border border-white/10 rounded-xl p-6 overflow-hidden"
                    >
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Code Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCode}
                                        onChange={e => setNewCode(e.target.value)}
                                        placeholder="e.g. VIP2025"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 uppercase font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Chat Access Duration</label>
                                    <select
                                        value={newDuration}
                                        onChange={e => setNewDuration(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="1_day">1 Day (Trial)</option>
                                        <option value="3_days">3 Days</option>
                                        <option value="1_week">1 Week</option>
                                        <option value="1_month">1 Month</option>
                                        <option value="lifetime">Lifetime Access</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Max Uses</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newMaxUses}
                                        onChange={e => setNewMaxUses(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Expires On (Optional)</label>
                                    <input
                                        type="date"
                                        value={newExpiry}
                                        onChange={e => setNewExpiry(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Create Code
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EDIT MODAL */}
            <AnimatePresence>
                {isEditing && editingCode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-purple-500/30 shadow-2xl mb-6"
                    >
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-purple-400" />
                            Edit Promo Code: {editingCode.code}
                        </h3>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={editingCode.status}
                                        onChange={(e) => setEditingCode({ ...editingCode, status: e.target.value as 'active' | 'disabled' })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Max Uses
                                    </label>
                                    <input
                                        type="number"
                                        value={editingCode.maxUses}
                                        onChange={(e) => setEditingCode({ ...editingCode, maxUses: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingCode(null);
                                    }}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Code
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promos.map(promo => (
                    <motion.div
                        key={promo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-slate-900/30 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors group relative"
                    >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/?promo=${promo.code}`;
                                        navigator.clipboard.writeText(url);
                                        alert(`Promo Link Copied!\n${url}`);
                                    }}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-blue-400 hover:text-blue-300 bg-slate-900/80 backdrop-blur"
                                    title="Copy Shareable Link"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                </button>
                                <button
                                    onClick={() => handleEdit(promo)}
                                    className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-500 hover:text-blue-400 transition-colors bg-slate-900/80 backdrop-blur"
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(promo.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors bg-slate-900/80 backdrop-blur"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Tag className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 uppercase">
                                    {formatDuration(promo.duration)}
                                </span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white tracking-wider font-mono">{promo.code}</h3>

                        <div className="mt-4 space-y-2 text-sm text-slate-400">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Duration:</span>
                                <span className="text-white font-medium">{formatDuration(promo.duration)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                                <span>Used:</span>
                                <span className="text-white">{promo.currentUses} {promo.maxUses ? `/ ${promo.maxUses}` : ''}</span>
                            </div>

                            {promo.expiresAt && (
                                <div className="flex justify-between">
                                    <span>Expires:</span>
                                    <span className="text-white">
                                        {promo.expiresAt.toDate ? promo.expiresAt.toDate().toLocaleDateString() : new Date(promo.expiresAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {promos.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No active chat codes</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoCodeManager;
