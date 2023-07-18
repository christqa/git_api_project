import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  conflictError,
  notFoundError,
} from '@core/error-handling/error-list';

const userNotFound = () => {
  return notFoundError(TranslationService.translate('user_user_not_found'));
};

const userHasNoAuth0ManagementProfile = () => {
  return notFoundError(
    TranslationService.translate('user_user_has_no_auth_management_profile')
  );
};

const userAlreadyExists = () => {
  return conflictError(
    TranslationService.translate('user_user_already_exists')
  );
};

const userEmailAlreadyTaken = () => {
  return badRequestError(
    TranslationService.translate('user_user_email_already_taken')
  );
};

const userHasNoDevice = () => {
  return badRequestError(
    TranslationService.translate('user_user_has_no_device')
  );
};

const userEmailNotVerified = () => {
  return conflictError(
    TranslationService.translate(
      'user_email_must_be_verified_before_proceeding'
    )
  );
};

const userHasNoEmail = () => {
  return conflictError(
    TranslationService.translate('user_the_auth_user_has_no_email')
  );
};

const userMustNotBeFromTheFuture = (date: string) => {
  return badRequestError(
    TranslationService.translate('user_dob_must_be_max_current_date', { date })
  );
};

const somethingWentWrongError = () => {
  return badRequestError(
    TranslationService.translate('user_something_went_wrong')
  );
};

export {
  userHasNoDevice,
  somethingWentWrongError,
  userNotFound,
  userHasNoAuth0ManagementProfile,
  userAlreadyExists,
  userEmailNotVerified,
  userHasNoEmail,
  userEmailAlreadyTaken,
  userMustNotBeFromTheFuture,
};
