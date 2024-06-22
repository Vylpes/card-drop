import { Logger, createLogger, format, transports } from "winston";
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
            transports: [
                new transports.File({ filename: "priority.log", level: "warn" }),
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
}