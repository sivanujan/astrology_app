import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { OrchestratorResponse } from '../utils/aiOrchestrator';

// Helper to generate a consistent ID for the chart based on birth details and language
export const generateChartId = (userDetails: { name: string }, birthDate: string | Date, language: string): string => {
    const dateStr = new Date(birthDate).getTime().toString();
    const sanitizedName = userDetails.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `${sanitizedName}_${dateStr}_${language}`;
};

export interface StoredPrediction {
    id: string;
    timestamp: any;
    data: OrchestratorResponse;
    language: string;
    version: number;
}

const PREDICTION_VERSION = 1;

export const predictionService = {
    // Get stored prediction from Firestore
    getStoredPrediction: async (userId: string, chartId: string): Promise<StoredPrediction | null> => {
        try {
            const docRef = doc(db, `users/${userId}/predictions/${chartId}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as StoredPrediction;
            }
            return null;
        } catch (error) {
            console.error("Error fetching stored prediction:", error);
            return null;
        }
    },

    // Save prediction to Firestore
    savePrediction: async (userId: string, chartId: string, data: OrchestratorResponse, language: string): Promise<void> => {
        try {
            const docRef = doc(db, `users/${userId}/predictions/${chartId}`);
            await setDoc(docRef, {
                id: chartId,
                timestamp: serverTimestamp(),
                data,
                language,
                version: PREDICTION_VERSION
            });
            console.log("Prediction saved to cache");
        } catch (error) {
            console.error("Error saving prediction:", error);
        }
    },

    // Log Chat Interaction (For Admin Dashboard)
    logChatInteraction: async (userId: string, userName: string, question: string, answer: string, intent: string, language: string, context?: any): Promise<void> => {
        try {
            const logsRef = collection(db, 'chat_logs');
            await addDoc(logsRef, {
                userId,
                userName,
                question,
                answer,
                intent,
                language,
                timestamp: serverTimestamp(),
                metadata: context ? JSON.stringify(context).substring(0, 1000) : null // Truncate metadata if needed
            });
            console.log("Chat interaction logged");
        } catch (error) {
            console.error("Error logging chat:", error);
        }
    }
};
