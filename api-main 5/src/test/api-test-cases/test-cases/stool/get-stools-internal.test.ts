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

describe('API Test Suite: Get Internal stools Endpoint', () => {
  const GET_STOOLS_ENDPOINT = Constants.STOOLS_ENDPOINT;
  const startDateParam = getDate(new Date());
  const endDateParam = getDate(
    new Date(`${new Date().getFullYear() + 1}-12-14T08:38:11Z`)
  );
  const profileId = 1;
  let hasBlood = false;
  const worgnDateParam = '2022-07-16';

  test('success with valid params -  hasBlood = false', (done) => {
    prismaMock.stoolData.findMany.mockResolvedValue([
      Constants.SAMPLE_STOOL_DATA,
    ]);

    //When
    request(testApplication)
      .get(
        `/internal${GET_STOOLS_ENDPOINT}?profileId=${profileId}&startDate=${startDateParam}&endDate=${endDateParam}`
      )
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual([
            {
              ...Constants.SAMPLE_STOOL_DATA,
              createdOn: Constants.SAMPLE_STOOL_DATA.createdOn.toISOString(),
              startDate: Constants.SAMPLE_STOOL_DATA.startDate.toISOString(),
              endDate: Constants.SAMPLE_STOOL_DATA.endDate.toISOString(),
              scoreDate: Constants.SAMPLE_STOOL_DATA.scoreDate.toISOString(),
            },
          ]);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('success with valid params - hasBlood = true', (done) => {
    hasBlood = true;
    const NEW_SAMPLE = Constants.SAMPLE_STOOL_DATA;
    NEW_SAMPLE.hasBlood = true;

    prismaMock.stoolData.findMany.mockResolvedValue([NEW_SAMPLE]);

    request(testApplication)
      .get(
        `/internal${GET_STOOLS_ENDPOINT}?profileId=${profileId}&startDate=${startDateParam}&endDate=${endDateParam}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual([
            {
              ...NEW_SAMPLE,
              createdOn: NEW_SAMPLE.createdOn.toISOString(),
              startDate: NEW_SAMPLE.startDate.toISOString(),
              endDate: NEW_SAMPLE.endDate.toISOString(),
              scoreDate: NEW_SAMPLE.scoreDate.toISOString(),
            },
          ]);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('Returns empty when there is no match', (done) => {
    prismaMock.stoolData.findMany.mockResolvedValue([]);

    request(testApplication)
      .get(
        `/internal${GET_STOOLS_ENDPOINT}?profileId=${profileId}&startDate=${startDateParam}&endDate=${endDateParam}`
      )
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

  test('passing wrong start date ', (done) => {
    request(testApplication)
      .get(
        `/internal${GET_STOOLS_ENDPOINT}?profileId=${profileId}&startDate=${worgnDateParam}&endDate=${endDateParam}`
      )
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

  test('passing wrong end date ', (done) => {
    request(testApplication)
      .get(
        `/internal${GET_STOOLS_ENDPOINT}?profileId=${profileId}&startDate=${startDateParam}&endDate=${worgnDateParam}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"endDate" must be in YYYY-MM-DDTHH:mm:ssZ format'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
