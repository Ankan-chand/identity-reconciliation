import winston from 'winston';

class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
  }

  info(...args: any[]) {
    this.logger.info(this.formatMessage(args));
  }

  warn(...args: any[]) {
    this.logger.warn(this.formatMessage(args));
  }

  error(...args: any[]) {
    this.logger.error(this.formatMessage(args));
  }

  debug(...args: any[]) {
    this.logger.debug(this.formatMessage(args));
  }
}

export default new Logger();
