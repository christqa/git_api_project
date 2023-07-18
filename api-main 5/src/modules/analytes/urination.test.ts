import {
  existingDataForDay,
  find,
  getUrination,
  insertManual,
  remove,
  sendToSNS,
  upsertBulk,
  upsertInternal,
  upsertInternalToDB,
  findAndCheckUserDevice,
  upsertFileData,
} from './urination.service';
import userRepository from '@repositories/user.repository';
import {
  generateAuth0User,
  generateGroupDevice,
  generateUser,
} from '@test/utils/generate';
import groupDevicesRepository from '@repositories/group-devices.repository';
import analytesUrinationRepository from '@repositories/analytes-urine.repository';
import manualRepository from '@repositories/analytes-manual.repository';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import { CumulativeScoreTypes } from '@modules/cumulative-score/cumulative-score.type';
import {
  IAnalyteRequestDto,
  ICreateUrineDataRequestDto,
} from '@modules/analytes/dtos/analytes.index.dto';
import { EventSource, Prisma } from '@prisma/client';
import {
  AnalyteTypes,
  IUrineDataPayload,
  UrineFilterType,
} from '@modules/analytes/analytes.type';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import moment from 'moment';
import * as SNS from '../../lib/sns.client';
import { publishAnalytesSNS } from '../../lib/sns.client';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import profileRepository from '@repositories/profile.repository';
import { IProfile } from '@modules/profile/profile.type';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import { deviceActivationService } from '@modules/index/index.service';

