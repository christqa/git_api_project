/* istanbul ignore file */

import { SNSClient } from '../../lib';

const registerDevice = (token: string) => {
  return SNSClient.createAppEndpoint(token);
};

const unregisterDevice = (endpointId: string) => {
  return SNSClient.deleteAppEndpoint(endpointId);
};

const publishMessage = (
  endpointId: string,
  title: string,
  message: string,
  link: string,
  // eslint-disable-next-line
  customInfo?: { [key: string]: any }
) => {
  return SNSClient.publishCommand(endpointId, title, message, link, customInfo);
};

export { registerDevice, unregisterDevice, publishMessage };
