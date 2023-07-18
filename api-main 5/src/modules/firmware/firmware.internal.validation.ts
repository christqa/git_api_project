import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import DateExtension from '@joi/date';
import { AvailabilityType } from '@prisma/client';
import { ReleaseType } from './firmware.type';

const JoiDate = Joi.extend(DateExtension);

const postDeviceFirmwareUpdate: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    virtualFirmware: Joi.string().required(),
    releaseDate: JoiDate.date().format('YYYY-MM-DD').raw().required(),
    deviceModelId: Joi.number().required(),
    fileName: Joi.string().required(),
    locationMetaData: Joi.object().keys({
      keyPrefix: Joi.string().required(),
      bucket: Joi.string().required(),
      platform: Joi.string().required(),
    }),
    md5CheckSum: Joi.string().required(),
    availabilityType: Joi.string()
      .valid(...Object.keys(AvailabilityType))
      .required(),
  }),
};

const updateFirmwareAvailability: {
  params: ObjectSchema;
  body: ObjectSchema;
} = {
  params: Joi.object().keys({
    firmwareVersion: Joi.string().required(),
  }),
  body: Joi.object().keys({
    availabilityType: Joi.string()
      .valid(AvailabilityType.GENERAL_AVAILABILITY)
      .required(),
  }),
};

const releaseFirmwareRequest: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    releaseType: Joi.string()
      .valid(...Object.keys(ReleaseType))
      .required(),
    skipUserApproval: Joi.boolean().optional(),
    deviceSerials: Joi.array().min(1).items(Joi.string()).unique().optional(),
  }),
};

export default {
  validatePostDeviceFirmwareUpdate: validate(postDeviceFirmwareUpdate),
  validateUpdateFirmwareAvailability: validate(updateFirmwareAvailability),
  validateReleaseFirmwareRequest: validate(releaseFirmwareRequest),
};
