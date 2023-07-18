import TranslationService from '@modules/translation/translation.service';
import { failedDependencyError } from '@core/error-handling/error-list';

const emailServiceError = (message: string) => {
  return failedDependencyError(
    TranslationService.translate('email_email_service_error_message', {
      message,
    })
  );
};

export { emailServiceError };
