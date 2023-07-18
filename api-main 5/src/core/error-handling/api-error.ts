import { TranslatedMessageType } from '@modules/translation/translation.types';
import { isTranslatedMessageType } from '@utils/object.util';

class ApiError extends Error {
  status: number;
  message: string;
  localised?: TranslatedMessageType;
  constructor(status: number, message: string | TranslatedMessageType) {
    if (isTranslatedMessageType(message)) {
      const errorMessage = JSON.stringify(message);
      super(errorMessage);
      this.localised = message;
      this.message = errorMessage;
    } else {
      super(message);
      this.message = message;
    }
    this.status = status;
  }
}

export default ApiError;
