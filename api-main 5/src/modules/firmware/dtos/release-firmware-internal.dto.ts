import { ReleaseType } from '../firmware.type';

export interface IReleaseFirmwareInternalRequestDto {
  releaseType: ReleaseType;
  skipUserApproval?: boolean; // can only be true for internal firmware
  deviceSerials?: string[];
}
