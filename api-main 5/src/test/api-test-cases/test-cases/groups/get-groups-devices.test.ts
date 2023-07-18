import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';
import { IDeviceActivationExtended } from '@modules/device-activation/device-activation.type';
import { Status } from '@prisma/client';
import deviceActivationRepository from '@repositories/device-activation.repository';

describe('Test suit: testing groups get devices endpoint', () => {
  const SAMPLE_GROUP_WITH_DEVICIE_INVENTORY = {
    id: 1,
    deviceId: 2,
    deviceFirmwareId: null,
    timeZoneId: 491,
    deviceName: 'Smart Toilet',
    deviceModelId: 1,
    deviceStatus: {},
    batteryStatus: 0,
    wiFiSSID: null,
    rssi: null,
    deviceStatusUpdatedOn: null,
    activatedOn: new Date(),
    activatedBy: 1,
    deactivatedBy: null,
    deleted: null,
    isNotified: false,
    deviceFirmware: null,
    deviceInventory: {
      id: 2,
      deviceSerial: '8ee5d3c6-8c52-4',
      manufacturingDate: new Date(),
      manufacturedForRegion: '',
      deviceModelId: 1,
      bleMacAddress: '',
      wiFiMacAddress: '',
      deviceMetadata: {},
      deviceStatus: 'IN_SERVICE',
    },
  } as IDeviceActivationExtended;

  const SAMPLE_DEVICE_FIRMWARE = {
    id: 1,
    deviceId: 1,
    firmwareId: 1,
    addedOn: new Date(),
    isCurrent: false,
    isNotified: false,
    status: Status.AWAITINGUSERAPPROVAL,
    failureLogs: 'string',
    updateOn: new Date(),
    approvedOn: new Date(),
    firmware: { virtualFirmware: 'string' } as IFirmware,
  } as IDeviceFirmware;

  const groupId = 1;
  const skip = 0;
  const take = 10;
  const date = Constants.SAMPLE_DEVICE_ACTIVATION_DATA.activatedOn;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups/devices?groupId=${groupId}&skip=${skip}&take=${take}`,
    RequestMethod.GET
  );

  test('test case with valid params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findUnique.mockResolvedValueOnce(
      Constants.SAMPLE_GROUP_DATA
    );
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    jest
      .spyOn(deviceActivationRepository, 'findManyActivatedGroupDevices')
      .mockResolvedValue({
        count: 1,
        groupDevices: [SAMPLE_GROUP_WITH_DEVICIE_INVENTORY],
      });
    prismaMock.deviceFirmware.findFirst.mockResolvedValue(
      SAMPLE_DEVICE_FIRMWARE
    );

    request(testApplication)
      .get(`/groups/devices?groupId=${groupId}&skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid groupId', (done) => {
    request(testApplication)
      .get(`/groups/devices?groupId=${'groupId'}&skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"groupId" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid skip', (done) => {
    request(testApplication)
      .get(`/groups/devices?groupId=${groupId}&skip=${'skip'}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"skip" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
  test('test case with invalid take', (done) => {
    request(testApplication)
      .get(`/groups/devices?groupId=${groupId}&skip=${skip}&take=${'take'}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"take" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
  test('test case without groupId', (done) => {
    request(testApplication)
      .get(`/groups/devices?skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"groupId" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without skip', (done) => {
    request(testApplication)
      .get(`/groups/devices?groupId=${groupId}&take=${take}`)
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
  test('test case without take', (done) => {
    request(testApplication)
      .get(`/groups/devices?groupId=${groupId}&skip=${skip}`)
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
