import TranslationService from '@modules/translation/translation.service';
import {
  unprocessableEntityError,
  badRequestError,
  notFoundError,
} from '@core/error-handling/error-list';

const noBathroomActivity = () => {
  return notFoundError(
    TranslationService.translate(
      'bathroom _activity_bathroom _activity_not_found'
    )
  );
};

const createBathroomActivityError = () => {
  return unprocessableEntityError(
    TranslationService.translate('bathroom _activity_cannot_be_created')
  );
};

const deviceIdNotMatchBathroomActivity = () => {
  return badRequestError(
    TranslationService.translate(
      'bathroom _activity_device_serial_not_match_bathroom _activity'
    )
  );
};

const profileIdNotMatchWithDeviceSerial = () => {
  return badRequestError(
    TranslationService.translate(
      'bathroom _activity_profile_id_not_match_with_device_serial'
    )
  );
};

export {
  noBathroomActivity,
  deviceIdNotMatchBathroomActivity,
  createBathroomActivityError,
  profileIdNotMatchWithDeviceSerial,
};
