import { DataSharingAgreement, Prisma } from '@prisma/client';
import { IUser } from '@modules/user/user.type';

export type IDataSharingAgreement = DataSharingAgreement;
export type IDataSharingAgreementExtended = DataSharingAgreement & {
  fromUser?: IUser;
  toUser?: IUser;
};
export type IDataSharingAgreementInclude = Prisma.DataSharingAgreementInclude;
export type IDataSharingAgreementWhereUniqueInput =
  Prisma.DataSharingAgreementWhereUniqueInput;
export type IDataSharingAgreementWhereInput =
  Prisma.DataSharingAgreementWhereInput;
