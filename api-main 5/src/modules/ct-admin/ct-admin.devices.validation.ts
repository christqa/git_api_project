import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import { IUserCtAdminSortBy } from '@modules/user/user.type';
import { IDeviceActivationFindAllDevicesSortBy } from '@modules/device-activation/device-activation.type';
import { IEventWithDeviceSortBy } from '@modules/device-events/device-events.type';

export const getDevices: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
    sortBy: Joi.string().when('orderBy', {
      is: Joi.exist(),
      then: Joi.string()
        .valid(...Object.keys(IDeviceActivationFindAllDevicesSortBy))
        .required(),
      otherwise: Joi.string()
        .valid(...Object.keys(IDeviceActivationFindAllDevicesSortBy))
        .optional(),
    }),
    orderBy: Joi.string().valid('asc', 'desc').optional(),
  }),
};

export const getUsers: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
    sortBy: Joi.string().when('orderBy', {
      is: Joi.exist(),
      then: Joi.string()
        .valid(...Object.keys(IUserCtAdminSortBy))
        .required(),
      otherwise: Joi.string()
        .valid(...Object.keys(IUserCtAdminSortBy))
        .optional(),
    }),
    orderBy: Joi.string().valid('asc', 'desc').optional(),
  }),
};

export const getEvents: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
    sortBy: Joi.string().when('orderBy', {
      is: Joi.exist(),
      then: Joi.string()
        .valid(...Object.keys(IEventWithDeviceSortBy))
        .required(),
      otherwise: Joi.string()
        .valid(...Object.keys(IEventWithDeviceSortBy))
        .optional(),
    }),
    orderBy: Joi.string().valid('asc', 'desc').optional(),
  }),
};

export default {
  validateGetDeviceInventories: validate(getDevices),
  validateGetUsers: validate(getUsers),
  validateGetEvents: validate(getEvents),
};
