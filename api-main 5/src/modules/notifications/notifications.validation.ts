import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const createDeletePushToken: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceToken: Joi.string()
      .max(256)
      .pattern(/[0-9a-f]+/)
      .required(),
  }),
};

export default {
  validateCreateDeletePushToken: validate(createDeletePushToken),
};
