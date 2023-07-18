import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  notFoundError,
} from '@core/error-handling/error-list';

const noDevice = () => {
  return notFoundError(
    TranslationService.translate('device_inventory_device_not_found')
  );
};

const noTimeZones = (timeZoneTexts: string[]) => {
  return notFoundError(
    TranslationService.translate('device_inventory_time_zones_note_found', {
      timeZones: `${timeZoneTexts.join(', ')}`,
    })
  );
};

const deviceIsAlreadyVoided = () => {
  return badRequestError(
    TranslationService.translate('device_inventory_device_already_voided')
  );
};

export { noDevice, noTimeZones, deviceIsAlreadyVoided };
