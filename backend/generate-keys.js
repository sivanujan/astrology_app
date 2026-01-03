const webPush = require('web-push');
const fs = require('fs');

const vapidKeys = webPush.generateVAPIDKeys();

const content = `VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

fs.writeFileSync('temp_vapid_keys.txt', content);
console.log('Keys generated to temp_vapid_keys.txt');
console.log('Public Length:', vapidKeys.publicKey.length);
