import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

const updateGlobalSetting: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    settingName: Joi.string(),
    settingType: Joi.string(),
    settingValue: Joi.string(),
  }).or('settingName', 'settingType', 'settingValue'),
};

export default {
  validateUpdateGlobalSetting: validate(updateGlobalSetting),
};
