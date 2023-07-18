import { GroupUserRoles } from '@prisma/client';

export interface IGetGroupResponseDto {
  groupId: number;
  groupName: string;
  role: GroupUserRoles;
  createdOn: string;
  addedOn: string;
}

export interface IGetGroupsRequestDto {
  skip: number;
  take: number;
}

export interface IGetGroupsResponseDto {
  total: number;
  groups: IGetGroupResponseDto[];
}
