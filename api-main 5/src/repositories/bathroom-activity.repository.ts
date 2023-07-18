import prisma from '@core/prisma/prisma';
import {
  IBathroomActivity,
  IBathroomActivityCreateInput,
  IBathroomActivityImagesCreateInput,
  IBathroomActivitysUpdateType,
  IBathroomActivityWhereInput,
} from '@modules/bathroom-activity/bathroom-activity.type';

const { bathroomActivity, bathroomActivityFiles } = prisma;

const createBathroomActivity = (data: IBathroomActivityCreateInput) => {
  return bathroomActivity.create({ data });
};

const findBathroomActivityWithBathroomActivityFiles = (eventUuid: string) => {
  return bathroomActivity.findFirst({
    where: {
      eventUuid,
    },
    include: {
      BathroomActivityFiles: {
        select: {
          filename: true,
          fileMetadata: true,
          processedOn: true,
          isFileProcessed: true,
        },
      },
      deviceInventory: {
        select: {
          deviceSerial: true,
        },
      },
    },
  });
};

const findBathroomActivity = (
  where: IBathroomActivityWhereInput
): Promise<IBathroomActivity | null> => {
  return bathroomActivity.findFirst({ where });
};

const createBathroomActivityImages = (
  data: IBathroomActivityImagesCreateInput[]
) => {
  return bathroomActivityFiles.createMany({ data });
};

const updateBathroomActivity = (
  eventUuid: string,
  data: IBathroomActivitysUpdateType
) => {
  return bathroomActivity.update({
    where: { eventUuid },
    data,
  });
};

export default {
  createBathroomActivity,
  findBathroomActivity,
  createBathroomActivityImages,
  updateBathroomActivity,
  findBathroomActivityWithBathroomActivityFiles,
};
