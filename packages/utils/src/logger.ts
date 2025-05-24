export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  service?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private service: string;
  private logLevel: LogLevel;

  constructor(service: string, logLevel: LogLevel = LogLevel.INFO) {
    this.service = service;
    this.logLevel = logLevel;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    if (level > this.logLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      service: this.service,
      metadata,
    };

    const logString = JSON.stringify(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.INFO:
        console.info(logString);
        break;
      case LogLevel.DEBUG:
        console.debug(logString);
        break;
    }
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  child(metadata: Record<string, any>): Logger {
    const childLogger = new Logger(this.service, this.logLevel);
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, childMetadata?: Record<string, any>) => {
      const combinedMetadata = { ...metadata, ...childMetadata };
      originalLog(level, message, combinedMetadata);
    };

    return childLogger;
  }
}

export const createLogger = (service: string, logLevel?: LogLevel) => 
  new Logger(service, logLevel);