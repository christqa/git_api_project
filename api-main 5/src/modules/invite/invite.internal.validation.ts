import Joi, { ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import validate from '@core/validation/validation.middleware';
import moment from 'moment';

const JoiDate = Joi.extend(DateExtension);

const updateInviteCreatedDate: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    createdDate: JoiDate.date()
      .format('YYYY-MM-DDTHH:mm:ssZ')
      .raw()
      .allow(null)
      .optional()
      .default(moment().format('YYYY-MM-DDTHH:mm:ssZ')),
    expiresDate: JoiDate.date()
      .format('YYYY-MM-DDTHH:mm:ssZ')
      .raw()
      .allow(null)
      .optional()
      .default(null),
  }),
};

const remindersInvite: {
  params: ObjectSchema;
  query: ObjectSchema;
} = {
  params: Joi.object().keys({
    periodDays: Joi.number().required().min(1).max(13),
  }),
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

const doExpiresInvite: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    periodDays: Joi.number().required().min(1).max(14),
  }),
};

const expiredInvites: {
  params: ObjectSchema;
  query: ObjectSchema;
} = {
  params: Joi.object().keys({
    periodDays: Joi.number().required().min(1).max(14),
  }),
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

export default {
  validateUpdateInviteCreatedDate: validate(updateInviteCreatedDate),
  validateRemindersInvite: validate(remindersInvite),
  validateExpiredInvites: validate(expiredInvites),
  validateDoExpiresInvite: validate(doExpiresInvite),
};
