import express, { Application, NextFunction, Request, Response } from 'express';
import 'dotenv/config';
import {
  errorConverter,
  errorMiddleware,
} from '@core/error-handling/error.middleware';
import helmet from 'helmet';
import config from '@core/enviroment-variable-config';
import { errorHandler, successHandler } from '@core/logger/morgan';
import { notFoundError } from '@core/error-handling/error-list';
import cors from 'cors';
import { RegisterRoutes } from '../../routes';
import TranslationService from '@modules/translation/translation.service';

TranslationService.loadTranslationDictionaries();
export const testApplication: Application = express();
testApplication.use(cors());

if (config.env !== 'test') {
  testApplication.use(successHandler);
  testApplication.use(errorHandler);
}

testApplication.use(helmet());

testApplication.use(express.json());

RegisterRoutes(testApplication);

testApplication.use((req: Request, res: Response, next: NextFunction) => {
  next(notFoundError('Not found'));
});

testApplication.use(errorConverter);
testApplication.use(errorMiddleware);
