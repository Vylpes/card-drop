import { Logger, createLogger, format, transports } from "winston";

export default class AppLogger {
    public static Logger: Logger;

    public static InitialiseLogger(logLevel: string, outputToConsole: boolean) {
        const customFormat = format.printf(({ level, message, timestamp, label }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        });

        const logger = createLogger({
            level: logLevel,
            format: format.combine(
                format.timestamp({
                    format: "YYYY-MM-DD HH:mm:ss"
                }),
                format.errors({ stack: true }),
                format.splat(),
                customFormat,
            ),
            defaultMeta: { service: "bot" },
            transports: [
                new transports.File({ filename: "error.log", level: "error" }),
                new transports.File({ filename: "combined.log" }),
            ],
        });

        if (outputToConsole) {
            logger.add(new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.timestamp(),
                    customFormat,
                )}));
        }

        AppLogger.Logger = logger;

        AppLogger.LogInfo("AppLogger", `Log Level: ${logLevel}`);
    }

    public static LogError(label: string, message: string) {
        AppLogger.Logger.error({ label, message });
    }

    public static LogWarn(label: string, message: string) {
        AppLogger.Logger.warn({ label, message });
    }

    public static LogInfo(label: string, message: string) {
        AppLogger.Logger.info({ label, message });
    }

    public static LogVerbose(label: string, message: string) {
        AppLogger.Logger.verbose({ label, message });
    }

    public static LogDebug(label: string, message: string) {
        AppLogger.Logger.debug({ label, message });
    }

    public static LogSilly(label: string, message: string) {
        AppLogger.Logger.silly({ label, message });
    }
}