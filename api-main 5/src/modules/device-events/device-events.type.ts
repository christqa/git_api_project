import {
  Events,
  Prisma,
  DeviceActivation,
  DeviceInventory,
} from '@prisma/client';

export type IEvents = Events;
export type IEventsCreateInput = Prisma.EventsUncheckedCreateInput;
export type IEventsWhereUniqueInput = Prisma.EventsWhereUniqueInput;
export type IEventsWhereInput = Prisma.EventsWhereInput;
export type IEventWithDevice = Events & {
  deviceInventory:
    | (DeviceInventory & { deviceActivation: DeviceActivation[] })
    | null;
};

export enum IEventWithDeviceSortBy {
  eventId = 'eventId',
  deviceId = 'deviceId',
  deviceName = 'deviceName',
  eventSource = 'eventSource',
  generatedOn = 'generatedOn',
}
