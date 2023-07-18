import { Prisma } from '@prisma/client';
import { parseFloatCustom } from '@utils/string.util';

const createUpdateStub = (value: string | number | Prisma.JsonObject) => {
  if (typeof value === 'number' && !isNaN(value)) {
    value = value.toString();
  } else {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
  }
  return value;
};

const findStub = (value: string | number | Prisma.JsonObject) => {
  const numberInterpretation = parseFloatCustom(value);
  if (
    typeof numberInterpretation === 'number' &&
    !isNaN(numberInterpretation)
  ) {
    return numberInterpretation;
  }

  try {
    const deviceSettingJSON = JSON.parse(value as string);
    return deviceSettingJSON;
  } catch (_) {
    return value;
  }
};

export default {
  createUpdateStub,
  findStub,
};
