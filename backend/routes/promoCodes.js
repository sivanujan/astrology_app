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

        const expiryDate = promo.expiresAt.toDate();
        const currentDate = new Date();
        console.log('🔍 Promo expiry check:');
        console.log('   Code:', promoCode.toUpperCase());
        console.log('   Expiry date:', expiryDate);
        console.log('   Current date:', currentDate);
        console.log('   Is expired?', expiryDate < currentDate);

        if (expiryDate < currentDate) {
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

        const durationType = (promo.duration || 'week').toLowerCase().trim();
        console.log(`📅 Calculating expiry for duration: ${durationType}`);

        if (durationType === 'week' || durationType === '7 days') {
            expiresAt.setDate(expiresAt.getDate() + 7);
        } else if (durationType === 'month' || durationType === '30 days') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
            // Default to 1 week if unknown
            console.log('⚠️ Unknown duration type, defaulting to 1 week');
            expiresAt.setDate(expiresAt.getDate() + 7);
        }

        // rigorous testing found that setting to end of day is better UX
        expiresAt.setHours(23, 59, 59, 999);

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

        // Simplify query to avoid index issues
        const promoSnapshot = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('isActive', '==', true)
            .get();

        if (promoSnapshot.empty) {
            return res.json({
                success: true,
                hasActivePromo: false
            });
        }

        // Filter for valid future expiry in memory
        const now = new Date();
        const validPromos = promoSnapshot.docs
            .map(doc => doc.data())
            .filter(data => {
                const expiresAt = data.expiresAt.toDate();
                return expiresAt > now;
            })
            .sort((a, b) => b.expiresAt.toDate() - a.expiresAt.toDate()); // Newest expiry first

        if (validPromos.length === 0) {
            return res.json({
                success: true,
                hasActivePromo: false
            });
        }

        // Use the one with latest expiry
        const promo = validPromos[0];

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
 * ADMIN: Get users who activated a promo code
 * GET /api/promo/admin/:code/users
 */
