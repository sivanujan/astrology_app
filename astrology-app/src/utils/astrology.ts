import {
    Observer,
    Body,
    Vector,
    Equator,
    Ecliptic,
    SiderealTime
} from 'astronomy-engine';
import * as Astronomy from 'astronomy-engine';

// Approximate Lahiri Ayanamsa calculation
// Based on 23° 51' 11" at J2000 (Jan 1 2000, 12:00 UTC)
// Precession rate approx 50.29 arcseconds per year
export const getLahiriAyanamsa = (date: Date): number => {
    const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const daysSinceJ2000 = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24);
    const yearsSinceJ2000 = daysSinceJ2000 / 365.25;

    // Base Ayanamsa at J2000: 23.853 degrees (23° 51' 11")
    const baseAyanamsa = 23.853;
    const rate = 50.29 / 3600; // degrees per year

    return baseAyanamsa + (yearsSinceJ2000 * rate);
};

export const calculatePlanetaryPositions = (date: Date, lat: number, lng: number) => {
    const ayanamsa = getLahiriAyanamsa(date);
    const observer = new Observer(lat, lng, 0);

    const bodies = [
        Body.Sun, Body.Moon, Body.Mars, Body.Mercury,
        Body.Jupiter, Body.Venus, Body.Saturn
    ];

    const positions: { name: string; longitude: number; signIndex: number; degree: number }[] = bodies.map(body => {
        // Use GeoVector to get geocentric position vector
        const vector = Astronomy.GeoVector(body, date, true);
        // Convert to Ecliptic coordinates
        const ecliptic = Astronomy.Ecliptic(vector);

        // Convert to Sidereal
        let lon = ecliptic.elon - ayanamsa;
        if (lon < 0) lon += 360;

        return {
            name: body,
            longitude: lon,
            signIndex: Math.floor(lon / 30),
            degree: lon % 30
        };
    });

    // Ascendant Calculation
    // We need the Local Sidereal Time (LST)
    const gst = SiderealTime(date);
    const lst = (gst + lng / 15.0) % 24;
    const ramc = lst * 15.0; // Right Ascension of Medium Coeli

    // Obliquity of Ecliptic
    // Use Sun's position to get current obliquity or just use standard J2000
    const sunVector = Astronomy.GeoVector(Body.Sun, date, true);
    const eps = Astronomy.Ecliptic(sunVector).elat; // This gives latitude, not obliquity.
    // Actually, Ecliptic function returns { elon, elat }.
    // Obliquity is the tilt of Earth's axis.
    // Astronomy engine has `Obliquity` function? No.
    // But we can use a standard value or calculate it.
    // Let's use standard 23.439 degrees.
    const obliquity = 23.439;

    const rad = Math.PI / 180;
    const ramcRad = ramc * rad;
    const epsRad = obliquity * rad;
    const latRad = lat * rad;

    const num = Math.cos(ramcRad);
    const den = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

    let ascRad = Math.atan2(num, den);
    let ascDeg = ascRad / rad;
    if (ascDeg < 0) ascDeg += 360;

    // Adjust for Sidereal
    let ascSidereal = ascDeg - ayanamsa;
    if (ascSidereal < 0) ascSidereal += 360;

    const ascendant = {
        name: "Ascendant",
        longitude: ascSidereal,
        signIndex: Math.floor(ascSidereal / 30),
        degree: ascSidereal % 30
    };

    // Rahu/Ketu - Simplified for now (Mean Node)
    const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const T = (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24 * 36525);
    let nodeMean = 125.04452 - 1934.136261 * T;
    nodeMean = nodeMean % 360;
    if (nodeMean < 0) nodeMean += 360;

    let rahuSidereal = nodeMean - ayanamsa;
    if (rahuSidereal < 0) rahuSidereal += 360;

    let ketuSidereal = (rahuSidereal + 180) % 360;

    positions.push({
        name: "Rahu",
        longitude: rahuSidereal,
        signIndex: Math.floor(rahuSidereal / 30),
        degree: rahuSidereal % 30
    });

    positions.push({
        name: "Ketu",
        longitude: ketuSidereal,
        signIndex: Math.floor(ketuSidereal / 30),
        degree: ketuSidereal % 30
    });

    return {
        ascendant,
        planets: positions,
        ayanamsa
    };
};

export const getNakshatra = (longitude: number) => {
    const nakshatraSpan = 13.333333; // 13 degrees 20 minutes
    const index = Math.floor(longitude / nakshatraSpan);
    const pada = Math.floor((longitude % nakshatraSpan) / 3.333333) + 1;
    return { index, pada };
};
