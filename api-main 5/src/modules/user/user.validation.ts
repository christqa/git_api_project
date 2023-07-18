import Joi, { ObjectSchema } from 'joi';
import {
  IGetUserConfigurationResponseDto,
  TrendIndicator,
} from '@modules/user-configuration/dtos/user-configuration.index.dto';
import { updateProfile } from '@modules/profile/profile.validation';
import userConfigurationJsonData from '@modules/user-configuration/user-configuration.json';
import validate from '@core/validation/validation.middleware';

enum PasswordValidationEnum {
  OLD = 'OLD',
  NEW = 'NEW',
}

const firstLastNameValidation = (key = 'firstName') =>
  Joi.string()
    .max(25)
    .regex(/^(?!-)[a-zA-Z-'’]*[a-zA-Z'’]+( [a-zA-Z-'’]+)*$/)
    .messages({
      'string.pattern.base': `"${key}" invalid input format`,
    });

export const updateUserProfile: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    firstName: firstLastNameValidation(),
    lastName: firstLastNameValidation('lastName'),
    profile: updateProfile,
  }),
};

const joiAnalyteBound = Joi.object({
  contributionPercentage: Joi.number().min(0).max(100).required(),
  warningLowerBound: Joi.number().min(0).required(),
  baseline: Joi.number().min(0).required(),
  normalLowerBound: Joi.number().min(0).required(),
  normalUpperBound: Joi.number().min(0).required(),
  warningUpperBound: Joi.number().min(0).required(),
  minimumLowerBound: Joi.number().min(0).required(),
  maximumUpperBound: Joi.number().min(0).required(),
});

const userConfiguration: ObjectSchema<IGetUserConfigurationResponseDto> =
  Joi.object().keys({
    hydration: Joi.object()
      .keys({
        baseline: Joi.number().min(0).max(100).optional().allow(null),
        morningBaseline: Joi.number().min(0).max(100).optional().allow(null),
        afternoonBaseline: Joi.number().min(0).max(100).optional().allow(null),
        nightBaseline: Joi.number().min(0).max(100).optional().allow(null),
        trendIndicator: Joi.string()
          .valid(...Object.keys(TrendIndicator))
          .required(),
        optimumRangeLow: Joi.number().min(0).max(100).required(),
        needsImprovementUpperBound: Joi.number().min(0).max(100).required(),
        warningUpperBound: Joi.number().min(0).max(100).required(),
        analytes: {
          concentration: joiAnalyteBound,
          color: joiAnalyteBound,
          frequency: joiAnalyteBound,
          durationInSeconds: joiAnalyteBound,
        },
      })
      .default(userConfigurationJsonData.hydration)
      .required(),
    gutHealth: Joi.object()
      .keys({
        baseline: Joi.number().min(0).max(100).optional().allow(null),
        trendIndicator: Joi.string()
          .valid(...Object.keys(TrendIndicator))
          .required(),
        optimumRangeLow: Joi.number().min(0).max(100).required(),
        needsImprovementUpperBound: Joi.number().min(0).max(100).required(),
        warningUpperBound: Joi.number().min(0).max(100).required(),
        analytes: {
          consistency: joiAnalyteBound,
          color: joiAnalyteBound,
          frequency: joiAnalyteBound,
          durationInSeconds: joiAnalyteBound,
        },
      })
      .default(userConfigurationJsonData.gutHealth)
      .required(),
    minScoresForAvg: Joi.number()
      .integer()
      .min(0)
      .default(userConfigurationJsonData.minScoresForAvg)
      .required(),
    avgScoreWindowSize: Joi.number()
      .integer()
      .min(0)
      .default(userConfigurationJsonData.avgScoreWindowSize)
      .required(),
  });

export const updateUserConfiguration: {
  body: ObjectSchema;
  params: ObjectSchema;
} = {
  body: userConfiguration,
  params: Joi.object().keys({
    profileId: Joi.number().integer().min(1).required(),
  }),
};

export const resetEmailUserConfiguration: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const getUserConfiguration: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    profileId: Joi.number().min(1).integer(),
  }),
};

const passwordValidation = (key = PasswordValidationEnum.NEW) => {
  const message =
    key === PasswordValidationEnum.NEW
      ? "The password doesn't match requirements"
      : 'The password you entered is incorrect.';
  return Joi.string()
    .regex(/^.{8,256}$/)
    .messages({
      'string.pattern.base': message,
    })
    .required();
};

export const resetUserPassword: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    newPassword: passwordValidation(),
    currentPassword: passwordValidation(PasswordValidationEnum.OLD),
  }),
};

export const validateUserDataRemovalRequest: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    requestReason: Joi.number().integer().min(1).required(),
    requestCustomReason: Joi.string().max(50),
  }),
};

export default {
  validateUpdateUserProfile: validate(updateUserProfile),
  validateUpdateUserConfiguration: validate(updateUserConfiguration),
  validateResetEmailConfiguration: validate(resetEmailUserConfiguration),
  validateGetUserConfiguration: validate(getUserConfiguration),
  validateResetUserPassword: validate(resetUserPassword),
  validateUserDataRemovalRequest: validate(validateUserDataRemovalRequest),
};
