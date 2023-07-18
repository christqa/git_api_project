import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import * as sqsClient from '../../../../lib/sqs.client';
import { IDeviceActivation } from '@modules/device-activation/device-activation.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Post Internal set-is-notified-batch endpoint', () => {
  test('test with valid parameters', (done) => {
    const SAMPLE_DEVICE_ACTIVATION_DATA = {
      ...Constants.SAMPLE_DEVICE_ACTIVATION_DATA,
      deviceInventory: {
        ...Constants.SAMPLE_DEVICE_INVENTORY_DATA,
        groupDevices: [
          {
            ...Constants.SAMPLE_GROUP_DEVICE_DATA,
            group: {
              ...Constants.SAMPLE_GROUP_DATA,
              groupUsers: [
                {
                  ...Constants.SAMPLE_GROUP_USER_DATA,
                  user: {
                    ...Constants.TEST_USER,
                    profile: {
                      ...Constants.TEST_Profile,
                    },
                    userGuid: '469bfbee-ab95-4b3f-8103-e0bee94082be',
                  },
                },
              ],
            },
          },
        ],
      },
    } as IDeviceActivation;
    prismaMock.deviceActivation.count.mockResolvedValue(1);
    prismaMock.deviceActivation.findMany.mockResolvedValue([
      SAMPLE_DEVICE_ACTIVATION_DATA,
    ]);
    const apiSQSResp = {
      $metadata: 1,
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);

    request(testApplication)
      .post(`/internal/device/send-device-no-connectivity`)
      .send({
        devices: [
          {
            deviceAdmins: [
              {
                userGuid: '469bfbee-ab95-4b3f-8103-e0bee94082be',
                email: Constants.TEST_USER.email,
                lastName: Constants.TEST_USER.lastName,
                firstName: Constants.TEST_USER.firstName,
                profileId: Constants.TEST_Profile.id,
              },
            ],
            deviceStatusUpdatedOn:
              Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceStatusUpdatedOn,
            deviceName: Constants.SAMPLE_DEVICE_ACTIVATION_DATA.deviceName,
            deviceSerial: Constants.SAMPLE_DEVICE_INVENTORY_DATA.deviceSerial,
            id: 1,
          },
        ],
        count: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({ status: 200, message: 'success' });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});
