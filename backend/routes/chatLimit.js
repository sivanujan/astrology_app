const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Check if user can send a chat message
 * POST /api/chat/check-limit
 */
router.post('/check-limit', async (req, res) => {
    console.log('📥 /api/chat/check-limit called');
    console.log('Request body:', req.body);

    try {
        const { uid, deviceFingerprint } = req.body;

        if (!uid) {
            console.log('❌ No UID provided');
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        console.log(`🔍 Checking limit for user: ${uid}`);
        console.log('Database connection:', db ? 'Connected' : 'Not Connected');

        // Use user's timezone if provided, otherwise default to UTC
        const { timeZone } = req.body;
        const today = new Date().toLocaleDateString('en-CA', { timeZone: timeZone || 'UTC' });
        console.log(`Today date (${timeZone || 'UTC'}):`, today);

        // 1. Check for active promo code
        // 1. Check for active promo code (Safe In-Memory Check)
        const promoSnapshot = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('isActive', '==', true)
            .get();

        const now = new Date();
        const validPromos = promoSnapshot.docs
            .map(doc => doc.data())
            .filter(data => data.expiresAt.toDate() > now);

        if (validPromos.length > 0) {
            const promo = validPromos[0];
            return res.json({
                success: true,
                canChat: true,
                hasPromo: true,
                promoCode: promo.promoCode,
                expiresAt: promo.expiresAt.toDate(),
                remaining: -1 // Unlimited
            });
        }

        // 2. Check today's chat usage
        const usageDoc = await db.collection('users').doc(uid)
            .collection('chat_usage')
            .doc(today)
            .get();

        const currentCount = usageDoc.exists ? usageDoc.data().count : 0;
        const limit = 2;
        const remaining = Math.max(0, limit - currentCount);

        res.json({
            success: true,
            canChat: currentCount < limit,
            hasPromo: false, // Explicitly false if no valid promo found
            remaining,
            limit,
            currentCount
        });

    } catch (error) {
        console.error('Check limit error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Return default values instead of failing
        res.json({
            success: true,
            canChat: true, // Allow chat by default if check fails
            hasPromo: false,
            remaining: 2,
            limit: 2,
            currentCount: 0,
            warning: 'Using default limits due to system error'
        });
    }
});

/**
 * Increment chat count
 * POST /api/chat/increment
 */
router.post('/increment', async (req, res) => {
    try {
        const { uid, deviceFingerprint, ipAddress } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        // Check for active promo FIRST (Safe In-Memory Check)
        const promoSnapshot = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('isActive', '==', true)
            .get();

        const now = new Date();
        const hasActivePromo = promoSnapshot.docs.some(doc => {
            const data = doc.data();
            return data.expiresAt.toDate() > now;
        });

        // Use user's timezone for date calculation
        const { timeZone } = req.body;
        const today = new Date().toLocaleDateString('en-CA', { timeZone: timeZone || 'UTC' });
        console.log(`Incrementing for date (${timeZone || 'UTC'}):`, today);

        const usageRef = db.collection('users').doc(uid)
            .collection('chat_usage')
            .doc(today);

        // Use transaction to prevent race conditions
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(usageRef);
            const currentCount = doc.exists ? doc.data().count : 0;

            // Only check limit if user does NOT have active promo
            if (!hasActivePromo && currentCount >= 2) {
                throw new Error('Chat limit exceeded');
            }

            transaction.set(usageRef, {
                date: today,
                count: currentCount + 1,
                lastChatAt: admin.firestore.FieldValue.serverTimestamp(),
                deviceFingerprint: deviceFingerprint || 'unknown',
                ipAddress: ipAddress || 'unknown',
                hasPromo: hasActivePromo
            }, { merge: true });
        });

        res.json({ success: true, message: 'Chat count incremented', hasPromo: hasActivePromo });

    } catch (error) {
        console.error('Increment error:', error);
        if (error.message === 'Chat limit exceeded') {
            return res.status(429).json({ success: false, message: 'Chat limit exceeded' });
        }
        res.status(500).json({ success: false, message: 'Failed to increment chat count' });
    }
});

/**
 * Get user's chat usage statistics
 * GET /api/chat/usage/:uid
 */
router.get('/usage/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const usageDoc = await db.collection('users').doc(uid)
            .collection('chat_usage')
            .doc(today)
            .get();

        const data = usageDoc.exists ? usageDoc.data() : { count: 0, date: today };

        res.json({
            success: true,
            usage: {
                date: data.date,
                count: data.count || 0,
                limit: 2,
                remaining: Math.max(0, 2 - (data.count || 0)),
                lastChatAt: data.lastChatAt?.toDate() || null
            }
        });

    } catch (error) {
        console.error('Get usage error:', error);
        res.status(500).json({ success: false, message: 'Failed to get usage stats' });
    }
});

module.exports = router;
