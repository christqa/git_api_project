import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const deviceSerialValidation = (key = 'deviceSerial') =>
  Joi.string()
    .required()
    .min(10)
    .max(15)
    .regex(/^[a-z0-9-]+$/i)
    .messages({
      'string.pattern.base': `"${key}" invalid input format`,
    });

const getDeviceSettingsByDeviceSerial: {
  path: ObjectSchema;
} = {
  path: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
  }),
};

const deviceSettings = Joi.object({
  deviceSettingName: Joi.string().required(),
  deviceSettingType: Joi.string().required(),
  deviceSettingValue: Joi.string().required(),
});

const createDeviceSettings: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    deviceSerial: deviceSerialValidation(),
    deviceSettings: Joi.array()
      .items(deviceSettings)
      .unique((a, b) => a.deviceSettingName === b.deviceSettingName),
  }),
};

const updateDeviceSetting: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    deviceSettingName: Joi.string(),
    deviceSettingType: Joi.string(),
    deviceSettingValue: Joi.string(),
  }).or('deviceSettingName', 'deviceSettingType', 'deviceSettingValue'),
};

export default {
  validateGetDeviceSettingsByDeviceSerial: validate(
    getDeviceSettingsByDeviceSerial
  ),
  validateCreateDeviceSettings: validate(createDeviceSettings),
  validateUpdateDeviceSetting: validate(updateDeviceSetting),
};
