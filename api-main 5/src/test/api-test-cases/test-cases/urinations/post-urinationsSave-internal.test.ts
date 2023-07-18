import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import {
  deviceActivationService,
  userService,
} from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest
    .spyOn(deviceActivationService, 'getDeviceToOffset')
    .mockResolvedValue({ 1: '+00:00' });
});

describe('API Test Suite: Post Internal Urinations save', () => {
  test('test case with valid input', (done) => {
    prismaMock.urineData.findMany.mockResolvedValue([
      {
        ...Constants.SAMPLE_URINATION_DATA,
        deviceId: 1,
      },
    ]);

    request(testApplication)
      .post(`/internal${Constants.URINATIONS_ENDPOINT}/save`)
      .send([
        {
          profileId: 1,
          deviceId: 1,
          color: Constants.SAMPLE_URINATION_DATA.color,
          durationInSeconds: Constants.SAMPLE_URINATION_DATA.durationInSeconds,
          startDate: Constants.SAMPLE_URINATION_DATA.startDate.toISOString(),
          endDate: Constants.SAMPLE_URINATION_DATA.endDate.toISOString(),
          scoreDate: Constants.SAMPLE_URINATION_DATA.scoreDate.toISOString(),
          concentration:
            Constants.SAMPLE_URINATION_DATA.concentration.toString(),
          firstInDay: Constants.SAMPLE_URINATION_DATA.firstInDay,
        },
      ])
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(204);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
