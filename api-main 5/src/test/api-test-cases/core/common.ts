import request from 'supertest';
import * as Constants from '../core/constants';
import { RequestMethod } from '../core/enums';
import { testApplication } from '../test-application';
import { mockAuthentication } from './authentication';

export const verifyEndpointFailsWithoutAuthenticationTestCase = (
  endpoint: string,
  method: RequestMethod
) => {
  describe('General Authentication Test cases', () => {
    mockAuthentication();

    test('should fail without authentication', (done) => {
      const supertest: request.SuperTest<request.Test> =
        request(testApplication);
      let test: request.Test;
      switch (method) {
        case RequestMethod.GET:
          test = supertest.get(endpoint);
          break;
        case RequestMethod.POST:
          test = supertest.post(endpoint);
          break;
        case RequestMethod.DELETE:
          test = supertest.delete(endpoint);
          break;
        case RequestMethod.PATCH:
          test = supertest.patch(endpoint);
          break;
        case RequestMethod.PUT:
          test = supertest.put(endpoint);
          break;
      }

      test
        .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.INVALID_TOKEN)
        .expect(401, done);
    });
  });
};
