import Joi, { ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import { CumulativeScoreTypes } from './cumulative-score.type';
import { CumulativeScoreGroupType } from './dtos/cumulative-score.index.dto';
import validate from '@core/validation/validation.middleware';
import { DATE_FORMAT_ISO8601 } from '../../constants';
import moment from 'moment';

const JoiDate = Joi.extend(DateExtension);

export const createCumulativeScore: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userEmail: Joi.string().email().required(),
    baselineValue: Joi.number().min(0).max(100).allow(null),
    type: Joi.string()
      .valid(...Object.keys(CumulativeScoreTypes))
      .required(),
    date: Joi.when('baselineValue', {
      not: Joi.exist(),
      then: Joi.number().integer().max(0).required(),
      otherwise: Joi.number().integer().max(0),
    }),
    value: Joi.when('baselineValue', {
      not: Joi.exist(),
      then: Joi.number().min(0).max(100).required(),
      otherwise: Joi.number().min(0).max(100),
    }),
    timeOfDay: Joi.string(),
  }),
};

export const deleteCumulativeScore: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userEmail: Joi.string().email().required(),
    type: Joi.string()
      .valid(...Object.keys(CumulativeScoreTypes))
      .required(),
    date: Joi.number().max(0).integer(),
    timeOfDay: Joi.string(),
  }),
};

export const getCumulativeScore: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.keys(CumulativeScoreTypes))
      .allow(null)
      .optional(),
    startDate: Joi.number().integer().max(0).min(-100).allow(null),
    endDate: Joi.number()
      .integer()
      .max(0)
      .min(-99)
      .greater(Joi.ref('startDate'))
      .allow(null),
  }),
};

const dailyScoreCreate: ObjectSchema = Joi.object().keys({
  date: Joi.number().integer().max(0).required(),
  value: Joi.number().min(0).max(100).required(),
});

export const createCumulativeScore2: {
  params: ObjectSchema;
  query: ObjectSchema;
  body: ObjectSchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  query: Joi.object().keys({
    deleteData: Joi.boolean().optional().default(false),
  }),
  body: Joi.object().keys({
    type: Joi.string()
      .valid(...Object.keys(CumulativeScoreTypes))
      .required(),
    scores: Joi.array().items(dailyScoreCreate),
  }),
};

export const getCumulativeScore2: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    type: Joi.string().valid(...Object.keys(CumulativeScoreTypes)),
    groupBy: Joi.string()
      .valid(...Object.keys(CumulativeScoreGroupType))
      .required(),
    startDate: JoiDate.date()
      .format(DATE_FORMAT_ISO8601)
      .raw()
      .required()
      .default(
        moment().subtract(14, 'days').format(DATE_FORMAT_ISO8601).slice(0, -6) +
          'Z'
      ),
    endDate: JoiDate.date()
      .format(DATE_FORMAT_ISO8601)
      .raw()
      .required()
      .default(moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z'),
    deleteData: Joi.boolean().optional().default(false),
  }),
};

export default {
  validateCreateCumulativeScore: validate(createCumulativeScore),
  validateDeleteCumulativeScore: validate(deleteCumulativeScore),
  validateGetCumulativeScore: validate(getCumulativeScore),
  validateCreateCumulativeScore2: validate(createCumulativeScore2),
  validateGetCumulativeScore2: validate(getCumulativeScore2),
};
