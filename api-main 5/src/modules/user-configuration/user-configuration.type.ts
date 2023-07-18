import { Prisma, UserConfiguration } from '@prisma/client';

export type IUserConfigurationType = UserConfiguration;

export type IUserConfigurationCreateInputType = Omit<
  IUserConfigurationType,
  'id'
>;

export type IUserConfigurationCreateInput =
  Prisma.UserConfigurationUncheckedCreateInput;

export type BaseLineValueType = {
  gutHealth: number | null;
  morningHydration: number | null;
  afternoonHydration: number | null;
  nightHydration: number | null;
};
