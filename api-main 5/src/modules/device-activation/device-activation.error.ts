import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  failedDependencyError,
  notFoundError,
  requestEntityTooLargeError,
} from '@core/error-handling/error-list';

const deviceAlreadyActivated = () => {
  return badRequestError(
    TranslationService.translate('device_activation_device_already_activated')
  );
};

const noActivatedDevice = () => {
  return notFoundError(
    TranslationService.translate('device_activation_activated_device_not_found')
  );
};

const noActivatedDeviceWithInvalidSerials = (invalidSerials: string[]) => {
  return notFoundError(
    TranslationService.translate(
      'device_activation_activated_device_not_found_with_invalid_serials',
      {
        invalidSerials: `${invalidSerials.join(', ')}`,
      }
    )
  );
};

const noUserDevice = () => {
  return notFoundError(
    TranslationService.translate('device_activation_user_device_not_found')
  );
};

const noTimeZone = () => {
  return notFoundError(
    TranslationService.translate('device_activation_time_zone_not_found')
  );
};

const deviceNameNotUnique = () => {
  return badRequestError(
    TranslationService.translate('device_activation_name_already_used')
  );
};

const noGroupAdmin = () => {
  return notFoundError(
    TranslationService.translate(
      'device_activation_the_group_users_or_admin_not_found'
    )
  );
};

const noDisconnectedDevice = () => {
  return notFoundError(
    TranslationService.translate(
      'device_activation_disconnected_device_not_found'
    )
  );
};
const tooManyDisconnectedDevices = () => {
  return requestEntityTooLargeError(
    'Too many disconnected devices, try with smaller date range'
  );
};

const wrongDateRange = () => {
  return badRequestError(
    TranslationService.translate('device_activation_the_from_must_be_before_to')
  );
};

const batteryLevelNotEnough = (batteryLevel: string) => {
  return failedDependencyError(
    TranslationService.translate('battery_level_not_enough', {
      batteryLevel,
    })
  );
};

const deviceInventoryIsVoid = () => {
  return badRequestError(
    TranslationService.translate(
      'device_activation_device_inventory_status_must_be_in_service'
    )
  );
};

export {
  deviceAlreadyActivated,
  noActivatedDevice,
  noUserDevice,
  noTimeZone,
  deviceNameNotUnique,
  noGroupAdmin,
  noDisconnectedDevice,
  tooManyDisconnectedDevices,
  wrongDateRange,
  batteryLevelNotEnough,
  noActivatedDeviceWithInvalidSerials,
  deviceInventoryIsVoid,
};
