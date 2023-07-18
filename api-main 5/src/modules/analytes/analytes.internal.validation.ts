import Joi, { ArraySchema, ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import moment from 'moment';
import validate from '@core/validation/validation.middleware';
import { AnalyteTypes } from '@modules/analytes/analytes.type';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const JoiDate = Joi.extend(DateExtension);

const date = JoiDate.date()
  .format(DATE_FORMAT_ISO8601)
  .raw()
  .required()
  .default(moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z');

const urineData = Joi.object({
  startDate: date,
  endDate: date,
  color: Joi.number().integer().min(1).max(2),
  durationInSeconds: Joi.number(),
  concentration: Joi.number().min(0.9).max(1.05),
});

const stoolData = Joi.object({
  startDate: date,
  endDate: date,
  color: Joi.number().integer().min(1).max(7),
  consistency: Joi.number().integer().min(1).max(3),
  hasBlood: Joi.boolean(),
  durationInSeconds: Joi.number(),
});

export const upsertUrine: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    userGuid: Joi.string().uuid().required(),
    data: Joi.array().items(urineData),
  }),
};

export const getUrine: {
  query: ObjectSchema;
} = {
  query: Joi.object({
    profileId: Joi.number().integer().min(1).required(),
    firstInDay: Joi.boolean(),
    startDate: date,
    endDate: date,
    type: Joi.string().valid('urine', 'stool').required(),
    sortOrder: Joi.string().valid('asc', 'desc').required(),
  }),
};

export const upsertStool: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    userGuid: Joi.string().uuid().required(),
    data: Joi.array().items(stoolData),
  }),
};

export const getExistingDataForDay: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    profileId: Joi.number().required(),
    scoreDate: date,
  }),
};

const addAnalytesToDB = {
  profileId: Joi.number().integer().min(1).required(),
  deviceId: Joi.number().integer().min(1).required(),
  color: Joi.number().required(),
  durationInSeconds: Joi.number().required(),
  startDate: Joi.date().raw().required(),
  endDate: Joi.date().raw().required(),
  scoreDate: Joi.date().raw().required(),
};

export const addUrinationToDB: {
  body: ArraySchema;
} = {
  body: Joi.array().items(
    Joi.object({
      ...addAnalytesToDB,
      concentration: Joi.number().required(),
      firstInDay: Joi.boolean().required(),
    })
  ),
};

export const addStoolToDB: {
  body: ArraySchema;
} = {
  body: Joi.array().items(
    Joi.object({
      ...addAnalytesToDB,
      consistency: Joi.number().required(),
      hasBlood: Joi.boolean().required(),
    })
  ),
};

export const getStools: {
  query: ObjectSchema;
} = {
  query: Joi.object({
    profileId: Joi.number().integer().min(1).required(),
    startDate: date,
    endDate: date,
  }),
};

export const getAnalytesManual: {
  query: ObjectSchema;
} = {
  query: Joi.object({
    profileId: Joi.number().integer().min(1).required(),
    startDate: date,
    endDate: date,
    type: Joi.string()
      .valid(...Object.keys(AnalyteTypes))
      .required(),
    sortOrder: Joi.string().valid('asc', 'desc').required(),
  }),
};

export const manualEnterToDB: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    profileId: Joi.number().min(0).integer().required(),
    date: date,
    start: date,
    end: date.min(Joi.ref('start')),
    isUrine: Joi.boolean().required(),
    isStool: Joi.boolean().required(),
  }),
};

export const addStoolSNS: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    deviceSerial: Joi.string().required(),
    data: Joi.array().items(stoolData),
    profileId: Joi.number().min(0).integer().required(),
    cameraNeedsAlignment: Joi.boolean().optional(),
  }),
};

export const addUrineSNS: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    deviceSerial: Joi.string().required(),
    data: Joi.array().items(urineData),
    profileId: Joi.number().min(0).integer().required(),
    cameraNeedsAlignment: Joi.boolean().optional(),
  }),
};

export const deleteUrine: {
  path: ObjectSchema;
} = {
  path: Joi.object({
    profileId: Joi.number().min(0).integer().required(),
  }),
};

export default {
  validateUpsertUrine: validate(upsertUrine),
  validateGetUrine: validate(getUrine),
  validateUpsertStool: validate(upsertStool),
  validateGetExistingDataForDay: validate(getExistingDataForDay),
  validateAddUrinationToDB: validate(addUrinationToDB),
  validateAddStoolToDB: validate(addStoolToDB),
  validateGetStools: validate(getStools),
  validateGetAnalytesManual: validate(getAnalytesManual),
  validateAddStoolSNS: validate(addStoolSNS),
  validateAddUrineSNS: validate(addUrineSNS),
  validateManualEnterToDB: validate(manualEnterToDB),
  validateDeleteUrine: validate(deleteUrine),
};
