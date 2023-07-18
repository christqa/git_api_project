import {
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import express from 'express';
import messagesValidation from '@modules/messages/messages.validation';
import {
  findMessageByGuid,
  findMessages,
  markAllMessagesAsRead,
  messageMarkAsRead,
  removeMessage,
} from './messages.service';
import {
  IGetMessageByGuidRequestDto,
  IGetMessageByGuidResponseDto,
  IGetMessagesResponseDto,
} from './dtos/messages.index.dto';

@Route('/messages')
@Tags('messages')
@Security(DefaultSecurityMethods)
export class MessagesController extends Controller {
  /**
   * Gets messages
   */
  @Get()
  @Middlewares(messagesValidation.validateGetMessages)
  async getMessages(
    @Request() request: express.Request,
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('read') read?: boolean,
    @Query('deleted') deleted?: boolean,
    @Query('messageTypeId') messageTypeId?: number
  ): Promise<IGetMessagesResponseDto> {
    return findMessages(
      {
        skip,
        read,
        take,
        messageTypeId,
        startDate,
        endDate,
        deleted,
      } as IGetMessageByGuidRequestDto,
      request.user.userGuid
    );
  }

  /**
   * gets a message based on guid
   */
  @Get('/{messageGuid}')
  @Middlewares(messagesValidation.validateGetMessage)
  async getMessageByGuid(
    @Request() request: express.Request,
    @Path('messageGuid') messageGuid: string
  ): Promise<IGetMessageByGuidResponseDto> {
    return findMessageByGuid(messageGuid, request.user.userGuid);
  }

  /**
   * marks a message based on guid as read
   */
  @Patch('/{messageGuid}/read')
  @Middlewares(messagesValidation.validateMarkAsReadMessage)
  async markAsRead(
    @Request() request: express.Request,
    @Path('messageGuid') messageGuid: string
  ) {
    await messageMarkAsRead(messageGuid, request.user.userGuid);
  }

  /**
   * Deletes a message
   */
  @Delete('/{messageGuid}')
  @Middlewares(messagesValidation.validateDeleteMessage)
  async deleteMessage(
    @Request() request: express.Request,
    @Path('messageGuid') messageGuid: string
  ) {
    await removeMessage(messageGuid, request.user.userGuid);
  }

  /**
   * Marks all as read
   */
  @Put('/mark-all-as-read')
  async markAllAsRead(@Request() request: express.Request) {
    await markAllMessagesAsRead(request.user.userGuid);
  }
}
