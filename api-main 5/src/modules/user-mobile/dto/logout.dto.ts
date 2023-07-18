import { IUserMobileRequestDto } from './base.dto';

export interface IUserMobileLogOutRequestDto extends IUserMobileRequestDto {
  userGuid: string;
}
