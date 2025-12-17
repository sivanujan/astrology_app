import { db } from '../lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, limit, serverTimestamp, where, addDoc, collectionGroup } from 'firebase/firestore';
import { OrchestratorResponse } from '../utils/aiOrchestrator';

// Define the Rule Interface
export interface AstrologyRule {
    id: string; // e.g., "Mithuna", "Kataka"
    key: string; // "Mithuna", "Kataka"
    category: "Lagna" | "General" | "Planet";
    content: string; // The specific rule text
    description?: string;
    lastUpdated?: any;
}

export interface ChatLog {
    id: string;
    userId: string;
    userName?: string;
    question: string;
    answer: string;
    intent: string;
    timestamp: any;
    language: string;
    metadata?: any;
    feedback?: {
        score: number;
        comment?: string;
        timestamp?: any;
    };
}

export const adminService = {
    // --- RULES MANAGEMENT ---

    // Fetch all rules
    getAllRules: async (): Promise<AstrologyRule[]> => {
        try {
            const rulesRef = collection(db, 'astrology_rules');
            const snapshot = await getDocs(rulesRef);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AstrologyRule));
        } catch (error) {
            console.error("Error fetching rules:", error);
            return [];
        }
    },

    // Save or Update a rule
    saveRule: async (rule: AstrologyRule): Promise<void> => {
        try {
            const ruleRef = doc(db, 'astrology_rules', rule.key);
            await setDoc(ruleRef, {
                ...rule,
                content: rule.content, // Ensure content is saved
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error saving rule:", error);
            throw error;
        }
    },

    // Delete a rule
    deleteRule: async (ruleId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'astrology_rules', ruleId));
        } catch (error) {
            console.error("Error deleting rule:", error);
            throw error;
        }
    },

    // --- CHAT LOGS ---

    // Fetch recent chat logs
    getChatLogs: async (limitCount = 50): Promise<ChatLog[]> => {
        try {
            const logsRef = collection(db, 'chat_logs');
            const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatLog));
        } catch (error) {
            console.error("Error fetching chat logs:", error);
            return [];
        }
    },

    async getLegacyChatLogs(limitCount = 50): Promise<ChatLog[]> {
        try {
            const messagesQuery = query(
                collectionGroup(db, 'messages'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(messagesQuery);

            // 1. Collect unique parent chart references
            // Structure: users/{uid}/charts/{chartId}/messages/{msgId}
            // Parent.Parent is the chart document
            const chartRefsMap = new Map<string, any>();
            const logs: ChatLog[] = [];

            for (const docSnapshot of snapshot.docs) {
                const chartDocRef = docSnapshot.ref.parent.parent;
                if (chartDocRef) {
                    chartRefsMap.set(chartDocRef.path, chartDocRef);
                }
            }

            // 2. Fetch all charts in parallel
            const chartDocsPromises = Array.from(chartRefsMap.values()).map(ref => getDoc(ref));
            const chartDocsSnapshots = await Promise.all(chartDocsPromises);

            // 3. Create a lookup map for chart data
            const chartDataLookup: Record<string, any> = {};
            chartDocsSnapshots.forEach(snap => {
                if (snap.exists()) {
                    chartDataLookup[snap.ref.path] = snap.data();
                }
            });

            // 4. Map logs with user details
            return snapshot.docs.map(doc => {
                const data = doc.data();
                const chartRef = doc.ref.parent.parent;
                const chartId = chartRef?.id || "";

                let chartData = chartRef ? chartDataLookup[chartRef.path] : null;
                let userDetails = chartData?.userDetails || {};
                let birthDate = chartData?.birthDate;
                let isPhantom = false;

                // Fallback: Parse Chart ID if Chart Doc doesn't exist (Phantom Document)
                // Format: Name_Timestamp or Name_Timestamp_Language
                if (!chartData && chartId) {
                    isPhantom = true;
                    // Attempt to extract Name and Timestamp
                    // IDs usually end with time string or language
                    // Heuristic: Look for long digit strings
                    const parts = chartId.split('_');
                    const timestampStr = parts.find(p => /^\d{10,14}$/.test(p));

                    if (timestampStr) {
                        birthDate = new Date(parseInt(timestampStr));
                        // Assume name is everything before timestamp
                        const timeIndex = parts.indexOf(timestampStr);
                        const namePart = parts.slice(0, timeIndex).join(' '); // Re-join with space for readability
                        userDetails = { name: namePart, uid: "Phantom" };
                    }
                }

                return {
                    id: doc.id,
                    userId: userDetails.uid || "Legacy ID",
                    userName: userDetails.name || "Unknown User",
                    question: data.role === 'user' ? data.content : "-", // Set to "-" so UI displays answer
                    answer: data.role === 'ai' ? data.content : "-",
                    intent: "History",
                    language: "en",
                    timestamp: data.timestamp,
                    feedback: data.feedback,
                    // Store extra details in metadata
                    metadata: {
                        legacy: true,
                        role: data.role,
                        dob: birthDate || "Unknown",
                        birthTime: chartData?.birthTime || "Unknown",
                        isPhantom
                    }
                } as ChatLog;
            });

        } catch (error: any) {
            console.error("Error fetching legacy logs (Index might be missing):", error);
            throw error;
        }
    },

    // --- SEEDING (Migration) ---
    // This will be called by the UI to populate the DB with hardcoded rules
    seedRules: async (rulesMap: Record<string, string>): Promise<void> => {
        for (const [key, content] of Object.entries(rulesMap)) {
            await adminService.saveRule({
                id: key,
                key: key,
                category: "Lagna",
                content: content,
                description: `Default Guruji Rule for ${key}`
            });
        }
    }
};
