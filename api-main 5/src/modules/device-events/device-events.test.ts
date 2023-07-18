import { EventSource } from '@prisma/client';
import {
  deviceEventsService,
  deviceInventoryService,
} from '@modules/index/index.service';
import { DeviceStatus } from '@prisma/client';
import eventsRepository from '@repositories/events.repository';

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
  deviceStatus: DeviceStatus.IN_SERVICE,
  deviceActivation: [
    {
      id: 1,
      deviceId: 1,
      activatedBy: 0,
      timeZoneId: 1,
      deviceName: 'Smart Toilet',
      deviceModelId: 1,
      deviceStatus: {},
      batteryStatus: 0,
      wiFiSSID: '',
      rssi: 0,
      deviceStatusUpdatedOn: new Date(),
      activatedOn: new Date(),
      deactivatedBy: null,
      deleted: null,
    },
  ],
};

const eventsObject = {
  id: 1,
  deviceId: 1,
  eventData: {},
  eventSource: EventSource.DeviceGenerated,
  generatedOn: new Date(),
};

beforeEach(() => {
  jest
    .spyOn(deviceInventoryService, 'getDevice')
    .mockResolvedValue(deviceInventoryObject);
  jest.spyOn(eventsRepository, 'create').mockResolvedValue(eventsObject);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('DeviceEvents', () => {
  test('should test saveEvent function', async () => {
    await deviceEventsService.saveEvent({
      deviceSerial: '73b-015-04-2f7',
      eventData: {},
      eventSource: EventSource.DeviceGenerated,
    });
    expect(deviceInventoryService.getDevice).toHaveBeenCalled();
    expect(eventsRepository.create).toHaveBeenCalled();
  });

  test('should test saveEvent function (without device serial)', async () => {
    await deviceEventsService.saveEvent({
      eventData: {},
      eventSource: EventSource.SystemGenerated,
    });
    expect(eventsRepository.create).toHaveBeenCalled();
  });
});
