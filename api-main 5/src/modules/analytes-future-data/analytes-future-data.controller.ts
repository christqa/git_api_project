import {
  Body,
  Controller,
  Get,
  Middlewares,
  NoSecurity,
  Path,
  Put,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import AnalytesFutureDataInternalValidation from './analytes-future-data.validation';
import {
  addStoolData,
  addUrineData,
  getFutureAnalyteData,
  updateFutureAnalyteData,
} from './analytes-future-data.service';
import { AnalyteTypes } from '../analytes/analytes.type';
import {
  IFutureAnalyteRequestDto,
  IFutureStoolRequestDto,
  IFutureUrineRequestDto,
} from './dtos/base.dto';
import {
  IFutureStoolDataPayload,
  IFutureUrineDataPayload,
} from './analytes-future-data.type';

@Route('/internal')
@Security(DefaultSecurityMethods)
export class AnalytesFutureDataInternalController extends Controller {
  @Tags('Analytes Future data')
  @Get('future-data')
  @NoSecurity()
  @Middlewares(AnalytesFutureDataInternalValidation.validateAnalytesData)
  public async getAnalytesFutureData(
    @Query('email') email: string,
    @Query('type') type: AnalyteTypes,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate?: Date
  ) {
    return getFutureAnalyteData({
      type,
      startDate,
      email,
      endDate,
    } as IFutureAnalyteRequestDto);
  }

  @Tags('Analytes Future data')
  @Put('/future-urinations/{email}')
  @NoSecurity()
  @Middlewares(AnalytesFutureDataInternalValidation.validateUpsertUrineData)
  @SuccessResponse(204, 'No Content')
  public async upsertUrine(
    @Path('email') email: string,
    @Body() inputDto: IFutureUrineDataPayload[]
  ) {
    const cdto = {
      payload: inputDto,
      userEmail: email,
    } as IFutureUrineRequestDto;
    await addUrineData(cdto);
  }

  @Tags('Analytes Future data')
  @Put('/future-stools/{email}')
  @NoSecurity()
  @Middlewares(AnalytesFutureDataInternalValidation.validateUpsertStoolData)
  @SuccessResponse(204, 'No Content')
  public async upsertStool(
    @Path('email') email: string,
    @Body() inputDto: IFutureStoolDataPayload[]
  ) {
    const cdto = {
      payload: inputDto,
      userEmail: email,
    } as IFutureStoolRequestDto;
    await addStoolData(cdto);
  }

  @Tags('Analytes Future data')
  @Put('future-data')
  @NoSecurity()
  @Middlewares(AnalytesFutureDataInternalValidation.validateAnalytesData)
  public async updateFutureData(
    @Query('email') email: string,
    @Query('type') type: AnalyteTypes,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate?: Date
  ) {
    return updateFutureAnalyteData({
      type,
      startDate,
      email,
      endDate,
    } as IFutureAnalyteRequestDto);
  }
}
