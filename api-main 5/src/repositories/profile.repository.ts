import prisma from '@core/prisma/prisma';

import {
  IBowelMovement,
  IExerciseIntensity,
  IGender,
  ILifeStyle,
  IMedicalCondition,
  IMedicalConditionWhereUniqueInput,
  IMedication,
  IMedicationWhereUniqueInput,
  IProfile,
  IProfileUpdate,
  IUrinationsPerDay,
} from '@modules/profile/profile.type';
import { userNotFound } from '@modules/user/user.error';
import userRepository from './user.repository';
import { PrismaClient } from '@prisma/client';

const {
  profile,
  gender,
  lifeStyle,
  exerciseIntensity,
  medicalCondition,
  medication,
  urinationsPerDay,
  bowelMovement,
} = prisma;

const findGenderById = (id: number): Promise<IGender | null> => {
  return gender.findUnique({
    where: { id },
  });
};

const findUrinationsPerDayById = (
  id: number
): Promise<IUrinationsPerDay | null> => {
  return urinationsPerDay.findUnique({
    where: { id },
  });
};

const findMedicalConditionById = (
  id: number
): Promise<IMedicalCondition | null> => {
  return medicalCondition.findUnique({
    where: { id },
  });
};

const findMedicationById = (id: number): Promise<IMedication | null> => {
  return medication.findUnique({
    where: { id },
  });
};

const findBowelMovementById = (id: number): Promise<IBowelMovement | null> => {
  return bowelMovement.findUnique({
    where: { id },
  });
};

const findLifeStyleById = (id: number): Promise<ILifeStyle | null> => {
  return lifeStyle.findUnique({
    where: { id },
  });
};

const findExerciseIntensityById = (
  id: number
): Promise<IExerciseIntensity | null> => {
  return exerciseIntensity.findUnique({
    where: { id },
  });
};

const countMedicalConditionByIds = (ids: number[]): Promise<number> => {
  return medicalCondition.count({
    where: {
      id: { in: ids },
    },
  });
};

const countMedicationByIds = (ids: number[]): Promise<number> => {
  return medication.count({
    where: {
      id: { in: ids },
    },
  });
};

const findByUserId = async (
  userId: number,
  prismaTr?: PrismaClient
): Promise<IProfile | null> => {
  return (prismaTr || prisma).profile.findFirst({
    where: {
      userId,
    },
  });
};

const findByUserGuid = async (userGuid: string): Promise<IProfile | null> => {
  const user = await userRepository.findFirst({
    userGuid,
  });

  if (!user) {
    throw userNotFound();
  }

  return profile.findFirst({
    where: {
      userId: user.id,
    },
  });
};

const findById = async (id: number): Promise<IProfile | null> => {
  return profile.findFirst({
    where: {
      id,
    },
  });
};

const update = async (
  data: IProfileUpdate,
  medicalConditions?: IMedicalConditionWhereUniqueInput[],
  medications?: IMedicationWhereUniqueInput[],
  prismaTr?: PrismaClient
): Promise<{ fresh: boolean; profile: IProfile }> => {
  const isThere = await (prismaTr || prisma).profile.findFirst({
    where: {
      userId: data.userId,
    },
  });
  const statusReturned = await (prismaTr || prisma).profile.upsert({
    where: {
      userId: data.userId,
    },
    update: {
      ...data,
      medicalConditions: medicalConditions
        ? { set: [], connect: medicalConditions }
        : undefined,
      medications: medications ? { set: [], connect: medications } : undefined,
    },
    create: {
      ...data,
      medicalConditions: { connect: medicalConditions },
      medications: { connect: medications },
    },
  });

  return {
    fresh: isThere == null,
    profile: statusReturned,
  };
};

export default {
  update,
  findGenderById,
  findByUserGuid,
  findLifeStyleById,
  findExerciseIntensityById,
  countMedicalConditionByIds,
  countMedicationByIds,
  findUrinationsPerDayById,
  findBowelMovementById,
  findMedicalConditionById,
  findMedicationById,
  findByUserId,
  findById,
};
