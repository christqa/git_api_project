import {
  IUserConfigurationCreateInput,
  IUserConfigurationType,
} from '@modules/user-configuration/user-configuration.type';
import { Prisma } from '@prisma/client';
import prisma from '@core/prisma/prisma';
import { IUserConfigurationRequestDto } from '@modules/user-configuration/dtos/user-configuration.index.dto';

const { userConfiguration } = prisma;

const upsertUserConfiguration = (data: {
  profileId: number;
  configuration: IUserConfigurationRequestDto;
}): Promise<IUserConfigurationType> => {
  return userConfiguration.upsert({
    where: {
      profileId: data.profileId,
    },
    update: {
      ...data,
      // workaround to convert IUserConfiguration to Prisma.JsonObject
      configuration: data.configuration as unknown as Prisma.JsonObject,
    } as IUserConfigurationCreateInput,
    create: {
      ...data,
      // workaround to convert IUserConfiguration to Prisma.JsonObject
      configuration: data.configuration as unknown as Prisma.JsonObject,
    } as IUserConfigurationCreateInput,
  });
};

const getUserConfiguration = (
  profileId: number
): Promise<IUserConfigurationType | null> => {
  return userConfiguration.findUnique({
    where: {
      profileId,
    },
  });
};

export { upsertUserConfiguration, getUserConfiguration };
