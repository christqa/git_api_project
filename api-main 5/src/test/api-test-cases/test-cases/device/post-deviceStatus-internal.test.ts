import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Post Internal Device Status Endpoint', () => {
  test('test with valid parameters', (done) => {
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValueOnce(
      Constants.SAMPLE_GROUP_DEVICE_DATA
    );
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

    request(testApplication)
      .post(`/internal/device/status`)
      .send({
        deviceSerial: '73b-015-04-2f7',
      })
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

  test('test case with invalid serial - 1', (done) => {
    request(testApplication)
      .post(`/internal/device/status`)
      .send({
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
      .post(`/internal/device/status`)
      .send({
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
