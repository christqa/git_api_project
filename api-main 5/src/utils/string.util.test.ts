import {
  camelToDash,
  camelToSnakeCase,
  parseFloatCustom,
  snakeToCamel,
} from './string.util';

describe('String Utils', () => {
  test('should test camelToDash function', async () => {
    const res = camelToDash('AbcDef');
    expect(res).toBe('abc-def');
  });

  test('should test camelToSnakeCase function', async () => {
    const res = camelToSnakeCase('durationInSeconds');
    expect(res).toBe('duration_in_seconds');
  });

  test('should test snakeToCamel function', async () => {
    const res = snakeToCamel('duration-in-seconds');
    expect(res).toBe('durationInSeconds');
  });
  test('should test parseFloatCustom function (number)', async () => {
    const res = parseFloatCustom(12);
    expect(res).toBe(12);
  });
  test('should test parseFloatCustom function (string with letters)', async () => {
    const res = parseFloatCustom('12h');
    expect(res).toBe(NaN);
  });
  test('should test parseFloatCustom function (string as number)', async () => {
    const res = parseFloatCustom('12');
    expect(res).toBe(12);
  });
  test('should test parseFloatCustom function (float as number string)', async () => {
    const res = parseFloatCustom('3.141322');
    expect(res).toBe(3.141322);
  });
  test('should test parseFloatCustom function (float as number)', async () => {
    const res = parseFloatCustom(3.141322);
    expect(res).toBe(3.141322);
  });
  test('should test parseFloatCustom function (float as number with exponent)', async () => {
    const res = parseFloatCustom(3.14e10);
    expect(res).toBe(3.14e10);
  });
  test('should test parseFloatCustom function (float as string with exponent)', async () => {
    const res = parseFloatCustom('3.14e10');
    expect(res).toBe(31400000000);
  });

  test('should test parseFloatCustom function (random string)', async () => {
    const res = parseFloatCustom('abcd');
    expect(res).toBe(NaN);
  });
  test('should test parseFloatCustom function (object)', async () => {
    const res = parseFloatCustom({ a: 1 });
    expect(res).toBe(NaN);
  });
});
