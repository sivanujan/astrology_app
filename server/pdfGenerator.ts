import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { calculateDashaPeriods } from './dashaCalculation';

interface ChartData {
    userDetails: {
        name: string;
        date: string;
        time: string;
        city: string;
    };
    planets: Array<{
        name: string;
        longitude: number;
        signIndex: number;
    }>;
    ascendant: {
        signIndex: number;
    };
    dashaPeriods?: any[];
    navamsaChart?: any;
    housePredictions?: any[];
}

export async function generatePDFWithPuppeteer(data: ChartData, language: 'en' | 'ta'): Promise<Buffer> {
    console.log('Server received data for PDF generation');
    console.log('Has dashaPeriods:', !!data.dashaPeriods, 'Length:', data.dashaPeriods?.length);
    if (data.dashaPeriods?.length) {
        console.log('First dasha:', data.dashaPeriods[0]);
    } else {
        console.log('Dasha periods missing, attempting server-side calculation...');
        try {
            // Find Moon
            const moon = data.planets.find((p: any) => p.name === 'Moon' || p.name === 'Chandran'); // Support English and Tamil
            if (moon && data.userDetails?.date && data.userDetails?.time) {
                const birthDate = new Date(`${data.userDetails.date}T${data.userDetails.time}`);
                if (!isNaN(birthDate.getTime())) {
                    // @ts-ignore - Ignoring type mismatch for now if any
                    data.dashaPeriods = calculateDashaPeriods(birthDate, moon.longitude);
                    console.log('Server-side calculation successful. Count:', data.dashaPeriods?.length);
                }
            } else {
                console.log('Cannot calculate server-side: Moon or Date missing', { moon: !!moon });
            }
        } catch (e) {
            console.error('Server-side calculation failed:', e);
        }
    }

    const isTamil = language === 'ta';

    // Read logo file
    let logoBase64 = '';
    try {
        const logoPath = path.resolve(process.cwd(), 'src/assets/logo.png');
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } else {
            console.warn('Logo file not found at:', logoPath);
        }
    } catch (e) {
        console.error('Error reading logo file:', e);
    }

    const htmlContent = createHTMLTemplate(data, isTamil, logoBase64);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15px',
                right: '15px',
                bottom: '15px',
                left: '15px'
            }
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

