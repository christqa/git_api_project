import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

export const createSignedAgreements: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    privacyPolicyVersion: Joi.number().integer().min(1),
    termsAndConditionsVersion: Joi.number().integer().min(1),
    shareUsageAgreed: Joi.boolean().default(true),
  }),
};

export default {
  validateCreateSignedAgreements: validate(createSignedAgreements),
};
