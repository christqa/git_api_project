import { IAnalyteManualCreateRequestDto } from './dtos/analytes.index.dto';

import { analyteStoolService, analyteUrineService } from '.';
import {
  IAnalytesManualEntry,
  IStoolDataWhere,
  IUrineDataWhere,
  StoolFilterType,
  UrineFilterType,
} from './analytes.type';
import { GroupByFilter } from '../user-configuration/dtos/user-configuration.index.dto';

import {
  Body,
  Controller,
  Get,
  Middlewares,
  Post,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DATE_FORMAT_ISO8601, DefaultSecurityMethods } from '../../constants';
import analytesValidation from './analytes.validation';
import express from 'express';
import moment from 'moment';

@Route()
@Security(DefaultSecurityMethods)
export class AnalytesController extends Controller {
  /**
   * Retrieves the urinations of an existing user.
   */
  @Tags('urinations')
  @Get('/urinations')
  @Middlewares(analytesValidation.validateGetUrinations)
  public async getUrinations(
    @Request() request: express.Request,
    @Query('groupBy') groupBy?: GroupByFilter,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('type') type?: UrineFilterType
  ) {
    const urinations_where = {
      startDate,
      endDate,
      type,
      userGuid: request.user.userGuid,
    } as IUrineDataWhere;

    return analyteUrineService.find(urinations_where, groupBy);
  }

  /**
   * Retrieves the stools of an existing user.
   */
  @Tags('stool')
  @Get('/stools')
  @Middlewares(analytesValidation.validateGetStoolData)
  public async getStools(
    @Request() request: express.Request,
    @Query('groupBy') groupBy?: GroupByFilter,
    @Query('startDate') startDate?: number | string,
    @Query('endDate') endDate?: number | string,
    @Query('type') type?: StoolFilterType
  ) {
    const bowels_where = {
      startDate,
      endDate,
      type,
      userGuid: request.user.userGuid,
    } as unknown as IStoolDataWhere;

    return analyteStoolService.find(bowels_where, groupBy);
  }

  /**
   * Manually adds some analytes for a user
   */
  @Tags('manual-enter')
  @Post('/analytes-manual')
  @SuccessResponse(204, 'No Content')
  @Middlewares(analytesValidation.validateManualEnter)
  public async manualEnter(
    @Request() request: express.Request,
    @Body()
    inputDto: IAnalyteManualCreateRequestDto
  ) {
    const t1 = moment(inputDto.beginning);
    const t2 = moment(inputDto.end);
    const t3 = t1.clone();
    const duration = moment.duration(t2.diff(t1));
    const diffSeconds = duration.asSeconds();
    t3.add(Math.round(diffSeconds / 2), 'seconds');

    const dateFormat = new Date(
      t3.format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z'
    );
    const startFormat = new Date(
      t1.format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z'
    );
    const endFormat = new Date(
      t2.format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z'
    );

    const entry = {
      date: dateFormat,
      start: startFormat,
      end: endFormat,
      isStool: inputDto.isStool,
      isUrine: inputDto.isUrine,
    } as IAnalytesManualEntry;

    if (inputDto.isStool) {
      await analyteStoolService.insertManual(entry, request.user.userGuid);
    }
    if (inputDto.isUrine) {
      await analyteUrineService.insertManual(entry, request.user.userGuid);
    }
  }
}
