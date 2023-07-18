import * as express from 'express';
import {
  GetPublicKeyOrSecret,
  JsonWebTokenError,
  JwtHeader,
  Secret,
  SigningKeyCallback,
  verify,
} from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import config from '@core/enviroment-variable-config';
import auth0Config from './auth0-config.json';
import { userService } from '@modules/index/index.service';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '@core/error-handling/error.middleware';
import { dataSharingAgreementAuthMiddleware } from '@modules/data-sharing-agreement/data-sharing-agreement.middleware';
import { IUser } from '@modules/user/user.type';
import { getUserRoles } from '@modules/auth/auth.service';
import { CT_ADMIN_ROLE } from '../../constants';
import { Role } from 'auth0';
import AwsXray from 'aws-xray-sdk';
import logger from '@core/logger/logger';

AwsXray.setDaemonAddress(config.awsXrayDaemonAddress);
// The errors will not be logged for keeping the console clean
AwsXray.setContextMissingStrategy('IGNORE_ERROR');

// Used https://tsoa-community.github.io/docs/authentication.html as a reference

/**
 * This method will be called twice on swagger authenticateMiddleware; auth0/jwt
 */
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes: string[]
): Promise<IUser | undefined> {
  const token = getJwtTokenFromRequest(request);

  const ns1 = AwsXray.getNamespace();
  ns1.createContext();
  const segment = new AwsXray.Segment('auth0');
  ns1.enter(ns1.createContext());
  const subsegment = segment?.addNewSubsegment('expressAuthentication');
  const startTime = Date.now();
  const jwksUri = ['https://', config.auth0Issuer, auth0Config.jwks].join('');

  const client = jwksClient({
    cache: auth0Config.cache,
    rateLimit: auth0Config.rateLimit,
    jwksRequestsPerMinute: auth0Config.jwksRequestsPerMinute,
    jwksUri,
  });
  subsegment?.addMetadata('jwksUri', jwksUri);
  subsegment.addAttribute('start_time', startTime / 1000);

  function getKey(header: JwtHeader, callback: SigningKeyCallback) {
    // eslint-disable-next-line
    client.getSigningKey(header.kid, function (err, key: any) {
      const endTime = Date.now();
      if (err) {
        subsegment?.addError(err);
      }
      subsegment.addAttribute('end_time', endTime / 1000);
      callback(null, key?.getPublicKey());
      subsegment?.addAttribute('in_progress', false);
      subsegment?.flush();
      subsegment?.close();
      segment.close();
    });
  }

  // decode token
  // eslint-disable-next-line
  const decodedToken: any = await decodeToken(token, getKey);

  try {
    // get user roles
    const userRoles = await getUserRoles(decodedToken.sub);

    // get current user
    const { firstName, lastName } = getFirstAndLastName(request, decodedToken);
    const checkEmailPaths: Record<string, boolean> = {
      '/users/me': false,
      '/me/email-verification': false,
    };

    const checkEmail =
      request.path in checkEmailPaths
        ? checkEmailPaths[request.path]
        : config.checkUserEmailIsVerified;

    const currentUser = await getCurrentUser(
      decodedToken.sub,
      userRoles,
      checkEmail,
      firstName,
      lastName
    );

    // user impersonation based on data sharing ID
    const dataSharingId = getDataSharingIdFromRequest(request);
    const impersonatedUser = await dataSharingAgreementAuthMiddleware(
      request,
      scopes,
      dataSharingId,
      currentUser
    );

    // The handler may be abstracted for better RBAC. Do it after moving to AWS Cognito
    if (scopes.includes(CT_ADMIN_ROLE)) {
      const adminRole = userRoles.find((role) => role.name === CT_ADMIN_ROLE);
      if (!adminRole) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'The user is not authorized to access this resource.'
        );
      }
    }

    if (impersonatedUser) {
      impersonatedUser.isEmailVerified = checkEmail;
    } else {
      currentUser.isEmailVerified = checkEmail;
    }
    return impersonatedUser || currentUser;
  } catch (error) {
    // eslint-disable-next-line no-prototype-builtins
    if (typeof error === 'object' && error && error.hasOwnProperty('message')) {
      logger.debug(
        `[expressAuthentication] Got error, ${
          (error as { message: string }).message
        }`
      );
    } else {
      logger.debug(
        `[expressAuthentication] Got error, ${JSON.stringify(error)}`
      );
    }
    throw error instanceof ApiError
      ? error
      : new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          INTERNAL_SERVER_ERROR_MESSAGE
        );
  }
}

function decodeToken(
  token: string | null,
  secretOrPublicKey: Secret | GetPublicKeyOrSecret
) {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new JsonWebTokenError('No token provided'));
      return;
    }
    verify(
      token,
      secretOrPublicKey,
      {
        // audience: config.auth0Audience,
        issuer: `https://${config.auth0Issuer}/`,
      },
      // eslint-disable-next-line
      async function (err: any, decoded: any) {
        if (err) {
          reject(err);
          return;
        }
        resolve(decoded);
      }
    );
  });
}

function getJwtTokenFromRequest(request: express.Request) {
  const authorizationHeaderValue = request.header('Authorization');
  if (!authorizationHeaderValue?.startsWith('Bearer ')) {
    return null;
  }
  return authorizationHeaderValue?.substring(7);
}

function getDataSharingIdFromRequest(request: express.Request) {
  return request.header('Data-Sharing-ID') || null;
}

// eslint-disable-next-line
function getFirstAndLastName(request: express.Request, decodedToken: any) {
  let firstName = undefined;
  let lastName = undefined;
  if ('given_name' in decodedToken) {
    firstName = decodedToken.given_name;
  }
  if ('family_name' in decodedToken) {
    lastName = decodedToken.family_name;
  }
  if (!firstName) {
    firstName = request.get('firstName');
  }
  if (!lastName) {
    lastName = request.get('lastName');
  }
  if (!firstName || !lastName) {
    firstName = '';
    lastName = '';
  }

  return {
    firstName,
    lastName,
  };
}

function getCurrentUser(
  userSub: string,
  userRoles: Role[],
  checkEmail: boolean,
  firstName: string | undefined,
  lastName: string | undefined
) {
  return userService.findMe(
    userSub,
    userRoles,
    checkEmail,
    firstName,
    lastName
  );
}
