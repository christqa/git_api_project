export type IGetGroupAdminByDeviceSerialResponseDto = {
  admins: IGroupAdmin[];
};

export type IGroupAdmin = {
  firstName: string;
  lastName: string;
  email: string;
  userGuid: string;
  profileId: number;
};
