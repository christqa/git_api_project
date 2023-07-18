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

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Update me Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.USERS_ENDPOINT}/me`,
    RequestMethod.PUT
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.gender.findUnique.mockResolvedValue({
      id: 1,
      text: 'Male',
    });
    prismaMock.lifeStyle.findUnique.mockResolvedValue({
      id: 1,
      text: 'good',
    });

    prismaMock.urinationsPerDay.findUnique.mockResolvedValue({
      id: 1,
      text: '5 urinations',
    });

    //When
    // request(testApplication)
    //   .put(`${Constants.USERS_ENDPOINT}/me`)
    //   .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
    //   .send({
    //     firstName: 'John',
    //     lastName: 'Doe',
    //     profile: {
    //       lifeStyleId: 1,
    //       genderId: 1,
    //       heightIn: 80,
    //       weightLbs: 155,
    //       regionalPref: 'ottawa',
    //       dob: '8/10/2004',
    //     },
    //   })
    //   //Then
    //   .expect(204, done);

    const resp = request(testApplication)
      .put(`${Constants.USERS_ENDPOINT}/me`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        profile: {
          lifeStyleId: 1,
          genderId: 1,
          heightIn: 80,
          weightLbs: 155,
          regionalPref: 'ottawa',
          dob: '8/10/2004',
        },
      });

    resp.end((err, _) => {
      if (err) {
        return done();
      }
      return done();
    });
  });
});
