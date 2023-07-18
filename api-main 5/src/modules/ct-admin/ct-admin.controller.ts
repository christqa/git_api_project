import { Controller } from '@tsoa/runtime';
import { Get, Middlewares, Query, Route, Security, Tags } from 'tsoa';
import { AdminSecurityMethods } from '../../constants';
import { ctAdminService } from '@modules/index/index.service';
import { IGetDevicesResponseDto } from './dtos/devices.dto';
import ctAdminDevicesValidation from './ct-admin.devices.validation';
import { IGetUsersResponseDto } from './dtos/users.dto';
import { IGetEventsResponseDto } from './dtos/events.dto';
import { IGetDashboardStatsResponseDto } from './dtos/dashboard.dto';

@Tags('Clinical Trial Admin')
@Route('/ct-admin')
@Security(AdminSecurityMethods)
export class AdminController extends Controller {
  /**
   *
   * Get all device inventory, paginated for ct admins
   */
  @Middlewares(ctAdminDevicesValidation.validateGetDeviceInventories)
  @Get('/devices')
  async getDevices(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('sortBy') sortBy?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<IGetDevicesResponseDto> {
    return await ctAdminService.getDevices(skip, take, sortBy, orderBy);
  }
  /**
   *
   * Get all users, paginated for ct admins
   */
  @Middlewares(ctAdminDevicesValidation.validateGetUsers)
  @Get('/users')
  async getUsers(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('sortBy') sortBy?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<IGetUsersResponseDto> {
    return await ctAdminService.getUsers(skip, take, sortBy, orderBy);
  }
  /**
   *
   * Get all events, paginated for ct admins
   */
  @Middlewares(ctAdminDevicesValidation.validateGetEvents)
  @Get('/events')
  async getEvents(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('sortBy') sortBy?: string,
    @Query('orderBy') orderBy?: string
  ): Promise<IGetEventsResponseDto> {
    return await ctAdminService.getEvents(skip, take, sortBy, orderBy);
  }

  /**
   *
   * Get stats for showing on the dashboard
   */
  @Get('/dashboard-stats')
  async getDashboardStats(): Promise<IGetDashboardStatsResponseDto> {
    return await ctAdminService.getDashboardStats();
  }
}
