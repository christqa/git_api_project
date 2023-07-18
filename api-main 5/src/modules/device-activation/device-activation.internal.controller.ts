import httpStatus from 'http-status';
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  NoSecurity,
  Patch,
  Path,
  Post,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { deviceActivationService } from '@modules/index/index.service';
import deviceActivationValidation from './device-activation.validation';
import deviceActivationInternalValidation from './device-activation.internal.validation';
import { DefaultSecurityMethods } from '../../constants';
import {
  IGetDeviceStatusRequestDto,
  IGetDeviceStatusResponseDto,
  IGetUserDevicesInternalRequestDto,
  IGetUserDevicesInternalResponseDto,
  IUpdateDeviceBatteryStatusInternalRequestDto,
  IGetGroupAdminByDeviceSerialResponseDto,
  IDisconnectedDevicesDto,
  ISetIsNotifiedBatchRequestDto,
  ISetIsNotifiedBatchResponseDto,
  IGetDeviceFirmwareUpdateResponseDto,
  IUpdateDeviceFirmwareUpdateStatusRequestDto,
  IDeactivateDeviceInternalRequestDto,
} from './dtos/device-activation.index.dto';

@Route('internal/device')
@Tags('device')
@Security(DefaultSecurityMethods)
export class DeviceActivationInternalController extends Controller {
  /**
   * Used by the events service
   */
  @Post('status')
  @NoSecurity()
  @Middlewares(deviceActivationValidation.validateGetDeviceStatus)
  @SuccessResponse(200, 'success')
  getDeviceStatusInternal(
    @Body() getDeviceStatusRequestDto: IGetDeviceStatusRequestDto
  ): Promise<IGetDeviceStatusResponseDto> {
    return deviceActivationService.getDeviceStatus(getDeviceStatusRequestDto);
  }

  /**
   * Used by the device events messages gen
   */
  @Post('by-device-serial')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validateGetDeviceByDeviceSerial
  )
  getDeviceInternal(
    @Body() getUserDevicesRequestDto: IGetUserDevicesInternalRequestDto
  ): Promise<IGetUserDevicesInternalResponseDto> {
    return deviceActivationService.getDevice(
      getUserDevicesRequestDto.userGuid,
      getUserDevicesRequestDto.deviceSerial
    );
  }

  /**
   * Used by the device events
   */
  @Post('device-status')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validateUpdateDeviceBatteryStatus
  )
  @SuccessResponse(200, 'success')
  async updateDeviceBatteryStatus(
    @Body()
    updateDeviceBatteryStatusRequestDto: IUpdateDeviceBatteryStatusInternalRequestDto
  ) {
    await deviceActivationService.updateDeviceBatteryStatus(
      updateDeviceBatteryStatusRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Used by the device events status
   */
  @Get('group-admin-by-device')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validateGetGroupAdminByDeviceSerial
  )
  async getGroupAdminByDeviceSerial(
    @Query('deviceSerial') deviceSerial: string
  ): Promise<IGetGroupAdminByDeviceSerialResponseDto> {
    return deviceActivationService.getGroupAdmin(deviceSerial);
  }

  /**
   * Used by some scheduler
   * @example from "2022-12-14"
   * @example to "2022-12-15"
   */
  @Get('disconnected')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validateGetDisconnectedDevices
  )
  async getDisconnectedDevices(
    @Query('from') from?: Date,
    @Query('to') to?: Date
  ): Promise<IDisconnectedDevicesDto> {
    const now = new Date();
    to = to ? to : new Date(now.setHours(now.getHours() - 12));
    return deviceActivationService.getDisconnectedDevices(to, from);
  }

  /**
   * Used by the device events
   */
  @Post('set-is-notified-batch')
  @NoSecurity()
  @Middlewares(deviceActivationInternalValidation.validateSetIsNotifiedBatch)
  @SuccessResponse(200, 'success')
  async setIsNotifiedBatch(
    @Body()
    setIsNotifiedBatchRequest: ISetIsNotifiedBatchRequestDto
  ): Promise<ISetIsNotifiedBatchResponseDto> {
    return deviceActivationService.setIsNotifiedBatch(
      setIsNotifiedBatchRequest
    );
  }

  /**
   * Used by the device events
   */
  @Post('send-device-no-connectivity')
  @NoSecurity()
  @Middlewares(deviceActivationInternalValidation.validateDisconnectedDevices)
  @SuccessResponse(200, 'success')
  async sendDeviceNoConnectivityMessageToAdmins(
    @Body()
    disconnectedDevices: IDisconnectedDevicesDto
  ) {
    await deviceActivationService.sendDeviceNoConnectivityMessageToAdmins(
      disconnectedDevices.devices
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Used by qa tools for testing device heartbeat
   */
  @Patch('status-updated-date/{deviceActivationId}')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validatePatchDeviceUpdatedDate
  )
  @SuccessResponse(200, 'success')
  async changeDeviceStatusUpdatedDate(
    @Path('deviceActivationId') deviceActivationId: number,
    @Body() date: { date: Date }
  ) {
    await deviceActivationService.changeDeviceStatusUpdatedDate(
      deviceActivationId,
      date.date
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Used to get device firmware update in PENDING_INSTALL status
   */
  @Get('/{deviceSerial}/firmware-updates/latest')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validateGetDeviceFirmwareUpdate
  )
  @Response<IGetDeviceFirmwareUpdateResponseDto>(200, 'Ok')
  @Response<undefined>(204, 'No Content')
  getDeviceFirmwareUpdate(
    @Path() deviceSerial: string
  ): Promise<IGetDeviceFirmwareUpdateResponseDto | undefined> {
    return deviceActivationService.getDeviceFirmwareUpdate({ deviceSerial });
  }

  /**
   * Used to update device firmware update status
   */
  @Patch('/{deviceSerial}/firmware-updates/{firmwareVersion}')
  @NoSecurity()
  @Middlewares(
    deviceActivationInternalValidation.validateUpdateDeviceFirmwareUpdate
  )
  @SuccessResponse(200, 'success')
  async updateDeviceFirmwareUpdateStatus(
    @Path() deviceSerial: string,
    @Path() firmwareVersion: string,
    @Body()
    updateDeviceFirmwareUpdateStatusRequestDto: IUpdateDeviceFirmwareUpdateStatusRequestDto
  ) {
    await deviceActivationService.updateDeviceFirmwareUpdateStatus(
      deviceSerial,
      firmwareVersion,
      updateDeviceFirmwareUpdateStatusRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Used to deactivate a device (internal)
   */
  @Delete('/{deviceSerial}')
  @NoSecurity()
  @Middlewares(deviceActivationInternalValidation.validateDeactivateDevice)
  @SuccessResponse(204, 'No Content')
  async deactivateDevice(
    @Path() deviceSerial: string,
    @Body()
    deactivateDeviceInternalRequestDto: IDeactivateDeviceInternalRequestDto
  ) {
    await deviceActivationService.deactivateDeviceInternal(
      deviceSerial,
      deactivateDeviceInternalRequestDto
    );
  }
}
