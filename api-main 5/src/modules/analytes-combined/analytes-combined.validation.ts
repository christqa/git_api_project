import Joi, { ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import validate from '@core/validation/validation.middleware';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const JoiDate = Joi.extend(DateExtension);
const date = JoiDate.date()
  .format(DATE_FORMAT_ISO8601)
  .raw()
  .optional()
  .default(null);

export const getAnalytes: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    startDate: date,
    endDate: date,
  }),
};

export default {
  validateGetAnalytes: validate(getAnalytes),
};
