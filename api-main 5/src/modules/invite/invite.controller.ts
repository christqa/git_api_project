import express from 'express';
import httpStatus from 'http-status';
import {
  Body,
  Controller,
  Delete,
  Middlewares,
  Patch,
  Path,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethod } from '../../constants';
import inviteValidation from './invite.validation';
import {
  ICreateInviteRequestDto,
  IDeleteInviteRequestDto,
} from '../invite/dtos/invite.dto';
import { inviteService } from '@modules/index/index.service';
import { IResendInviteResponseDto } from './dtos/resend-invite-response.dto';

@Route('/invites')
@Tags('invites')
@Security(DefaultSecurityMethod, [])
export class InviteController extends Controller {
  /**
   * Creates an invite
   */
  @Post()
  @Middlewares(inviteValidation.validateCreateResendInvite)
  @SuccessResponse(201, 'success')
  async createInvite(
    @Request() request: express.Request,
    @Body() inviteCreateRequestDTO: ICreateInviteRequestDto
  ): Promise<IResendInviteResponseDto> {
    const invitationIds = await inviteService.createOrResendInvite(
      inviteCreateRequestDTO,
      request
    );
    return { invitationIds };
  }

  /**
   * Accepts an invite
   */
  @Patch('/{inviteId}/accept')
  @Middlewares(inviteValidation.validateAcceptRejectInvite)
  @SuccessResponse(200, 'success')
  async acceptInvite(
    @Request() request: express.Request,
    @Path('inviteId') inviteId: string
  ) {
    await inviteService.acceptInvite(inviteId, request.user.userGuid);
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Rejects an invite
   */
  @Patch('/{inviteId}/reject')
  @Middlewares(inviteValidation.validateAcceptRejectInvite)
  @SuccessResponse(200, 'success')
  async rejectInvite(
    @Request() request: express.Request,
    @Path('inviteId') inviteId: string
  ) {
    await inviteService.rejectInvite(inviteId, request.user.userGuid);
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Skips an invite (does not accept nor reject)
   */
  @Patch('/{inviteId}/skip')
  @Middlewares(inviteValidation.validateAcceptRejectInvite)
  @SuccessResponse(200, 'success')
  async skipInvite(
    @Request() request: express.Request,
    @Path('inviteId') inviteId: string
  ) {
    await inviteService.skipInvite(inviteId, request.user.userGuid);
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * Deletes a pending invitation
   */
  @Delete()
  @SuccessResponse(200, 'success')
  @Middlewares(inviteValidation.validateDeleteInvite)
  async removeInvite(
    @Request() request: express.Request,
    @Body() inviteDeleteRequestDTO: IDeleteInviteRequestDto
  ) {
    await inviteService.removeInvite(
      request.user.userGuid,
      inviteDeleteRequestDTO
    );
    return { status: 'success' };
  }
}
