import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';

describe('API Test Suite: POST internal device-event Endpoint', () => {
  test('should be successful with valid parameters', (done) => {
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    //When
    request(testApplication)
      .post(`/internal/device-events/save-event`)
      .send({
        deviceSerial: '73b01504-2f7',
        eventData: {},
        eventSource: 'DeviceGenerated',
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(201);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid deviceSerial', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-events/save-event`)
      .send({
        deviceSerial: 1455363998783,
        eventData: {},
        eventSource: 'DeviceGenerated',
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"deviceSerial" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without eventData', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-events/save-event`)
      .send({
        deviceSerial: '73b01504-2f7',
        eventSource: 'DeviceGenerated',
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"eventData" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid eventData', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-events/save-event`)
      .send({
        deviceSerial: '73b01504-2f7',
        eventData: '',
        eventSource: 'DeviceGenerated',
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"eventData" must be of type object',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without eventSource', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-events/save-event`)
      .send({
        deviceSerial: '73b01504-2f7',
        eventData: {},
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"eventSource" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid eventSource', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-events/save-event`)
      .send({
        deviceSerial: '73b01504-2f7',
        eventData: {},
        eventSource: 'Device is generated',
      })
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message:
              '"eventSource" must be one of [DeviceGenerated, ManualEntry, SystemGenerated]',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
