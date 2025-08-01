import puppeteer, { Browser, Page } from 'puppeteer';

export interface PDFGenerationOptions {
  format?: 'Letter' | 'A4';
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

export class PDFService {
  private static defaultOptions: PDFGenerationOptions = {
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '3cm',
      bottom: '3cm',
      left: '1.5cm',
      right: '1.5cm'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 10px; width: 100%; text-align: center; color: #2E7D32; font-weight: bold; padding: 8px; border-bottom: 1px solid #4CAF50;">
        LABORATORIO Y CONSULTORÍA LOA S.A. DE C.V.
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 9px; width: 100%; text-align: center; color: #666; padding: 8px; border-top: 1px solid #ddd;">
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        <span style="margin: 0 15px;">|</span>
        <span>RFC: LOA940429-QR8</span>
        <span style="margin: 0 15px;">|</span>
        <span>Tel: 477-210-2263</span>
      </div>
    `
  };

  static async generatePDF(html: string, options?: PDFGenerationOptions): Promise<Buffer> {
    const config = { ...this.defaultOptions, ...options };
    
    let browser: Browser | null = null;
    
    try {
      console.log('[PDFService] Launching browser...');
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      console.log('[PDFService] Setting page content...');
      
      // Configurar la página
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      console.log('[PDFService] Generating PDF...');
      
      // Generar PDF
      const pdf = await page.pdf(config);
      
      console.log('[PDFService] PDF generated successfully');
      
      return Buffer.from(pdf);
      
    } catch (error) {
      console.error('[PDFService] Error generating PDF:', error);
      throw new Error(`PDF Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (browser) {
        await browser.close();
        console.log('[PDFService] Browser closed');
      }
    }
  }

  static validateHTML(html: string): boolean {
    try {
      // Validaciones básicas para prevenir corrupción del PDF
      const suspiciousPatterns = [
        /<script[^>]*>/i,
        /<iframe[^>]*>/i,
        /javascript:/i,
        /data:text\/html/i,
        /<object[^>]*>/i,
        /<embed[^>]*>/i,
      ];

      const hasValidStructure = html.includes('<html') && html.includes('</html>');
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(html));

      return hasValidStructure && !hasSuspiciousContent;
    } catch (error) {
      console.error('[PDFService] HTML validation error:', error);
      return false;
    }
  }
}
