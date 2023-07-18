import httpStatus from 'http-status';
import ApiError from '@core/error-handling/api-error';
import { profileService } from '@modules/index/index.service';
import profileRepository from '@repositories/profile.repository';

const genericObject = {
  id: 1,
  text: 'Generic',
};
const profileObject = {
  dob: '04/05/2003',
  createdOn: new Date(),
  updatedOn: new Date(),
  regionalPref: 'en-US',
  weightLbs: 5,
  heightIn: 1,
  userId: 1,
  genderId: 1,
  lifeStyleId: 1,
  exerciseIntensityId: 1,
  urinationsPerDayId: 1,
  bowelMovementId: 1,
};
const updateProfileObject = {
  fresh: true,
  profile: profileObject,
};

beforeEach(() => {
  jest
    .spyOn(profileRepository, 'findGenderById')
    .mockResolvedValue(genericObject);
  jest
    .spyOn(profileRepository, 'findLifeStyleById')
    .mockResolvedValue(genericObject);
  jest
    .spyOn(profileRepository, 'findUrinationsPerDayById')
    .mockResolvedValue(genericObject);
  jest
    .spyOn(profileRepository, 'findBowelMovementById')
    .mockResolvedValue(genericObject);
  jest
    .spyOn(profileRepository, 'findExerciseIntensityById')
    .mockResolvedValue(genericObject);
  jest
    .spyOn(profileRepository, 'countMedicalConditionByIds')
    .mockResolvedValue(1);
  jest.spyOn(profileRepository, 'countMedicationByIds').mockResolvedValue(1);
  jest
    .spyOn(profileRepository, 'update')
    // eslint-disable-next-line
    .mockResolvedValue(updateProfileObject as any);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Profile', () => {
  test('should test updateProfile function', async () => {
    const updatedProfile = await profileService.updateProfile(
      profileObject,
      [1],
      [1]
    );
    expect(updatedProfile.fresh).toBeTruthy();
  });

  test('should test updateProfile function (400 gender not exists)', async () => {
    jest.spyOn(profileRepository, 'findGenderById').mockResolvedValue(null);

    try {
      await profileService.updateProfile(profileObject);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('profile_gender_reference_not_foundid');
    }
  });

  test('should test updateProfile function (400 lifeStyle not exists)', async () => {
    jest.spyOn(profileRepository, 'findLifeStyleById').mockResolvedValue(null);

    try {
      await profileService.updateProfile(profileObject);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'profile_lifestyle_reference_not_foundid'
      );
    }
  });

  test('should test updateProfile function (400 urinationsPerDay not exists)', async () => {
    jest
      .spyOn(profileRepository, 'findUrinationsPerDayById')
      .mockResolvedValue(null);

    try {
      await profileService.updateProfile(profileObject);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'profile_urinations_per_day_reference_not_foundid'
      );
    }
  });

  test('should test updateProfile function (400 bowelMovement not exists)', async () => {
    jest
      .spyOn(profileRepository, 'findBowelMovementById')
      .mockResolvedValue(null);

    try {
      await profileService.updateProfile(profileObject);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'profile_bowel_movement_reference_not_foundid'
      );
    }
  });

  test('should test updateProfile function (400 exerciseIntensity not exists)', async () => {
    jest
      .spyOn(profileRepository, 'findExerciseIntensityById')
      .mockResolvedValue(null);

    try {
      await profileService.updateProfile(profileObject);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'profile_exercise_intensity_reference_not_foundid'
      );
    }
  });

  test('should test updateProfile function (400 medicalCondition not exists)', async () => {
    jest
      .spyOn(profileRepository, 'countMedicalConditionByIds')
      .mockResolvedValue(0);

    try {
      await profileService.updateProfile(profileObject, [1]);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'profile_one_or_some_of_medical_condition_reference_not_found'
      );
    }
  });

  test('should test updateProfile function (400 medication not exists)', async () => {
    jest.spyOn(profileRepository, 'countMedicationByIds').mockResolvedValue(0);

    try {
      await profileService.updateProfile(profileObject, [1], [1]);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'profile_one_or_some_of_medication_reference_not_found'
      );
    }
  });
});
