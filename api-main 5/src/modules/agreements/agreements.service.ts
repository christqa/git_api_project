import { ICreateAgreementRequestDto } from '@modules/agreements/dtos/create-agreements.dto';
import agreementRepository from '@repositories/agreements.repository';
import referenceDataRepository from '@repositories/reference-data.repository';
import prisma from '@core/prisma/prisma';
import {
  createAgreementDataError,
  duplicateAgreement,
} from '@modules/agreements/agreements.error';
import logger from '@core/logger/logger';
import { PrismaClient } from '@prisma/client';

const createAgreements = async (
  createAgreementDto: ICreateAgreementRequestDto
): Promise<void> => {
  const agreements: {
    agreementType: 'privacyPolicy' | 'termsAndConditions';
    version: number;
    url: string;
    localeIso: string;
  }[] = [];
  for (const link of createAgreementDto.links) {
    agreements.push({
      agreementType: createAgreementDto.agreementType,
      version: createAgreementDto.version,
      url: link.url,
      localeIso: link.isoLocale,
    });
  }
  for (const agreement of agreements) {
    const { agreementType, version, localeIso } = agreement;
    const existingAgreement = await agreementRepository.find({
      agreementType,
      version,
      localeIso,
    });
    if (existingAgreement && existingAgreement.length) {
      throw duplicateAgreement();
    }
  }
  try {
    const { count } = await prisma.$transaction(async (prismaClient) => {
      const prismaTr = prismaClient as PrismaClient;
      const created = await agreementRepository.createMany(
        { data: agreements },
        prismaTr
      );
      await referenceDataRepository.incrementVersion(prismaTr);
      return created;
    });
    if (!count) throw createAgreementDataError();
  } catch (e) {
    logger.log('error', `create agreement: ${e}`);
    throw createAgreementDataError();
  }
  return;
};

export default { createAgreements };
