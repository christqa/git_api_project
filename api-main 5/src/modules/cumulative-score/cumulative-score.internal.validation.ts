import Joi, { ObjectSchema } from 'joi';
import { CumulativeScoreTypes, TimeOfDayEnum } from './cumulative-score.type';
import validate from '@core/validation/validation.middleware';

export const createCumulativeScoreInternal: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    profileId: Joi.number(),
    type: Joi.string()
      .valid(...Object.keys(CumulativeScoreTypes))
      .required(),
    date: Joi.number().integer().required(),
    value: Joi.number().min(0).max(100).required().allow(null),
    timeOfDay: Joi.string().valid(...Object.keys(TimeOfDayEnum)),
  }),
};

export default {
  validateCreateCumulativeScoreInternal: validate(
    createCumulativeScoreInternal
  ),
};
