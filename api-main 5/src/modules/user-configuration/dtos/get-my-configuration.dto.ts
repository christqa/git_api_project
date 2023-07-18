import { IUserConfigurationRequestDto } from './base.dto';

export interface IGetUserConfigurationResponseDto
  extends IUserConfigurationRequestDto {
  firstSampleDate: string | null;
}
