import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { ComprehensiveMatchResult } from '../utils/marriageMatchingMain';

export interface ShareableResult {
    result: ComprehensiveMatchResult;
    boyDetails: any;
    girlDetails: any;
    createdAt: string;
    language: string;
}

export const saveMarriageResult = async (
    result: ComprehensiveMatchResult,
    boyDetails: any,
    girlDetails: any,
    language: string
): Promise<string> => {
    try {
        // Generate unique ID
        const resultId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Save to Firestore
        await setDoc(doc(db, 'marriageResults', resultId), {
            result,
            boyDetails,
            girlDetails,
            createdAt: new Date().toISOString(),
            language
        });

        return resultId;
    } catch (error) {
        console.error('Error saving marriage result:', error);
        throw error;
    }
};

export const loadMarriageResult = async (resultId: string): Promise<ShareableResult | null> => {
    try {
        const docRef = doc(db, 'marriageResults', resultId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as ShareableResult;
        }
        return null;
    } catch (error) {
        console.error('Error loading marriage result:', error);
        return null;
    }
};

export const generateShareableUrl = (resultId: string): string => {
    return `${window.location.origin}/comprehensive-results?id=${resultId}`;
};
