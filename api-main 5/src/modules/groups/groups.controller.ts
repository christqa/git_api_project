import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import express from 'express';
import { groupsService } from '@modules/index/index.service';
import groupsValidation from './groups.validation';
import {
  IGetGroupsRequestDto,
  IGetGroupsResponseDto,
  ICreateGroupRequestDto,
  IUpdateGroupRequestDto,
  IDeleteGroupRequestDto,
  ILeaveGroupRequestDto,
  IGetGroupDevicesResponseDto,
  IGetGroupMembersResponseDto,
  IGetGroupResponseDto,
  IUpdateGroupMemberAccessRequestDto,
  IGetGroupsSummaryResponseDto,
  IGetGroupsSummaryRequestDto,
} from './dtos/groups.index.dto';

@Route('groups')
@Tags('groups')
@Security(DefaultSecurityMethods)
export class GroupsController extends Controller {
  /**
   * Gets groups
   */
  @Get()
  @Middlewares(groupsValidation.validateGetGroups)
  getGroups(
    @Request() request: express.Request,
    @Query() skip: number,
    @Query() take: number
  ): Promise<IGetGroupsResponseDto> {
    return groupsService.findGroups(request.user.userGuid, {
      skip,
      take,
    } as IGetGroupsRequestDto);
  }

  /**
   * Gets groups summary
   */
  @Get('summary')
  @Middlewares(groupsValidation.validateGetGroupsSummary)
  getGroupsSummary(
    @Request() request: express.Request,
    @Query() skip: number,
    @Query() take: number
  ): Promise<IGetGroupsSummaryResponseDto> {
    return groupsService.findGroupsSummary(request.user.userGuid, {
      skip,
      take,
    } as IGetGroupsSummaryRequestDto);
  }

  /**
   * Creates a new group
   */
  @Post()
  @SuccessResponse(201, 'success')
  @Middlewares(groupsValidation.validateCreateGroup)
  createGroup(
    @Request() request: express.Request,
    @Body() createGroupRequestDto: ICreateGroupRequestDto
  ): Promise<IGetGroupResponseDto> {
    return groupsService.createGroup(
      request.user.userGuid,
      createGroupRequestDto
    );
  }

  /**
   * Updates a group
   */
  @Put()
  @SuccessResponse(200, 'success')
  @Middlewares(groupsValidation.validateUpdateGroup)
  async updateGroup(
    @Request() request: express.Request,
    @Body() updateGroupRequestDto: IUpdateGroupRequestDto
  ) {
    await groupsService.updateGroup(
      request.user.userGuid,
      updateGroupRequestDto
    );
    return { status: 'success' };
  }

  /**
   * Deletes a group
   */
  @Delete()
  @SuccessResponse(200, 'success')
  @Middlewares(groupsValidation.validateRemoveLeaveGroup)
  async removeGroup(
    @Request() request: express.Request,
    @Body() deleteGroupRequestDto: IDeleteGroupRequestDto
  ) {
    await groupsService.removeGroup(
      request.user.userGuid,
      deleteGroupRequestDto
    );
    return { status: 'success' };
  }

  /**
   * a user leaves a group / remove user from group
   */
  @Delete('user')
  @SuccessResponse(200, 'success')
  @Middlewares(groupsValidation.validateRemoveLeaveGroup)
  async leaveGroup(
    @Request() request: express.Request,
    @Body() leaveGroupRequestDto: ILeaveGroupRequestDto
  ) {
    await groupsService.leaveGroup(request.user.userGuid, leaveGroupRequestDto);
    return { status: 'success' };
  }

  /**
   * Gets active devices from a group based on a user id which belongs to that group
   */
  @Get('devices')
  @Middlewares(groupsValidation.validateGetGroupDevices)
  getGroupDevices(
    @Request() request: express.Request,
    @Query() groupId: number,
    @Query() skip: number,
    @Query() take: number
  ): Promise<IGetGroupDevicesResponseDto> {
    return groupsService.findGroupDevices(request.user.userGuid, {
      groupId,
      skip,
      take,
    });
  }

  /**
   * Gets group members
   */
  @Get('members')
  @Middlewares(groupsValidation.validateGetGroupMembers)
  getGroupMembers(
    @Request() request: express.Request,
    @Query() groupId: number,
    @Query() skip: number,
    @Query() take: number
  ): Promise<IGetGroupMembersResponseDto> {
    return groupsService.findGroupMembers(request.user.userGuid, {
      groupId,
      skip,
      take,
    });
  }

  /**
   * Change User access level after joining the group
   */
  @Post('access')
  @SuccessResponse(200, 'success')
  @Middlewares(groupsValidation.validateUpdateGroupMemberAccess)
  async updateGroupMemberAccess(
    @Request() request: express.Request,
    @Body()
    updateGroupMemberAccessRequestDto: IUpdateGroupMemberAccessRequestDto
  ) {
    await groupsService.updateGroupMemberAccess(
      request.user.userGuid,
      updateGroupMemberAccessRequestDto
    );
    return { status: 'success' };
  }
}
