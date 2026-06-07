import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, MapPin, Loader2 } from 'lucide-react';

interface UserData {
    id: string;
    profile: {
        name: string;
        email: string;
        role: string;
    };
    ip_address?: string;
    last_login_ip?: string;
    createdAt: any;
}

const UserList = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                // Order by most recent joiners
                const q = query(usersRef, orderBy('createdAt', 'desc'), limit(50));
                const snapshot = await getDocs(q);

                const fetchedUsers: UserData[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as UserData));

                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Registered Users</h2>
                    <p className="text-sm text-slate-400">Viewing last 50 signups</p>
                </div>
                <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium border border-blue-500/20">
                    Total: {users.length}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="p-4 font-medium border-b border-white/5">User</th>
                            <th className="p-4 font-medium border-b border-white/5">Role</th>
                            <th className="p-4 font-medium border-b border-white/5">IP Address</th>
                            <th className="p-4 font-medium border-b border-white/5">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user, index) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                                            <User className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.profile.name}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.profile.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${user.profile.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                        <Shield className="w-3 h-3" />
                                        {user.profile.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-slate-300 font-mono text-sm">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        {user.last_login_ip || user.ip_address || (
                                            <span className="text-slate-600 italic">Not Captured</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-slate-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-600" />
                                        {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {users.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-white/5">
                    No users found.
                </div>
            )}
        </div>
    );
};

export default UserList;
