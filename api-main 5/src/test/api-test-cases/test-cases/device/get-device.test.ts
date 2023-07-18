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
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';
import { IDeviceActivationExtended } from '@modules/device-activation/device-activation.type';
import { getDateWithFormat } from '@utils/date.util';
import { Status } from '@prisma/client';
import { DATE_FORMAT_ISO8601 } from '../../../../constants';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Device Endpoint', () => {
  mockAuthentication();

  const GET_DEVICE_ACTIVATION_ENDPOINT = `${Constants.DEVICES_ENDPOINT}/active`;
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
    `${GET_DEVICE_ACTIVATION_ENDPOINT}/${Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial}`,
    RequestMethod.GET
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      SAMPLE_DEVICE_ACTIVATION_DATA
    );

    //When
    request(testApplication)
      .get(
        `${GET_DEVICE_ACTIVATION_ENDPOINT}/${Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial}`
      )
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
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
            bleMacAddress: '48-68-28-13-A4-48',
            deviceName: 'Smart Toilet',
            deviceSerial: '73b-015-04-2f7',
            firmwareVersion: 'string',
            isFwUpdateRequired: false,
            newFirmwareVersion: null,
            timeZoneId: 1,
            wiFiSSID: '',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should fail with user without linked device', (done) => {
    //Setup
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValue(null);
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      SAMPLE_DEVICE_ACTIVATION_DATA
    );

    //When
    request(testApplication)
      .get(
        `${GET_DEVICE_ACTIVATION_ENDPOINT}/${Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial}`
      )
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(401);
          expect(response.body.message).toEqual(
            'You don`t have permissions for this operation'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
