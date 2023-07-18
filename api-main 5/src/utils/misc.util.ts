import express from 'express';
import config from '@core/enviroment-variable-config';

const getServerLink = (request: express.Request) =>
  request.headers.host?.indexOf('localhost') !== -1
    ? `${request.protocol}://${request.headers.host}:${config.port}`
    : `${request.protocol}://${request.headers.host}`;

export { getServerLink };
