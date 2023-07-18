import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { IDevicesInventory } from '@modules/device-inventory/device-inventory.type';
import { Status } from '@prisma/client';
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';
import { IDeviceActivationExtended } from '@modules/device-activation/device-activation.type';
import { getDateWithFormat } from '@utils/date.util';
import { DATE_FORMAT_ISO8601 } from '../../../../constants';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Create Device Endpoint', () => {
  mockAuthentication();

  const CREATE_DEVICE_ENDPOINT = Constants.DEVICES_ENDPOINT;
  const SAMPLE_DEVICE_ACTIVATION_DATA = {
    ...Constants.SAMPLE_DEVICE_ACTIVATION_DATA,
    deviceInventory: {
      ...Constants.SAMPLE_DEVICE_INVENTORY_DATA,
    } as IDevicesInventory,
    deviceFirmware: {
      id: 1,
      deviceId: 1,
      firmwareId: 1,
      addedOn: new Date(),
      isCurrent: true,
      isNotified: false,
      status: Status.AWAITINGUSERAPPROVAL,
      failureLogs: '',
      updateOn: new Date(),
      approvedOn: new Date(),
      firmware: {
        id: 1,
        virtualFirmware: 'string',
      } as IFirmware,
    } as IDeviceFirmware,
  } as IDeviceActivationExtended;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    CREATE_DEVICE_ENDPOINT,
    RequestMethod.POST
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupDevices.findFirst.mockResolvedValueOnce(null);
    prismaMock.groupDevices.findFirst.mockResolvedValueOnce(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValueOnce(null);
    prismaMock.deviceActivation.findFirst.mockResolvedValueOnce(
      SAMPLE_DEVICE_ACTIVATION_DATA
    );
    prismaMock.timeZone.findFirst.mockResolvedValue({
      id: 1,
      text: 'timezone',
      gmt: '+00:00',
    });
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.deviceFirmware.findFirst.mockResolvedValue(
      SAMPLE_DEVICE_ACTIVATION_DATA.deviceFirmware
    );
    prismaMock.deviceFirmware.findMany.mockResolvedValue([]);
    prismaMock.firmware.findFirst.mockResolvedValue(
      SAMPLE_DEVICE_ACTIVATION_DATA.deviceFirmware!.firmware
    );

    //When
    request(testApplication)
      .post(`${CREATE_DEVICE_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
        timeZoneId: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.timeZoneId,
        groupId: Constants.SAMPLE_GROUP_DATA.id,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            activatedOn: getDateWithFormat({
              date: SAMPLE_DEVICE_ACTIVATION_DATA.activatedOn,
              format: DATE_FORMAT_ISO8601,
            }),
            batteryPercentage: 12,
            batteryStatus: 'Low',
            connectionStatus: 'No signal',
            deviceName: 'Smart Toilet',
            deviceSerial: '73b-015-04-2f7',
            bleMacAddress: '48-68-28-13-A4-48',
            firmwareVersion: 'string',
            isFwUpdateRequired: true,
            newFirmwareVersion: 'string',
            timeZoneId: 1,
            wiFiSSID: '',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should fail with invalid time-zone id', (done) => {
    //Setup
    const invalidTimeZoneIds = ['x491', false, [89]];

    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );

    //When
    invalidTimeZoneIds.forEach((invalidTimeZoneId) => {
      request(testApplication)
        .post(`${CREATE_DEVICE_ENDPOINT}`)
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .send({
          deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
          deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
          timeZoneId: invalidTimeZoneId,
          groupId: Constants.SAMPLE_GROUP_DATA.id,
        })

        //Then
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.status).toBe(400);
            expect(response.body.message).toBe('"timeZoneId" must be a number');
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });
});
