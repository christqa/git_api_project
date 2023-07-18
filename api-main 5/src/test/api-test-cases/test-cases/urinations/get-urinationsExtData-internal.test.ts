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

describe('API Test Suite: Get Internal Urinations existingDataForDay', () => {
  const params = [
    {
      describtion: {
        text: 'test case with valid params',
        status: 200,
        response: true,
      },
      profileId: 1,
      scoreDate: getDate(new Date()),
    },
    {
      describtion: {
        text: 'test case with invalid date',
        status: 400,
        response: {
          status: 400,
          message: '"scoreDate" must be in YYYY-MM-DDTHH:mm:ssZ format',
        },
      },
      profileId: 1,
      scoreDate: new Date().toISOString(),
    },
  ];

  params.forEach((param) => {
    test(param.describtion.text, (done) => {
      prismaMock.urineData.findFirst.mockResolvedValue(
        Constants.SAMPLE_URINATION_DATA
      );

      request(testApplication)
        .get(
          `/internal${Constants.URINATIONS_ENDPOINT}/existingDataForDay?profileId=${param.profileId}&scoreDate=${param.scoreDate}`
        )
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.status).toEqual(param.describtion.status);
            expect(response.body).toEqual(param.describtion.response);
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  });
});
