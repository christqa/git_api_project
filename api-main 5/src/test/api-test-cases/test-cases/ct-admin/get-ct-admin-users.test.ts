import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';

const SAMPLE_USER = {
  email: Constants.TEST_USER.email,
  firstName: Constants.TEST_USER.firstName,
  lastName: Constants.TEST_USER.lastName,
  groupDevicesCount: 1,
};
//Generate 4 different users
const users = [SAMPLE_USER];
for (let i = 1; i < 4; i++) {
  users[i] = {
    ...SAMPLE_USER,
    email: i + Constants.TEST_USER.email,
    firstName: Constants.TEST_USER.firstName + i,
    lastName: Constants.TEST_USER.lastName + i,
    groupDevicesCount: 1 + i,
  };
}
// Unsort the given sorted users so that later could be sorted based on orderBy value either in asc or desc order
for (let i = 1; i < 4; i += 2) {
  const temp = users[i - 1];
  users[i - 1] = users[i];
  users[i] = temp;
}

describe('API Test Suite: GET ct-admin users', () => {
  const skip = 0;
  const take = 10;
  const sortBy = 'numberOfActiveDevices';
  const orderBy = ['asc', 'desc'];

  const invalid = [
    'invalid skip',
    'invalid take',
    'invalid sortBy',
    'invalid orderBy',
  ];

  const invalidParams = [
    { skip: '', take: take, sortBy: sortBy, orderBy: orderBy[0] },
    { skip: skip, take: '', sortBy: sortBy, orderBy: orderBy[0] },
    { skip: skip, take: take, sortBy: '', orderBy: orderBy[0] },
    { skip: skip, take: take, sortBy: sortBy, orderBy: '' },
  ];

  const errors = [
    { status: 400, message: '"skip" must be a number' },
    { status: 400, message: '"take" must be a number' },
    {
      status: 400,
      message:
        '"sortBy" must be one of [firstName, lastName, email, numberOfActiveDevices, userGuid], "sortBy" is not allowed to be empty',
    },
    {
      status: 400,
      message:
        '"orderBy" must be one of [asc, desc], "orderBy" is not allowed to be empty',
    },
  ];
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/ct-admin/users?skip=${skip}&take=${take}`,
    RequestMethod.GET
  );
  mockAuthentication();

  orderBy.forEach((orderBy) => {
    //sorting the users based on orderBy and sortBy params
    test(`test case with valid params and ${orderBy} order and sortBy ${sortBy}`, (done) => {
      const sortedUser = users.sort((a: any, b: any) => {
        if (orderBy == 'asc' && sortBy == 'numberOfActiveDevices') {
          return a.groupDevicesCount - b.groupDevicesCount;
        } else {
          return b.groupDevicesCount - a.groupDevicesCount;
        }
      });
      const expectedAccounts_asc = sortedUser.map((value: any, index: any) => {
        return (value = {
          totalDevices: 1 + index,
          email: (index === 0 ? '' : index) + Constants.TEST_USER.email,
          firstName: Constants.TEST_USER.firstName + (index === 0 ? '' : index),
          lastName: Constants.TEST_USER.lastName + (index === 0 ? '' : index),
        });
      });
      // expected events to compare with the response body in descending order
      const expectedAccounts_desc = sortedUser.map((value: any, index: any) => {
        return (value = {
          totalDevices: 1 + (sortedUser.length - 1 - index),
          email:
            (sortedUser.length - 1 - index === 0
              ? ''
              : sortedUser.length - 1 - index) + Constants.TEST_USER.email,
          firstName:
            Constants.TEST_USER.firstName +
            (sortedUser.length - 1 - index === 0
              ? ''
              : sortedUser.length - 1 - index),
          lastName:
            Constants.TEST_USER.lastName +
            (sortedUser.length - 1 - index === 0
              ? ''
              : sortedUser.length - 1 - index),
        });
      });
      prismaMock.account.count.mockResolvedValue(4);
      prismaMock.$queryRawUnsafe.mockResolvedValue(sortedUser);
      request(testApplication)
        .get(
          `/ct-admin/users?skip=${skip}&take=${take}&sortBy=${sortBy}&orderBy=${orderBy}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
              total: 4,
              accounts:
                orderBy === 'asc'
                  ? expectedAccounts_asc
                  : expectedAccounts_desc,
            });
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });

  invalidParams.map((value, index) => {
    test(`test case invalid ${invalid[index]}`, (done) => {
      request(testApplication)
        .get(
          `/ct-admin/users?skip=${value.skip}&take=${value.take}&sortBy=${value.sortBy}&orderBy=${value.orderBy}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body).toEqual(errors[index]);
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });

  test(`test case without skip`, (done) => {
    request(testApplication)
      .get(`/ct-admin/users?take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"skip" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test(`test case without take`, (done) => {
    request(testApplication)
      .get(`/ct-admin/users?skip=${skip}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"take" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
