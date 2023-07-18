import {
  Body,
  Controller,
  Middlewares,
  NoSecurity,
  Post,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import { findNotificationSettingsByUser } from './notification-settings.service';
import {
  IGetNotificationSettingsInternalRequestDto,
  IGetNotificationSettingsResponseDto,
} from './dto/notification-settings.index.dto';
import notificationsInternalValidation from '@modules/notification-settings/notification-settings.internal.validation';

@Route('internal/notification-settings')
@Tags('notificationSettings')
@Security(DefaultSecurityMethods)
export class NotificationSettingsInternalController extends Controller {
  @Post('/notification-settings')
  @NoSecurity()
  @Middlewares(
    notificationsInternalValidation.validateGetNotificationSettingsByUser
  )
  async getNotificationSettingsByUser(
    @Body()
    getNotificationSettingsInternalRequestDto: IGetNotificationSettingsInternalRequestDto
  ): Promise<IGetNotificationSettingsResponseDto[]> {
    return (await findNotificationSettingsByUser(
      getNotificationSettingsInternalRequestDto.userGuid
    )) as IGetNotificationSettingsResponseDto[];
  }
}
