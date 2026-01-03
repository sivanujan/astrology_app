const axios = require('axios');

async function testApi() {
    console.log("Testing WhatsApp API Endpoint...");
    try {
        // 1. Test Health Check
        console.log("1. Checking Server Health...");
        try {
            const health = await axios.get('http://localhost:5000/api/health');
            console.log("✅ Server Health: ", health.data);
        } catch (e) {
            console.error("❌ Health Check Failed. Is server running?");
            process.exit(1);
        }

        // 2. Test Send Code Route
        console.log("\n2. Testing /api/whatsapp/send-code...");
        const response = await axios.post('http://localhost:5000/api/whatsapp/send-code', {
            phoneNumber: '919876543210' // Dummy number
        });

        console.log("✅ API Response:", response.data);

        if (response.data.success) {
            console.log("\n🎉 API is WORKING! The issue is likely in the Frontend/Service Worker.");
        } else {
            console.log("\n⚠️ API responded but with failure:", response.data);
        }

    } catch (error) {
        console.error("❌ API Call Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Status:", error.response.status);
        }
    }
}

testApi();