router.get('/admin/:code/users', async (req, res) => {
    try {
        const { code } = req.params;
        const upperCode = code.toUpperCase();

        console.log(`📥 Fetching users for promo code: ${upperCode}`);

        // Query ALL users and check their promo_activations subcollection
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();

            // Check promo_activations subcollection
            const activationsSnapshot = await db.collection('users').doc(userDoc.id)
                .collection('promo_activations')
                .where('promoCode', '==', upperCode)
                .where('isActive', '==', true)
                .get();

            if (!activationsSnapshot.empty) {
                const activation = activationsSnapshot.docs[0].data();
                const expiresAt = activation.expiresAt?.toDate();
                const isStillActive = expiresAt && expiresAt > new Date();

                if (isStillActive) {
                    users.push({
                        uid: userDoc.id,
                        email: userData.profile?.email || userData.email || 'N/A',
                        displayName: userData.profile?.name || userData.displayName || 'N/A',
                        activatedAt: activation.activatedAt?.toDate() || null,
                        expiresAt: expiresAt,
                        duration: activation.duration || 'Unknown',
                        isActive: true
                    });
                }
            }
        }

        console.log(`✅ Found ${users.length} active users for promo ${upperCode}`);

        res.json({
            success: true,
            promoCode: code,
            users: users,
            count: users.length
        });

    } catch (error) {
        console.error('Get promo users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch promo users' });
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
 * ADMIN: Get users who activated a promo code
 * GET /api/promo/admin/:code/users
 */
router.get('/admin/:code/users', async (req, res) => {
    try {
        const { code } = req.params;
        const upperCode = code.toUpperCase();
        const lowerCode = code.toLowerCase();

        console.log(`📥 Fetching users for promo code: ${code} (trying both cases)`);

        // DEBUG: Get ALL users and check their activePromo field
        console.log('🔍 DEBUG: Fetching ALL users to check activePromo field...');
        const allUsersSnapshot = await db.collection('users').limit(50).get();

        let usersWithPromo = 0;
        allUsersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            if (userData.activePromo) {
                usersWithPromo++;
                console.log(`👤 User ${userData.profile?.email || userDoc.id}: code="${userData.activePromo.code}" (type: ${typeof userData.activePromo.code})`);
            }
        });

        console.log(`📊 Total users with activePromo: ${usersWithPromo} out of ${allUsersSnapshot.size}`);

        // Try both uppercase and lowercase since we don't know how it's stored
        const usersSnapshot1 = await db.collection('users')
            .where('activePromo.code', '==', upperCode)
            .get();

        const usersSnapshot2 = await db.collection('users')
            .where('activePromo.code', '==', lowerCode)
            .get();

        console.log(`🔍 Found ${usersSnapshot1.size} users with uppercase, ${usersSnapshot2.size} with lowercase`);

        // Combine results (avoiding duplicates)
        const userIds = new Set();
        const users = [];

        const processSnapshot = (snapshot) => {
            snapshot.forEach(userDoc => {
                if (!userIds.has(userDoc.id)) {
                    userIds.add(userDoc.id);
                    const userData = userDoc.data();
                    const activePromo = userData.activePromo || {};

                    console.log(`👤 User ${userDoc.id}:`, {
                        email: userData.profile?.email || userData.email,
                        promoCode: activePromo.code,
                        activatedAt: activePromo.activatedAt,
                        expiresAt: activePromo.expiresAt
                    });

                    users.push({
                        uid: userDoc.id,
                        email: userData.profile?.email || userData.email || 'N/A',
                        displayName: userData.profile?.name || userData.displayName || 'N/A',
                        activatedAt: activePromo.activatedAt?.toDate() || null,
                        expiresAt: activePromo.expiresAt?.toDate() || null,
                        duration: activePromo.duration || 'Unknown',
                        isActive: activePromo.expiresAt && activePromo.expiresAt.toDate() > new Date()
                    });
                }
            });
        };

        processSnapshot(usersSnapshot1);
        processSnapshot(usersSnapshot2);

        console.log(`✅ Total unique users found: ${users.length}`);

        res.json({
            success: true,
            promoCode: code,
            users: users,
            count: users.length
        });

    } catch (error) {
        console.error('Get promo users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch promo users' });
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

// ==================== ADMIN ENDPOINTS ====================

/**
 * Create a new promo code (Admin)
 * POST /api/promo/admin/create
 */
router.post('/admin/create', async (req, res) => {
    try {
        const { code, duration, maxUses, expiresAt } = req.body;

        if (!code || !duration || !maxUses) {
            return res.status(400).json({ success: false, message: 'Code, duration, and maxUses required' });
        }

        const codeId = code.toUpperCase().trim();

        // Check if code already exists
        const existing = await db.collection('promo_codes').doc(codeId).get();
        if (existing.exists) {
            return res.status(400).json({ success: false, message: 'Promo code already exists' });
        }

        // Parse expiry date - handle ISO string from frontend
        let expiryDate;
        if (expiresAt) {
            expiryDate = new Date(expiresAt);
        } else {
            // Default: 1 year from now
            expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }

        const promoData = {
            code: codeId,
            duration,
            maxUses: Number(maxUses),
            currentUses: 0,
            expiresAt: admin.firestore.Timestamp.fromDate(expiryDate),
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('promo_codes').doc(codeId).set(promoData);

        res.json({
            success: true,
            message: 'Promo code created successfully',
            code: codeId
        });

    } catch (error) {
        console.error('Create promo error:', error);
        res.status(500).json({ success: false, message: 'Failed to create promo code' });
    }
});

/**
 * List all promo codes (Admin)
 * GET /api/promo/admin/list
 */
router.get('/admin/list', async (req, res) => {
    try {
        const snapshot = await db.collection('promo_codes')
            .orderBy('createdAt', 'desc')
            .get();

        const promoCodes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                code: data.code || doc.id,
                duration: data.duration,
                maxUses: data.maxUses,
                currentUses: data.currentUses || 0,
                expiresAt: data.expiresAt?.toDate(),
                status: data.status || 'active',
                createdAt: data.createdAt?.toDate()
            };
        });

        res.json({
            success: true,
            promoCodes
        });

    } catch (error) {
        console.error('List promos error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch promo codes' });
    }
});

/**
 * Update a promo code (Admin)
 * PUT /api/promo/admin/update/:code
 */
router.put('/admin/update/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { status, maxUses, expiresAt } = req.body;

        const codeId = code.toUpperCase();

        // Check if code exists
        const promoDoc = await db.collection('promo_codes').doc(codeId).get();
        if (!promoDoc.exists) {
            return res.status(404).json({ success: false, message: 'Promo code not found' });
        }

        // Build update object
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (maxUses !== undefined) updateData.maxUses = Number(maxUses);
        if (expiresAt) {
            const expiryDate = new Date(expiresAt);
            updateData.expiresAt = admin.firestore.Timestamp.fromDate(expiryDate);
        }

        await db.collection('promo_codes').doc(codeId).update(updateData);

        res.json({
            success: true,
            message: 'Promo code updated successfully'
        });

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
