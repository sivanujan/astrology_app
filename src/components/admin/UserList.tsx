import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Eye, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import UserDetails from './UserDetails';

interface User {
    uid: string;
    email: string;
    displayName: string;
    createdAt: Date | null;
    lastLogin: Date | null;
    totalChats: number;
}

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            const response = await fetch(`${apiUrl}/api/admin/users`);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">User Management</h2>
                        <p className="text-slate-400">Total Users: {users.length}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white w-64"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/30 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-800/50">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Email</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Display Name</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Registered</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Last Login</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Chats</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <motion.tr
                                key={user.uid}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-t border-white/5 hover:bg-slate-800/30 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                                <td className="px-6 py-4 text-sm text-white">{user.displayName}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(user.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">{formatDate(user.lastLogin)}</td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <MessageSquare className="w-4 h-4" />
                                        {user.totalChats}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setSelectedUser(user.uid)}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        No users found
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <UserDetails
                    uid={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default UserList;
