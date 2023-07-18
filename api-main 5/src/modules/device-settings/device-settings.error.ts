import TranslationService from '@modules/translation/translation.service';
import {
  conflictError,
  notFoundError,
  unprocessableEntityError,
} from '@core/error-handling/error-list';

const deviceSettingNotFound = () => {
  return notFoundError(
    TranslationService.translate('device_setting_not_found')
  );
};

const deviceWithDeviceSettingName = () => {
  return conflictError(
    TranslationService.translate(
      'device_settings_device_id_already_has_the_device_setting_name'
    )
  );
};

const createDeviceSettingDataError = () => {
  return unprocessableEntityError(
    TranslationService.translate('device_settings_cannot_be_created')
  );
};

export {
  deviceSettingNotFound,
  deviceWithDeviceSettingName,
  createDeviceSettingDataError,
};
