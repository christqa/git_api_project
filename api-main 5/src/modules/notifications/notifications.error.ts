import TranslationService from '@modules/translation/translation.service';
import { conflictError, notFoundError } from '@core/error-handling/error-list';

const deviceTokenAlreadyExists = () => {
  return conflictError(
    TranslationService.translate('notifications_device_token_already_exists')
  );
};

const noDeviceToken = () => {
  return notFoundError(
    TranslationService.translate('notifications_no_device_token')
  );
};

export { deviceTokenAlreadyExists, noDeviceToken };
