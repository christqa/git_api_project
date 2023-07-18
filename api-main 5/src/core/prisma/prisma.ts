/**
 * The purpose of this file to provide a Prisma client instance that
 * will be used across the project.
 *
 * For the api project, we will be using a singleton model for prisma, meaning that there will
 * be one prisma client instantiated in the project. The singleton model enables us to mock prisma for
 * api test cases.
 */

import { PrismaClient } from '@prisma/client';
import { onDbQueryEvent } from '@core/tracing/aws-xray';

const prisma = new PrismaClient({
  log: [{ level: 'query', emit: 'event' }],
});

prisma.$on('query', onDbQueryEvent);

export default prisma;
