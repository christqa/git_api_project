import { IDeviceSettings } from '../device-settings.type';

export type IGetDeviceSettingsByDeviceSerialResponseDto = Omit<
  IDeviceSettings,
  'id' | 'deviceId'
>;
