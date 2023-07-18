export interface ICreateDeviceSettingsRequestDto {
  deviceSerial: string;
  deviceSettingName: string;
  deviceSettingType: string;
  deviceSettingValue: string;
}

export interface ICreateManyDeviceSettingsRequestDto {
  deviceSerial: string;
  deviceSettings: ICreateDeviceSettingsRequestType[];
}

export type ICreateDeviceSettingsRequestType = {
  deviceSettingName: string;
  deviceSettingType: string;
  deviceSettingValue: string;
};
