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

describe('API Test Suite: Post Internal Stool save', () => {
  const stoolPayload = {
    profileId: 1,
    deviceId: 1,
    color: Constants.SAMPLE_STOOL_DATA.color,
    durationInSeconds: Constants.SAMPLE_STOOL_DATA.durationInSeconds,
    startDate: Constants.SAMPLE_STOOL_DATA.startDate.toISOString(),
    endDate: Constants.SAMPLE_STOOL_DATA.endDate.toISOString(),
    scoreDate: Constants.SAMPLE_STOOL_DATA.scoreDate.toISOString(),
    consistency: Constants.SAMPLE_STOOL_DATA.consistency.toString(),
    hasBlood: Constants.SAMPLE_STOOL_DATA.hasBlood,
  };
  test('test case with valid input', (done) => {
    prismaMock.stoolData.findMany.mockResolvedValue([
      {
        ...Constants.SAMPLE_STOOL_DATA,
        deviceId: 1,
      },
    ]);

    request(testApplication)
      .post(`/internal${Constants.STOOLS_ENDPOINT}/save`)
      .send([stoolPayload])
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

  test('test case with invalid deviceId', (done) => {
    request(testApplication)
      .post(`/internal${Constants.STOOLS_ENDPOINT}/save`)
      .send([
        {
          ...stoolPayload,
          deviceId: 0,
        },
      ])
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"deviceId" must be greater than or equal to 1'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid profileId', (done) => {
    request(testApplication)
      .post(`/internal${Constants.STOOLS_ENDPOINT}/save`)
      .send([
        {
          ...stoolPayload,
          profileId: 0,
        },
      ])
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"profileId" must be greater than or equal to 1'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
