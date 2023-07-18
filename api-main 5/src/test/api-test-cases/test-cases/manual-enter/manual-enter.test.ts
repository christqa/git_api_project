import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import * as SNS from '../../../../lib/sns.client';
import { generateGroupDevice } from '@test/utils/generate';
import { prismaMock } from '@core/prisma/singleton';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

beforeEach(() => {
  prismaMock.groupDevices.findFirst.mockResolvedValue(generateGroupDevice());

  // eslint-disable-next-line
  jest.spyOn(SNS, 'publishAnalytesSNS').mockResolvedValue({} as unknown as any);
});

describe('API Test Suite: Manual Enter Endpoint', () => {
  mockAuthentication();

  const MANUAL_ENTER_ENDPOINT = Constants.MANUAL_ENTER_ENDPOINT;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    MANUAL_ENTER_ENDPOINT,
    RequestMethod.POST
  );

  test('should be successful with valid parameters', (done) => {
    prismaMock.profile.findFirst.mockResolvedValue(Constants.TEST_Profile);

    //When
    request(testApplication)
      .post(`${MANUAL_ENTER_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        beginning: '2022-06-10T08:00:00Z',
        end: '2022-06-10T09:00:00Z',
        isUrine: true,
        isStool: true,
      })

      //Then
      .expect(204, done);
  });

  test('should fail with invalid dates', (done) => {
    //Setup
    const invalidDates = ['2022/09/09', false, 323];

    //When
    invalidDates.forEach((invalidDate) => {
      request(testApplication)
        .post(`${MANUAL_ENTER_ENDPOINT}`)
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .send({
          beginning: invalidDate,
          end: invalidDate,
          isUrine: true,
          isStool: true,
        })
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            if (response.body.details) {
              expect(response.status).toBe(422);
              expect(response.body.details['inputDto.beginning'].message).toBe(
                'invalid ISO 8601 datetime format, i.e. YYYY-MM-DDTHH:mm:ss'
              );
              expect(response.status).toBe(422);
              expect(response.body.details['inputDto.end'].message).toBe(
                'invalid ISO 8601 datetime format, i.e. YYYY-MM-DDTHH:mm:ss'
              );
            } else {
              expect(response.status).toBe(400);
              expect([
                '"beginning" must be in YYYY-MM-DDTHH:mm:ssZ format, "end" must be in YYYY-MM-DDTHH:mm:ssZ format',
                '"beginning" must be a valid date, "end" must be a valid date',
              ]).toContain(response.body.message);
            }
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });

  test('should fail with invalid boolean data', (done) => {
    //Setup
    const invalidBooleanData = ['2022/09/09', ['true'], 323];

    //When
    invalidBooleanData.forEach((invalidBooleanUrine) => {
      request(testApplication)
        .post(`${MANUAL_ENTER_ENDPOINT}`)
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
        .send({
          beginning: '2022-06-10T08:00:00Z',
          end: '2022-06-10T09:00:00Z',
          isUrine: invalidBooleanUrine,
          isStool: invalidBooleanUrine,
        })

        //Then
        .expect(400)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.message).toBe(
              '"isUrine" must be a boolean, "isStool" must be a boolean'
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });
});
