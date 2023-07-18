import { mockAuthentication } from '@test/api-test-cases/core/authentication';
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

describe('Test Suite: Get Status', () => {
  mockAuthentication();

  test('should return status 200', (done) => {
    request(testApplication).get('/status').expect(200, done);
  });
});
