/**
 * Enhanced Type Definitions for Comprehensive Dasa Bhukti Predictions
 * 
 * This file contains all type definitions needed for the comprehensive
 * chart analysis system including planet details, yogas, transits,
 * and Subathuvam/Pavathuvam analysis.
 */

import { DasaAIContext } from '../utils/dasaBhuktiAIPrediction';

// ==================== ENUMS ====================

export type PlanetDignity =
    | 'Exalted'      // உச்சம்
    | 'Debilitated'  // நீசம்
    | 'Own'          // சொந்த வீடு
    | 'Friend'       // நண்பன் வீடு
    | 'Enemy'        // எதிரி வீடு
    | 'Neutral';     // சமம்

export type FriendshipStatus =
    | 'Friend'       // நண்பன்
    | 'Enemy'        // எதிரி
    | 'Neutral';     // சமம்

export type YogaType =
    | 'GajaKesari'
    | 'Budhaditya'
    | 'ChandraMangala'
    | 'RajaYoga'
    | 'DhanaYoga'
    | 'VipritaRajaYoga'
    | 'NeechaBhangaRajayoga'
    | 'PanchamahapurushaYoga'
    | 'Other';

// ==================== PLANET DETAILS ====================

export interface PlanetConjunction {
    planet: string;           // நேரடி கோள் பெயர்
    house: number;            // எந்த வீட்டில்
    isDegreeClose: boolean;   // 5° க்குள் உள்ளதா
    effect: 'Benefic' | 'Malefic' | 'Neutral';
}

export interface PlanetAspect {
    planet: string;           // எந்த கோள் பார்க்கிறது
    fromHouse: number;        // எந்த வீட்டிலிருந்து
    aspectType: string;       // "7th aspect", "5th & 9th aspect" etc.
    strength: number;         // 0-100 வலிமை
}

export interface PlanetDetails {
    name: string;             // கோள் பெயர்
    sign: string;             // ராசி
    house: number;            // வீடு
    degree: number;           // டிகிரி
    retrograde: boolean;      // வக்ரமா

    // Strength & Dignity
    dignity: PlanetDignity;

    // Nakshatra
    nakshatra: string;
    nakshatraPada: number;
    nakshatraLord: string;

    // House Lordship
    rulesHouses: number[];

    // Relationships
    conjunctions: PlanetConjunction[];
    aspects: PlanetAspect[];

    // Subathuvam Score
    subathuvamScore: number;  // 0-100
    subathuvamStatus: 'Subha' | 'Paapa' | 'Neutral';
    subathuvamReason: string;
}

// ==================== ENHANCED DASA CONTEXT ====================

export interface EnhancedDasaContext extends DasaAIContext {
    // Full planet details
    planetDetails: PlanetDetails;

    // Relationships with other planets
    relationshipWithDasa?: string;      // "3rd from Dasa lord"
    naturalFriendship?: FriendshipStatus;
    temporalFriendship?: FriendshipStatus;
    combinedFriendship?: FriendshipStatus;
}

// ==================== DASA TIMELINE ====================

export interface DasaTimeline {
    mahaDasa: {
        planet: string;
        startDate: Date;
        endDate: Date;
    };

    currentBhukti: {
        planet: string;
        startDate: Date;
        endDate: Date;
        durationMonths: number;
    };

    nextBhukti?: {
        planet: string;
        startDate: Date;
        endDate: Date;
        durationMonths: number;
    };
}

// ==================== HOUSE LORDSHIP ====================

export interface HouseLord {
    houseNumber: number;
    lord: string;             // கோள் பெயர்
    lordSign: string;         // எந்த ராசியில்
    lordHouse: number;        // எந்த வீட்டில்
    lordDignity: PlanetDignity;
}

// ==================== YOGAS ====================

