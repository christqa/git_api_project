import Joi, { ObjectSchema } from 'joi';
import DateExtension from '@joi/date';
import { getDateWithFormat } from '@utils/date.util';

const JoiDate = Joi.extend(DateExtension);

const updateProfile: ObjectSchema = Joi.object().keys({
  dob: JoiDate.date()
    .format(['MM/DD/YYYY', 'M/D/YYYY'])
    .raw()
    .required()
    .default(getDateWithFormat()),
  regionalPref: Joi.string().required(),
  genderId: Joi.number().integer().min(1).required(),
  weightLbs: Joi.number().min(5).max(1500).required().default(300),
  heightIn: Joi.number().min(1).integer().max(131).required().default(66),
  lifeStyleId: Joi.number().integer().min(1),
  exerciseIntensityId: Joi.number().integer().min(1),
  medicalConditionIds: Joi.array()
    .items(Joi.number().integer().min(1))
    .unique(),
  medicationIds: Joi.array().items(Joi.number().integer().min(1)).unique(),
  urinationsPerDayId: Joi.number().integer().min(1),
  bowelMovementId: Joi.number().integer().min(1),
});

export { updateProfile };
