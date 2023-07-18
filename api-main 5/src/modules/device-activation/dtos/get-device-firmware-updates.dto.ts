import { Prisma } from '@prisma/client';

export interface IGetDeviceFirmwareUpdateRequestDto {
  deviceSerial: string;
}

export interface IGetDeviceFirmwareUpdateResponseDto {
  deviceSerial: string;
  virtualFwVersion: string;
  filename: string;
  locationMetadata: Prisma.JsonValue;
  md5Checksum: string;
}
