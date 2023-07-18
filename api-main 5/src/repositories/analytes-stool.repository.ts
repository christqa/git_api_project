import {
  AnalyteTypes,
  IStoolData,
  IStoolDataBatchCount,
  IStoolDataDelete,
  IStoolDataUniqueInput,
  IStoolDataUpdate,
  IStoolDataWhereInput,
  StoolConsistencyEnum,
  StoolFilterType,
} from '@modules/analytes/analytes.type';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import { IGetStoolDataResponseDto } from '@modules/analytes/dtos/analytes.index.dto';
import { camelToSnakeCase } from '@utils/string.util';
import prisma from '@repositories/prisma.use.repository';
import { Prisma } from '@prisma/client';

const { stoolData } = prisma;

const remove = (where: IStoolDataDelete): Promise<IStoolDataBatchCount> => {
  return stoolData.deleteMany({
    where,
  });
};

const createMany = async (
  data: IStoolData[]
): Promise<IStoolDataBatchCount> => {
  return stoolData.createMany({
    data,
  });
};

const update = (
  where: IStoolDataUniqueInput,
  data: IStoolDataUpdate
): Promise<IStoolData> => {
  return stoolData.update({
    where,
    data,
  });
};

const findFirst = (
  where: IStoolDataWhereInput,
  orderByFilter: Prisma.SortOrder = Prisma.SortOrder.asc
): Promise<IStoolData | null> => {
  return stoolData.findFirst({
    where,
    orderBy: [
      {
        scoreDate: orderByFilter,
      },
    ],
  });
};

const findMaxValue = (
  where: IStoolDataWhereInput,
  field: string
): Promise<{ [key: string]: number } | null> => {
  return stoolData.findFirst({
    select: {
      [field]: true,
    },
    where,
    orderBy: [{ [field]: 'desc' }],
  });
};

