/**
 * API Configuration
 * Central place to manage API endpoints
 */

const API_CONFIG = {
    // Backend API URL - Falls back to localhost in development
    baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000',

    // API Endpoints
    endpoints: {
        auth: {
            sendVerification: '/api/auth/send-verification-email',
            sendPasswordReset: '/api/auth/send-password-reset',
            checkVerification: '/api/auth/check-verification',
        },
        chat: {
            send: '/api/chat/send'
        }
    }
};

/**
 * Helper function to make API calls
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
};

export { API_CONFIG };
export default API_CONFIG;
