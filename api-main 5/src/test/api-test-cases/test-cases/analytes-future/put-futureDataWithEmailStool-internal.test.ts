import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { getDate } from '../../core/helper';
import { IStoolFutureData } from '@modules/analytes-future-data/analytes-future-data.type';
import { IDevicesInventory } from '@modules/device-inventory/device-inventory.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { DeviceStatus } from '@prisma/client';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: PUT Future Data With Email', () => {
  const email = Constants.TEST_USER.email;

  const SAMPLE_Stool_FUTURE_DATA = {
    id: 1,
    color: 1,
    hasBlood: false,
    durationInSeconds: 100,
    consistency: 1,
    startDate: new Date(),
    endDate: new Date(),
    email: Constants.TEST_USER.email,
    used: false,
  } as IStoolFutureData;

  const SAMPLE_DEVICE_INVENTORY_DATA = {
    id: 1,
    deviceSerial: '73b-015-04-2f7',
    manufacturingDate: new Date(),
    manufacturedForRegion: 'North America',
    deviceModelId: 1,
    bleMacAddress: '48-68-28-13-A4-48',
    wiFiMacAddress: '3E-94-C9-43-2D-D7',
    deviceMetadata: {},
    calibrationFileLocations: {},
    deviceStatus: DeviceStatus.IN_SERVICE,
    deviceActivation: [Constants.SAMPLE_DEVICE_ACTIVATION_DATA],
  } as IDevicesInventory;

  test('test case with valid data for stool future', (done) => {
    //When
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.stoolFutureData.findFirst.mockRejectedValue(
      SAMPLE_Stool_FUTURE_DATA
    );
    prismaMock.deviceInventory.findMany.mockResolvedValue([
      SAMPLE_DEVICE_INVENTORY_DATA,
    ]);
    prismaMock.stoolFutureData.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.stoolFutureData.createMany.mockResolvedValue({ count: 1 });
    request(testApplication)
      .put(`/internal/future-stools/${email}`)
      .send([
        {
          data: [
            {
              startDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              endDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              color: SAMPLE_Stool_FUTURE_DATA.color,
              hasBlood: SAMPLE_Stool_FUTURE_DATA.hasBlood,
              durationInSeconds: SAMPLE_Stool_FUTURE_DATA.durationInSeconds,
              consistency: SAMPLE_Stool_FUTURE_DATA.consistency,
            },
          ],
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

  test('test case with invalid color', (done) => {
    request(testApplication)
      .put(`/internal/future-stools/${email}`)
      .send([
        {
          data: [
            {
              startDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              endDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              color: 0,
              hasBlood: SAMPLE_Stool_FUTURE_DATA.hasBlood,
              durationInSeconds: SAMPLE_Stool_FUTURE_DATA.durationInSeconds,
              consistency: SAMPLE_Stool_FUTURE_DATA.consistency,
            },
          ],
        },
      ])
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"color" must be greater than or equal to 1'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid consistency', (done) => {
    request(testApplication)
      .put(`/internal/future-stools/${email}`)
      .send([
        {
          data: [
            {
              startDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              endDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              color: SAMPLE_Stool_FUTURE_DATA.color,
              hasBlood: SAMPLE_Stool_FUTURE_DATA.hasBlood,
              durationInSeconds: SAMPLE_Stool_FUTURE_DATA.durationInSeconds,
              consistency: 0,
            },
          ],
        },
      ])
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

  test('test case with invalid date', (done) => {
    request(testApplication)
      .put(`/internal/future-stools/${email}`)
      .send([
        {
          data: [
            {
              startDate: new Date(),
              endDate: getDate(
                new Date(`${new Date().getFullYear() + 1}-10-12`)
              ),
              color: SAMPLE_Stool_FUTURE_DATA.color,
              hasBlood: SAMPLE_Stool_FUTURE_DATA.hasBlood,
              durationInSeconds: SAMPLE_Stool_FUTURE_DATA.durationInSeconds,
              consistency: SAMPLE_Stool_FUTURE_DATA.consistency,
            },
          ],
        },
      ])
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
});
