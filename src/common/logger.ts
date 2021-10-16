import winston, { createLogger, format, transports } from 'winston';

const { combine, splat, timestamp, printf } = format;

const LogLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 2,
        debug: 3,
    },
    colors: {
        error: 'bold red',
        warn: 'yellow',
        info: 'blue',
        http: 'magenta',
        debug: 'green',
    },
};

/**
 * Custom winston format for logging information
 * */
const eventFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message} `;

    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }

    return msg;
});

const Logger = createLogger({
    level: 'info',
    levels: LogLevels.levels,
    format: combine(format.colorize(), splat(), timestamp(), eventFormat),
    transports: [new transports.Console({ level: 'info' })],
});

winston.addColors(LogLevels.colors);

export default Logger;
