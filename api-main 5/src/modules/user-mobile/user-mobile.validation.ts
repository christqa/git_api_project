import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const userMobileLogin: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceToken: Joi.string()
      .max(256)
      .pattern(/[0-9a-f]+/)
      .required(),
  }),
};

const userMobileLogout: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceToken: Joi.string()
      .max(256)
      .pattern(/[0-9a-f]+/)
      .required(),
    userGuid: Joi.string().uuid().required(),
  }),
};

export default {
  validateUserMobileLogin: validate(userMobileLogin),
  validateUserMobileLogout: validate(userMobileLogout),
};
