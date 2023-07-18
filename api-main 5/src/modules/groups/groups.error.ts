import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  conflictError,
  notFoundError,
  preConditionFailedError,
  unauthorizedError,
} from '@core/error-handling/error-list';

const groupNameNotUnique = () => {
  return badRequestError(
    TranslationService.translate('groups_this_group_name_already_exists')
  );
};

const groupNotFound = () => {
  return notFoundError(TranslationService.translate('groups_group_not_found'));
};

const groupWithUsers = () => {
  return conflictError(
    TranslationService.translate(
      'groups_group_cannot_be_deleted_first_remove_all_group_users'
    )
  );
};

const groupWithDevices = () => {
  return conflictError(
    TranslationService.translate(
      'groups_deactivate_all_devices_linked_to_this_group_before_deleting_it'
    )
  );
};

const groupUserNotFound = () => {
  return notFoundError(
    TranslationService.translate('groups_group_user_not_found')
  );
};

const groupUserNotAuthorized = () => {
  return unauthorizedError(
    TranslationService.translate(
      'groups_group_user_dont_have_permissions_for_this_operation'
    )
  );
};

const groupUserNotAuthorizedPreconditionFailed = () => {
  return preConditionFailedError(
    TranslationService.translate(
      'groups_group_user_dont_have_permissions_for_this_operation'
    )
  );
};

const groupUserLastAdmin = () => {
  return conflictError(
    TranslationService.translate(
      'groups_you_are_the_last_admin_assign_another_user_as_admin_before_leaving_the_group'
    )
  );
};

const groupUserLastAdminDowngrade = () => {
  return conflictError(
    TranslationService.translate(
      'groups_you_are_the_last_admin_assign_another_user_as_admin_before_downgrading_yourself'
    )
  );
};

const groupUserLastAdminLeaveGroup = () => {
  return conflictError(
    TranslationService.translate(
      'groups_deactivate_all_devices_linked_to_this_group_group_will_be_auto_deleted'
    )
  );
};

const notAuthorized = () => {
  return unauthorizedError(
    TranslationService.translate(
      'groups_you_dont_have_permissions_for_this_operation'
    )
  );
};

export {
  groupNameNotUnique,
  groupUserNotAuthorizedPreconditionFailed,
  groupNotFound,
  groupWithUsers,
  groupWithDevices,
  groupUserNotFound,
  groupUserNotAuthorized,
  groupUserLastAdmin,
  groupUserLastAdminDowngrade,
  groupUserLastAdminLeaveGroup,
  notAuthorized,
};
