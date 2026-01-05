const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // 1. Send Notification to Admin (You)
        const adminHtml = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        // Send to the configured system email (acting as admin)
        await emailService.sendCustomEmail(
            process.env.EMAIL_USER,
            `Contact Form: ${name}`,
            adminHtml
        );

        // 2. Send Auto-reply to User
        const userHtml = `
            <h2>Hello ${name},</h2>
            <p>Thank you for reaching out to AstroZen!</p>
            <p>We have received your message and will get back to you shortly.</p>
            <br>
            <p>Best regards,</p>
            <p>The AstroZen Team</p>
            <p><em>Jaffna, Sri Lanka</em></p>
        `;

        await emailService.sendCustomEmail(
            email,
            'We received your message - AstroZen',
            userHtml
        );

        res.status(200).json({
            status: 'success',
            message: 'Message sent successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send message'
        });
    }
});

module.exports = router;
