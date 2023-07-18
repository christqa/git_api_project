import {
  DataPrivacyRemovalRequestTypes,
  DataPrivacyRemovalRequestReasons,
  DataPrivacyRemovalRequests,
  Prisma,
} from '@prisma/client';

export type IDataPrivacyRemovalRequestTypes = DataPrivacyRemovalRequestTypes;
export type IDataPrivacyRemovalRequestReasons =
  DataPrivacyRemovalRequestReasons & {
    dataPrivacyRemovalRequestType?: DataPrivacyRemovalRequestTypes;
  };
export type IDataPrivacyRemovalRequests = DataPrivacyRemovalRequests;

export type IDataPrivacyRemovalRequestReasonsInclude =
  Prisma.DataPrivacyRemovalRequestReasonsInclude;
export type IDataPrivacyRemovalRequestReasonsWhereUniqueInput =
  Prisma.DataPrivacyRemovalRequestReasonsWhereUniqueInput;
export type IDataPrivacyRemovalRequestsCreate =
  Prisma.DataPrivacyRemovalRequestsUncheckedCreateInput;
