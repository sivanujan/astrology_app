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

export default app;
