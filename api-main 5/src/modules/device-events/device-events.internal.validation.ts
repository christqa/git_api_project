import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import { EventSource } from '@prisma/client';

const saveEventInternal: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    deviceSerial: Joi.string().optional(),
    eventData: Joi.object().unknown(true).required(),
    eventSource: Joi.string()
      .valid(
        EventSource.DeviceGenerated,
        EventSource.ManualEntry,
        EventSource.SystemGenerated
      )
      .required(),
  }),
};

export default {
  validateSaveEventInternal: validate(saveEventInternal),
};
