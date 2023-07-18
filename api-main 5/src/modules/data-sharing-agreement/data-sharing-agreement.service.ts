import dataSharingAgreementRepository from '@repositories/data-sharing-agreement.repository';
import {
  IDataSharingAgreement,
  IDataSharingAgreementExtended,
} from './data-sharing-agreement.type';
import {
  dataSharingAgreementAlreadyRevoked,
  noDataSharingAgreement,
} from './data-sharing-agreement.error';
import { userService } from '@modules/index/index.service';
import { userNotFound } from '@modules/user/user.error';

const getDataSharingAgreement = async (
  userGuid: string,
  agreementId: string
): Promise<IDataSharingAgreementExtended | null> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  return dataSharingAgreementRepository.findFirst(
    {
      agreementId,
      toUserId: userId,
      revokedAt: null,
    },
    { fromUser: true }
  );
};

const revokeDataSharingAgreement = async (
  agreementId: string,
  userGuid: string
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const foundDataSharingAgreement =
    await dataSharingAgreementRepository.findFirst({
      agreementId,
      fromUserId: userId,
    });

  if (!foundDataSharingAgreement) {
    throw noDataSharingAgreement();
  }

  if (foundDataSharingAgreement.revokedAt) {
    throw dataSharingAgreementAlreadyRevoked();
  }

  await dataSharingAgreementRepository.update(
    { id: foundDataSharingAgreement.id },
    {
      revokedAt: new Date(),
    } as IDataSharingAgreement
  );
};

export { getDataSharingAgreement, revokeDataSharingAgreement };
