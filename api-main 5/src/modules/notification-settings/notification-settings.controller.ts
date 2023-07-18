import {
  Body,
  Controller,
  Get,
  Middlewares,
  Put,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import express from 'express';
import {
  findNotificationSettings,
  updateNotificationSettings,
} from './notification-settings.service';
import {
  IGetNotificationSettingsResponseDto,
  IUpdateNotificationSettingsRequestDto,
} from './dto/notification-settings.index.dto';
import notificationsValidation from './notification-settings.validation';

@Route('/notification-settings')
@Tags('notificationSettings')
@Security(DefaultSecurityMethods)
export class NotificationSettingsController extends Controller {
  @Get()
  async getNotificationSettings(
    @Request() request: express.Request
  ): Promise<IGetNotificationSettingsResponseDto[]> {
    return findNotificationSettings(request.user.userGuid);
  }

  @Put()
  @Middlewares(notificationsValidation.validateUpdateNotificationSettings)
  async update(
    @Body() data: IUpdateNotificationSettingsRequestDto[],
    @Request() request: express.Request
  ) {
    return updateNotificationSettings(request.user.userGuid, data);
  }
}
