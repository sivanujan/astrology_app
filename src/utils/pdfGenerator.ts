// Frontend PDF Generator - Calls Backend API

export const generatePDF = async (data: any, language: 'en' | 'ta') => {
    try {
        console.log('Requesting PDF generation from server...');

        // Call backend API
        const response = await fetch('http://localhost:3001/api/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data,
                language
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to generate PDF');
        }

        // Get PDF blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.userDetails?.name || 'Astrology'}_Report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('PDF downloaded successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
