import signedAgreementsRepository from '@repositories/signed-agreements.repository';
import {
  agreementTypes,
  IShareUsage,
  IShareUsageWhereInput,
  ISignedAgreementsTypes,
} from './signed-agreements.type';
import { noAgreements, noSignedAgreements } from './signed-agreements.error';
import {
  ICreateAgreementDto,
  ICreateSignedAgreementsRequestDto,
} from './dtos/signed-agreements.index.dto';
import { userService } from '@modules/index/index.service';
import { userNotFound } from '@modules/user/user.error';
import agreementsRepository from '@repositories/agreements.repository';

const createAgreement = async (signedAgreement: ICreateAgreementDto) => {
  const agreement = await agreementsRepository.findFirst({
    agreementType: signedAgreement.agreementType,
    version: signedAgreement.version,
  });
  if (!agreement) {
    throw noAgreements();
  }
  const signedAgreementExist = await signedAgreementsRepository.findFirst({
    userId: signedAgreement.userId,
    agreementId: agreement.id,
  });

  if (!signedAgreementExist) {
    signedAgreement.agreementId = agreement.id;
    await signedAgreementsRepository.create(signedAgreement);
  }
};

const findLastAgreementVersions = async (
  userId: number
): Promise<ISignedAgreementsTypes> => {
  const privacyPolicyVersion =
    await signedAgreementsRepository.findLastAgreementVersion({
      userId,
      agreementType: agreementTypes.privacyPolicy,
    });

  const termsAndConditionsVersion =
    await signedAgreementsRepository.findLastAgreementVersion({
      userId,
      agreementType: agreementTypes.termsAndConditions,
    });

  return {
    privacyPolicyVersion,
    termsAndConditionsVersion,
  };
};

const createSignedAgreements = async (
  signedAgreements: ICreateSignedAgreementsRequestDto,
  userGuid: string
): Promise<void> => {
  if (
    !signedAgreements.privacyPolicyVersion &&
    !signedAgreements.termsAndConditionsVersion
  ) {
    throw noSignedAgreements();
  }
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;

  const lastAgreement = await findLastAgreementVersions(userId);
  if (
    lastAgreement?.privacyPolicyVersion ===
      signedAgreements.privacyPolicyVersion &&
    lastAgreement?.termsAndConditionsVersion ===
      signedAgreements.termsAndConditionsVersion
  ) {
    await signedAgreementsRepository.updateShareUsage({
      userId,
      agreed: signedAgreements.shareUsageAgreed,
    } as IShareUsage);
    return;
  }

  if (signedAgreements.privacyPolicyVersion) {
    await createAgreement({
      userId,
      agreementType: agreementTypes.privacyPolicy,
      version: signedAgreements.privacyPolicyVersion,
      agreementId: null,
    });
  }

  if (signedAgreements.termsAndConditionsVersion) {
    await createAgreement({
      userId,
      agreementType: agreementTypes.termsAndConditions,
      version: signedAgreements.termsAndConditionsVersion,
      agreementId: null,
    });
  }

  await signedAgreementsRepository.updateShareUsage({
    userId,
    agreed: signedAgreements.shareUsageAgreed,
  } as IShareUsage);
};

const findShareAgreement = async (
  userId: number
): Promise<IShareUsage | null> => {
  return signedAgreementsRepository.findFirstShareUsage({
    userId,
  } as IShareUsageWhereInput);
};

export {
  createSignedAgreements,
  findLastAgreementVersions,
  findShareAgreement,
};
