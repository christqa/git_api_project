import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { getDate } from '../../core/helper';
import { IUrineFutureData } from '@modules/analytes-future-data/analytes-future-data.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: GET Future Data', () => {
  const email = Constants.TEST_USER.email;
  const type = 'urine';
  const startDate = getDate(new Date());

  const SAMPLE_URINE_FUTURE_DATA = {
    id: 1,
    color: 1,
    durationInSeconds: 100,
    concentration: Constants.SAMPLE_URINATION_DATA.concentration,
    startDate: new Date(),
    endDate: new Date(),
    email: Constants.TEST_USER.email,
    used: false,
  } as IUrineFutureData;

  test('test case with valid data', (done) => {
    //When
    prismaMock.urineFutureData.count.mockResolvedValue(1);
    prismaMock.urineFutureData.findMany.mockResolvedValue([
      SAMPLE_URINE_FUTURE_DATA,
    ]);
    request(testApplication)
      .get(
        `/internal/future-data?email=${email}&type=${type}&startDate=${startDate}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            count: 1,
            data: [
              {
                id: 1,
                color: 1,
                durationInSeconds: 100,
                concentration: 1.1,
                startDate: SAMPLE_URINE_FUTURE_DATA.startDate.toISOString(),
                endDate: SAMPLE_URINE_FUTURE_DATA.endDate.toISOString(),
                email: 'test-user@projectspectra.dev',
                used: false,
              },
            ],
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with valid data', (done) => {
    //When
    prismaMock.urineFutureData.count.mockResolvedValue(1);
    prismaMock.urineFutureData.findMany.mockResolvedValue([
      { ...SAMPLE_URINE_FUTURE_DATA, used: true },
    ]);
    request(testApplication)
      .get(
        `/internal/future-data?email=${email}&type=${type}&startDate=${startDate}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            count: 1,
            data: [
              {
                id: 1,
                color: 1,
                durationInSeconds: 100,
                concentration: 1.1,
                startDate: SAMPLE_URINE_FUTURE_DATA.startDate.toISOString(),
                endDate: SAMPLE_URINE_FUTURE_DATA.endDate.toISOString(),
                email: 'test-user@projectspectra.dev',
                used: true,
              },
            ],
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid date', (done) => {
    request(testApplication)
      .get(`/internal/future-data?email=${email}&type=${type}&startDate=a`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"startDate" must be in YYYY-MM-DDTHH:mm:ssZ format'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid email', (done) => {
    request(testApplication)
      .get(`/internal/future-data?email=a&type=${type}&startDate=${startDate}`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"email" must be a valid email'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid email', (done) => {
    request(testApplication)
      .get(
        `/internal/future-data?email=${email}&type=${1}&startDate=${startDate}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"type" must be one of [urine, stool]'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
