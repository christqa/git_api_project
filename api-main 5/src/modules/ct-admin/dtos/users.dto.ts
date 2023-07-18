export interface IGetUsersResponseDto {
  accounts: Account[];
  total: number;
}

type Account = {
  userGuid: string;
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  totalDevices: number;
};
