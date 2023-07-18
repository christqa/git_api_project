import moment from 'moment';

const ADD_DAY = 1;
const YEAR = 18;
const FORMAT_TIMESTAMP = 'YYYY-MM-DDTHH:mm:ssZ';
type NumberDateUndefinedString = number | Date | undefined | string;
type NumberDateUndefined = number | Date | undefined;

const getDateWithFormat = (
  { date, format } = {
    date: getNYearAgoDate(),
    format: 'mm/dd/yyyy',
  }
): string => {
  if (format.toLowerCase() === 'yyyy-mm-ddthh:mm:ss.sssz') {
    return date.toISOString();
  }

  if (format.toLowerCase() === 'yyyy-mm-ddthh:mm:ssz') {
    return date.toISOString().slice(0, 19) + 'Z';
  }

  type IMap = {
    mm: number;
    dd: number;
    yy: string;
    yyyy: number;
  };
  const map: IMap = {
    mm: date.getUTCMonth() + 1,
    dd: date.getUTCDate(),
    yy: date.getUTCFullYear().toString().slice(-2),
    yyyy: date.getUTCFullYear(),
  };
  type IMapKeys = keyof IMap;

  return format.replace(
    /mm|dd|yyyy|yy/gi,
    (matched) => `${map[matched as IMapKeys]}`
  );
};

const getNYearAgoDate = (year = YEAR): Date => {
  const date = new Date();
  return new Date(
    date.setUTCFullYear(
      date.getUTCFullYear() - year,
      date.getUTCMonth(),
      date.getUTCDate() + ADD_DAY
    )
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNDayAgoDate = (day: any = 0, setTimeStartDay = true): Date => {
  let targetDate;

  if (day instanceof Date) {
    targetDate = new Date(day);
  } else {
    targetDate = new Date();
    targetDate.setUTCDate(targetDate.getUTCDate() - Math.abs(day));
  }
  targetDate.setUTCHours(
    setTimeStartDay ? 0 : 23,
    setTimeStartDay ? 0 : 59,
    setTimeStartDay ? 0 : 59,
    setTimeStartDay ? 0 : 999
  );
  return targetDate;
};

const getNDayMinutesHoursAgoDate = (
  day = 0,
  setTimeStartDay = true,
  minutesIncrement = 0
): Date => {
  const now = new Date(new Date().setUTCHours(8, 0, 0, 0));
  const time = setTimeStartDay
    ? now.setUTCHours(
        now.getUTCHours(),
        now.getUTCMinutes() + minutesIncrement,
        now.getUTCSeconds(),
        0
      )
    : now.setUTCHours(23, 59, 59, 999);
  const date = new Date(time);
  return new Date(
    date.setUTCFullYear(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - Math.abs(day)
    )
  );
};

const getDateDifferenceInDay = (date1: Date | string, date2?: Date): number => {
  date1 = new Date(date1);
  date2 = date2 || new Date();
  const differenceDate = date2.getTime() - date1.getTime();
  const x = differenceDate / (1000 * 3600 * 24);
  return Math.floor(x);
};

/**
 * Retrieves the max end date
 * It checks if the end date is in the future relative to server's time
 * If the end date is in the future it will retrieve current date
 */
const getMaxEndDate = (endDate: NumberDateUndefinedString) => {
  // Convert endDate to a Moment object
  let momentEndDate;

  if (!endDate) {
    momentEndDate = moment();
  } else {
    momentEndDate = moment(endDate);
  }
  // Strip out the offset hours from the date
  const endDateWithoutOffset =
    momentEndDate.format(FORMAT_TIMESTAMP).slice(0, -6) + 'Z';
  const currentDate = moment();

  // Check if endDate is in the future
  if (momentEndDate.isAfter(currentDate)) {
    // Return the current date as ISO 8601 without offset
    return currentDate.format(FORMAT_TIMESTAMP).slice(0, -6) + 'Z';
  }

  // Return the endDate without offset
  return endDateWithoutOffset;
};

const getMaxEndDateAsNumber = (
  date: NumberDateUndefinedString
): NumberDateUndefined => {
  if (typeof date === 'string') {
    return moment(date).format(FORMAT_TIMESTAMP).toString() as unknown as
      | number
      | Date
      | undefined;
  }
  if (!date || typeof date === 'number' || !moment(new Date(date)).isAfter()) {
    return date;
  }

  return moment().format(FORMAT_TIMESTAMP).toString() as unknown as
    | number
    | Date
    | undefined;
};

/**
 * Retrieves the score date
 * As data is received, we compute scoreDate value based on the device’s timezone and the localCutoff value for the user
 * The absolute timestamp for the data will be stored in the db
 */
const getScoreDate = (date: Date, localCutoff: string): Date => {
  const currentDate = moment(date);
  const localCutoffDate = new Date(date);

  // set localCutoff date
  const parts = localCutoff.replace(/am|pm/, '').split(':');
  const hours =
    parseInt(parts[0]) + (localCutoff.indexOf('pm') !== -1 ? 12 : 0);
  const minutes = parseInt(parts[1]);
  localCutoffDate.setUTCHours(hours, minutes, 0, 0);

  // return score date
  return currentDate.isAfter(moment(localCutoffDate))
    ? date
    : currentDate.subtract(1, 'days').toDate();
};

const getDateWithFixedOffset = (date: Date, offsetTz: string): Date => {
  return moment(date)
    .utcOffset(offsetTz)
    .format('YYYY-MM-DDTHH:mm:ssZ') as unknown as Date;
};

const getDateWithFixedTime = (date: Date, offsetTz: string): Date => {
  return (moment(date).utcOffset(offsetTz).format('YYYY-MM-DDTHH:mm:ss') +
    'Z') as unknown as Date;
};

export {
  getNYearAgoDate,
  getDateWithFormat,
  getDateDifferenceInDay,
  getNDayAgoDate,
  getNDayMinutesHoursAgoDate,
  getMaxEndDate,
  getMaxEndDateAsNumber,
  getScoreDate,
  getDateWithFixedOffset,
  getDateWithFixedTime,
};
