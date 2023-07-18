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

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Update Device Endpoint', () => {
  mockAuthentication();
  const UPDATE_DEVICE_ENDPOINT = Constants.DEVICES_ENDPOINT;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    UPDATE_DEVICE_ENDPOINT,
    RequestMethod.PUT
  );

  test('should be successful with valid parameters', (done) => {
    //Setup

    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValueOnce(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValueOnce(null);
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );
    prismaMock.timeZone.findFirst.mockResolvedValue({
      id: 1,
      text: 'timezone',
      gmt: '+00:00',
    });

    //When
    request(testApplication)
      .put(`${UPDATE_DEVICE_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
        deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
        timeZoneId: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.timeZoneId,
      })

      //Then
      .expect(200, done);
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
    prismaMock.timeZone.findFirst.mockResolvedValue({
      id: 1,
      text: 'timezone',
      gmt: '+00:00',
    });

    //When
    invalidTimeZoneIds.forEach((invalidTimeZoneId) => {
      request(testApplication)
        .post(`${UPDATE_DEVICE_ENDPOINT}`)
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
