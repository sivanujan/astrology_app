// Admin Email Whitelist - Backend
const ADMIN_EMAILS = [
    'tamilnet2000@gmail.com',
    'thanarasansivanujan@gmail.com',
    // Add more admin emails here
];

const isAdmin = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Admin Authentication Middleware
const requireAdmin = async (req, res, next) => {
    try {
        // Get the Firebase ID token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: No token provided'
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the token with Firebase Admin SDK
        const admin = require('firebase-admin');
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Check if user email is in admin whitelist
        if (!isAdmin(decodedToken.email)) {
            console.error('🚫 Unauthorized admin access attempt:', decodedToken.email);
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Admin access denied'
            });
        }

        // User is verified admin, proceed
        req.adminUser = decodedToken;
        next();

    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid token'
        });
    }
};

module.exports = { requireAdmin, isAdmin };
