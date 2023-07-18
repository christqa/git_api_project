import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IDeviceActivation } from '@modules/device-activation/device-activation.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get device disconnected endpoint', () => {
  const SAMPLE_DEVICE_ACTIVATION_DATA = {
    ...Constants.SAMPLE_DEVICE_ACTIVATION_DATA,
    deviceInventory: {
      ...Constants.SAMPLE_DEVICE_INVENTORY_DATA,
      groupDevices: [
        {
          ...Constants.SAMPLE_GROUP_DEVICE_DATA,
          group: {
            ...Constants.SAMPLE_GROUP_DATA,
            groupUsers: [
              {
                ...Constants.SAMPLE_GROUP_USER_DATA,
                user: {
                  ...Constants.TEST_USER,
                  profile: {
                    ...Constants.TEST_Profile,
                  },
                  userGuid: '469bfbee-ab95-4b3f-8103-e0bee94082be',
                },
              },
            ],
          },
        },
      ],
    },
  } as IDeviceActivation;
  test('should be successful with valid parameters', (done) => {
    prismaMock.deviceActivation.count.mockResolvedValue(1);
    prismaMock.deviceActivation.findMany.mockResolvedValue([
      SAMPLE_DEVICE_ACTIVATION_DATA,
    ]);
    request(testApplication)
      .get(`/internal/device/disconnected?from=2022-12-14&to=2023-12-15`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            count: 1,
            devices: [
              {
                id: 1,
                deviceSerial: '73b-015-04-2f7',
                deviceName: 'Smart Toilet',
                deviceStatusUpdatedOn:
                  SAMPLE_DEVICE_ACTIVATION_DATA.deviceStatusUpdatedOn?.toISOString(),
                deviceAdmins: [
                  {
                    email: 'test-user@projectspectra.dev',
                    firstName: 'Austin',
                    lastName: 'Gispanski',
                    profileId: 1,
                    userGuid: '469bfbee-ab95-4b3f-8103-e0bee94082be',
                  },
                ],
              },
            ],
          });
          expect(response.status).toEqual(200);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with too many counts', (done) => {
    prismaMock.deviceActivation.count.mockResolvedValue(1001);
    request(testApplication)
      .get(`/internal/device/disconnected?from=2022-12-14&to=2023-12-15`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 413,
            message:
              'Too many disconnected devices, try with smaller date range',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with no counts', (done) => {
    prismaMock.deviceActivation.count.mockResolvedValue(0);
    request(testApplication)
      .get(`/internal/device/disconnected?from=2022-12-14&to=2023-12-15`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 404,
            message: 'Disconnected device not found.',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
