import { IGetStatusResponseDto } from './dtos/status.dto';
import fs from 'fs';

export const DEFAULT_BUILD_NUMBER = '0';
export const DEFAULT_VERSION = '0.0.1';

const getStatus = async (): Promise<IGetStatusResponseDto> => {
  const { version, buildNumber } = await getVersionAndBuildNumber();
  return {
    status: 'healthy',
    version: `${version}-${buildNumber}`,
  };
};

const getVersionAndBuildNumber = async (): Promise<{
  version: string;
  buildNumber: string;
}> => {
  let metadata;
  if (fs.existsSync('metadata.json')) {
    metadata = JSON.parse(fs.readFileSync('metadata.json', 'utf-8'));
  }
  return {
    version: metadata?.version || DEFAULT_VERSION,
    buildNumber: metadata?.buildNumber || DEFAULT_BUILD_NUMBER,
  };
};

export { getStatus };
