import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IGroupDevice, IGroupUser } from '@modules/groups/groups.type';
import { GroupUserRoles } from '@prisma/client';
import { IUser } from '@modules/user/user.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Group Admin By Device Endpoint', () => {
  const SAMPLE_GROUP_DEVICE_DATA = {
    id: 1,
    groupId: 1,
    deviceId: 1,
    addedBy: 1,
    addedOn: new Date(),
    removedBy: null,
    deleted: null,
    deviceInventory: {
      deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
      deviceActivation: {
        id: 123,
        deviceName: 'ABCD',
        timeZoneId: 441,
        activatedOn: new Date(),
      },
    },
  } as IGroupDevice;

  const SAMPLE_GROUP_USER_DATA = {
    id: 1,
    userId: 1,
    user: {
      ...(Constants.TEST_USER as IUser),
      profile: { ...Constants.TEST_Profile },
    },
    groupId: 1,
    addedOn: new Date(),
    role: GroupUserRoles.admin,
    deleted: null,
  } as IGroupUser;

  test('should be successful with valid parameters', (done) => {
    prismaMock.deviceInventory.findFirst.mockResolvedValue(
      Constants.SAMPLE_DEVICE_INVENTORY_DATA
    );
    prismaMock.groupDevices.findFirst.mockResolvedValue(
      SAMPLE_GROUP_DEVICE_DATA
    );
    prismaMock.groupUsers.findMany.mockResolvedValue([SAMPLE_GROUP_USER_DATA]);
    request(testApplication)
      .get(
        `/internal/device/group-admin-by-device?deviceSerial=${Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial}`
      )
      .end((error, response) => {
        if (error) {
          return done();
        }
        expect(response.body).toEqual({
          admins: [
            {
              id: 1,
              firstName: 'Austin',
              lastName: 'Gispanski',
              email: 'test-user@projectspectra.dev',
              userGuid: Constants.TEST_USER.userGuid,
              profileId: Constants.TEST_Profile.id,
            },
          ],
        });
        try {
          expect(response.status).toEqual(200);
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
