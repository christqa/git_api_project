import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import { agreementTypes } from '@modules/agreements/agreements.type';

const links = Joi.object({
  url: Joi.string().required(),
  isoLocale: Joi.string().required(),
});

export const createAgreement: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    version: Joi.number().positive().required(),
    agreementType: Joi.string()
      .valid(...Object.keys(agreementTypes))
      .required(),
    links: Joi.array().items(links),
  }),
};

export default {
  validateCreateAgreement: validate(createAgreement),
};
