import httpStatus from 'http-status';
import ApiError from '@core/error-handling/api-error';
import { dataPrivacyRemovalRequestService } from '@modules/index/index.service';
import { generateUser } from '@test/utils/generate';
import dataPrivacyRemovalRequestsRepository from '@repositories/data-privacy-removal-requests.repository';
import * as sqsClient from '../../lib/sqs.client';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';

const userObject = generateUser();
const dataPrivacyRemovalRequestObject = {
  id: 1,
  userId: 1,
  requestReason: 1,
  requestReasonText: null,
  requestedAt: new Date(),
};
const dataPrivacyRemovalRequestReasonObject = {
  id: 1,
  requestType: 1,
  text: 'Privacy or Data Concerns',
  allowAdditionalText: false,
  dataPrivacyRemovalRequestType: {
    id: 1,
    text: 'Delete my account and data',
    order: 1,
  },
};

beforeEach(() => {
  jest
    .spyOn(dataPrivacyRemovalRequestsRepository, 'create')
    .mockResolvedValue(dataPrivacyRemovalRequestObject);
  jest
    .spyOn(dataPrivacyRemovalRequestsRepository, 'findRequestReason')
    .mockResolvedValue(dataPrivacyRemovalRequestReasonObject);
  const apiSQSResp = {
    $metadata: 1,
    MessageId: '1',
  };
  jest
    .spyOn(sqsClient, 'publishMessageSQS')
    .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Data Privacy Removal Requests', () => {
  test('should test dataPrivacyRemovalRequest function', async () => {
    const result =
      await dataPrivacyRemovalRequestService.dataPrivacyRemovalRequest(
        { requestReason: 1 },
        userObject
      );
    expect(result).toBe(undefined);
  });

  test('should test dataPrivacyRemovalRequest function (404)', async () => {
    jest
      .spyOn(dataPrivacyRemovalRequestsRepository, 'findRequestReason')
      .mockResolvedValue(null);

    try {
      await dataPrivacyRemovalRequestService.dataPrivacyRemovalRequest(
        { requestReason: 1 },
        userObject
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'data_privacy_removal_requests_reason_not_found'
      );
    }
  });

  test('should test revokeDataSharingAgreement function (400)', async () => {
    try {
      await dataPrivacyRemovalRequestService.dataPrivacyRemovalRequest(
        { requestReason: 1, requestCustomReason: 'custom reason' },
        userObject
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'data_privacy_removal_requests_reason_additional_text_not_allowed'
      );
    }
  });
});
