import {
  find,
  getAnalytesManual,
  getStools,
  insertManual,
  remove,
  sendToSNS,
  upsertBulk,
  upsertFileData,
  upsertInternal,
  upsertInternalToDB,
} from './stool.service';
import {
  IAnalyteRequestDto,
  ICreateStoolDataRequestDto,
} from './dtos/analytes.index.dto';
import { EventSource } from '@prisma/client';
import userRepository from '@repositories/user.repository';
import {
  generateAuth0User,
  generateGroupDevice,
  generateUser,
} from '../../test/utils/generate';
import groupDevicesRepository from '@repositories/group-devices.repository';
import analytesStoolRepository from '@repositories/analytes-stool.repository';
import manualRepository from '@repositories/analytes-manual.repository';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import {
  CumulativeScoreTypes,
  TimeOfDayEnum,
} from '@modules/cumulative-score/cumulative-score.type';
import { AnalyteTypes, StoolFilterType } from './analytes.type';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import moment from 'moment';
import * as SNS from '../../lib/sns.client';
import { publishAnalytesSNS } from '../../lib/sns.client';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import profileRepository from '@repositories/profile.repository';
import { IProfile } from '@modules/profile/profile.type';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import {
  deviceActivationService,
  userService,
} from '@modules/index/index.service';

const deviceInventoryObject = {
  id: 1,
  deviceSerial: '73b-015-04-2f7',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceModelId: 1,
  bleMacAddress: '48-68-28-13-A4-48',
  wiFiMacAddress: '3E-94-C9-43-2D-D7',
  deviceMetadata: {},
  calibrationFileLocations: {},
};

const deviceActivationObject = {
  id: 1,
  deviceId: 1,
  deviceFirmwareId: 1,
  activatedBy: 1,
  timeZoneId: 1,
  deviceName: 'Smart Toilet',
  deviceModelId: 1,
  deviceStatus: {},
  batteryStatus: 0,
  wiFiSSID: '',
  rssi: 0,
  deviceStatusUpdatedOn: new Date(),
  isNotified: false,
  activatedOn: new Date(),
  deactivatedBy: null,
  deleted: null,
};

const deviceInventoryExtendedObject = {
  ...deviceInventoryObject,
  deviceActivation: [deviceActivationObject],
};

