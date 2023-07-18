import fs from 'fs';
import { statusService } from '@modules/index/index.service';
import { DEFAULT_BUILD_NUMBER, DEFAULT_VERSION } from './status.service';

beforeEach(() => {
  //
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Status', () => {
  test('should test getStatus function (default)', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
    const status = await statusService.getStatus();
    expect(status.status).toBe('healthy');
    expect(status.version).toBe(`${DEFAULT_VERSION}-${DEFAULT_BUILD_NUMBER}`);
  });

  test('should test getStatus function (from metadata.json)', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('{"version": "1.0.0", "buildNumber": "307"}');
    const status = await statusService.getStatus();
    expect(status.status).toBe('healthy');
    expect(status.version).toBe('1.0.0-307');
  });
});
