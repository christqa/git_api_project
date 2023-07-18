export type ISaveBathroomActivityImagesRequestDto = {
  deviceSerial: string;
  filename: string;
  bathroomActivityUuid: string;
  // eslint-disable-next-line
  images: { imageMetadata: { [key: string]: any } }[];
};
