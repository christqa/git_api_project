export interface IDeviceInventoryRequestDto {
  deviceSerial: string;
  manufacturingDate: Date;
  manufacturedForRegion: string;
  deviceModelId: number;
  bleMacAddress: string;
  firmwareVersion: string;
  wiFiMacAddress: string;
  // eslint-disable-next-line
  deviceMetadata?: { [key: string]: any };
  // eslint-disable-next-line
  calibrationFileLocations: { [key: string]: any };
}