beforeEach(() => {
  const auth0User = generateAuth0User();
  const userData = generateUser({
    email: auth0User.email,
  });
  const groupDevice = generateGroupDevice();
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userData);

  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
  jest
    .spyOn(groupDevicesRepository, 'findFirst')
    .mockResolvedValue(groupDevice);
  jest.spyOn(analytesStoolRepository, 'createMany').mockResolvedValueOnce({
    count: 1,
  });
  jest.spyOn(analytesStoolRepository, 'findMany').mockResolvedValue([
    {
      id: 1,
      deviceId: 1,
      profileId: 1,
      color: 3,
      durationInSeconds: 300,
      hasBlood: false,
      consistency: 2,
      createdOn: moment.utc('06/01/2022').toDate(),
      startDate: moment.utc('06/01/2022').toDate(),
      endDate: moment.utc('06/01/2022').toDate(),
      scoreDate: moment.utc('06/01/2022').toDate(),
      offsetTz: '+00:00',
    },
  ]);
  jest.spyOn(analytesStoolRepository, 'findByAverage').mockResolvedValue([
    {
      date: '2022-06-01',
      color: 3,
      consistency: 2,
      durationInSeconds: 3,
      frequency: 3,
      hasBlood: true,
    },
    {
      date: '2022-07-01',
      color: 2.889,
      consistency: 2.889,
      durationInSeconds: 327,
      frequency: 2.296,
      hasBlood: true,
    },
  ]);
  jest.spyOn(manualRepository, 'findMany').mockResolvedValue([]);
  jest.spyOn(manualRepository, 'createMany').mockResolvedValue({
    count: 1,
  });
  jest.spyOn(cumulativeScoreRepository, 'findFirst').mockResolvedValue(null);
  jest.spyOn(cumulativeScoreRepository, 'create').mockResolvedValue({
    id: 1,
    profileId: 1,
    value: 1,
    type: CumulativeScoreTypes.gutHealth,
    date: new Date(),
    scoreOfRecord: true,
    timeOfDay: TimeOfDayEnum.afternoon,
    trendIndicator: null,
  });
  jest.spyOn(analytesStoolRepository, 'remove').mockResolvedValueOnce({
    count: 1,
  });
  jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest.spyOn(profileRepository, 'findByUserGuid').mockResolvedValue({
    id: 1,
  } as IProfile);
  // eslint-disable-next-line
  jest.spyOn(SNS, 'publishAnalytesSNS').mockResolvedValue({} as unknown as any);
  jest
    .spyOn(deviceInventoryRepository, 'findManyUserActiveDevices')
    .mockResolvedValue([deviceInventoryExtendedObject]);
  jest
    .spyOn(deviceActivationService, 'getDeviceToOffset')
    .mockResolvedValue({ 1: '+00:00' });
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('stool analyte', () => {
  test('should test upsertBulk function', async () => {
    const payload = [
      {
        data: [
          {
            startDate: moment().add(-1, 'days').toDate(),
            endDate: moment().add(-1, 'days').toDate(),
            color: 4,
            consistency: 2,
            hasBlood: false,
            durationInSeconds: 600,
          },
        ],
      },
      {
        data: [
          {
            startDate: moment().toDate(),
            endDate: moment().toDate(),
            color: 3,
            consistency: 2,
            hasBlood: false,
            durationInSeconds: 600,
          },
          {
            startDate: moment().toDate(),
            endDate: moment().toDate(),
            color: 4,
            consistency: 2,
            hasBlood: false,
            durationInSeconds: 600,
          },
        ],
      },
    ];
    const cdto = {
      payload,
      userEmail: 'dev@projectspectra.dev',
      deleteData: false,
    } as ICreateStoolDataRequestDto;
    await upsertBulk(cdto);
  });

  test('should test upsertBulk function (no device)', async () => {
    jest.spyOn(groupDevicesRepository, 'findFirst').mockResolvedValue(null);
    try {
      const payload = [
        {
          data: [
            {
              startDate: moment().add(-1, 'days').toDate(),
              endDate: moment().add(-1, 'days').toDate(),
              color: 4,
              consistency: 2,
              hasBlood: false,
              durationInSeconds: 600,
            },
          ],
        },
        {
          data: [
            {
              startDate: moment().toDate(),
              endDate: moment().toDate(),
              color: 3,
              consistency: 2,
              hasBlood: false,
              durationInSeconds: 600,
            },
            {
              startDate: moment().toDate(),
              endDate: moment().toDate(),
              color: 4,
              consistency: 2,
              hasBlood: false,
              durationInSeconds: 600,
            },
          ],
        },
      ];
      const cdto = {
        payload,
        userEmail: 'dev@projectspectra.dev',
        deleteData: false,
      } as ICreateStoolDataRequestDto;
      await upsertBulk(cdto);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'analytes_user_is_not_part_of_a_group_with_an_assigned_device'
      );
    }
  });

  test('should test upsertFileData function and throw exception', async () => {
    try {
      const file: Express.Multer.File = {
        fieldname: 'test.json',
        originalname: 'test.json',
        encoding: 'utf-8',
        mimetype: 'ascii',
        size: 16,
        stream: {} as any,
        destination: {} as any,
        filename: 'test.json',
        path: './',
        buffer: Buffer.from('{a: 1}'),
      };
      file.mimetype = 'application/binary';
      await upsertFileData({
        userEmail: 'test@test.com',
        file,
      });
    } catch (ae) {
      expect((ae as ApiError).status).toBe(400);
    }
  });

  test('should test find function', async () => {
    await find(
      {
        userGuid: '1',
        color: 1,
        consistency: false,
        hasBlood: false,
        durationInSeconds: 1200,
        frequency: 1,
        startDate: moment().subtract(2, 'days').toDate(),
        endDate: moment().subtract(0, 'days').toDate(),
        type: StoolFilterType.color,
      },
      GroupByFilter.day
    );
  });

  test('should test find function with day single entry', async () => {
    const result = await find(
      {
        userGuid: '1',
        color: 3,
        consistency: false,
        hasBlood: false,
        durationInSeconds: 300,
        frequency: 1,
        startDate: moment.utc('06/01/2022').toDate(),
        endDate: moment.utc('06/01/2022').toDate(),
        type: StoolFilterType.color,
      },
      GroupByFilter.day
    );
    expect(result[0].color).toBe(3);
  });

  test('should test find function with day multiple entries', async () => {
    jest.spyOn(analytesStoolRepository, 'findByAverage').mockResolvedValue([
      {
        color: 1,
        durationInSeconds: 300,
        hasBlood: false,
        consistency: 2,
        date: '06/01/2022',
      },
    ]);

    const result = await find(
      {
        userGuid: '1',
        color: 2,
        consistency: false,
        hasBlood: false,
        durationInSeconds: 300,
        frequency: 1,
        startDate: moment.utc('06/01/2022').toDate(),
        endDate: moment.utc('06/01/2022').toDate(),
        type: StoolFilterType.color,
      },
      GroupByFilter.day
    );
    expect(result[0].color).toBe(1);
  });

  test('should test remove function', async () => {
    await remove({
      userEmail: 'test@test.com',
      groupBy: GroupByFilter.day,
      type: AnalyteTypes.stool,
      startDate: -5,
      endDate: 0,
    } as IAnalyteRequestDto);
  });

  test('should test insertManual function', async () => {
    await insertManual(
      {
        id: 1,
        profileId: 1,
        isUrine: true,
        isStool: false,
        date: moment.utc('2022/06/15').toDate(),
        start: moment.utc('2022/06/14').toDate(),
        end: moment.utc('2022/06/16').toDate(),
      },
      '1'
    );
  });

  test('should test upsertInternalToDB function', async () => {
    await upsertInternalToDB([
      {
        profileId: 1,
        deviceId: 1,
        color: 1,
        durationInSeconds: 1,
        startDate: new Date(),
        endDate: new Date(),
        scoreDate: new Date(),
        consistency: 1,
        hasBlood: false,
      },
    ]);
  });

  test('should test getStools function', async () => {
    await getStools(1, new Date(), new Date());
    expect(analytesStoolRepository.findMany).toHaveBeenCalledTimes(1);
  });

  test('should test getStools function', async () => {
    await getAnalytesManual(
      1,
      new Date(),
      new Date(),
      'asc',
      AnalyteTypes.stool
    );
    expect(manualRepository.findMany).toHaveBeenCalledTimes(1);
  });
  test('should test sendToSNS function', async () => {
    jest.mock('@aws-sdk/client-sns');
    await sendToSNS(
      {
        data: [
          {
            startDate: new Date(),
            endDate: new Date(),
            color: 1,
            hasBlood: false,
            durationInSeconds: 1,
            consistency: 1,
          },
        ],
      },
      EventSource.DeviceGenerated,
      1,
      'test'
    );
    expect(publishAnalytesSNS).toHaveBeenCalledTimes(1);
  });

  test('should test upsertInternal function', async () => {
    await upsertInternal({
      payload: {
        userGuid: 'test',
        data: [
          {
            startDate: new Date(),
            endDate: new Date(),
            color: 1,
            hasBlood: false,
            durationInSeconds: 1,
            consistency: 1,
          },
        ],
      },
    });
    expect(userRepository.findFirst).toHaveBeenCalled();
    expect(groupDevicesRepository.findFirst).toHaveBeenCalled();
    expect(publishAnalytesSNS).toHaveBeenCalled();
  });
});
