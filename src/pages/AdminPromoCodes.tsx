import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PromoCodeManager from '../components/admin/PromoCodeManager';
import { useAuth } from '../contexts/AuthContext';

// Simple wrapper to check auth and show the manager
const AdminPromoCodes: React.FC = () => {
    const navigate = useNavigate();

    // Basic Auth Check (reuse whatever admin logic you have, maybe localStorage)
    useEffect(() => {
        const auth = localStorage.getItem('admin_authenticated');
        if (auth !== 'true') {
            navigate('/admin/login');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors mb-4"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                {/* Reuse the EXACT SAME component */}
                <PromoCodeManager />
            </div>
        </div>
    );
};

export default AdminPromoCodes;
