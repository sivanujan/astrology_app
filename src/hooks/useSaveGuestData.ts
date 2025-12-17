import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface BirthDetails {
    dob: Date;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
}

/**
 * Custom hook to save guest birth data to user's Firestore profile after authentication
 * This enables seamless transition from guest to authenticated user
 */
export const useSaveGuestData = () => {
    const { user } = useAuth();

    useEffect(() => {
        const saveGuestDataToFirestore = async () => {
            if (!user) return;

            // Check for temporary birth data in localStorage
            const tempData = localStorage.getItem('guestBirthData');
            if (!tempData) return;

            try {
                const birthDetails: BirthDetails = JSON.parse(tempData);

                // Save to Firestore
                await setDoc(
                    doc(db, 'users', user.uid),
                    {
                        birth_details: {
                            dob: birthDetails.dob,
                            time: birthDetails.time,
                            place: birthDetails.place,
                            latitude: birthDetails.latitude,
                            longitude: birthDetails.longitude
                        },
                        updatedAt: new Date()
                    },
                    { merge: true } // Merge with existing data
                );

                // Clear temporary data
                localStorage.removeItem('guestBirthData');

                // Optional: Show success notification
                console.log('✅ Birth chart data saved successfully!');

            } catch (error) {
                console.error('❌ Failed to save guest data:', error);
            }
        };

        saveGuestDataToFirestore();
    }, [user]);
};

/**
 * Function to save birth data temporarily for guest users
 * Call this when guest enters birth details on the home page
 */
export const saveGuestBirthData = (birthDetails: BirthDetails) => {
    localStorage.setItem('guestBirthData', JSON.stringify(birthDetails));
};

/**
 * Function to check if there's guest data available
 */
export const hasGuestData = (): boolean => {
    return localStorage.getItem('guestBirthData') !== null;
};

/**
 * Function to get guest data
 */
export const getGuestData = (): BirthDetails | null => {
    const data = localStorage.getItem('guestBirthData');
    return data ? JSON.parse(data) : null;
};
