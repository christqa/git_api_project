import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

export const getDeviceInventories: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    deviceSerial: Joi.string(), // used for partial search
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

export const voidDeviceRequest: {
  path: ObjectSchema;
} = {
  path: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
};

export const patchDevice: {
  path: ObjectSchema;
  body: ObjectSchema;
} = {
  path: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
  body: Joi.object().keys({
    pixelRegistrationFile: Joi.object().unknown(true).required(),
  }),
};

export default {
  validateGetDeviceInventories: validate(getDeviceInventories),
  validateVoidDeviceRequest: validate(voidDeviceRequest),
  validatePatchDeviceRequest: validate(patchDevice),
};
