import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { IUser } from '@modules/user/user.type';

const SAMPLE_EVENT = {
  id: 1,
};
//Generate 3 different EVENTS
const events: any = [SAMPLE_EVENT];
for (let i = 1; i < 3; i++) {
  events[i] = {
    id: 1 + i,
  };
}
//Unsorted the given sorted events so that later could be sorted based on orderBy value either in asc or desc order
for (let i = 1; i < 3; i += 2) {
  const temp = events[i - 1];
  events[i - 1] = events[i];
  events[i] = temp;
}

describe('API Test Suite: GET ct-admin events', () => {
  const skip = 0;
  const take = 10;
  const invalid = [
    'invalid skip',
    'invalid take',
    'invalid sortBy',
    'invalid orderBy',
  ];
  const sortBy = 'eventId';
  const orderBy = ['asc', 'desc'];

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
        '"sortBy" must be one of [eventId, deviceId, deviceName, eventSource, generatedOn], "sortBy" is not allowed to be empty',
    },
    {
      status: 400,
      message:
        '"orderBy" must be one of [asc, desc], "orderBy" is not allowed to be empty',
    },
  ];
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/ct-admin/events?skip=${skip}&take=${take}`,
    RequestMethod.GET
  );
  mockAuthentication();

  orderBy.forEach((orderBy) => {
    test(`test case with orderby = ${orderBy} and sortBy = ${sortBy}`, (done) => {
      const sortedEvents = events.sort((a: any, b: any) => {
        if (orderBy == 'asc' && sortBy == 'eventId') {
          return a.id - b.id;
        } else {
          return b.id - a.id;
        }
      });
      // expected events to compare with the response body in ascending order
      const expectedEvents_asc = sortedEvents.map((value: any, index: any) => {
        return (value = {
          id: 1 + index,
        });
      });
      // expected events to compare with the response body in descending order
      const expectedEvents_desc = sortedEvents.map((value: any, index: any) => {
        return (value = {
          id: 1 + (sortedEvents.length - 1 - index),
        });
      });

      prismaMock.events.count.mockResolvedValue(3);
      prismaMock.$queryRawUnsafe.mockResolvedValue(sortedEvents);
      prismaMock.account.findFirst.mockResolvedValue({
        ...Constants.TEST_USER,
        profile: { id: 1 },
      } as IUser);

      request(testApplication)
        .get(
          `/ct-admin/events?skip=${skip}&take=${take}&sortBy=${sortBy}&orderBy=${orderBy}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
              total: 3,
              events:
                orderBy === 'asc' ? expectedEvents_asc : expectedEvents_desc,
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
          `/ct-admin/events?skip=${value.skip}&take=${value.take}&sortBy=${value.sortBy}&orderBy=${value.orderBy}`
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
      .get(`/ct-admin/events?take=${take}`)
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
      .get(`/ct-admin/events?skip=${skip}`)
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
