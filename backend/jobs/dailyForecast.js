const cron = require('node-cron');
const { db } = require('../config/firebase');
const webPush = require('web-push');

// Configure Web Push (Env vars loaded by server.js)
// We rely on server.js calling this file, so envs should be present.
// If running standalone, might need dotenv.
if (process.env.VAPID_PUBLIC_KEY) {
    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

const getDailyInsight = (language) => {
    // Rotating simple insights for MVP daily alert
    const insightsTa = [
        "இன்று சந்திராஷ்டமம் உள்ளவர்கள் கவனமாக இருக்கவும்.",
        "குரு பார்வை பல நன்மைகளைத் தரும்.",
        "சனி பகவான் கர்ம வினைகளைத் தீர்ப்பார்.",
        "ராகு/கேது வழிபாடு நன்மை தரும்.",
        "இன்று புதிய முயற்சிகளைத் தவிர்க்கவும்."
    ];
    const insightsEn = [
        "Caution advised for those with Chandrashtama today.",
        "Jupiter's aspect brings many benefits.",
        "Saturn resolves karmic debts.",
        "Worship of Rahu/Ketu brings relief.",
        "Avoid new ventures today."
    ];

    // Use day of year to rotate consistently
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const idx = dayOfYear % insightsEn.length;
    return language === 'ta' ? insightsTa[idx] : insightsEn[idx];
};

const runDailyJob = async () => {
    console.log('Running Daily Push Notification Job...');
    try {
        // 1. Get Users with Push Enabled
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('preferences.pushEnabled', '==', true).get();

        if (snapshot.empty) {
            console.log('No users subscribed for push alerts.');
            return;
        }

        const date = new Date().toLocaleDateString('en-GB');

        for (const doc of snapshot.docs) {
            const user = doc.data();
            const language = user.preferences.language || 'en';
            const insight = getDailyInsight(language);
            const title = language === 'ta' ? `📅 தினசரி பலன் (${date})` : `📅 Daily Forecast (${date})`;

            // 2. Get User's Subscriptions
            const subsSnapshot = await usersRef.doc(doc.id).collection('push_subscriptions').get();

            const checks = subsSnapshot.docs.map(async (subDoc) => {
                const subscription = subDoc.data().subscription;

                const payload = JSON.stringify({
                    title: title,
                    body: insight,
                    url: '/dashboard'
                });

                try {
                    await webPush.sendNotification(subscription, payload);
                    console.log(`Sent push to user ${doc.id}`);
                } catch (error) {
                    // 410 Gone = Expired Subscription
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        console.log(`Deleting expired subscription for ${doc.id}`);
                        await subDoc.ref.delete();
                    } else {
                        console.error('Push Error:', error.message);
                    }
                }
            });

            await Promise.all(checks);
        }
    } catch (error) {
        console.error('Daily Job Failed:', error);
    }
};

// Schedule: 8:00 AM Daily
const initJob = () => {
    cron.schedule('0 8 * * *', runDailyJob);
    console.log('📅 Daily Forecast Job Scheduled for 08:00 AM');
};

module.exports = { initJob, runDailyJob };
