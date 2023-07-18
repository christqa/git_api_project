import Joi, { ArraySchema } from 'joi';
import DateExtension from '@joi/date';
import validate from '@core/validation/validation.middleware';

const JoiDate = Joi.extend(DateExtension);

const createSeedInventory: {
  body: ArraySchema;
} = {
  body: Joi.array()
    .items(
      Joi.object({
        deviceSerial: Joi.string()
          .required()
          .min(10)
          .max(15)
          .regex(/^[a-z0-9-]+$/i),
        manufacturingDate: JoiDate.date().format('YYYY-MM-DD').raw().required(),
        manufacturedForRegion: Joi.string().required().min(1).max(100),
        deviceModelId: Joi.number().required(),
        bleMacAddress: Joi.string()
          .max(17)
          .regex(/^(?:(?:[0-9A-Fa-f]{2}(?=([-:]))(?:\1[0-9A-Fa-f]{2}){5}))$/i)
          .required(),
        wiFiMacAddress: Joi.string()
          .max(17)
          .regex(/^(?:(?:[0-9A-Fa-f]{2}(?=([-:]))(?:\1[0-9A-Fa-f]{2}){5}))$/i)
          .required(),
        firmwareVersion: Joi.string().required(),
        deviceMetadata: Joi.object().unknown(true).optional(),
        calibrationFileLocations: Joi.object().unknown(true).required(),
      })
    )
    .min(1)
    .required(),
};

export default {
  validateSeedInventory: validate(createSeedInventory),
};
