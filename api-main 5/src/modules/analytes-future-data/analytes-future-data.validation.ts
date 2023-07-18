import Joi, { ArraySchema, ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import moment from 'moment';
import validate from '@core/validation/validation.middleware';
import { AnalyteTypes } from '@modules/analytes/analytes.type';

const JoiDate = Joi.extend(DateExtension);

export const validateAnalytesData: {
  query: ObjectSchema;
} = {
  query: Joi.object({
    email: Joi.string().email().required(),
    type: Joi.string().valid(...Object.keys(AnalyteTypes)),
    startDate: JoiDate.date()
      .format('YYYY-MM-DDTHH:mm:ssZ')
      .raw()
      .required()
      .default(moment().format('YYYY-MM-DDTHH:mm:ssZ')),
    endDate: JoiDate.date()
      .format('YYYY-MM-DDTHH:mm:ssZ')
      .raw()
      .default(moment().format('YYYY-MM-DDTHH:mm:ssZ')),
  }),
};

export const upsertUrine: {
  params: ObjectSchema;
  body: ArraySchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  body: Joi.array().items(
    Joi.object({
      data: Joi.array().items(
        Joi.object({
          startDate: JoiDate.date()
            .format('YYYY-MM-DDTHH:mm:ssZ')
            .raw()
            .required(),
          endDate: JoiDate.date()
            .format('YYYY-MM-DDTHH:mm:ssZ')
            .raw()
            .required(),
          color: Joi.number().integer().min(1).max(2),
          durationInSeconds: Joi.number(),
          concentration: Joi.number().min(0.9).max(1.05),
        })
      ),
    })
  ),
};

export const upsertStool: {
  params: ObjectSchema;
  body: ArraySchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  body: Joi.array().items(
    Joi.object({
      data: Joi.array().items(
        Joi.object({
          startDate: JoiDate.date()
            .format('YYYY-MM-DDTHH:mm:ssZ')
            .raw()
            .required()
            .default(moment().format('YYYY-MM-DDTHH:mm:ssZ')),
          endDate: JoiDate.date()
            .format('YYYY-MM-DDTHH:mm:ssZ')
            .raw()
            .required()
            .default(moment().format('YYYY-MM-DDTHH:mm:ssZ')),
          color: Joi.number().integer().min(1).max(7),
          consistency: Joi.number().integer().min(1).max(3),
          hasBlood: Joi.boolean(),
          durationInSeconds: Joi.number(),
        })
      ),
    })
  ),
};

export const getAnalytes: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    startDate: JoiDate.date()
      .format(['MM/DD/YYYY', 'M/D/YYYY'])
      .raw()
      .required()
      .default(new Date().setDate(Date.now() - 14)),
    endDate: JoiDate.date()
      .format(['MM/DD/YYYY', 'M/D/YYYY'])
      .raw()
      .required()
      .default(new Date().setDate(Date.now() - 14)),
    email: Joi.string().email().required(),
  }),
};

export default {
  validateGetUrinations: validate(getAnalytes),
  validateGetStoolData: validate(getAnalytes),
  validateAnalytesData: validate(validateAnalytesData),
  validateUpsertUrineData: validate(upsertUrine),
  validateUpsertStoolData: validate(upsertStool),
};
