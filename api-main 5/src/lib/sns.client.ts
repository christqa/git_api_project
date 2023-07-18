/**
 * Amazon Simple Notification Service (SNS) - AWS
 */
import {
  CreatePlatformEndpointCommand,
  DeleteEndpointCommand,
  PublishCommand,
  SNSClient,
} from '@aws-sdk/client-sns';
import config from '@core/enviroment-variable-config';
import { MessageAttributeValue } from '@aws-sdk/client-sns/dist-types/models/models_0';
import DeviceEventClient from './device-event-client';
import AWSXRay from 'aws-xray-sdk';

const client = AWSXRay.captureAWSv3Client(
  new SNSClient({
    region: config.awsSnsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  })
);

// todo SW-1809 merge client and deviceEventClient
const deviceEventClient = new DeviceEventClient(
  config.awsDeviceEventSnsRegion,
  config.awsAccessKeyId,
  config.awsSecretAccessKey,
  config.SessionToken ? config.SessionToken : undefined
);

const createAppEndpoint = (token: string) => {
  const command = new CreatePlatformEndpointCommand({
    PlatformApplicationArn: config.awsSnsPlatformAppArn,
    Token: token,
  });
  return client.send(command);
};

const deleteAppEndpoint = (endpointId: string) => {
  const command = new DeleteEndpointCommand({
    EndpointArn: endpointId,
  });
  return client.send(command);
};

const publishCommand = (
  endpointId: string,
  title: string,
  body: string,
  link: string,
  customInfo?: { [key: string]: any }
) => {
  const message: { [key: string]: any } = {
    aps: {
      alert: {
        title,
        body,
      },
      'target-content-id': link,
      badge: 1,
      'mutable-content': 1,
    },
  };

  if (customInfo) {
    message.customInfo = customInfo;
  }

  const command = new PublishCommand({
    TargetArn: endpointId,
    MessageStructure: 'json',
    Message: JSON.stringify({
      [config.awsSnsApnsKey]: JSON.stringify(message),
    }),
  });
  return client.send(command);
};

const publishAnalytesSNS = (
  MessageAttributes: Record<string, MessageAttributeValue>,
  message: any
) => {
  const command = new PublishCommand({
    TopicArn: config.awsSnsDeviceEventTopicArn,
    MessageAttributes,
    Message: JSON.stringify(message),
  });
  return deviceEventClient.send(command);
};

export {
  createAppEndpoint,
  deleteAppEndpoint,
  publishCommand,
  publishAnalytesSNS,
};
