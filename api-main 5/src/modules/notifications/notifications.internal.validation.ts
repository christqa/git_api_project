import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const triggerPushNotifications: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userGuid: Joi.string().uuid().required(),
    title: Joi.string().required(),
    type: Joi.string().required(),
    message: Joi.string().required(),
    link: Joi.string(),
    customInfo: Joi.object().unknown(true).optional(),
  }),
};

export default {
  validateTriggerPushNotifications: validate(triggerPushNotifications),
};
