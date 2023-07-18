import httpStatus from 'http-status';
import { DefaultSecurityMethods } from '../../constants';
import {
  Body,
  Controller,
  Get,
  Middlewares,
  NoSecurity,
  Route,
  Security,
  Tags,
  Patch,
  Path,
  SuccessResponse,
} from 'tsoa';
import { globalSettingsService } from '@modules/index/index.service';
import { IGetGlobalSetttingsInternalResponseDto } from './dtos/internal.dto';
import { IUpdateGlobalSettingRequestDto } from './dtos/update-global-settings.dto';
import globalSettingsInternalValidation from './global-settings.internal.validation';

@Route('/internal/global-settings')
@Tags('globalSettings')
@Security(DefaultSecurityMethods)
export class GlobalSettingsInternalController extends Controller {
  @NoSecurity()
  @Get()
  async getAllGlobalSettings(): Promise<
    IGetGlobalSetttingsInternalResponseDto[]
  > {
    return await globalSettingsService.getAllGlobalSettings();
  }

  @NoSecurity()
  @Patch('/{globalSettingId}')
  @Middlewares(globalSettingsInternalValidation.validateUpdateGlobalSetting)
  @SuccessResponse(200, 'success')
  async updateGlobalSettings(
    @Path('globalSettingId') globalSettingId: number,
    @Body() updateGlobalSettingRequestDto: IUpdateGlobalSettingRequestDto
  ) {
    await globalSettingsService.updateGlobalSetting(
      globalSettingId,
      updateGlobalSettingRequestDto
    );
    return { status: httpStatus.OK, message: 'success' };
  }
}
