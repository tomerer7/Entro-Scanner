import winston, { Logger } from 'winston';
import config from '../config';
const { combine, timestamp, colorize, printf } = winston.format;

const logFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

const logger: Logger = winston.createLogger({
    level: config.logLevel || 'debug',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
            )
        })
    ]
});

export default logger;
