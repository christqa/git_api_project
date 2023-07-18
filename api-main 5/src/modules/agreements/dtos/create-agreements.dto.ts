import { AgreementLinkType, agreementTypes } from '../agreements.type';

export interface ICreateSignedAgreementsRequestDto {
  privacyPolicyVersion?: number;
  termsAndConditionsVersion: number;
  shareUsageAgreed: boolean;
}

export type ICreateAgreementRequestDto = {
  agreementType: keyof typeof agreementTypes;
  version: number;
  links: AgreementLinkType[];
};
