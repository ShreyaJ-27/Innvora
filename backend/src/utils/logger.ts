export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private readonly serviceName: string;

  constructor(serviceName = 'stockpulse-backend') {
    this.serviceName = serviceName;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const payload = context ? JSON.stringify(context) : '{}';
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      context: payload
    });
  }

  debug(message: string, context?: LogContext): void {
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }
}

export const logger = new Logger();
export const createLogger = (serviceName: string): Logger => new Logger(serviceName);
