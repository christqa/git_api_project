export interface IGetActivatedDeviceResponseDto {
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
}
