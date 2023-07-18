import { IUser } from '@modules/user/user.type';
import { IStoolData, IUrineData } from '@modules/analytes/analytes.type';
import {
  GroupUserRoles,
  DeviceInventory,
  NotificationSettings,
  Prisma,
  PushToken,
  DeviceStatus,
} from '@prisma/client';
import {
  ICumulativeScore,
  TimeOfDayEnum,
} from '@modules/cumulative-score/cumulative-score.type';
import {
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from '@modules/notification-settings/notification-settings.type';
import { IGroup, IGroupUser } from '@modules/groups/groups.type';
import { IProfile } from '@modules/profile/profile.type';

/**
 * The test user for test cases
 */
export const TEST_USER: IUser = {
  id: 1,
  userGuid: '397322cd-6405-464f-8fc6-4dc28971ef2f',
  email: 'test-user@projectspectra.dev',
  authId: '123',
  firstName: 'Austin',
  lastName: 'Gispanski',
  localCutoff: '',
} as IUser;

export const TEST_ACTIVATED_DEVICE = [
  {
    deviceSerial: '123ABC',
    deviceActivation: [
      {
        id: 123,
        deviceName: 'ABCD',
        timeZoneId: 441,
        activatedOn: new Date(),
      },
    ],
  },
] as unknown as DeviceInventory[];

export const TEST_Profile: IProfile = {
  id: 1,
} as IProfile;

/**
 * A valid token
 */
export const VALID_TOKEN = 'valid-token';

/**
 * A invalid token
 */
export const INVALID_TOKEN = 'invalid-token';

/**
 * The authorization request key
 */
export const AUTHORIZATION_REQUEST_KEY = 'Authorization';

/**
 * Format of time stamps
 */
export const FORMAT_TIMESTAMP = 'YYYY-MM-DD';

/**
 * The Urination endpoint
 */
export const URINATIONS_ENDPOINT = '/urinations';

/**
 * The Stool endpoint
 */
export const STOOLS_ENDPOINT = '/stools';

/**
 * The Stool endpoint
 */
export const MANUAL_ENTER_ENDPOINT = '/analytes-manual';

/**
 * The Stool endpoint
 */
export const CUMULATIVE_SCORES_ENDPOINT = '/cumulative-score';

/**
 * The Data Sharing Agreements endpoint
 */
export const DATA_SHARING_AGREEMENTS_ENDPOINT = '/data-sharing-agreements';

/**
 * The Data Sharing Agreements endpoint
 */
export const DATA_STORE_ENDPOINT = '/data-store';

/**
 * The Devices endpoint
 */
export const DEVICES_ENDPOINT = '/device';

/**
 * The Device activation endpoint
 */
export const DEVICE_ACTIVATION_ENDPOINT = '/device-activation';

/**
 * The Invites endpoint
 */
export const INVITES_ENDPOINT = '/invites';

/**
 * The Messages endpoint
 */
export const MESSAGES_ENDPOINT = '/messages';

/**
 * The Notification Settings endpoint
 */
export const NOTIFICATION_SETTINGS_ENDPOINT = '/notification-settings';

/**
 * The Notification endpoint
 */
export const NOTIFICATIONS_PUSH_TOKENS_ENDPOINT = '/notifications/push-tokens';

/**
 * The PDF Report endpoint
 */
export const PDF_REPORT_ENDPOINT = '/pdf-report';

/**
 * The Reference Data endpoint
 */
export const REFERENCE_DATA_ENDPOINT = '/reference-data';

/**
 * The Reference Data endpoint
 */
export const USERS_ENDPOINT = '/users';
/**
 * Sample User Guid
 */
export const userGuid = 'dbb96f0e-03fc-4288-aa80-9d0ff0cc10cc';

/**
 * Sample Urination Data for testing purposes
 */
export const SAMPLE_URINATION_DATA: IUrineData = {
  id: 1,
  profileId: 1,
  deviceId: null,
  firstInDay: false,
  color: 2,
  durationInSeconds: 100,
  concentration: new Prisma.Decimal(1.1),
  createdOn: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  scoreDate: new Date(),
  offsetTz: '+00:00',
} as IUrineData;

/**
 * Sample Urination Data for testing purposes
 */
export const SAMPLE_STOOL_DATA: IStoolData = {
  id: 1,
  profileId: 1,
  deviceId: 1,
  color: 2,
  hasBlood: false,
  durationInSeconds: 300,
  consistency: 2,
  createdOn: new Date(),
  startDate: new Date(),
  endDate: new Date(),
  scoreDate: new Date(),
} as IStoolData;

/**
 * Sample Cumulative Score Data
 */
export const SAMPLE_CUMULATIVE_SCORE_DATA = {
  id: 1,
  userGuid: '1',
  profileId: 1,
  value: 0,
  type: 'hydration',
  date: new Date(),
  scoreOfRecord: false,
  timeOfDay: TimeOfDayEnum.night,
  trendIndicator: null,
} as ICumulativeScore;

/**
 * Sample data store for testing
 */
export const SAMPLE_DATA_STORE = {
  id: 1,
  userId: 1,
  userGuid: '1',
  data: {
    isBathroomUsageCompleted: false,
    isLifestyleCompleted: false,
    isMedicalConditionsCompleted: true,
    isMedicationsCompleted: false,
    batteryLevel: 'high',
    batteryPercentage: 100,
  },
};

/**
 * Sample device inventory data for testing
 */
export const SAMPLE_DEVICE_INVENTORY_DATA = {
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
};

/**
 * Sample device inventory data for testing
 */
export const SAMPLE_DEVICE_ACTIVATION_DATA = {
  id: 1,
  deviceId: 1,
  deviceFirmwareId: 1,
  activatedBy: 1,
  timeZoneId: 1,
  deviceName: 'Smart Toilet',
  deviceModelId: 1,
  deviceStatus: {},
  batteryStatus: 12,
  wiFiSSID: '',
  rssi: 0,
  deviceStatusUpdatedOn: new Date(),
  isNotified: false,
  activatedOn: new Date(),
  deactivatedBy: null,
  deleted: null,
};

/**
 * Sample device data for testing
 */
export const SAMPLE_GROUP_DATA = {
  id: 1,
  groupName: 'Home',
  createdOn: new Date(),
  deletedBy: null,
  deleted: null,
} as IGroup;
export const SAMPLE_GROUP_USER_DATA = {
  id: 1,
  userId: 1,
  groupId: 1,
  addedOn: new Date(),
  role: GroupUserRoles.admin,
  deleted: null,
} as IGroupUser;
export const SAMPLE_GROUP_DEVICE_DATA = {
  id: 1,
  groupId: 1,
  deviceId: 1,
  addedBy: 1,
  addedOn: new Date(),
  removedBy: null,
  deleted: null,
};

/**
 * Sample Message for testing
 */
export const SAMPLE_MESSAGE_DATA = {
  id: 1,
  userId: 1,
  messageGuid: '0b4ace5c-651c-4955-a46d-f185f6ddd59d',
  title: 'Message Title',
  timestamp: new Date(),
  message: 'Message Content',
  messageTypeId: 1,
  read: false,
  deleted: null,
  metaData: {},
};

/**
 * Sample Notification Settings Data for testing
 */
export const SAMPLE_NOTIFICATION_SETTINGS_DATA = {
  id: 1,
  userId: 1,
  push: false,
  sms: false,
  option: NotificationSettingsOptions.daily,
  type: NotificationSettingsTypes.deviceIssues,
} as NotificationSettings;

/**
 * Sample push token notification for testings
 */
export const SAMPLE_PUSH_TOKEN_NOTIFICATION = {
  id: 1,
  userId: 1,
  deviceToken: 'token',
  endpointId: 'endpoint-id',
  timestamp: new Date(),
} as PushToken;
