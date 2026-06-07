const express = require('express');
const router = express.Router();
const { auth, admin } = require('../config/firebase');
const emailService = require('../services/emailService');

/**
 * Generate Email Verification Link WITHOUT sending Firebase's default email
 * Then send our custom email with that link
 */
router.post('/send-verification-email', async (req, res) => {
    try {
        const { email, userId } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Step 1: Configure action code - Firebase handles verification, then redirects to your site
        const actionCodeSettings = {
            // URL to redirect to after email verification
            url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?verified=true`,
            // Let Firebase handle the verification, then redirect
            handleCodeInApp: false
        };

        // Generate the email verification link
        const verificationLink = await auth.generateEmailVerificationLink(
            email,
            actionCodeSettings
        );

        console.log(`🔗 Generated verification link for: ${email}`);

        // Step 2: Use YOUR custom HTML template with this link
        const emailResult = await emailService.sendVerificationEmail(
            email,
            verificationLink,
            {
                user_email: email,
                user_id: userId || 'N/A'
            }
        );

        // Step 3: Respond with success
        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
            recipient: email,
            messageId: emailResult.messageId
        });

    } catch (error) {
        console.error('❌ Error in send-verification-email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            message: 'Failed to send verification email',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Generate Password Reset Link with Custom Email
 */
router.post('/send-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Generate password reset link - Firebase handles the UI
        const actionCodeSettings = {
            url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
            handleCodeInApp: false  // Let Firebase show their UI
        };

        const resetLink = await auth.generatePasswordResetLink(
            email,
            actionCodeSettings
        );

        console.log(`🔗 Generated password reset link for: ${email}`);

        // Send password reset email using custom cosmic template
        await emailService.sendPasswordResetEmail(email, resetLink);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully',
            recipient: email
        });

    } catch (error) {
        console.error('❌ Error sending password reset:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to send password reset email',
            error: error.message
        });
    }
});

/**
 * Verify Email Action Code
 * This endpoint can be used to verify the action code when user clicks the link
 */
router.post('/verify-email-code', async (req, res) => {
    try {
        const { oobCode } = req.body;

        if (!oobCode) {
            return res.status(400).json({
                success: false,
                message: 'Verification code is required'
            });
        }

        // Apply the action code (verify email)
        await auth.applyActionCode(oobCode);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('❌ Error verifying email code:', error);

        res.status(400).json({
            success: false,
            message: 'Invalid or expired verification code',
            error: error.message
        });
    }
});

/**
 * Check if email is verified
 */
router.get('/check-verification/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Get user by email
        const userRecord = await auth.getUserByEmail(email);

        res.status(200).json({
            success: true,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified,
            uid: userRecord.uid
        });

    } catch (error) {
        console.error('❌ Error checking verification:', error);

        res.status(404).json({
            success: false,
            message: 'User not found',
            error: error.message
        });
    }
});

module.exports = router;
