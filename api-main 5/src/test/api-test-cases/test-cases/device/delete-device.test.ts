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

describe('API Test Suite: delete device Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.DEVICES_ENDPOINT}`,
    RequestMethod.DELETE
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );

    //When
    request(testApplication)
      .delete(`${Constants.DEVICES_ENDPOINT}`)
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
          expect(response.status).toBe(204);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
