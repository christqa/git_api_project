import { AvailabilityType } from '@prisma/client';

export interface IPostFirmwaresInternalRequestDto {
  virtualFirmware: string;
  releaseDate: Date;
  deviceModelId: number;
  fileName: string;
  locationMetaData: {
    platform: string;
    bucket: string;
    keyPrefix: string;
  };
  md5CheckSum: string;
  availabilityType: AvailabilityType;
}
