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
import swaggerUi from 'swagger-ui-express';
import { IUser } from '@modules/user/user.type';
import * as swaggerJson from './swagger.json';
import { RegisterRoutes } from './routes';
import toggleFeatureManagementMiddleware from '@modules/toggles/middleware';
import TranslationService from '@modules/translation/translation.service';
import path from 'path';
import AwsXray from 'aws-xray-sdk';
import basicAuth from 'express-basic-auth';

// EC2 Plugin is for EKS workernodes, ECS plugin for docker containers deployed to k8s
if (config.awsXrayPluginsEnabled)
  AwsXray.config([AwsXray.plugins.EC2Plugin, AwsXray.plugins.ECSPlugin]);

AwsXray.setDaemonAddress(config.awsXrayDaemonAddress);
// The errors will not be logged for keeping the console clean
AwsXray.setContextMissingStrategy('IGNORE_ERROR');

TranslationService.loadTranslationDictionaries();
const app: Application = express();

const basicAuthMiddelWare = basicAuth({
  users: { [config.basicAuthUserName]: config.basicAuthPassword },
  challenge: true,
});
app.use(cors());
if (config.toggleUnleashEnabled) {
  app.use(toggleFeatureManagementMiddleware);
}

if (config.env !== 'test') {
  app.use(successHandler);
  app.use(errorHandler);
}

if (config.env !== 'production') {
  const swaggerJsonWithEnv = JSON.parse(
    JSON.stringify(swaggerJson)
      .replaceAll('AUTH0_CLIENT_ID', config.auth0ClientId)
      .replaceAll('AUTH0_ISSUER', config.auth0Issuer)
      .replaceAll('AUTH0_AUDIENCE', config.auth0Audience)
  );
  app.use(
    '/swagger.json',
    express.static(path.join(__dirname, 'swagger.json'))
  );
  app.use(
    ['/api-docs', '/swagger'],
    basicAuthMiddelWare,
    swaggerUi.serve,
    swaggerUi.setup(swaggerJsonWithEnv)
  );
}
app.use(helmet());
app.use(express.json());

app.use(AwsXray.express.openSegment('api')); //required at the start of your routes

RegisterRoutes(app);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(notFoundError('Not found'));
});

app.use(errorConverter);
app.use(errorMiddleware);

app.use(AwsXray.express.closeSegment());
declare global {
  namespace Express {
    export interface Request {
      user: IUser;
      // keeps the logged in user data when data sharing is active
      authenticatedUser?: IUser;
    }
  }
}

export default app.listen(config.port, async () => {
  app.use('/templates', express.static(__dirname + '/templates'));
  console.log(`App is listening on port ${config.port} !`);
});
