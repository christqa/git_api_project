import { PermissionTypes } from '../invite.type';
import { GroupUserRoles, InvitationType } from '@prisma/client';

/**
 * @example "{\"email\": \"string\", \"permissions\": \"["read"]\"}"
 */
export interface ICreateInviteRequestDto {
  email: string;
  resendInvite?: boolean;
  permissions?: PermissionTypes[];
  invitationType?: InvitationType;
  toGroupIds?: number[];
  groupAccessLevel?: GroupUserRoles;
}
