import { AvailabilityType, Prisma } from '@prisma/client';

export interface IGetFirmwareResponseDto {
  virtualFirmware: string;
  isCurrent: boolean;
  addedOn: Date;
  releaseDate: Date;
  deviceModelId: number;
  fileName: string;
  locationMetaData: Prisma.JsonValue;
  md5CheckSum: string;
  availabilityType: AvailabilityType;
}
