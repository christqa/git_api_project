import {
  IReceivedInviteResponseDto,
  ISentInviteResponseDto,
} from '../../invite/dtos/invite.dto';
import { IDataSharingResponseDto } from '../../data-sharing-agreement/dtos/data-sharing-agreement.index.dto';
import { IUserMobilePushTokens } from '../../user-mobile/user-mobile.type';
import { IGetGroupResponseDto } from '../../groups/dtos/get-groups.dto';

export interface IGetUserProfileResponseDto {
  id: number;
  authId: string;
  userGuid: string;
  email: string;
  firstName: string;
  lastName: string;
  timeZoneId: number;
  localCutoff: string;
  createdOn: Date;
  updatedOn: Date;
  transient: boolean;
  isEmailVerified: boolean;
  isWelcomeEmailSent: boolean;
  profile?: {
    dob: string;
    regionalPref: string;
    weightLbs: number;
    heightIn: number;
    userId: number;
    genderId: number;
    createdOn: Date;
    updatedOn: Date;
    medicalConditions?: {
      id: 1;
      text: string;
    }[];
    medications?: {
      id: 1;
      text: string;
    }[];
    lifeStyle?: {
      id: 1;
      text: string;
    };
    urinationsPerDay?: {
      id: number;
      text: string;
    };
    bowelMovement?: {
      id: number;
      text: string;
    };
  };
  lastAgreement?: {
    privacyPolicyVersion: number;
    termsAndConditionsVersion: number;
  };
  groups?: IGetGroupResponseDto[];
  mobiles?: IUserMobilePushTokens[];
  sentInvitations: ISentInviteResponseDto[];
  receivedInvitations: IReceivedInviteResponseDto[];
  dataSharingAgreementTo: IDataSharingResponseDto[];
  dataSharingAgreementFrom: IDataSharingResponseDto[];
  hasDevice: boolean;
}
