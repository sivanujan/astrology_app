const express = require('express');
const router = express.Router();
const webPush = require('web-push');
const { db } = require('../config/firebase');

// Configure Web Push
webPush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * Get Public VAPID Key
 */
router.get('/vapid-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

/**
 * Subscribe to Notifications
 */
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription, uid, userAgent } = req.body;

        if (!subscription || !subscription.endpoint || !uid) {
            return res.status(400).json({ success: false, message: 'Invalid subscription' });
        }

        // Store in Firestore: users/{uid}/pushSubscriptions/{hash}
        // Using hash of endpoint to prevent duplicates
        const subHash = Buffer.from(subscription.endpoint).toString('base64').replace(/[^\w]/g, '').substring(0, 20);

        await db.collection('users').doc(uid).collection('push_subscriptions').doc(subHash).set({
            subscription,
            userAgent: userAgent || 'unknown',
            createdAt: new Date().toISOString(),
            active: true
        });

        // Also update main preference to true
        await db.collection('users').doc(uid).set({
            preferences: { dailyAlerts: true, pushEnabled: true }
        }, { merge: true });

        // Send Test Notification
        const payload = JSON.stringify({
            title: 'Welcome to Astrozen!',
            body: 'You successfully subscribed to daily predictions.',
            url: '/forecast'
        });

        await webPush.sendNotification(subscription, payload);

        res.status(201).json({ success: true, message: 'Subscribed' });
    } catch (error) {
        console.error('Subscription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
});

module.exports = router;
