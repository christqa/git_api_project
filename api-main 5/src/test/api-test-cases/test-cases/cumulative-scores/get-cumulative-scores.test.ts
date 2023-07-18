import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import moment from 'moment';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import { mockAuthentication } from '../../core/authentication';
import * as profileService from '@modules/profile/profile.service';
import { IProfile } from '@modules/profile/profile.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { response } from 'express';
import { DATE_FORMAT_ISO8601 } from '../../../../constants';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Cumulative Scores Endpoint', () => {
  mockAuthentication();

  const GET_CUMULATIVE_SCORES_ENDPOINT =
    Constants.CUMULATIVE_SCORES_ENDPOINT + 's';

  verifyEndpointFailsWithoutAuthenticationTestCase(
    GET_CUMULATIVE_SCORES_ENDPOINT,
    RequestMethod.GET
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    const groupByParam = 'day';
    const typeParam = 'hydration';
    const endDateParam =
      moment(new Date()).format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
    const startDateParam =
      moment(new Date()).format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';

    prismaMock.cumulativeScore.findMany.mockResolvedValue([
      Constants.SAMPLE_CUMULATIVE_SCORE_DATA,
    ]);

    prismaMock.cumulativeScore.count.mockResolvedValue(1);
    prismaMock.urineData.findMany.mockResolvedValue([
      Constants.SAMPLE_URINATION_DATA,
    ]);

    jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);

    jest.spyOn(profileService, 'findProfileByUserGuid').mockResolvedValue({
      id: 1,
    } as IProfile);

    //When
    request(testApplication)
      .get(
        `${GET_CUMULATIVE_SCORES_ENDPOINT}?groupBy=${groupByParam}&type=${typeParam}&endDate=${endDateParam}&startDate=${startDateParam}`
      )
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toBe(200);
          expect(response.body.hydration.total).toBe(1);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should fail with invalid groupBy Parameter', (done) => {
    //Setup
    const invalidGroupByParams = ['dayX', 'week', 30];
    const typeParam = 'hydration';
    const endDateParam =
      moment(new Date()).format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
    const startDateParam =
      moment(new Date()).format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';

    //When
    invalidGroupByParams.forEach(() => {
      request(testApplication)
        .get(
          `${GET_CUMULATIVE_SCORES_ENDPOINT}?groupBy=${invalidGroupByParams}&type=${typeParam}&endDate=${endDateParam}&startDate=${startDateParam}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

        //Then
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.status).toBe(400);
            expect(response.body.message).toBe(
              '"groupBy" must be one of [day, month]'
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });

  test('should fail with invalid type parameter', (done) => {
    //Setup
    const groupByParam = 'month';
    const invalidTypeParams = ['hydr@tion', 'yutHealth', 9];
    const endDateParam =
      moment(new Date()).format(DATE_FORMAT_ISO8601).split('.') + 'Z';
    const startDateParam =
      moment(new Date()).format('MM/DD/YYYY').split('.') + 'Z';

    //When
    invalidTypeParams.forEach((invalidTypeParam) => {
      request(testApplication)
        .get(
          `${GET_CUMULATIVE_SCORES_ENDPOINT}?groupBy=${groupByParam}&type=${invalidTypeParam}&endDate=${endDateParam}&startDate=${startDateParam}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

        //Then
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.status).toBe(400);
            expect(response.body.message).toBe(
              '"type" must be one of [hydration, gutHealth], "startDate" must be in YYYY-MM-DDTHH:mm:ssZ format, "endDate" must be in YYYY-MM-DDTHH:mm:ssZ format'
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });

  test('should fail with invalid dates', (done) => {
    //Setup
    const groupByParam = 'month';
    const invalidTypeParam = 'gutHealth';
    const invalidDateParams = ['2022/08/03', 23, false];

    //When
    invalidDateParams.forEach((invalidDateParam) => {
      request(testApplication)
        .get(
          `${GET_CUMULATIVE_SCORES_ENDPOINT}?groupBy=${groupByParam}&type=${invalidTypeParam}&endDate=${invalidDateParam}&startDate=${invalidDateParam}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

        //Then
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.status).toBe(400);
            expect(response.body.message).toBe(
              '"startDate" must be in YYYY-MM-DDTHH:mm:ssZ format, "endDate" must be in YYYY-MM-DDTHH:mm:ssZ format'
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });
});
