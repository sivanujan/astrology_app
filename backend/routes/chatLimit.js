const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Check if user can send a chat message
 * POST /api/chat/check-limit
 */
router.post('/check-limit', async (req, res) => {
    try {
        const { uid, deviceFingerprint } = req.body;

        if (!uid) {
            return res.status(400).json({ success: false, message: 'User ID required' });
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 1. Check for active promo code
        const promoSnapshot = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('isActive', '==', true)
            .where('expiresAt', '>', new Date())
            .limit(1)
            .get();

        if (!promoSnapshot.empty) {
            const promo = promoSnapshot.docs[0].data();
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
        const limit = 5;
        const remaining = Math.max(0, limit - currentCount);

        res.json({
            success: true,
            canChat: currentCount < limit,
            hasPromo: false,
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
            remaining: 5,
            limit: 5,
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

        const today = new Date().toISOString().split('T')[0];
        const usageRef = db.collection('users').doc(uid)
            .collection('chat_usage')
            .doc(today);

        // Use transaction to prevent race conditions
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(usageRef);
            const currentCount = doc.exists ? doc.data().count : 0;

            if (currentCount >= 5) {
                throw new Error('Chat limit exceeded');
            }

            transaction.set(usageRef, {
                date: today,
                count: currentCount + 1,
                lastChatAt: admin.firestore.FieldValue.serverTimestamp(),
                deviceFingerprint: deviceFingerprint || 'unknown',
                ipAddress: ipAddress || 'unknown'
            }, { merge: true });
        });

        res.json({ success: true, message: 'Chat count incremented' });

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
                limit: 5,
                remaining: Math.max(0, 5 - (data.count || 0)),
                lastChatAt: data.lastChatAt?.toDate() || null
            }
        });

    } catch (error) {
        console.error('Get usage error:', error);
        res.status(500).json({ success: false, message: 'Failed to get usage stats' });
    }
});

module.exports = router;
