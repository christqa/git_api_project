import config from '@core/enviroment-variable-config';
import morgan from 'morgan';
import logger from './logger';
import { Request, Response } from 'express';

morgan.token(
  'message',
  (req: Request, res: Response) => res.locals.errorMessage || ''
);
morgan.token('error', (req: Request, res: Response) => res.locals.error || '');

const getIpFormat = () =>
  config.env === 'production' ? ':remote-addr - ' : '';
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message - error: :error`;

const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: {
    write: (message: string) => {
      logger.error(message.trim());
    },
  },
});

export { successHandler, errorHandler };
