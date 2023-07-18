import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { getDate } from '../../core/helper';
import * as SNS from '../../../../lib/sns.client';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Internal stools Endpoint', () => {
  const GET_STOOLS_ENDPOINT = Constants.STOOLS_ENDPOINT;
  const stoolPayload = {
    data: [
      {
        startDate: getDate(Constants.SAMPLE_STOOL_DATA.startDate),
        endDate: getDate(Constants.SAMPLE_STOOL_DATA.endDate),
        consistency: Constants.SAMPLE_STOOL_DATA.consistency,
        durationInSeconds: Constants.SAMPLE_STOOL_DATA.durationInSeconds,
        hasBlood: true,
        color: Constants.SAMPLE_STOOL_DATA.color,
      },
    ],
    profileId: Constants.SAMPLE_STOOL_DATA.profileId,
    deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
  };

  test('test case with valid values', (done) => {
    jest
      .spyOn(SNS, 'publishAnalytesSNS')
      .mockResolvedValue({} as unknown as any);
    request(testApplication)
      .post(`/internal${GET_STOOLS_ENDPOINT}/sns`)
      .send(stoolPayload)
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

  test('test case with invalid date', (done) => {
    request(testApplication)
      .post(`/internal${GET_STOOLS_ENDPOINT}/sns`)
      .send({
        ...stoolPayload,
        data: [
          {
            ...stoolPayload.data[0],
            startDate: Constants.SAMPLE_STOOL_DATA.startDate,
          },
        ],
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"startDate" must be in YYYY-MM-DDTHH:mm:ssZ format'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid consistency', (done) => {
    request(testApplication)
      .post(`/internal${GET_STOOLS_ENDPOINT}/sns`)
      .send({
        ...stoolPayload,
        data: [
          {
            ...stoolPayload.data[0],
            consistency: 0,
            durationInSeconds: Constants.SAMPLE_STOOL_DATA.durationInSeconds,
            hasBlood: true,
            color: Constants.SAMPLE_STOOL_DATA.color,
          },
        ],
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"consistency" must be greater than or equal to 1'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid color', (done) => {
    request(testApplication)
      .post(`/internal${GET_STOOLS_ENDPOINT}/sns`)
      .send({
        ...stoolPayload,
        data: [
          {
            ...stoolPayload.data[0],
            consistency: Constants.SAMPLE_STOOL_DATA.consistency,
            durationInSeconds: Constants.SAMPLE_STOOL_DATA.durationInSeconds,
            hasBlood: true,
            color: 0,
          },
        ],
      })
      .end((error, resposne) => {
        if (error) {
          return done(error);
        }
        try {
          expect(resposne.status).toEqual(400);
          expect(resposne.body.message).toEqual(
            '"color" must be greater than or equal to 1'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid deviceSerial', (done) => {
    request(testApplication)
      .post(`/internal${GET_STOOLS_ENDPOINT}/sns`)
      .send({
        ...stoolPayload,
        deviceSerial: 12234,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"deviceSerial" must be a string'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
