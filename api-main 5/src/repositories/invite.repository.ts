import { InvitationType, PrismaClient } from '@prisma/client';
import {
  IInvitations,
  IInvitationsInclude,
  IInvitationsWhereInput,
  IInvitationsWhereUniqueInput,
  InviteUncheckedUpdateManyInput,
} from '@modules/invite/invite.type';
import prisma from '@repositories/prisma.use.repository';
import moment from 'moment';
import config from '@core/enviroment-variable-config';

const { invitations } = prisma;

const create = (
  data: IInvitations,
  prismaTr?: PrismaClient
): Promise<IInvitations> => {
  return (prismaTr || prisma).invitations.create({
    data,
  });
};

const update = (
  where: IInvitationsWhereUniqueInput,
  data: IInvitations,
  prismaTr?: PrismaClient
): Promise<IInvitations> => {
  return (prismaTr || prisma).invitations.update({
    where,
    data,
  });
};

const getNumberOfinvitesSentByUserToDestinationUser = async (
  toUser: string | number,
  groupId: number
): Promise<number> => {
  const curDate = moment().utcOffset(0);
  const date24HAgo = curDate
    .clone()
    .subtract(config.maxInvitesForAdminForSameUserSameGroupPeriodHours, 'hours')
    .toDate();
  const whereParams: IInvitationsWhereInput = {
    fromUser: {
      groupUsers: {
        some: {
          role: 'admin',
          groupId,
        },
      },
    },
    inviteType: InvitationType.joingroup,
    acceptedAt: null,
    rejectedAt: null,
    sentAt: {
      gte: date24HAgo,
      lte: curDate.toDate(),
    },
    toGroupId: groupId,
  };
  if (typeof toUser === 'number') {
    whereParams.toUserId = toUser;
  } else {
    whereParams.toUserEmail = toUser;
  }
  const numInvites = await prisma.invitations.aggregate({
    where: whereParams,
    _count: true,
  });
  return numInvites ? numInvites._count : 0;
};

const getNumberOfinvitesSentByUser = async (
  userId: number
): Promise<number> => {
  const numInvites = await prisma.$transaction(async (prisma) => {
    return await prisma.invitations.aggregate({
      where: {
        fromUserId: userId,
        inviteType: InvitationType.joingroup,
        acceptedAt: null,
        toGroup: {
          groupUsers: {
            some: {
              userId: userId,
              role: 'admin',
            },
          },
        },
      },
      _count: true,
    });
  });

  return numInvites ? numInvites._count : 0;
};

const updateMany = async (
  where: IInvitationsWhereInput,
  data: InviteUncheckedUpdateManyInput,
  prismaTr?: PrismaClient
): Promise<void> => {
  await (prismaTr || prisma).invitations.updateMany({
    where,
    data,
  });
};

const remove = (where: IInvitationsWhereUniqueInput): Promise<IInvitations> => {
  return invitations.delete({
    where,
  });
};

const findFirst = (
  where: IInvitationsWhereInput,
  prismaTr?: PrismaClient
): Promise<IInvitations | null> => {
  return (prismaTr || prisma).invitations.findFirst({
    where,
  });
};

const findMany = (
  where: IInvitationsWhereInput,
  include?: IInvitationsInclude | null,
  skip?: number,
  take?: number,
  prismaTr?: PrismaClient
): Promise<IInvitations[] | null> => {
  return (prismaTr || prisma).invitations.findMany({
    where,
    include,
    skip,
    take,
  });
};

export default {
  create,
  getNumberOfinvitesSentByUser,
  getNumberOfinvitesSentByUserToDestinationUser,
  update,
  updateMany,
  remove,
  findFirst,
  findMany,
};
