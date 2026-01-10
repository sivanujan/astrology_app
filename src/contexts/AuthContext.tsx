import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    UserCredential,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import API_CONFIG, { apiCall } from '../config/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    register: (email: string, password: string, name: string) => Promise<UserCredential>;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<UserCredential>;
    loginWithGoogle: () => Promise<UserCredential>;
    logout: () => Promise<void>;
    resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const register = async (email: string, password: string, name: string): Promise<UserCredential> => {
        console.log('Starting registration for:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created:', userCredential.user.uid);

        // Send custom email verification via backend
        if (userCredential.user) {
            console.log('Sending custom verification email...');

            try {
                // Call YOUR backend API that uses the custom HTML template
                const result = await apiCall(API_CONFIG.endpoints.auth.sendVerification, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: userCredential.user.email,
                        userId: userCredential.user.uid
                    })
                });

                if (result.success) {
                    console.log('✅ Custom verification email sent successfully!');

                    // If in dev mode, use client-side method
                    if (result.devMode) {
                        console.log('🔧 DEV MODE: Using client-side email verification');
                        const { sendEmailVerification } = await import('firebase/auth');
                        await sendEmailVerification(userCredential.user);
                        console.log('✅ Client-side verification email sent');
                    }
                } else {
                    console.error('Failed to send verification email:', result.message);
                }
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }

            // Create user document in Firestore
            const ip = await getIpAddress();
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                firebase_uid: userCredential.user.uid,
                profile: {
                    name,
                    email,
                    role: 'user'
                },
                subscription: {
                    plan: 'free',
                    is_active: false
                },
                ip_address: ip,
                last_login_ip: ip,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        return userCredential;
    };



    const login = async (email: string, password: string, rememberMe: boolean = false): Promise<UserCredential> => {
        // Set persistence based on rememberMe preference (Local = Remember, Session = Don't Remember)
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (!userCredential.user.emailVerified) {
            await signOut(auth);
            throw new Error('Please verify your email before logging in. Check your inbox.');
        }

        // Update IP on login
        try {
            const ip = await getIpAddress();
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                last_login_ip: ip,
                last_login: new Date()
            }, { merge: true });
        } catch (e) {
            console.error("Failed to update login IP", e);
        }

        return userCredential;
    };

    const loginWithGoogle = async (): Promise<UserCredential> => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        const userCredential = await signInWithPopup(auth, provider);

        // Check if user document exists, if not create one
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (userDoc.exists()) {
            // Update Last Login & IP
            try {
                const ip = await getIpAddress();
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    last_login_ip: ip,
                    last_login: new Date()
                }, { merge: true });
            } catch (e) { console.error("Failed to update login stats", e); }
        } else {
            const ip = await getIpAddress();
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                firebase_uid: userCredential.user.uid,
                profile: {
                    name: userCredential.user.displayName || 'Unknown',
                    email: userCredential.user.email || '',
                    role: 'user'
                },
                subscription: {
                    plan: 'free',
                    is_active: false
                },
                ip_address: ip, // Registration IP
                last_login_ip: ip,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return userCredential;
    };

    // Helper to get IP
    const getIpAddress = async (): Promise<string> => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch (error) {
            console.error('Failed to get IP', error);
            return 'Unknown';
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const resendVerification = async () => {
        if (auth.currentUser) {
            try {
                // Call YOUR backend API for custom verification email
                const result = await apiCall(API_CONFIG.endpoints.auth.sendVerification, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: auth.currentUser.email,
                        userId: auth.currentUser.uid
                    })
                });

                if (!result.success) {
                    throw new Error(result.message || 'Failed to send verification email');
                }

                console.log('✅ Verification email resent successfully!');
            } catch (error) {
                console.error('Error resending verification email:', error);
                throw error;
            }
        } else {
            throw new Error('No user logged in');
        }
    };

    // Auto-logout functionality
    useEffect(() => {
        // 1 hour in milliseconds
        const INACTIVITY_TIMEOUT = 60 * 60 * 1000;

        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (user) {
                timeoutId = setTimeout(() => {
                    console.log('User inactive for 1 hour, logging out...');
                    logout();
                }, INACTIVITY_TIMEOUT);
            }
        };

        const handleActivity = () => {
            resetTimer();
        };

        if (user) {
            // Initial timer start
            resetTimer();

            // Add event listeners for user activity
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('click', handleActivity);
            window.addEventListener('scroll', handleActivity);
        }

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
        };
    }, [user]);

    const value = {
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        resendVerification
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
