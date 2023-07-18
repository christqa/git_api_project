import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';

import DateExtension from '@joi/date';
import { IReportRequestDtoFilterType } from './dtos/get-pdf-report.dto';
const JoiDate = Joi.extend(DateExtension);
import { DATE_FORMAT_ISO8601 } from '../../constants';
import moment from 'moment';

const getPdfReport: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    startDate: JoiDate.date()
      .format(DATE_FORMAT_ISO8601)
      .raw()
      .optional()
      .default(
        moment()
          .subtract(365, 'days')
          .format(DATE_FORMAT_ISO8601)
          .slice(0, -6) + 'Z'
      ),

    endDate: JoiDate.date()
      .format(DATE_FORMAT_ISO8601)
      .raw()
      .optional()
      .default(moment().format(DATE_FORMAT_ISO8601).slice(0, -6) + 'Z'),

    filterType: Joi.string()
      .valid(...Object.keys(IReportRequestDtoFilterType))
      .optional()
      .default('all'),
    personalData: Joi.boolean().optional().default(false),
    conditionsAndMedications: Joi.boolean().optional().default(false),
    annotations: Joi.boolean().optional().default(false),
  }),
};

export default {
  validateGetPdfReport: validate(getPdfReport),
};
