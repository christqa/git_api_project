import { Agreements, Prisma } from '@prisma/client';

export type IAgreements = Agreements;
export type IAgreementsWhereInput = Prisma.AgreementsWhereInput;

export type IAgreementsCreate = IAgreementsTypes & {
  userId: number;
};

export type IAgreementsTypes = {
  privacyPolicyVersion?: number | null;
  termsAndConditionsVersion?: number | null;
};

export enum agreementTypes {
  privacyPolicy = 'privacyPolicy',
  termsAndConditions = 'termsAndConditions',
}

export type AgreementLinkType = {
  url: string;
  isoLocale: string;
};
