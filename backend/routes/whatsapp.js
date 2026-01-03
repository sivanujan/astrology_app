const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const { db } = require('../config/firebase');

/**
 * Send Verification Code
 */
router.post('/send-code', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ success: false, message: 'Phone number required' });

        await whatsappService.sendVerificationCode(phoneNumber);
        res.json({ success: true, message: 'Code sent' });
    } catch (error) {
        console.error('Send Code Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send code' });
    }
});

/**
 * Verify Code & Subscribe
 */
router.post('/verify-code', async (req, res) => {
    try {
        const { phoneNumber, code, uid, language = 'en' } = req.body;
        if (!phoneNumber || !code || !uid) {
            return res.status(400).json({ success: false, message: 'Missing parameters' });
        }

        const result = await whatsappService.verifyCode(phoneNumber, code);
        if (!result.success) {
            return res.status(400).json(result);
        }

        // Save Preference to Firestore
        await db.collection('users').doc(uid).set({
            preferences: {
                whatsappNumber: phoneNumber,
                dailyAlerts: true,
                language: language,
                whatsappVerified: true
            }
        }, { merge: true });

        // Send Welcome Message
        await whatsappService.sendWhatsAppMessage(
            phoneNumber,
            language === 'ta'
                ? "வணக்கம்! உங்கள் Astrozen தினசரி ஜோதிட அறிவிப்புகள் செயல்படுத்தப்பட்டன."
                : "Welcome! Your Astrozen daily astrology alerts are now active."
        );

        res.json({ success: true, message: 'Verified & Subscribed' });
    } catch (error) {
        console.error('Verify Code Error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
});

module.exports = router;
