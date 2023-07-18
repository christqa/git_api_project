import httpStatus from 'http-status';
import {
  Body,
  Controller,
  Middlewares,
  NoSecurity,
  Path,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import notificationsService from './notifications.service';
import notificationsInternalValidation from './notifications.internal.validation';
import { DefaultSecurityMethods } from '../../constants';
import { ITriggerPushNotificationRequestDto } from './dtos/internal-notification.dto';

@Route('internal/notifications')
@Tags('notifications')
@Security(DefaultSecurityMethods)
export class NotificationsInternalController extends Controller {
  /**
   *
   * Used by the daily-weekly-notifications cronjob
   */
  @Post('triggerPushNotification/{notifType}')
  @Middlewares(notificationsInternalValidation.validateTriggerPushNotifications)
  @NoSecurity()
  @SuccessResponse(201, 'success')
  async triggerPushNotification(
    @Body()
    triggerPushNotificationRequestDTO: ITriggerPushNotificationRequestDto,
    @Path('notifType') notifType: string
  ) {
    await notificationsService.triggerPushNotifications(
      triggerPushNotificationRequestDTO.userGuid,
      triggerPushNotificationRequestDTO.title,
      triggerPushNotificationRequestDTO.message,
      triggerPushNotificationRequestDTO.link || '',
      triggerPushNotificationRequestDTO.type,
      triggerPushNotificationRequestDTO.customInfo
    );
    return { status: httpStatus.CREATED, message: 'success' };
  }
}
