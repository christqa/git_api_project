import {
  dataPrivacyRemovalRequestService,
  userService,
} from '@modules/index/index.service';
import {
  IUpdateUserProfileRequestDto,
  IGetUserProfileResponseDto,
  IUserDataRemovalRequestDto,
} from './dtos/user.index.dto';
import {
  IGetUserConfigurationResponseDto,
  IUpdateMyConfigurationRequestDto,
} from '../user-configuration/dtos/user-configuration.index.dto';
import {
  getUserConfiguration,
  upsertUserConfiguration,
} from '@modules/user-configuration/user-configuration.service';
import { Controller } from '@tsoa/runtime';
import {
  Body,
  Get,
  Middlewares,
  NoSecurity,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import express from 'express';
import userValidation from '@modules/user/user.validation';
import { DefaultSecurityMethod, DefaultSecurityMethods } from '../../constants';
import {
  passwordReset,
  resendVerificationEmail,
  assembleUserResponse,
} from '@modules/user/user.service';

@Tags('users')
@Route('/users')
@Security(DefaultSecurityMethods)
export class UserController extends Controller {
  // TODO: request should not return the context user object, should be retrieved from database from service layer
  @Get('/me')
  async getMe(
    @Request() request: express.Request
  ): Promise<IGetUserProfileResponseDto> {
    return assembleUserResponse(request.user as IGetUserProfileResponseDto);
  }

  @Put('/me')
  @SuccessResponse(204, 'No Content')
  @Middlewares(userValidation.validateUpdateUserProfile)
  async updateMe(
    @Request() request: express.Request,
    @Body() updateMeRequestDto: IUpdateUserProfileRequestDto
  ) {
    await userService.update(request.user, updateMeRequestDto);
  }

  @Middlewares(userValidation.validateGetUserConfiguration)
  @Get('/me/scoring-configuration')
  async getMyConfiguration(
    @Request() request: express.Request,
    @Query() profileId?: number
  ): Promise<IGetUserConfigurationResponseDto | null> {
    return getUserConfiguration(request.user.userGuid, profileId);
  }

  @Post('/me/email-verification')
  async resendVerificationEmail(@Request() request: express.Request) {
    await resendVerificationEmail(request.user);
  }

  @Post('/{email}/password-reset')
  @NoSecurity()
  @SuccessResponse(201, 'No Content')
  @Middlewares(userValidation.validateResetEmailConfiguration)
  async userPasswordReset(@Path('email') email: string) {
    await passwordReset(email);
    return { status: 201, message: 'success' };
  }

  @Post('/me/data-removal-requests')
  @Security(DefaultSecurityMethod, [])
  @SuccessResponse(201, 'success')
  @Middlewares(userValidation.validateUserDataRemovalRequest)
  async userDataRemovalRequest(
    @Body() userDataRemovalRequest: IUserDataRemovalRequestDto,
    @Request() request: express.Request
  ) {
    await dataPrivacyRemovalRequestService.dataPrivacyRemovalRequest(
      userDataRemovalRequest,
      request.user
    );
    return { status: 201, message: 'success' };
  }
}
