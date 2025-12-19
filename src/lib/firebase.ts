import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Get these from Firebase Console -> Project Settings -> Your apps -> Firebase SDK snippet
const firebaseConfig = {
    apiKey: "AIzaSyCyHcmJqumYDQ92NO45ldYwy2bcPOGwy30",
    authDomain: "sivaastro-3b9f4.firebaseapp.com",
    projectId: "sivaastro-3b9f4",
    storageBucket: "sivaastro-3b9f4.firebasestorage.app",
    messagingSenderId: "852601920450",
    appId: "1:852601920450:web:099b8e7ff75a43a6a6145b",
    measurementId: "G-T4JK9YEVGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper for 'Unauthorized Domain' error
if (typeof window !== 'undefined' && window.location.hostname.match(/\d+\.\d+\.\d+\.\d+/)) {
    console.warn(`[Firebase Auth] You are accessing via IP (${window.location.hostname}). If login fails with "Unauthorized Domain":
    1. Go to Firebase Console -> Authentication -> Settings -> Authorized Domains.
    2. Add this IP address: ${window.location.hostname}`);
}

export default app;
