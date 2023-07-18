import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IDevicesInventory } from '@modules/device-inventory/device-inventory.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { DeviceStatus } from '@prisma/client';
import { getDateWithFormat } from '@utils/date.util';
import { DATE_FORMAT_ISO8601 } from '../../../../constants';

const userObject = generateUser({ id: 2 });
const SAMPLE_DEVICE_INVENTORY_DATA = {
  id: 1,
  deviceSerial: '73b-015-04-2f7',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceModelId: 1,
  bleMacAddress: '48-68-28-13-A4-48',
  wiFiMacAddress: '3E-94-C9-43-2D-D7',
  deviceMetadata: {},
  calibrationFileLocations: {},
  deviceStatus: DeviceStatus.IN_SERVICE,
  deviceActivation: [Constants.SAMPLE_DEVICE_ACTIVATION_DATA],
} as IDevicesInventory;

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  prismaMock.deviceInventory.findFirst.mockResolvedValue(
    SAMPLE_DEVICE_INVENTORY_DATA
  );
});

describe('API Test Suite: Post Internal Device By Serial Endpoint', () => {
  test('test with valid values', (done) => {
    request(testApplication)
      .post(`/internal/device/by-device-serial`)
      .send({
        userGuid: Constants.TEST_USER.userGuid,
        deviceSerial: '73b-015-04-2f7',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            deviceSerial: '73b-015-04-2f7',
            timeZoneOffset: '+00:00',
            deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
            timeZoneId: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.timeZoneId,
            activatedOn: getDateWithFormat({
              date: new Date(),
              format: DATE_FORMAT_ISO8601,
            }),
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid user guid', (done) => {
    request(testApplication)
      .post(`/internal/device/by-device-serial`)
      .send({
        userGuid: '1',
        deviceSerial: '73b-015-04-2f7',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"userGuid" must be a valid GUID'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid serial - 1', (done) => {
    request(testApplication)
      .post(`/internal/device/by-device-serial`)
      .send({
        userGuid: Constants.TEST_USER.userGuid,
        deviceSerial: 73,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"deviceSerial" must be a string'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid serial - 2', (done) => {
    request(testApplication)
      .post(`/internal/device/by-device-serial`)
      .send({
        userGuid: Constants.TEST_USER.userGuid,
        deviceSerial: '73-1',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"deviceSerial" length must be at least 10 characters long'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
