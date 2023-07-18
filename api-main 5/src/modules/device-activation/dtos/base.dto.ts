export interface IDeviceActivationDto {
  deviceSerial: string;
  deviceName: string;
  timeZoneId: number;
  timeZoneOffset?: string;
}
