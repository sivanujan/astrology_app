/**
 * Namecheap Email Connection Test
 * Tests SMTP connection to Namecheap PrivateEmail
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

async function testNamecheapConnection() {
    console.log('\n🧪 Testing Namecheap Email Connection...\n');
    console.log('='.repeat(60));

    // Display configuration
    console.log('\n📋 Current Configuration:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
    console.log(`   PASSWORD: ${'*'.repeat(16)} (hidden)\n`);

    // Create transporter with Namecheap settings
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.privateemail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Show debug output
        logger: true  // Log to console
    });

    try {
        console.log('🔌 Attempting to connect to Namecheap SMTP server...\n');

        // Verify connection
        await transporter.verify();

        console.log('\n✅ SUCCESS! Connected to Namecheap email server!');
        console.log('='.repeat(60));
        console.log('\n✨ Your email configuration is working correctly!\n');
        console.log('📧 Emails will be sent from:', process.env.EMAIL_USER);
        console.log('\n🎯 Next steps:');
        console.log('   1. Restart your server: npm run dev:all');
        console.log('   2. Try registering a new account');
        console.log('   3. Check your inbox for the beautiful verification email!\n');

        return true;

    } catch (error) {
        console.log('\n❌ CONNECTION FAILED!\n');
        console.log('Error:', error.message);
        console.log('\n💡 Troubleshooting:');

        if (error.code === 'EAUTH') {
            console.log('   ⚠️  AUTHENTICATION ERROR');
            console.log('   - Check your email address is correct');
            console.log('   - Verify your password is correct');
            console.log('   - Make sure the email account exists in Namecheap');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   ⚠️  CONNECTION REFUSED');
            console.log('   - Check SMTP_HOST: should be mail.privateemail.com');
            console.log('   - Check SMTP_PORT: should be 465 or 587');
            console.log('   - Verify your internet connection');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('   ⚠️  CONNECTION TIMEOUT');
            console.log('   - Your firewall might be blocking port 465');
            console.log('   - Try changing SMTP_PORT to 587');
            console.log('   - Check your internet connection');
        } else {
            console.log('   ⚠️  UNKNOWN ERROR');
            console.log('   - Double-check all credentials in .env file');
            console.log('   - Contact Namecheap support if issue persists');
        }

        console.log('\n📖 Full error details:');
        console.log(error);
        console.log('\n');

        return false;
    }
}

// Run test
if (require.main === module) {
    testNamecheapConnection()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testNamecheapConnection };
