import Joi, { ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import validate from '@core/validation/validation.middleware';
import moment from 'moment';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const JoiDate = Joi.extend(DateExtension);
const date = JoiDate.date()
  .format(DATE_FORMAT_ISO8601)
  .raw()
  .optional()
  .default(moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z');

const getMessages: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    startDate: date,
    endDate: date,
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
    read: Joi.boolean(),
    deleted: Joi.boolean(),
    messageTypeId: Joi.number().integer(),
  }),
};

const markAsReadMessage: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    messageGuid: Joi.string().guid().required(),
  }),
};

const getMessage: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    messageGuid: Joi.string().guid().required(),
  }),
};

const deleteMessage: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    messageGuid: Joi.string().guid().required(),
  }),
};

const updateNotify: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    type: Joi.number().integer().min(0),
  }),
};

export default {
  validateGetMessages: validate(getMessages),
  validateGetMessage: validate(getMessage),
  validateMarkAsReadMessage: validate(markAsReadMessage),
  validateDeleteMessage: validate(deleteMessage),
  validateUpdateNotify: validate(updateNotify),
};
