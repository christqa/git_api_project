import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const getUserByProfileId: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    profileId: Joi.number().min(1).integer().required(),
  }),
};

const getUserByDeviceSerial: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    deviceSerial: Joi.string().required(),
  }),
};

const getUserByUserId: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userId: Joi.number().min(1).integer().required(),
  }),
};

const getAllUsers: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

const getUserProfileDeviceSerial: {
  path: ObjectSchema;
} = {
  path: Joi.object().keys({
    email: Joi.string().required(),
  }),
};

const getUserDevices: {
  path: ObjectSchema;
} = {
  path: Joi.object().keys({
    email: Joi.number().min(0).integer().required(),
  }),
};

const getUsersByDeviceTZ: {
  path: ObjectSchema;
  query: ObjectSchema;
} = {
  path: Joi.object().keys({
    deviceTimeZone: Joi.string()
      .pattern(new RegExp('[+-][0-9][0-9]'))
      .length(3)
      .required(),
  }),
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

export default {
  validateGetUserByProfileId: validate(getUserByProfileId),
  validateGetUserByDeviceSerial: validate(getUserByDeviceSerial),
  validateGetUserByUserId: validate(getUserByUserId),
  validateGetAllUsers: validate(getAllUsers),
  validateGetUserProfile: validate(getUserProfileDeviceSerial),
  validateGetUserDevices: validate(getUserDevices),
  validateGetUsersByDeviceTZ: validate(getUsersByDeviceTZ),
};
