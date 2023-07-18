import Joi, { ObjectSchema } from 'joi';
import validate from '@core/validation/validation.middleware';
import { PermissionTypes } from './invite.type';
import { GroupUserRoles, InvitationType } from '@prisma/client';

const createInvite: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    resendInvite: Joi.bool().optional().default(false),
    permissions: Joi.array().when('invitationType', {
      is: InvitationType.datasharing,
      then: Joi.array()
        .items(
          Joi.string()
            .valid(...Object.keys(PermissionTypes))
            .required()
        )
        .unique()
        .required(),
      otherwise: Joi.array().forbidden(),
    }),
    invitationType: Joi.string()
      .valid(...Object.keys(InvitationType))
      .optional(),
    toGroupIds: Joi.array().when('invitationType', {
      is: InvitationType.joingroup,
      then: Joi.when('resendInvite', {
        is: false,
        then: Joi.array().unique().items(Joi.number().integer()).required(),
        otherwise: Joi.array().forbidden(),
      }),
    }),
    groupAccessLevel: Joi.string().when('invitationType', {
      is: InvitationType.joingroup,
      then: Joi.when('resendInvite', {
        is: false,
        then: Joi.string()
          .valid(...Object.keys(GroupUserRoles))
          .default(GroupUserRoles.member)
          .required(),
        otherwise: Joi.string().forbidden(),
      }),
    }),
  }),
};

const acceptRejectInvite: {
  params: ObjectSchema;
} = {
  params: Joi.object().keys({
    inviteId: Joi.string().guid().required(),
  }),
};

const deleteInvite: {
  body: ObjectSchema;
} = {
  body: Joi.object().keys({
    invitationType: Joi.string()
      .valid(...Object.keys(InvitationType))
      .required(),
    memberEmail: Joi.string().email().required(),
    groupId: Joi.number().when('invitationType', {
      is: InvitationType.joingroup,
      then: Joi.number().integer().required(),
      otherwise: Joi.number().forbidden(),
    }),
  }),
};

export default {
  validateCreateResendInvite: validate(createInvite),
  validateAcceptRejectInvite: validate(acceptRejectInvite),
  validateDeleteInvite: validate(deleteInvite),
};
