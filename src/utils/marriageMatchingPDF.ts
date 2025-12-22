import jsPDF from 'jspdf';

interface MatchingResult {
    overallScore: number;
    verdict: string;
    lagnaAnalysis: any;
    houseMatching: any;
    dasaMatching: any;
    recommendations: string[];
    autoReject: boolean;
    autoRejectReasons: string[];
}

interface ChartData {
    ascendant: string;
    moonSign: string;
    planets: any[];
}

/**
 * Generate professional marriage matching PDF report
 */
export const generateMarriageMatchingPDF = (
    boyName: string,
    girlName: string,
    boyChart: ChartData | null,
    girlChart: ChartData | null,
    result: MatchingResult,
    isTamil: boolean = false
): void => {
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    let yPos = 20;

    // Background color
    pdf.setFillColor(15, 23, 42); // Dark blue background
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header with gradient effect
    pdf.setFillColor(139, 92, 246); // Purple
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const title = isTamil ? 'திருமண பொருத்த அறிக்கை' : 'Marriage Matching Report';
    pdf.text(title, pageWidth / 2, 15, { align: 'center' });

    // Names
    pdf.setFontSize(16);
    pdf.text(`${boyName} ♂ & ${girlName} ♀`, pageWidth / 2, 28, { align: 'center' });

    yPos = 50;

    // Overall Score Box
    pdf.setFillColor(88, 28, 135); // Dark purple
    pdf.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');

    pdf.setFontSize(14);
    pdf.setTextColor(203, 213, 225);
    pdf.text(isTamil ? 'மொத்த மதிப்பெண்' : 'Overall Score', pageWidth / 2, yPos + 10, { align: 'center' });

    pdf.setFontSize(32);
    pdf.setTextColor(250, 204, 21); // Yellow
    pdf.text(`${result.overallScore.toFixed(1)}/100`, pageWidth / 2, yPos + 22, { align: 'center' });

    // Verdict
    const verdictColor = getVerdictColor(result.verdict);
    pdf.setFillColor(verdictColor.r, verdictColor.g, verdictColor.b);
    pdf.roundedRect(pageWidth / 2 - 30, yPos + 26, 60, 8, 2, 2, 'F');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text(result.verdict, pageWidth / 2, yPos + 32, { align: 'center' });

    yPos += 45;

    // Auto-Reject Warnings
    if (result.autoReject && result.autoRejectReasons.length > 0) {
        pdf.setFillColor(220, 38, 38); // Red
        pdf.roundedRect(15, yPos, pageWidth - 30, 8, 2, 2, 'F');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text('⚠️ ' + (isTamil ? 'முக்கிய எச்சரிக்கை' : 'CRITICAL WARNINGS'), 20, yPos + 5);

        yPos += 12;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(248, 113, 113);

        result.autoRejectReasons.forEach((reason, idx) => {
            const lines = pdf.splitTextToSize(`• ${reason}`, pageWidth - 40);
            pdf.text(lines, 20, yPos);
            yPos += lines.length * 5;
        });
        yPos += 5;
    }

    // Chart Information Section
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(15, yPos, (pageWidth - 35) / 2, 40, 2, 2, 'F');
    pdf.roundedRect((pageWidth + 5) / 2, yPos, (pageWidth - 35) / 2, 40, 2, 2, 'F');

    // Boy's Info
    pdf.setFontSize(11);
    pdf.setTextColor(147, 197, 253); // Blue
    pdf.setFont('helvetica', 'bold');
    pdf.text(boyName, 20, yPos + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(203, 213, 225);
    if (boyChart) {
        pdf.text(`${isTamil ? 'லக்னம்' : 'Lagna'}: ${boyChart.ascendant}`, 20, yPos + 16);
        pdf.text(`${isTamil ? 'ராசி' : 'Rasi'}: ${boyChart.moonSign}`, 20, yPos + 22);
    }
    pdf.text(`${isTamil ? 'தன்மை' : 'Type'}: ${result.lagnaAnalysis.boyType}`, 20, yPos + 28);

    // Girl's Info
    pdf.setFontSize(11);
    pdf.setTextColor(244, 114, 182); // Pink
    pdf.setFont('helvetica', 'bold');
    pdf.text(girlName, (pageWidth + 5) / 2 + 5, yPos + 8);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(203, 213, 225);
    if (girlChart) {
        pdf.text(`${isTamil ? 'லக்னம்' : 'Lagna'}: ${girlChart.ascendant}`, (pageWidth + 5) / 2 + 5, yPos + 16);
        pdf.text(`${isTamil ? 'ராசி' : 'Rasi'}: ${girlChart.moonSign}`, (pageWidth + 5) / 2 + 5, yPos + 22);
    }
    pdf.text(`${isTamil ? 'தன்மை' : 'Type'}: ${result.lagnaAnalysis.girlType}`, (pageWidth + 5) / 2 + 5, yPos + 28);

    yPos += 48;

    // Lagna Analysis
    addSection(pdf, isTamil ? 'லக்ன பகுப்பாய்வு' : 'Lagna Analysis', yPos, pageWidth, isTamil);
    yPos += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(203, 213, 225);
    const lagnaLines = pdf.splitTextToSize(result.lagnaAnalysis.details, pageWidth - 40);
    pdf.text(lagnaLines, 20, yPos);
    yPos += lagnaLines.length * 5 + 3;

    pdf.setFontSize(8);
    pdf.setTextColor(250, 204, 21);
    pdf.text(`${isTamil ? 'மதிப்பெண்' : 'Score'}: ${result.lagnaAnalysis.score}/10`, 20, yPos);
    yPos += 8;

    // Check if need new page
    if (yPos > 240) {
        pdf.addPage();
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = 20;
    }

    // House Matching
    addSection(pdf, isTamil ? 'வீட்டு பொருத்தம்' : 'House Matching', yPos, pageWidth, isTamil);
    yPos += 8;

    const houses = [
        { num: 2, name: isTamil ? 'குடும்பம்/செல்வம்' : 'Family/Wealth', data: result.houseMatching.house2 },
        { num: 5, name: isTamil ? 'குழந்தைகள்' : 'Children', data: result.houseMatching.house5 },
        { num: 7, name: isTamil ? 'திருமணம்' : 'Marriage', data: result.houseMatching.house7 },
        { num: 8, name: isTamil ? 'ஆயுள்' : 'Longevity', data: result.houseMatching.house8 },
        { num: 12, name: isTamil ? 'பிரிவு/வெளிநாடு' : 'Separation/Foreign', data: result.houseMatching.house12 }
    ];

    houses.forEach((house) => {
        if (yPos > 260) {
            pdf.addPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            yPos = 20;
        }

        pdf.setFontSize(9);
        pdf.setTextColor(147, 197, 253);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${house.name} (${isTamil ? 'வீடு' : 'House'} ${house.num})`, 20, yPos);
        pdf.setFont('helvetica', 'normal');

        pdf.setFontSize(8);
        pdf.setTextColor(203, 213, 225);
        const houseLines = pdf.splitTextToSize(house.data.details, pageWidth - 40);
        pdf.text(houseLines, 20, yPos + 5);
        yPos += houseLines.length * 4 + 3;

        pdf.setTextColor(250, 204, 21);
        pdf.text(`${isTamil ? 'மதிப்பெண்' : 'Score'}: ${house.data.score}/10`, 20, yPos);
        yPos += 6;
    });

    // Dasa Analysis
    if (yPos > 220) {
        pdf.addPage();
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = 20;
    }

    addSection(pdf, isTamil ? 'தசா புத்தி பகுப்பாய்வு' : 'Dasa-Bhukti Analysis', yPos, pageWidth, isTamil);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setTextColor(147, 197, 253);
    pdf.text(`${boyName}: ${result.dasaMatching.boyCurrentDasa} / ${result.dasaMatching.boyCurrentBhukti}`, 20, yPos);
    yPos += 5;
    pdf.setTextColor(244, 114, 182);
    pdf.text(`${girlName}: ${result.dasaMatching.girlCurrentDasa} / ${result.dasaMatching.girlCurrentBhukti}`, 20, yPos);
    yPos += 8;

    pdf.setFontSize(8);
    pdf.setTextColor(203, 213, 225);
    const dasaLines = pdf.splitTextToSize(result.dasaMatching.details, pageWidth - 40);
    pdf.text(dasaLines, 20, yPos);
    yPos += dasaLines.length * 4 + 8;

    // Recommendations
    if (yPos > 230) {
        pdf.addPage();
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = 20;
    }

    addSection(pdf, isTamil ? 'பரிந்துரைகள்' : 'Recommendations', yPos, pageWidth, isTamil);
    yPos += 8;

    pdf.setFontSize(8);
    pdf.setTextColor(203, 213, 225);
    result.recommendations.forEach((rec, idx) => {
        if (yPos > 280) {
            pdf.addPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            yPos = 20;
        }
        const recLines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40);
        pdf.text(recLines, 20, yPos);
        yPos += recLines.length * 4 + 2;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('💫 Generated by SivaAstro', pageWidth / 2, 290, { align: 'center' });

    // Save
    pdf.save(`Marriage-Matching-${boyName}-${girlName}.pdf`);
};

function addSection(pdf: jsPDF, title: string, yPos: number, pageWidth: number, isTamil: boolean) {
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(15, yPos - 3, pageWidth - 30, 7, 1, 1, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(147, 197, 253);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 20, yPos + 2);
    pdf.setFont('helvetica', 'normal');
}

function getVerdictColor(verdict: string) {
    switch (verdict) {
        case 'Excellent': return { r: 34, g: 197, b: 94 };
        case 'Very Good': return { r: 59, g: 130, b: 246 };
        case 'Good': return { r: 6, g: 182, b: 212 };
        case 'Average': return { r: 234, g: 179, b: 8 };
        case 'Risky': return { r: 249, g: 115, b: 22 };
        case 'Poor': return { r: 239, g: 68, b: 68 };
        default: return { r: 100, g: 116, b: 139 };
    }
}
