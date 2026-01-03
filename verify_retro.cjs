const Astronomy = require('astronomy-engine');

function checkRetro(dateStr, bodyName) {
    const date = new Date(dateStr);
    const body = Astronomy.Body[bodyName];

    const vector = Astronomy.GeoVector(body, date, true);
    const ecliptic = Astronomy.Ecliptic(vector);

    const datePrev = new Date(date.getTime() - 60 * 60 * 1000); // 1 hour 
    const vectorPrev = Astronomy.GeoVector(body, datePrev, true);
    const eclipticPrev = Astronomy.Ecliptic(vectorPrev);

    const diff = (ecliptic.elon - eclipticPrev.elon + 540) % 360 - 180;
    const isRetro = diff < 0;

    console.log(`${bodyName} on ${dateStr}: Lon=${ecliptic.elon.toFixed(4)}, Prev=${eclipticPrev.elon.toFixed(4)}, Diff=${diff.toExponential(4)}, Retro=${isRetro}`);
}

// Mercury Retrograde: Aug 23 - Sep 15, 2023. Let's pick Sep 1.
checkRetro('2023-09-01T12:00:00Z', 'Mercury');

// Mars Retrograde: Oct 30 2022 - Jan 12 2023. Let's pick Dec 1 2022.
checkRetro('2022-12-01T12:00:00Z', 'Mars');

// Jupiter Retrograde: Sep 4 - Dec 31 2023. Let's pick Oct 1 2023.
checkRetro('2023-10-01T12:00:00Z', 'Jupiter');
