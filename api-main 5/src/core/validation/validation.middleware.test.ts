import Joi, { ObjectSchema } from 'joi';
import validate from './validation.middleware';
import { Request, Response } from 'express';

export const testSchema: {
  body: ObjectSchema;
} = {
  body: Joi.object({
    key: Joi.boolean().required(),
  }),
};

beforeEach(() => {
  //
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Validation Middleware', () => {
  test('should test validate function (with err)', async () => {
    // eslint-disable-next-line
    let error: any;
    validate(testSchema)(
      {
        body: {},
      } as Request,
      {} as Response,
      (err) => {
        error = err;
      }
    );
    expect(error.message).toEqual('"key" is required');
  });

  test('should test validate function (without err)', async () => {
    // eslint-disable-next-line
    let error: any;
    validate(testSchema)(
      {
        body: {
          key: true,
        },
      } as Request,
      {} as Response,
      (err) => {
        error = err;
      }
    );
    expect(error).toEqual(undefined);
  });
});
