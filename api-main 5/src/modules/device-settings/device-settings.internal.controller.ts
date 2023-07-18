import { deviceSettingsService } from '@modules/index/index.service';
import {
  Body,
  Controller,
  Get,
  Middlewares,
  NoSecurity,
  Patch,
  Path,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import { ICreateManyDeviceSettingsRequestDto } from './dtos/create-device-settings.dto';
import { IUpdateDeviceSettingRequestDto } from './dtos/update-device-settings.dto';
import deviceSettingsInternalValidation from './device-settings.internal.validation';
import httpStatus from 'http-status';

@Route('/internal/device-settings')
@Tags('deviceSettings')
@Security(DefaultSecurityMethods)
export class DeviceSettingsInternalController extends Controller {
  @NoSecurity()
  @Post()
  @Middlewares(deviceSettingsInternalValidation.validateCreateDeviceSettings)
  @SuccessResponse(201, 'success')
  async createDeviceSettings(
    @Body()
    createManyDeviceSettingsRequestDto: ICreateManyDeviceSettingsRequestDto
  ) {
    await deviceSettingsService.createMany(createManyDeviceSettingsRequestDto);
  }

  @NoSecurity()
  @Get('/{deviceSerial}')
  @Middlewares(
    deviceSettingsInternalValidation.validateGetDeviceSettingsByDeviceSerial
  )
  async getDeviceSettingsByDeviceSerial(
    @Path('deviceSerial') deviceSerial: string
  ) {
    return deviceSettingsService.getDeviceSettingsByDeviceSerial(deviceSerial);
  }

  @NoSecurity()
  @Patch('/{deviceSettingId}')
  @Middlewares(deviceSettingsInternalValidation.validateUpdateDeviceSetting)
  @SuccessResponse(200, 'success')
  async updateDeviceSettings(
    @Path('deviceSettingId') deviceSettingId: number,
    @Body() updateDeviceSettingRequestDto: IUpdateDeviceSettingRequestDto
  ) {
    await deviceSettingsService.updateDeviceSetting(
      deviceSettingId,
      updateDeviceSettingRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }
}
