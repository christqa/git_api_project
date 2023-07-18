import { IBathroomActivityFile } from '../bathroom-activity.type';

export type IGetBathroomActivityResponseDto = {
  eventUuid: string;
  profileId: number;
  deviceId: number;
  startTimestamp: string | null | undefined;
  endTimestamp: string | null | undefined;
  files: IBathroomActivityFile[];
  isProcessed: boolean;
};
