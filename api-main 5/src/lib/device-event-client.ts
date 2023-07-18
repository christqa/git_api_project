import { SNSClient } from '@aws-sdk/client-sns';
class DeviceEventClient extends SNSClient {
  constructor(
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
    sessionToken?: string
  ) {
    const config = {
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      } as {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken: string | undefined;
      },
    };
    if (sessionToken) {
      config.credentials['sessionToken'] = sessionToken;
    }
    super(config);
  }
}
export default DeviceEventClient;
