const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Activate a promo code
 * POST /api/promo/activate
 */
router.post('/activate', async (req, res) => {
    try {
        const { uid, promoCode } = req.body;

        if (!uid || !promoCode) {
            return res.status(400).json({ success: false, message: 'User ID and promo code required' });
        }

        // 1. Get promo code details
        const promoDoc = await db.collection('promo_codes').doc(promoCode.toUpperCase()).get();

        if (!promoDoc.exists) {
            return res.status(404).json({ success: false, message: 'Invalid promo code' });
        }

        const promo = promoDoc.data();

        // 2. Validate promo code
        if (promo.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Promo code is not active' });
        }

        if (promo.expiresAt.toDate() < new Date()) {
            return res.status(400).json({ success: false, message: 'Promo code has expired' });
        }

        if (promo.currentUses >= promo.maxUses) {
            return res.status(400).json({ success: false, message: 'Promo code usage limit reached' });
        }

        // 3. Check if user already activated this promo
        const existingActivation = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('promoCode', '==', promoCode.toUpperCase())
            .limit(1)
            .get();

        if (!existingActivation.empty) {
            return res.status(400).json({ success: false, message: 'You have already used this promo code' });
        }

        // 4. Calculate expiry date
        const activatedAt = new Date();
        let expiresAt = new Date(activatedAt);

        if (promo.duration === 'week') {
            expiresAt.setDate(expiresAt.getDate() + 7);
        } else if (promo.duration === 'month') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // 5. Activate promo for user
        await db.collection('users').doc(uid)
            .collection('promo_activations')
            .add({
                promoCode: promoCode.toUpperCase(),
                activatedAt: admin.firestore.Timestamp.fromDate(activatedAt),
                expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
                duration: promo.duration,
                isActive: true
            });

        // 6. Increment promo code usage
        await db.collection('promo_codes').doc(promoCode.toUpperCase()).update({
            currentUses: admin.firestore.FieldValue.increment(1)
        });

        res.json({
            success: true,
            message: 'Promo code activated successfully',
            expiresAt: expiresAt,
            duration: promo.duration
        });

    } catch (error) {
        console.error('Activate promo error:', error);
        res.status(500).json({ success: false, message: 'Failed to activate promo code' });
    }
});

/**
 * Get user's promo status
 * GET /api/promo/status/:uid
 */
router.get('/status/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        const promoSnapshot = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('isActive', '==', true)
            .where('expiresAt', '>', new Date())
            .orderBy('expiresAt', 'desc')
            .limit(1)
            .get();

        if (promoSnapshot.empty) {
            return res.json({
                success: true,
                hasActivePromo: false
            });
        }

        const promo = promoSnapshot.docs[0].data();

        res.json({
            success: true,
            hasActivePromo: true,
            promoCode: promo.promoCode,
            activatedAt: promo.activatedAt.toDate(),
            expiresAt: promo.expiresAt.toDate(),
            duration: promo.duration
        });

    } catch (error) {
        console.error('Get promo status error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Return default no-promo response instead of failing
        res.json({
            success: true,
            hasActivePromo: false,
            warning: 'Using default status due to system error'
        });
    }
});

/**
 * ADMIN: Create new promo code
 * POST /api/promo/admin/create
 */
router.post('/admin/create', async (req, res) => {
    try {
        const { code, duration, maxUses, expiresAt, adminEmail } = req.body;

        if (!code || !duration || !maxUses || !expiresAt) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // TODO: Add admin authentication check here
        // const isAdmin = await checkIfAdmin(adminEmail);
        // if (!isAdmin) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const promoCode = code.toUpperCase();

        // Check if code already exists
        const existing = await db.collection('promo_codes').doc(promoCode).get();
        if (existing.exists) {
            return res.status(400).json({ success: false, message: 'Promo code already exists' });
        }

        await db.collection('promo_codes').doc(promoCode).set({
            code: promoCode,
            duration: duration, // 'week' or 'month'
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromDate(new Date(expiresAt)),
            maxUses: parseInt(maxUses),
            currentUses: 0,
            createdBy: adminEmail || 'admin',
            status: 'active'
        });

        res.json({ success: true, message: 'Promo code created successfully', code: promoCode });

    } catch (error) {
        console.error('Create promo error:', error);
        res.status(500).json({ success: false, message: 'Failed to create promo code' });
    }
});

/**
 * ADMIN: List all promo codes
 * GET /api/promo/admin/list
 */
router.get('/admin/list', async (req, res) => {
    try {
        // TODO: Add admin authentication check

        const snapshot = await db.collection('promo_codes')
            .orderBy('createdAt', 'desc')
            .get();

        const promoCodes = snapshot.docs.map(doc => ({
            code: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate()
        }));

        res.json({ success: true, promoCodes });

    } catch (error) {
        console.error('List promos error:', error);
        res.status(500).json({ success: false, message: 'Failed to list promo codes' });
    }
});

/**
 * ADMIN: Update promo code
 * PUT /api/promo/admin/update/:code
 */
router.put('/admin/update/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { status, maxUses, expiresAt } = req.body;

        // TODO: Add admin authentication check

        const updateData = {};
        if (status) updateData.status = status;
        if (maxUses) updateData.maxUses = parseInt(maxUses);
        if (expiresAt) updateData.expiresAt = admin.firestore.Timestamp.fromDate(new Date(expiresAt));

        await db.collection('promo_codes').doc(code.toUpperCase()).update(updateData);

        res.json({ success: true, message: 'Promo code updated successfully' });

    } catch (error) {
        console.error('Update promo error:', error);
        res.status(500).json({ success: false, message: 'Failed to update promo code' });
    }
});

/**
 * ADMIN: Delete promo code
 * DELETE /api/promo/admin/delete/:code
 */
router.delete('/admin/delete/:code', async (req, res) => {
    try {
        const { code } = req.params;

        // TODO: Add admin authentication check

        await db.collection('promo_codes').doc(code.toUpperCase()).delete();

        res.json({ success: true, message: 'Promo code deleted successfully' });

    } catch (error) {
        console.error('Delete promo error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete promo code' });
    }
});

module.exports = router;
