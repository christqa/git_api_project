import {
  Prisma,
  Profile,
  Gender,
  LifeStyle,
  ExerciseIntensity,
  BowelMovement,
  UrinationsPerDay,
  MedicalCondition,
  Medication,
} from '@prisma/client';

export type IProfile = Profile;

export type IProfileUpdate = Omit<IProfile, 'id'>;

export type IProfileUniqueInput = Prisma.ProfileWhereUniqueInput;

export type IProfileWhereInput = Prisma.ProfileWhereInput;

export type IGender = Gender;

export type IExerciseIntensity = ExerciseIntensity;

export type IBowelMovement = BowelMovement;

export type IUrinationsPerDay = UrinationsPerDay;

export type ILifeStyle = LifeStyle;

export type IMedicalCondition = MedicalCondition;

export type IMedicalConditionWhereUniqueInput =
  Prisma.MedicalConditionWhereUniqueInput;

export type IMedication = Medication;

export type IMedicationWhereUniqueInput = Prisma.MedicationWhereUniqueInput;

export type IProfileUpdateResponse = { fresh: boolean; profile: IProfile };
