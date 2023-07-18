/**
 * Amazon Simple Queue Service (SQS) - AWS
 */
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import config from '@core/enviroment-variable-config';
import AWSXRay from 'aws-xray-sdk';

const sqsClient = AWSXRay.captureAWSv3Client(
  new SQSClient({
    region: config.awsSQSRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  })
);

const publishMessageSQS = (message: any) => {
  const command = new SendMessageCommand({
    DelaySeconds: 0,
    QueueUrl: config.awsSqsDeviceEventsMsgQueueArn,
    MessageBody: JSON.stringify(message),
  });
  return sqsClient.send(command);
};

export { publishMessageSQS };
