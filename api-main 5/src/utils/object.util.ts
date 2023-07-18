import { PrismaMiddlewareDataType } from '@modules/analytes/analytes.type';
import { snakeToCamel } from '@utils/string.util';
import { TranslatedMessageType } from '@modules/translation/translation.types';

export const filterNullProperties = <T>(obj: T): T => {
  for (const key in obj) {
    if (String(obj[key]) === 'null' || String(obj[key]) === 'undefined') {
      delete obj[key];
    }
  }
  return obj;
};

// return different properties
// eslint-disable-next-line
export const compareObjectProperties = (object1: any, object2: any) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];

    // check if key exists in object2
    if (val2 === undefined) {
      return false;
    }

    const areObjects = isObject(val1) && isObject(val2);
    if (areObjects && !compareObjectProperties(val1, val2)) {
      return false;
    }
  }
  return true;
};

function isObject(object: {}) {
  return object != null && typeof object === 'object';
}

// remove first character from json file to use json parsing
export const removeByteOrderMark = (a: string) =>
  a[0] == '\ufeff' ? a.slice(1) : a;

export const fixPrismaDecimalPlaceInFloat = (
  data: PrismaMiddlewareDataType
) => {
  const newData = { ...data };
  for (const [key, value] of Object.entries(data)) {
    // fix float
    if (
      value.prisma__type === 'float' &&
      typeof value.prisma__value === 'number'
    ) {
      newData[key] = {
        ...value,
        prisma__value: parseFloat(value.prisma__value.toFixed(3)),
      };
    }
    // update snakeToCamel, duration_in_seconds => durationInSeconds
    newData[snakeToCamel(key)] = newData[key];
    // remove snakeCases
    if (snakeToCamel(key) !== key) {
      delete newData[key];
    }
  }
  return newData;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepClone(obj: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newObj: any = Array.isArray(obj) ? [] : {};

  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          newObj[key] = deepClone(obj[key]);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
  }
  return newObj;
}

export function isTranslatedMessageType(
  message: string | TranslatedMessageType
): message is TranslatedMessageType {
  return (
    (message as TranslatedMessageType).en !== undefined ||
    (message as TranslatedMessageType).key !== undefined
  );
}
