import { expressAuthentication } from './auth0-authentication';
import * as express from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '@modules/auth/auth.service';
import * as userService from '@modules/user/user.service';
import * as dataSharingAgreementAuthMiddleware from '@modules/data-sharing-agreement/data-sharing-agreement.middleware';
import { generateUser } from '@test/utils/generate';

const userData = generateUser();
const userDataImpersonated = generateUser();

beforeEach(() => {
  jest.spyOn(userService, 'findMe').mockImplementation(
    // eslint-disable-next-line
    (
      userSub: any,
      userRoles: any[],
      checkEmail: boolean,
      firstName: any,
      lastName: any
    ) => {
      return Promise.resolve({
        ...userData,
        firstName,
        lastName,
        roles: userRoles,
      });
    }
  );
  jest.spyOn(authService, 'getUserRoles').mockResolvedValue([]);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('auth0', () => {
  test('should test expressAuthentication function, with error [no token]', async () => {
    try {
      await expressAuthentication(
        {
          header: (str: string): string | null => {
            return str === 'Authorization' ? null : null;
          },
        } as express.Request,
        'test',
        []
      );
      // eslint-disable-next-line
    } catch (e: any) {
      expect(e.message).toEqual('No token provided');
    }
  });

  test('should test expressAuthentication function, with error [invalid token]', async () => {
    try {
      await expressAuthentication(
        {
          header: (str: string): string | null => {
            return str === 'Authorization' ? 'Bearer test.test.test' : null;
          },
        } as express.Request,
        'test',
        []
      );
      // eslint-disable-next-line
    } catch (e: any) {
      expect(e.message).toEqual('invalid token');
    }
  });

  test('should test expressAuthentication function, with error [jwt malformed]', async () => {
    try {
      await expressAuthentication(
        {
          header: (str: string): string | null => {
            return str === 'Authorization' ? 'Bearer test' : null;
          },
        } as express.Request,
        'test',
        []
      );
      // eslint-disable-next-line
    } catch (e: any) {
      expect(e.message).toEqual('jwt malformed');
    }
  });

  test('should test expressAuthentication function, with error [query error]', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      // eslint-disable-next-line
      jest.fn((token, secretOrPublicKey, options, callback: any) => {
        return callback(null, {
          sub: 'user_id',
          given_name: 'test',
          family_name: 'user',
        });
      })
    );
    jest.spyOn(userService, 'findMe').mockImplementation(
      // eslint-disable-next-line
      (userSub: any, userRoles: any[], firstName: any, lastName: any) => {
        return Promise.reject('unknown error');
      }
    );

    try {
      await expressAuthentication(
        {
          header: (str: string): string | null => {
            return str === 'Authorization' ? `Bearer jwt` : null;
          },
        } as express.Request,
        'test',
        []
      );
      // eslint-disable-next-line
    } catch (e: any) {
      expect(e.status).toEqual(500);
      expect(e.message).toEqual('Something went wrong');
    }
  });

  test('should test expressAuthentication function, with success [firstName,lastName from jwt]', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      // eslint-disable-next-line
      jest.fn((token, secretOrPublicKey, options, callback: any) => {
        return callback(null, {
          sub: 'user_id',
          given_name: 'test',
          family_name: 'user',
        });
      })
    );

    const user = await expressAuthentication(
      {
        header: (str: string): string | null => {
          return str === 'Authorization' ? `Bearer jwt` : null;
        },
      } as express.Request,
      'test',
      []
    );

    expect(user).toEqual({
      ...userData,
      firstName: 'test',
      lastName: 'user',
      roles: [],
    });
  });

  test('should test expressAuthentication function, with success [firstName,lastName from req]', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      // eslint-disable-next-line
      jest.fn((token, secretOrPublicKey, options, callback: any) => {
        return callback(null, { sub: 'user_id' });
      })
    );

    const user = await expressAuthentication(
      {
        header: (str: string): string | null => {
          return str === 'Authorization' ? `Bearer jwt` : null;
        },
        get: (name: string) => {
          if (name === 'firstName') {
            return 'test';
          } else if (name === 'lastName') {
            return 'user';
          }
        },
      } as express.Request,
      'test',
      []
    );

    expect(user).toEqual({
      ...userData,
      firstName: 'test',
      lastName: 'user',
      roles: [],
    });
  });

  test('should test expressAuthentication function, with success [firstName,lastName not found]', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      // eslint-disable-next-line
      jest.fn((token, secretOrPublicKey, options, callback: any) => {
        return callback(null, {
          sub: 'user_id',
        });
      })
    );

    const user = await expressAuthentication(
      {
        header: (str: string): string | null => {
          return str === 'Authorization' ? `Bearer jwt` : null;
        },
        // eslint-disable-next-line
        get: (name: string) => {
          return '';
        },
      } as express.Request,
      'test',
      []
    );

    expect(user).toEqual({
      ...userData,
      firstName: '',
      lastName: '',
      roles: [],
    });
  });

  test('should test expressAuthentication function, with success [data sharing]', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      // eslint-disable-next-line
      jest.fn((token, secretOrPublicKey, options, callback: any) => {
        return callback(null, {
          sub: 'user_id',
        });
      })
    );
    jest
      .spyOn(
        dataSharingAgreementAuthMiddleware,
        'dataSharingAgreementAuthMiddleware'
      )
      .mockResolvedValue(userDataImpersonated);

    const user = await expressAuthentication(
      {
        header: (str: string): string | null => {
          return str === 'Authorization' ? `Bearer jwt` : null;
        },
        // eslint-disable-next-line
        get: (name: string) => {
          return '';
        },
      } as express.Request,
      'test',
      []
    );

    expect(user).toEqual(userDataImpersonated);
  });

  test('should test expressAuthentication function, with error [scope ct-admin with no role]', async () => {
    try {
      jest.spyOn(jwt, 'verify').mockImplementation(
        // eslint-disable-next-line
        jest.fn((token, secretOrPublicKey, options, callback: any) => {
          return callback(null, {
            sub: 'user_id',
          });
        })
      );

      await expressAuthentication(
        {
          header: (str: string): string | null => {
            return str === 'Authorization' ? 'Bearer test' : null;
          },
          // eslint-disable-next-line
          get: (name: string) => {
            return '';
          },
        } as express.Request,
        'test',
        ['ct-admin']
      );
      // eslint-disable-next-line
    } catch (e: any) {
      expect(e.status).toEqual(401);
      expect(e.message).toEqual(
        'The user is not authorized to access this resource.'
      );
    }
  });

  test('should test expressAuthentication function, with success [scope ct-admin with role]', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(
      // eslint-disable-next-line
      jest.fn((token, secretOrPublicKey, options, callback: any) => {
        return callback(null, {
          sub: 'user_id',
        });
      })
    );
    jest
      .spyOn(authService, 'getUserRoles')
      .mockResolvedValue([{ name: 'ct-admin' }]);

    const user = await expressAuthentication(
      {
        header: (str: string): string | null => {
          return str === 'Authorization' ? `Bearer jwt` : null;
        },
        // eslint-disable-next-line
        get: (name: string) => {
          return '';
        },
      } as express.Request,
      'test',
      ['ct-admin']
    );

    expect(user).toEqual({
      ...userData,
      firstName: '',
      lastName: '',
      roles: [
        {
          name: 'ct-admin',
        },
      ],
    });
  });
});
