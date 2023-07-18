import prisma from '@core/prisma/prisma';

import {
  IBowelMovement,
  IExerciseIntensity,
  IGender,
  ILifeStyle,
  IMedicalCondition,
  IMedication,
  IUrinationsPerDay,
} from '@modules/profile/profile.type';
import { ITimeZone } from '@core/time-zone/time-zone.type';
import { IReferenceDataVersion } from '@modules/reference-data/reference-data-version.type';
import { IMessageType } from '@modules/messages/messages.type';
import { IRegionalPref } from '@modules/reference-data/referance-data.type';
import { PrismaClient } from '@prisma/client';

const {
  gender,
  lifeStyle,
  exerciseIntensity,
  medicalCondition,
  medication,
  urinationsPerDay,
  bowelMovement,
  timeZone,
  referenceDataVersion,
  messageType,
  regionalPref,
} = prisma;

const findReferenceDataVersion = (): Promise<IReferenceDataVersion | null> => {
  // TODO need to improve
  return referenceDataVersion.findFirst({ where: { id: 1 } });
};

const findGender = (): Promise<IGender[]> => {
  return gender.findMany();
};
const findLifeStyle = (): Promise<ILifeStyle[]> => {
  return lifeStyle.findMany();
};

const findExerciseIntensity = (): Promise<IExerciseIntensity[]> => {
  return exerciseIntensity.findMany();
};

const findMedicalCondition = (): Promise<IMedicalCondition[]> => {
  return medicalCondition.findMany();
};

const findMedication = (): Promise<IMedication[]> => {
  return medication.findMany();
};

const findUrinationsPerDay = (): Promise<IUrinationsPerDay[]> => {
  return urinationsPerDay.findMany();
};

const findBowelMovement = (): Promise<IBowelMovement[]> => {
  return bowelMovement.findMany();
};

const findTimeZone = (): Promise<ITimeZone[]> => {
  return timeZone.findMany();
};

const findMessageTypes = (): Promise<IMessageType[]> => {
  return messageType.findMany();
};

const findRegionalPref = (): Promise<IRegionalPref[]> => {
  return regionalPref.findMany();
};

const incrementVersion = (prismaTr?: PrismaClient) => {
  return (prismaTr || prisma).referenceDataVersion.update({
    where: { id: 1 },
    data: {
      version: {
        increment: 1,
      },
    },
  });
};

export default {
  findMessageTypes,
  findGender,
  findLifeStyle,
  findExerciseIntensity,
  findMedicalCondition,
  findMedication,
  findUrinationsPerDay,
  findBowelMovement,
  findTimeZone,
  findReferenceDataVersion,
  findRegionalPref,
  incrementVersion,
};
