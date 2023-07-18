import { Prisma, Firmware, DeviceFirmware } from '@prisma/client';

export type IFirmware = Firmware;

export type IFirmwareCreateInput = Prisma.FirmwareUncheckedCreateInput;

export type IFirmwareWhereInput = Prisma.FirmwareWhereInput;

export type IFirmwareWhereUniqueInput = Prisma.FirmwareWhereUniqueInput;

export type IDeviceFirmware = DeviceFirmware;

export type IDeviceFirmwareExtended = DeviceFirmware & { firmware: IFirmware };

export type IDeviceFirmwareCreateInput =
  Prisma.DeviceFirmwareUncheckedCreateInput;

export type IDeviceFirmwareWhereInput = Prisma.DeviceFirmwareWhereInput;

export type IDeviceFirmwareSelect = Prisma.DeviceFirmwareSelect;

export type IDeviceFirmwareUniqueInput = Prisma.DeviceFirmwareWhereUniqueInput;

export type IDeviceFirmwareUncheckedUpdateInput =
  Prisma.DeviceFirmwareUncheckedUpdateInput;

export type IDeviceFirmwareUncheckedUpdateManyInput =
  Prisma.DeviceFirmwareUncheckedUpdateManyInput;

export type IFirmwareUncheckedUpdateInput = Prisma.FirmwareUncheckedUpdateInput;

export type IDeviceFirmwareBatchCount = Prisma.BatchPayload;

export enum ReleaseType {
  GENERAL_PUBLIC = 'GENERAL_PUBLIC',
  GRADUAL = 'GRADUAL',
  INTERNAL = 'INTERNAL',
}
export interface ResponseMetaData {
  newFirmwareVersion: number;
  batteryLevel: string;
}
