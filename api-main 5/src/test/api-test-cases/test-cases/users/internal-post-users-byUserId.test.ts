import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userRepository, 'findOne').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite:Post User by user id - internal endpoint', () => {
  test('should be successful with valid parameters', (done) => {
    // creating mock user in the database
    prismaMock.account.findUnique.mockResolvedValue(Constants.TEST_USER);
    //When
    request(testApplication)
      .post('/internal/users/by-user-id')
      .send({ userId: 1 })
      .expect(200, done);
  });
});
