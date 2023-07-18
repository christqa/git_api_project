import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { getDate } from '../../core/helper';
import {
  IStoolFutureData,
  IUrineFutureData,
} from '@modules/analytes-future-data/analytes-future-data.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: PUT Future Data', () => {
  const email = Constants.TEST_USER.email;
  const type1 = 'urine';
  const type2 = 'stool';
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

  const SAMPLE_STOOL_FUTURE_DATA = {
    id: 1,
    color: 1,
    hasBlood: false,
    durationInSeconds: 100,
    consistency: 1,
    startDate: new Date(),
    endDate: new Date(),
    email: Constants.TEST_USER.email,
    used: false,
  } as IStoolFutureData;

  test('test case with valid data for urine future', (done) => {
    //When
    prismaMock.urineFutureData.findFirst.mockRejectedValue(
      SAMPLE_URINE_FUTURE_DATA
    );
    prismaMock.urineFutureData.updateMany.mockResolvedValue({ count: 1 });
    request(testApplication)
      .put(
        `/internal/future-data?email=${email}&type=${type1}&startDate=${startDate}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({ count: 1 });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with valid data for stool future', (done) => {
    //When
    prismaMock.stoolFutureData.findFirst.mockRejectedValue(
      SAMPLE_STOOL_FUTURE_DATA
    );
    prismaMock.stoolFutureData.updateMany.mockResolvedValue({ count: 1 });
    request(testApplication)
      .put(
        `/internal/future-data?email=${email}&type=${type2}&startDate=${startDate}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({ count: 1 });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
