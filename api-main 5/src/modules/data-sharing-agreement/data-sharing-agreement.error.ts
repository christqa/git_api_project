import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  notFoundError,
} from '@core/error-handling/error-list';

const dataSharingAgreementAlreadyRevoked = () => {
  return badRequestError(
    TranslationService.translate(
      'data_sharing_agreement_data_sharing_agreement_already_revoked'
    )
  );
};

const noDataSharingAgreement = () => {
  return notFoundError(
    TranslationService.translate(
      'data_sharing_agreement_data_sharing_agreement_not_found'
    )
  );
};

export { dataSharingAgreementAlreadyRevoked, noDataSharingAgreement };
