import { IInvitations } from '@modules/invite/invite.type';
import { IProfile } from '@modules/profile/profile.type';
import { IGetUserProfileResponseDto } from '@modules/user/dtos/user.index.dto';
import {
  GroupUserRoles,
  InvitationType,
  PermissionTypes,
} from '@prisma/client';
import { User } from 'auth0';
const generateUser = ({
  id = 0,
  email = '',
  firstName = 'Placeholder',
  lastName = 'Placeholder',
} = {}): IGetUserProfileResponseDto => {
  return {
    isEmailVerified: false,
    isWelcomeEmailSent: false,
    authId: 'auth0|' + 'DV04Mc1O6BlOvZ8POKdG',
    timeZoneId: 491,
    createdOn: new Date(),
    updatedOn: new Date(),
    transient: false,
    userGuid: 'c3fd99a2-ab7d-4f3b-8db3-bc16bcac7253',
    id: id || 1,
    firstName: firstName || 'firstName',
    lastName: lastName || 'lastName',
    localCutoff: '04:00 AM',
    email: email || 'dev@projectspectra.dev',
    lastAgreement: {
      privacyPolicyVersion: 1,
      termsAndConditionsVersion: 1,
    },
    mobiles: [],
    sentInvitations: [],
    receivedInvitations: [],
    dataSharingAgreementTo: [],
    dataSharingAgreementFrom: [],
    hasDevice: true,
  };
};

const generateInvitationsToJoinGroup = (): IInvitations[] => [
  {
    sentAt: new Date('01/01/2009 10:10:00'),
    expiresAt: new Date('01/15/2009 10:10:00'),
    id: 10,
    invitationId: '14',
    fromUserId: 13,
    toUserId: 15,
    toGroupId: 133,
    groupAccessLevel: GroupUserRoles.member,
    toUserEmail: 'test@test.com',
    permissions: [PermissionTypes.read],
    inviteType: InvitationType.joingroup,
    acceptedAt: null,
    rejectedAt: null,
    deleted: null,
  },
  {
    sentAt: new Date('01/04/2009 10:10:00'),
    expiresAt: new Date('01/19/2009 10:10:00'),
    id: 10,
    invitationId: '17',
    fromUserId: 13,
    toUserId: 17,
    toGroupId: 123,
    groupAccessLevel: GroupUserRoles.member,
    toUserEmail: 'test2@test.com',
    permissions: [PermissionTypes.read],
    inviteType: InvitationType.joingroup,
    acceptedAt: null,
    rejectedAt: null,
    deleted: null,
  },
];

const generateAuth0User = (): User => {
  return {
    email: 'dev@projectspectra.dev',
    email_verified: true,
  };
};

const generateProfile = (): IProfile => {
  return {
    id: 1,
    dob: '01/01/2001',
    createdOn: new Date(),
    updatedOn: new Date(),
    weightLbs: 193,
    heightIn: 200,
    userId: 1,
    genderId: 1,
    lifeStyleId: 1,
    bowelMovementId: 1,
    urinationsPerDayId: 1,
    exerciseIntensityId: 1,
    regionalPref: '',
  };
};

const generateGroupDevice = () => {
  return {
    id: 1,
    groupId: 1,
    deviceId: 1,
    addedBy: 1,
    addedOn: new Date(),
    removedBy: null,
    deleted: null,
    deviceInventory: {
      id: 1,
      deviceSerial: '73b-015-04-2f7',
      manufacturingDate: new Date(),
      manufacturedForRegion: 'North America',
      deviceName: 'Smart Toilet',
      deviceModelId: 1,
      activatedTimeZoneId: 491,
      bleMacAddress: '48-68-28-13-A4-48',
      wiFiMacAddress: '3E-94-C9-43-2D-D7',
      deviceMetadata: {},
      calibrationFileLocations: {},
      deviceActivation: [
        {
          id: 1,
          deviceId: 1,
          deviceFirmwareId: 1,
          activatedBy: 0,
          timeZoneId: 1,
          deviceName: 'Smart Toilet',
          deviceModelId: 1,
          deviceStatus: {},
          batteryStatus: 0,
          wiFiSSID: '',
          rssi: 0,
          deviceStatusUpdatedOn: new Date(),
          isNotified: false,
          activatedOn: new Date(),
          deactivatedBy: null,
          deleted: null,
        },
      ],
    },
  };
};

export {
  generateUser,
  generateAuth0User,
  generateInvitationsToJoinGroup,
  generateGroupDevice,
  generateProfile,
};
