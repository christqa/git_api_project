import { cumulativeScoreService } from '.';

import {
  Body,
  Controller,
  Middlewares,
  NoSecurity,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import cumulativeScoreInternalValidation from './cumulative-score.internal.validation';
import { ICreateCumulativeScoreInternalRequestDto } from './dtos/cumulative-score.index.dto';

@Route('/internal/cumulative-score')
@Tags('cumulative-scores')
@Security(DefaultSecurityMethods)
export class CumulativeScoreInternalController extends Controller {
  /**
   * Used by gut health service to create cumulative score
   */
  @NoSecurity()
  @Post()
  @SuccessResponse(204, 'No Content')
  @Middlewares(
    cumulativeScoreInternalValidation.validateCreateCumulativeScoreInternal
  )
  async createCumulativeScore(
    @Body()
    createCumulativeScoreInternalRequestDto: ICreateCumulativeScoreInternalRequestDto
  ) {
    await cumulativeScoreService.upsertDailyScoreInternal(
      createCumulativeScoreInternalRequestDto
    );
  }
}
