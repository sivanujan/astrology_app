import React, { useState, useEffect } from 'react';
import { adminService, AstrologyRule } from '../../services/adminService';
import { LAGNA_SPECIFIC_RULES } from '../../utils/aiOrchestrator';
import { Edit2, Trash2, Save, X, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RulesManager = () => {
    const [rules, setRules] = useState<AstrologyRule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingRule, setEditingRule] = useState<AstrologyRule | null>(null);
    const [newRuleMode, setNewRuleMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<AstrologyRule>>({});

    const fetchRules = async () => {
        setIsLoading(true);
        const data = await adminService.getAllRules();
        setRules(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleSeed = async () => {
        if (!window.confirm("This will overwrite existing rules with default code-based rules. Continue?")) return;
        setIsLoading(true);
        await adminService.seedRules(LAGNA_SPECIFIC_RULES);
        await fetchRules();
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!formData.key || !formData.content) return;

        setIsLoading(true);
        await adminService.saveRule({
            id: formData.key, // ID match Key for simplicity
            key: formData.key,
            category: (formData.category as any) || "General",
            content: formData.content,
            description: formData.description || ""
        });
        setEditingRule(null);
        setNewRuleMode(false);
        setFormData({});
        await fetchRules();
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this rule?")) return;
        setIsLoading(true);
        await adminService.deleteRule(id);
        await fetchRules();
        setIsLoading(false);
    };

    const startEdit = (rule: AstrologyRule) => {
        setEditingRule(rule);
        setFormData({ ...rule });
        setNewRuleMode(false);
    };

    const startNew = () => {
        setFormData({ key: "", category: "General", content: "", description: "" });
        setNewRuleMode(true);
        setEditingRule(null);
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">Rule Definitions</h2>
                    <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-400">{rules.length} Rules</span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSeed}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-yellow-500 transition border border-slate-700"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Seed Defaults
                    </button>
                    <button
                        onClick={startNew}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Rule
                    </button>
                </div>
            </div>

            {/* Editor (Modal-ish or Inline) */}
            <AnimatePresence>
                {(editingRule || newRuleMode) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-900 border border-purple-500/30 p-6 rounded-xl space-y-4"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-purple-300">
                                {newRuleMode ? "Create New Rule" : `Editing: ${editingRule?.key}`}
                            </h3>
                            <button onClick={() => { setEditingRule(null); setNewRuleMode(false); }} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Rule Key (Unique ID)</label>
                                <input
                                    disabled={!newRuleMode}
                                    value={formData.key || ''}
                                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-sm focus:border-purple-500 outline-none"
                                    placeholder="e.g., Simha, Kataka"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                                <select
                                    value={formData.category || 'General'}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-purple-500 outline-none"
                                >
                                    <option value="Lagna">Lagna Rule</option>
                                    <option value="General">General Rule</option>
                                    <option value="Planet">Planet Rule</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Rule Description</label>
                            <input
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-purple-500 outline-none"
                                placeholder="Short description..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Prompt Content (The Logic)</label>
                            <textarea
                                rows={12}
                                value={formData.content || ''}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-300 font-mono text-sm leading-relaxed focus:border-purple-500 outline-none resize-y"
                                placeholder="Enter the AI Prompt instructions here..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => { setEditingRule(null); setNewRuleMode(false); }} className="px-4 py-2 rounded text-slate-400 hover:bg-slate-800 transition">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-lg shadow-purple-900/20 transition flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Rule
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {rules.map((rule) => (
                    <div key={rule.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition flex justify-between group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded border ${rule.category === 'Lagna' ? 'bg-indigo-900/30 text-indigo-300 border-indigo-800' :
                                        rule.category === 'Planet' ? 'bg-pink-900/30 text-pink-300 border-pink-800' :
                                            'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                    {rule.category}
                                </span>
                                <h3 className="font-bold text-white text-lg">{rule.key}</h3>
                            </div>
                            <p className="text-slate-400 text-sm mb-2">{rule.description || "No description provided."}</p>
                            <div className="bg-slate-950/50 p-2 rounded border border-slate-800/50 w-full overflow-hidden">
                                <p className="text-slate-500 font-mono text-xs truncate">{rule.content.substring(0, 150)}...</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                            <button
                                onClick={() => startEdit(rule)}
                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition"
                                title="Edit"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(rule.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {rules.length === 0 && !isLoading && (
                <div className="text-center p-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">
                    <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No Rules Found in Database.</p>
                    <p className="text-slate-500 text-sm mt-2">Click "Seed Defaults" to load the built-in Guruji rules.</p>
                </div>
            )}
        </div>
    );
};

export default RulesManager;
