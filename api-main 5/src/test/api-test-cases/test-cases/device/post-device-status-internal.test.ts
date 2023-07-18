import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { Status } from '@prisma/client';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Post Internal Device Status Endpoint', () => {
  const firmware = {
    id: 1,
    deviceId: 1,
    firmwareId: 1,
    addedOn: new Date(),
    isCurrent: false,
    isNotified: false,
    status: Status.AWAITINGUSERAPPROVAL, // newly added field in the device firmware table
    failureLogs: '', // newly added field in the device firmware table
    updateOn: new Date(), // newly added field in the device firmware table
    approvedOn: new Date(), // newly added field in the device firmware table
    firmware: {
      id: 1,
      virtualFirmware: 'string',
    } as IFirmware,
  } as IDeviceFirmware;

  test('test with valid parameters', (done) => {
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );
    prismaMock.deviceFirmware.findFirst.mockResolvedValue(firmware);

    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        batteryStatus: 1,
        firmwareVersion: 'string',
        wiFiSSID: 'string',
        signalStrength: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({ status: 200, message: 'success' });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test with invalid device serial - 1', (done) => {
    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: 'string',
        batteryStatus: 1,
        firmwareVersion: 'string',
        wiFiSSID: 'string',
        signalStrength: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message:
              '"deviceSerial" length must be at least 10 characters long',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test with invalid device serial - 2', (done) => {
    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: 80,
        batteryStatus: 1,
        firmwareVersion: 'string',
        wiFiSSID: 'string',
        signalStrength: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"deviceSerial" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test with invalid battery status', (done) => {
    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        batteryStatus: -1,
        firmwareVersion: 'string',
        wiFiSSID: 'string',
        signalStrength: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"batteryStatus" must be greater than or equal to 0',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test with invalid firmareVersion', (done) => {
    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        batteryStatus: 0,
        firmwareVersion: 12,
        wiFiSSID: 'string',
        signalStrength: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"firmwareVersion" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test with invalid wiFISSID', (done) => {
    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        batteryStatus: 0,
        firmwareVersion: '12',
        wiFiSSID: 12,
        signalStrength: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"wiFiSSID" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test with invalid signal strength', (done) => {
    request(testApplication)
      .post(`/internal/device/device-status`)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        batteryStatus: 0,
        firmwareVersion: '12',
        wiFiSSID: '12.1',
        signalStrength: 'string',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"signalStrength" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
