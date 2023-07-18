import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  notFoundError,
} from '@core/error-handling/error-list';

const dataPrivacyRemovalRequestReasonNotFound = () => {
  return notFoundError(
    TranslationService.translate(
      'data_privacy_removal_requests_reason_not_found'
    )
  );
};

const dataPrivacyRemovalRequestReasonAdditionalTextNotAllowed = () => {
  return badRequestError(
    TranslationService.translate(
      'data_privacy_removal_requests_reason_additional_text_not_allowed'
    )
  );
};

export {
  dataPrivacyRemovalRequestReasonNotFound,
  dataPrivacyRemovalRequestReasonAdditionalTextNotAllowed,
};
