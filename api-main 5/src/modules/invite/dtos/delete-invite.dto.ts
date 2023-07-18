import { InvitationType } from '@prisma/client';

export interface IDeleteInviteRequestDto {
  invitationType: InvitationType;
  memberEmail: string;
  groupId?: number;
}
