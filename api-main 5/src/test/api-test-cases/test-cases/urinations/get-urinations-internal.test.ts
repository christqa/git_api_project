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

describe('API Test Suite: Get Internal Urinations Endpoint', () => {
  const GET_URINATIONS_ENDPOINT = Constants.URINATIONS_ENDPOINT;
  const startDateParam = getDate(new Date());
  const endDateParam = getDate(
    new Date(`${new Date().getFullYear() + 1}-12-14T08:38:11Z`)
  );
  const profileId = 1;
  const type = 'urine';
  const sortOrder = 'asc';
  let firstInDay = false;
  const worgnDateParam = '2022-07-16';

  test('success with valid params -  firstInDay = false', (done) => {
    prismaMock.urineData.findMany.mockResolvedValue([
      Constants.SAMPLE_URINATION_DATA,
    ]);

    //When
    request(testApplication)
      .get(
        `/internal${GET_URINATIONS_ENDPOINT}?profileId=${profileId}&firstInDay=${firstInDay}&startDate=${startDateParam}&endDate=${endDateParam}&type=${type}&sortOrder=${sortOrder}`
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
              ...Constants.SAMPLE_URINATION_DATA,
              concentration:
                Constants.SAMPLE_URINATION_DATA.concentration.toString(),
              createdOn:
                Constants.SAMPLE_URINATION_DATA.createdOn.toISOString(),
              startDate:
                Constants.SAMPLE_URINATION_DATA.startDate.toISOString(),
              endDate: Constants.SAMPLE_URINATION_DATA.endDate.toISOString(),
              scoreDate:
                Constants.SAMPLE_URINATION_DATA.scoreDate.toISOString(),
            },
          ]);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('success with valid params - firstInDay = true', (done) => {
    firstInDay = true;
    const NEW_SAMPLE = Constants.SAMPLE_URINATION_DATA;
    NEW_SAMPLE.firstInDay = true;

    prismaMock.urineData.findMany.mockResolvedValue([NEW_SAMPLE]);

    request(testApplication)
      .get(
        `/internal${GET_URINATIONS_ENDPOINT}?profileId=${profileId}&firstInDay=${firstInDay}&startDate=${startDateParam}&endDate=${endDateParam}&type=${type}&sortOrder=${sortOrder}`
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
              concentration: NEW_SAMPLE.concentration.toString(),
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
    prismaMock.urineData.findMany.mockResolvedValue([]);

    request(testApplication)
      .get(
        `/internal${GET_URINATIONS_ENDPOINT}?profileId=${profileId}&firstInDay=${firstInDay}&startDate=${startDateParam}&endDate=${endDateParam}&type=${type}&sortOrder=${sortOrder}`
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
        `/internal${GET_URINATIONS_ENDPOINT}?profileId=${profileId}&firstInDay=${firstInDay}&startDate=${worgnDateParam}&endDate=${endDateParam}&type=${type}&sortOrder=${sortOrder}`
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
        `/internal${GET_URINATIONS_ENDPOINT}?profileId=${profileId}&firstInDay=${firstInDay}&startDate=${startDateParam}&endDate=${worgnDateParam}&type=${type}&sortOrder=${sortOrder}`
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

  test('passing wrong value to sortOrder', (done) => {
    request(testApplication)
      .get(
        `/internal${GET_URINATIONS_ENDPOINT}?profileId=${profileId}&firstInDay=${firstInDay}&startDate=${startDateParam}&endDate=${endDateParam}&type=${type}&sortOrder=${''}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"sortOrder" must be one of [asc, desc], "sortOrder" is not allowed to be empty'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
