import prisma from '@core/prisma/prisma';
import { getDeviceTimeZoneOffset } from '@modules/device-activation/device-activation.service';

import {
  IUser,
  IUserCreate,
  IUserCtAdmin,
  IUserCtAdminSortBy,
  IUserUniqueInput,
  IUserUpdate,
  IUserWhereInput,
} from '@modules/user/user.type';
import { Prisma, PrismaClient } from '@prisma/client';

const { account } = prisma;

const create = async (
  data: IUserCreate,
  prismaTr?: PrismaClient
): Promise<IUser> => {
  return (prismaTr || prisma).account.create({
    data,
  });
};

const createOrUpdate = async (data: IUserCreate): Promise<IUser> => {
  return account.upsert({
    where: { authId: data.authId },
    update: data,
    create: data,
  });
};

const findOne = (where: IUserUniqueInput): Promise<IUser | null> => {
  return account.findUnique({ where });
};

const findOneByDeviceSerial = (deviceSerial: string): Promise<IUser | null> => {
  return account
    .findFirst({
      where: {
        groupUsers: {
          some: {
            deleted: null,
            group: {
              deleted: null,
              groupDevices: {
                some: {
                  deleted: null,
                  deviceInventory: {
                    deviceSerial,
                    deviceActivation: {
                      some: {
                        deactivatedBy: null,
                        deleted: null,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      include: {
        groupUsers: {
          where: {
            deleted: null,
          },
          select: {
            group: {
              select: {
                groupDevices: {
                  where: {
                    deleted: null,
                  },
                },
              },
            },
          },
        },
      },
    })
    .then(async (item) => {
      if (!item) {
        return null;
      }

      const { groupUsers, ...userDetails } = item;
      const devicesUniqueMap: { [deviceId: number]: true } = {};
      const user: IUser = {
        ...userDetails,
        userDevices: [],
      };

      for (const groupUser of groupUsers) {
        for (const groupDevice of groupUser.group.groupDevices) {
          if (!devicesUniqueMap[groupDevice.deviceId]) {
            user.userDevices!.push({
              id: groupDevice.deviceId,
              offsetTz: await getDeviceTimeZoneOffset(groupDevice.deviceId),
            });
          }
          devicesUniqueMap[groupDevice.deviceId] = true;
        }
      }

      return user;
    });
};

const findMe = (authId: string): Promise<IUser | null> => {
  return account.findFirst({
    where: { authId },
    include: {
      profile: {
        select: {
          id: true,
          dob: true,
          regionalPref: true,
          weightLbs: true,
          heightIn: true,
          userId: true,
          genderId: true,
          medications: {
            select: {
              id: true,
            },
          },
          medicalConditions: {
            select: {
              id: true,
            },
          },
          urinationsPerDayId: true,
          bowelMovementId: true,
          exerciseIntensityId: true,
          lifeStyleId: true,
        },
      },
      sentInvitations: {
        select: {
          toUserEmail: true,
          permissions: true,
          sentAt: true,
          expiresAt: true,
          acceptedAt: true,
          toUser: true,
        },
      },
      receivedInvitations: {
        select: {
          invitationId: true,
          toUserEmail: true,
          permissions: true,
          sentAt: true,
          expiresAt: true,
          acceptedAt: true,
          fromUser: true,
        },
      },
      dataSharingAgreementTo: {
        select: {
          agreementId: true,
          permissions: true,
          agreedAt: true,
          revokedAt: true,
          toUser: true,
        },
      },
      dataSharingAgreementFrom: {
        select: {
          agreementId: true,
          permissions: true,
          agreedAt: true,
          revokedAt: true,
          fromUser: true,
        },
      },
    },
  });
};

const update = (
  where: IUserUniqueInput,
  data: IUserUpdate,
  prismaTr?: PrismaClient
): Promise<IUser> => {
  return (prismaTr || prisma).account.update({
    data,
    where,
  });
};

const updateMany = (
  where: IUserUniqueInput,
  data: IUserUpdate
): Promise<Prisma.BatchPayload> => {
  return account.updateMany({
    data,
    where,
  });
};

const remove = (where: IUserUniqueInput): Promise<IUser> => {
  return account.delete({
    where,
  });
};

const findFirst = (where: IUserWhereInput): Promise<IUser | null> => {
  return account.findFirst({
    where,
  });
};

const findFirstByProfileId = (
  profileId: number
): Promise<{
  id: number;
  userGuid: string;
  email: string;
  localCutoff: string;
  firstName: string;
  lastName: string;
} | null> => {
  return account.findFirst({
    select: {
      id: true,
      userGuid: true,
      email: true,
      localCutoff: true,
      firstName: true,
      lastName: true,
    },
    where: { profile: { id: profileId } },
  });
};

// This also returns the transient accounts for the CT Admin only
const findAll = async (
  skip: number,
  take: number,
  sortBy?: string,
  orderBy?: string
): Promise<IUserCtAdmin[]> => {
  let sortByField: string | undefined;
  if (sortBy) {
    switch (sortBy) {
      case IUserCtAdminSortBy.firstName:
        sortByField = 'first_name';
        break;
      case IUserCtAdminSortBy.lastName:
        sortByField = 'last_name';
        break;
      case IUserCtAdminSortBy.email:
        sortByField = 'email';
        break;
      case IUserCtAdminSortBy.numberOfActiveDevices:
        sortByField = 'group_devices_count';
        break;
      case IUserCtAdminSortBy.userGuid:
        sortByField = 'user_guid';
        break;
      default:
        break;
    }
  }

  const query = `
    SELECT
      "Account".*,
      COUNT("GroupDevices".id)::integer AS group_devices_count
    FROM "Account"
      LEFT JOIN "GroupUsers"
          LEFT JOIN "GroupDevices" ON "GroupDevices".group_id = "GroupUsers".group_id AND "GroupDevices".deleted IS NULL
        ON "GroupUsers".user_id = "Account".id AND "GroupUsers".deleted IS NULL
    GROUP BY "Account".id
    ${sortByField ? `ORDER BY ${sortByField} ${orderBy}` : ''}
    OFFSET ${skip} LIMIT ${take};
  `;

  const result = (await prisma.$queryRawUnsafe(query)) as any[];
  return result.map((item) => ({
    email: item.email,
    firstName: item.firstName,
    lastName: item.lastName,
    transient: item.transient,
    authId: item.authId,
    userGuid: item.userGuid,
    createdOn: item.createdOn,
    updatedOn: item.updatedOn,
    numberOfActiveDevices: item.groupDevicesCount,
    isWelcomeEmailSent: item.isWelcomeEmailSent,
  }));
};

const count = (): Promise<number> => {
  return account.count();
};

const usersFindMany = async (
  {
    skip,
    take,
  }: {
    skip: number;
    take: number;
  },
  where?: IUserWhereInput
): Promise<{ count: number; users: IUser[] }> => {
  if (where) {
    if (where.AND) {
      where.AND = { transient: false, ...where.AND };
    } else {
      where.AND = {
        transient: false,
      };
    }
  } else {
    where = {
      AND: {
        transient: false,
      },
    };
  }

  const [count, result] = await Promise.all([
    account.count({ where }),
    account.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
          },
        },
      },
      skip,
      take,
    }),
  ]);

  return {
    count,
    users: result,
  };
};

const findManyByDeviceTZ = (
  gmt: string,
  skip: number,
  take: number
): Promise<
  { userGuid: string; email: string; profile: { id: number } | null }[]
> => {
  return account.findMany({
    skip,
    take,
    where: {
      transient: false,
      groupUsers: {
        some: {
          deleted: null,
          group: {
            deleted: null,
            groupDevices: {
              some: {
                deleted: null,
                deviceInventory: {
                  deviceActivation: {
                    some: {
                      deactivatedBy: null,
                      deleted: null,
                      timeZone: {
                        gmt: {
                          startsWith: gmt,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      profile: {
        id: {
          not: undefined,
        },
      },
    },
    select: {
      userGuid: true,
      email: true,
      profile: {
        select: {
          id: true,
        },
      },
    },
  });
};

export default {
  create,
  createOrUpdate,
  findOne,
  update,
  updateMany,
  remove,
  findMe,
  findFirst,
  findFirstByProfileId,
  findOneByDeviceSerial,
  findAll,
  count,
  usersFindMany,
  findManyByDeviceTZ,
};
