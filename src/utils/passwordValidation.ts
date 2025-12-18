
/**
 * Validates the strength of a password.
 * Criteria:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character (!@#$%^&*(),.?":{}|<>)
 * 
 * @param password The password to validate
 * @returns Object containing isValid boolean and optional errorKey for translation
 */
export const validatePassword = (password: string): { isValid: boolean; errorKey?: string } => {
    if (password.length < 8) {
        return { isValid: false, errorKey: 'passwordTooShort' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return { isValid: false, errorKey: 'passwordRequirements' };
    }

    return { isValid: true };
};
