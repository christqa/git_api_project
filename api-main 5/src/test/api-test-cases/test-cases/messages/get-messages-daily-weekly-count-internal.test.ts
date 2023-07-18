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

describe('API Test Suite: Get Messages Endpoint', () => {
  //setup
  test('testing messages daily count without any messages ', (done) => {
    //setup
    prismaMock.$queryRawUnsafe.mockResolvedValue([]);

    //when
    request(testApplication)
      .get('/internal/messages/daily/count?gmt=%2B03&skip=0&take=10')
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual([]);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing messages weekly count without any messages', (done) => {
    //setup
    prismaMock.$queryRawUnsafe.mockResolvedValue([]);

    //when
    request(testApplication)
      .get('/internal/messages/weekly/count?gmt=%2B03&skip=0&take=10')
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual([]);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
