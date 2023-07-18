import profileRepository from '@repositories/profile.repository';
import {
  IProfile,
  IProfileUpdate,
  IProfileUpdateResponse,
} from './profile.type';
import {
  bowelMovementNotExist,
  exerciseIntensityNotExist,
  genderNotExist,
  lifeStyleNotExist,
  medicalConditionNotExist,
  medicationNotExist,
  urinationsPerDayNotExist,
  userHasNoProfileData,
} from './profile.error';
import { PrismaClient } from '@prisma/client';

const updateProfile = async (
  profile: IProfileUpdate,
  medicalConditionIds?: number[],
  medicationIds?: number[],
  prismaTr?: PrismaClient
): Promise<IProfileUpdateResponse> => {
  await validateGender(profile.genderId);

  await validateLifeStyleId(profile.lifeStyleId);

  await validateUrinationsPerDayId(profile.urinationsPerDayId);

  await validateBowelMovementId(profile.bowelMovementId);

  await validateExerciseIntensityId(profile.exerciseIntensityId);

  await validateMedicalConditionIds(medicalConditionIds);

  await validateMedicationIds(medicationIds);

  const medicalConditions = medicalConditionIds?.map((id: number) => ({
    id,
  }));

  const medications = medicationIds?.map((id: number) => ({ id }));

  return profileRepository.update(
    profile,
    medicalConditions,
    medications,
    prismaTr
  );
};

const validateGender = async (genderId: number) => {
  const gender = await profileRepository.findGenderById(genderId);
  if (!gender) {
    throw genderNotExist(genderId);
  }
};

const validateLifeStyleId = async (lifeStyleId: number | null) => {
  if (!lifeStyleId) {
    return;
  }
  const lifeStyle = await profileRepository.findLifeStyleById(lifeStyleId);
  if (!lifeStyle) {
    throw lifeStyleNotExist(lifeStyleId);
  }
};

const validateUrinationsPerDayId = async (
  urinationsPerDayId: number | null
) => {
  if (!urinationsPerDayId) {
    return;
  }
  const urinationsPerDay = await profileRepository.findUrinationsPerDayById(
    urinationsPerDayId
  );
  if (!urinationsPerDay) {
    throw urinationsPerDayNotExist(urinationsPerDayId);
  }
};

const validateBowelMovementId = async (bowelMovementId: number | null) => {
  if (!bowelMovementId) {
    return;
  }
  const bowelMovement = await profileRepository.findBowelMovementById(
    bowelMovementId
  );
  if (!bowelMovement) {
    throw bowelMovementNotExist(bowelMovementId);
  }
};

const validateExerciseIntensityId = async (
  exerciseIntensityId: number | null
) => {
  if (!exerciseIntensityId) {
    return;
  }
  const exerciseIntensity = await profileRepository.findExerciseIntensityById(
    exerciseIntensityId
  );
  if (!exerciseIntensity) {
    throw exerciseIntensityNotExist(exerciseIntensityId);
  }
};

const validateMedicalConditionIds = async (
  medicalConditionIds: number[] | undefined
) => {
  if (!medicalConditionIds?.length) {
    return;
  }
  const count = await profileRepository.countMedicalConditionByIds(
    medicalConditionIds
  );
  if (count !== medicalConditionIds.length) {
    throw medicalConditionNotExist();
  }
};

const validateMedicationIds = async (medicationIds: number[] | undefined) => {
  if (!medicationIds?.length) {
    return;
  }
  const count = await profileRepository.countMedicationByIds(medicationIds);
  if (count !== medicationIds.length) {
    throw medicationNotExist();
  }
};

const findProfileByUserId = async (userId: number): Promise<IProfile> => {
  const profile = await profileRepository.findByUserId(userId);
  if (!profile) {
    throw userHasNoProfileData();
  }
  return profile;
};

const findProfileByUserGuid = async (userGuid: string): Promise<IProfile> => {
  const profile = await profileRepository.findByUserGuid(userGuid);
  if (!profile) {
    throw userHasNoProfileData();
  }
  return profile;
};

const findProfileById = async (profileId: number): Promise<IProfile> => {
  const profile = await profileRepository.findById(profileId);
  if (!profile) {
    throw userHasNoProfileData();
  }
  return profile;
};

export {
  updateProfile,
  findProfileByUserId,
  findProfileById,
  findProfileByUserGuid,
};
