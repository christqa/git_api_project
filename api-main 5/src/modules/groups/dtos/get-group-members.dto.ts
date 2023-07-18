export interface IGetGroupMembersRequestDto {
  groupId: number;
  skip: number;
  take: number;
}

export interface IGetGroupMemberResponseDto {
  userGuid: string;
  memberName: string;
  memberLastName: string;
  memberAccess: string;
  memberEmail: string;
  addedOn: string;
}

export interface IGetPendingGroupMemberResponseDto {
  memberAccess: string;
  memberEmail: string;
}

export interface IGetGroupMembersResponseDto {
  total: number;
  groupName: string;
  groupMembers: IGetGroupMemberResponseDto[];
  pendingGroupMembers: IGetPendingGroupMemberResponseDto[];
}
