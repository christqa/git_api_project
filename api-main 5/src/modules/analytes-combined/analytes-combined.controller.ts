import {
  Controller,
  Get,
  Query,
  Route,
  Security,
  Request,
  Middlewares,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import { findAnalytes } from './analytes-combined.service';
import express from 'express';
import { IAnalytesWhere } from './analytes-combined.type';
import { IAnalytesCombinedResponseDTO } from './dtos/analytes-combined.dto';
import AnalytesCombinedValidation from './analytes-combined.validation';

@Route('/analytes')
@Middlewares(AnalytesCombinedValidation.validateGetAnalytes)
@Security(DefaultSecurityMethods)
export class AnalytesCombinedController extends Controller {
  @Get()
  async getAnalytes(
    @Request() request: express.Request,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ): Promise<IAnalytesCombinedResponseDTO> {
    const analytes_where = {
      startDate,
      endDate,
      userGuid: request.user.userGuid,
    } as IAnalytesWhere;

    return findAnalytes(analytes_where);
  }
}
