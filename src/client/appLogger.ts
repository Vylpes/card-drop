import path from "path";
import { Logger, createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import DiscordTransport from "winston-discord-transport";

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
            transports: [],
        });

        if (process.env.DATA_DIR) {
            const logDir = path.join(process.env.DATA_DIR, "logs");

            logger.add(new DailyRotateFile({
                filename: "bot-%DATE%.log",
                dirname: logDir,
                datePattern: "YYYY-MM-DD-HH",
                maxSize: "20m",
                maxFiles: "14d",
            }));
        }

        if (outputToConsole) {
            logger.add(new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.timestamp(),
                    customFormat,
                )}));
        }

        if (process.env.BOT_LOG_DISCORD_ENABLE == "true") {
            if (process.env.BOT_LOG_DISCORD_WEBHOOK) {
                logger.add(new DiscordTransport({
                    webhook: process.env.BOT_LOG_DISCORD_WEBHOOK.toString(),
                    defaultMeta: { service: process.env.BOT_LOG_DISCORD_SERVICE },
                    level: process.env.BOT_LOG_DISCORD_LEVEL,
                }));
            } else {
                throw "BOT_LOG_DISCORD_WEBHOOK is required to enable discord logger support.";
            }
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

    public static CatchError(label: string, error: unknown) {
        if (error instanceof Error) {
            AppLogger.Logger.error({ label, message: error.message });
        } else {
            AppLogger.Logger.error({ label, message: error });
        }
    }
}
