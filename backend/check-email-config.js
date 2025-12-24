/**
 * Email Configuration Checker
 * Run this to verify your email credentials are set up correctly
 */

require('dotenv').config();

console.log('\n🔍 Checking Email Configuration...\n');
console.log('='.repeat(60));

// Check if EMAIL_USER is set
if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.log('❌ EMAIL_USER is NOT configured!');
    console.log('   Please set your Gmail address in backend/.env');
    console.log('   Example: EMAIL_USER=yourname@gmail.com\n');
} else {
    console.log(`✅ EMAIL_USER: ${process.env.EMAIL_USER}`);
}

// Check if EMAIL_PASSWORD is set
if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your-16-char-app-password') {
    console.log('❌ EMAIL_PASSWORD is NOT configured!');
    console.log('   Please set your Gmail App Password in backend/.env');
    console.log('   Get one at: https://myaccount.google.com/apppasswords\n');
} else {
    console.log(`✅ EMAIL_PASSWORD: ${'*'.repeat(16)} (hidden)`);
}

// Check if FRONTEND_URL is set
if (!process.env.FRONTEND_URL) {
    console.log('⚠️  FRONTEND_URL is NOT set (will use default)');
    console.log('   Default: http://localhost:5173\n');
} else {
    console.log(`✅ FRONTEND_URL: ${process.env.FRONTEND_URL}`);
}

console.log('='.repeat(60));

// Check if both are configured
if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== 'your-email@gmail.com' &&
    process.env.EMAIL_PASSWORD &&
    process.env.EMAIL_PASSWORD !== 'your-16-char-app-password'
) {
    console.log('\n✅ Email configuration looks good!');
    console.log('\n📧 Next step: Test sending an email');
    console.log('   Run: node backend/test-email.js\n');
} else {
    console.log('\n❌ Email configuration is incomplete!');
    console.log('\n📋 To fix this:\n');
    console.log('1. Open backend/.env file');
    console.log('2. Replace "your-email@gmail.com" with your Gmail address');
    console.log('3. Replace "your-16-char-app-password" with your App Password\n');
    console.log('📖 HOW TO GET GMAIL APP PASSWORD:');
    console.log('1. Go to: https://myaccount.google.com/security');
    console.log('2. Enable 2-Step Verification (if not already)');
    console.log('3. Go to: https://myaccount.google.com/apppasswords');
    console.log('4. Create new App Password for "Mail"');
    console.log('5. Copy the 16-character password');
    console.log('6. Paste it in backend/.env as EMAIL_PASSWORD\n');
}

console.log('='.repeat(60) + '\n');
