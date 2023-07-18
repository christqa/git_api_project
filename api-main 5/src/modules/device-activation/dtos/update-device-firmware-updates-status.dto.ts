import { Status } from '@prisma/client';

export interface IUpdateDeviceFirmwareUpdateStatusRequestDto {
  status: Status;
  failureLogs?: string;
}
