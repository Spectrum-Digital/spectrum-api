import { createLogger, transports, format } from 'winston'

const transportDefinitions = {
  file: {
    level: 'info',
    filename: 'app.log',
    dirname: './logs/',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 1,
  },
  console: {
    level: 'info',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
}

export const logger = createLogger({
  transports: [new transports.File(transportDefinitions.file), new transports.Console(transportDefinitions.console)],
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: () =>
        new Date().toLocaleString('en-US', {
          timeZone: 'Europe/Amsterdam',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        }),
    }),
    format.splat(),
    format.printf(logObject => {
      return `[${logObject.timestamp}] ${logObject.level}: ${logObject.message}`
    }),
  ),
  exitOnError: false,
})
