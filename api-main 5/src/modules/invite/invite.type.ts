import { Invitations, Prisma } from '@prisma/client';
import { IUser } from '@modules/user/user.type';

export type IInvitations = Invitations;
export type IInvitationsExtended = Invitations & {
  fromUser?: IUser;
  toUser?: IUser;
};
export type IInvitationsInclude = Prisma.InvitationsInclude;
export type IInvitationsWhereUniqueInput = Prisma.InvitationsWhereUniqueInput;
export type IInvitationsWhereInput = Prisma.InvitationsWhereInput;
export type InviteUncheckedUpdateManyInput =
  Prisma.InvitationsUncheckedUpdateManyInput;

export enum PermissionTypes {
  read = 'read',
  write = 'write',
  delete = 'delete',
}
