import {
  Middlewares,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Body,
  Controller,
  NoSecurity,
  Path,
  Post,
  Patch,
  Get,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import { IPostFirmwaresInternalRequestDto } from './dtos/post-firmware-internal.dto';
import { IReleaseFirmwareInternalRequestDto } from './dtos/release-firmware-internal.dto';
import firmwareService from './firmware.service';
import httpStatus from 'http-status';
import firmwareInternalValidation from './firmware.internal.validation';
import { IUpdateFirmwareAvailabilityRequestDto } from './dtos/update-firmware-availability-internal.dto';
import { IGetFirmwareResponseDto } from './dtos/get-firmware-internal.dto';

@Route('internal/firmwares')
@Tags('firmwares')
@Security(DefaultSecurityMethods)
export class FirmwareInternalController extends Controller {
  @Get()
  @NoSecurity()
  @SuccessResponse(200, 'ok')
  async listAllFirmwares(): Promise<IGetFirmwareResponseDto[]> {
    return await firmwareService.listOfAllFirmwares();
  }

  @Post()
  @NoSecurity()
  @Middlewares(firmwareInternalValidation.validatePostDeviceFirmwareUpdate)
  @SuccessResponse(201, 'Created')
  async postNewFirmware(
    @Body() postFirmwaresInternalRequestDto: IPostFirmwaresInternalRequestDto
  ) {
    await firmwareService.createNewFirmware(postFirmwaresInternalRequestDto);
    return { status: httpStatus.CREATED, message: 'success' };
  }

  @Patch('{firmwareVersion}')
  @NoSecurity()
  @Middlewares(firmwareInternalValidation.validateUpdateFirmwareAvailability)
  @SuccessResponse(200, 'Ok')
  async updateFirmwareAvailability(
    @Path() firmwareVersion: string,
    @Body()
    updateFirmwareAvailabilityRequestDto: IUpdateFirmwareAvailabilityRequestDto
  ) {
    await firmwareService.updateFirmwareAvailability(
      firmwareVersion,
      updateFirmwareAvailabilityRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  @Post('{firmwareVersion}/release')
  @NoSecurity()
  @Middlewares(firmwareInternalValidation.validateReleaseFirmwareRequest)
  @SuccessResponse(201, 'Created')
  async postReleaseFirmware(
    @Path('firmwareVersion') firmwareVersion: string,
    @Body()
    releasefirmwareInternalRequestDto: IReleaseFirmwareInternalRequestDto
  ) {
    await firmwareService.releaseFirmware(
      firmwareVersion,
      releasefirmwareInternalRequestDto
    );
    return { status: httpStatus.CREATED, message: 'success' };
  }
}
