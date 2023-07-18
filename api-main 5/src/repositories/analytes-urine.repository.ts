import {
  AnalyteTypes,
  IUrineColorType,
  IUrineData,
  IUrineDataBatchCount,
  IUrineDataDelete,
  IUrineDataUniqueInput,
  IUrineDataUpdate,
  IUrineDataWhereInput,
  UrineFilterType,
} from '@modules/analytes/analytes.type';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import { IGetUrineResponseDto } from '@modules/analytes/dtos/analytes.index.dto';
import { camelToSnakeCase } from '@utils/string.util';
import prisma from '@repositories/prisma.use.repository';
import { Prisma } from '@prisma/client';

const { urineData } = prisma;

const remove = (where: IUrineDataDelete): Promise<IUrineDataBatchCount> => {
  return urineData.deleteMany({
    where,
  });
};

const createMany = async (
  data: IUrineData[]
): Promise<IUrineDataBatchCount> => {
  return urineData.createMany({
    data,
  });
};

const update = (
  where: IUrineDataUniqueInput,
  data: IUrineDataUpdate
): Promise<IUrineData> => {
  return urineData.update({
    where,
    data,
  });
};

const findFirst = (
  where: IUrineDataWhereInput,
  orderByFilter: Prisma.SortOrder = Prisma.SortOrder.asc
): Promise<IUrineData | null> => {
  return urineData.findFirst({
    where,
    orderBy: [
      {
        scoreDate: orderByFilter,
      },
    ],
  });
};

