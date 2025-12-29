/**
 * URL Generator for Dynamic Prediction Routes
 * 
 * Generates URLs for accessing predictions
 */

/**
 * Generate prediction URL for user's own prediction
 * Format: /predictions/{userId}/{dasaId}
 */
export function generatePredictionUrl(
    userId: string,
    dasaPlanet: string,
    bhuktiPlanet: string
): string {
    const dasaId = `${dasaPlanet.toLowerCase()}-${bhuktiPlanet.toLowerCase()}`;
    return `/predictions/${userId}/${dasaId}`;
}

/**
 * Generate share URL (short version)
 * Format: /p/{shareableId}
 */
export function generateShareUrl(shareableId: string): string {
    return `/p/${shareableId}`;
}

/**
 * Extract shareable ID from share URL
 */
export function extractShareableId(shareUrl: string): string | null {
    const match = shareUrl.match(/\/p\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

/**
 * Extract user ID and dasa ID from prediction URL
 */
export function extractPredictionParams(predictionUrl: string): {
    userId: string | null;
    dasaId: string | null;
} {
    const match = predictionUrl.match(/\/predictions\/([^/]+)\/([^/]+)/);

    if (match) {
        return {
            userId: match[1],
            dasaId: match[2],
        };
    }

    return {
        userId: null,
        dasaId: null,
    };
}

/**
 * Parse dasa ID back to planet names
 */
export function parseDasaId(dasaId: string): {
    dasaPlanet: string;
    bhuktiPlanet: string;
} | null {
    const parts = dasaId.split('-');

    if (parts.length !== 2) {
        return null;
    }

    // Capitalize first letter
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return {
        dasaPlanet: capitalize(parts[0]),
        bhuktiPlanet: capitalize(parts[1]),
    };
}
