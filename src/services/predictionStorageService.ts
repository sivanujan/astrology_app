/**
 * Prediction Storage Service
 * 
 * Handles storing and retrieving predictions from Firestore
 * Implements caching strategy with chart hashing
 */

import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ComprehensiveChartData, StoredPrediction } from '../types/enhancedDasaTypes';
import CryptoJS from 'crypto-js';

/**
 * Generate MD5 hash of chart data for caching
 * Same chart data = same hash = cache hit
 */
export function generateChartHash(chartData: ComprehensiveChartData): string {
    // Create a stable string representation of chart data
    const hashInput = JSON.stringify({
        birthDate: chartData.birthDetails.dateOfBirth.toISOString(),
        birthTime: chartData.birthDetails.timeOfBirth,
        latitude: chartData.birthDetails.latitude,
        longitude: chartData.birthDetails.longitude,
        dasaPlanet: chartData.dasaLord.name,
        bhuktiPlanet: chartData.bhuktiLord.name,
    });

    return CryptoJS.MD5(hashInput).toString();
}

/**
 * Generate unique prediction ID
 */
export function generatePredictionId(
    userId: string,
    dasaPlanet: string,
    bhuktiPlanet: string
): string {
    return `${userId}_${dasaPlanet}_${bhuktiPlanet}_${Date.now()}`;
}

/**
 * Generate shareable URL ID (short, random)
 */
export function generateShareableId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Save prediction to Firestore
 */
export async function savePrediction(
    userId: string,
    chartData: ComprehensiveChartData,
    tamilPrediction: string,
    englishPrediction: string,
    model: string
): Promise<string> {
    try {
        const chartHash = generateChartHash(chartData);
        const predictionId = generatePredictionId(
            userId,
            chartData.dasaLord.name,
            chartData.bhuktiLord.name
        );
        const shareableId = generateShareableId();

        const prediction: StoredPrediction = {
            id: predictionId,
            userId,
            chartHash,
            mahaDasa: chartData.dasaTimeline.mahaDasa.planet,
            bhukti: chartData.dasaTimeline.currentBhukti.planet,
            nextBhukti: chartData.nextBhuktiLord?.name,
            chartData,
            prediction: {
                tamil: tamilPrediction,
                english: englishPrediction,
                generatedAt: new Date(),
                model,
            },
            createdAt: new Date(),
            lastViewed: new Date(),
            viewCount: 0,
            shareableUrl: `/p/${shareableId}`,
            isPublic: false,
        };

        // Save to user's predictions collection
        const userPredictionRef = doc(db, 'users', userId, 'predictions', predictionId);
        await setDoc(userPredictionRef, {
            ...prediction,
            createdAt: Timestamp.fromDate(prediction.createdAt),
            lastViewed: Timestamp.fromDate(prediction.lastViewed),
            prediction: {
                ...prediction.prediction,
                generatedAt: Timestamp.fromDate(prediction.prediction.generatedAt),
            },
        });

        // Save to shared predictions collection for shareable URL
        const sharedPredictionRef = doc(db, 'shared-predictions', shareableId);
        await setDoc(sharedPredictionRef, {
            ...prediction,
            createdAt: Timestamp.fromDate(prediction.createdAt),
            lastViewed: Timestamp.fromDate(prediction.lastViewed),
            prediction: {
                ...prediction.prediction,
                generatedAt: Timestamp.fromDate(prediction.prediction.generatedAt),
            },
        });

        console.log('[Storage] Prediction saved:', predictionId);
        return predictionId;
    } catch (error) {
        console.error('[Storage] Error saving prediction:', error);
        throw error;
    }
}

/**
 * Load prediction by ID
 */
export async function loadPrediction(
    userId: string,
    predictionId: string
): Promise<StoredPrediction | null> {
    try {
        const predictionRef = doc(db, 'users', userId, 'predictions', predictionId);
        const predictionDoc = await getDoc(predictionRef);

        if (!predictionDoc.exists()) {
            return null;
        }

        const data = predictionDoc.data();

        // Update view count and last viewed
        await updateDoc(predictionRef, {
            lastViewed: Timestamp.now(),
            viewCount: (data.viewCount || 0) + 1,
        });

        // Convert Firestore timestamps to Dates
        return {
            ...data,
            createdAt: data.createdAt.toDate(),
            lastViewed: data.lastViewed.toDate(),
            prediction: {
                ...data.prediction,
                generatedAt: data.prediction.generatedAt.toDate(),
            },
        } as StoredPrediction;
    } catch (error) {
        console.error('[Storage] Error loading prediction:', error);
        return null;
    }
}

