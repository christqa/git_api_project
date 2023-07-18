import { SNSServiceException } from '@aws-sdk/client-sns';
import { errorConverter, errorMiddleware } from './error.middleware';
import ApiError from './api-error';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { ValidateError } from 'tsoa';

class Status {
  locals = {};
  error = '';
  code: number | undefined;

  // eslint-disable-next-line
  status(code: number): any {
    this.code = code;
    return this;
  }

  json(message: string) {
    this.error = message;
  }

  send(message: string) {
    this.error = message;
  }
}

// eslint-disable-next-line
let req: any;
// eslint-disable-next-line
let res: any;

beforeEach(() => {
  req = {};
  res = new Status();
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Error Middleware', () => {
  test('should test errorConverter function (SNSServiceException)', async () => {
    // eslint-disable-next-line
    let error: any;
    errorConverter(
      // eslint-disable-next-line
      new SNSServiceException({ message: 'test' } as any),
      req,
      res,
      (err) => {
        error = err;
      }
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toEqual(500);
    expect(error.message).toEqual('Something went wrong');
  });

  test('should test errorConverter function (JsonWebTokenError)', async () => {
    // eslint-disable-next-line
    let error: any;
    errorConverter(new JsonWebTokenError('test'), req, res, (err) => {
      error = err;
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toEqual(401);
    expect(error.message).toEqual('test');
  });

  test('should test errorConverter function (Prisma)', async () => {
    // eslint-disable-next-line
    let error: any;
    errorConverter(
      new Prisma.PrismaClientKnownRequestError('test', {
        code: 'P2002',
        clientVersion: '1',
      }),
      req,
      res,
      (err) => {
        error = err;
      }
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toEqual(400);
    expect(error.message).toEqual(
      'Unique constraint failed on the fields: undefined'
    );
  });

  test('should test errorConverter function (ValidateError)', async () => {
    errorConverter(
      new ValidateError({ test: { message: 'test' } }, 'test'),
      req,
      res,
      () => ({})
    );

    expect(res.error.message).toEqual('Validation Failed');
  });

  test('should test errorConverter function (!ApiError)', async () => {
    // eslint-disable-next-line
    let error: any;
    errorConverter(new Error('test'), req, res, (err) => {
      error = err;
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toEqual(500);
    expect(error.message).toEqual('test');
  });

  test('should test errorConverter function (!ApiError Prisma)', async () => {
    // eslint-disable-next-line
    let error: any;
    errorConverter(
      new Prisma.PrismaClientUnknownRequestError('test', {
        clientVersion: '1',
      }),
      req,
      res,
      (err) => {
        error = err;
      }
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toEqual(400);
    expect(error.message).toEqual('test');
  });

  test('should test errorMiddleware function', async () => {
    errorMiddleware(new ApiError(500, 'test'), req, res, () => ({}));

    expect(res.error.message).toEqual('test');
  });
});
