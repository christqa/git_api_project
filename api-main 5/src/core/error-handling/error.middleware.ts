import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import ApiError from './api-error';
import httpStatus from 'http-status';
import { Prisma } from '@prisma/client';
import { ValidateError } from '@tsoa/runtime';
import { SNSServiceException } from '@aws-sdk/client-sns';
import { serializeError } from 'serialize-error';
import { SUPPORTED_LANGUAGE_ISO_LIST } from '../../constants';
import logger from '@core/logger/logger';

export const INTERNAL_SERVER_ERROR_MESSAGE = 'Something went wrong';
export const PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT = 'P2002';
export const PRISMA_ERROR_CODE_FOREIGN_KEY_CONSTRAINT = 'P2003';

const errorConverter = (
  err: TypeError & { statusCode?: number },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;
  const serializedError = serializeError(err);
  if (error instanceof SNSServiceException) {
    error = new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      INTERNAL_SERVER_ERROR_MESSAGE
    );
  } else if (error instanceof JsonWebTokenError) {
    error = new ApiError(httpStatus.UNAUTHORIZED, error.message);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT) {
      const statusCode = httpStatus.BAD_REQUEST;
      error = new ApiError(
        statusCode,
        // @ts-ignore
        `Unique constraint failed on the fields: ${error.meta?.target}`
      );
    }
  } else if (err instanceof ValidateError) {
    return res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields,
    });
  } else if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      error instanceof Prisma.PrismaClientUnknownRequestError
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, `${message}`);
  }
  // log unprocessed error message/stack
  res.locals.error = serializedError.stack;
  next(error);
};

function errorMiddleware(
  error: ApiError,
  request: Request,
  response: Response,
  next: NextFunction
) {
  const status = error.status || 500;
  const message = getLocalizedMessage(request, error);
  response.status(status).send({
    status,
    message,
  });
  next();
}

export { errorMiddleware, errorConverter };

const getLocalizedMessage = (request: Request, error: ApiError): string => {
  let message = error.message || INTERNAL_SERVER_ERROR_MESSAGE;
  logger.debug(
    `[errorMiddleware] internal server error for REQ  ${
      request.originalUrl
    } , err: ${JSON.stringify(error)}`
  );
  if (error.localised) {
    message = error.localised.en;
    if (request.headers['accept-language']) {
      const languageIso = request.headers['accept-language'];
      if (
        typeof languageIso === 'string' &&
        SUPPORTED_LANGUAGE_ISO_LIST.includes(languageIso)
      ) {
        message = error.localised[languageIso];
      }
    }
  }
  return message;
};
