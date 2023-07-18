import Joi, { ArraySchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import {
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from './notification-settings.type';

const updateNotificationSettings: {
  body: ArraySchema;
} = {
  body: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(...Object.values(NotificationSettingsTypes))
          .required(),
        option: Joi.string()
          .valid(...Object.values(NotificationSettingsOptions))
          .required(),
        sms: Joi.boolean().required(),
        push: Joi.boolean().required(),
        email: Joi.boolean().required(),
      })
    )
    .min(1)
    .unique('type'),
};

export default {
  validateUpdateNotificationSettings: validate(updateNotificationSettings),
};
