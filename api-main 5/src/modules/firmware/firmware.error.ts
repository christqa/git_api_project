import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  conflictError,
  notFoundError,
  unprocessableEntityError,
} from '@core/error-handling/error-list';

const noDeviceFirmware = () => {
  return notFoundError(
    TranslationService.translate('firmware_device_firmware_not_found')
  );
};

const userAlreadyAcceptedDeviceFirmware = () => {
  return badRequestError(
    TranslationService.translate(
      'firmware_user_already_accepted_device_firmware'
    )
  );
};

const deviceFirmwareNotInPendingStatus = () => {
  return badRequestError(
    TranslationService.translate(
      'firmware_device_firmware_is_not_in_pending_status'
    )
  );
};

const noFirmwareFound = () => {
  return notFoundError(TranslationService.translate('firmware_not_found'));
};
const noFirmwaresFound = (firmwareVersions: string[]) => {
  return notFoundError(
    TranslationService.translate('firmware_versions_not_found', {
      firmwareVersions: `${firmwareVersions.join(', ')}`,
    })
  );
};
const createFirmwareError = () => {
  return unprocessableEntityError(
    TranslationService.translate('firmware_cannot_be_created')
  );
};

const firmwareAvailabilityNotGradualRolloutAvailability = () => {
  return badRequestError(
    TranslationService.translate(
      'firmware_firmware_availability_is_not_gradual_rollout_availability'
    )
  );
};

const releaseFirmwareReleaseTypeDeviceSerialsBadRequest = () => {
  return badRequestError(
    TranslationService.translate(
      'firmware_release_type_device_serials_not_matched'
    )
  );
};

const releaseFirmwareReleaseTypeNotMatchedBadRequest = () => {
  return badRequestError(
    TranslationService.translate(
      'firmware_release_type_firmware_availability_type_not_matched'
    )
  );
};

const releaseFirmwareError = () => {
  return unprocessableEntityError('firmware_failed_to_release_firmware');
};

const firmwareVersionAlreadyExists = () => {
  return conflictError(
    TranslationService.translate('firmware_firmware_already_exists')
  );
};

const firmwareDeviceModelNotFound = () => {
  return notFoundError(
    TranslationService.translate('firmware_device_model_not_found')
  );
};

const releaseFirmwareSkipUserApprovalError = () => {
  return badRequestError(
    TranslationService.translate(
      'firmware_can_only_skip_user_approval_for_internal_firmware'
    )
  );
};

export {
  noDeviceFirmware,
  userAlreadyAcceptedDeviceFirmware,
  deviceFirmwareNotInPendingStatus,
  noFirmwareFound,
  createFirmwareError,
  firmwareAvailabilityNotGradualRolloutAvailability,
  releaseFirmwareReleaseTypeDeviceSerialsBadRequest,
  releaseFirmwareReleaseTypeNotMatchedBadRequest,
  releaseFirmwareError,
  firmwareVersionAlreadyExists,
  firmwareDeviceModelNotFound,
  releaseFirmwareSkipUserApprovalError,
  noFirmwaresFound,
};
