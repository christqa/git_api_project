import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  conflictError,
} from '@core/error-handling/error-list';

const dataFromTheFuture = () => {
  return conflictError(
    TranslationService.translate('analytes_data_of_future_analytes_not_allowed')
  );
};

const getAnalyteDateInTheFuture = () => {
  return conflictError(
    TranslationService.translate('analytes_date_in_the_future_not_allowed')
  );
};

const userHasNoDevice = () => {
  return badRequestError(
    TranslationService.translate('analytes_user_has_no_device')
  );
};

const userWithoutGroupDevice = () => {
  return badRequestError(
    TranslationService.translate(
      'analytes_user_is_not_part_of_a_group_with_an_assigned_device'
    )
  );
};

export {
  dataFromTheFuture,
  userHasNoDevice,
  getAnalyteDateInTheFuture,
  userWithoutGroupDevice,
};
