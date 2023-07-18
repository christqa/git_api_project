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
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import {
  getUserByProfileId,
  getUserByDeviceSerial,
  getUserByUserId,
  getAllUsers,
  findProfileDeviceSerialByEmail,
  getUsersByDeviceTZ,
} from '@modules/user/user.service';
import userInternalValidation from '@modules/user/user.internal.validation';
import {
  IGetProfileDeviceSerialInternalResponseDto,
  IGetUserByProfileIdRequestDto,
  IGetUserByProfileIdResponseDto,
  IGetUserByUserIdRequestDto,
  IGetUsersByDeviceTZResponseDto,
  IGetUsersInternalResponseDto,
} from './dtos/internal.dto';
import { IUpdateMyConfigurationRequestDto } from '../user-configuration/dtos/user-configuration.index.dto';
import userValidation from '@modules/user/user.validation';
import { upsertUserConfiguration } from '@modules/user-configuration/user-configuration.service';
@Tags('users')
@Route('internal/users')
@Security(DefaultSecurityMethods)
export class UserInternalController extends Controller {
  /**
   *
   * Called by hydration service. Gets a user by device serial
   */
  @Get('/by-device-serial')
  @NoSecurity()
  @Middlewares(userInternalValidation.validateGetUserByDeviceSerial)
  getUserByDeviceSerialNumber(@Query('deviceSerial') deviceSerial: string) {
    return getUserByDeviceSerial(deviceSerial);
  }

  /**
   *
   * Called by the event consumer device event message gen
   */
  @Post('/by-profile')
  @NoSecurity()
  @Middlewares(userInternalValidation.validateGetUserByProfileId)
  getUserByProfileId(
    @Body() getUserByProfileIdRequestDto: IGetUserByProfileIdRequestDto
  ): Promise<IGetUserByProfileIdResponseDto> {
    return getUserByProfileId(getUserByProfileIdRequestDto.profileId);
  }

  /**
   *
   * Called by the event consumer gut health service
   */
  @Post('/by-user-id')
  @NoSecurity()
  @Middlewares(userInternalValidation.validateGetUserByUserId)
  getUserByUserId(
    @Body() getUserByProfileIdRequestDto: IGetUserByUserIdRequestDto
  ) {
    return getUserByUserId(getUserByProfileIdRequestDto.userId);
  }

  /**
   *
   * Called by the consumers
   */
  @Get()
  @NoSecurity()
  @Middlewares(userInternalValidation.validateGetAllUsers)
  getAllUsers(
    @Query() skip: number,
    @Query() take: number
  ): Promise<IGetUsersInternalResponseDto> {
    return getAllUsers(skip, take);
  }

  /**
   *
   * Called by the Qa-Tools urinations
   */
  @Get('/profile/device-serial/{email}')
  @NoSecurity()
  @Middlewares(userInternalValidation.validateGetUserProfile)
  getUserProfileDeviceSerialByEmail(
    @Path() email: string
  ): Promise<IGetProfileDeviceSerialInternalResponseDto> {
    return findProfileDeviceSerialByEmail(email);
  }

  /**
   *
   * Called by the scheduled-job daily-weekly-notifications
   */
  @Get('/{deviceTimeZone}')
  @NoSecurity()
  @Middlewares(userInternalValidation.validateGetUsersByDeviceTZ)
  getUsersByDeviceTimeZone(
    @Path() deviceTimeZone: string,
    @Query() skip: number,
    @Query() take: number
  ): Promise<IGetUsersByDeviceTZResponseDto[]> {
    return getUsersByDeviceTZ(deviceTimeZone, skip, take);
  }

  @Put('/qa/{profileId}/configuration')
  @NoSecurity()
  @SuccessResponse(204, 'No Content')
  @Middlewares(userValidation.validateUpdateUserConfiguration)
  async updateMyConfiguration(
    @Path('profileId') profileId: number,
    @Body() dto: IUpdateMyConfigurationRequestDto
  ): Promise<void> {
    await upsertUserConfiguration(profileId, dto);
  }
}
