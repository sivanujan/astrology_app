require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const emailService = require('./services/emailService');

async function testEmail() {
    console.log('🧪 Testing email template loading and sending...\n');

    try {
        const testEmail = 'test@example.com';
        const testLink = 'https://example.com/verify?code=test123';

        console.log('📧 Attempting to send verification email...');
        console.log('To:', testEmail);
        console.log('Link:', testLink);
        console.log('');

        const result = await emailService.sendVerificationEmail(
            testEmail,
            testLink,
            {
                user_email: testEmail
            }
        );

        console.log('✅ SUCCESS!');
        console.log('Result:', result);

    } catch (error) {
        console.log('❌ FAILED!');
        console.log('Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

testEmail();
