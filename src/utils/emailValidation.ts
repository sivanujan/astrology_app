
// List of disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
    'fftube.com',
    'temp-mail.org',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'yopmail.com',
    'mailinator.com',
    'getairmail.com',
    'throwawaymail.com',
    'tempail.com',
    'maildrop.cc'
]);

/**
 * Checks if an email address belongs to a known disposable email provider.
 * @param email The email address to check.
 * @returns true if the email is disposable, false otherwise.
 */
export const isDisposableEmail = (email: string): boolean => {
    if (!email || !email.includes('@')) {
        return false;
    }

    const domain = email.split('@')[1].toLowerCase();
    return DISPOSABLE_DOMAINS.has(domain);
};
