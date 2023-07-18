import { AgreementTypes } from '@prisma/client';

export interface ICreateSignedAgreementsRequestDto {
  privacyPolicyVersion?: number;
  termsAndConditionsVersion: number;
  shareUsageAgreed: boolean;
}

export interface ICreateAgreementDto {
  userId: number;
  agreementType: AgreementTypes;
  version: number;
  agreementId: number | null;
}
