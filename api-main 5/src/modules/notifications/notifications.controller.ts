import express from 'express';
import httpStatus from 'http-status';
import {
  Body,
  Controller,
  Delete,
  Middlewares,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import notificationsService from './notifications.service';
import notificationsValidation from './notifications.validation';
import { DefaultSecurityMethods } from '../../constants';
import {
  ICreatePushTokenRequestDto,
  IDeletePushTokenRequestDto,
} from './dtos/notifications.index.dto';

@Route('/notifications/push-tokens')
@Tags('notifications')
@Security(DefaultSecurityMethods)
export class NotificationsController extends Controller {
  /**
   *
   * Used by the mobile app
   */
  @Post()
  @Middlewares(notificationsValidation.validateCreateDeletePushToken)
  @SuccessResponse(201, 'success')
  async createPushToken(
    @Request() request: express.Request,
    @Body() pushTokenRequestDTO: ICreatePushTokenRequestDto
  ) {
    await notificationsService.createPushToken(
      request.user.userGuid,
      pushTokenRequestDTO
    );
    return { status: httpStatus.CREATED, message: 'success' };
  }

  /**
   *
   * Used by the mobile app
   */
  @Delete()
  @Middlewares(notificationsValidation.validateCreateDeletePushToken)
  @SuccessResponse(204, 'No Content')
  async deletePushToken(
    @Body() pushTokenRequestDTO: IDeletePushTokenRequestDto
  ) {
    await notificationsService.deletePushToken(pushTokenRequestDTO);
  }
}
