import { PrismaMiddlewareDataType } from '@modules/analytes/analytes.type';
import {
  compareObjectProperties,
  filterNullProperties,
  fixPrismaDecimalPlaceInFloat,
  removeByteOrderMark,
} from './object.util';

describe('Object Utils', () => {
  test('should test compareObjectProperties function', async () => {
    expect(compareObjectProperties({ a: 1 }, { a: 1, b: 2 })).toEqual(false);
    expect(compareObjectProperties({ a: 1 }, { a: 1 })).toEqual(true);
    expect(
      compareObjectProperties({ a: 1, b: { c: 1 } }, { a: 1, b: { c: 1 } })
    ).toEqual(true);
  });

  test('should test filterNullProperties function', async () => {
    expect(filterNullProperties({ a: 1, b: 0, c: null, d: undefined })).toEqual(
      { a: 1, b: 0 }
    );
  });

  test('should test removeByteOrderMark function', async () => {
    expect(removeByteOrderMark(`\ufeff, a, b, c`)).toEqual(`, a, b, c`);
    expect(removeByteOrderMark('a, b, c')).toEqual('a, b, c');
  });
  test('should test fixPrismaDecimalPlaceInFloat function', async () => {
    const input = {
      test_key: {
        prisma__type: 'float',
        prisma__value: 123.2345556789,
      },
    } as PrismaMiddlewareDataType;
    const expected = {
      testKey: {
        prisma__type: 'float',
        prisma__value: 123.235,
      },
    } as PrismaMiddlewareDataType;
    expect(fixPrismaDecimalPlaceInFloat(input)).toEqual(expected);
  });
});
