import {
  Body,
  Controller,
  Get,
  Middlewares,
  NoSecurity,
  Post,
  Query,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import messagesInternalValidation from '@modules/messages/messages.internal.validation';
import * as messagesService from './messages.service';
import { CreateMessagesInternalRequestDto } from './dtos/messages.index.dto';
import { NotificationSettingsOptions } from '@modules/notification-settings/notification-settings.type';
import { IGetMessagesCountResponseDto } from './dtos/internal.dto';

@Route('/internal/messages')
@Tags('messages')
@Security(DefaultSecurityMethods)
export class MessagesInternalController extends Controller {
  @NoSecurity()
  @Post()
  @Middlewares(messagesInternalValidation.validateCreateMessageInternal)
  async createMessage(
    @Body() createMessageInternalRequestDto: CreateMessagesInternalRequestDto
  ) {
    await messagesService.createMessageInternal(
      createMessageInternalRequestDto
    );
  }

  /**
   * Get the daily count of messages, used by the daily-weekly-notifications job
   * @summary Get the daily count of messages, used by the daily-weekly-notifications job
   */
  @Get('/daily/count')
  @Middlewares(messagesInternalValidation.validateGetMessagesInternal)
  @NoSecurity()
  async getDailyMessagesCount(
    @Query('gmt') gmt: string,
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('push') push?: boolean,
    @Query('sms') sms?: boolean
  ): Promise<IGetMessagesCountResponseDto[]> {
    return messagesService.findMessagesCountByPeriod(
      gmt,
      1,
      skip,
      take,
      NotificationSettingsOptions.daily,
      push,
      sms
    );
  }

  /**
   * Get the weekly count of messages, used by the daily-weekly-notifications job
   * @summary Get the weekly count of messages, used by the daily-weekly-notifications job
   */
  @Get('/weekly/count')
  @Middlewares(messagesInternalValidation.validateGetMessagesInternal)
  @NoSecurity()
  async getWeeklyMessagesCount(
    @Query('gmt') gmt: string,
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('push') push?: boolean,
    @Query('sms') sms?: boolean
  ): Promise<IGetMessagesCountResponseDto[]> {
    return messagesService.findMessagesCountByPeriod(
      gmt,
      7,
      skip,
      take,
      NotificationSettingsOptions.weekly,
      push,
      sms
    );
  }
}
