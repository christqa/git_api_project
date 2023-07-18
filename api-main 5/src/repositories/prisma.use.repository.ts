import { Prisma } from '@prisma/client';
import prisma from '@core/prisma/prisma';
import { PrismaMiddlewareDataType } from '@modules/analytes/analytes.type';
import { fixPrismaDecimalPlaceInFloat } from '@utils/object.util';
// eslint-disable-next-line
const handleSoftDelete = (params: any) => {
  // Soft Delete queries
  // Change action to an update
  switch (params.action) {
    case 'delete':
      params.action = 'update';
      params.args['data'] = { deleted: new Date() };
      break;
    case 'deleteMany':
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['deleted'] = new Date();
      } else {
        params.args['data'] = { deleted: new Date() };
      }
      break;
    case 'findUnique':
    case 'findFirst':
      params.action = 'findFirst';
      params.args.where['deleted'] = { equals: null };
      break;
    case 'findMany':
    case 'aggregate':
    case 'count':
      if (params?.args?.where) {
        if (params.args.where.deleted === undefined) {
          // Exclude deleted records if they have not been explicitly requested
          params.args.where['deleted'] = { equals: null };
        }
      } else {
        params = {
          ...params,
          args: { ...params.args, where: { deleted: { equals: null } } },
        };
      }
      break;
  }
};
// eslint-disable-next-line
const applyQueryRawForUrineStool = (params: any, result: any) => {
  if (params.action !== 'queryRaw') {
    return result;
  }
  if (
    params.args.query &&
    params.args.query.indexOf(Prisma.ModelName.StoolData) === -1 &&
    params.args.query.indexOf(Prisma.ModelName.UrineData) === -1
  ) {
    return result;
  }

  return result.map((data: PrismaMiddlewareDataType) =>
    fixPrismaDecimalPlaceInFloat(data)
  );
};

prisma.$use(async (params, next) => {
  // Check incoming query type
  if (
    params.model &&
    [
      Prisma.ModelName.DeviceActivation,
      Prisma.ModelName.GroupDevices,
      Prisma.ModelName.Groups,
      Prisma.ModelName.GroupUsers,
      Prisma.ModelName.Message,
      Prisma.ModelName.Invitations,
      Prisma.ModelName.DeviceSettings,
      // eslint-disable-next-line
    ].includes(params.model as any)
  ) {
    handleSoftDelete(params);
  }

  const result = await next(params);
  return applyQueryRawForUrineStool(params, result);
});

export default prisma;
