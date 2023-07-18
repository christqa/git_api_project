import { IUser, IUserUniqueInput, IUserUpdate } from './user.type';
import {
  IProfileUpdate,
  IProfileUpdateResponse,
} from '@modules/profile/profile.type';
import {
  somethingWentWrongError,
  userEmailAlreadyTaken,
  userEmailNotVerified,
  userHasNoDevice,
  userHasNoEmail,
  userNotFound,
  userHasNoAuth0ManagementProfile,
  userMustNotBeFromTheFuture,
} from './user.error';
import {
  IGetProfileDeviceSerialInternalResponseDto,
  IGetUserByProfileIdResponseDto,
  IGetUserProfileResponseDto,
  IGetUsersByDeviceTZResponseDto,
  IGetUsersInternalResponseDto,
  IUpdateUserProfileRequestDto,
} from './dtos/user.index.dto';
import {
  findUserByAuthId,
  managementApiAccessToken,
} from '@modules/auth/auth.service';
import {
  findProfileByUserId,
  updateProfile,
} from '@modules/profile/profile.service';
import profileRepository from '@repositories/profile.repository';
import {
  deviceActivationService,
  groupsService,
  signedAgreementsService,
} from '@modules/index/index.service';
import userRepository from '@repositories/user.repository';
import config from '@core/enviroment-variable-config';
import { filterNullProperties } from '@utils/object.util';
import { getDateWithFormat } from '@utils/date.util';
import moment from 'moment';
import axios from 'axios';
import logger from '@core/logger/logger';
import { createDefaultNotificationSettings } from '@modules/notification-settings/notification-settings.service';
import { IInvitationsExtended } from '@modules/invite/invite.type';
import { IDataSharingAgreementExtended } from '@modules/data-sharing-agreement/data-sharing-agreement.type';
import {
  IReceivedInviteResponseDto,
  ISentInviteResponseDto,
} from '@modules/invite/dtos/invite.dto';
import { IDataSharingResponseDto } from '@modules/data-sharing-agreement/dtos/data-sharing-agreement.index.dto';
import { assignReceivedInvites } from '@modules/invite/invite.service';
import userMobileRepository from '@repositories/user-mobile.repository';
import { IGetUserDevicesInternalResponseDto } from '@modules/device-activation/dtos/get-user-activated-devices.dto';
import { notFoundError } from '@core/error-handling/error-list';
import { Role, User } from 'auth0';
import { EventSource, PrismaClient } from '@prisma/client';
import * as sqsClient from '../../lib/sqs.client';
import { analyteStoolService } from '@modules/analytes';
import httpStatus from 'http-status';
import AwsXray from 'aws-xray-sdk';

AwsXray.setDaemonAddress(config.awsXrayDaemonAddress);
// The errors will not be logged for keeping the console clean
AwsXray.setContextMissingStrategy('IGNORE_ERROR');

const FORMAT_TIMESTAMP = 'MM/DD/YYYY';

const upgradetransientAccount = async (
  transient: IUser,
  authId: string,
  userProfile: User,
  firstName?: string,
  lastName?: string
) => {
  await userRepository.updateMany(
    {
      transient: true,
      email: userProfile.email,
    },
    {
      transient: false,
      authId,
      firstName: firstName ? firstName : '',
      lastName: lastName ? lastName : '',
    }
  );
  transient.authId = authId;
  if (firstName) {
    transient.firstName = firstName;
  }
  if (lastName) {
    transient.lastName = lastName;
  }

  // assign received invites via email for new account
  await assignReceivedInvites(transient.userGuid, transient.email);
  logger.info(
    `User Guid ${transient.userGuid} successfully upgraded from transient account`
  );
  return transient;
};

const assembleUserResponse = async (
  response: IGetUserProfileResponseDto
): Promise<IGetUserProfileResponseDto> => {
  if (!config.checkUserEmailIsVerified) {
    response.isEmailVerified = true;
  } else {
    //get status from Auth0
    const userProfile = await findUserByAuthId(response.authId);
    response.isEmailVerified = userProfile.email_verified
      ? userProfile.email_verified
      : false;
  }
  return response;
};

