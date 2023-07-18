import { getNDayMinutesHoursAgoDate, getScoreDate } from './date.util';

describe('Date Utils', () => {
  test('should test getNDayMinutesHoursAgoDate function', async () => {
    const date = new Date();
    const expected = new Date(
      date.setUTCFullYear(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() - Math.abs(0)
      )
    );

    expected.setUTCHours(8, 0, 0, 0);
    const d = getNDayMinutesHoursAgoDate();
    expect(d).toStrictEqual(expected);
  });
  test('should test getScoreDate function', async () => {
    const d = new Date();
    const dx = getScoreDate(d, '04:00 AM');
    expect(dx).toEqual(d);
  });
});
