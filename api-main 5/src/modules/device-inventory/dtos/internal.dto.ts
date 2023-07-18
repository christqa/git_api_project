export interface GetDeviceInventoriesInternalResponseDto {
  deviceSerial: string;
  userDevices?: {
    user: {
      id: number;
      userGuid: string;
      email: string;
      profile: {
        id: number;
      } | null;
    };
  }[];
}

export interface PatchDeviceInventoriesInternalRequestDto {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pixelRegistrationFile: { [key: string]: any };
}
