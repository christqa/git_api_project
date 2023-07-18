export type IPatchBathroomActivityRequestDto = {
  profileId?: number;
  deviceSerial?: string;
  // eslint-disable-next-line
  eventBody?: any;
  startedOn?: Date;
  endedOn?: Date;
  bathroomActivityUuid?: string;
  totalImages?: number;
  imagesUploaded?: number;
  isEventProcessed?: boolean;
  fileLocationMetadata?: {
    region: string;
    platform: string;
    bucket: string;
    keyPrefix: string;
  };
  metadata?: {
    totalImages: number;
    imagesUploaded: number;
  };
};
