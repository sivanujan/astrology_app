const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Get all users list
 * GET /api/admin/users
 */
router.get('/users', async (req, res) => {
    try {
        console.log('📥 Admin: Fetching all users');

        const usersSnapshot = await db.collection('users').get();
        const users = [];

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();

            // Get chat count for this user
            const chatUsageSnapshot = await db.collection('chat_usage')
                .where('uid', '==', doc.id)
                .get();

            const totalChats = chatUsageSnapshot.docs.reduce((sum, chatDoc) => {
                return sum + (chatDoc.data().count || 0);
            }, 0);

            users.push({
                uid: doc.id,
                email: userData.profile?.email || userData.email || 'N/A',
                displayName: userData.profile?.name || userData.displayName || userData.name || 'N/A',
                createdAt: userData.createdAt?.toDate() || null,
                lastLogin: userData.last_login?.toDate() || userData.lastLogin?.toDate() || null,
                totalChats: totalChats
            });
        }

        // Sort by creation date (newest first)
        users.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt - a.createdAt;
        });

        res.json({
            success: true,
            users: users,
            count: users.length
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

/**
 * Get specific user details
 * GET /api/admin/user/:uid
 */
router.get('/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        console.log('📥 Admin: Fetching user details for', uid);

        // Get user document
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userData = userDoc.data();

        // Get chat usage
        const chatUsageSnapshot = await db.collection('chat_usage')
            .where('uid', '==', uid)
            .get();

        const totalChats = chatUsageSnapshot.docs.reduce((sum, doc) => {
            return sum + (doc.data().count || 0);
        }, 0);

        // Get active promo
        const promoSnapshot = await db.collection('users').doc(uid)
            .collection('promo_activations')
            .where('isActive', '==', true)
            .where('expiresAt', '>', new Date())
            .limit(1)
            .get();

        const hasActivePromo = !promoSnapshot.empty;
        const promoData = hasActivePromo ? promoSnapshot.docs[0].data() : null;

        // Get IP addresses from BOTH old and new chat paths
        const ipAddresses = new Set();
        const deviceFingerprints = new Set();

        // Check new path: ai_chat_messages
        try {
            const newChatsSnapshot = await db.collection('users').doc(uid)
                .collection('ai_chat_messages')
                .get();

            newChatsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.ipAddress) ipAddresses.add(data.ipAddress);
                if (data.deviceFingerprint) deviceFingerprints.add(data.deviceFingerprint);
            });
        } catch (e) {
            console.log('No ai_chat_messages for user');
        }

        res.json({
            success: true,
            user: {
                uid: uid,
                email: userData.profile?.email || userData.email || 'N/A',
                displayName: userData.profile?.name || userData.displayName || userData.name || 'N/A',
                phone: userData.profile?.phone || userData.phone || 'N/A',
                dob: userData.dob || userData.profile?.dob || 'N/A',
                birthTime: userData.birthTime || userData.profile?.birthTime || 'N/A',
                location: userData.location || userData.profile?.location || 'N/A',
                createdAt: userData.createdAt?.toDate() || null,
                lastLogin: userData.last_login?.toDate() || userData.lastLogin?.toDate() || null,
                totalChats: totalChats,
                hasActivePromo: hasActivePromo,
                promoCode: promoData?.promoCode || null,
                promoExpiresAt: promoData?.expiresAt?.toDate() || null,
                ipAddresses: Array.from(ipAddresses),
                deviceFingerprints: Array.from(deviceFingerprints)
            }
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details',
            error: error.message
        });
    }
});

/**
 * Get user's complete chat history - from BOTH old and new paths
 * GET /api/admin/user/:uid/chats
 */
