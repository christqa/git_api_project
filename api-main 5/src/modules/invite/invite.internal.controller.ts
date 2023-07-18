import httpStatus from 'http-status';
import {
  Body,
  Controller,
  Middlewares,
  NoSecurity,
  Patch,
  Path,
  Post,
  Query,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethod } from '../../constants';
import inviteInternalValidation from './invite.internal.validation';
import { inviteService } from '@modules/index/index.service';
import { IUpdateInviteCreatedDateRequestDto } from './dtos/update-invite-created-date.dto';

@Route('internal/invites')
@Tags('invites')
@Security(DefaultSecurityMethod, [])
export class InviteInternalController extends Controller {
  /**
   * QA Temporary endpoint
   * @summary QA Temporary endpoint in order to test notifications are sent for pending invitations after 7, 13 days and for expired invitations (14 days)
   */
  @Patch('/{inviteId}')
  @NoSecurity()
  @Middlewares(inviteInternalValidation.validateUpdateInviteCreatedDate)
  @SuccessResponse(200, 'success')
  async updateInviteCreatedDate(
    @Path('inviteId') inviteId: string,
    @Body()
    updateInviteCreatedDateRequestDto: IUpdateInviteCreatedDateRequestDto
  ) {
    await inviteService.updateInviteCreatedDate(
      inviteId,
      updateInviteCreatedDateRequestDto.createdDate,
      updateInviteCreatedDateRequestDto.expiresDate
    );
    return { status: httpStatus.OK, message: 'success' };
  }

  /**
   * called by the cronjob reminder service
   */
  @Post('/reminders/{periodDays}')
  @NoSecurity()
  @Middlewares(inviteInternalValidation.validateRemindersInvite)
  async getReminders(
    @Path('periodDays') periodDays: number,
    @Query('skip') skip: number,
    @Query('take') take: number
  ) {
    const msgs = await inviteService.getRemindersAndSendGroupNotifications(
      periodDays,
      skip,
      take
    );

    if (!msgs) {
      return { status: httpStatus.OK, message: [], invitesLength: 0 };
    }

    return {
      status: httpStatus.OK,
      errorMsgs: msgs['errorMsgs'],
      invitesLength: msgs['invitesLength'],
    };
  }

  /**
   * called by the cronjob invite cleaner service
   */
  @Post('/do-expires/{periodDays}')
  @NoSecurity()
  @Middlewares(inviteInternalValidation.validateDoExpiresInvite)
  async expireNotifications(@Path('periodDays') periodDays: number) {
    await inviteService.invitationsExpireMany(periodDays);

    return {
      status: httpStatus.OK,
    };
  }

  /**
   * called by the cronjob expiry service
   */
  @Post('/expires/{periodDays}')
  @NoSecurity()
  @Middlewares(inviteInternalValidation.validateExpiredInvites)
  async sendNotifExpiredInvites(
    @Path('periodDays') periodDays: number,
    @Query('skip') skip: number,
    @Query('take') take: number
  ) {
    const msgs =
      await inviteService.sendNotificationsForExpiredInvitationsForJoiningGroup(
        periodDays,
        skip,
        take
      );
    return {
      status: httpStatus.OK,
      errorMsgs: msgs['errorMsgs'],
      invitesLength: msgs['invitesLength'],
    };
  }
}