const deviceInventoryObject = {
  id: 1,
  deviceSerial: '73b-015-04-2f7',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceName: 'Smart Toilet',
  deviceModelId: 1,
  activatedTimeZoneId: 491,
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

const timeZoneObject = {
  id: 1,
  text: 'Africa/Abidjan',
  gmt: '+00:00',
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
  jest
    .spyOn(groupDevicesRepository, 'findFirst')
    .mockResolvedValue(groupDevice);
  jest.spyOn(analytesUrinationRepository, 'createMany').mockResolvedValueOnce({
    count: 1,
  });
  jest
    .spyOn(analytesUrinationRepository, 'findFirst')
    .mockResolvedValueOnce(null);
  jest.spyOn(analytesUrinationRepository, 'findMany').mockResolvedValue([
    {
      id: 1,
      profileId: 1,
      deviceId: 1,
      color: 2,
      durationInSeconds: 300,
      concentration: new Prisma.Decimal(2),
      createdOn: new Date('06/01/2022'),
      startDate: new Date('06/01/2022'),
      endDate: new Date('06/01/2022'),
      scoreDate: new Date('06/01/2022'),
      firstInDay: true,
      offsetTz: '+00:00',
    },
  ]);
  jest.spyOn(manualRepository, 'findMany').mockResolvedValue([]);
  jest.spyOn(manualRepository, 'createMany').mockResolvedValue({
    count: 1,
  });
  jest.spyOn(analytesUrinationRepository, 'findFirst').mockResolvedValue(null);
  jest
    .spyOn(analytesUrinationRepository, 'findByAverage')
    .mockResolvedValue([]);
  jest.spyOn(cumulativeScoreRepository, 'findFirst').mockResolvedValue(null);
  jest.spyOn(cumulativeScoreRepository, 'create').mockResolvedValue({
    id: 1,
    profileId: 1,
    value: 1,
    type: CumulativeScoreTypes.gutHealth,
    date: new Date(),
    scoreOfRecord: true,
    timeOfDay: null,
    trendIndicator: null,
  });
  jest.spyOn(analytesUrinationRepository, 'remove').mockResolvedValueOnce({
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

describe('urination analyte', () => {
  test('should test upsertBulk function', async () => {
    const payload: IUrineDataPayload[] = [
      {
        data: [
          {
            startDate: moment().add(-1, 'days').toDate(),
            endDate: moment().add(-1, 'days').toDate(),
            color: 2,
            concentration: 4,
            durationInSeconds: 600,
          },
        ],
      },
      {
        data: [
          {
            startDate: moment().toDate(),
            endDate: moment().toDate(),
            color: 2,
            concentration: 4,
            durationInSeconds: 600,
          },
          {
            startDate: moment().toDate(),
            endDate: moment().toDate(),
            color: 2,
            concentration: 4,
            durationInSeconds: 600,
          },
        ],
      },
    ];
    const cdto = {
      payload,
      userEmail: 'dev@projectspectra.dev',
      deleteData: false,
    } as ICreateUrineDataRequestDto;
    await upsertBulk(cdto);
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

  test('should test upsertBulk function (no device)', async () => {
    jest.spyOn(groupDevicesRepository, 'findFirst').mockResolvedValue(null);
    try {
      const payload: IUrineDataPayload[] = [
        {
          data: [
            {
              startDate: moment().add(-1, 'days').toDate(),
              endDate: moment().add(-1, 'days').toDate(),
              color: 2,
              concentration: 4,
              durationInSeconds: 600,
            },
          ],
        },
        {
          data: [
            {
              startDate: moment().toDate(),
              endDate: moment().toDate(),
              color: 2,
              concentration: 4,
              durationInSeconds: 600,
            },
            {
              startDate: moment().toDate(),
              endDate: moment().toDate(),
              color: 2,
              concentration: 4,
              durationInSeconds: 600,
            },
          ],
        },
      ];
      const cdto = {
        payload,
        userEmail: 'dev@projectspectra.dev',
        deleteData: false,
      } as ICreateUrineDataRequestDto;
      await upsertBulk(cdto);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toEqual(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toEqual(
        'analytes_user_is_not_part_of_a_group_with_an_assigned_device'
      );
    }
  });

  test('should test find function', async () => {
    await find(
      {
        userGuid: '1',
        userEmail: 'test@test.com',
        color: 1,
        concentration: 1,
        durationInSeconds: 1200,
        startDate: moment().subtract(2, 'days').toDate(),
        endDate: moment().subtract(0, 'days').toDate(),
        type: UrineFilterType.color,
        firstInDay: false,
      },
      GroupByFilter.day
    );
  });

  test('should test find function where startDate is of type date', async () => {
    await find(
      {
        userGuid: '1',
        userEmail: 'test@test.com',
        color: 1,
        concentration: 1,
        durationInSeconds: 1200,
        startDate: moment(new Date()).subtract(2, 'days').toDate(),
        endDate: moment().subtract(0, 'days').toDate(),
        type: UrineFilterType.color,
        firstInDay: false,
      },
      GroupByFilter.day
    );
  });

  test('should test find function where endDate is of type date and in the future', async () => {
    await find(
      {
        userGuid: '1',
        userEmail: 'test@test.com',
        color: 1,
        concentration: 1,
        durationInSeconds: 1200,
        endDate: moment(new Date()).add(2, 'days').toDate(),
        type: UrineFilterType.color,
        firstInDay: false,
      },
      GroupByFilter.day
    );
  });

  test('should test find function where endDate is of type date', async () => {
    await find(
      {
        userGuid: '1',
        userEmail: 'test@test.com',
        color: 1,
        concentration: 1,
        durationInSeconds: 1200,
        endDate: moment(new Date()).subtract(1, 'days').toDate(),
        type: UrineFilterType.color,
        firstInDay: false,
      },
      GroupByFilter.day
    );
  });

  test('should test findAndCheckUserDevice function', async () => {
    await findAndCheckUserDevice('test@test.com');
  });

  test('should test remove function', async () => {
    await remove({
      userEmail: 'test@test.com',
      groupBy: GroupByFilter.day,
      type: AnalyteTypes.urine,
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
        date: new Date('2022/06/15'),
        start: new Date('2022/06/14'),
        end: new Date('2022/06/16'),
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
        concentration: 1,
        firstInDay: false,
      },
    ]);
  });

  test('should test getUrination function', async () => {
    await getUrination(1, new Date(), false);
    expect(analytesUrinationRepository.findMany).toHaveBeenCalledTimes(1);
  });

  test('should test existingDataForDay function', async () => {
    const existingData = await existingDataForDay(1, 'test');
    expect(existingData).toBe(false);
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
            durationInSeconds: 1,
            concentration: 1,
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
            durationInSeconds: 1,
            concentration: 1,
          },
        ],
      },
    });
    expect(userRepository.findFirst).toHaveBeenCalled();
    expect(groupDevicesRepository.findFirst).toHaveBeenCalled();
    expect(publishAnalytesSNS).toHaveBeenCalled();
  });
});
