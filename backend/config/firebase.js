const admin = require('firebase-admin');

// Load environment variables FIRST
require('dotenv').config();

/**
 * Initialize Firebase Admin SDK
 * Handles Firestore database connection
 */
let db = null;
let auth = null;

const initializeFirebase = () => {
    try {
        // Check if already initialized
        if (admin.apps.length > 0) {
            console.log('✅ Firebase already initialized');
            db = admin.firestore();
            auth = admin.auth();
            return { db, auth };
        }

        // Check for required environment variables
        if (!process.env.FIREBASE_PROJECT_ID) {
            throw new Error('FIREBASE_PROJECT_ID is not defined in environment variables');
        }

        // Initialize with service account credentials
        const serviceAccount = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });

        db = admin.firestore();
        auth = admin.auth();

        // Firestore settings
        db.settings({
            ignoreUndefinedProperties: true,
            timestampsInSnapshots: true
        });

        console.log(`✅ Firebase Admin SDK initialized`);
        console.log(`📊 Project: ${process.env.FIREBASE_PROJECT_ID}`);

        return { db, auth };

    } catch (error) {
        console.error(`❌ Firebase Initialization Failed: ${error.message}`);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Initialize on first require
const { db: firestore, auth: firebaseAuth } = initializeFirebase();

// Export instances
module.exports = {
    db: firestore,
    auth: firebaseAuth,
    admin
};
