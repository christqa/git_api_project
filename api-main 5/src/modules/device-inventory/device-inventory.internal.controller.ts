import { DefaultSecurityMethods } from '../../constants';
import {
  Body,
  Controller,
  Get,
  Middlewares,
  NoSecurity,
  Patch,
  Path,
  Post,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import httpStatus from 'http-status';
import { IDeviceInventoryRequestDto } from './dtos/base.dto';
import { deviceInventoryService } from '@modules/index/index.service';
import deviceInventoryValidation from './device-inventory.validation';
import deviceInventoryInternalValidation from '@modules/device-inventory/device-inventory.internal.validation';
import { IDeviceInventoryAndCount } from './device-inventory.type';
import { PatchDeviceInventoriesInternalRequestDto } from './dtos/internal.dto';

@Route('/internal/device-inventory')
@Tags('deviceInventory')
@Security(DefaultSecurityMethods)
export class DevicesInventoryInternalController extends Controller {
  /**
   *
   * Used by QA
   */
  @Post('seed-inventory')
  @Middlewares(deviceInventoryValidation.validateSeedInventory)
  @NoSecurity()
  async postSeedDeviceData(@Body() requestBody: IDeviceInventoryRequestDto[]) {
    await deviceInventoryService.seedDeviceInventory(requestBody);
  }

  /**
   *
   * Used by QA
   */
  @Get()
  @NoSecurity()
  @Middlewares(deviceInventoryInternalValidation.validateGetDeviceInventories)
  getDeviceInventoriesInternal(
    @Query() skip: number,
    @Query() take: number,
    @Query() deviceSerial?: string
  ): Promise<IDeviceInventoryAndCount> {
    return deviceInventoryService.getDeviceInventories(
      skip,
      take,
      deviceSerial
    );
  }

  @Patch('{deviceSerial}/void-device')
  @NoSecurity()
  @SuccessResponse(200, 'Ok')
  @Middlewares(deviceInventoryInternalValidation.validateVoidDeviceRequest)
  async voidDevice(@Path() deviceSerial: string) {
    await deviceInventoryService.voidDevice(deviceSerial);
    return { status: httpStatus.OK, message: 'success' };
  }

  @Patch('{deviceSerial}')
  @NoSecurity()
  @SuccessResponse(200, 'Ok')
  @Middlewares(deviceInventoryInternalValidation.validatePatchDeviceRequest)
  async patchDevice(
    @Path() deviceSerial: string,
    @Body()
    patchDeviceInventoriesInternalRequestDto: PatchDeviceInventoriesInternalRequestDto
  ) {
    await deviceInventoryService.patchDevice(
      deviceSerial,
      patchDeviceInventoriesInternalRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }
}
