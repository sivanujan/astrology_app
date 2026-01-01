
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

export interface PasswordStrength {
    score: number; // 0-5
    level: 'Too Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
    missing: string[];
    isValid: boolean;
}

/**
 * Analyzes password strength and returns detailed feedback.
 */
export const validatePassword = (password: string): PasswordStrength => {
    let score = 0;
    const missing: string[] = [];

    // Criteria Checks
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLength) score++; else missing.push("At least 8 characters");
    if (hasUpper) score++; else missing.push("Uppercase letter");
    if (hasLower) score++;
    if (hasNumber) score++; else missing.push("Number");
    if (hasSpecial) score++; else missing.push("Special character");

    // Level Determination
    let level: PasswordStrength['level'] = 'Too Weak';
    if (score <= 1) level = 'Too Weak';
    else if (score === 2) level = 'Weak';
    else if (score === 3) level = 'Fair';
    else if (score === 4) level = 'Good';
    else if (score >= 5) level = 'Strong';

    return {
        score,
        level,
        missing,
        isValid: score >= 5 // Require all criteria for "Valid" in specific strict contexts, or just >3 generally.
    };
};
