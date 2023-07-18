import express from 'express';
import {
  Controller,
  Get,
  Middlewares,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import { pdfReportService } from '.';
import { IGetReportRequestDto } from './dtos/report.index.dto';
import { HtmlTemplateTypes } from '@modules/pdf-report/html-template-enums';
import { HtmlTemplateManager } from '@utils/pdf/html-template-utils';
import { PdfService } from '@modules/pdf-service/pdf-service';
import pdfReportValidation from './pdf-report.validation';

@Route('/pdf-report')
@Tags('pdf_report')
@Security(DefaultSecurityMethods)
export class PdfReportController extends Controller {
  /**
   *
   * Used by the app
   */
  @Get()
  @Middlewares(pdfReportValidation.validateGetPdfReport)
  @SuccessResponse(200, 'Get PDF report')
  async getPdfReport(
    @Request() request: express.Request,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('filterType') filterType?: string,
    @Query('personalData') personalData?: boolean,
    @Query('annotations') annotations?: boolean,
    @Query('conditionsAndMedications') conditionsAndMedications?: boolean
    // @Query('groupBy') groupBy?: IReportRequestDTOGroupBy,
  ) {
    const res = request.res as express.Response;
    const results = await pdfReportService.generateReportData(request.user, {
      startDate,
      endDate,
      personalData,
      annotations,
      conditionsAndMedications,
      filterType,
      // groupBy,
    } as IGetReportRequestDto);
    try {
      const binary_pdf = await PdfService.generatePDF(
        results,
        HtmlTemplateManager.html_templates[HtmlTemplateTypes.ANALYTES],
        `${request.protocol}://${request.headers.host}`
      );
      res.setHeader('Content-Length', binary_pdf.length);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
      res.end(binary_pdf.document);
      // eslint-disable-next-line
    } catch (error: any) {
      res.setHeader('Content-Type', 'application/text');
      if ('message' in error) {
        res.end(error.message);
      } else {
        res.end(error);
      }
    }
  }
}
