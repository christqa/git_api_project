import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import { ITimeZone } from '@core/time-zone/time-zone.type';
import { AvailabilityType } from '.prisma/client';
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';
describe('API Test Suite: POST internal device-inventory Endpoint', () => {
  const SAMPLE_TIME_ZONE = {
    id: 389,
    text: 'Egypt',
    gmt: '+02:00',
  } as ITimeZone;

  const firmware = {
    id: 1,
    virtualFirmware: '1.0.1',
    isCurrent: true,
    addedOn: new Date(),
    releaseDate: new Date(),
    deviceModelId: 1,
    fileName: 'string',
    locationMetaData: {},
    md5CheckSum: '',
    availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
  } as IFirmware;

  const device_firmware = {
    id: 1,
  } as IDeviceFirmware;

  const invalid = [
    'with invalid deviceSerial ',
    'with invalid manufacturingDate',
    'with invalid deviceModelId',
    'with invalid firmwareVersion',
  ];

  const validBody = {
    deviceSerial: '964d25d5-7628-4',
    manufacturingDate: '2022-02-01',
    manufacturedForRegion: 'North America',
    deviceModelId: 1,
    firmwareVersion: '1.0.1',
    bleMacAddress: '48-68-28-13-A4-48',
    wiFiMacAddress: '3E-94-C9-43-2D-D7',
    deviceMetadata: {},
    calibrationFileLocations: {},
  };

  const invalidBodies = [
    {
      ...validBody,
      deviceSerial: 1,
    },
    {
      ...validBody,
      manufacturingDate: 1,
    },
    {
      ...validBody,
      deviceModelId: '',
    },
    {
      ...validBody,
      firmwareVersion: 1,
    },
  ];

  const errorMessages = [
    { status: 400, message: '"deviceSerial" must be a string' },
    {
      message: 'Validation Failed',
      details: {
        'requestBody.$0.manufacturingDate': {
          message: 'invalid ISO 8601 datetime format, i.e. YYYY-MM-DDTHH:mm:ss',
          value: 1,
        },
      },
    },
    { status: 400, message: '"deviceModelId" must be a number' },
    { status: 400, message: '"firmwareVersion" must be a string' },
  ];

  test('should be successful with valid parameters', (done) => {
    prismaMock.firmware.findMany.mockResolvedValue([firmware]);
    prismaMock.timeZone.findMany.mockResolvedValue([SAMPLE_TIME_ZONE]);
    prismaMock.deviceInventory.createMany.mockResolvedValue({ count: 1 });
    prismaMock.deviceFirmware.createMany.mockResolvedValue({ count: 1 });
    //When
    request(testApplication)
      .post(`/internal/device-inventory/seed-inventory`)
      .send([validBody])
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toBe(204);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  for (let i = 0; i < invalid.length; i++) {
    test(`test case ${invalid[i]}`, (done) => {
      //When
      request(testApplication)
        .post(`/internal/device-inventory/seed-inventory`)
        .send([invalidBodies[i]])
        //Then
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          try {
            expect(response.body).toEqual(errorMessages[i]);
          } catch (e) {
            return done(e);
          }
          return done();
        });
    });
  }

  test('test case without deviceSerial', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-inventory/seed-inventory`)
      .send([
        {
          //deviceSerial: "964d25d5-7628-4",
          manufacturingDate: '2022-02-01',
          manufacturedForRegion: 'North America',
          deviceModelId: 1,
          bleMacAddress: '48-68-28-13-A4-48',
          wiFiMacAddress: '3E-94-C9-43-2D-D7',
          firmwareVersion: '1.0.1',
          calibrationFileLocations: {},
        },
      ])
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"deviceSerial" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without manufacturingDate', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-inventory/seed-inventory`)
      .send([
        {
          deviceSerial: '964d25d5-7628-4',
          //manufacturingDate: "2022-02-01",
          manufacturedForRegion: 'North America',
          deviceModelId: 1,
          bleMacAddress: '48-68-28-13-A4-48',
          wiFiMacAddress: '3E-94-C9-43-2D-D7',
          firmwareVersion: '1.0.1',
          calibrationFileLocations: {},
        },
      ])
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"manufacturingDate" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without deviceModelId', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-inventory/seed-inventory`)
      .send([
        {
          deviceSerial: '964d25d5-7628-4',
          manufacturingDate: '2022-02-01',
          manufacturedForRegion: 'North America',
          //deviceModel: "Spectra 1AB",
          bleMacAddress: '48-68-28-13-A4-48',
          wiFiMacAddress: '3E-94-C9-43-2D-D7',
          firmwareVersion: '1.0.1',
          calibrationFileLocations: {},
        },
      ])
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"deviceModelId" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without firmwareVersion', (done) => {
    //When
    request(testApplication)
      .post(`/internal/device-inventory/seed-inventory`)
      .send([
        {
          deviceSerial: '964d25d5-7628-4',
          manufacturingDate: '2022-02-01',
          manufacturedForRegion: 'North America',
          deviceModelId: 1,
          bleMacAddress: '48-68-28-13-A4-48',
          wiFiMacAddress: '3E-94-C9-43-2D-D7',
          calibrationFileLocations: {},
        },
      ])
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"firmwareVersion" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
