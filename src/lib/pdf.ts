import { CVSection } from '@prisma/client';
import PDFDocument from 'pdfkit';

/**
 * Generates a PDF buffer from CV data
 * @param cv The CV data to generate a PDF from
 * @returns A buffer containing the PDF data
 */
export async function generateCVPdf(cvSections: CVSection[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
      });

      // Collect the PDF data in a buffer
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add content to the PDF
      doc.fontSize(24).font('Helvetica-Bold').text('CV', { align: 'center' });
      doc.moveDown(2);

      // Process CV sections
      cvSections.forEach(section => {
        doc.fontSize(14).font('Helvetica-Bold').text(section.title);
        doc.fontSize(10).font('Helvetica').text(section.content);
        doc.moveDown(2);
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}