import { AdminController } from './ct-admin.controller';
import * as ctAdminService from './ct-admin.service';
import { IUserCtAdmin } from '@modules/user/user.type';
import userRepository from '@repositories/user.repository';
import { IEventWithDevice } from '@modules/device-events/device-events.type';
import eventsRepository from '@repositories/events.repository';
import deviceActivationRepository from '@repositories/device-activation.repository';
import { EventSource, DeviceStatus } from '@prisma/client';
import { userService } from '@modules/index/index.service';

let controller: AdminController;
const mockDevicesActivation = {
  deviceName: 'Toilet device',
  batteryStatus: 0,
  wiFiSSID: null,
  rssi: null,
  deviceStatusUpdatedOn: new Date('2022-12-28T12:17:56.568Z'),
  activatedOn: new Date('2022-12-16T00:00:00.000Z'),
  deviceFirmware: {
    firmware: {
      id: 1,
      virtualFirmware: '1.0.0',
    },
  },
  userActivated: {
    id: 2,
    userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
    email: 'dev@projectspectra.dev',
    firstName: 'string',
    lastName: 'string',
  },
  deviceInventory: {
    id: 38,
    deviceSerial: 'e4b0c506-e56a-5',
    manufacturingDate: new Date('2022-12-11T00:00:00.000Z'),
    events: [
      {
        id: 1,
        eventSource: EventSource.DeviceGenerated,
        generatedOn: new Date('2022-10-05T08:14:25.019Z'),
      },
    ],
  },
};
const mockUser: IUserCtAdmin = {
  userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
  authId: 'auth0|623addd74883ca0069d02e18',
  transient: false,
  email: 'user@projectspectra.dev',
  firstName: 'string',
  lastName: 'string',
  createdOn: new Date(),
  updatedOn: new Date(),
  numberOfActiveDevices: 1,
  isWelcomeEmailSent: false,
};

const mockEvent: IEventWithDevice = {
  id: 1,
  deviceId: 38,
  eventData: {
    data: [
      {
        startDate: '2022-10-05T08:00:00Z',
        endDate: '2022-10-05T08:00:00Z',
        color: 1,
        hasBlood: true,
        consistency: 2,
        durationInSeconds: 300,
      },
    ],
    type: 'Stool',
    group: 'Health',
    default: 'deviceSerial:AB-20221003-004|group:Health|type:Stool',
    profileId: '2',
    eventSource: 'ManualEntry',
    deviceSerial: 'AB-20221003-004',
  },
  eventSource: 'DeviceGenerated',
  generatedOn: new Date('2022-10-05T08:14:25.019Z'),
  deviceInventory: {
    id: 38,
    deviceSerial: 'e4b0c506-e56a-5',
    manufacturingDate: new Date('2022-12-11T00:00:00.000Z'),
    manufacturedForRegion: 'North America',
    deviceModelId: 1,
    bleMacAddress: '48-68-28-13-A4-48',
    wiFiMacAddress: '3E-94-C9-43-2D-D7',
    deviceMetadata: {},
    calibrationFileLocations: {},
    deviceStatus: DeviceStatus.IN_SERVICE,
    deviceActivation: [
      {
        id: 1,
        deviceId: 38,
        deviceFirmwareId: 1,
        timeZoneId: 491,
        deviceName: 'Toilet',
        deviceModelId: 1,
        deviceStatus: {},
        batteryStatus: 0,
        wiFiSSID: null,
        rssi: null,
        deviceStatusUpdatedOn: new Date('2022-12-28T12:17:56.568Z'),
        activatedOn: new Date('2022-12-16T00:00:00.000Z'),
        activatedBy: 2,
        deactivatedBy: null,
        deleted: null,
        isNotified: false,
      },
    ],
  },
};

const mockProfile = {
  id: 1,
  firstName: 'string',
  lastName: 'string',
  userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
  email: 'dev@projectspectra.dev',
  localCutoff: '',
};
beforeEach(() => {
  controller = new AdminController();
});
afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});
describe('ct-admin module', () => {
  test.skip('get devices endpoint', async () => {
    const resp = await controller.getDevices(1, 1);
    expect(resp).toBeDefined();
  });
  test('call ct-adminService getDevices', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findAllDevices')
      .mockResolvedValue([mockDevicesActivation]);
    jest.spyOn(deviceActivationRepository, 'count').mockResolvedValue(1);
    await ctAdminService.getDevices(0, 1);
    expect(deviceActivationRepository.findAllDevices).toHaveBeenCalledTimes(1);
    expect(deviceActivationRepository.count).toHaveBeenCalledTimes(1);
  });
  test('call ct-adminService getUsers', async () => {
    jest.spyOn(userRepository, 'count').mockResolvedValue(1);
    jest.spyOn(userRepository, 'findAll').mockResolvedValue([mockUser]);
    await ctAdminService.getUsers(0, 1);
    expect(userRepository.count).toHaveBeenCalled();
    expect(userRepository.findAll).toHaveBeenCalled();
  });
  test('call ct-adminService getEvents', async () => {
    jest.spyOn(eventsRepository, 'findAll').mockResolvedValue([mockEvent]);
    jest.spyOn(eventsRepository, 'count').mockResolvedValue(1);
    jest
      .spyOn(userService, 'getUserByProfileId')
      .mockResolvedValue(mockProfile);
    await ctAdminService.getEvents(0, 1);
    expect(eventsRepository.count).toHaveBeenCalled();
    expect(eventsRepository.findAll).toHaveBeenCalled();
  });
  test('dashboards stats', async () => {
    jest.spyOn(deviceActivationRepository, 'count').mockResolvedValue(1);
    jest.spyOn(eventsRepository, 'countEvensWithinTime').mockResolvedValue(1);
    jest.spyOn(userRepository, 'count').mockResolvedValue(1);
    await ctAdminService.getDashboardStats();
    expect(userRepository.count).toHaveBeenCalled();
    expect(deviceActivationRepository.count).toHaveBeenCalled();
    expect(eventsRepository.countEvensWithinTime).toHaveBeenCalled();
  });
});