const createOrUpgradeFromtransientUser = async (
  authId: string,
  checkEmail: boolean,
  firstName?: string,
  lastName?: string
): Promise<IUser> => {
  let userProfile;
  try {
    userProfile = await findUserByAuthId(authId);
  } catch (err) {
    //this is to nicely return an error in case of auth0 misconfiguration, and not throw 500
    throw notFoundError(('Auth0 error: ' + (err as any).message) as string);
  }
  if (!userProfile) {
    throw userHasNoAuth0ManagementProfile();
  }
  if (!userProfile.email) {
    throw userHasNoEmail();
  }
  if (
    checkEmail &&
    config.checkUserEmailIsVerified &&
    !userProfile.email_verified
  ) {
    throw userEmailNotVerified();
  }
  let existing = await userRepository.findFirst({
    email: userProfile.email,
  });

  if (config.checkUserEmailIsUnique) {
    if (!existing?.transient) {
      throw userEmailAlreadyTaken();
    }
  }

  if (existing?.transient) {
    //else, this is a transient account, update it to the real thing
    existing = await upgradetransientAccount(
      existing,
      authId,
      userProfile,
      firstName,
      lastName
    );
    return existing;
  }

  const createdUser = await userRepository.create({
    timeZoneId: 491,
    email: userProfile.email,
    authId: authId,
    firstName: firstName ? firstName : ' ',
    lastName: lastName ? lastName : ' ',
  });

  // default notification settings for push and sms
  await createDefaultNotificationSettings(createdUser.id);

  // assign received invites via email for new account
  await assignReceivedInvites(createdUser.userGuid, createdUser.email);

  logger.info(`User Guid ${createdUser.userGuid} successfully created`);

  return createdUser;
};

const update = async (
  user: IUser,
  userProfileUpdate: IUpdateUserProfileRequestDto,
  doNotSendWelcomeEmail = false,
  prismaTr?: PrismaClient
): Promise<void> => {
  if (
    moment(userProfileUpdate.profile.dob, FORMAT_TIMESTAMP).isAfter(moment())
  ) {
    throw userMustNotBeFromTheFuture(getDateWithFormat());
  }
  const profile = {
    dob: userProfileUpdate.profile.dob,
    createdOn: user.createdOn,
    regionalPref: userProfileUpdate.profile.regionalPref,
    weightLbs: userProfileUpdate.profile.weightLbs || undefined,
    heightIn: userProfileUpdate.profile.heightIn || undefined,
    genderId: userProfileUpdate.profile.genderId,
    lifeStyleId: userProfileUpdate.profile.lifeStyleId || null,
    urinationsPerDayId: userProfileUpdate.profile.urinationsPerDayId || null,
    bowelMovementId: userProfileUpdate.profile.bowelMovementId || null,
    exerciseIntensityId: userProfileUpdate.profile.exerciseIntensityId || null,
    userId: user.id,
  } as IProfileUpdate;
  const profileRes = await updateProfile(
    filterNullProperties<IProfileUpdate>(profile),
    userProfileUpdate.profile.medicalConditionIds,
    userProfileUpdate.profile.medicationIds,
    prismaTr
  );

  const userUpdate: IUserUpdate = {
    authId: user.authId,
    email: user.email,
    firstName: userProfileUpdate.firstName,
    lastName: userProfileUpdate.lastName,
    transient: user.transient,
    isWelcomeEmailSent: await handleWelcomeEmail(
      user,
      profileRes,
      userProfileUpdate,
      doNotSendWelcomeEmail
    ),
  };

  await userRepository.update({ id: user.id }, userUpdate, prismaTr);
};

const checkUserDeviceByUserId = async (
  userId: number
): Promise<IGetUserDevicesInternalResponseDto[]> => {
  const devices = await deviceActivationService.findDevices(userId);
  if (!devices?.length) {
    throw userHasNoDevice();
  }
  return devices;
};

const findOne = async (userUniqueInput: IUserUniqueInput): Promise<IUser> => {
  const user = await userRepository.findFirst(userUniqueInput);
  if (!user) {
    throw userNotFound();
  }
  return user;
};

