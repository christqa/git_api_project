import moment from 'moment';
import { EventSource } from '@prisma/client';
import config from '@core/enviroment-variable-config';
import { IUser } from '@modules/user/user.type';
import { IUserDataRemovalRequestDto } from '@modules/user/dtos/user-data-removal-request.dto';
import * as sqsClient from '../../lib/sqs.client';
import dataPrivacyRemovalRequestsRepository from '@repositories/data-privacy-removal-requests.repository';
import {
  dataPrivacyRemovalRequestReasonAdditionalTextNotAllowed,
  dataPrivacyRemovalRequestReasonNotFound,
} from './data-privacy-removal-requests.error';

const dataPrivacyRemovalRequest = async (
  userDataRemovalRequest: IUserDataRemovalRequestDto,
  user: IUser
): Promise<void> => {
  // check data privacy removal request reason
  const dataPrivacyRemovalReason =
    await dataPrivacyRemovalRequestsRepository.findRequestReason(
      {
        id: userDataRemovalRequest.requestReason,
      },
      {
        dataPrivacyRemovalRequestType: {
          select: { text: true },
        },
      }
    );
  if (!dataPrivacyRemovalReason) {
    throw dataPrivacyRemovalRequestReasonNotFound();
  }

  // check data privacy removal request reason additional text if it's allowed
  if (
    !dataPrivacyRemovalReason.allowAdditionalText &&
    userDataRemovalRequest.requestCustomReason
  ) {
    throw dataPrivacyRemovalRequestReasonAdditionalTextNotAllowed();
  }

  // create data privacy removal request
  const dataPrivacyRemovalRequest =
    await dataPrivacyRemovalRequestsRepository.create({
      userId: user.id,
      requestReason: userDataRemovalRequest.requestReason,
      requestReasonText: userDataRemovalRequest.requestCustomReason,
    });

  // send email to data privacy team with new data privacy request
  const emailData = {
    requestType: dataPrivacyRemovalReason.dataPrivacyRemovalRequestType?.text,
    requestReason: dataPrivacyRemovalReason.text,
    requestCustomReason: userDataRemovalRequest.requestCustomReason,
    requestedAt: moment(dataPrivacyRemovalRequest.requestedAt)
      .utc()
      .format('YYYY-MM-DDTHH:mm:ssZ'),
  };
  await sqsClient.publishMessageSQS({
    default: 'group:Email',
    eventSource: EventSource.SystemGenerated,
    group: 'Email',
    type: 'DataPrivacyRemovalRequestTeam',
    data: [
      {
        ...emailData,
        emailRecipient: config.dataPrivacyRemovalRequestEmailRecipient,
        userGuid: user.userGuid,
      },
    ],
  });

  // send email to user with data privacy request received
  await sqsClient.publishMessageSQS({
    default: 'group:Email',
    eventSource: EventSource.SystemGenerated,
    group: 'Email',
    type: 'DataPrivacyRemovalRequestUser',
    data: [
      {
        ...emailData,
        emailRecipient: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    ],
  });
};

export { dataPrivacyRemovalRequest };