router.get('/user/:uid/chats', async (req, res) => {
    try {
        const { uid } = req.params;
        console.log('📥 Admin: Fetching chat history for', uid);

        const chats = [];

        // 1. NEW path: ai_chat_messages
        try {
            const newChatsSnapshot = await db.collection('users').doc(uid)
                .collection('ai_chat_messages')
                .orderBy('timestamp', 'desc')
                .get();

            newChatsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.userQuestion || data.aiResponse) {
                    chats.push({
                        id: doc.id,
                        question: data.userQuestion || data.question || '',
                        response: data.aiResponse || data.response || '',
                        timestamp: data.timestamp?.toDate(),
                        language: data.language || 'en',
                        ipAddress: data.ipAddress || 'Unknown',
                        deviceFingerprint: data.deviceFingerprint || 'Unknown',
                        source: 'new'
                    });
                }
            });
        } catch (err) {
            console.log('No messages in ai_chat_messages');
        }

        // 2. OLD path: charts/{chartId}/messages
        try {
            const chartsSnapshot = await db.collection('users').doc(uid)
                .collection('charts')
                .get();

            for (const chartDoc of chartsSnapshot.docs) {
                const messagesSnapshot = await db.collection('users').doc(uid)
                    .collection('charts')
                    .doc(chartDoc.id)
                    .collection('messages')
                    .get();

                const pairMap = new Map();
                messagesSnapshot.forEach(doc => {
                    const data = doc.data();
                    const ts = data.timestamp?.toDate()?.getTime() || 0;

                    if (data.sender === 'user') {
                        if (!pairMap.has(ts)) {
                            pairMap.set(ts, { question: data.text, response: '', timestamp: data.timestamp?.toDate(), lang: data.language || 'en' });
                        } else {
                            pairMap.get(ts).question = data.text;
                        }
                    } else if (data.sender === 'ai') {
                        if (!pairMap.has(ts)) {
                            pairMap.set(ts, { question: '', response: data.text, timestamp: data.timestamp?.toDate(), lang: data.language || 'en' });
                        } else {
                            pairMap.get(ts).response = data.text;
                        }
                    }
                });

                pairMap.forEach((pair, ts) => {
                    if (pair.question || pair.response) {
                        chats.push({
                            id: `legacy_${ts}`,
                            question: pair.question,
                            response: pair.response,
                            timestamp: pair.timestamp,
                            language: pair.lang,
                            ipAddress: 'Legacy (not captured)',
                            deviceFingerprint: 'Legacy (not captured)',
                            source: 'legacy'
                        });
                    }
                });
            }
        } catch (err) {
            console.log('No messages in charts/messages');
        }

        // Sort all by timestamp descending
        chats.sort((a, b) => {
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return b.timestamp - a.timestamp;
        });

        res.json({
            success: true,
            chats: chats,
            count: chats.length
        });

    } catch (error) {
        console.error('Error fetching user chats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user chats',
            error: error.message
        });
    }
});

/**
 * Get chat logs for admin dashboard (recent 100)
 * GET /api/admin/chat-logs
 */
router.get('/chat-logs', async (req, res) => {
    try {
        console.log('📥 Admin: Fetching recent chat logs');

        const chatLogs = [];

        const messagesSnapshot = await db.collectionGroup('ai_chat_messages')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        messagesSnapshot.forEach(doc => {
            const data = doc.data();
            chatLogs.push({
                id: doc.id,
                userQuestion: data.userQuestion || data.question,
                aiResponse: data.aiResponse || data.response,
                timestamp: data.timestamp?.toDate(),
                userId: data.userId || 'unknown',
                language: data.language || 'en',
                ipAddress: data.ipAddress || 'Unknown'
            });
        });

        res.json({
            success: true,
            logs: chatLogs,
            count: chatLogs.length
        });

    } catch (error) {
        console.error('Error fetching chat logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat logs',
            error: error.message
        });
    }
});

/**
 * Get admin statistics
 * GET /api/admin/stats
 */
router.get('/stats', async (req, res) => {
    try {
        console.log('📥 Admin: Fetching stats');

        const usersSnapshot = await db.collection('users').get();
        const userCount = usersSnapshot.size;

        const promosSnapshot = await db.collection('promo_codes').get();
        const promoCount = promosSnapshot.size;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayString = today.toISOString().split('T')[0];
        const chatUsageSnapshot = await db.collection('chat_usage')
            .where('date', '==', todayString)
            .get();

        const todayChatCount = chatUsageSnapshot.docs.reduce((sum, doc) => {
            return sum + (doc.data().count || 0);
        }, 0);

        res.json({
            success: true,
            stats: {
                totalUsers: userCount,
                totalPromos: promoCount,
                todayChats: todayChatCount
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error.message
        });
    }
});

/**
 * Get custom prediction rules
 * GET /api/admin/rules
 */
router.get('/rules', async (req, res) => {
    try {
        console.log('📥 Admin: Fetching custom rules');

        const rulesSnapshot = await db.collection('custom_rules').get();

        const rules = [];
        rulesSnapshot.forEach(doc => {
            rules.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            rules: rules,
            count: rules.length
        });

    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rules',
            error: error.message
        });
    }
});

module.exports = router;
