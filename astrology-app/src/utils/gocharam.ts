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
    sun: GocharamResult;
    mars: GocharamResult;
    mercury: GocharamResult;
    venus: GocharamResult;
    rahu: GocharamResult;
    ketu: GocharamResult;
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

// Generic Transit Calculation
const calculatePlanetTransit = (
    planetName: string,
    rasiSign: number,
    currentSignIndex: number,
    goodHouses: number[],
    badHouses: number[],
    moderateHouses: number[]
): GocharamResult => {
    const houseFromRasi = getHouse(rasiSign, currentSignIndex);

    let status: GocharamResult['status'] = 'Moderate';
    let description = '';
    let isFavorable = false;

    if (goodHouses.includes(houseFromRasi)) {
        status = 'Good'; // Or Excellent if distinctions needed
        description = `${planetName} is in a favorable position (House ${houseFromRasi}). Expect positive results.`;
        isFavorable = true;
    } else if (badHouses.includes(houseFromRasi)) {
        status = 'Difficult';
        description = `${planetName} is in a challenging position (House ${houseFromRasi}). Caution advised.`;
        isFavorable = false;
    } else {
        status = 'Moderate';
        description = `${planetName} gives mixed or neutral results (House ${houseFromRasi}).`;
        isFavorable = true;
    }

    return {
        planet: planetName,
        status,
        description,
        isFavorable
    };
};

export const calculateJupiterTransit = (rasiSign: number, lagnaSign: number, currentSign: number): GocharamResult => {
    // Specific implementation for Jupiter (Guru) as it has special aspect rules (Guru Parvai)
    const result = calculatePlanetTransit('Jupiter', rasiSign, currentSign, [2, 5, 7, 9, 11], [6, 8, 12], [1, 3, 4, 10]);

    // Guru Parvai Check (Aspects 5, 7, 9)
    const aspects: string[] = [];
    const rasiFromJupiter = getHouse(currentSign, rasiSign);
    if ([5, 7, 9].includes(rasiFromJupiter)) aspects.push("Aspects Rasi");

    const lagnaFromJupiter = getHouse(currentSign, lagnaSign);
    if ([5, 7, 9].includes(lagnaFromJupiter)) aspects.push("Aspects Lagna");

    if (aspects.length > 0) {
        result.description += ` However, Jupiter's aspect on ${aspects.join(' & ')} provides strong protection.`;
        result.aspects = aspects;
        // Boost status if aspect is present
        if (result.status === 'Difficult') result.status = 'Moderate';
        if (result.status === 'Moderate') result.status = 'Good';
        result.isFavorable = true;
    }
    return result;
};

export const calculateSaturnTransit = (rasiSign: number, currentSign: number): GocharamResult => {
    // Specific implementation for Saturn (Sade Sati, Ashtama)
    // Good: 3, 6, 11. Bad: Most others.
    const result = calculatePlanetTransit('Saturn', rasiSign, currentSign, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], []);

    const houseFromRasi = getHouse(rasiSign, currentSign);
    if ([12, 1, 2].includes(houseFromRasi)) {
        result.status = 'Sade Sati';
        result.description = 'You are under the influence of Sade Sati. Patience is key.';
        result.isFavorable = false;
    } else if (houseFromRasi === 8) {
        result.status = 'Ashtama';
        result.description = 'Ashtama Sani (8th House). Expect pressure.';
        result.isFavorable = false;
    } else if (houseFromRasi === 4) {
        result.status = 'Ardhastama';
        result.description = 'Ardhastama Sani (4th House). Domestic concerns.';
        result.isFavorable = false;
    }

    return result;
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

    // Other Planets
    const sun = calculatePlanetTransit('Sun', rasiSign, transits.sunSignIndex, [3, 6, 10, 11], [1, 2, 4, 5, 7, 8, 9, 12], []);
    const mars = calculatePlanetTransit('Mars', rasiSign, transits.marsSignIndex, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], []);
    const mercury = calculatePlanetTransit('Mercury', rasiSign, transits.mercurySignIndex, [2, 4, 6, 8, 10, 11], [1, 3, 5, 7, 9, 12], []);
    const venus = calculatePlanetTransit('Venus', rasiSign, transits.venusSignIndex, [1, 2, 3, 4, 5, 8, 9, 11, 12], [6, 7, 10], []);
    const rahu = calculatePlanetTransit('Rahu', rasiSign, transits.rahuSignIndex, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], []);
    const ketu = calculatePlanetTransit('Ketu', rasiSign, transits.ketuSignIndex, [3, 6, 11], [1, 2, 4, 5, 7, 8, 9, 10, 12], []);

    let verdictTitle = "";
    let verdictMessage = "";
    let verdictType: DailySnapshotResult['verdict']['type'] = 'warning';

    const isGocharamBad = !jupiter.isFavorable || !saturn.isFavorable;

    if (currentDasaStatus === 'Good') {
        if (isGocharamBad) {
            verdictTitle = "Don't Worry!";
            verdictMessage = "Your current Dasa is strong. The adverse transit effects (Gocharam) will only cause minor stress.";
            verdictType = 'success'; // Green because Dasa protects
        } else {
            verdictTitle = "Excellent Time!";
            verdictMessage = "Both Dasa and Transits are favorable. Golden period.";
            verdictType = 'success';
        }
    } else if (currentDasaStatus === 'Bad') {
        if (isGocharamBad) {
            verdictTitle = "High Alert!";
            verdictMessage = "Both Dasa and Transits are challenging. Be extremely careful.";
            verdictType = 'danger';
        } else {
            verdictTitle = "Caution Advised";
            verdictMessage = "Dasa is challenging, but Transits offer some relief.";
            verdictType = 'warning';
        }
    } else {
        if (isGocharamBad) {
            verdictTitle = "Be Careful";
            verdictMessage = "Transits are challenging. Maintain routine.";
            verdictType = 'warning';
        } else {
            verdictTitle = "Good Period";
            verdictMessage = "Transits are supportive. Steady progress.";
            verdictType = 'success';
        }
    }

    return {
        jupiter,
        saturn,
        sun, mars, mercury, venus, rahu, ketu, // Return all
        verdict: {
            title: verdictTitle,
            message: verdictMessage,
            type: verdictType
        }
    };
};
