import winston, {createLogger, format, transports} from "winston";

const {combine, splat, timestamp, printf} = format;

const LogLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 2,
        debug: 3
    },
    colors: {
        error: 'bold red',
        warn: 'yellow',
        info: 'blue',
        http: "magenta",
        debug: 'green',
    }
};

/**
 * Custom winston format for logging information
 * */
const eventFormat = printf(({level, message, timestamp, ...metadata}) => {
    let msg = `${timestamp} [${level}]: ${message} `

    if (metadata && metadata.event) {
        const {pin, event, ...rest} = metadata;

        // Format the message to display timestamp, log level, lobby pin and event handler with message
        msg = `${timestamp} [${level}] [${metadata.event}]: ${message}`;

        // Append any additional metadata that was passed to the formatter
        if (Object.keys(rest).length > 0) {
            msg += ` meta=${JSON.stringify(rest)}`;
        }
    } else if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
    }

    return msg
});

const Logger = createLogger({
    level: 'info',
    levels: LogLevels.levels,
    format: combine(
        format.colorize(),
        splat(),
        timestamp(),
        eventFormat
    ),
    transports: [
        new transports.Console({ level: 'info' }),
    ]
});

winston.addColors(LogLevels.colors);

export default Logger;
