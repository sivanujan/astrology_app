/**
 * Test Script for Password Reset Email
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testPasswordResetEmail() {
    console.log('\n🧪 Testing Password Reset Email System\n');
    console.log('='.repeat(60));

    const testEmail = 'test@example.com';
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?oobCode=FAKE_CODE_12345`;

    try {
        console.log('\n📧 Verifying email service connection...');
        await emailService.verifyConnection();
        console.log('✅ Email service is ready!\n');

        console.log('📨 Sending PASSWORD RESET email...');
        const result = await emailService.sendPasswordResetEmail(
            testEmail,
            resetLink
        );

        console.log('✅ Email sent successfully!');
        console.log(`   Recipient: ${result.recipient}`);
        console.log(`   Message ID: ${result.messageId}`);
        console.log('\n');
        console.log('🎉 SUCCESS! Check your inbox to verify the Password Reset template design.');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    }
}

if (require.main === module) {
    testPasswordResetEmail();
}