/**
 * Load prediction by shareable ID (for /p/:shareId route)
 */
export async function loadSharedPrediction(
    shareableId: string
): Promise<StoredPrediction | null> {
    try {
        const sharedRef = doc(db, 'shared-predictions', shareableId);
        const sharedDoc = await getDoc(sharedRef);

        if (!sharedDoc.exists()) {
            return null;
        }

        const data = sharedDoc.data();

        // Update view count
        await updateDoc(sharedRef, {
            lastViewed: Timestamp.now(),
            viewCount: (data.viewCount || 0) + 1,
        });

        return {
            ...data,
            createdAt: data.createdAt.toDate(),
            lastViewed: data.lastViewed.toDate(),
            prediction: {
                ...data.prediction,
                generatedAt: data.prediction.generatedAt.toDate(),
            },
        } as StoredPrediction;
    } catch (error) {
        console.error('[Storage] Error loading shared prediction:', error);
        return null;
    }
}

/**
 * Find existing prediction by chart hash (for caching)
 */
export async function findCachedPrediction(
    userId: string,
    chartHash: string
): Promise<StoredPrediction | null> {
    try {
        const predictionsRef = collection(db, 'users', userId, 'predictions');
        const q = query(predictionsRef, where('chartHash', '==', chartHash));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        // Get the most recent prediction
        const predictions = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            lastViewed: doc.data().lastViewed.toDate(),
            prediction: {
                ...doc.data().prediction,
                generatedAt: doc.data().prediction.generatedAt.toDate(),
            },
        })) as StoredPrediction[];

        predictions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const cached = predictions[0];

        // Check if cache is still valid (< 7 days old)
        const cacheAge = Date.now() - cached.createdAt.getTime();
        const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (cacheAge > CACHE_DURATION) {
            console.log('[Storage] Cache expired, will regenerate');
            return null;
        }

        console.log('[Storage] Cache hit!', cached.id);
        return cached;
    } catch (error) {
        console.error('[Storage] Error finding cached prediction:', error);
        return null;
    }
}

/**
 * Get all predictions for a user
 */
export async function getUserPredictions(
    userId: string
): Promise<StoredPrediction[]> {
    try {
        const predictionsRef = collection(db, 'users', userId, 'predictions');
        const querySnapshot = await getDocs(predictionsRef);

        const predictions = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            lastViewed: doc.data().lastViewed.toDate(),
            prediction: {
                ...doc.data().prediction,
                generatedAt: doc.data().prediction.generatedAt.toDate(),
            },
        })) as StoredPrediction[];

        // Sort by created date (newest first)
        predictions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return predictions;
    } catch (error) {
        console.error('[Storage] Error getting user predictions:', error);
        return [];
    }
}

/**
 * Update prediction visibility (public/private)
 */
export async function updatePredictionVisibility(
    userId: string,
    predictionId: string,
    isPublic: boolean
): Promise<boolean> {
    try {
        const predictionRef = doc(db, 'users', userId, 'predictions', predictionId);
        await updateDoc(predictionRef, { isPublic });

        // Also update shared prediction
        const predictionDoc = await getDoc(predictionRef);
        if (predictionDoc.exists()) {
            const shareableUrl = predictionDoc.data().shareableUrl;
            const shareableId = shareableUrl.split('/').pop();

            if (shareableId) {
                const sharedRef = doc(db, 'shared-predictions', shareableId);
                await updateDoc(sharedRef, { isPublic });
            }
        }

        return true;
    } catch (error) {
        console.error('[Storage] Error updating visibility:', error);
        return false;
    }
}

/**
 * Delete prediction
 */
export async function deletePrediction(
    userId: string,
    predictionId: string
): Promise<boolean> {
    try {
        const predictionRef = doc(db, 'users', userId, 'predictions', predictionId);
        const predictionDoc = await getDoc(predictionRef);

        if (predictionDoc.exists()) {
            const shareableUrl = predictionDoc.data().shareableUrl;
            const shareableId = shareableUrl.split('/').pop();

            // Delete from both collections
            await predictionRef.delete();

            if (shareableId) {
                const sharedRef = doc(db, 'shared-predictions', shareableId);
                await sharedRef.delete();
            }
        }

        return true;
    } catch (error) {
        console.error('[Storage] Error deleting prediction:', error);
        return false;
    }
}
