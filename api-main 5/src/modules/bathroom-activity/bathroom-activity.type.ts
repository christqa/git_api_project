import { Prisma, BathroomActivity } from '@prisma/client';

export type IBathroomActivity = BathroomActivity;
export type IBathroomActivityCreateInput =
  Prisma.BathroomActivityUncheckedCreateInput;
export type IBathroomActivityWhereInput = Prisma.BathroomActivityWhereInput;
export type IBathroomActivityImagesCreateInput =
  Prisma.BathroomActivityFilesUncheckedCreateInput;
export type IBathroomActivitysUpdateType =
  Prisma.BathroomActivityUncheckedUpdateInput;
export type IBathroomActivityFile = {
  keyPrefix: string;
  filename: string;
  bucket: string;
  region: string;
  fileMetadata: Prisma.JsonValue;
  isProcessed: boolean;
  processedAt: Date | null;
};
