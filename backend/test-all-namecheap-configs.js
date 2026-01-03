/**
 * Try Alternative Namecheap SMTP Configurations
 * Tests multiple port and security combinations
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function tryConfiguration(config, configName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${configName}`);
    console.log(`Host: ${config.host}:${config.port} (secure: ${config.secure})`);
    console.log(`User: ${process.env.EMAIL_USER}`);

    const transporter = nodemailer.createTransporter(config);

    try {
        await transporter.verify();
        console.log(`✅ SUCCESS with ${configName}!`);
        return { success: true, config: configName };
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        return { success: false, error: error.message, config: configName };
    }
}

async function testAllConfigurations() {
    console.log('\n🧪 Testing All Namecheap SMTP Configurations\n');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('❌ ERROR: EMAIL_USER or EMAIL_PASSWORD not set in .env');
        return;
    }

    const auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    };

    const configurations = [
        {
            name: 'Port 465 (SSL) - Standard',
            config: {
                host: 'mail.privateemail.com',
                port: 465,
                secure: true,
                auth: auth,
                tls: { rejectUnauthorized: false }
            }
        },
        {
            name: 'Port 587 (TLS) - Alternative',
            config: {
                host: 'mail.privateemail.com',
                port: 587,
                secure: false,
                auth: auth,
                requireTLS: true,
                tls: { rejectUnauthorized: false }
            }
        },
        {
            name: 'Port 587 (STARTTLS)',
            config: {
                host: 'mail.privateemail.com',
                port: 587,
                secure: false,
                auth: auth,
                tls: {
                    ciphers: 'SSLv3',
                    rejectUnauthorized: false
                }
            }
        },
        {
            name: 'Port 26 (Alternative SMTP)',
            config: {
                host: 'mail.privateemail.com',
                port: 26,
                secure: false,
                auth: auth,
                tls: { rejectUnauthorized: false }
            }
        }
    ];

    const results = [];

    for (const { name, config } of configurations) {
        const result = await tryConfiguration(config, name);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('\n📊 SUMMARY:\n');

    const successfulConfigs = results.filter(r => r.success);

    if (successfulConfigs.length > 0) {
        console.log('✅ Working configurations:');
        successfulConfigs.forEach(r => console.log(`   - ${r.config}`));
        console.log('\n🎉 Use the working configuration in your emailService.js!');
    } else {
        console.log('❌ No configurations worked.\n');
        console.log('💡 Possible issues:');
        console.log('   1. Email address is incorrect');
        console.log('   2. Password is incorrect');
        console.log('   3. Email account doesn\'t exist in Namecheap');
        console.log('   4. SMTP access not enabled for your account');
        console.log('   5. Your IP might be blocked by Namecheap');
        console.log('\n✅ What to do:');
        console.log('   1. Log in to Namecheap and verify the email exists');
        console.log('   2. Try resetting the email password');
        console.log('   3. Check if SMTP is enabled for your email');
        console.log('   4. Contact Namecheap support: https://www.namecheap.com/support/');
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Run test
if (require.main === module) {
    testAllConfigurations()
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}
