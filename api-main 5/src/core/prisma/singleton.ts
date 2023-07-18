/**
 * The singleton file tells Jest to mock a default export (the Prisma client instantiated in ./prisma.ts),
 * and uses the mockDeep method from jest-mock-extended to enable access to the objects and methods
 * available on the Prisma client. It then resets the mocked instance before each test is run.
 */

import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

import prisma from '@core/prisma/prisma';

jest.mock('./prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
