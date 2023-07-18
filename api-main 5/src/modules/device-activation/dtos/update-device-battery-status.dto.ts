export interface IUpdateDeviceBatteryStatusInternalRequestDto {
  deviceSerial: string;
  batteryStatus: number;
  firmwareVersion: string;
  wiFiSSID: string;
  signalStrength: number;
}
