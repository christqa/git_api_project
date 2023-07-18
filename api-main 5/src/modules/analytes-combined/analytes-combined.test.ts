import { IProfile } from '@modules/profile/profile.type';
import { Prisma } from '@prisma/client';
import analytesStoolRepository from '@repositories/analytes-stool.repository';
import analytesUrineRepository from '@repositories/analytes-urine.repository';
import { findAnalytes } from './analytes-combined.service';
import {
  deviceActivationService,
  profileService,
  userService,
} from '@modules/index/index.service';
import { generateUser } from '@test/utils/generate';
import { analyteStoolService } from '@modules/analytes';
import { getDateWithFixedOffset } from '@utils/date.util';
import { userWithoutGroupDevice } from '@modules/analytes/analytes.error';
import moment from 'moment';

const findManyByDateObject = [
  {
    id: 1,
    profileId: 1,
    deviceId: 1,
    color: 2,
    hasBlood: false,
    durationInSeconds: 23,
    consistency: 2,
    createdOn: new Date('2023/03/13'),
    startDate: new Date('2023/03/13'),
    endDate: new Date('2023/03/13'),
    scoreDate: new Date('2023/03/13'),
    offsetTz: '+00:00',
  },
  {
    id: 2,
    profileId: 1,
    deviceId: 1,
    color: 3,
    hasBlood: false,
    durationInSeconds: 23,
    consistency: 2,
    createdOn: new Date('2023/03/13'),
    startDate: new Date('2023/03/13'),
    endDate: new Date('2023/03/13'),
    scoreDate: new Date('2023/03/14'),
    offsetTz: '+00:00',
  },
];
const findManyWithoutFirstInDayObject = [
  {
    id: 3,
    profileId: 1,
    deviceId: 1,
    firstInDay: true,
    color: 2,
    durationInSeconds: 1,
    concentration: new Prisma.Decimal(2),
    createdOn: new Date('2023/03/13'),
    startDate: new Date('2023/03/13'),
    endDate: new Date('2023/03/13'),
    scoreDate: new Date('2023/03/13'),
    offsetTz: '+00:00',
  },
  {
    id: 4,
    profileId: 1,
    deviceId: 1,
    firstInDay: true,
    color: 2,
    durationInSeconds: 1,
    concentration: new Prisma.Decimal(2),
    createdOn: new Date('2023/03/14'),
    startDate: new Date('2023/03/14'),
    endDate: new Date('2023/03/14'),
    scoreDate: new Date('2023/03/14'),
    offsetTz: '+00:00',
  },
  {
    id: 5,
    profileId: 1,
    deviceId: 1,
    firstInDay: false,
    color: 2,
    durationInSeconds: 1,
    concentration: new Prisma.Decimal(2),
    createdOn: new Date('2023/03/14'),
    startDate: new Date('2023/03/14'),
    endDate: new Date('2023/03/14'),
    scoreDate: new Date('2023/03/14'),
    offsetTz: '+00:00',
  },
];

const userObject = generateUser({ id: 1 });

beforeEach(() => {
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest
    .spyOn(analyteStoolService, 'getUserDeviceIdSerial')
    .mockResolvedValue({ deviceId: 1, deviceSerial: '73b-015-04-2f7' });
  jest
    .spyOn(deviceActivationService, 'getDeviceTimeZoneOffset')
    .mockResolvedValue('+00:00');
  jest
    .spyOn(analytesStoolRepository, 'findManyByDate')
    .mockResolvedValue(findManyByDateObject);
  jest
    .spyOn(analytesUrineRepository, 'findManyWithoutFirstInDay')
    .mockResolvedValue(findManyWithoutFirstInDayObject);
});

