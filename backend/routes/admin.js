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

        // Calculate Total Chats (New + Legacy)
        let totalChats = 0;

        // 1. Count New Chats (ai_chat_messages)
        try {
            const newChatsSnapshot = await db.collection('users').doc(uid).collection('ai_chat_messages').get();
            totalChats += newChatsSnapshot.size;
            console.log(`✅ Counted ${newChatsSnapshot.size} new chats for ${uid}`);
        } catch (e) {
            console.log('❌ Error counting new chats:', e.message);
        }

        // 2. Count Legacy Chats (charts/{chartId}/messages)
        try {
            const chartsSnapshot = await db.collection('users').doc(uid).collection('charts').get();
            for (const chartDoc of chartsSnapshot.docs) {
                const msgsSnapshot = await chartDoc.ref.collection('messages').get();
                totalChats += msgsSnapshot.size;
            }
            console.log(`✅ Total chats (new + legacy): ${totalChats}`);
        } catch (e) {
            console.log('❌ Error counting legacy chats:', e.message);
        }

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



        // HACK: We need to attach latestUsage but we already sent res.json above? 
        // Wait, the previous code sent res.json directly. I need to modify it to BUILD the object first.

        let userPayload = {
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
            deviceFingerprints: Array.from(deviceFingerprints),
            latestUsage: null
        };

        try {
            const usageSnapshot = await db.collection('users').doc(uid)
                .collection('chat_usage')
                .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
                .limit(1)
                .get();

            if (!usageSnapshot.empty) {
                const doc = usageSnapshot.docs[0];
                const d = doc.data();
                userPayload.latestUsage = {
                    date: doc.id,
                    count: d.count,
                    lastChatAt: d.lastChatAt ? d.lastChatAt.toDate() : null
                };
            }
        } catch (e) {
            console.log('Error fetching latest usage:', e);
        }

        // Send final response (overwriting the previous incorrect attempts if I had partial edits)
        // Note: The previous res.json call in line 122 must be REMOVED or replaced by this block.
        // Since I'm using replace_file_content on lines 122-141, I am effectively REPLACING the old res.json call.

        return res.json({
            success: true,
            user: userPayload
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
 * Get user's charts with their messages (hierarchical structure)
 * GET /api/admin/user/:uid/chats
 */
router.get('/user/:uid/chats', async (req, res) => {
    try {
        const { uid } = req.params;
        console.log('📥 Admin: Fetching charts and messages for', uid);

        const charts = [];

        // Fetch all charts for this user
        const chartsSnapshot = await db.collection('users').doc(uid)
            .collection('charts')
            .get();

        console.log(`Found ${chartsSnapshot.size} charts for ${uid}`);

        for (const chartDoc of chartsSnapshot.docs) {
            const chartId = chartDoc.id;
            const chartData = chartDoc.data();

            // Fetch messages for this chart
            const messagesSnapshot = await db.collection('users').doc(uid)
                .collection('charts')
                .doc(chartId)
                .collection('messages')
                .orderBy('timestamp', 'asc')
                .get();

            const messages = messagesSnapshot.docs.map(msgDoc => {
                const data = msgDoc.data();
                return {
                    id: msgDoc.id,
                    role: data.role || data.sender || 'unknown',
                    content: data.content || data.text || '',
                    timestamp: data.timestamp?.toDate(),
                    language: data.language || 'en',
                    ipAddress: data.ipAddress || 'Unknown',
                    deviceFingerprint: data.deviceFingerprint || 'Unknown'
                };
            });

            charts.push({
                chartId: chartId,
                chartName: chartData.name || 'Unknown Chart',
                createdAt: chartData.createdAt?.toDate() || null,
                messageCount: messages.length,
                messages: messages
            });
        }

        // Sort charts by creation date (newest first)
        charts.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt - a.createdAt;
        });

        res.json({
            success: true,
            charts: charts,
            totalCharts: charts.length,
            totalMessages: charts.reduce((sum, c) => sum + c.messageCount, 0)
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
 * Get chat logs for admin dashboard (recent 100 messages from all users)
 * GET /api/admin/chat-logs
 */
router.get('/chat-logs', async (req, res) => {
    try {
        console.log('📥 Admin: Fetching recent chat logs');

        const chatLogs = [];

        // Use collectionGroup to query all messages across all charts
        const messagesSnapshot = await db.collectionGroup('messages')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        // Fetch user details for each message
        const userCache = new Map();

        for (const doc of messagesSnapshot.docs) {
            const data = doc.data();
            const userId = data.userId || 'unknown';

            // Get user email if not cached
            if (!userCache.has(userId) && userId !== 'unknown') {
                try {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        userCache.set(userId, {
                            email: userData.profile?.email || userData.email || 'N/A',
                            name: userData.profile?.name || userData.displayName || 'N/A'
                        });
                    } else {
                        userCache.set(userId, { email: 'Unknown', name: 'Unknown' });
                    }
                } catch (e) {
                    userCache.set(userId, { email: 'Error', name: 'Error' });
                }
            }

            const userInfo = userCache.get(userId) || { email: 'Unknown', name: 'Unknown' };

            chatLogs.push({
                id: doc.id,
                role: data.role || data.sender || 'unknown',
                content: data.content || data.text || '',
                timestamp: data.timestamp?.toDate(),
                userId: userId,
                userEmail: userInfo.email,
                userName: userInfo.name,
                language: data.language || 'en',
                ipAddress: data.ipAddress || 'Unknown',
                deviceFingerprint: data.deviceFingerprint || 'Unknown'
            });
        }

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


/**
 * Reset user's chat limit (Delete specific day's usage)
 * POST /api/admin/user/:uid/reset-limit
 */
router.post('/user/:uid/reset-limit', async (req, res) => {
    try {
        const { uid } = req.params;
        const { date } = req.body; // Optional: Specific date to reset

        console.log(`🗑️ Resetting limit for ${uid}, date: ${date || 'LATEST'}`);

        const usageCollection = db.collection('users').doc(uid).collection('chat_usage');

        let docToDelete = date;

        if (!date) {
            // Find latest
            const snapshot = await usageCollection
                .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
                .limit(1)
                .get();

            if (!snapshot.empty) {
                docToDelete = snapshot.docs[0].id;
            }
        }

        if (docToDelete) {
            await usageCollection.doc(docToDelete).delete();
            console.log(`✅ Deleted chat usage for ${docToDelete}`);
            res.json({ success: true, message: `Limit reset for ${docToDelete}` });
        } else {
            res.json({ success: false, message: 'No usage found to reset' });
        }

    } catch (error) {
        console.error('Error resetting limit:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DEBUG: Inspect user data structure
 * GET /api/admin/debug/:uid
 */
router.get('/debug/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        console.log(`🔍 DEBUG: Inspecting data structure for ${uid}`);

        const debug = {
            uid,
            collections: {},
            errors: []
        };

        // Check user document
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            debug.collections.userDoc = {
                exists: userDoc.exists,
                fields: userDoc.exists ? Object.keys(userDoc.data()) : []
            };
        } catch (e) {
            debug.errors.push(`User doc: ${e.message}`);
        }

        // Check ai_chat_messages
        try {
            const aiChats = await db.collection('users').doc(uid).collection('ai_chat_messages').get();
            debug.collections.ai_chat_messages = {
                count: aiChats.size,
                sampleFields: aiChats.docs[0] ? Object.keys(aiChats.docs[0].data()) : []
            };
        } catch (e) {
            debug.errors.push(`ai_chat_messages: ${e.message}`);
        }

        // Check charts
        try {
            const charts = await db.collection('users').doc(uid).collection('charts').get();
            debug.collections.charts = {
                count: charts.size,
                chartIds: charts.docs.map(d => d.id).slice(0, 3)
            };

            if (charts.size > 0) {
                const msgs = await charts.docs[0].ref.collection('messages').get();
                debug.collections.charts.firstChartMessages = msgs.size;
            }
        } catch (e) {
            debug.errors.push(`charts: ${e.message}`);
        }

        // Check chat_usage
        try {
            const usage = await db.collection('users').doc(uid).collection('chat_usage').get();
            debug.collections.chat_usage = {
                count: usage.size,
                dates: usage.docs.map(d => d.id)
            };
        } catch (e) {
            debug.errors.push(`chat_usage: ${e.message}`);
        }

        res.json({ success: true, debug });

    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
