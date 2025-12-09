const { db, auth } = require('../config/firebase');

/**
 * User Model for Firestore
 * Collection: users
 */
class User {
    constructor(data) {
        this.firebase_uid = data.firebase_uid;
        this.profile = data.profile || {};
        this.birth_details = data.birth_details || {};
        this.astrology_data = data.astrology_data || {};
        this.subscription = data.subscription || { plan: 'free', is_active: false };
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validate required fields
    validate() {
        const errors = [];

        if (!this.firebase_uid) errors.push('Firebase UID is required');
        if (!this.profile.name) errors.push('Name is required');
        if (!this.profile.email) errors.push('Email is required');
        if (!this.birth_details.dob) errors.push('Date of birth is required');
        if (!this.birth_details.time) errors.push('Birth time is required');
        if (!this.birth_details.place) errors.push('Birth place is required');
        if (this.birth_details.latitude === undefined) errors.push('Latitude is required');
        if (this.birth_details.longitude === undefined) errors.push('Longitude is required');

        return errors;
    }

    // Convert to Firestore document format
    toFirestore() {
        return {
            firebase_uid: this.firebase_uid,
            profile: {
                name: this.profile.name || '',
                email: this.profile.email || '',
                phone: this.profile.phone || '',
                role: this.profile.role || 'user'
            },
            birth_details: {
                dob: this.birth_details.dob,
                time: this.birth_details.time,
                place: this.birth_details.place,
                latitude: this.birth_details.latitude,
                longitude: this.birth_details.longitude
            },
            astrology_data: {
                lagna: this.astrology_data.lagna || '',
                rasi: this.astrology_data.rasi || '',
                nakshatra: this.astrology_data.nakshatra || '',
                current_dasa: this.astrology_data.current_dasa || '',
                planets: this.astrology_data.planets || {},
                subathuvam_scores: this.astrology_data.subathuvam_scores || {},
                last_calculated: this.astrology_data.last_calculated || new Date()
            },
            subscription: {
                plan: this.subscription.plan || 'free',
                start_date: this.subscription.start_date || null,
                end_date: this.subscription.end_date || null,
                is_active: this.subscription.is_active || false
            },
            updatedAt: new Date()
        };
    }

    // Static: Create new user
    static async create(userData) {
        const user = new User(userData);
        const errors = user.validate();

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const userDoc = user.toFirestore();
        userDoc.createdAt = new Date();

        await db.collection('users').doc(user.firebase_uid).set(userDoc);
        return user;
    }

    // Static: Find by Firebase UID
    static async findByFirebaseUid(uid) {
        const doc = await db.collection('users').doc(uid).get();

        if (!doc.exists) {
            return null;
        }

        return new User({ ...doc.data(), firebase_uid: doc.id });
    }

    // Static: Find by email
    static async findByEmail(email) {
        const snapshot = await db.collection('users')
            .where('profile.email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return new User({ ...doc.data(), firebase_uid: doc.id });
    }

    // Static: Update user
    static async update(uid, updateData) {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            throw new Error('User not found');
        }

        const updates = {
            ...updateData,
            updatedAt: new Date()
        };

        await userRef.update(updates);
        return await User.findByFirebaseUid(uid);
    }

    // Static: Delete user
    static async delete(uid) {
        await db.collection('users').doc(uid).delete();
        return true;
    }

    // Instance: Update astrology data
    async updateAstrologyData(data) {
        this.astrology_data = {
            ...this.astrology_data,
            ...data,
            last_calculated: new Date()
        };

        await db.collection('users').doc(this.firebase_uid).update({
            astrology_data: this.astrology_data,
            updatedAt: new Date()
        });
    }

    // Instance: Get age
    getAge() {
        if (!this.birth_details.dob) return null;

        const today = new Date();
        const birthDate = new Date(this.birth_details.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }
}

module.exports = User;
