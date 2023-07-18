import {
  CumulativeScoreGroupType,
  IGetCumulativeScoreRequestDto2,
} from './dtos/cumulative-score.index.dto';
import { CumulativeScoreTypes } from './cumulative-score.type';
import { Controller } from '@tsoa/runtime';
import { Get, Middlewares, Query, Request, Route, Security, Tags } from 'tsoa';
import express from 'express';
import cumulativeScoreValidation from './cumulative-score.validation';
import { DefaultSecurityMethods } from '../../constants';
import { getScores } from './cs-loader/cs-loader.service';
import { enrichStoolResponse } from '@modules/analytes/stool.service';
import { enrichUrineResponse } from '@modules/analytes/urination.service';

@Route('/cumulative-scores')
@Tags('cumulative-scores')
@Security(DefaultSecurityMethods)
export class CumulativeScoresController extends Controller {
  /**
   * Used from the mobile app
   */
  @Get('/')
  @Middlewares(cumulativeScoreValidation.validateGetCumulativeScore2)
  async getCumulativeScore2(
    @Request() request: express.Request,
    @Query('groupBy') groupBy: CumulativeScoreGroupType,
    @Query('type') type: CumulativeScoreTypes,

    @Query('endDate') endDate?: Date,
    @Query('startDate') startDate?: Date
  ) {
    const response = await getScores({
      type,
      groupBy,
      endDate,
      startDate,
      userGuid: request.user.userGuid,
      email: request.user.email,
    } as IGetCumulativeScoreRequestDto2);

    if (type === CumulativeScoreTypes.hydration) {
      return await enrichUrineResponse(request.user.userGuid, response);
    }
    return await enrichStoolResponse(request.user.userGuid, response);
  }
}
