const axios = require('axios');

async function testApi() {
    console.log("Testing Notifications API...");
    try {
        const response = await axios.get('http://localhost:5000/api/notifications/vapid-key');
        console.log("✅ VAPID Key Fetch Success!");
        console.log("Key:", response.data.publicKey);

        if (response.data.publicKey && response.data.publicKey.length > 10) {
            console.log("🎉 Server is HEALTHY and ready for Push Notifications.");
        } else {
            console.log("⚠️ Key seems invalid.");
        }

    } catch (error) {
        console.error("❌ API Call Failed:", error.message);
    }
}

testApi();
