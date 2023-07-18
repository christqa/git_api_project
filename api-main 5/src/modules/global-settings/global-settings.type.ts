import { Prisma } from '@prisma/client';

export type IGlobalSettings = GlobalSettings;
export type GlobalSettings = {
  id: number;
  settingName: string;
  settingType: string;
  settingValue: string | number | Prisma.JsonObject;
  addedOn: Date;
  updatedOn: Date;
};
export type IGlobalSettingsWhere = Prisma.GlobalSettingsWhereInput;
export type IGlobalSettingsWhereUniqueInput =
  Prisma.GlobalSettingsWhereUniqueInput;
