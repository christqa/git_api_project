import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { EventSource } from '.prisma/client';

const TEST_USER = {
  AccountId: 1,
  userGuid: '397322cd-6405-464f-8fc6-4dc28971ef2f',
  email: 'test-user@projectspectra.dev',
  firstName: 'Austin',
  lastName: 'Gispanski',
};

const SAMPLE_DEVICE_ACTIVATION = {
  id: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.id,
  deviceId: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceId,
  batteryStatus: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.batteryStatus,
  rssi: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.rssi,
  ...TEST_USER,
};
//Generate 9 Different devices
const devices = [SAMPLE_DEVICE_ACTIVATION];
for (let i = 1; i < 9; i++) {
  devices[i] = {
    ...SAMPLE_DEVICE_ACTIVATION,
    deviceId: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceId + i,
    batteryStatus: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.batteryStatus + i,
    rssi: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.rssi + i,
    ...TEST_USER,
  };
}
// Unsorted the given sorted devices so that later could be sorted based on orderBy value either in asc or desc order
for (let i = 1; i < 9; i += 2) {
  const temp = devices[i - 1];
  devices[i - 1] = devices[i];
  devices[i] = temp;
}

describe('API Test Suite: GET ct-admin devices', () => {
  const skip = 0;
  const take = 10;
  const sortBy = 'deviceId';
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
        '"sortBy" must be one of [deviceId, deviceName, deviceSerial, activatedOn, manufacturingDate, activatedBy, lastEventDate], "sortBy" is not allowed to be empty',
    },
    {
      status: 400,
      message:
        '"orderBy" must be one of [asc, desc], "orderBy" is not allowed to be empty',
    },
  ];
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/ct-admin/devices?skip=${skip}&take=${take}`,
    RequestMethod.GET
  );
  mockAuthentication();

  orderBy.forEach((orderBy) => {
    test(`test case with valid params and ${orderBy} order and sortBy ${sortBy}`, (done) => {
      //sorting the devices based on orderBy and sortBy params
      const sortedDevices = devices.sort((a: any, b: any) => {
        if (orderBy == 'asc' && sortBy == 'deviceId') {
          return a.deviceId - b.deviceId;
        } else {
          return b.deviceId - a.deviceId;
        }
      });
      // expected devices to compare with the response body in ascending order
      const expectedDevices_asc = sortedDevices.map(
        (value: any, index: any) => {
          return (value = {
            activatedBy: {
              email: 'test-user@projectspectra.dev',
              firstName: 'Austin',
              lastName: 'Gispanski',
              userGuid: '397322cd-6405-464f-8fc6-4dc28971ef2f',
            },
            batteryPercentage: `${
              Constants.SAMPLE_DEVICE_ACTIVATION_DATA.batteryStatus + index
            }%`,
            connectionStrength: 0 + index,
            lastEvent: {},
          });
        }
      );

      // expected devices to compare with the response body in descending order
      const expectedDevices_desc = sortedDevices.map(
        (value: any, index: any) => {
          return (value = {
            activatedBy: {
              email: 'test-user@projectspectra.dev',
              firstName: 'Austin',
              lastName: 'Gispanski',
              userGuid: '397322cd-6405-464f-8fc6-4dc28971ef2f',
            },
            batteryPercentage: `${
              Constants.SAMPLE_DEVICE_ACTIVATION_DATA.batteryStatus +
              (sortedDevices.length - 1 - index)
            }%`,
            connectionStrength: sortedDevices.length - 1 - index,
            lastEvent: {},
          });
        }
      );
      //the test
      prismaMock.deviceActivation.count.mockResolvedValue(9);
      prismaMock.$queryRawUnsafe.mockResolvedValue(sortedDevices);
      request(testApplication)
        .get(
          `/ct-admin/devices?skip=${skip}&take=${take}&sortBy=${sortBy}&orderBy=${orderBy}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.status).toEqual(200);
            expect(response.body).toEqual({
              total: 9,
              devices:
                orderBy == 'asc' ? expectedDevices_asc : expectedDevices_desc,
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
          `/ct-admin/devices?skip=${value.skip}&take=${value.take}&sortBy=${value.sortBy}&orderBy=${value.orderBy}`
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
      .get(`/ct-admin/devices?take=${take}`)
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
      .get(`/ct-admin/devices?skip=${skip}`)
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
