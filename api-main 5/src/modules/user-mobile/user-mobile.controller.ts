import { Controller, NoSecurity } from '@tsoa/runtime';
import {
  Body,
  Middlewares,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import { login, logout } from './user-mobile.service';
import express from 'express';
import userMobileValidation from '@modules/user-mobile/user-mobile.validation';
import {
  IUserMobileLoginRequestDto,
  IUserMobileLogOutRequestDto,
} from './dto/user-mobile.index.dto';

@Tags('users-mobile')
@Route('/users-mobile')
@Security(DefaultSecurityMethods)
export class UserMobileController extends Controller {
  /**
   * Called by the app
   */
  @Post('/login')
  @SuccessResponse(201, 'success')
  @Middlewares(userMobileValidation.validateUserMobileLogin)
  async UserLogin(
    @Body() userLoginRequestData: IUserMobileLoginRequestDto,
    @Request() request: express.Request
  ) {
    await login(userLoginRequestData, request.user.userGuid);
    return { status: 201, message: 'success' };
  }

  /**
   * Called by the app
   */
  @Post('/logout')
  @SuccessResponse(201, 'success')
  @NoSecurity()
  @Middlewares(userMobileValidation.validateUserMobileLogout)
  async UserLogout(@Body() userLogoutRequestData: IUserMobileLogOutRequestDto) {
    await logout(userLogoutRequestData);
    return { status: 201, message: 'success' };
  }
}
