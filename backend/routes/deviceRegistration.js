const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
const crypto = require('crypto');

/**
 * Check if device can register today
 * POST /api/auth/check-device-registration
 * Body: { deviceFingerprint, ipAddress }
 */
router.post('/check-device-registration', async (req, res) => {
    try {
        const { deviceFingerprint, ipAddress } = req.body;

        if (!deviceFingerprint || !ipAddress) {
            return res.status(400).json({
                success: false,
                message: 'Device fingerprint and IP address are required'
            });
        }

        // Get today's date (UTC)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Hash IP for privacy
        const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16);

        // Create composite key
        const deviceKey = `${deviceFingerprint}_${ipHash}`;

        // Check if this device already registered today
        const registrationDoc = await db.collection('device_registrations')
            .doc(today)
            .collection('registrations')
            .doc(deviceKey)
            .get();

        if (registrationDoc.exists) {
            const data = registrationDoc.data();
            console.log(`❌ Registration blocked: Device ${deviceFingerprint.substring(0, 8)}... already registered today`);

            return res.json({
                success: false,
                canRegister: false,
                message: 'You can only create 1 account per day from this device. Please try again tomorrow or log in to your existing account.',
                registeredAt: data.registeredAt?.toDate(),
                resetTime: new Date(today + 'T23:59:59Z')
            });
        }

        console.log(`✅ Registration allowed: New device ${deviceFingerprint.substring(0, 8)}...`);

        res.json({
            success: true,
            canRegister: true,
            message: 'Device can register'
        });

    } catch (error) {
        console.error('❌ Check device registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check device registration',
            error: error.message
        });
    }
});

/**
 * Record device registration
 * POST /api/auth/record-device-registration
 * Body: { deviceFingerprint, ipAddress, uid }
 */
router.post('/record-device-registration', async (req, res) => {
    try {
        const { deviceFingerprint, ipAddress, uid } = req.body;

        if (!deviceFingerprint || !ipAddress || !uid) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const today = new Date().toISOString().split('T')[0];
        const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16);
        const deviceKey = `${deviceFingerprint}_${ipHash}`;

        // Record this registration
        await db.collection('device_registrations')
            .doc(today)
            .collection('registrations')
            .doc(deviceKey)
            .set({
                deviceFingerprint,
                ipHash,
                uid,
                registeredAt: admin.firestore.Timestamp.now(),
                date: today
            });

        console.log(`📝 Recorded registration: ${deviceFingerprint.substring(0, 8)}... for user ${uid}`);

        res.json({
            success: true,
            message: 'Device registration recorded'
        });

    } catch (error) {
        console.error('❌ Record device registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record device registration',
            error: error.message
        });
    }
});

module.exports = router;
