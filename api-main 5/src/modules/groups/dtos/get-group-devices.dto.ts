export interface IGetGroupDevicesRequestDto {
  groupId: number;
  skip: number;
  take: number;
}

export interface IGetGroupDevicesResponseDto {
  groupId: number;
  groupName: string;
  devices: {
    deviceSerial: string;
    deviceName: string;
    timeZoneId: number;
    activatedOn: string;
    batteryStatus: string;
    batteryPercentage: number;
    wiFiSSID: string | null;
    connectionStatus: string;
    bleMacAddress: string;
    firmwareVersion: string | null;
    newFirmwareVersion: string | null;
    isFwUpdateRequired: boolean;
  }[];
}
