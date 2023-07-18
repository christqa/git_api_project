import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { getDate } from '../../core/helper';
import { IUrineFutureData } from '@modules/analytes-future-data/analytes-future-data.type';
import { DeviceStatus, Prisma } from '@prisma/client';
import { IDevicesInventory } from '@modules/device-inventory/device-inventory.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: PUT Future Data With Email', () => {
  const email = Constants.TEST_USER.email;

  const SAMPLE_URINE_FUTURE_DATA = {
    id: 1,
    color: 1,
    durationInSeconds: 100,
    concentration: new Prisma.Decimal(1.01),
    startDate: new Date(),
    endDate: new Date(),
    email: Constants.TEST_USER.email,
    used: false,
  } as IUrineFutureData;

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

  test('test case with valid data for urine future', (done) => {
    //When
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.urineFutureData.findFirst.mockRejectedValue(
      SAMPLE_URINE_FUTURE_DATA
    );
    prismaMock.deviceInventory.findMany.mockResolvedValue([
      SAMPLE_DEVICE_INVENTORY_DATA,
    ]);
    prismaMock.urineFutureData.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.urineFutureData.createMany.mockResolvedValue({ count: 1 });
    request(testApplication)
      .put(`/internal/future-urinations/${email}`)
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
              color: SAMPLE_URINE_FUTURE_DATA.color,
              durationInSeconds: SAMPLE_URINE_FUTURE_DATA.durationInSeconds,
              concentration: 1.01,
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
      .put(`/internal/future-urinations/${email}`)
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
              durationInSeconds: SAMPLE_URINE_FUTURE_DATA.durationInSeconds,
              concentration: 1.01,
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

  test('test case with invalid concentration', (done) => {
    request(testApplication)
      .put(`/internal/future-urinations/${email}`)
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
              color: SAMPLE_URINE_FUTURE_DATA.color,
              durationInSeconds: SAMPLE_URINE_FUTURE_DATA.durationInSeconds,
              concentration: 1.5,
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
            '"concentration" must be less than or equal to 1.05'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
