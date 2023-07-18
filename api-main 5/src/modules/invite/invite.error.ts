import TranslationService from '@modules/translation/translation.service';
import {
  badRequestError,
  notFoundError,
} from '@core/error-handling/error-list';

const inviteAlreadyAccepted = () => {
  return badRequestError(
    TranslationService.translate('invite_invite_response_already_submitted')
  );
};

const inviteAccepted = () => {
  return badRequestError(
    TranslationService.translate('invite_invite_response_already_submitted')
  );
};

const inviteSkipAccepted = () => {
  return badRequestError(
    TranslationService.translate('invite_cant_skip_an_accepted_invite')
  );
};

const inviteExpired = () => {
  return badRequestError(
    TranslationService.translate('invite_invite_has_expired')
  );
};

const inviteRejected = () => {
  return badRequestError(
    TranslationService.translate('invite_invite_response_already_submitted')
  );
};

const inviteAlreadyRejected = () => {
  return badRequestError(
    TranslationService.translate('invite_invite_response_already_submitted')
  );
};

const inviteTypeNotFound = () => {
  return badRequestError(
    TranslationService.translate('invite_invite_type_not_found')
  );
};

const noInvite = () => {
  return notFoundError(TranslationService.translate('invite_invite_not_found'));
};

const inviteNoLongerAvailable = () => {
  return notFoundError(
    TranslationService.translate('invite_invite_is_no_longer_available')
  );
};

const noInviteHimself = () => {
  return badRequestError(
    TranslationService.translate('invite_user_cant_invite_himself')
  );
};

const userAlreadyInGroup = () => {
  return badRequestError(
    TranslationService.translate('invite_user_already_in_group')
  );
};

const userAlreadyAcceptedInvite = () => {
  return badRequestError(
    TranslationService.translate('invite_user_already_accepted')
  );
};

const userMaxUnacceptedInvitesExceeded = () => {
  return badRequestError(
    TranslationService.translate('invite_count_for_admin_exceeded')
  );
};

const userMaxInvitesThresholdExcceded = () => {
  return badRequestError(
    TranslationService.translate('invite_threshold_for_admin_exceeded')
  );
};

const userAlreadyInGroups = (groups: string) => {
  return badRequestError(
    TranslationService.translate('invite_user_already_in_group', { groups })
  );
};

const noSuchUser = () => {
  return badRequestError(TranslationService.translate('invite_no_such_user'));
};

const noSuchGroup = () => {
  return badRequestError(TranslationService.translate('invite_no_such_group'));
};

const noSuchProfile = () => {
  return badRequestError(
    TranslationService.translate('invite_no_such_profile')
  );
};

const userIncompleteProfile = () => {
  return badRequestError(
    TranslationService.translate('invite_user_incomplete_registration')
  );
};

export {
  inviteAlreadyAccepted,
  userMaxUnacceptedInvitesExceeded,
  userMaxInvitesThresholdExcceded,
  userAlreadyAcceptedInvite,
  inviteTypeNotFound,
  inviteSkipAccepted,
  inviteAccepted,
  inviteExpired,
  inviteRejected,
  inviteAlreadyRejected,
  noInvite,
  inviteNoLongerAvailable,
  noInviteHimself,
  userAlreadyInGroup,
  userAlreadyInGroups,
  noSuchGroup,
  noSuchProfile,
  userIncompleteProfile,
  noSuchUser,
};
