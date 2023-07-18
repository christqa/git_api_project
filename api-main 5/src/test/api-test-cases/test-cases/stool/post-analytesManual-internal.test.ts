import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { getDate } from '../../core/helper';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Post analytes manual', () => {
  test('test case with valid inputs', (done) => {
    const payload = {
      profileId: 1,
      isUrine: true,
      isStool: true,
      date: getDate(new Date()),
      start: getDate(new Date()),
      end: getDate(new Date()),
    };

    request(testApplication)
      .post(`/internal${Constants.MANUAL_ENTER_ENDPOINT}/save`)
      .send(payload)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(204);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
