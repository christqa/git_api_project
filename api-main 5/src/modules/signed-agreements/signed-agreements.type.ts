import { SignedAgreements, Prisma, ShareUsage } from '@prisma/client';

export type ISignedAgreements = SignedAgreements;
export type ISignedAgreementsWhereInput = Prisma.SignedAgreementsWhereInput;

export type ISignedAgreementsCreate = ISignedAgreementsTypes & {
  userId: number;
};

export type ISignedAgreementsTypes = {
  privacyPolicyVersion?: number | null;
  termsAndConditionsVersion?: number | null;
};

export enum agreementTypes {
  privacyPolicy = 'privacyPolicy',
  termsAndConditions = 'termsAndConditions',
}

export type IShareUsage = ShareUsage;

export type IShareUsageWhereInput = Prisma.ShareUsageWhereInput;
