import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface PushOptInProps {
    uid: string;
}

const PushOptIn: React.FC<PushOptInProps> = ({ uid }) => {
    const { language } = useLanguage();
    const isTamil = language === 'ta';

    const [permission, setPermission] = useState(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'default';
    });
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        // Check if already subscribed
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.pushManager.getSubscription().then(sub => {
                    if (sub) setSubscribed(true);
                });
            });
        }
    }, []);

    const subscribeToPush = async () => {
        setLoading(true);
        try {
            // 1. Get Public Key
            const keyRes = await fetch(`${API_URL}/api/notifications/vapid-key`);
            const { publicKey } = await keyRes.json();
            const convertedKey = urlBase64ToUint8Array(publicKey);

            // 2. Request Permission & Subscribe
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
            });

            // 3. Send to Server
            await fetch(`${API_URL}/api/notifications/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription,
                    uid,
                    userAgent: navigator.userAgent
                })
            });

            setPermission('granted');
            setSubscribed(true);
            new Notification(isTamil ? "வெற்றி!" : "Success!", {
                body: isTamil ? "அறிவிப்புகள் செயல்படுத்தப்பட்டன" : "Notifications enabled successfully"
            });

        } catch (error) {
            console.error('Push Config Failed:', error);
            alert('Failed to enable notifications. Please try again or check browser settings.');
        } finally {
            setLoading(false);
        }
    };

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return null; // Not supported
    }

    if (subscribed) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
                {isTamil ? 'அறிவிப்புகள் ஆன்' : 'Notifications Active'}
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-sm font-bold">
                <BellOff className="w-4 h-4" />
                {isTamil ? 'அறிவிப்புகள் தடுக்கப்பட்டன' : 'Notifications Blocked'}
            </div>
        );
    }

    return (
        <button
            onClick={subscribeToPush}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/50 rounded-full text-sm font-bold transition-all shadow-lg shadow-purple-900/20"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4 animate-bounce" />}
            {isTamil ? 'தினசரி அறிவிப்புகளை பெறுக' : 'Enable Daily Alerts'}
        </button>
    );
};

export default PushOptIn;
