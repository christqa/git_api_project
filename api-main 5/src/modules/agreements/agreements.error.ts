import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  conflictError,
  unprocessableEntityError,
} from '@core/error-handling/error-list';

const noAgreements = () => {
  return badRequestError(
    TranslationService.translate('agreements_no_agreements')
  );
};

const noSuchConfiguredAgreement = () => {
  return badRequestError(
    TranslationService.translate('agreements_no_such_configured')
  );
};

const duplicateAgreement = () => {
  return conflictError(
    TranslationService.translate('agreements_duplicate_agreement')
  );
};

const createAgreementDataError = () => {
  return unprocessableEntityError(
    TranslationService.translate('agreements_cannot_create_agreement')
  );
};

export {
  noAgreements,
  noSuchConfiguredAgreement,
  duplicateAgreement,
  createAgreementDataError,
};
