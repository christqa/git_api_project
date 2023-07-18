export interface IGetUserByProfileIdRequestDto {
  profileId: number;
}

export interface IGetUserByProfileIdResponseDto {
  firstName: string;
  lastName: string;
  id: number;
  userGuid: string;
  email: string;
  localCutoff: string;
}

export interface IGetUserByUserIdRequestDto {
  userId: number;
}

export interface IGetUsersInternalResponseDto {
  count: number;
  users: {
    firstName: string;
    lastName: string;
    userGuid: string;
    email: string;
    localCutoff: string;
    profileId: number | null;
  }[];
}

export interface IGetProfileDeviceSerialInternalResponseDto {
  profileId: number;
  deviceSerial: string;
}

export interface IGetUsersByDeviceTZResponseDto {
  userGuid: string;
  email: string;
  profile: { id: number } | null;
}
