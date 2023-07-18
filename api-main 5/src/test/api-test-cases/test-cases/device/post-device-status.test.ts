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

describe('API Test Suite: device-status Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.DEVICES_ENDPOINT}`,
    RequestMethod.POST
  );

  test('should be successful with valid parameters - alread_in_use case', (done) => {
    //Setup
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValueOnce(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );

    //When
    request(testApplication)
      .post(`${Constants.DEVICES_ENDPOINT}/status`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
            status: 'already_in_use',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should be successful with valid parameters - invalid_device case', (done) => {
    //When
    request(testApplication)
      .post(`${Constants.DEVICES_ENDPOINT}/status`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            deviceName: '',
            status: 'invalid_device',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should be successful with valid parameters - available case', (done) => {
    //Setup
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );
    //When
    request(testApplication)
      .post(`${Constants.DEVICES_ENDPOINT}/status`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
            status: 'available',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
