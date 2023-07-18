import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import { GroupUserRoles } from '@prisma/client';

const groupNameValidation = (key = 'groupName') =>
  Joi.string()
    .min(1)
    .max(25)
    .regex(
      /^(?!\s)(?![\s\S]*\s$)[a-zA-Z 0-9_!"#$%&'()*+,-./:;<=>?@^_`’{|}~$]{1,25}$/i
    )
    .required()
    .messages({
      'string.pattern.base': `"${key}" invalid input format`,
    });

const getGroups: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

const getGroupsSummary: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

const createGroup: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    // defined rules
    // https://projectspectra.atlassian.net/wiki/spaces/SW/pages/72613891/Characters+Allowed+for+Group+Device+Names
    groupName: groupNameValidation(),
  }),
};

const updateGroup: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    groupId: Joi.number().integer().min(1).required(),
    groupName: groupNameValidation(),
  }),
};

const removeLeaveGroup: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    groupId: Joi.number().integer().min(1).required(),
    userGuid: Joi.string().guid().optional(),
  }),
};

const getGroupDevices: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    groupId: Joi.number().integer().min(1).required(),
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

const getGroupMembers: {
  query: ObjectSchema;
} = {
  query: Joi.object().keys({
    groupId: Joi.number().integer().min(1).required(),
    skip: Joi.number().min(0).integer().required(),
    take: Joi.number().min(0).integer().required(),
  }),
};

const updateGroupMemberAccess: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    groupId: Joi.number().integer().min(1).required(),
    userGuid: Joi.string().guid().required(),
    accessLevel: Joi.string()
      .valid(...Object.keys(GroupUserRoles))
      .required(),
  }),
};

export default {
  validateGetGroups: validate(getGroups),
  validateGetGroupsSummary: validate(getGroupsSummary),
  validateCreateGroup: validate(createGroup),
  validateUpdateGroup: validate(updateGroup),
  validateRemoveLeaveGroup: validate(removeLeaveGroup),
  validateGetGroupDevices: validate(getGroupDevices),
  validateGetGroupMembers: validate(getGroupMembers),
  validateUpdateGroupMemberAccess: validate(updateGroupMemberAccess),
};
