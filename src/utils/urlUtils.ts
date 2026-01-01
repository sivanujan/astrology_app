
/**
 * Utility functions for URL serialization/deserialization of chart data
 */

export interface HelperBirthDetails {
    name: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    lat: number;
    lng: number;
    place?: string;
    city?: string; // Alternative field for place
}

export const serializeMarriageDetails = (boy: HelperBirthDetails, girl: HelperBirthDetails): string => {
    const params = new URLSearchParams();

    // Boy Details
    params.set('b_n', boy.name);
    params.set('b_d', boy.date);
    params.set('b_t', boy.time);
    params.set('b_lat', boy.lat.toString());
    params.set('b_lng', boy.lng.toString());
    if (boy.place) params.set('b_p', boy.place);

    // Girl Details
    params.set('g_n', girl.name);
    params.set('g_d', girl.date);
    params.set('g_t', girl.time);
    params.set('g_lat', girl.lat.toString());
    params.set('g_lng', girl.lng.toString());
    if (girl.place) params.set('g_p', girl.place);

    return params.toString();
};

export const deserializeMarriageDetails = (searchParams: URLSearchParams): { boy: HelperBirthDetails | null, girl: HelperBirthDetails | null } => {
    try {
        const getParam = (key: string) => searchParams.get(key);

        const boy: HelperBirthDetails = {
            name: getParam('b_n') || '',
            date: getParam('b_d') || '',
            time: getParam('b_t') || '',
            lat: parseFloat(getParam('b_lat') || '0'),
            lng: parseFloat(getParam('b_lng') || '0'),
            place: getParam('b_p') || ''
        };

        const girl: HelperBirthDetails = {
            name: getParam('g_n') || '',
            date: getParam('g_d') || '',
            time: getParam('g_t') || '',
            lat: parseFloat(getParam('g_lat') || '0'),
            lng: parseFloat(getParam('g_lng') || '0'),
            place: getParam('g_p') || ''
        };

        // Basic validation
        if (!boy.name || !boy.date || !boy.time || !girl.name || !girl.date || !girl.time) {
            return { boy: null, girl: null };
        }

        return { boy, girl };
    } catch (e) {
        console.error("Failed to deserialize URL params", e);
        return { boy: null, girl: null };
    }
};

export const generateShareLink = (path: string, boy: HelperBirthDetails, girl: HelperBirthDetails): string => {
    const queryString = serializeMarriageDetails(boy, girl);
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}?${queryString}`;
};

export const serializeChartDetails = (details: HelperBirthDetails): string => {
    const params = new URLSearchParams();
    params.set('n', details.name);
    params.set('d', details.date);
    params.set('t', details.time);
    params.set('lat', details.lat.toString());
    params.set('lng', details.lng.toString());
    // Check both place and city fields (InputForm uses 'city')
    const placeValue = details.place || details.city;
    if (placeValue) params.set('p', placeValue);
    return params.toString();
};

export const deserializeChartDetails = (searchParams: URLSearchParams): HelperBirthDetails | null => {
    try {
        const getParam = (key: string) => searchParams.get(key);
        const details: HelperBirthDetails = {
            name: getParam('n') || '',
            date: getParam('d') || '',
            time: getParam('t') || '',
            lat: parseFloat(getParam('lat') || '0'),
            lng: parseFloat(getParam('lng') || '0'),
            place: getParam('p') || ''
        };
        if (!details.name || !details.date || !details.time) return null;
        return details;
    } catch (e) {
        return null;
    }
};

export const generateSingleChartShareLink = (path: string, details: HelperBirthDetails): string => {
    const queryString = serializeChartDetails(details);
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}?${queryString}`;
};
