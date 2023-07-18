import { PrismaClient } from '@prisma/client';
import {
  createDefaultNotificationSettings,
  findNotificationSettings,
  findNotificationSettingsByUser,
  updateNotificationSettings,
} from './notification-settings.service';
import * as notificationSettingsRepository from '@repositories/notification-settings.repository';
import {
  INotificationSettingsResponse,
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from './notification-settings.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const notificationSettings = [
  {
    push: true,
    sms: false,
    option: 'immediately',
    type: 'healthAlerts',
  },
  {
    push: true,
    sms: true,
    option: 'immediately',
    type: 'deviceIssues',
  },
] as INotificationSettingsResponse[];
const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(PrismaClient.prototype, '$transaction').mockResolvedValue(null);
  jest
    .spyOn(notificationSettingsRepository, 'findMany')
    .mockResolvedValue(notificationSettings);
  jest.spyOn(notificationSettingsRepository, 'update').mockResolvedValue();
  jest.spyOn(notificationSettingsRepository, 'createMany').mockResolvedValue({
    count: 3,
  });
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Notification Settings', () => {
  test('should test findNotificationSettings function', async () => {
    await findNotificationSettings('1');
    expect(userService.findByUserGuid).toBeCalled();
    expect(notificationSettingsRepository.findMany).toBeCalled();
  });

  test('should test findNotificationSettings function (create settings if not exists)', async () => {
    jest
      .spyOn(notificationSettingsRepository, 'findMany')
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() => Promise.resolve(notificationSettings));

    await findNotificationSettings('1');
    expect(
      jest.spyOn(notificationSettingsRepository, 'createMany')
    ).toBeCalled();
  });

  test('should test updateNotificationSettings function', async () => {
    await updateNotificationSettings('397322cd-6405-464f-8fc6-4dc28971ef2f', [
      {
        type: NotificationSettingsTypes.deviceIssues,
        option: NotificationSettingsOptions.immediately,
        sms: false,
        push: true,
        email: true,
      },
    ]);
  });

  test('should test createNotificationSettings function', async () => {
    await createDefaultNotificationSettings(1);
  });

  test('should test findNotificationSettingsByUser function', async () => {
    await findNotificationSettingsByUser('1');
    expect(userService.findByUserGuid).toBeCalled();
    expect(notificationSettingsRepository.findMany).toBeCalled();
  });
});
