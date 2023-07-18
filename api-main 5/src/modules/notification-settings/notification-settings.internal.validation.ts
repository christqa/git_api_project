import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const getNotificationSettingsByUser: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userGuid: Joi.string().uuid().required(),
  }),
};

export default {
  validateGetNotificationSettingsByUser: validate(
    getNotificationSettingsByUser
  ),
};
