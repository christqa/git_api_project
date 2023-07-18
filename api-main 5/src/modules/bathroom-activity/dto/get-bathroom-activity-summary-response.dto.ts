import { IBathroomActivityFile } from '../bathroom-activity.type';

export type IGetBathroomActivitySummaryResponseDto = {
  startDate: Date | null;
  endDate: Date | null;
  bathroomActivityUuid: string;
  durationInSeconds: number;
  profileId: number;
  deviceSerial: string;
  images: IBathroomActivityFile[];
};
