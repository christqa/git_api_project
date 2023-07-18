import { PrismaClient } from '@prisma/client';
import prisma from '@core/prisma/prisma';

import {
  IDataSharingAgreement,
  IDataSharingAgreementInclude,
  IDataSharingAgreementWhereInput,
  IDataSharingAgreementWhereUniqueInput,
} from '@modules/data-sharing-agreement/data-sharing-agreement.type';

const { dataSharingAgreement } = prisma;

const create = (
  data: IDataSharingAgreement,
  prismaTr?: PrismaClient
): Promise<IDataSharingAgreement> => {
  return (prismaTr || prisma).dataSharingAgreement.create({
    data,
  });
};

const update = (
  where: IDataSharingAgreementWhereUniqueInput,
  data: IDataSharingAgreement
): Promise<IDataSharingAgreement> => {
  return dataSharingAgreement.update({
    where,
    data,
  });
};

const findFirst = (
  where: IDataSharingAgreementWhereInput,
  include?: IDataSharingAgreementInclude | null
): Promise<IDataSharingAgreement | null> => {
  return dataSharingAgreement.findFirst({
    where,
    include,
  });
};

const findMany = (
  where: IDataSharingAgreementWhereInput,
  include?: IDataSharingAgreementInclude | null
): Promise<IDataSharingAgreement[] | null> => {
  return dataSharingAgreement.findMany({
    where,
    include,
  });
};

export default {
  create,
  update,
  findFirst,
  findMany,
};
