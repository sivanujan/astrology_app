import { TransitPositions } from './predictionRules';

export interface GocharamResult {
    planet: string;
    status: 'Excellent' | 'Good' | 'Moderate' | 'Difficult' | 'Sade Sati' | 'Ashtama' | 'Ardhastama';
    description: string;
    isFavorable: boolean;
    aspects?: string[];
}

export interface DailySnapshotResult {
    jupiter: GocharamResult;
    saturn: GocharamResult;
    verdict: {
        title: string;
        message: string;
        type: 'success' | 'warning' | 'danger';
    };
}

// Helper to calculate house number (1-12) from source to target
const getHouse = (fromSign: number, toSign: number): number => {
    return (toSign - fromSign + 12) % 12 + 1;
};

// Step A: Jupiter Transit (Guru Gocharam)
export const calculateJupiterTransit = (
    rasiSign: number,
    lagnaSign: number,
    currentJupiterSign: number
): GocharamResult => {
    const houseFromRasi = getHouse(rasiSign, currentJupiterSign);

    // Check Aspects (Jupiter aspects 5, 7, 9 from itself)
    // We need to check if Jupiter aspects User's Rasi or Lagna
    const aspects: string[] = [];

    // Check aspect on Rasi
    // If Rasi is 5, 7, 9 houses from Jupiter
    const rasiFromJupiter = getHouse(currentJupiterSign, rasiSign);
    if ([5, 7, 9].includes(rasiFromJupiter)) {
        aspects.push("Aspects Rasi (Moon Sign)");
    }
    // Conjunction (1st house) is also often considered a connection/aspect in general speech, 
    // but specifically "Parvai" usually means 5, 7, 9. 
    // However, Janma Guru (1st) is usually bad, but aspect is good? 
    // Let's stick to standard aspect rules: 5, 7, 9.

    // Check aspect on Lagna
    const lagnaFromJupiter = getHouse(currentJupiterSign, lagnaSign);
    if ([5, 7, 9].includes(lagnaFromJupiter)) {
        aspects.push("Aspects Lagna");
    }

    let status: GocharamResult['status'] = 'Moderate';
    let description = '';
    let isFavorable = false;

    // Excellent: 2, 5, 7, 9, 11
    if ([2, 5, 7, 9, 11].includes(houseFromRasi)) {
        status = 'Excellent';
        description = 'Jupiter is in a highly favorable position, bringing growth and luck.';
        isFavorable = true;
    }
    // Moderate: 1, 3, 4, 10
    else if ([1, 3, 4, 10].includes(houseFromRasi)) {
        status = 'Moderate';
        description = 'Jupiter gives mixed results. Effort is required.';
        isFavorable = true; // Moderate is considered okay/manageable
    }
    // Difficult: 6, 8, 12
    else {
        status = 'Difficult';
        description = 'Jupiter is in a challenging position (6/8/12). Caution advised.';
        isFavorable = false;
    }

    // "Guru Parvai Kodi Nanmai" Override
    if (aspects.length > 0) {
        description += ` However, Jupiter's aspect on ${aspects.join(' & ')} provides strong protection.`;
        // If it was Difficult, aspect might mitigate it to Moderate or even Good protection.
        // Let's keep the base status but append the positive note.
    }

    return {
        planet: 'Jupiter',
        status,
        description,
        isFavorable,
        aspects
    };
};

// Step B: Saturn Transit (Sani Gocharam)
export const calculateSaturnTransit = (
    rasiSign: number,
    currentSaturnSign: number
): GocharamResult => {
    const houseFromRasi = getHouse(rasiSign, currentSaturnSign);

    let status: GocharamResult['status'] = 'Moderate';
    let description = '';
    let isFavorable = false;

    // Sade Sati: 12, 1, 2
    if ([12, 1, 2].includes(houseFromRasi)) {
        status = 'Sade Sati';
        description = 'You are under the influence of Sade Sati (Ezharai Sani). Patience and discipline are key.';
        isFavorable = false;
    }
    // Ashtama Sani: 8
    else if (houseFromRasi === 8) {
        status = 'Ashtama';
        description = 'Ashtama Sani (8th House). Expect unexpected changes and pressure.';
        isFavorable = false;
    }
    // Ardhastama Sani: 4
    else if (houseFromRasi === 4) {
        status = 'Ardhastama';
        description = 'Ardhastama Sani (4th House). Watch out for domestic issues or travel troubles.';
        isFavorable = false;
    }
    // Good: 3, 6, 11
    else if ([3, 6, 11].includes(houseFromRasi)) {
        status = 'Good';
        description = 'Saturn is in a favorable position (Upachaya). Success through hard work.';
        isFavorable = true;
    }
    else {
        // 5, 7, 9, 10 - Generally neutral/mixed or specific effects not in the main "Bad" list
        status = 'Moderate';
        description = 'Saturn transit is neutral. Routine work continues.';
        isFavorable = true;
    }

    return {
        planet: 'Saturn',
        status,
        description,
        isFavorable
    };
};

// Step C: Daily Snapshot (Guruji Override)
export const getDailySnapshot = (
    rasiSign: number,
    lagnaSign: number,
    currentDasaStatus: 'Good' | 'Bad' | 'Neutral',
    transits: TransitPositions
): DailySnapshotResult => {
    const jupiter = calculateJupiterTransit(rasiSign, lagnaSign, transits.jupiterSignIndex);
    const saturn = calculateSaturnTransit(rasiSign, transits.saturnSignIndex);

    let verdictTitle = "";
    let verdictMessage = "";
    let verdictType: DailySnapshotResult['verdict']['type'] = 'warning';

    const isGocharamBad = !jupiter.isFavorable || !saturn.isFavorable;
    const isGocharamVeryBad = !jupiter.isFavorable && !saturn.isFavorable;

    if (currentDasaStatus === 'Good') {
        if (isGocharamBad) {
            verdictTitle = "Don't Worry!";
            verdictMessage = "Your current Dasa is strong. The adverse transit effects (Gocharam) will only cause minor stress, not major trouble. Focus on your goals.";
            verdictType = 'success';
        } else {
            verdictTitle = "Excellent Time!";
            verdictMessage = "Both Dasa and Transits are favorable. This is a golden period for progress.";
            verdictType = 'success';
        }
    } else if (currentDasaStatus === 'Bad') {
        if (isGocharamBad) {
            verdictTitle = "High Alert!";
            verdictMessage = "Both Dasa and Transits are challenging. Be extremely careful in decisions, health, and relationships. Avoid risks.";
            verdictType = 'danger';
        } else {
            verdictTitle = "Caution Advised";
            verdictMessage = "Dasa is challenging, but Transits offer some relief. Proceed with care.";
            verdictType = 'warning';
        }
    } else { // Neutral Dasa
        if (isGocharamBad) {
            verdictTitle = "Be Careful";
            verdictMessage = "Transits are challenging. Maintain routine and avoid unnecessary risks.";
            verdictType = 'warning';
        } else {
            verdictTitle = "Good Period";
            verdictMessage = "Transits are supportive. You can make steady progress.";
            verdictType = 'success';
        }
    }

    return {
        jupiter,
        saturn,
        verdict: {
            title: verdictTitle,
            message: verdictMessage,
            type: verdictType
        }
    };
};
