export type IStartBathroomActivityRequestDto = {
  profileId: number;
  deviceSerial: string;
  // eslint-disable-next-line
  eventBody: { [key: string]: any };
  startedOn: Date;
  bathroomActivityUuid: string;
};
