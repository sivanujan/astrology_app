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

/**
 * Subscribe to Email Dasa Alerts
 * POST /api/notifications/subscribe-email
 */
router.post('/subscribe-email', async (req, res) => {
    try {
        const { chartId, email, uid, chartName } = req.body;

        if (!chartId || !email || !uid) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // 1. Update Chart in Firestore to enable alerts
        await db.collection('charts').doc(chartId).set({
            dasaAlerts: true,
            alertEmail: email,
            lastDasaCheck: new Date().toISOString() // Initialize check time
        }, { merge: true });

        // 2. Send Welcome Email
        const emailService = require('../services/emailService');
        try {
            await emailService.sendCustomEmail(
                email,
                `Dasa Alerts Activated: ${chartName || 'Your Chart'}`,
                await emailService.loadTemplate('email_templates/dasa_welcome.html', {
                    name: 'User', // You might want to pass user name too
                    chartName: chartName || 'Your Chart',
                    dashboard_url: 'https://astrozen.app/dashboard' // Replace with proper ENV URL or dynamic
                })
            );
        } catch (emailErr) {
            console.error("Failed to send welcome email:", emailErr);
            // Don't fail the whole request if email fails, but log it
        }

        res.status(200).json({ success: true, message: 'Successfully subscribed to Dasa alerts' });

    } catch (error) {
        console.error('Email Subscription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
});

/**
 * Unsubscribe from Email Dasa Alerts
 * POST /api/notifications/unsubscribe-email
 */
router.post('/unsubscribe-email', async (req, res) => {
    try {
        const { chartId, uid } = req.body;

        if (!chartId || !uid) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Disable alerts in Firestore
        await db.collection('charts').doc(chartId).set({
            dasaAlerts: false
        }, { merge: true });

        res.status(200).json({ success: true, message: 'Unsubscribed from Dasa alerts' });

    } catch (error) {
        console.error('Email Unsubscription Error:', error);
        res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
    }
});

module.exports = router;
