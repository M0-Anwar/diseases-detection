import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Disease } from '../types';

export const generatePDF = async (diseaseData: Disease) => {
    try {
        const reportElement = document.getElementById('clinical-report');
        if (!reportElement) throw new Error('Report element not found');

        // Store original styles
        const originalStyles = {
            width: reportElement.style.width,
            padding: reportElement.style.padding,
            backgroundColor: reportElement.style.backgroundColor,
            color: reportElement.style.color
        };

        // Apply print styles
        reportElement.style.width = '210mm';
        reportElement.style.padding = '20mm';
        reportElement.style.backgroundColor = '#ffffff';
        reportElement.style.color = '#000000';

        // Hide buttons
        const buttons = reportElement.querySelectorAll('button');
        buttons.forEach(btn => { (btn as HTMLElement).style.display = 'none'; });

        // Generate canvas
        const canvas = await html2canvas(reportElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            removeContainer: true,
        });

        // Restore styles
        reportElement.style.width = originalStyles.width;
        reportElement.style.padding = originalStyles.padding;
        reportElement.style.backgroundColor = originalStyles.backgroundColor;
        reportElement.style.color = originalStyles.color;
        buttons.forEach(btn => { (btn as HTMLElement).style.display = ''; });

        // Generate PDF
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.setFillColor(239, 68, 68);
        pdf.rect(0, 0, 210, 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text('GENOMIC ANALYSIS REPORT - CONFIDENTIAL', 105, 10, { align: 'center' });

        let heightLeft = imgHeight;
        let position = 20;
        let page = 1;

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - position);

        while (heightLeft > 0) {
            position = -((pageHeight - 20) * page - 20);
            pdf.addPage();
            page++;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Add footer
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(10, pageHeight - 20, 200, pageHeight - 20);
            pdf.setTextColor(100);
            pdf.setFontSize(8);
            pdf.text(`Page ${i} of ${totalPages}`, 105, pageHeight - 15, { align: 'center' });
            pdf.text(`Report ID: ${diseaseData.id.toUpperCase()}`, 10, pageHeight - 10);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 200, pageHeight - 10, { align: 'right' });
        }

        pdf.setProperties({
            title: `Clinical Report - ${diseaseData.name}`,
            subject: 'Genetic Analysis Report',
            author: 'Genomic Analysis System',
            keywords: `genetic, report, clinical, analysis, ${diseaseData.name}`,
            creator: 'Genomic Analysis System v1.0'
        });

        const fileName = `Clinical_Report_${diseaseData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        return true;

    } catch (error) {
        console.error('Failed to generate PDF:', error);
        throw error;
    }
};