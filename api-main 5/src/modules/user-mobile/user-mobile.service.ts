import {
  IUserMobileLoginRequestDto,
  IUserMobileLogOutRequestDto,
} from '@modules/user-mobile/dto/user-mobile.index.dto';
import notificationsService from '@modules/notifications/notifications.service';
import userMobileRepository from '@repositories/user-mobile.repository';
import { IUserMobileCreate } from '@modules/user-mobile/user-mobile.type';
import { IPushToken } from '@modules/notifications/push-token.type';
import { deviceTokenNotFound } from '@modules/user-mobile/user-mobile.error';
import { userService } from '@modules/index/index.service';
import { userNotFound } from '@modules/user/user.error';

const findPushToken = async (deviceToken: string): Promise<IPushToken> => {
  const pushToken = await notificationsService.findPushToken({
    deviceToken,
  });
  if (!pushToken) {
    throw deviceTokenNotFound();
  }
  return pushToken;
};

const login = async (
  userLoginRequestData: IUserMobileLoginRequestDto,
  userGuid: string
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const pushToken = await findPushToken(userLoginRequestData.deviceToken);
  await userMobileRepository.upsert({
    pushTokenId: pushToken.id,
    userId,
  } as IUserMobileCreate);
};

const logout = async (
  userLogoutRequestData: IUserMobileLogOutRequestDto
): Promise<void> => {
  // get user from userGuid
  const user = await userService.findByUserGuid(userLogoutRequestData.userGuid);
  if (!user) {
    throw userNotFound();
  }
  const pushToken = await findPushToken(userLogoutRequestData.deviceToken);
  await userMobileRepository.upsert(
    {
      pushTokenId: pushToken.id,
      userId: user.id,
    } as IUserMobileCreate,
    false
  );
};

export { login, logout };
