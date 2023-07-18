export interface IGetDevicesResponseDto {
  devices: Device[];
  total: number;
}

type Firmware = {
  id: number;
  virtualFirmware: string;
};

type Device = {
  deviceId: number;
  deviceName: string;
  batteryPercentage: string;
  wiFiNetworkSSID: string | null;
  connectionStrength: number | null;
  deviceStatusUpdatedOn: Date | null;
  activatedOn: Date;
  deviceSerial: string;
  manufacturingDate: Date;
  deviceFirmware?: Firmware;
  activatedBy: {
    firstName: string;
    lastName: string;
    userGuid: string;
    email: string;
  };
  lastEvent: {
    date?: Date;
    eventId?: number;
    eventType?: string;
  };
};
