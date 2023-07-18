import * as express from 'express';
import ApiError from '@core/error-handling/api-error';

import { UNAUTHORIZED } from 'http-status';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '@core/error-handling/error.middleware';
import * as Authentication from '@core/authentication/auth0-authentication';

import * as Constants from './constants';
import { IUser } from '@modules/user/user.type';

const expressAuthentication = jest.spyOn(
  Authentication,
  'expressAuthentication'
);

export const mockAuthentication = () => {
  beforeAll(() => {
    expressAuthentication.mockImplementation(
      (request: express.Request): Promise<IUser> => {
        return new Promise((resolve, reject) => {
          if (
            request.header(Constants.AUTHORIZATION_REQUEST_KEY) ==
            Constants.VALID_TOKEN
          ) {
            resolve(Constants.TEST_USER);
          } else {
            reject(new ApiError(UNAUTHORIZED, INTERNAL_SERVER_ERROR_MESSAGE));
          }
        });
      }
    );
  });
};
