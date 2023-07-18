import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const updateDataStore: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    arg: Joi.string(),
    value: [Joi.string(), Joi.number(), Joi.boolean()],
  })
    .pattern(/[a-zA-Z\\.]+/, [Joi.string(), Joi.number(), Joi.boolean()])
    .required(),
};

export default {
  validateUpdateDataStore: validate(updateDataStore),
};