function createHTMLTemplate(data: ChartData, isTamil: boolean, logoBase64: string = ''): string {
    const { userDetails, planets, ascendant, dashaPeriods, housePredictions } = data;

    // ... existing logic ...

    // Use base64 logo if available
    const logoSrc = logoBase64 || 'file:///C:/Users/Sivanujan_PC/Desktop/astrology/astrology_app/astrology-app/src/assets/logo.png';
    const genDate = new Date().toLocaleDateString('en-GB');

    // ... mapping names etc ...

    // Helper to get nakshatra
    const getNakshatra = (longitude: number) => {
        const nakIndex = Math.floor(longitude / 13.333333);
        const pada = Math.floor(((longitude % 13.333333) / 3.333333)) + 1;
        return { index: nakIndex, pada };
    };

    // Helper to create chart grid
    const createChartGrid = (planets: any[], ascSignIndex: number) => {
        // Create 12 signs array (0=Aries, 1=Taurus, ..., 11=Pisces)
        const signs: string[][] = Array(12).fill(null).map(() => []);

        // Place planets in signs
        planets.forEach(p => {
            // Fixed zodiac: signIndex 0 is always Aries
            const signIndex = p.signIndex;
            const tamilNames: Record<string, string> = { 'Sun': 'சூ', 'Moon': 'சந்', 'Mars': 'செ', 'Mercury': 'பு', 'Jupiter': 'கு', 'Venus': 'சு', 'Saturn': 'சனி', 'Rahu': 'ரா', 'Ketu': 'கே' };
            const englishNames: Record<string, string> = { 'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me', 'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra', 'Ketu': 'Ke' };

            const planetAbbr = isTamil
                ? tamilNames[p.name] || p.name
                : englishNames[p.name] || p.name;
            signs[signIndex].push(planetAbbr);
        });

        // Mark Lagna
        const lagnaMarker = isTamil ? 'லக்' : 'Asc';
        if (!signs[ascSignIndex].includes(lagnaMarker)) {
            signs[ascSignIndex].unshift(lagnaMarker);
        }

        // Helper to generate cell HTML
        const getCell = (signIndex: number) => {
            const isLagna = signIndex === ascSignIndex;
            const content = signs[signIndex].length > 0 ? signs[signIndex].join(' ') : '&nbsp;';
            const bgStyle = isLagna ? 'background: #ffe6cc; font-weight: bold;' : '';
            return `<div style="border-right: 1px solid #333; border-bottom: 1px solid #333; padding: 4px; font-size: 10px; text-align: center; display: flex; align-items: center; justify-content: center; ${bgStyle}">${content}</div>`;
        };

        // Special borders for edge cells to form the grid properly
        // We will construct the grid using the standard South Indian layout indices
        // 11 00 01 02
        // 10 -- -- 03
        // 09 -- -- 04
        // 08 07 06 05

        // Custom style helpers
        const cellStyle = (borders: string, idx: number) => {
            const isLagna = idx === ascSignIndex;
            const bg = isLagna ? 'background: #ffe6cc; font-weight: bold;' : '';
            return `border:${borders}; padding: 4px; font-size: 10px; text-align: center; display: flex; align-items: center; justify-content: center; ${bg}`;
        };

        const c = (idx: number) => signs[idx].join(' ');

        return `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 2px solid #333; width: 320px; height: 320px; margin: 20px auto;">
                <!-- Row 1 -->
                <div style="${cellStyle('1px solid #333', 11)} border-left: 0; border-top: 0;">${c(11)}</div>
                <div style="${cellStyle('1px solid #333', 0)} border-top: 0;">${c(0)}</div>
                <div style="${cellStyle('1px solid #333', 1)} border-top: 0;">${c(1)}</div>
                <div style="${cellStyle('1px solid #333', 2)} border-top: 0; border-right: 0;">${c(2)}</div>
                
                <!-- Row 2 -->
                <div style="${cellStyle('1px solid #333', 10)} border-left: 0;">${c(10)}</div>
                <div style="grid-column: span 2; grid-row: span 2; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; background: #f0f0f0; border: 1px solid #333;">
                    ${isTamil ? 'ராசி சக்கரம்' : 'Rasi Chart'}
                </div>
                <div style="${cellStyle('1px solid #333', 3)} border-right: 0;">${c(3)}</div>
                
                <!-- Row 3 -->
                <div style="${cellStyle('1px solid #333', 9)} border-left: 0;">${c(9)}</div>
                <!-- Center spans here -->
                <div style="${cellStyle('1px solid #333', 4)} border-right: 0;">${c(4)}</div>
                
                <!-- Row 4 -->
                <div style="${cellStyle('1px solid #333', 8)} border-left: 0; border-bottom: 0;">${c(8)}</div>
                <div style="${cellStyle('1px solid #333', 7)} border-bottom: 0;">${c(7)}</div>
                <div style="${cellStyle('1px solid #333', 6)} border-bottom: 0;">${c(6)}</div>
                <div style="${cellStyle('1px solid #333', 5)} border-right: 0; border-bottom: 0;">${c(5)}</div>
            </div>
        `;
    };

    // Rasi names
    const rasiNames = isTamil
        ? ['மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்']
        : ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const nakshatraNames = isTamil
        ? ['அஸ்வினி', 'பரணி', 'கிருத்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'ஹஸ்தம்', 'சித்திரை', 'ஸ்வாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி']
        : ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

    const planetNames = isTamil
        ? { 'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்', 'Mercury': 'புதன்', 'Jupiter': 'குரு', 'Venus': 'சுக்ரன்', 'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது' }
        : { 'Sun': 'Sun', 'Moon': 'Moon', 'Mars': 'Mars', 'Mercury': 'Mercury', 'Jupiter': 'Jupiter', 'Venus': 'Venus', 'Saturn': 'Saturn', 'Rahu': 'Rahu', 'Ketu': 'Ketu' };

    const moonData = planets.find(p => p.name === 'Moon');
    const moonNak = moonData ? getNakshatra(moonData.longitude) : { index: 0, pada: 1 };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: ${isTamil ? "'Noto Sans Tamil', sans-serif" : 'Arial, sans-serif'};
            padding: 15px;
            font-size: 10px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            color: #ff8c00;
            margin-bottom: 15px;
            border-bottom: 3px solid #ff8c00;
            padding-bottom: 8px;
        }
        .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
        .header .date { font-size: 9px; color: #666; }
        .user-details {
            border: 2px solid #b4b4b4;
            padding: 10px;
            margin-bottom: 15px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .user-details p { margin: 4px 0; font-size: 10px; }
        .info-box {
            background: #e8f4f8;
            border-left: 4px solid #662d91;
            padding: 10px;
            margin: 12px 0;
        }
        .info-box p { margin: 3px 0; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 9px;
        }
        th {
            background: #662d91;
            color: white;
            padding: 6px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 5px 6px;
            border-bottom: 1px solid #ddd;
            text-align: left;
            color: #000;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        
        /* Specific Styles for Dasha Table (Orange) */
        table.dasha-table {
            margin: 20px 0;
            font-size: 10px;
            font-family: sans-serif;
            border: 1px solid #eee;
        }
        table.dasha-table th {
            background: #ff6600;
            padding: 12px 15px;
            text-align: center;
            font-size: 11px;
            border: none;
            text-transform: capitalize;
        }
        table.dasha-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
            text-align: center;
            color: #333;
        }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #662d91;
            margin: 15px 0 8px 0;
            padding-bottom: 4px;
            border-bottom: 2px solid #662d91;
        }
        /* Override section title for Dasha if needed, or keep consistent header */
        
        strong { color: #333; }
        /* House Analysis Grid */
        .house-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
            page-break-inside: avoid;
        }
        .house-card {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background: #fff;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            page-break-inside: avoid;
        }
        .house-header {
            background: #f8fafc;
            padding: 8px 12px;
            border-bottom: 1px solid #edf2f7;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .house-title {
            font-weight: 700;
            color: #1e293b;
            font-size: 10px;
            text-transform: uppercase;
        }
        .house-number {
             background: #ff6600;
             color: white;
             width: 18px;
             height: 18px;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
             font-size: 9px;
             font-weight: bold;
             margin-right: 8px;
        }
        .house-body {
            padding: 10px 12px;
            font-size: 9px;
            color: #475569;
            line-height: 1.5;
        }
        .status-badge {
            font-size: 8px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
        }
        .status-good { background: #dcfce7; color: #166534; }
        .status-avg { background: #fef9c3; color: #854d0e; }
        .status-bad { background: #fee2e2; color: #991b1b; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 8px;">
            <img src="${logoSrc}" alt="Logo" style="height: 50px; width: auto;" onerror="this.style.display='none'">
            <div>
                <h1>${isTamil ? 'சிவா அஸ்ட்ரோ அறிக்கை' : 'Astro Siva Report'}</h1>
            </div>
        </div>
        <div class="date">${isTamil ? `உருவாக்கப்பட்ட தேதி: ${genDate}` : `Generated on: ${genDate}`}</div>
    </div>
    
    <div class="user-details">
        <p><strong>${isTamil ? 'பெயர்' : 'Name'}:</strong> ${userDetails.name}</p>
        <p><strong>${isTamil ? 'பிறந்த தேதி' : 'Date of Birth'}:</strong> ${userDetails.date} ${userDetails.time}</p>
        <p><strong>${isTamil ? 'இடம்' : 'Place'}:</strong> ${userDetails.city}</p>
    </div>
    
    <div class="info-box">
        <p><strong>${isTamil ? 'லக்ன ராசி' : 'Lagna Rasi'}:</strong> ${rasiNames[ascendant.signIndex]}</p>
        <p><strong>${isTamil ? 'சந்திர ராசி' : 'Moon Rasi'}:</strong> ${moonData ? rasiNames[moonData.signIndex] : 'N/A'}</p>
        <p><strong>${isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}:</strong> ${nakshatraNames[moonNak.index]} (${isTamil ? 'பாதம்' : 'Pada'} ${moonNak.pada})</p>
    </div>
    
    <div class="section-title">${isTamil ? 'ராசி சக்கரம்' : 'Birth Chart (Rasi)'}</div>
    ${createChartGrid(planets, ascendant.signIndex)}
    
    <div class="section-title">${isTamil ? 'கிரக நிலைகள்' : 'Planetary Positions'}</div>
    <table>
        <thead>
            <tr>
                <th>${isTamil ? 'கிரகம்' : 'Planet'}</th>
                <th>${isTamil ? 'ராசி' : 'Sign'}</th>
                <th>${isTamil ? 'டிகிரி' : 'Degree'}</th>
                <th>${isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}</th>
                <th>${isTamil ? 'பாதம்' : 'Pada'}</th>
            </tr>
        </thead>
        <tbody>
            ${planets.map(p => {
        const nak = getNakshatra(p.longitude);
        return `
                    <tr>
                        <td>${planetNames[p.name as keyof typeof planetNames] || p.name}</td>
                        <td>${rasiNames[p.signIndex]}</td>
                        <td>${p.longitude.toFixed(2)}°</td>
                        <td>${nakshatraNames[nak.index]}</td>
                        <td>${nak.pada}</td>
                    </tr>
                `;
    }).join('')}
        </tbody>
    </table>
    
    
    ${housePredictions && housePredictions.length > 0 ? `
    <div class="page-break"></div>
    <div class="section-title" style="color: #000; border: none; font-size: 16px; margin-top: 25px;">${isTamil ? 'பாவக பகுப்பாய்வு' : 'House Analysis'}</div>
    <div class="house-grid">
        ${housePredictions.slice(0, 12).map((h: any, index: number) => {
        const statusLower = (h.status || '').toLowerCase();
        let statusClass = 'status-avg';
        if (statusLower.includes('good') || statusLower.includes('excellent') || statusLower.includes('favorable')) statusClass = 'status-good';
        if (statusLower.includes('challenging') || statusLower.includes('bad') || statusLower.includes('difficult')) statusClass = 'status-bad';

        return `
            <div class="house-card">
                <div class="house-header">
                    <div style="display: flex; align-items: center;">
                        <span class="house-number">${h.house_number || index + 1}</span>
                        <span class="house-title">${h.title || (isTamil ? `${index + 1}-வது பாவகம்` : `House ${index + 1}`)}</span>
                    </div>
                    <span class="status-badge ${statusClass}">${h.status || 'N/A'}</span>
                </div>
                <div class="house-body">
                    ${h.analysis ? h.analysis : (isTamil ? 'தகவல் இல்லை' : 'No analysis available')}
                </div>
            </div>
            `;
    }).join('')}
    </div>
    ` : ''}

    <div class="page-break"></div>
    <div class="section-title" style="color: #000; border: none; font-size: 16px; margin-top: 25px;">${isTamil ? 'விம்சோத்தரி தசா புத்தி காலங்கள்' : 'Vimshottari Dasha Periods'}</div>
    <table class="dasha-table">
        <thead>
            <tr>
                <th>${isTamil ? 'தசா' : 'Dasha'}</th>
                <th>${isTamil ? 'புத்தி' : 'Bhukti'}</th>
                <th>${isTamil ? 'தொடக்கம்' : 'Start Date'}</th>
                <th>${isTamil ? 'முடிவு' : 'End Date'}</th>
            </tr>
        </thead>
        <tbody>
            ${(dashaPeriods && dashaPeriods.length > 0) ? dashaPeriods.slice(0, 9).map((d: any) => {
        const mahaPlanet = planetNames[d.planet as keyof typeof planetNames] || d.planet;

        // If subPeriods (Bhuktis) exist, render them
        if (d.subPeriods && d.subPeriods.length > 0) {
            return d.subPeriods.map((b: any, bIndex: number) => {
                const bhuktiPlanet = planetNames[b.planet as keyof typeof planetNames] || b.planet;
                const isFirst = bIndex === 0;
                const rowStyle = isFirst ? 'border-top: 2px solid #ccc;' : '';

                return `
                        <tr style="${rowStyle}">
                            ${isFirst ? `<td rowspan="${d.subPeriods.length}" style="vertical-align: top; font-weight: bold; background-color: #fcfcfc;">${mahaPlanet}</td>` : ''}
                            <td>${bhuktiPlanet}</td>
                            <td>${new Date(b.startDate).toLocaleDateString('en-GB')}</td>
                            <td>${new Date(b.endDate).toLocaleDateString('en-GB')}</td>
                        </tr>
                        `;
            }).join('');
        } else {
            // Fallback if no subperiods
            return `
                    <tr>
                        <td style="font-weight: bold;">${mahaPlanet}</td>
                        <td>-</td>
                        <td>${new Date(d.startDate).toLocaleDateString('en-GB')}</td>
                        <td>${new Date(d.endDate).toLocaleDateString('en-GB')}</td>
                    </tr>
                    `;
        }
    }).join('') : `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    ${isTamil ? 'கால விவரங்கள் இல்லை' : 'No Period Data Available'}
                </td>
            </tr>
            `}
        </tbody>
    </table>
    </table>


        }

<div style="margin-top: 20px; text-align: center; font-size: 9px; color: #666;" >
    <p>${isTamil ? 'இந்த அறிக்கை சிவா அஸ்ட்ரோவால் உருவாக்கப்பட்டது' : 'This report is generated by Astro Siva'} </p>
        </div>
        </body>
        </html>
            `;
}