const findMaxValue = (
  where: IUrineDataWhereInput,
  field: string
): Promise<{ [key: string]: number } | null> => {
  return urineData.findFirst({
    select: {
      [field]: true,
    },
    where,
    orderBy: [{ [field]: 'desc' }],
  });
};
const findByAverage = async (
  profileId: number,
  startDate: Date,
  endDate: Date,
  groupBy: GroupByFilter = GroupByFilter.day,
  filter?: UrineFilterType,
  sortOrder?: 'asc' | 'desc'
): Promise<IGetUrineResponseDto[]> => {
  const filterQuery = filter
    ? filter !== UrineFilterType.color
      ? `date, ${camelToSnakeCase(filter)}`
      : `date, ${camelToSnakeCase(
          filter
        )},"wellHydratedCount","hydrationDeficientCount",total`
    : '*';
  const query = `
  select ${filterQuery} FROM (SELECT
    date,
    SUM(color)::double precision as color,
           SUM(duration_in_seconds)::integer as duration_in_seconds,
           SUM(concentration)::double precision as concentration,
            SUM(frequency)::double precision as frequency,
            SUM("wellHydratedCount")::integer as "wellHydratedCount",
           SUM("hydrationDeficientCount")::integer as "hydrationDeficientCount",
           SUM(Total)::integer as Total
   FROM (SELECT * FROM (
       SELECT to_char(date_trunc('${groupBy}', CAST(dd as date)), 'YYYY-MM-DD') as date,
           ROUND(AVG(color), 3) as color,
           ROUND(AVG(concentration), 3) as concentration,
           ROUND(AVG(duration_in_seconds), 0) as duration_in_seconds,
           0 as frequency,
           0 as "wellHydratedCount",
           0 as "hydrationDeficientCount",
           0 as Total
   FROM (SELECT to_char(date_trunc('${groupBy}', score_date), 'YYYY-MM-DD') as dd,
           ROUND(AVG(color), 3) as color,
           ROUND(AVG(concentration), 3) as concentration,
           ROUND(AVG(duration_in_seconds), 0) as duration_in_seconds
           FROM "UrineData"
           WHERE first_in_day = false AND profile_id = ${profileId}
           GROUP BY dd) as a
           WHERE CAST(dd as date) BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
   GROUP BY date) as b
   UNION
   SELECT * FROM (
       SELECT to_char(date_trunc('${groupBy}', CAST(dd as date)), 'YYYY-MM-DD') as date,
    0 as color,
           0 as concentration,
           0 as duration_in_seconds,
            ROUND(AVG(frequency), 3) as frequency,
           SUM("wellHydratedCount") as "wellHydratedCount",
           SUM("hydrationDeficientCount") as "hydrationDeficientCount",
           SUM(Total) as Total
   FROM (SELECT dd,
           SUM(frequency) as frequency,
           SUM("wellHydratedCount") as "wellHydratedCount",
           SUM("hydrationDeficientCount") as "hydrationDeficientCount",
           SUM(Total) as Total
           from
   (Select dd, frequency, 0 as "wellHydratedCount", 0 as "hydrationDeficientCount", 0 as Total FROM (SELECT
           to_char(date_trunc('${groupBy}', date), 'YYYY-MM-DD') as dd,
           COUNT('dd') as frequency
           FROM "AnalytesManualEntry"
           where is_urine = true AND profile_id = ${profileId}
           GROUP BY dd) as a
   UNION
   SELECT dd ,frequency, "wellHydratedCount", "hydrationDeficientCount", Total
    FROM (SELECT to_char(date_trunc('${groupBy}', score_date), 'YYYY-MM-DD') as dd,
           COUNT('dd') as frequency,
           count(*) FILTER (WHERE color = ${
             IUrineColorType.WellHydrated
           }) AS "wellHydratedCount",
           count(*) FILTER (WHERE color = ${
             IUrineColorType.HydrationDeficient
           }) AS "hydrationDeficientCount",
           count(*) AS Total
           FROM "UrineData"
           WHERE profile_id = ${profileId}
           GROUP BY dd) as b) as b
           WHERE CAST(dd as date) BETWEEN  '${startDate.toISOString()}' AND '${endDate.toISOString()}'
   GROUP BY dd) as c
   GROUP BY date) as allFrequency) as allData
   GROUP BY date
   ORDER BY date ${sortOrder}) as sortedType
`;
  const result = (await prisma.$queryRawUnsafe(query)) as any[];
  if (!result) {
    return [];
  }
  return result.map((item) => {
    if (filter === UrineFilterType.color) {
      return {
        date: item.date,
        color: item.color,
        colorData: {
          wellHydratedCount: item.wellhydratedcount,
          hydrationDeficientCount: item.hydrationdeficientcount,
          total: item.total,
        },
      };
    } else if (filter === undefined) {
      return {
        date: item.date,
        color: item.color,
        colorData: {
          wellHydratedCount: item.wellhydratedcount,
          hydrationDeficientCount: item.hydrationdeficientcount,
          total: item.total,
        },
        concentration: item.concentration,
        durationInSeconds: item.durationInSeconds,
        frequency: item.frequency,
      };
    } else {
      return {
        ...item,
      };
    }
  }) as unknown as IGetUrineResponseDto[];
};

const findMany = (
  profileId: number,
  startDate: Date,
  firstInDay?: boolean,
  endDate?: Date,
  type?: AnalyteTypes,
  sortOrder?: 'asc' | 'desc'
): Promise<IUrineData[]> => {
  const order = sortOrder || 'desc';
  return urineData.findMany({
    orderBy: [
      {
        scoreDate: order,
      },
    ],
    where: {
      profileId,
      firstInDay,
      scoreDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
};
const findManyWithScoreDate = (
  profileId: number,
  scoreDate: Date
): Promise<IUrineData[]> => {
  return urineData.findMany({
    where: {
      profileId,
      scoreDate,
    },
  });
};
const findManyWithoutFirstInDay = (
  profileId: number,
  startDate: Date,
  endDate: Date
): Promise<IUrineData[]> => {
  return prisma.$queryRaw<IUrineData[]>`
    SELECT *
    FROM
      "UrineData"
    WHERE
      profile_id = ${profileId}
      AND end_date AT TIME ZONE 'UTC' AT TIME ZONE offset_tz >= ${startDate}
      AND end_date AT TIME ZONE 'UTC' AT TIME ZONE offset_tz <= ${endDate}`;
};

export default {
  remove,
  findByAverage,
  createMany,
  update,
  findFirst,
  findMany,
  findMaxValue,
  findManyWithoutFirstInDay,
  findManyWithScoreDate,
};
