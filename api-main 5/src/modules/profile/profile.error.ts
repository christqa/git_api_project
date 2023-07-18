import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  conflictError,
  forbiddenError,
  notFoundError,
} from '@core/error-handling/error-list';

const userHasNoProfileData = () => {
  return notFoundError(
    TranslationService.translate('profile_user_has_no_profile_data')
  );
};

const genderNotExist = (id: number) => {
  return badRequestError(
    TranslationService.translate('profile_gender_reference_not_foundid', { id })
  );
};

const lifeStyleNotExist = (id: number) => {
  return badRequestError(
    TranslationService.translate('profile_lifestyle_reference_not_foundid', {
      id,
    })
  );
};

const urinationsPerDayNotExist = (id: number) => {
  return badRequestError(
    TranslationService.translate(
      'profile_urinations_per_day_reference_not_foundid',
      { id }
    )
  );
};

const bowelMovementNotExist = (id: number) => {
  return badRequestError(
    TranslationService.translate(
      'profile_bowel_movement_reference_not_foundid',
      { id }
    )
  );
};

const exerciseIntensityNotExist = (id: number) => {
  return badRequestError(
    TranslationService.translate(
      'profile_exercise_intensity_reference_not_foundid',
      { id }
    )
  );
};

const medicalConditionNotExist = () => {
  return badRequestError(
    TranslationService.translate(
      'profile_one_or_some_of_medical_condition_reference_not_found'
    )
  );
};

const medicationNotExist = () => {
  return badRequestError(
    TranslationService.translate(
      'profile_one_or_some_of_medication_reference_not_found'
    )
  );
};

const profileAlreadyExists = () => {
  return conflictError(
    TranslationService.translate('profile_profile_already_exists')
  );
};

const wrongProfileOwner = () => {
  return forbiddenError(
    TranslationService.translate('profile_wrong_profile_owner')
  );
};

export {
  userHasNoProfileData,
  profileAlreadyExists,
  genderNotExist,
  lifeStyleNotExist,
  urinationsPerDayNotExist,
  bowelMovementNotExist,
  exerciseIntensityNotExist,
  medicalConditionNotExist,
  medicationNotExist,
  wrongProfileOwner,
};
