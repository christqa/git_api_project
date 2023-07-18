import { PermissionTypes } from '../invite.type';
export * from './create-invite.dto';
export * from './delete-invite.dto';

export interface ISentInviteResponseDto {
  email: string;
  firstName?: string;
  lastName?: string;
  permissions: PermissionTypes[];
  sentAt: Date;
  expiresAt: Date;
  acceptedAt: Date;
  rejectedAt: Date;
}

export interface IReceivedInviteResponseDto {
  inviteId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  permissions: PermissionTypes[];
  sentAt: Date;
  expiresAt: Date;
  acceptedAt: Date;
  rejectedAt: Date;
}

export interface IResentInviteResponseDto {}
