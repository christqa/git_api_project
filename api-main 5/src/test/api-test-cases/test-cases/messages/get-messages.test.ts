import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import moment from 'moment';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Messages Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    Constants.MESSAGES_ENDPOINT,
    RequestMethod.GET
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    const skip = 1;
    const take = 1;

    prismaMock.message.findMany.mockResolvedValue([
      Constants.SAMPLE_MESSAGE_DATA,
    ]);

    //When
    const res = request(testApplication)
      .get(`${Constants.MESSAGES_ENDPOINT}?skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN);
    res.expect(200).expect(
      {
        message: [
          {
            ...Constants.SAMPLE_MESSAGE_DATA,
            timestamp:
              moment(Constants.SAMPLE_MESSAGE_DATA.timestamp)
                .utc()
                .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
          },
        ],
      },
      done
    );
  });
});
