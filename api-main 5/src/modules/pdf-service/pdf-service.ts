import { HtmlTemplateManager } from '@utils/pdf/html-template-utils';
import PDFreactor from '../../lib/pdf-reactor-client';
import AwsXray from 'aws-xray-sdk';
import config from '@core/enviroment-variable-config';
import { Namespace } from 'cls-hooked';

AwsXray.setDaemonAddress(config.awsXrayDaemonAddress);
// The errors will not be logged for keeping the console clean
AwsXray.setContextMissingStrategy('IGNORE_ERROR');

export class PdfService {
  private static pdf_engine: PDFreactor | null = null;
  private static awsSegment: AwsXray.Segment;
  private static awsSubsegment: AwsXray.Subsegment;
  private static awsNS: Namespace;
  private static PDF_GENERATION_SERVICE_URL =
    process.env.PDF_GENERATION_SERVICE_URL + '/service/rest';

  public static getPDFEngine() {
    if (this.pdf_engine) {
      return this.pdf_engine;
    }
    this.awsNS = AwsXray.getNamespace();
    this.awsNS.createContext();
    this.awsSegment = new AwsXray.Segment('PDFGeneration');
    this.awsNS.enter(this.awsNS.createContext());
    this.awsSubsegment = this.awsSegment.addNewSubsegment('PDFReactor');
    this.pdf_engine = new PDFreactor(this.PDF_GENERATION_SERVICE_URL);
    return this.pdf_engine;
  }

  public static async generatePDF(
    // eslint-disable-next-line
    input_data: any,
    template_name: string,
    base_url: string
    // eslint-disable-next-line
  ): Promise<any> {
    const startTime = Date.now();
    this.awsSubsegment.addAttribute('start_time', startTime / 1000);
    const transformed_data = { data: input_data };

    const template_generated = await HtmlTemplateManager.generateTemplate(
      transformed_data,
      template_name
    );
    try {
      const config = {
        document: template_generated,
        contentObserver: {
          missingResources: true,
          connections: true,
        },

        // Set the title of the created PDF
        title: 'Generating PDF report',
        // Set the author of the created PDF
        author: 'projectspectra.dev',
        encoding: 'UTF-8',
        logLevel: 'WARN',

        // Note: needs a routable IP / hostname in order for PDFReactor to get the external files
        // Dev: Recommend using ngrok.io
        // Does not work with localhost
        baseURL: base_url,

        conversionTimeout: 120,

        javaScriptSettings: {
          enabled: true,
          debugMode: 'EXCEPTIONS',
        },

        viewerPreferences: ['FIT_WINDOW', 'PAGE_MODE_USE_THUMBS'],
        cssSettings: {
          validationMode: 'ALL',
          supportQueryMode: 'ALL',
        },

        quirksSettings: {
          caseSensitiveClassSelectors: 'QUIRKS',
        },

        fontFallback: ['Fredoka'],
        colorSpaceSettings: {
          targetColorSpace: 'CMYK',
        },
        userStyleSheets: [
          {
            content:
              '@page {' +
              ' size: letter portrait;' +
              '-ro-scale-content: auto;' +
              '-ro-bookmarks-enabled:true;' +
              'counter-increment: page;' +
              'margin: 45px;' +
              'margin-top: 97pt;' +
              '  @bottom-right {' +
              '  content:"Page "counter(page)" of "counter(pages)' +
              '  }' +
              'padding-top: 30px;' +
              '}' +
              '@page:ro-nth(1) {' +
              'padding-top: -2px;' +
              '}' +
              '@page:ro-nth(2) {' +
              'padding-top: -2px;' +
              '}' +
              '@page:ro-nth(3) {' +
              'padding-top: 0px;' +
              '}',
          },
        ],
      };
      // eslint-disable-next-line
      const result: any = await PdfService.getPDFEngine().convert(config);
      const endTime = Date.now();
      this.awsSubsegment.addAttribute('end_time', endTime / 1000);
      this.awsSubsegment.flush();
      this.awsSubsegment.close();
      this.awsSegment.close();
      return {
        document: Buffer.from(result.document, 'base64'),
        length: Buffer.from(result.document, 'base64').length,
      };
      // eslint-disable-next-line
    } catch (error: any) {
      this.awsSubsegment.addError(error);
      this.awsSubsegment.flush();
      this.awsSubsegment.close();
      this.awsSegment.close();
      if ('message' in error) {
        throw error.message;
      } else {
        throw error;
      }
    }
  }
}
