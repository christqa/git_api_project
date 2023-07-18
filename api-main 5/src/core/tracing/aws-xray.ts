import AWSXRay from 'aws-xray-sdk-core';
import logger from '@core/logger/logger';

/*
 * From https://medium.com/@lucas_18321/how-to-trace-sql-queries-in-prisma-with-xray-sdk-in-nodejs-8c6dc92df07f
 */
export const onDbQueryEvent = async (e: any) => {
  try {
    const segment = AWSXRay.getSegment();
    if (segment) {
      const query = e.query;
      // X-Ray wants the time in seconds -> ms * 1e-3
      const startTime = e.timestamp.valueOf() * 1e-3;
      const endTime = (e.timestamp.valueOf() + e.duration) * 1e-3;

      // Add a new Subsegment to parent Segment
      const subSegment = segment.addNewSubsegment('postgres');
      // Add data to the segment
      subSegment.addSqlData({ sanitized_query: query });
      subSegment.addAttribute('start_time', startTime);
      subSegment.addAttribute('end_time', endTime);
      // Set in_progress to false so subSegment
      // will be sent to xray on streamSubsegments()
      subSegment.addAttribute('in_progress', false);
      subSegment.streamSubsegments();
    }
  } catch (e: any) {
    logger.error(e);
  }
};
