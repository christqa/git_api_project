import * as analytesFutureDataRepository from '@repositories/future-data.repository';
import {
  addStoolData,
  addUrineData,
  getFutureAnalyteData,
  updateFutureAnalyteData,
} from '@modules/analytes-future-data/analytes-future-data.service';
import { Prisma } from '@prisma/client';
import { AnalyteTypes } from '@modules/analytes/analytes.type';
import * as userService from '@modules/user/user.service';
import { IUser } from '@modules/user/user.type';
import ApiError from '@core/error-handling/api-error';

const stoolFutureData = {
  id: 1,
  color: 1,
  hasBlood: false,
  durationInSeconds: 1,
  consistency: 1,
  startDate: new Date(),
  endDate: new Date(),
  email: 'test@example.com',
  used: false,
};

const urineFutureData = {
  id: 1,
  color: 1,
  durationInSeconds: 1,
  concentration: new Prisma.Decimal(1),
  startDate: new Date(),
  endDate: new Date(),
  email: 'test@example.com',
  used: false,
};

const urineFutureDataResponse = {
  id: 1,
  color: 1,
  durationInSeconds: 1,
  concentration: 1,
  startDate: new Date(),
  endDate: new Date(),
  email: 'test@example.com',
  used: false,
};

beforeEach(() => {
  jest
    .spyOn(analytesFutureDataRepository, 'findStoolFutureData')
    .mockResolvedValueOnce([1, [stoolFutureData]]);
  jest
    .spyOn(analytesFutureDataRepository, 'findUrineFutureData')
    .mockResolvedValueOnce([1, [urineFutureData]]);
  jest
    .spyOn(analytesFutureDataRepository, 'updateStoolFutureData')
    .mockResolvedValueOnce({ count: 1 });
  jest
    .spyOn(analytesFutureDataRepository, 'updateUrineFutureData')
    .mockResolvedValueOnce({ count: 1 });
  jest.spyOn(userService, 'findOne').mockResolvedValue({ id: 1 } as IUser);
  jest.spyOn(userService, 'checkUserDeviceByUserId').mockResolvedValue([]);
  jest
    .spyOn(analytesFutureDataRepository, 'createManyUrineFutureData')
    .mockResolvedValue({
      count: 1,
    });
  jest
    .spyOn(analytesFutureDataRepository, 'createManyStoolFutureData')
    .mockResolvedValue({
      count: 1,
    });
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('stool analyte', () => {
  test('should test get Future stool Data function', async () => {
    const data = await getFutureAnalyteData({
      email: 'test@example.com',
      type: AnalyteTypes.stool,
      startDate: new Date(),
    });
    expect(data.count).toBe(1);
    expect(
      analytesFutureDataRepository.findStoolFutureData
    ).toHaveBeenCalledTimes(1);
  });

  test('should test get Future urine Data function', async () => {
    const data = await getFutureAnalyteData({
      email: 'test@example.com',
      type: AnalyteTypes.urine,
      startDate: new Date(),
    });
    expect(data.count).toBe(1);
    expect(
      analytesFutureDataRepository.findUrineFutureData
    ).toHaveBeenCalledTimes(1);
  });

  test('should test update Future stool Data function', async () => {
    const data = await updateFutureAnalyteData({
      email: 'test@example.com',
      type: AnalyteTypes.stool,
      startDate: new Date(),
    });
    expect(data.count).toBe(1);
  });

  test('should test update Future urine Data function', async () => {
    const data = await updateFutureAnalyteData({
      email: 'test@example.com',
      type: AnalyteTypes.urine,
      startDate: new Date(),
    });
    expect(data.count).toBe(1);
  });

  test('should test addUrineData function', async () => {
    const data = await addUrineData({
      userEmail: 'test@test.example',
      payload: [
        {
          data: [
            {
              startDate: new Date('01/01/2050'),
              endDate: new Date('01/01/2050'),
              color: 1,
              durationInSeconds: 1,
              concentration: 1,
            },
          ],
        },
      ],
    });
    expect(data?.count).toBe(1);
  });

  test('should test addStoolData function', async () => {
    const data = await addStoolData({
      userEmail: 'test@test.example',
      payload: [
        {
          data: [
            {
              startDate: new Date('01/01/2050'),
              endDate: new Date('01/01/2050'),
              color: 1,
              durationInSeconds: 1,
              hasBlood: true,
              consistency: 1,
            },
          ],
        },
      ],
    });
    expect(data.count).toBe(1);
  });

  test('should test addStoolData function with past data', async () => {
    try {
      await addStoolData({
        userEmail: 'test@test.example',
        payload: [
          {
            data: [
              {
                startDate: new Date('01/01/2000'),
                endDate: new Date('01/01/2000'),
                color: 1,
                durationInSeconds: 1,
                hasBlood: true,
                consistency: 1,
              },
            ],
          },
        ],
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(400);
      expect(error.message).toContain('startDate Sat Jan 01 2000 00:00:00 GMT');
      expect(error.message).toContain('is in the past');
    }
  });

  test('should test addUrineData function with past data', async () => {
    try {
      await addUrineData({
        userEmail: 'test@test.example',
        payload: [
          {
            data: [
              {
                startDate: new Date('01/01/2000'),
                endDate: new Date('01/01/2000'),
                color: 1,
                durationInSeconds: 1,
                concentration: 1,
              },
            ],
          },
        ],
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(400);
      expect(error.message).toContain('startDate Sat Jan 01 2000 00:00:00 GMT');
      expect(error.message).toContain('is in the past');
    }
  });
});
