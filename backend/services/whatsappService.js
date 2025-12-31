const axios = require('axios');
const { db } = require('../config/firebase');

const BASE_URL = process.env.INFOBIP_BASE_URL;
const API_KEY = process.env.INFOBIP_API_KEY;

// Create axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `App ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Send WhatsApp Template Message
 * Using a simple text message fall back if templates aren't set up.
 * Infobip often requires Templates for business initiated messages.
 * For this implementation, we assume a free-form text capability or a specific template 
 * (to be configured).
 */
exports.sendWhatsAppMessage = async (to, text) => {
    try {
        const response = await apiClient.post('/whatsapp/1/message/text', {
            from: '447860099299', // Infobip Test Number usually, or your Sender ID
            to: to,
            content: {
                text: text
            }
        });
        console.log('Infobip Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Send Verification Code
 */
exports.sendVerificationCode = async (phoneNumber) => {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in Firestore Temporary Collection
    await db.collection('otp_codes').doc(phoneNumber).set({
        code,
        expiresAt,
        attempts: 0
    });

    // Send Message
    const message = `Your Astrozen Verification Code is: ${code}. Valid for 10 minutes.`;

    // To conform to WhatsApp rules, usually you need a registered template for OTPs.
    // We will attempt to send as TEXT for now (User must reply first to open session in Sandbox).
    return exports.sendWhatsAppMessage(phoneNumber, message);
};

/**
 * Verify Code
 */
exports.verifyCode = async (phoneNumber, code) => {
    const docRef = db.collection('otp_codes').doc(phoneNumber);
    const doc = await docRef.get();

    if (!doc.exists) return { success: false, message: 'No code requested' };

    const data = doc.data();
    if (Date.now() > data.expiresAt) return { success: false, message: 'Code expired' };
    if (data.code !== code) {
        await docRef.update({ attempts: data.attempts + 1 });
        return { success: false, message: 'Invalid code' };
    }

    // Success - Delete used code
    await docRef.delete();
    return { success: true };
};
