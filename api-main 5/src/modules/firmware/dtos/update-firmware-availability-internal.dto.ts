import { AvailabilityType } from '@prisma/client';

export interface IUpdateFirmwareAvailabilityRequestDto {
  availabilityType: AvailabilityType;
}
