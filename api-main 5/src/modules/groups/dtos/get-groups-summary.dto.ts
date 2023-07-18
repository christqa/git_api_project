import { GroupUserRoles } from '@prisma/client';
import {
  IGetGroupMemberResponseDto,
  IGetPendingGroupMemberResponseDto,
} from './get-group-members.dto';

export interface IGetGroupSummaryResponseDto {
  groupId: number;
  groupName: string;
  role: GroupUserRoles;
  createdOn: Date;
  addedOn: Date;
  devices: {
    deviceName: string;
    batteryStatus: string;
    bleMacAddress: string;
  }[];
  groupMembers: IGetGroupMemberResponseDto[];
  pendingGroupMembers: IGetPendingGroupMemberResponseDto[];
}

export interface IGetGroupsSummaryRequestDto {
  skip: number;
  take: number;
}

export interface IGetGroupsSummaryResponseDto {
  total: number;
  groups: IGetGroupSummaryResponseDto[];
}
