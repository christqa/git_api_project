import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import moment from 'moment';
import DateExtension from '@joi/date';
import { Status } from '@prisma/client';
const JoiDate = Joi.extend(DateExtension);
const getDeviceByDeviceSerial: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    userGuid: Joi.string().guid().required(),
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
};

const updateDeviceBatteryStatus: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
    batteryStatus: Joi.number().integer().min(0).max(100).required(),
    firmwareVersion: Joi.string().required(),
    wiFiSSID: Joi.string().required(),
    signalStrength: Joi.number().required(),
  }),
};

const getGroupAdminByDeviceSerial: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
};

const getDisconnectedDevices: {
  query: ObjectSchema;
} = {
  query: Joi.object({
    from: JoiDate.date()
      .format('YYYY-MM-DD')
      .raw()
      .default(moment().format('YYYY-MM-DD')),
    to: JoiDate.date()
      .format('YYYY-MM-DD')
      .raw()
      .default(moment().format('YYYY-MM-DD')),
  }),
};

const setDisconnectedDevices: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    count: Joi.number().required(),
    devices: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        deviceSerial: Joi.string().required(),
        deviceName: Joi.string().required(),
        deviceStatusUpdatedOn: Joi.date().optional(),
        deviceAdmins: Joi.array().items(
          Joi.object({
            profileId: Joi.number().optional(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().required(),
            userGuid: Joi.string().required(),
          })
        ),
      })
    ),
  }),
};

const setIsNotifiedBatch: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    devices: Joi.array().items({
      deviceActivationId: Joi.number().integer().min(0).required(),
    }),
  }),
};

const deviceUpdatedDate: {
  params: ObjectSchema;
  body: ObjectSchema;
} = {
  params: Joi.object().keys({
    deviceActivationId: Joi.number().min(1).required(),
  }),
  body: Joi.object({
    date: JoiDate.date().raw().required(),
  }),
};

const getDeviceFirmwareUpdate: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
};

const updateDeviceFirmwareUpdate: {
  params: ObjectSchema;
  body: ObjectSchema;
} = {
  params: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
    firmwareVersion: Joi.string().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid(Status.FAILED, Status.INSTALLED).required(),
    failureLogs: Joi.string().optional(),
  }),
};

const deactivateDevice: {
  params: ObjectSchema;
  body: ObjectSchema;
} = {
  params: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
  body: Joi.object().keys({
    timestamp: Joi.number().required(),
  }),
};

export default {
  validateGetDeviceByDeviceSerial: validate(getDeviceByDeviceSerial),
  validateUpdateDeviceBatteryStatus: validate(updateDeviceBatteryStatus),
  validateGetGroupAdminByDeviceSerial: validate(getGroupAdminByDeviceSerial),
  validateGetDisconnectedDevices: validate(getDisconnectedDevices),
  validateDisconnectedDevices: validate(setDisconnectedDevices),
  validateSetIsNotifiedBatch: validate(setIsNotifiedBatch),
  validatePatchDeviceUpdatedDate: validate(deviceUpdatedDate),
  validateGetDeviceFirmwareUpdate: validate(getDeviceFirmwareUpdate),
  validateUpdateDeviceFirmwareUpdate: validate(updateDeviceFirmwareUpdate),
  validateDeactivateDevice: validate(deactivateDevice),
};
