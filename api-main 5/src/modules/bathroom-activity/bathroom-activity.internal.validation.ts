import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import DateExtension from '@joi/date';
const JoiDate = Joi.extend(DateExtension);

const startBathroomActivity: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    profileId: Joi.number().min(1).integer().required(),
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
    eventBody: Joi.object().unknown(true).required(),
    startedOn: JoiDate.date().format('YYYY-MM-DDTHH:mm:ssZ').raw().required(),
    bathroomActivityUuid: Joi.string().uuid().required(),
  }),
};

const saveBathroomActivityImages: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: Joi.string()
      .required()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
    filename: Joi.string().required(),
    bathroomActivityUuid: Joi.string().uuid().required(),
    images: Joi.array().items(
      Joi.object({
        imageMetadata: Joi.object().unknown(true).required(),
      })
    ),
  }),
};

const patchBathroomActivity: {
  body: ObjectSchema;
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    eventUuid: Joi.string().uuid().required(),
  }),
  body: Joi.object().keys({
    profileId: Joi.number().min(1).integer(),
    deviceSerial: Joi.string()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
    eventBody: Joi.object().unknown(true).optional(),
    startedOn: JoiDate.date().format('YYYY-MM-DDTHH:mm:ssZ').raw().optional(),
    endedOn: JoiDate.date().format('YYYY-MM-DDTHH:mm:ssZ').raw(),
    bathroomActivityUuid: Joi.string().uuid(),
    isEventProcessed: Joi.boolean(),
    totalImages: Joi.number().integer().positive().optional(),
    imagesUploaded: Joi.number().integer().positive().optional(),

    //indirectly comes from Lambda spectra-upload-url-generator
    fileLocationMetadata: Joi.object()
      .keys({
        region: Joi.string().required(),
        bucket: Joi.string().required(),
        keyPrefix: Joi.string().required(),
        platform: Joi.string().required(),
      })
      .optional(),
    metadata: Joi.object()
      .keys({
        totalImages: Joi.number().integer().positive(),
        imagesUploaded: Joi.number().integer().positive(),
      })
      .optional(),
  }),
};

const getBathroomActivity: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({ eventUuid: Joi.string().uuid().required() }),
};
const postBathroomActivity: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    profileId: Joi.number().min(1).integer(),
    deviceSerial: Joi.string()
      .min(10)
      .max(15)
      .regex(/^[a-z0-9-]+$/i),
  }),
};

export default {
  validateStartBathroomActivity: validate(startBathroomActivity),
  validateSaveBathroomActivityImages: validate(saveBathroomActivityImages),
  validatePatchBathroomActivityImages: validate(patchBathroomActivity),
  validateGetBathroomActivity: validate(getBathroomActivity),
  validatePostBathroomActivity: validate(postBathroomActivity),
};
