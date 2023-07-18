const { SpecConfig } = require('tsoa');
const dotenv = require('dotenv');
dotenv.config();

let config = {
  entryFile: 'src/app.ts',
  noImplicitAdditionalProperties: 'throw-on-extras',
  controllerPathGlobs: ['src/**/*.controller.ts'],
  spec: {
    outputDirectory: 'src',
    specVersion: 3,
    securityDefinitions: {
      auth0: {
        type: 'oauth2',
        in: 'header',
        scheme: 'bearer',
        description: `client_id: AUTH0_CLIENT_ID`,
        flows: {
          implicit: {
            authorizationUrl: `https://AUTH0_ISSUER/authorize?&audience=AUTH0_AUDIENCE`,
            scopes: {}
          }
        }
      }
    }
  },
  routes: {
    routesDir: 'src',
    authenticationModule: 'src/core/authentication/auth0-authentication.ts'
  }
};

module.exports = config;
