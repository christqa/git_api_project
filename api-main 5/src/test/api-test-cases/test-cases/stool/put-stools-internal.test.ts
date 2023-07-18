import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IUser } from '@modules/user/user.type';
import { GroupDevices } from '@prisma/client';
import { IProfile } from '@modules/profile/profile.type';
import * as SNS from '../../../../lib/sns.client';
import { IDevicesInventory } from '@modules/device-inventory/device-inventory.type';
import { getDate } from '../../core/helper';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Put Internal Stools Endpoint', () => {
  const stoolPayload = {
    userGuid: '154ce709-911f-4e44-b474-e39521d7f383',
    data: [
      {
        startDate: getDate(new Date()),
        endDate: getDate(new Date()),
        consistency: 2,
        color: 3,
        hasBlood: false,
        durationInSeconds: 272,
      },
    ],
  };

  test('test with valid inputs - hasBlood = false', (done) => {
    prismaMock.account.findFirst.mockResolvedValue({
      ...Constants.TEST_USER,
      userGuid: '154ce709-911f-4e44-b474-e39521d7f383',
    } as IUser);
    prismaMock.groupDevices.findFirst.mockResolvedValue({
      ...Constants.SAMPLE_GROUP_DEVICE_DATA,
      userId: 1,
      deviceInventory: {
        deviceSerial: '73b-015-04-2f7',
      } as IDevicesInventory,
    } as GroupDevices);
    prismaMock.profile.findFirst.mockResolvedValue({
      ...Constants.TEST_Profile,
      userId: 1,
    } as IProfile);
    jest
      .spyOn(SNS, 'publishAnalytesSNS')
      .mockResolvedValue({} as unknown as any);

    request(testApplication)
      .put(`/internal${Constants.STOOLS_ENDPOINT}`)
      .send(stoolPayload)
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

  test('test with valid inputs hasBlood = true', (done) => {
    prismaMock.account.findFirst.mockResolvedValue({
      ...Constants.TEST_USER,
      userGuid: '154ce709-911f-4e44-b474-e39521d7f383',
    } as IUser);
    prismaMock.groupDevices.findFirst.mockResolvedValue({
      ...Constants.SAMPLE_GROUP_DEVICE_DATA,
      userId: 1,
      deviceInventory: {
        deviceSerial: '73b-015-04-2f7',
      } as IDevicesInventory,
    } as GroupDevices);
    prismaMock.profile.findFirst.mockResolvedValue({
      ...Constants.TEST_Profile,
      userId: 1,
    } as IProfile);
    jest
      .spyOn(SNS, 'publishAnalytesSNS')
      .mockResolvedValue({} as unknown as any);

    request(testApplication)
      .put(`/internal${Constants.STOOLS_ENDPOINT}`)
      .send({
        ...stoolPayload,
        data: [
          {
            startDate: getDate(new Date()),
            endDate: getDate(new Date()),
            consistency: 2,
            color: 3,
            hasBlood: true,
            durationInSeconds: 272,
          },
        ],
      })
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

  test('test case with invalid user guid', (done) => {
    request(testApplication)
      .put(`/internal${Constants.STOOLS_ENDPOINT}`)
      .send({ ...stoolPayload, userGuid: '154c911f-4e44-b474-e39521d7f383' })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(400);
          expect(response.body.message).toEqual(
            '"userGuid" must be a valid GUID'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid date', (done) => {
    request(testApplication)
      .put(`/internal${Constants.STOOLS_ENDPOINT}`)
      .send({
        ...stoolPayload,
        data: [
          { ...stoolPayload.data[0], startDate: new Date().toISOString() },
        ],
      })
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

  test('test case with invalid consistency', (done) => {
    request(testApplication)
      .put(`/internal${Constants.STOOLS_ENDPOINT}`)
      .send({
        ...stoolPayload,
        data: [
          {
            ...stoolPayload.data[0],
            consistency: 0,
            color: 3,
            hasBlood: false,
            durationInSeconds: 272,
          },
        ],
      })
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

  test('test case with invalid color', (done) => {
    request(testApplication)
      .put(`/internal${Constants.STOOLS_ENDPOINT}`)
      .send({
        ...stoolPayload,
        data: [
          {
            ...stoolPayload.data[0],
            consistency: 1,
            color: 0,
            hasBlood: false,
            durationInSeconds: 272,
          },
        ],
      })
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
});