export interface Yoga {
    type: YogaType;
    name: string;             // தமிழ்/English பெயர்
    description: string;      // சுருக்கமான விளக்கம்
    planetsInvolved: string[];
    houses: number[];
    strength: number;         // 0-100
    effect: 'Positive' | 'Negative' | 'Mixed';
}

// ==================== TRANSITS ====================

export interface Transit {
    planet: string;
    currentSign: string;
    currentHouse: number;     // Birth chart ல் எந்த வீட்டில்
    aspectingHouses: number[]; // எந்தெந்த வீடுகளை பார்க்கிறது
    effect: 'Favorable' | 'Unfavorable' | 'Neutral';
    description: string;
}

// ==================== SUBATHUVAM ANALYSIS ====================

export interface PlanetAnalysis {
    planet: string;
    score: number;            // 0-100
    status: 'Subha' | 'Paapa' | 'Neutral';
    reasons: string[];
    position: {
        sign: string;
        house: number;
        dignity: PlanetDignity;
    };
    conjunctions: string[];
    aspects: string[];
}

export interface SubathuvamAnalysis {
    // Benefic planets
    subhaPlanets: PlanetAnalysis[];

    // Malefic planets
    paapaPlanets: PlanetAnalysis[];

    // Benefic houses (1, 2, 4, 5, 7, 9, 10, 11)
    subhaHouses: number[];

    // Malefic houses (3, 6, 8, 12)
    paapaHouses: number[];

    // Beneficial conjunctions
    subhaConjunctions: string[];

    // Malefic conjunctions
    paapaConjunctions: string[];

    // Overall chart strength
    overallSubathuvamScore: number;  // 0-100
}

// ==================== COMPREHENSIVE CHART DATA ====================

export interface ComprehensiveChartData {
    // Basic info
    birthDetails: {
        name: string;
        dateOfBirth: Date;
        timeOfBirth: string;
        placeOfBirth: string;
        latitude: number;
        longitude: number;
    };

    // Ascendant
    ascendant: {
        sign: string;
        degree: number;
        lord: string;
        lordHouse: number;
    };

    // Dasa/Bhukti Timeline
    dasaTimeline: DasaTimeline;

    // Planet Details
    dasaLord: PlanetDetails;
    bhuktiLord: PlanetDetails;
    nextBhuktiLord?: PlanetDetails;

    // All House Lords (12 houses)
    allHouseLords: HouseLord[];

    // Yogas present in chart
    yogas: Yoga[];

    // Current Transits
    currentTransits: Transit[];

    // Comprehensive Subathuvam/Pavathuvam
    subathuvamAnalysis: SubathuvamAnalysis;

    // Planetary Relationships
    planetaryRelationships: {
        dasaBhukti: string;           // "Bhukti lord in 3rd from Dasa lord"
        dasaNextBhukti?: string;      // "Next Bhukti lord in 11th from Dasa lord"
        bhuktiNextBhukti?: string;    // "Next Bhukti lord same as current"
        naturalFriendship: FriendshipStatus;
        temporalFriendship: FriendshipStatus;
    };
}

// ==================== STORED PREDICTION ====================

export interface StoredPrediction {
    id: string;                    // Unique prediction ID
    userId: string;                // Firebase user ID
    chartHash: string;             // MD5 hash of chart data (for caching)

    // Dasa/Bhukti identifiers
    mahaDasa: string;
    bhukti: string;
    nextBhukti?: string;

    // Complete chart data (for regeneration if needed)
    chartData: ComprehensiveChartData;

    // Generated predictions
    prediction: {
        tamil: string;
        english: string;
        generatedAt: Date;
        model: string;              // "deepseek-chat", "gpt-4o-mini", etc.
        tokenCount?: number;
        cost?: number;              // In USD
    };

    // Metadata
    createdAt: Date;
    lastViewed: Date;
    viewCount: number;

    // Sharing
    shareableUrl: string;         // e.g., "/p/abc123xyz"
    isPublic: boolean;
    expiresAt?: Date;             // Optional expiration
}
