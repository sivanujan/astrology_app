// Quick test to check if chat limits are being properly stored
// Run with: node test-chat-limit.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (reusing config from backend)
const serviceAccount = require('./backend/config/serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkChatLimits() {
    try {
        // Get all users
        const usersSnapshot = await db.collection('users').limit(5).get();

        console.log('\n=== CHAT LIMIT STATUS ===\n');

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            console.log(`User: ${userData.email || userId}`);

            // Check today's usage
            const today = new Date().toISOString().split('T')[0];
            const usageDoc = await db.collection('users').doc(userId)
                .collection('chat_usage')
                .doc(today)
                .get();

            if (usageDoc.exists) {
                const usage = usageDoc.data();
                console.log(`  Today (${today}): ${usage.count}/5 chats`);
                console.log(`  Last chat: ${usage.lastChatAt?.toDate()}`);
                console.log(`  Device: ${usage.deviceFingerprint}`);
            } else {
                console.log(`  No usage today`);
            }

            console.log('');
        }

    } catch (error) {
        console.error('Error checking chat limits:', error);
    } finally {
        process.exit(0);
    }
}

checkChatLimits();
