import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { mockSNS } from '../../core/sns';
import { rejectInvite } from '@modules/invite/invite.service';
import { deviceActivationService } from '@modules/index/index.service';
import { GroupUserRoles } from '@prisma/client';
import { IGroupDevice, IGroupUser } from '@modules/groups/groups.type';
import { IUser } from '@modules/user/user.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { ITimeZone } from '@core/time-zone/time-zone.type';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: finding users by device serial', () => {
  //without a user
  const group = {
    groupDevices: [
      {
        id: 1,
        deviceId: 1,
        groupId: 1,
        addedOn: new Date(),
        addedBy: 1,
        removedBy: 0,
        deleted: null,
      },
    ],
  };

  const groupUsers = [
    {
      id: 1,
      userId: 1,
      groupId: 1,
      addedOn: new Date(),
      deleted: null,
      role: 'admin',
      group: group,
    },
  ];

  const TEST_USER: IUser = {
    id: 1,
    email: 'test-user@projectspectra.dev',
    authId: '',
    firstName: 'Austin',
    lastName: 'Gispanski',
    localCutoff: '',
    groupUsers: groupUsers,
  } as unknown as IUser;

  test('If there are no users with the specified device serial', (done) => {
    //When
    prismaMock.account.findFirst.mockResolvedValue(TEST_USER);
    prismaMock.deviceActivation.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_ACTIVATION_DATA
    );
    prismaMock.timeZone.findFirst.mockResolvedValue({
      id: 1,
      text: 'gmt',
    } as ITimeZone);
    request(testApplication)
      .get('/internal/users/by-device-serial?deviceSerial=73b01504-2f7')
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toBe(200);
        } catch (e) {
          return done(error);
        }
        return done();
      });
  });
});
