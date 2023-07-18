import prisma from '@core/prisma/prisma';
import {
  IDataPrivacyRemovalRequestTypes,
  IDataPrivacyRemovalRequestReasons,
  IDataPrivacyRemovalRequestReasonsInclude,
  IDataPrivacyRemovalRequestReasonsWhereUniqueInput,
  IDataPrivacyRemovalRequests,
  IDataPrivacyRemovalRequestsCreate,
} from '@modules/data-privacy-removal-requests/data-privacy-removal-requests.type';
import { Prisma } from '@prisma/client';

const {
  dataPrivacyRemovalRequests,
  dataPrivacyRemovalRequestTypes,
  dataPrivacyRemovalRequestReasons,
} = prisma;

const create = (
  data: IDataPrivacyRemovalRequestsCreate
): Promise<IDataPrivacyRemovalRequests> => {
  return dataPrivacyRemovalRequests.create({
    data,
  });
};

const findRequestTypes = (): Promise<
  Omit<IDataPrivacyRemovalRequestTypes, 'order'>[]
> => {
  return dataPrivacyRemovalRequestTypes.findMany({
    select: { id: true, text: true },
    orderBy: { order: Prisma.SortOrder.asc },
  });
};

const findRequestReasons = (): Promise<IDataPrivacyRemovalRequestReasons[]> => {
  return dataPrivacyRemovalRequestReasons.findMany();
};

const findRequestReason = (
  where: IDataPrivacyRemovalRequestReasonsWhereUniqueInput,
  include?: IDataPrivacyRemovalRequestReasonsInclude | null
): Promise<IDataPrivacyRemovalRequestReasons | null> => {
  return dataPrivacyRemovalRequestReasons.findFirst({
    where,
    include,
  });
};

export default {
  create,
  findRequestTypes,
  findRequestReasons,
  findRequestReason,
};
