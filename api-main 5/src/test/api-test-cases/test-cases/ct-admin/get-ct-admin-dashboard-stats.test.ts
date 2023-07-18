import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';

describe('API Test Suite: GET ct-admin dashboard-stats', () => {
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/ct-admin/dashboard-stats`,
    RequestMethod.GET
  );
  mockAuthentication();

  test('test case with valid data', (done) => {
    prismaMock.account.count.mockResolvedValue(1);
    prismaMock.deviceActivation.count.mockResolvedValue(1);
    prismaMock.events.count.mockResolvedValue(1);
    request(testApplication)
      .get(`/ct-admin/dashboard-stats`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            totalUsers: 1,
            totalDevices: 1,
            lastDayEventsCount: 1,
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
