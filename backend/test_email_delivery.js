require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
    console.log('🧪 Testing Email Service...');
    console.log('Using User:', process.env.EMAIL_USER);
    console.log('Using Host:', process.env.SMTP_HOST);

    try {
        console.log('🔄 Verifying connection...');
        const isConnected = await emailService.verifyConnection();
        if (!isConnected) {
            console.error('❌ Failed to verify connection.');
            return;
        }

        console.log('📧 Sending test email...');
        const targetEmail = 'tamilnet2000@gmail.com';

        await emailService.sendCustomEmail(
            targetEmail,
            'Test Email from Astrozen Debugger',
            '<h1>This is a test email</h1><p>If you see this, the system is working.</p>'
        );
        console.log(`✅ Email successfully sent to ${targetEmail}`);

    } catch (error) {
        console.error('❌ Error during test:');
        console.error(error);
    }
}

testEmail();
