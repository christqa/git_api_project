import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '@core/error-handling/api-error';
import { IUser } from '@modules/user/user.type';
import { PermissionTypes } from '@modules/invite/invite.type';
import {
  dataSharingAgreementService,
  userService,
} from '@modules/index/index.service';
import config from '@core/enviroment-variable-config';

const FORBIDDEN_DATA_SHARING_MESSAGE =
  'Data sharing user has no permission to access this section';

async function dataSharingAgreementAuthMiddleware(
  request: Request,
  scopes: string[],
  dataSharingId: string | null,
  currentUser: IUser
): Promise<IUser | undefined> {
  // check required data
  if (!dataSharingId || !currentUser) {
    return;
  }

  // get data sharing agreement
  const foundDataSharingAgreement =
    await dataSharingAgreementService.getDataSharingAgreement(
      currentUser.userGuid,
      dataSharingId
    );
  if (!foundDataSharingAgreement?.fromUser?.authId) {
    return;
  }

  // determine/check data sharing permissions
  const dataSharingPermissions = scopes.filter((scope) =>
    foundDataSharingAgreement.permissions.includes(scope as PermissionTypes)
  );
  if (!dataSharingPermissions.length) {
    throw new ApiError(httpStatus.FORBIDDEN, FORBIDDEN_DATA_SHARING_MESSAGE);
  }

  // translate request method to permission type e.g. GET = read
  let requestMethodPermission;
  switch (request.method) {
    case 'GET':
      requestMethodPermission = PermissionTypes.read;
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      requestMethodPermission = PermissionTypes.write;
      break;
    case 'DELETE':
      requestMethodPermission = PermissionTypes.delete;
      break;
    default:
      break;
  }

  // check if user has access to requested method
  if (
    !requestMethodPermission ||
    !dataSharingPermissions.includes(requestMethodPermission)
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, FORBIDDEN_DATA_SHARING_MESSAGE);
  }

  const checkEmailPaths: Record<string, boolean> = {
    '/users/me': false,
    '/me/email-verification': false,
  };

  const checkEmail =
    request.path in checkEmailPaths
      ? checkEmailPaths[request.path]
      : config.checkUserEmailIsVerified;

  // return impersonated user
  request.authenticatedUser = currentUser;
  return userService.findMe(
    foundDataSharingAgreement.fromUser.authId,
    currentUser.roles,
    checkEmail
  );
}

export { dataSharingAgreementAuthMiddleware };
