import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const revokeDataSharingAgreement: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    agreementId: Joi.string().guid().required(),
  }),
};

export default {
  validateRevokeDataSharingAgreement: validate(revokeDataSharingAgreement),
};
