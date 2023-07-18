import TranslationService from '@modules/translation/translation.service';
import { badRequestError } from '@core/error-handling/error-list';

const noSignedAgreements = () => {
  return badRequestError(
    TranslationService.translate('signed_agreements_no_signed_agreements')
  );
};

const noAgreements = () => {
  return badRequestError(
    TranslationService.translate('agreements_no_agreements')
  );
};

const noSuchConfiguredAgreement = () => {
  return badRequestError(
    TranslationService.translate('signed_agreements_no_such_configured')
  );
};

export { noSignedAgreements, noAgreements, noSuchConfiguredAgreement };
