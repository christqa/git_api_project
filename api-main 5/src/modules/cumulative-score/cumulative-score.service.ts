import repository from '@repositories/cumulative-score.repository';
import { getNDayAgoDate } from '@utils/date.util';
import { IUser, IUserUniqueInput } from 'modules/user/user.type';
import { userService } from '@modules/index/index.service';
import {
  CumulativeScoreTypes,
  ICumulativeBaselineValue,
  ICumulativeScore,
  ICumulativeScoreDelete,
} from './cumulative-score.type';
import {
  ICreateCumulativeScore,
  ICreateCumulativeScoreInternalRequestDto,
  ICreateCumulativeScoreRequestDto,
  IDeleteCumulativeScoreRequestDto,
  IUpdateCumulativeScoreRequestDto2,
} from './dtos/cumulative-score.index.dto';
import {
  findProfileById,
  findProfileByUserId,
} from '@modules/profile/profile.service';
import profileRepository from '@repositories/profile.repository';
import { userNotFound } from '@modules/user/user.error';
import moduleErrors from './cumulative-score.error';
import prisma from '@core/prisma/prisma';
import { PrismaClient, TrendIndicators } from '@prisma/client';
import config from '@core/enviroment-variable-config';

const upsertBaseLineValue = async (
  request: ICreateCumulativeScoreRequestDto,
  user: IUser
) => {
  const profile = await profileRepository.findByUserId(user.id);
  if (!profile) {
    throw userNotFound();
  }

  const baselineValue = await repository.findFirstBaseLineValue({
    profileId: profile?.id,
    type: request.type,
  });

  if (baselineValue) {
    await repository.updateBaseLineValue(
      {
        id: baselineValue.id,
      },
      {
        value: request.baselineValue,
        updatedAt: new Date(),
      } as ICumulativeBaselineValue
    );
  } else {
    await repository.createBaseLineValue({
      profileId: profile?.id,
      type: request.type,
      value: Math.round(request.baselineValue!),
      updatedAt: new Date(),
    } as ICumulativeBaselineValue);
  }
};

const upsertDailyScore = async (
  request: ICreateCumulativeScore,
  profileId: number
) => {
  await findProfileById(profileId);

  // validate hydration score to have time of day
  if (request.type === CumulativeScoreTypes.hydration && !request.timeOfDay) {
    throw moduleErrors.hydrationMustHaveTimeOfDay();
  }

  const date = getNDayAgoDate(request.date);
  const currentCumulativeScore = await repository.findFirst({
    profileId,
    scoreOfRecord: true,
    type: request.type,
    date,
    timeOfDay: request.timeOfDay,
  });

  // get cumulative score previous value
  let previousValue = currentCumulativeScore?.value;
  if (!currentCumulativeScore) {
    const previousCumulativeScore = await repository.findFirst({
      profileId,
      scoreOfRecord: true,
      type: request.type,
      date: { lt: date },
      timeOfDay: request.timeOfDay,
    });
    previousValue = previousCumulativeScore?.value;
  }

  // save new cumulative score
  await prisma.$transaction(async (transaction) => {
    const prismaTr = transaction as PrismaClient;

    if (currentCumulativeScore?.id) {
      await repository.update(
        { id: currentCumulativeScore.id },
        {
          scoreOfRecord: false,
        } as ICumulativeScore,
        prismaTr
      );
    }

    const newValue = Math.round(request.value!);
    const newCumulativeScore = {
      date,
      type: request.type,
      value: newValue,
      profileId,
      timeOfDay: request.timeOfDay,
      trendIndicator: getTrendIndicator(previousValue, newValue),
    };
    await repository.create(newCumulativeScore, prismaTr);
  });
};

const getTrendIndicator = (
  previousValue: number | null | undefined,
  newValue: number | null
) => {
  if (
    newValue !== null &&
    newValue <= config.cumulativeScoreTrendIndicatorDownThreshold
  ) {
    return TrendIndicators.down;
  }

  if (
    previousValue === null ||
    previousValue === undefined ||
    newValue === null ||
    newValue === undefined
  ) {
    return null;
  }

  if (newValue < previousValue) {
    return TrendIndicators.down;
  }

  if (newValue > previousValue) {
    return TrendIndicators.up;
  }

  return TrendIndicators.same;
};

const upsertDailyScoreInternal = async (
  request: ICreateCumulativeScoreInternalRequestDto
) => {
  return upsertDailyScore(
    {
      date: request.date,
      type: request.type,
      value: request.value,
      timeOfDay: request.timeOfDay,
    },
    request.profileId
  );
};

const create = async (request: ICreateCumulativeScoreRequestDto) => {
  const user = await userService.findOne({
    email: request.userEmail,
  } as IUserUniqueInput);

  const profile = await profileRepository.findByUserId(user.id);
  if (!profile) {
    throw userNotFound();
  }

  if (typeof request.baselineValue === 'number') {
    await upsertBaseLineValue(request, user);
  }

  if (request.baselineValue === null) {
    await repository.removeBaseLineValue({
      profileId: profile.id,
      type: request.type,
    });
  }

  if (request.date !== null) {
    await upsertDailyScore(request, profile.id);
  }
};

const remove = async (request: IDeleteCumulativeScoreRequestDto) => {
  const user = await userService.findOne({
    email: request.userEmail,
  } as IUserUniqueInput);
  const profile = await findProfileByUserId(user.id);

  const date = getNDayAgoDate(request.date);

  const result = await repository.remove({
    profileId: profile.id,
    type: request.type,
    date: date,
  } as ICumulativeScoreDelete);

  return { message: `success, affected row: ${result.count}` };
};

const upsertDailyScores = async (
  dto: IUpdateCumulativeScoreRequestDto2,
  userEmail: string,
  deleteData?: boolean
) => {
  const user = await userService.findOne({
    email: userEmail,
  } as IUserUniqueInput);
  const profile = await findProfileByUserId(user.id);

  if (deleteData) {
    await repository.remove({
      profileId: profile.id,
    });
  }

  // todo: check and remove
  // if (dto.baselineValue) {
  //   await upsertBaseLineValue(dto, user);
  // }

  const scores: ICumulativeScore[] = dto.scores.map((score) => {
    return {
      profileId: profile.id,
      date: getNDayAgoDate(score.date),
      type: dto.type,
      value: Math.round(score.value),
      scoreOfRecord: true,
    } as ICumulativeScore;
  });

  const where = {
    profileId: profile.id,
    type: dto.type,
    date: { in: scores.map((score) => score.date) },
  } as ICumulativeScoreDelete;

  await repository.remove(where);
  await repository.createMany(scores);
};

export {
  create,
  remove,
  upsertDailyScore,
  upsertDailyScoreInternal,
  upsertDailyScores,
};
