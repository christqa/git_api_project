import express from 'express';
import {
  Body,
  Controller,
  Example,
  Get,
  Middlewares,
  Patch,
  Put,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import dataStoreService from './data-store.service';
import dataStoreValidation from './data-store.validation';
import { DefaultSecurityMethods } from '../../constants';
import { IDataStoreKeyValues } from './data-store.type';

@Route('/data-store')
@Tags('dataStore')
@Security(DefaultSecurityMethods)
export class DataStoreController extends Controller {
  /**
   * Used to update a data store
   */
  @Put()
  @Middlewares(dataStoreValidation.validateUpdateDataStore)
  @SuccessResponse(204, 'No Content')
  async updateDataStore(
    @Request() request: express.Request,
    @Body() keyValuesRequestDto: IDataStoreKeyValues
  ) {
    await dataStoreService.upsertDataStore(
      request.user.userGuid,
      keyValuesRequestDto
    );
  }

  /**
   * Used to upsert in a data store
   */
  @Patch()
  @Middlewares(dataStoreValidation.validateUpdateDataStore)
  @SuccessResponse(200, 'success')
  async patchDataStore(
    @Request() request: express.Request,
    @Body() keyValuesRequestDto: IDataStoreKeyValues
  ) {
    await dataStoreService.patchDataStore(
      request.user.userGuid,
      keyValuesRequestDto
    );
  }

  @Example<IDataStoreKeyValues>({
    isBathroomUsageCompleted: false,
    isLifestyleCompleted: false,
    isMedicalConditionsCompleted: true,
    isMedicationsCompleted: false,
    batteryLevel: 'high',
    batteryPercentage: 100,
  })
  @Get()
  async getDataStore(
    @Request() request: express.Request
  ): Promise<IDataStoreKeyValues> {
    return dataStoreService.getDataStore(request.user.userGuid);
  }
}
