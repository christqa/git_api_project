import { InvitationType, PrismaClient } from '@prisma/client';
import {
  IGroupUser,
  IGroupUsersCreateInput,
  IGroupUsersUpdateInput,
  IGroupUsersUniqueInput,
  IGroupUsersWhereInput,
  IGroupUsersBatchPayload,
  IGroupUserExtended,
  IGroupUserExtendedWithDevicesUsersInvitations,
  IGroupMembers,
} from '@modules/groups/groups.type';

import prisma from '@repositories/prisma.use.repository';
import { IUser } from '@modules/user/user.type';

const { groupUsers } = prisma;

const create = (
  data: IGroupUsersCreateInput,
  prismaTr?: PrismaClient
): Promise<IGroupUser> => {
  return (prismaTr || prisma).groupUsers.create({
    data,
  });
};

const findFirst = (
  where: IGroupUsersWhereInput
): Promise<IGroupUser | null> => {
  return groupUsers.findFirst({
    where,
  });
};

const findMany = (where: IGroupUsersWhereInput): Promise<IGroupUser[]> => {
  return groupUsers.findMany({
    where,
  });
};

const findOne = (where: IGroupUsersUniqueInput): Promise<IGroupUser | null> => {
  return groupUsers.findUnique({ where });
};

const count = (where: IGroupUsersWhereInput): Promise<number> => {
  return groupUsers.count({
    where,
  });
};

const update = (
  where: IGroupUsersUniqueInput,
  data: IGroupUsersUpdateInput,
  prismaTr?: PrismaClient
): Promise<IGroupUser> => {
  return (prismaTr || prisma).groupUsers.update({
    data,
    where,
  });
};

const remove = (where: IGroupUsersUniqueInput): Promise<IGroupUser> => {
  return groupUsers.delete({
    where,
  });
};

const removeMany = (
  where: IGroupUsersWhereInput,
  prismaTr?: PrismaClient
): Promise<IGroupUsersBatchPayload> => {
  return (prismaTr || prisma).groupUsers.deleteMany({
    where,
  });
};

const groupUsersFindMany = (
  where: IGroupUsersWhereInput
): Promise<(IGroupUser & { user: IUser })[]> => {
  return groupUsers.findMany({
    where,
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: [
      {
        role: 'asc',
      },
      {
        addedOn: 'asc',
      },
    ],
  });
};

const groupMembersFindMany = async (
  groupId: number,
  isAdmin: boolean,
  {
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }
): Promise<{ count: number; groupUsers: IGroupMembers[] }> => {
  const groupMembersQuery = `
    SELECT "GroupUsers"."added_on" AS "added_on",
      "GroupUsers"."group_user_role" AS "role",
      ACCOUNT."user_guid" AS "user_guid",
      ACCOUNT."first_name" AS "first_name",
      ACCOUNT."last_name" AS "last_name",
      ACCOUNT."email" AS "email",
      0 AS "pending"
    FROM "GroupUsers"
      LEFT JOIN (
        SELECT "Account"."id",
          "Account"."user_guid",
          "Account"."first_name",
          "Account"."last_name",
          "Account"."email"
        FROM "Account",
          "Profile"
        WHERE "Account"."id" = "Profile"."user_id"
          AND "Account"."transient" = false
      ) ACCOUNT ON ACCOUNT."id" = "GroupUsers"."user_id"
    WHERE "GroupUsers"."group_id" = ${groupId}
      AND "GroupUsers"."deleted" IS NULL
      AND ACCOUNT."id" IS NOT NULL
    ${
      isAdmin
        ? `
    UNION
    SELECT NULL AS "added_on",
      "Invitations"."group_access_level" AS "role",
      NULL AS "user_guid",
      NULL AS "first_name",
      NULL AS "last_name",
      (
        CASE
          WHEN ACCOUNT."email" IS NOT NULL THEN ACCOUNT."email"
          ELSE "Invitations"."to_user_email"
        END
      ) AS "email",
      1 AS "pending"
    FROM "Invitations"
      LEFT JOIN (
        SELECT "Account"."id",
          "Account"."email"
        FROM "Account"
      ) ACCOUNT ON ACCOUNT."id" = "Invitations"."to_user_id"
    WHERE (
        "Invitations"."invite_type" = 'join_group'
        AND "Invitations"."to_group_id" = ${groupId}
        AND "Invitations"."expires_at" > '${new Date().toISOString()}'
        AND "Invitations"."accepted_at" IS NULL
        AND "Invitations"."rejected_at" IS NULL
        AND "Invitations"."deleted" IS NULL
      )`
        : ``
    }
  `;
  const groupMembersOrderLimitQuery = `ORDER BY "pending" ASC, "role" ASC, "added_on" DESC OFFSET ${skip} LIMIT ${take}`;
  const countGroupMembersQuery = `SELECT COUNT(*)::integer AS count FROM (${groupMembersQuery}) groupUsers LIMIT 1`;

  const [count, result] = await Promise.all([
    prisma.$queryRawUnsafe(countGroupMembersQuery) as unknown as {
      count: number;
    }[],
    prisma.$queryRawUnsafe(
      `${groupMembersQuery} ${groupMembersOrderLimitQuery}`
    ) as unknown as IGroupMembers[],
  ]);

  return {
    count: count[0].count,
    groupUsers: result,
  };
};

/**
 * Invited members groups are sorted in descending order based on “join date”
 */
const groupsFindMany = async (
  where: IGroupUsersWhereInput,
  {
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }
): Promise<{ count: number; groupUsers: IGroupUserExtended[] }> => {
  const [count, result] = await Promise.all([
    groupUsers.count({ where }),
    groupUsers.findMany({
      where,
      skip,
      take,
      include: {
        group: true,
      },
      orderBy: {
        addedOn: 'asc',
      },
    }),
  ]);

  return {
    count,
    groupUsers: result,
  };
};

const groupsFindManyMe = (
  where: IGroupUsersWhereInput
): Promise<IGroupUserExtended[]> => {
  return groupUsers.findMany({
    where,
    include: {
      group: true,
    },
    orderBy: {
      addedOn: 'asc',
    },
  });
};

/**
 * Invited members groups are sorted in descending order based on “join date”
 */
const groupsSummaryFindMany = async (
  where: IGroupUsersWhereInput,
  {
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }
): Promise<{
  count: number;
  groupUsers: IGroupUserExtendedWithDevicesUsersInvitations[];
}> => {
  const [count, result] = await Promise.all([
    groupUsers.count({ where }),
    groupUsers.findMany({
      where,
      skip,
      take,
      include: {
        group: {
          include: {
            groupDevices: {
              where: {
                deleted: null,
              },
              include: {
                deviceInventory: {
                  include: {
                    deviceActivation: {
                      where: {
                        deleted: null,
                      },
                    },
                  },
                },
              },
            },
            groupUsers: {
              where: {
                deleted: null,
              },
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            invitations: {
              where: {
                inviteType: InvitationType.joingroup,
                expiresAt: {
                  gt: new Date(),
                },
                acceptedAt: null,
                rejectedAt: null,
                deleted: null,
              },
              include: {
                toUser: true,
              },
            },
          },
        },
      },
      orderBy: {
        addedOn: 'asc',
      },
    }),
  ]);

  return {
    count,
    groupUsers: result,
  };
};

export default {
  create,
  findFirst,
  findOne,
  count,
  update,
  remove,
  removeMany,
  findMany,
  groupUsersFindMany,
  groupMembersFindMany,
  groupsFindMany,
  groupsFindManyMe,
  groupsSummaryFindMany,
};
