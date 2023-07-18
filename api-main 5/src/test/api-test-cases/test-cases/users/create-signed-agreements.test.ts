import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import agreementsRepository from '@repositories/agreements.repository';
import { AgreementTypes } from '@prisma/client';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(agreementsRepository, 'findFirst').mockResolvedValue({
    agreementType: AgreementTypes.privacyPolicy,
    version: 1,
    url: 'http://url.com',
    localeIso: 'en',
    id: 1,
  });
});

describe('API Test Suite: Create Signed Agreements Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.USERS_ENDPOINT}/me/signed-agreements`,
    RequestMethod.POST
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.signedAgreements.create.mockResolvedValue({
      id: 1,
      agreementId: 1,
      userId: 1,
      agreedAt: new Date(),
    });

    //When
    request(testApplication)
      .post(`${Constants.USERS_ENDPOINT}/me/signed-agreements`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        privacyPolicyVersion: 1,
        termsAndConditionsVersion: 1,
        shareUsageAgreed: true,
      })
      //Then
      .expect(204, done);
  });

  test('should fail with when privacyPolicyVersion and termsAndConditionsVersion properties are less than 1', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);

    //When
    request(testApplication)
      .post(`${Constants.USERS_ENDPOINT}/me/signed-agreements`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        privacyPolicyVersion: 0,
        termsAndConditionsVersion: 0,
        shareUsageAgreed: true,
      })
      //Then
      //   .expect(204, done);
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(400);
          expect(response.body.message).toBe(
            '"privacyPolicyVersion" must be greater than or equal to 1, "termsAndConditionsVersion" must be greater than or equal to 1'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
