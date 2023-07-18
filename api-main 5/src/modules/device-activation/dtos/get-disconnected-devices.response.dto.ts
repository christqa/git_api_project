import { IGroupAdmin } from './get-group-admin-by-device-serial.response.dto';

export type DisconnectedDevice = {
  id: number;
  deviceSerial: string;
  deviceName: string;
  deviceStatusUpdatedOn: Date | null;
  deviceAdmins: IGroupAdmin[];
};

export type IDisconnectedDevicesDto = {
  count: number;
  devices: DisconnectedDevice[];
};
