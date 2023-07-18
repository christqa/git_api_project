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

const deviceNameValidation = (key = 'deviceName') =>
  Joi.string()
    .min(1)
    .max(50)
    .regex(
      /^(?!\s)(?![\s\S]*\s$)[a-zA-Z 0-9_!"#$%&'()*+,-./:;<=>?@^_`’{|}~$]{1,25}$/i
    )
    .required()
    .messages({
      'string.pattern.base': `"${key}" invalid input format`,
    });

const activateDevice: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
    // defined rules
    // https://projectspectra.atlassian.net/wiki/spaces/SW/pages/72613891/Characters+Allowed+for+Group+Device+Names
    deviceName: deviceNameValidation(),
    timeZoneId: Joi.number().integer().min(1).required().default(491),
    groupId: Joi.number().integer().min(1).required(),
  }),
};

const updateActivatedDevice: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
    deviceName: deviceNameValidation(),
    timeZoneId: Joi.number().integer().min(1).required().default(491),
  }),
};

const deactivateDevice: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
  }),
};

const getDeviceStatus: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
  }),
};

const getActivatedDevice: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
  }),
};

const acceptDeviceFirmwareUpdate: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: deviceSerialValidation(),
    virtualFirmware: Joi.string().required(),
  }),
};

export default {
  validateActivateDevice: validate(activateDevice),
  validateUpdateActivatedDevice: validate(updateActivatedDevice),
  validateDeactivateDevice: validate(deactivateDevice),
  validateGetDeviceStatus: validate(getDeviceStatus),
  validateGetActivatedDevice: validate(getActivatedDevice),
  validateAcceptDeviceFirmwareUpdate: validate(acceptDeviceFirmwareUpdate),
};
