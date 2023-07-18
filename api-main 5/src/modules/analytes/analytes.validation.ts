import Joi, { ArraySchema, ObjectSchema } from 'joi';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import { StoolFilterType, UrineFilterType } from './analytes.type';

import DateExtension from '@joi/date';
import moment from 'moment';
import validate from '@core/validation/validation.middleware';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const JoiDate = Joi.extend(DateExtension);

const date = JoiDate.date()
  .format(DATE_FORMAT_ISO8601)
  .raw()
  .required()
  .default(moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z');

export const getUrinations: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    startDate: date,
    endDate: date,
    groupBy: Joi.string()
      .valid(...Object.keys(GroupByFilter))
      .default(GroupByFilter.day),
    type: Joi.string().valid(...Object.keys(UrineFilterType)),
  }),
};

export const getStoolData: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    startDate: date,
    endDate: date,
    groupBy: Joi.string()
      .valid(...Object.keys(GroupByFilter))
      .default(GroupByFilter.day),
    type: Joi.string().valid(...Object.keys(StoolFilterType)),
  }),
};

export const deleteUrine: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userEmail: Joi.string().email().required(),
    date: Joi.number().max(0).integer(),
  }),
};

export const deleteStool: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userEmail: Joi.string().email().required(),
    date: Joi.number().max(0).integer(),
  }),
};

export const upsertUrine: {
  params: ObjectSchema;
  query: ObjectSchema;
  body: ArraySchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  query: Joi.object().keys({
    deleteData: Joi.boolean().optional().default(false),
  }),
  body: Joi.array().items(
    Joi.object({
      data: Joi.array().items(
        Joi.object({
          startDate: date,
          endDate: date,
          color: Joi.number().integer().min(1).max(10),
          durationInSeconds: Joi.number(),
          concentration: Joi.number().min(0.9).max(1.05),
        })
      ),
    })
  ),
};

const manualEnter: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    beginning: date,
    end: date,
    isUrine: Joi.boolean().required(),
    isStool: Joi.boolean().required(),
  }),
};

export const upsertStool: {
  params: ObjectSchema;
  query: ObjectSchema;
  body: ArraySchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  query: Joi.object().keys({
    deleteData: Joi.boolean().optional().default(false),
  }),
  body: Joi.array().items(
    Joi.object({
      data: Joi.array().items(
        Joi.object({
          startDate: date,
          endDate: date,
          color: Joi.number().integer().min(1).max(7),
          consistency: Joi.number().integer().min(1).max(7),
          hasBlood: Joi.boolean(),
          durationInSeconds: Joi.number(),
        })
      ),
    })
  ),
};

const fileUpsertStool: {
  params: ObjectSchema;
  query: ObjectSchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
  query: Joi.object().keys({
    deleteData: Joi.boolean().optional().default(false),
  }),
};
const removeUrinationData: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    profileId: Joi.number().min(1).integer().required(),
  }),
};
export default {
  validateGetUrinations: validate(getUrinations),
  validateGetStoolData: validate(getStoolData),
  validateDeleteUrine: validate(deleteUrine),
  validateDeleteStool: validate(deleteStool),
  validateUpsertUrine: validate(upsertUrine),
  validateUpsertStool: validate(upsertStool),
  validateFileUpsertStool: validate(fileUpsertStool),
  validateManualEnter: validate(manualEnter),
  validateRemoveUrinationData: validate(removeUrinationData),
};
