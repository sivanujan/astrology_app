import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    register: (email: string, password: string, name: string) => Promise<UserCredential>;
    login: (email: string, password: string) => Promise<UserCredential>;
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

        // Send email verification
        if (userCredential.user) {
            console.log('Sending verification email...');
            const actionCodeSettings = {
                url: `${window.location.origin}/login?verified=true`,
                handleCodeInApp: false,
            };

            try {
                await sendEmailVerification(userCredential.user, actionCodeSettings);
                console.log('Verification email sent successfully');
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }

            // Create user document in Firestore
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
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        return userCredential;
    };



    const login = async (email: string, password: string): Promise<UserCredential> => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (!userCredential.user.emailVerified) {
            await signOut(auth);
            throw new Error('Please verify your email before logging in. Check your inbox.');
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

        if (!userDoc.exists()) {
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
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return userCredential;
    };

    const logout = async () => {
        await signOut(auth);
    };

    const resendVerification = async () => {
        if (auth.currentUser) {
            const actionCodeSettings = {
                url: `${window.location.origin}/login?verified=true`,
                handleCodeInApp: false,
            };
            await sendEmailVerification(auth.currentUser, actionCodeSettings);
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
