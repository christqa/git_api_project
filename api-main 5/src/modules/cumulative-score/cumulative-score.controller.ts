import { cumulativeScoreService } from '.';
import {
  ICreateCumulativeScoreRequestDto,
  IDeleteCumulativeScoreRequestDto,
} from './dtos/cumulative-score.index.dto';
import {
  Body,
  Controller,
  Delete,
  Middlewares,
  NoSecurity,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import cumulativeScoreValidation from './cumulative-score.validation';

@Route('internal/qa/cumulative-score')
@Tags('cumulative-scores')
@Security(DefaultSecurityMethods)
export class CumulativeScoreController extends Controller {
  /**
   * Used by QA tools
   */
  @NoSecurity()
  @Post()
  @SuccessResponse(204, 'No Content')
  @Middlewares(cumulativeScoreValidation.validateCreateCumulativeScore)
  async createCumulativeScore(
    @Body() createCumulativeScoreRequestDto: ICreateCumulativeScoreRequestDto
  ) {
    await cumulativeScoreService.create(createCumulativeScoreRequestDto);
  }

  /**
   * Used by QA tools
   */
  @Delete()
  @Middlewares(cumulativeScoreValidation.validateDeleteCumulativeScore)
  @NoSecurity()
  async deleteCumulativeScore(
    @Body() deleteCumulativeScoreRequestDto: IDeleteCumulativeScoreRequestDto
  ) {
    return cumulativeScoreService.remove(deleteCumulativeScoreRequestDto);
  }
}
