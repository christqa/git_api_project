import TranslationService from '@modules/translation/translation.service';
import { conflictError, notFoundError } from '@core/error-handling/error-list';

const messageTypeNotFound = () => {
  return notFoundError(
    TranslationService.translate('messages_message_type_not_found')
  );
};

const dateInTheFuture = () => {
  return conflictError(
    TranslationService.translate('messages_date_in_the_future_not_allowed')
  );
};

const messageNotFound = () => {
  return notFoundError(
    TranslationService.translate('messages_message_not_found')
  );
};

const messageAlreadyMarkedAsRead = () => {
  return conflictError(
    TranslationService.translate('messages_message_already_marked_as_read')
  );
};

export {
  messageTypeNotFound,
  messageNotFound,
  messageAlreadyMarkedAsRead,
  dateInTheFuture,
};
