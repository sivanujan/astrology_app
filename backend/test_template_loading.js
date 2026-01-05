require('dotenv').config();
const emailService = require('./services/emailService');
const path = require('path');

async function testTemplate() {
    console.log('🧪 Testing Template Loading...');
    console.log('Current Dir:', __dirname);

    try {
        console.log('📂 Attempting to load: email_templates/dasa_welcome.html');
        // This is the path we are using in the code
        const content = await emailService.loadTemplate('email_templates/dasa_welcome.html', {
            name: 'TestUser',
            chartName: 'TestChart',
            dashboard_url: 'http://test.com'
        });

        console.log('✅ Template loaded successfully!');
        console.log('--- Preview (First 100 chars) ---');
        console.log(content.substring(0, 100));
        console.log('---------------------------------');

    } catch (error) {
        console.error('❌ Failed to load template.');
        console.error('Error:', error.message);

        // Debugging info
        console.log('ℹ️  Debug Info:');
        console.log('Service File Path:', path.resolve('./services/emailService.js'));
        console.log('Target Path Resolution: path.join(__dirname, "../../", "email_templates/dasa_welcome.html")');
    }
}

testTemplate();
