// Admin Email Whitelist
// Only users with these emails can access admin features
export const ADMIN_EMAILS = [
    'tamilnet2000@gmail.com',
    'thanarasansivanujan@gmail.com',
    // Add more admin emails here as needed
];

export const isAdmin = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};
