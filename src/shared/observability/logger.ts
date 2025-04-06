import { Injectable, LoggerService } from "@nestjs/common";
import { createLogger, transports, format, Logger } from "winston";
import * as fs from "fs";
import * as winston from "winston";
import { ConfigService } from "@nestjs/config";

const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING || "FALSE";

@Injectable()
export class AppLogger implements LoggerService {
  private logger: Logger;
  private fileLoggingEnabled: string;
  private logDirectory = "nestjs-logs";
  private logFilePath = "nestjs-logs/app.log";

  constructor(private readonly namespace: string = "") {
    this.fileLoggingEnabled = ENABLE_FILE_LOGGING;
    this.setupLogger();
  }

  /**
   * Configures the logger with appropriate transports based on current settings
   */
  private setupLogger() {
    // Create log directory if file logging is enabled and directory doesn't exist
    if (
      this.fileLoggingEnabled === "TRUE" &&
      !fs.existsSync(this.logDirectory)
    ) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }

    // Define common formatting
    const commonFormat = format.combine(
      format.timestamp(),
      format.printf(({ timestamp, level, message, context, ...meta }) => {
        const namespaceStr = this.namespace ? `${this.namespace}` : "";
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : "";
        return JSON.stringify({
          timestamp,
          message,
          namespace: namespaceStr,
          context,
          meta: metaStr,
        });
      }),
    );

    // Define transports with correct typing
    const logTransports: winston.transport[] = [
      new transports.Console({
        format: format.combine(format.colorize(), commonFormat),
      }),
    ];

    // Add file transport if enabled
    if (this.fileLoggingEnabled) {
      logTransports.push(
        new transports.File({
          filename: this.logFilePath,
          format: format.combine(commonFormat, format.json()),
        }),
      );
    }

    // Create the logger
    this.logger = createLogger({
      level: "info",
      format: commonFormat,
      transports: logTransports,
    });
  }

  /**
   * Enable or disable file logging
   * @param enabled - Whether file logging should be enabled
   */
  setFileLogging(enabled: string) {
    if (this.fileLoggingEnabled !== enabled) {
      this.fileLoggingEnabled = enabled;
      this.setupLogger();
    }
  }

  /**
   * Get current file logging status
   */
  isFileLoggingEnabled(): boolean {
    return this.fileLoggingEnabled === "TRUE";
  }

  // NestJS Logger interface implementation
  log(message: any, context?: Record<string, any>) {
    this.logger.info(message, { context });
  }

  info(message: any, context?: Record<string, any>) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: Record<string, any>) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: Record<string, any>) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: Record<string, any>) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: Record<string, any>) {
    this.logger.verbose(message, { context });
  }
}
