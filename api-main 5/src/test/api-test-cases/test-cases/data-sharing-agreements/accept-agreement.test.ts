import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Accept Agreement Endpoint', () => {
  mockAuthentication();

  const ACCEPT_AGREEMENT_ENPOINT = Constants.DATA_SHARING_AGREEMENTS_ENDPOINT;

  test('should be successful with valid parameters', (done) => {
    //Setup
    const agreementId = encodeURIComponent(
      '0b4ace5c-651c-4955-a46d-f185f6ddd59d'
    );

    prismaMock.dataSharingAgreement.findFirst.mockResolvedValue({
      id: 1,
      agreementId: '0b4ace5c-651c-4955-a46d-f185f6ddd59d',
      invitationId: 1,
      fromUserId: 1,
      toUserId: 1,
      permissions: ['read', 'write', 'delete'],
      agreedAt: new Date(),
      revokedAt: null,
    });

    //When
    request(testApplication)
      .patch(`${ACCEPT_AGREEMENT_ENPOINT}/${agreementId}/revoke`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .expect(200, done);
  });

  test('should fail with invalid GUID agreement-id', (done) => {
    //Setup
    const invalidAgreementIds = ['123', '1', false];

    prismaMock.dataSharingAgreement.findFirst.mockResolvedValue({
      id: 1,
      agreementId: '0b4ace5c-651c-4955-a46d-f185f6ddd59d',
      invitationId: 1,
      fromUserId: 1,
      toUserId: 1,
      permissions: ['read', 'write', 'delete'],
      agreedAt: new Date(),
      revokedAt: null,
    });

    //When
    invalidAgreementIds.forEach((invalidAgreementId) => {
      request(testApplication)
        .patch(`${ACCEPT_AGREEMENT_ENPOINT}/${invalidAgreementId}/revoke`)
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

        //Then
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body.status).toBe(400);
            expect(response.body.message).toBe(
              '"agreementId" must be a valid GUID'
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });
});
