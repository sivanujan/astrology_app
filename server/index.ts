import express from 'express';
import cors from 'cors';
import { generatePDFWithPuppeteer } from './pdfGenerator';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'PDF Server is running' });
});

// PDF Generation endpoint
app.post('/api/generate-pdf', async (req, res) => {
    try {
        const { data, language } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Chart data is required' });
        }

        console.log(`Generating PDF in ${language || 'en'} language...`);

        // Generate PDF using Puppeteer
        const pdfBuffer = await generatePDFWithPuppeteer(data, language || 'en');

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.userDetails?.name || 'Astrology'}_Report.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);

        console.log('PDF generated and sent successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PDF Server running on http://localhost:${PORT}`);
    console.log(`📄 PDF Generation endpoint: POST http://localhost:${PORT}/api/generate-pdf`);
});

export default app;
