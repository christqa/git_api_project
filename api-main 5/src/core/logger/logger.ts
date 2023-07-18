import { createLogger, transports, format } from 'winston';
import config from '@core/enviroment-variable-config';
import { TransformableInfo } from 'logform';

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }: TransformableInfo) =>
        `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;