const resendVerificationEmail = async (user: IUser) => {
  const ns1 = AwsXray.getNamespace();
  ns1.createContext();
  const segment = new AwsXray.Segment('auth0');
  ns1.enter(ns1.createContext());
  const subsegment = segment?.addNewSubsegment('resendVerificationEmail');
  subsegment.addAttribute('start_time', Date.now() / 1000);

  try {
    const accessToken = await managementApiAccessToken();
    await axios.post(
      `https://${config.auth0ManagementDomain}/api/v2/jobs/verification-email`,
      {
        user_id: user.authId,
      },
      {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // eslint-disable-next-line
  } catch (error: any) {
    subsegment.addError(JSON.stringify(error));
    if (error?.response?.data?.message) {
      logger.error(error.response.data.message);
      throw somethingWentWrongError();
    } else if (error?.message) {
      logger.error(error.message);
      throw somethingWentWrongError();
    } else {
      logger.error(error);
      throw somethingWentWrongError();
    }
  } finally {
    subsegment.addAttribute('end_time', Date.now() / 1000);
    subsegment.addAttribute('in_progress', false);
    subsegment.flush();
    subsegment.close();
    segment.close();
  }
};

const findProfileDeviceSerialByEmail = async (
  email: string
): Promise<IGetProfileDeviceSerialInternalResponseDto> => {
  const user = await userRepository.findFirst({
    email,
  });
  if (!user) {
    throw userNotFound();
  }
  const profile = await findProfileByUserId(user.id);
  const device = await analyteStoolService.getUserDeviceIdSerial(user.id);
  return {
    profileId: profile.id,
    deviceSerial: device.deviceSerial,
  };
};

const findByUserGuid = async (userGuid: string): Promise<IUser | null> => {
  return userRepository.findFirst({
    userGuid,
  });
};

const findByUserId = async (userId: number): Promise<IUser | null> => {
  return userRepository.findFirst({
    id: userId,
  });
};

const findMe = async (
  authId: string,
  userRoles: Role[],
  checkEmail: boolean,
  firstName?: string,
  lastName?: string
): Promise<IUser> => {
  let user = await userRepository.findMe(authId);
  if (!user) {
    user = await createOrUpgradeFromtransientUser(
      authId,
      checkEmail,
      firstName,
      lastName
    );
    return user;
  }
  if (user.profile) {
    user.profile.medicalConditionIds = user.profile.medicalConditions
      ? user.profile.medicalConditions.map(({ id }: { id: number }) => id)
      : [];

    delete user.profile.medicalConditions;

    user.profile.medicationIds = user.profile.medications
      ? user.profile.medications.map(({ id }: { id: number }) => id)
      : [];

    delete user.profile.medications;
  }

  user.lastAgreement = await signedAgreementsService.findLastAgreementVersions(
    user.id
  );

  user.shareUsageAgreement = (
    await signedAgreementsService.findShareAgreement(user.id)
  )?.agreed;

  user.sentInvitations = user.sentInvitations.map(
    (sentInvite: IInvitationsExtended) =>
      ({
        email: sentInvite.toUser
          ? sentInvite.toUser.email
          : sentInvite.toUserEmail,
        firstName: sentInvite.toUser?.firstName,
        lastName: sentInvite.toUser?.lastName,
        permissions: sentInvite.permissions,
        sentAt: sentInvite.sentAt,
        expiresAt: sentInvite.expiresAt,
        acceptedAt: sentInvite.acceptedAt,
        rejectedAt: sentInvite.rejectedAt,
      } as ISentInviteResponseDto)
  );
  user.receivedInvitations = user.receivedInvitations.map(
    (receivedInvite: IInvitationsExtended) =>
      ({
        inviteId: receivedInvite.invitationId,
        email: receivedInvite.fromUser
          ? receivedInvite.fromUser.email
          : receivedInvite.toUserEmail,
        firstName: receivedInvite.fromUser?.firstName,
        lastName: receivedInvite.fromUser?.lastName,
        permissions: receivedInvite.permissions,
        sentAt: receivedInvite.sentAt,
        expiresAt: receivedInvite.expiresAt,
        acceptedAt: receivedInvite.acceptedAt,
        rejectedAt: receivedInvite.rejectedAt,
      } as IReceivedInviteResponseDto)
  );

  user.dataSharingAgreementTo = user.dataSharingAgreementTo.map(
    (dataSharingTo: IDataSharingAgreementExtended) =>
      ({
        agreementId: dataSharingTo.agreementId,
        email: dataSharingTo.toUser?.email,
        firstName: dataSharingTo.toUser?.firstName,
        lastName: dataSharingTo.toUser?.lastName,
        permissions: dataSharingTo.permissions,
        agreedAt: dataSharingTo.agreedAt,
        revokedAt: dataSharingTo.revokedAt,
      } as IDataSharingResponseDto)
  );
  user.dataSharingAgreementFrom = user.dataSharingAgreementFrom.map(
    (dataSharingFrom: IDataSharingAgreementExtended) =>
      ({
        agreementId: dataSharingFrom.agreementId,
        email: dataSharingFrom.fromUser?.email,
        firstName: dataSharingFrom.fromUser?.firstName,
        lastName: dataSharingFrom.fromUser?.lastName,
        permissions: dataSharingFrom.permissions,
        agreedAt: dataSharingFrom.agreedAt,
        revokedAt: dataSharingFrom.revokedAt,
      } as IDataSharingResponseDto)
  );

  user.mobiles = await userMobileRepository.findUserMobilePushTokens(user.id);
  user.groups = await groupsService.findGroupsMe(user.id);
  user.roles = userRoles;
  user.hasDevice = await getUserHasDevice(user.id);
  return user;
};

const getMedicalConditionTexts = async (profile: IUser): Promise<string[]> => {
  if (!profile.medicalConditionIds || !profile.medicalConditionIds.length) {
    return [];
  }
  return (
    await Promise.all(
      profile.medicalConditionIds.map(async (id: number) => {
        const medicalCondition =
          await profileRepository.findMedicalConditionById(id);
        if (medicalCondition) {
          return medicalCondition.text;
        }
      })
    )
  ).filter(Boolean);
};

const getMedicationTexts = async (profile: IUser): Promise<string[]> => {
  if (!profile.medicationIds || !profile.medicationIds.length) {
    return [];
  }
  return (
    await Promise.all(
      profile.medicationIds.map(async (id: number) => {
        const medication = await profileRepository.findMedicationById(id);
        if (medication) {
          return medication.text;
        }
      })
    )
  ).filter(Boolean);
};

const passwordReset = async (email: string) => {
  const accessToken = await managementApiAccessToken();
  const ns1 = AwsXray.getNamespace();
  ns1.createContext();
  const segment = new AwsXray.Segment('auth0');
  ns1.enter(ns1.createContext());
  const subsegment = segment?.addNewSubsegment('passwordReset');
  subsegment.addAttribute('start_time', Date.now() / 1000);

  try {
    await axios.post(
      `https://${config.auth0ManagementDomain}/dbconnections/change_password`,
      {
        client_id: config.auth0ClientId,
        email,
        connection: 'Username-Password-Authentication',
      },
      {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // eslint-disable-next-line
  } catch (error: any) {
    if (error?.response?.data?.message) {
      logger.error(error.response.data.message);
      throw somethingWentWrongError();
    } else if (error?.message) {
      logger.error(error.message);
      throw somethingWentWrongError();
    } else {
      logger.error(error);
      throw somethingWentWrongError();
    }
  } finally {
    subsegment.addAttribute('end_time', Date.now() / 1000);
    subsegment.addAttribute('in_progress', false);
    subsegment.flush();
    subsegment.close();
    segment.close();
  }
};

const getUserByDeviceSerial = async (
  deviceSerial: string
): Promise<IUser | null> => {
  return userRepository.findOneByDeviceSerial(deviceSerial);
};

const getUserByProfileId = async (
  profileId: number
): Promise<IGetUserByProfileIdResponseDto> => {
  const user = await userRepository.findFirstByProfileId(profileId);
  if (!user) {
    throw userNotFound();
  }
  return user;
};

const getUserByUserId = (userId: number): Promise<IUser | null> => {
  return userRepository.findOne({ id: userId });
};

const getAllUsers = async (
  skip: number,
  take: number
): Promise<IGetUsersInternalResponseDto> => {
  const { count, users } = await userRepository.usersFindMany({
    skip,
    take,
  });

  return {
    count,
    users: users.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      userGuid: user.userGuid,
      email: user.email,
      localCutoff: user.localCutoff,
      profileId: user.profile?.id || null,
    })),
  };
};

const getUserHasDevice = async (userId: number): Promise<boolean> => {
  try {
    const device = await analyteStoolService.getUserDeviceIdSerial(userId);
    return !!device;
    // eslint-disable-next-line
  } catch (error: any) {
    if (error.status === httpStatus.BAD_REQUEST) {
      return false;
    }
    throw error;
  }
};

const getUsersByDeviceTZ = async (
  gmt: string,
  skip: number,
  take: number
): Promise<IGetUsersByDeviceTZResponseDto[]> => {
  return userRepository.findManyByDeviceTZ(gmt, skip, take);
};

const handleWelcomeEmail = async (
  user: IUser,
  profile: IProfileUpdateResponse,
  userProfileUpdate: IUpdateUserProfileRequestDto,
  doNotSendWelcomeEmail: boolean
): Promise<boolean> => {
  if (user.isWelcomeEmailSent) {
    return true;
  }
  const { firstName, lastName } = userProfileUpdate;
  if (firstName === ' ' || lastName === ' ') {
    return false;
  }
  if (profile.fresh || !doNotSendWelcomeEmail) {
    try {
      await sqsClient.publishMessageSQS({
        default: 'group:Email',
        eventSource: EventSource.SystemGenerated,
        group: 'Email',
        type: 'welcomeEmail',
        data: [
          {
            emailRecipient: user.email,
            firstName: firstName,
            lastName: lastName,
          },
        ],
      });
      logger.info(`Successfully sent welcome email to user ${user.userGuid}`);
      // eslint-disable-next-line
    } catch (err: any) {
      logger.error(
        `Failed to send email to user ${user.userGuid}, error is ${err}`
      );
      return false;
    }
    return true;
  }
  return true;
};

export {
  createOrUpgradeFromtransientUser,
  checkUserDeviceByUserId,
  assembleUserResponse,
  passwordReset,
  resendVerificationEmail,
  findOne,
  update,
  findByUserId,
  findByUserGuid,
  findProfileDeviceSerialByEmail,
  findMe,
  getMedicalConditionTexts,
  getMedicationTexts,
  getUserByProfileId,
  getUserByDeviceSerial,
  getUserByUserId,
  getAllUsers,
  getUsersByDeviceTZ,
};