describe('combined analytes', () => {
  test('should test with valid params', async () => {
    const analytes = await findAnalytes({
      startDate: moment().utcOffset(0).subtract(2, 'days').toDate(),
      endDate: moment().utcOffset(0).toDate(),
      userGuid: '1',
    });
    expect(analytes.count).toBe(5);
    expect(analytes.data[0].type).toBe('stool');
    expect(analytes.data[1].type).toBe('stool');
    expect(analytes.data[2].type).toBe('urine');
    expect(analytes.data[3].type).toBe('urine');
    expect(analytes.data[4].type).toBe('urine');
  });

  test('should test when stools are empty', async () => {
    jest.spyOn(analytesStoolRepository, 'findManyByDate').mockResolvedValue([]);
    const analytes = await findAnalytes({
      startDate: moment().utcOffset(0).subtract(2, 'days').toDate(),
      endDate: moment().utcOffset(0).toDate(),
      userGuid: '1',
    });

    expect(analytes.count).toBe(3);
    expect(analytes.data[0].type).toBe('urine');
    expect(analytes.data[1].type).toBe('urine');
    expect(analytes.data[2].type).toBe('urine');
  });

  test('should test when urines are empty', async () => {
    jest
      .spyOn(analytesUrineRepository, 'findManyWithoutFirstInDay')
      .mockResolvedValue([]);
    const analytes = await findAnalytes({
      startDate: moment().utcOffset(0).subtract(2, 'days').toDate(),
      endDate: moment().utcOffset(0).toDate(),
      userGuid: '1',
    });
    expect(analytes.count).toBe(2);
    expect(analytes.data[0].type).toBe('stool');
    expect(analytes.data[1].type).toBe('stool');
  });

  test('should test when we do not provided date', async () => {
    const findManyWithoutFirstInDayObject = [
      {
        id: 5,
        profileId: 1,
        deviceId: 1,
        firstInDay: true,
        color: 2,
        durationInSeconds: 1,
        concentration: new Prisma.Decimal(2),
        createdOn: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        scoreDate: new Date(),
        offsetTz: '+00:00',
      },
    ];
    jest.spyOn(analytesStoolRepository, 'findManyByDate').mockResolvedValue([]);
    jest
      .spyOn(analytesUrineRepository, 'findManyWithoutFirstInDay')
      .mockResolvedValue(findManyWithoutFirstInDayObject);
    const analytes = await findAnalytes({
      userGuid: '1',
    });
    expect(analytes.count).toBe(1);
    expect(analytesStoolRepository.findManyByDate).toHaveBeenCalled();
    expect(
      analytesUrineRepository.findManyWithoutFirstInDay
    ).toHaveBeenCalled();
  });

  test('should test when user is not a part of a group with device and we have stool/urine records', async () => {
    jest
      .spyOn(analyteStoolService, 'getUserDeviceIdSerial')
      .mockImplementation(() => {
        throw userWithoutGroupDevice();
      });

    const findManyWithoutFirstInDayObject = [
      {
        id: 5,
        profileId: 1,
        deviceId: 1,
        firstInDay: true,
        color: 2,
        durationInSeconds: 1,
        concentration: new Prisma.Decimal(2),
        createdOn: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        scoreDate: new Date(),
        offsetTz: '+00:00',
      },
    ];
    jest.spyOn(analytesStoolRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(analytesUrineRepository, 'findFirst')
      .mockResolvedValue(findManyWithoutFirstInDayObject[0]);
    jest.spyOn(analytesStoolRepository, 'findManyByDate').mockResolvedValue([]);
    jest
      .spyOn(analytesUrineRepository, 'findManyWithoutFirstInDay')
      .mockResolvedValue(findManyWithoutFirstInDayObject);
    const analytes = await findAnalytes({
      userGuid: '1',
    });
    expect(analytes.count).toBe(1);
    expect(analytesStoolRepository.findFirst).toHaveBeenCalled();
    expect(analytesUrineRepository.findFirst).toHaveBeenCalled();
    expect(analytesStoolRepository.findManyByDate).toHaveBeenCalled();
    expect(
      analytesUrineRepository.findManyWithoutFirstInDay
    ).toHaveBeenCalled();
  });

  test('should test when user is not a part of a group with device and we have NO stool/urine records', async () => {
    jest
      .spyOn(analyteStoolService, 'getUserDeviceIdSerial')
      .mockImplementation(() => {
        throw userWithoutGroupDevice();
      });
    jest.spyOn(analytesStoolRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(analytesUrineRepository, 'findFirst').mockResolvedValue(null);
    const analytes = await findAnalytes({
      userGuid: '1',
    });
    expect(analytes.count).toBe(0);
    expect(analytesStoolRepository.findFirst).toHaveBeenCalled();
    expect(analytesUrineRepository.findFirst).toHaveBeenCalled();
  });
});
