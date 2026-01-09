import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

// Initialize FingerprintJS
let fpPromise: Promise<any> | null = null;

const initFingerprint = () => {
    if (!fpPromise) {
        fpPromise = FingerprintJS.load();
    }
    return fpPromise;
};

/**
 * Generate unique device fingerprint
 */
export const generateFingerprint = async (): Promise<string> => {
    try {
        const fp = await initFingerprint();
        const result = await fp.get();
        return result.visitorId;
    } catch (error) {
        console.error('Error generating fingerprint:', error);
        return 'fallback-' + Math.random().toString(36).substring(7);
    }
};

/**
 * Get detailed device information
 */
export const getDeviceInfo = async (): Promise<any> => {
    try {
        const fp = await initFingerprint();
        const result = await fp.get();

        return {
            fingerprint: result.visitorId,
            browser: getBrowserInfo(),
            os: getOSInfo(),
            screen: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            components: result.components
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return {
            fingerprint: 'unknown',
            browser: 'Unknown',
            os: 'Unknown',
            screen: 'Unknown'
        };
    }
};

/**
 * Get browser name and version
 */
const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
        browser = 'Firefox';
    } else if (ua.indexOf('Chrome') > -1) {
        browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
        browser = 'Safari';
    } else if (ua.indexOf('Edge') > -1) {
        browser = 'Edge';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
        browser = 'Opera';
    }

    return browser;
};

/**
 * Get operating system
 */
const getOSInfo = (): string => {
    const ua = navigator.userAgent;
    let os = 'Unknown';

    if (ua.indexOf('Win') > -1) {
        os = 'Windows';
    } else if (ua.indexOf('Mac') > -1) {
        os = 'MacOS';
    } else if (ua.indexOf('Linux') > -1) {
        os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
        os = 'Android';
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
        os = 'iOS';
    }

    return os;
};

/**
 * Get user's IP address (approximate)
 */
export const getIPAddress = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return 'unknown';
    }
};

/**
 * Register a new device for a user
 */
export const registerDevice = async (uid: string, fingerprint: string, deviceInfo: any, ipAddress: string): Promise<void> => {
    try {
        const deviceRef = doc(db, 'users', uid, 'devices', fingerprint);
        const deviceDoc = await getDoc(deviceRef);

        if (deviceDoc.exists()) {
            // Update existing device
            await setDoc(deviceRef, {
                lastSeen: serverTimestamp(),
                ipAddresses: [...new Set([...(deviceDoc.data().ipAddresses || []), ipAddress])].slice(-5) // Keep last 5 IPs
            }, { merge: true });
        } else {
            // Register new device
            await setDoc(deviceRef, {
                fingerprint,
                deviceInfo,
                firstSeen: serverTimestamp(),
                lastSeen: serverTimestamp(),
                ipAddresses: [ipAddress],
                isTrusted: false // Require manual trust or auto-trust after verification
            });
        }
    } catch (error: any) {
        // Device tracking is optional - log as warning, not error
        console.warn('⚠️ Device tracking unavailable (Firestore permissions):', error.message);
        // App continues normally without device tracking
    }
};

/**
 * Verify if device is trusted
 */
export const verifyDevice = async (uid: string, fingerprint: string): Promise<boolean> => {
    try {
        const deviceRef = doc(db, 'users', uid, 'devices', fingerprint);
        const deviceDoc = await getDoc(deviceRef);

        if (!deviceDoc.exists()) {
            return false; // New device
        }

        return deviceDoc.data().isTrusted || false;
    } catch (error) {
        console.error('Error verifying device:', error);
        return false;
    }
};

/**
 * Get user's trusted devices
 */
export const getTrustedDevices = async (uid: string): Promise<any[]> => {
    try {
        const devicesRef = collection(db, 'users', uid, 'devices');
        const q = query(devicesRef, where('isTrusted', '==', true));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting trusted devices:', error);
        return [];
    }
};

/**
 * Check for suspicious device changes
 */
export const checkSuspiciousActivity = async (uid: string, currentFingerprint: string, currentIP: string): Promise<{ isSuspicious: boolean; reason?: string }> => {
    try {
        const devicesRef = collection(db, 'users', uid, 'devices');
        const snapshot = await getDocs(devicesRef);

        const devices = snapshot.docs.map(doc => doc.data());

        // Check 1: Too many devices (more than 3)
        if (devices.length > 3) {
            return { isSuspicious: true, reason: 'Too many devices registered' };
        }

        // Check 2: Rapid device switching (different fingerprint within 1 hour)
        const recentDevices = devices.filter(d => {
            const lastSeen = d.lastSeen?.toDate();
            if (!lastSeen) return false;
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return lastSeen > hourAgo && d.fingerprint !== currentFingerprint;
        });

        if (recentDevices.length > 0) {
            return { isSuspicious: true, reason: 'Rapid device switching detected' };
        }

        // Check 3: Completely different IP range (different country)
        // This is a simplified check - in production, use a geolocation API
        const currentIPPrefix = currentIP.split('.').slice(0, 2).join('.');
        const hasMatchingIP = devices.some(d =>
            d.ipAddresses?.some((ip: string) => ip.startsWith(currentIPPrefix))
        );

        if (devices.length > 0 && !hasMatchingIP) {
            return { isSuspicious: true, reason: 'Unusual IP address detected' };
        }

        return { isSuspicious: false };
    } catch (error) {
        console.error('Error checking suspicious activity:', error);
        return { isSuspicious: false };
    }
};

/**
 * Initialize device tracking for current session
 */
export const initDeviceTracking = async (uid: string): Promise<{ fingerprint: string; ipAddress: string; deviceInfo: any }> => {
    try {
        const fingerprint = await generateFingerprint();
        const ipAddress = await getIPAddress();
        const deviceInfo = await getDeviceInfo();

        await registerDevice(uid, fingerprint, deviceInfo, ipAddress);

        return { fingerprint, ipAddress, deviceInfo };
    } catch (error) {
        console.error('Error initializing device tracking:', error);
        return {
            fingerprint: 'unknown',
            ipAddress: 'unknown',
            deviceInfo: {}
        };
    }
};
