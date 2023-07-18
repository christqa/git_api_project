import {
  IShareUsage,
  IShareUsageWhereInput,
  ISignedAgreements,
  ISignedAgreementsCreate,
  ISignedAgreementsWhereInput,
} from '@modules/signed-agreements/signed-agreements.type';
import prisma from '@core/prisma/prisma';
import { ICreateAgreementDto } from '@modules/signed-agreements/dtos/create-signed-agreements.dto';
import { camelToSnakeCase } from '@utils/string.util';
const { signedAgreements, agreements, shareUsage } = prisma;

const create = async (
  data: ICreateAgreementDto
): Promise<ISignedAgreements> => {
  return signedAgreements.create({
    data: {
      agreements: {
        connect: {
          id: data.agreementId!,
        },
      },
      user: {
        connect: {
          id: data.userId,
        },
      },
    },
  });
};

const updateShareUsage = async (data: IShareUsage): Promise<IShareUsage> => {
  return shareUsage.upsert({
    where: {
      userId: data.userId,
    },
    update: {
      ...data,
    },
    create: {
      ...data,
    },
  });
};

const findFirst = async (
  where: ISignedAgreementsWhereInput
): Promise<ISignedAgreements | null> => {
  return signedAgreements.findFirst({
    where,
  });
};

const findFirstShareUsage = async (
  where: IShareUsageWhereInput
): Promise<IShareUsage | null> => {
  return shareUsage.findFirst({
    where,
  });
};

const findLastAgreementVersion = async ({ userId, agreementType }: any) => {
  const query = `SELECT MAX(version)::integer AS max FROM "Agreements" a JOIN "SignedAgreements" sa ON sa."agreement_id"=a."id"
  WHERE
  a."agreement_type"='${camelToSnakeCase(agreementType)}'
  and sa."user_id" = ${userId}`;
  let res: any = await prisma.$queryRawUnsafe(query);
  if (!res) {
    return -1;
  }
  res = res[0].max;
  return res as number;
};

export default {
  create,
  updateShareUsage,
  findFirst,
  findFirstShareUsage,
  findLastAgreementVersion,
};
