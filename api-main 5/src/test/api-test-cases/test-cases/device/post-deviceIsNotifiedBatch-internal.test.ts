import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Post Internal set-is-notified-batch endpoint', () => {
  test('test with valid parameters', (done) => {
    prismaMock.deviceActivation.updateMany.mockResolvedValue({ count: 1 });

    request(testApplication)
      .post(`/internal/device/set-is-notified-batch`)
      .send({
        devices: [
          {
            deviceActivationId: 1,
          },
        ],
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            updatedDeviceCount: 1,
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
