import TranslationService from '@modules/translation/translation.service';
import { notFoundError } from '@core/error-handling/error-list';

const referenceDataVersionNotFound = () => {
  return notFoundError(
    TranslationService.translate(
      'reference_data_referencedata_version_not_found'
    )
  );
};

export { referenceDataVersionNotFound };
