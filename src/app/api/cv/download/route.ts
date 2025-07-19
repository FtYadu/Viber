import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch the CV data from the database
    const cvSections = await db.cVSection.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    if (!cvSections || cvSections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'CV data not found',
        },
        { status: 404 }
      );
    }

    // Generate a PDF from the CV sections
    const pdfBuffer = await generatePDF(cvSections);

    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Yadu_Krishnan_CV.pdf"`,
      },
    });
  } catch (error) {
    logger.error('Failed to generate CV PDF:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CV PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function generatePDF(cvSections: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });

      // Collect PDF data chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Set font and size
      doc.font('Helvetica');

      // Header
      doc.fontSize(24).text('Yadu Krishnan', { align: 'center' });
      doc.fontSize(14).text('Full Stack Developer', { align: 'center' });
      doc.moveDown(2);

      // Generate sections from CV data
      cvSections.forEach((section) => {
        doc.fontSize(12).text(section.title.toUpperCase(), { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(section.content);
        doc.moveDown(2);
      });

      // Footer
      const bottomOfPage = doc.page.height - 50;
      doc.fontSize(8)
        .text(
          `Generated on ${new Date().toLocaleDateString()}`,
          50,
          bottomOfPage,
          { align: 'center' }
        );

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}