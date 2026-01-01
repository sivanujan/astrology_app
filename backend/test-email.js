/**
 * Test Script for Custom Email Verification
 * This demonstrates how Firebase Admin generates links and your service sends emails
 */

require('dotenv').config();
const { auth } = require('./config/firebase');
const emailService = require('./services/emailService');

async function testEmailVerification() {
    console.log('\n🧪 Testing Custom Email Verification System\n');
    console.log('='.repeat(60));

    // Test email (change this to your test email)
    const testEmail = 'test@example.com';

    try {
        // Step 1: Verify email service connection
        console.log('\n📧 Step 1: Verifying email service connection...');
        const isConnected = await emailService.verifyConnection();

        if (!isConnected) {
            throw new Error('Email service connection failed! Check your EMAIL_USER and EMAIL_PASSWORD in .env');
        }
        console.log('✅ Email service is ready!\n');

        // Check if user exists, if not create them (required for generating link)
        try {
            await auth.getUserByEmail(testEmail);
            console.log('✅ Test user exists in Firebase');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('⚠️ Test user not found. Creating temporary user...');
                await auth.createUser({
                    email: testEmail,
                    emailVerified: false
                });
                console.log('✅ Created temporary test user');
            } else {
                throw error;
            }
        }

        // Step 2: Generate Firebase verification link (NO EMAIL SENT BY FIREBASE)
        console.log('🔗 Step 2: Asking Firebase for verification link...');
        console.log(`   Email: ${testEmail}`);

        const actionCodeSettings = {
            url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verification-complete`,
            handleCodeInApp: true
        };

        const verificationLink = await auth.generateEmailVerificationLink(
            testEmail,
            actionCodeSettings
        );

        console.log('✅ Firebase generated the link (no email sent by Firebase)');
        console.log(`   Link: ${verificationLink.substring(0, 60)}...`);
        console.log('\n');

        // Step 3: Send email using YOUR custom template
        console.log('📨 Step 3: Sending email with YOUR custom template...');

        const result = await emailService.sendVerificationEmail(
            testEmail,
            verificationLink
        );

        console.log('✅ Email sent successfully!');
        console.log(`   Recipient: ${result.recipient}`);
        console.log(`   Message ID: ${result.messageId}`);
        console.log('\n');

        console.log('='.repeat(60));
        console.log('\n🎉 SUCCESS! Check your inbox at:', testEmail);
        console.log('📝 Note: Check spam folder if you don\'t see it\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('\n💡 Common issues:');
        console.error('   1. Missing EMAIL_USER or EMAIL_PASSWORD in .env');
        console.error('   2. Not using Gmail App Password (use app password, not regular password)');
        console.error('   3. Email doesn\'t exist in Firebase (create user first)');
        console.error('   4. 2-Step Verification not enabled on Gmail\n');
        console.error('Full error:', error);
    }
}

// Run test if called directly
if (require.main === module) {
    testEmailVerification()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testEmailVerification };
