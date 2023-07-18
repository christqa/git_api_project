import express from 'express';
import httpStatus from 'http-status';
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { deviceActivationService } from '@modules/index/index.service';
import deviceActivationValidation from './device-activation.validation';
import { DefaultSecurityMethods } from '../../constants';
import {
  IAcceptDeviceFirmwareUpdateRequestDto,
  IActivateDeviceRequestDto,
  IDeactivateDeviceRequestDto,
  IGetActivatedDeviceResponseDto,
  IGetDeviceStatusRequestDto,
  IGetDeviceStatusResponseDto,
  IUpdateActivatedDeviceRequestDto,
} from './dtos/device-activation.index.dto';

@Route('device')
@Tags('device')
@Security(DefaultSecurityMethods)
export class DeviceActivationController extends Controller {
  /**
   * Used to activate a device
   */
  @Post()
  @Middlewares(deviceActivationValidation.validateActivateDevice)
  @SuccessResponse(201, 'success')
  async activateDevice(
    @Request() request: express.Request,
    @Body() activateDeviceRequestDto: IActivateDeviceRequestDto
  ): Promise<IGetActivatedDeviceResponseDto> {
    await deviceActivationService.activateDevice(
      request.user.userGuid,
      activateDeviceRequestDto
    );
    return deviceActivationService.getActivatedDevice(
      request.user.userGuid,
      activateDeviceRequestDto.deviceSerial
    );
  }

  /**
   * Used to update a device
   */
  @Put()
  @Middlewares(deviceActivationValidation.validateUpdateActivatedDevice)
  @SuccessResponse(200, 'success')
  async updateActivatedDevice(
    @Request() request: express.Request,
    @Body() updateActivatedDeviceRequestDto: IUpdateActivatedDeviceRequestDto
  ) {
    await deviceActivationService.updateActivatedDevice(
      request.user.userGuid,
      updateActivatedDeviceRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Used to deactivate a device
   */
  @Delete()
  @Middlewares(deviceActivationValidation.validateDeactivateDevice)
  @SuccessResponse(204, 'No Content')
  async deactivateDevice(
    @Request() request: express.Request,
    @Body() deactivateDeviceRequestDto: IDeactivateDeviceRequestDto
  ) {
    await deviceActivationService.deactivateDevice(
      request.user.userGuid,
      deactivateDeviceRequestDto
    );
  }

  /**
   * Used to get the status of a device
   */
  @Post('status')
  @Middlewares(deviceActivationValidation.validateGetDeviceStatus)
  @SuccessResponse(200, 'success')
  getDeviceStatus(
    @Body() getDeviceStatusRequestDto: IGetDeviceStatusRequestDto
  ): Promise<IGetDeviceStatusResponseDto> {
    return deviceActivationService.getDeviceStatus(getDeviceStatusRequestDto);
  }

  /**
   * Used to trigger-firmware-update
   */
  @Post('firmware-update')
  @Middlewares(deviceActivationValidation.validateAcceptDeviceFirmwareUpdate)
  @SuccessResponse(200, 'success')
  async acceptDeviceFirmwareUpdate(
    @Request() request: express.Request,
    @Body()
    acceptDeviceFirmwareUpdateRequestDto: IAcceptDeviceFirmwareUpdateRequestDto
  ) {
    await deviceActivationService.acceptDeviceFirmwareUpdate(
      request.user.userGuid,
      acceptDeviceFirmwareUpdateRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Used to get activated device
   */
  @Get('/active/{deviceSerial}')
  @Middlewares(deviceActivationValidation.validateGetActivatedDevice)
  @SuccessResponse(200, 'success')
  getActivatedDevice(
    @Request() request: express.Request,
    @Path('deviceSerial') deviceSerial: string
  ): Promise<IGetActivatedDeviceResponseDto> {
    return deviceActivationService.getActivatedDevice(
      request.user.userGuid,
      deviceSerial
    );
  }
}