const findMany = (
  profileId: number,
  startDate: Date,
  endDate?: Date,
  type?: AnalyteTypes,
  sortOrder?: 'asc' | 'desc'
): Promise<IStoolData[] | null> => {
  const order = sortOrder || 'desc';
  return stoolData.findMany({
    orderBy: [
      {
        scoreDate: order,
      },
    ],
    where: {
      profileId,
      scoreDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
};

const findManyByDate = (
  profileId: number,
  startDate: Date,
  endDate: Date
): Promise<IStoolData[] | null> => {
  return prisma.$queryRaw<IStoolData[]>`
    SELECT *
    FROM
      "StoolData"
    WHERE
      profile_id = ${profileId}
      AND end_date AT TIME ZONE 'UTC' AT TIME ZONE offset_tz >= ${startDate}
      AND end_date AT TIME ZONE 'UTC' AT TIME ZONE offset_tz <= ${endDate}`;
};

const findByAverage = async (
  profileId: number,
  startDate: Date,
  endDate: Date,
  groupBy: GroupByFilter = GroupByFilter.day,
  filter?: StoolFilterType,
  sortOrder?: 'asc' | 'desc'
): Promise<IGetStoolDataResponseDto[]> => {
  console.log('findByAverage, startDate, endDate ', startDate, endDate);
  const order = sortOrder || 'desc';
  const filterQuery = filter
    ? `date, ${camelToSnakeCase(filter)}${
        filter === StoolFilterType.consistency
          ? ', constipated_count, normal_count, diarrhea_count, total_stools'
          : ''
      }`
    : '*';
  const query = `
    SELECT ${filterQuery}
    FROM (
      SELECT
        TO_CHAR(DATE_TRUNC('${groupBy}', CAST(dd AS date)), 'YYYY-MM-DD') AS date,
        ROUND(AVG(color), 3)::double precision AS color,
        ROUND(AVG(consistency), 3)::double precision AS consistency,
        ROUND(AVG(duration_in_seconds), 0)::integer AS duration_in_seconds,
        ROUND(AVG(frequency), 3)::double precision AS frequency,
        CASE WHEN SUM(has_blood) > 0 THEN true ELSE false END AS has_blood,
        SUM(total_consistency_constipated)::integer AS constipated_count,
        SUM(total_consistency_normal)::integer AS normal_count,
        SUM(total_consistency_diarrhea)::integer AS diarrhea_count,
        SUM(total_stools)::integer AS total_stools
      FROM (
        SELECT
          dd,
          SUM(color) AS color,
          SUM(duration_in_seconds) AS duration_in_seconds,
          SUM(consistency) AS consistency,
          SUM(frequency) AS frequency,
          COUNT(
            CASE
              WHEN has_blood > 0 THEN 1
            END
          ) AS has_blood,
          SUM(total_consistency_constipated) AS total_consistency_constipated,
          SUM(total_consistency_normal) AS total_consistency_normal,
          SUM(total_consistency_diarrhea) AS total_consistency_diarrhea,
          SUM(total_stools) AS total_stools
        FROM (
          SELECT
            dd,
            frequency,
            color,
            consistency,
            duration_in_seconds,
            has_blood,
            total_consistency_constipated,
            total_consistency_normal,
            total_consistency_diarrhea,
            total_stools
          FROM (
            SELECT
              TO_CHAR(DATE_TRUNC('day', date), 'YYYY-MM-DD') AS dd,
              COUNT('dd') AS frequency,
              0 AS color,
              0 AS consistency,
              0 AS duration_in_seconds,
              0 AS has_blood,
              0 AS total_consistency_constipated,
              0 AS total_consistency_normal,
              0 AS total_consistency_diarrhea,
              0 AS total_stools
            FROM "AnalytesManualEntry"
            WHERE
              is_stool = true
              AND profile_id = ${profileId}
            GROUP BY dd
          ) AS a
          UNION
          SELECT
            dd,
            frequency,
            color,
            consistency,
            duration_in_seconds,
            has_blood,
            total_consistency_constipated,
            total_consistency_normal,
            total_consistency_diarrhea,
            total_stools
          FROM (
            SELECT
              TO_CHAR(DATE_TRUNC('day', score_date), 'YYYY-MM-DD') AS dd,
              COUNT('dd') AS frequency,
              ROUND(AVG(color), 3) AS color,
              ROUND(AVG(consistency), 3) AS consistency,
              ROUND(AVG(duration_in_seconds), 0) AS duration_in_seconds,
              COUNT(
                CASE
                  WHEN has_blood = true THEN 1
                END
              ) AS has_blood,
              COUNT(*) FILTER (WHERE consistency = ${
                StoolConsistencyEnum.CONSTIPATED
              }) AS total_consistency_constipated,
              COUNT(*) FILTER (WHERE consistency = ${
                StoolConsistencyEnum.NORMAL
              }) AS total_consistency_normal,
              COUNT(*) FILTER (WHERE consistency = ${
                StoolConsistencyEnum.DIARRHEA
              }) AS total_consistency_diarrhea,
              COUNT(*) AS total_stools
            FROM "StoolData"
            WHERE profile_id = ${profileId}
            GROUP BY dd
          ) AS b
        ) AS b
        WHERE CAST(dd AS date) BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
        GROUP BY dd
      ) AS c
      GROUP BY date
      ORDER BY date ${order}
    ) AS allDATA`;
  // eslint-disable-next-line
  const result = (await prisma.$queryRawUnsafe(query)) as any;
  // eslint-disable-next-line
  return (result || []).map((item: any) => {
    const {
      constipatedCount,
      normalCount,
      diarrheaCount,
      totalStools,
      ...otherProps
    } = item;
    return {
      ...otherProps,
      consistencyData:
        constipatedCount !== undefined
          ? {
              constipatedCount,
              normalCount,
              diarrheaCount,
              total: totalStools,
            }
          : undefined,
    };
  }) as unknown as IGetStoolDataResponseDto[];
};

export default {
  remove,
  findByAverage,
  createMany,
  update,
  findFirst,
  findMany,
  findManyByDate,
  findMaxValue,
};
