import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as deviceInventoryService from '@modules//device-inventory/device-inventory.service';
import { Status } from '@prisma/client';
import { IDeviceInventoryAndFirmware } from '@modules/device-inventory/device-inventory.type';

const Sample_Device_Inventory_And_Firmware = {
  devcieSerial: 'string',
  timeZoneId: 2,
  deviceName: 'string',
  deviceModelId: 1,
  deviceStatus: Status.AWAITINGUSERAPPROVAL,
  batteryStatus: 12,
  firmwareVersion: '1.0.1',
} as IDeviceInventoryAndFirmware;
describe('API Test Suite: GET internal device-inventory Endpoint', () => {
  const skip = 0;
  const take = 10;

  test('should be successful with valid parameters', (done) => {
    jest
      .spyOn(deviceInventoryService, 'getDeviceInventories')
      .mockResolvedValue({
        total: 1,
        devices: [Sample_Device_Inventory_And_Firmware],
      });
    //When
    request(testApplication)
      .get(`/internal/device-inventory?skip=${skip}&take=${take}`)
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            total: 1,
            devices: [Sample_Device_Inventory_And_Firmware],
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  const invalidParams = [
    { skip: '', take: 10 },
    { skip: 0, take: '' },
  ];

  const errorMessages = [
    { status: 400, message: '"skip" must be a number' },
    { status: 400, message: '"take" must be a number' },
  ];
  const invalid = ['invalid skip', 'invalid take'];

  for (let i = 0; i < invalidParams.length; i++) {
    test(`test case with ${invalid[i]}`, (done) => {
      //When
      request(testApplication)
        .get(
          `/internal/device-inventory?skip=${invalidParams[i].skip}&take=${invalidParams[i].take}`
        )
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
});
