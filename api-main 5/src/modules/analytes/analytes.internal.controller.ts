import {
  IAnalyteManualCreateInternalRequestDto,
  ICreateStoolDataInternalRequestDto,
  ICreateUrineDataInternalRequestDto,
} from './dtos/analytes.index.dto';
import { EventSource } from '@prisma/client';
import { analyteStoolService, analyteUrineService } from '.';
import {
  AnalyteTypes,
  IAnalytesManualEntry,
  IStoolDataInternalPayload,
  IUrineDataInternalPayload,
} from './analytes.type';

import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  NoSecurity,
  Path,
  Post,
  Put,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import analytesInternalValidation from './analytes.internal.validation';
import {
  IStoolDataInternalToDBRequestDto,
  IStoolSNSRequestDto,
  IUrineDataInternalToDBRequestDto,
  IUrineSNSRequestDto,
} from './dtos/internal.dto';

@Route()
@Security(DefaultSecurityMethods)
export class AnalytesInternalController extends Controller {
  /**
   * Called by hydration service
   */
  @Tags('urinations')
  @Put('/internal/urinations')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateUpsertUrine)
  @SuccessResponse(204, 'No Content')
  public async upsertInternalUrine(
    @Body() inputDto: IUrineDataInternalPayload
  ) {
    const cdto = {
      payload: inputDto,
    } as ICreateUrineDataInternalRequestDto;
    await analyteUrineService.upsertInternal(cdto);
  }

  /**
   * Called by hydration service
   */
  @Tags('urinations')
  @Post('/internal/urinations/save')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateAddUrinationToDB)
  @SuccessResponse(204, 'No Content')
  public async upsertUrineToDB(
    @Body() inputDto: IUrineDataInternalToDBRequestDto[]
  ) {
    await analyteUrineService.upsertInternalToDB(inputDto);
  }

  /**
   * Called by hydration service
   */
  @Tags('urinations')
  @Get('/internal/urinations/existingDataForDay')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateGetExistingDataForDay)
  public async existingDataForDay(
    @Query('profileId') profileId: number,
    @Query('scoreDate') scoreDate: string
  ) {
    return analyteUrineService.existingDataForDay(profileId, scoreDate);
  }

  /**
   * Called by hydration service
   */
  @Tags('urinations')
  @Get('/internal/urinations')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateGetUrine)
  public async getUrination(
    @Query('profileId') profileId: number,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('type') type: AnalyteTypes,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Query('firstInDay') firstInDay?: boolean
  ) {
    return analyteUrineService.getUrination(
      profileId,
      startDate,
      firstInDay,
      endDate,
      type,
      sortOrder
    );
  }

  /**
   * Called by Qa-tools
   */
  @Tags('urinations')
  @Delete('/internal/urinations/{profileId}')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateDeleteUrine)
  public async removeUrination(@Path() profileId: number) {
    await analyteUrineService.removeUrinationData(profileId);
  }

  /**
   * Called by gut health service
   */
  @Tags('stool')
  @Put('/internal/stools')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateUpsertStool)
  @SuccessResponse(204, 'No Content')
  public async upsertInternalStool(
    @Body() inputDto: IStoolDataInternalPayload
  ) {
    const cdto = {
      payload: inputDto,
    } as ICreateStoolDataInternalRequestDto;
    await analyteStoolService.upsertInternal(cdto);
  }

  /**
   * Called by gut health service
   */
  @Tags('stool')
  @Post('/internal/stools/save')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateAddStoolToDB)
  @SuccessResponse(204, 'No Content')
  public async upsertStoolToDB(
    @Body() inputDto: IStoolDataInternalToDBRequestDto[]
  ) {
    await analyteStoolService.upsertInternalToDB(inputDto);
  }

  /**
   * Called by gut health service
   */
  @Tags('stool')
  @Get('/internal/stools')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateGetStools)
  public async getInternalStools(
    @Query('profileId') profileId: number,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date
  ) {
    return analyteStoolService.getStools(profileId, startDate, endDate);
  }

  /**
   * Called by hydration service
   */
  @Tags('stool')
  @Post('/internal/analytes-manual/save')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateManualEnterToDB)
  @SuccessResponse(204, 'No Content')
  public async upsertInternalAnalytesManual(
    @Body() inputDto: IAnalyteManualCreateInternalRequestDto
  ) {
    await analyteStoolService.upsertInternalManualToDB(
      inputDto as IAnalytesManualEntry
    );
  }
  /**
   * Called by hydration service
   */
  @Tags('manual-enter')
  @Get('/internal/analytes-manual')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateGetAnalytesManual)
  public async getInternalAnalytesManual(
    @Query('profileId') profileId: number,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('type') type: AnalyteTypes,
    @Query('sortOrder') sortOrder: 'asc' | 'desc'
  ) {
    return analyteStoolService.getAnalytesManual(
      profileId,
      startDate,
      endDate,
      sortOrder,
      type
    );
  }

  @Tags('stool')
  @Post('/internal/stools/sns')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateAddStoolSNS)
  @SuccessResponse(204, 'No Content')
  public async addStoolSNS(
    @Body()
    {
      profileId,
      deviceSerial,
      cameraNeedsAlignment,
      ...data
    }: IStoolSNSRequestDto
  ) {
    await analyteStoolService.sendToSNS(
      data,
      EventSource.DeviceGenerated,
      profileId,
      deviceSerial,
      cameraNeedsAlignment
    );
  }

  @Tags('urine')
  @Post('/internal/urinations/sns')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateAddUrineSNS)
  @SuccessResponse(204, 'No Content')
  public async addUrineSNS(
    @Body()
    {
      profileId,
      deviceSerial,
      cameraNeedsAlignment,
      ...data
    }: IUrineSNSRequestDto
  ) {
    await analyteUrineService.sendToSNS(
      data,
      EventSource.DeviceGenerated,
      profileId,
      deviceSerial,
      cameraNeedsAlignment
    );
  }
  /**
   * Called by Qa-tools
   */
  @Tags('stool')
  @Delete('/internal/stool/{profileId}')
  @NoSecurity()
  @Middlewares(analytesInternalValidation.validateDeleteUrine)
  public async removeStool(@Path() profileId: number) {
    await analyteStoolService.removeStoolData(profileId);
  }
}
