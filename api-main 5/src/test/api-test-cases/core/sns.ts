import * as SNS from '../../../lib/sns.client';

const sns = jest
  .spyOn(SNS, 'publishAnalytesSNS')
  .mockResolvedValue({} as unknown as any);

export const mockSNS = () => {
  beforeAll(() => {
    sns.mockImplementation();
  });
};
