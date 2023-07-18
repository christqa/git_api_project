import { NextFunction, Request, Response } from 'express';
import Joi, { SchemaLike } from 'joi';
import { badRequestError } from '@core/error-handling/error-list';

const pick = <T>(object: T, keys: string[]): object => {
  return keys.reduce((data, key: string) => {
    return object[key as keyof T]
      ? { ...data, [key]: object[key as keyof T] }
      : data;
  }, {});
};

const validate =
  (schema: SchemaLike) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick<SchemaLike>(schema, ['params', 'query', 'body']);
    const object = pick<Request>(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(', ');
      return next(badRequestError(errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export default validate;
