import Joi, { AlternativesSchema, ArraySchema, ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const createMessageInternal: {
  body: ObjectSchema | ArraySchema | AlternativesSchema;
} = {
  body: Joi.alternatives().try(
    Joi.object().keys({
      userGuid: Joi.string().uuid().required(),
      messageGuid: Joi.string().guid().required(),
      title: Joi.string().required(),
      message: Joi.string().required(),
      messageTypeId: Joi.number().integer().required(),
      read: Joi.boolean().required(),
      timestamp: Joi.date().optional(),
      metaData: Joi.object().unknown(true),
    }),
    Joi.array().items(
      Joi.object({
        userGuid: Joi.string().uuid().required(),
        messageGuid: Joi.string().guid().required(),
        title: Joi.string().required(),
        message: Joi.string().required(),
        messageTypeId: Joi.number().integer().required(),
        read: Joi.boolean().required(),
        timestamp: Joi.date().optional(),
        metaData: Joi.object().unknown(true),
      })
    )
  ),
};
const exp = '[+-][0-9][0-9]';

const getMessagesInternal: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    gmt: Joi.string().pattern(new RegExp(exp)).length(3).required(),
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
    push: Joi.boolean(),
    sms: Joi.boolean(),
  }),
};

export default {
  validateCreateMessageInternal: validate(createMessageInternal),
  validateGetMessagesInternal: validate(getMessagesInternal),
};
