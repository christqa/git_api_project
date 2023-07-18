import TranslationService from '@modules/translation/translation.service';
import { notFoundError } from '@core/error-handling/error-list';

const deviceTokenNotFound = () => {
  return notFoundError(
    TranslationService.translate('user_mobile_device_token_not_found')
  );
};

export { deviceTokenNotFound };
