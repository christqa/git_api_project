import httpStatus from 'http-status';
import ApiError from './api-error';
import { TranslatedMessageType } from '@modules/translation/translation.types';

const conflictError = (message: string | TranslatedMessageType): Error => {
  return new ApiError(httpStatus.CONFLICT, message);
};

const badRequestError = (message: string | TranslatedMessageType): Error => {
  return new ApiError(httpStatus.BAD_REQUEST, message);
};

const notFoundError = (message: string | TranslatedMessageType): Error => {
  return new ApiError(httpStatus.NOT_FOUND, message);
};

const unauthorizedError = (message: string | TranslatedMessageType): Error => {
  return new ApiError(httpStatus.UNAUTHORIZED, message);
};
const preConditionFailedError = (
  message: string | TranslatedMessageType
): Error => {
  return new ApiError(httpStatus.PRECONDITION_FAILED, message);
};
const failedDependencyError = (
  message: string | TranslatedMessageType
): Error => {
  return new ApiError(httpStatus.FAILED_DEPENDENCY, message);
};
const requestEntityTooLargeError = (
  message: string | TranslatedMessageType
): Error => {
  return new ApiError(httpStatus.REQUEST_ENTITY_TOO_LARGE, message);
};
const unprocessableEntityError = (
  message: string | TranslatedMessageType
): Error => {
  return new ApiError(httpStatus.UNPROCESSABLE_ENTITY, message);
};

const forbiddenError = (message: string | TranslatedMessageType): Error => {
  return new ApiError(httpStatus.FORBIDDEN, message);
};

export {
  conflictError,
  badRequestError,
  notFoundError,
  unauthorizedError,
  preConditionFailedError,
  failedDependencyError,
  requestEntityTooLargeError,
  unprocessableEntityError,
  forbiddenError,
};
