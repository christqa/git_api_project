import { IGetDevicesResponseDto } from '@modules/ct-admin/dtos/devices.dto';
import userRepository from '@repositories/user.repository';
import { IGetUsersResponseDto } from '@modules/ct-admin/dtos/users.dto';
import {
  ExtendedEvent,
  IGetEventsResponseDto,
} from '@modules/ct-admin/dtos/events.dto';
import eventsRepository from '@repositories/events.repository';
import deviceActivationRepository from '@repositories/device-activation.repository';
import { userService } from '@modules/index/index.service';
import { IEventWithDevice } from '@modules/device-events/device-events.type';
import { IGetDashboardStatsResponseDto } from '@modules/ct-admin/dtos/dashboard.dto';

const getDevices = async (
  skip: number,
  take: number,
  sortBy?: string,
  orderBy?: string
): Promise<IGetDevicesResponseDto> => {
  const total = await deviceActivationRepository.count();
  const devices = await deviceActivationRepository.findAllDevices(
    skip,
    take,
    sortBy,
    orderBy
  );
  return {
    total,
    devices: devices.map((device) => ({
      deviceId: device.deviceInventory.id,
      deviceSerial: device.deviceInventory.deviceSerial,
      batteryPercentage: `${device.batteryStatus}%`,
      wiFiNetworkSSID: device.wiFiSSID,
      connectionStrength: device.rssi,
      deviceStatusUpdatedOn: device.deviceStatusUpdatedOn,
      activatedOn: device.activatedOn,
      manufacturingDate: device.deviceInventory.manufacturingDate,
      deviceName: device.deviceName,
      activatedBy: {
        firstName: device.userActivated.firstName,
        lastName: device.userActivated.lastName,
        userGuid: device.userActivated.userGuid,
        email: device.userActivated.email,
      },
      deviceFirmware: device.deviceFirmware?.firmware,
      lastEvent: {
        date: device.deviceInventory.events[0]?.generatedOn,
        eventId: device.deviceInventory.events[0]?.id,
        eventType: device.deviceInventory.events[0]?.eventSource,
      },
    })),
  };
};

const getUsers = async (
  skip: number,
  take: number,
  sortBy?: string,
  orderBy?: string
): Promise<IGetUsersResponseDto> => {
  const total = await userRepository.count();
  const accounts = await userRepository.findAll(skip, take, sortBy, orderBy);
  return {
    total,
    accounts: accounts.map((account) => ({
      userGuid: account.userGuid,
      authId: account.authId,
      email: account.email,
      transient: account.transient,
      firstName: account.firstName,
      lastName: account.lastName,
      totalDevices: account.numberOfActiveDevices,
    })),
  };
};

const getEvents = async (
  skip: number,
  take: number,
  sortBy?: string,
  orderBy?: string
): Promise<IGetEventsResponseDto> => {
  const total = await eventsRepository.count();
  const events = await eventsRepository.findAll(skip, take, sortBy, orderBy);
  const extendedEvents = await getExtendedEvents(events);

  return { total, events: extendedEvents };
};

/* private */
const getExtendedEvents = async (
  events: IEventWithDevice[]
): Promise<ExtendedEvent[]> => {
  const extendedEvents: ExtendedEvent[] = [];
  for (const event of events) {
    const processedEvent: ExtendedEvent = {
      id: event.id,
      deviceId: event.deviceId,
      eventData: event.eventData,
      eventSource: event.eventSource,
      generatedOn: event.generatedOn,
      deviceName: event.deviceInventory?.deviceActivation[0]?.deviceName,
    };
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventData = event.eventData as unknown as any;
      let profileId: number;
      if (eventData.profileId) {
        profileId = +eventData.profileId;
      }
      if (eventData.Message) {
        const message = JSON.parse(eventData.Message);
        if (message) {
          profileId = +message?.profileId;
        }
      }
      // @ts-ignore
      if (profileId) {
        const user = await userService.getUserByProfileId(profileId);
        if (user) {
          processedEvent.user = {
            firstName: user.firstName,
            lastName: user.lastName,
            userGuid: user.userGuid,
            email: user.email,
          };
        }
      }
    } catch (error) {
      /* empty */
    }
    extendedEvents.push(processedEvent);
  }
  return extendedEvents;
};

const getDashboardStats = async (): Promise<IGetDashboardStatsResponseDto> => {
  const totalUsers = await userRepository.count();
  const totalDevices = await deviceActivationRepository.count();
  const startDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000); //last 24 hours
  const lastDayEventsCount = await eventsRepository.countEvensWithinTime(
    startDate
  );
  return Promise.resolve({
    totalUsers,
    totalDevices,
    lastDayEventsCount,
  });
};

export { getDevices, getUsers, getEvents, getDashboardStats };
