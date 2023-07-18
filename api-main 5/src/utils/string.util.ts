export const camelToDash = (str: string) => {
  // EmailSesClient => email-ses-client
  let newString = '';
  let dashedAlready = 0;
  for (let idx = 0; idx < str.length; idx++) {
    if (
      str[idx] >= 'A' &&
      str[idx] <= 'Z' &&
      idx > 0 &&
      idx - dashedAlready > 1
    ) {
      newString += '-';
      dashedAlready = idx;
    }
    newString += str[idx].toLowerCase();
  }
  return newString;
};

// durationInSeconds => duration_in_seconds
export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

// duration_in_seconds => durationInSeconds
export const snakeToCamel = (str: string) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseFloatCustom = (input: any) => {
  if (typeof input === 'number') {
    return input;
  }
  if (typeof input !== 'string') {
    return NaN;
  }
  const match = input.match(/^([-+])?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/);
  if (match) {
    const parsed = parseFloat(match[0]);
    return parsed;
  } else {
    return NaN;
  }
};
