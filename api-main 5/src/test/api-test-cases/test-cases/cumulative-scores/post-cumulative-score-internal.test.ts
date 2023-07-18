import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IProfile } from '@modules/profile/profile.type';

describe('API Test Suite: POST internal Cumulative Score Endpoint', () => {
  const CREATE_CUMULATIVE_SCORE_ENDPOINT = Constants.CUMULATIVE_SCORES_ENDPOINT;

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.profile.findFirst.mockResolvedValue({
      id: 1,
    } as IProfile);
    prismaMock.cumulativeScore.findFirst.mockResolvedValue(
      Constants.SAMPLE_CUMULATIVE_SCORE_DATA
    );
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 1,
        date: 0,
        type: 'hydration',
        timeOfDay: 'morning',
        value: 0,
      })

      //Then
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

  test('test case without profile Id', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        date: 0,
        type: 'hydration',
        value: 0,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(422);
          expect(response.body).toEqual({
            message: 'Validation Failed',
            details: {
              'createCumulativeScoreInternalRequestDto.profileId': {
                message: "'profileId' is required",
              },
            },
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without date', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 0,
        type: 'hydration',
        value: 0,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"date" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without type', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 0,
        date: 0,
        value: 0,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"type" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without value', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 0,
        date: 0,
        type: 'hydration',
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"value" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without invalid profile id', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: '',
        date: 0,
        type: 'hydration',
        value: 0,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"profileId" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without invalid date', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 1,
        date: '',
        type: 'hydration',
        value: 0,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"date" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without invalid type', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 1,
        date: 0,
        type: 'something',
        value: 0,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"type" must be one of [hydration, gutHealth]',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without invalid value', (done) => {
    //When
    request(testApplication)
      .post(`/internal${CREATE_CUMULATIVE_SCORE_ENDPOINT}`)
      .send({
        profileId: 1,
        date: 0,
        type: 'hydration',
        value: '',
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"value" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
