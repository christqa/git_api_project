import { Prisma } from '@prisma/client';

export interface IGetGlobalSetttingsInternalResponseDto {
  id: number;
  settingName: string;
  settingType: string;
  settingValue: string | number | Prisma.JsonObject;
  addedOn: Date;
  updatedOn: Date;
}
