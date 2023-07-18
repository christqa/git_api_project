import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { IProfile } from '@modules/profile/profile.type';
import { generateProfile, generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import profileRepository from '@repositories/profile.repository';
import { userService } from '@modules/index/index.service';
import moment from 'moment';
import { DATE_FORMAT_ISO8601 } from '../../../../constants';

const userObject = generateUser({ id: 2 });
const profileObject = generateProfile();

beforeAll(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest
    .spyOn(profileRepository, 'findByUserGuid')
    .mockResolvedValue(profileObject);
});

afterAll((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('API Test Suite: Get Urinations Endpoint', () => {
  mockAuthentication();

  const GET_URINATIONS_ENDPOINT = Constants.URINATIONS_ENDPOINT;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    GET_URINATIONS_ENDPOINT,
    RequestMethod.GET
  );

  describe('Tests for group-by parameter', () => {
    test('should fail when given an invald group-by parameter', (done) => {
      //Setup
      const invalidGroupByParams = ['GROUP', false, [1], { week: 'week' }];
      const startDateParam =
        moment().subtract(1, 'days').format(DATE_FORMAT_ISO8601).slice(0, -6) +
        'Z';
      const endDateParam =
        moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
      const typeParam = 'color';

      invalidGroupByParams.forEach((invalidGroupByParam) => {
        //When
        request(testApplication)
          .get(
            `${GET_URINATIONS_ENDPOINT}?groupBy=${invalidGroupByParam}&startDate=${startDateParam}&endDate=${endDateParam}&type=${typeParam}`
          )
          .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

          //Then
          .expect(400)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            try {
              expect(response.body.message).toBe(
                `"groupBy" must be one of [week, month, day, year]`
              );
            } catch (e) {
              return done(e);
            }
            return done();
          });
      });
    });

    test('should return urination list groupped by day', (done) => {
      //Setup
      prismaMock.$queryRawUnsafe.mockResolvedValue([
        {
          ...Constants.SAMPLE_URINATION_DATA,
          wellhydratedcount: 1,
          hydrationdeficientcount: 2,
          total: 3,
        },
      ]);
      prismaMock.profile.findFirst.mockResolvedValue({
        id: 1,
      } as IProfile);
      jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
      jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);

      const groupByParam = 'day';
      const startDateParam =
        moment().subtract(5, 'days').format(DATE_FORMAT_ISO8601).slice(0, -6) +
        'Z';
      const endDateParam =
        moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
      const typeParam = 'color';

      //When
      request(testApplication)
        .get(
          `${GET_URINATIONS_ENDPOINT}?groupBy=${groupByParam}&startDate=${startDateParam}&endDate=${endDateParam}&type=${typeParam}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

        //Then
        .expect(200)
        .expect(
          [
            {
              color: Constants.SAMPLE_URINATION_DATA.color,
              colorData: {
                wellHydratedCount: 1,
                hydrationDeficientCount: 2,
                total: 3,
              },
            },
          ],
          done
        );
    });
  });

  describe('Tests for date parameters', () => {
    test('should fail when end date is smaller than start date', (done) => {
      //Setup
      const groupByParam = 'day';
      const startDateParam =
        moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
      const endDateParam =
        moment().subtract(1, 'days').format(DATE_FORMAT_ISO8601).slice(0, -6) +
        'Z';
      const typeParam = 'color';

      //When
      request(testApplication)
        .get(
          `${GET_URINATIONS_ENDPOINT}?groupBy=${groupByParam}&startDate=${startDateParam}&endDate=${endDateParam}&type=${typeParam}`
        )
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

        //Then
        .expect(409)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.message).toBe(
              `Date In The Future Not Allowed`
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });

    test('should fail when start date parameter is not or valid date string', (done) => {
      //Setup
      const groupByParam = 'day';
      const invalidDateParams = ['1', '2022/04/03', [1]];
      const typeParam = 'color';

      invalidDateParams.forEach((invalidStartDateParam) => {
        //When
        request(testApplication)
          .get(
            `${GET_URINATIONS_ENDPOINT}?groupBy=${groupByParam}&startDate=${invalidStartDateParam}&endDate=${invalidStartDateParam}&type=${typeParam}`
          )
          .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

          //Then
          .expect(400)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            try {
              expect([
                '"startDate" does not match any of the allowed types, "endDate" does not match any of the allowed types',
                '"startDate" must be in YYYY-MM-DDTHH:mm:ssZ format, "endDate" must be in YYYY-MM-DDTHH:mm:ssZ format',
              ]).toContain(response.body.message);
            } catch (e) {
              return done(e);
            }
            return done();
          });
      });
    });
  });

  describe('Tests for type parameter', () => {
    test('should fail when given an invalid type parameter', (done) => {
      //Setup
      const groupByParam = 'day';
      const startDateParam =
        moment().subtract(1, 'days').format(DATE_FORMAT_ISO8601).slice(0, -6) +
        'Z';
      const endDateParam =
        moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
      const invalidTypeParams = ['TYPE', true, [1], 2];

      invalidTypeParams.forEach((invalidTypeParam) => {
        //When
        request(testApplication)
          .get(
            `${GET_URINATIONS_ENDPOINT}?groupBy=${groupByParam}&startDate=${startDateParam}&endDate=${endDateParam}&type=${invalidTypeParam}`
          )
          .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

          //Then
          .expect(400)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            try {
              expect(response.body.message).toBe(
                '"type" must be one of [color, durationInSeconds, concentration, frequency]'
              );
            } catch (e) {
              return done(e);
            }
            return done();
          });
      });
    });

    test('should return expected type of urinations', (done) => {
      //Setup
      prismaMock.$queryRawUnsafe.mockResolvedValue([
        Constants.SAMPLE_URINATION_DATA,
      ]);
      prismaMock.profile.findFirst.mockResolvedValue({
        id: 1,
      } as IProfile);
      const groupByParam = 'day';
      const startDateParam =
        moment().subtract(1, 'days').format(DATE_FORMAT_ISO8601).slice(0, -6) +
        'Z';
      const endDateParam =
        moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z';
      const typeParams = ['color', 'durationInSeconds', 'concentration'];

      typeParams.forEach((typeParam) => {
        //When
        request(testApplication)
          .get(
            `${GET_URINATIONS_ENDPOINT}?groupBy=${groupByParam}&startDate=${startDateParam}&endDate=${endDateParam}&type=${typeParam}`
          )
          .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

          //Then
          .expect(200)
          .end((error, response) => {
            if (error) {
              return done(error);
            }
            try {
              expect(response.body[0]).toHaveProperty(typeParam);
            } catch (e) {
              return done(e);
            }
            return done();
          });
      });
    });
  });
});
