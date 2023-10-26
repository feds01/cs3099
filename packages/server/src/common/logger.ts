import winston, { createLogger, format, transports } from 'winston';

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
const eventFormat = format.printf(
    ({ level, message, timestamp }) => `${String(timestamp)} [${level}]: ${message} `,
);

const Logger = createLogger({
    level: 'info',
    levels: LogLevels.levels,
    format: format.combine(format.colorize(), format.splat(), format.timestamp(), eventFormat),
    transports: [new transports.Console({ level: 'info' })],
});

winston.addColors(LogLevels.colors);

export default Logger;
