import * as dotenv from "dotenv";
import { CoreClient } from "./client/client";
import { IntentsBitField } from "discord.js";
import Registry from "./registry";
import { existsSync } from "fs";
import { ExecException, exec } from "child_process";

dotenv.config();

const requiredConfigs: string[] = [
    "BOT_TOKEN",
    "BOT_VER",
    "BOT_AUTHOR",
    "BOT_OWNERID",
    "BOT_CLIENTID",
    "BOT_ENV",
    "BOT_ADMINS",
    "DATA_DIR",
    "DB_HOST",
    "DB_PORT",
    "DB_AUTH_USER",
    "DB_AUTH_PASS",
    "DB_SYNC",
    "DB_LOGGING",
    "EXPRESS_PORT",
];

requiredConfigs.forEach(config => {
    if (!process.env[config]) {
        throw `${config} is required in .env`;
    }
});

const client = new CoreClient([
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
]);

Registry.RegisterCommands();
Registry.RegisterEvents();
Registry.RegisterButtonEvents();

if (!existsSync(`${process.env.DATA_DIR}/cards`) && process.env.GDRIVESYNC_AUTO && process.env.GDRIVESYNC_AUTO == "true") {
    console.log("Card directory not found, syncing...");

    CoreClient.AllowDrops = false;

    exec(`rclone sync card-drop-gdrive: ${process.cwd()}/cards`, async (error: ExecException | null) => {
        if (error) {
            console.error(error.code);
            throw `Error while running sync command. Code: ${error.code}`;
        } else {
            console.log("Synced successfully.");
            CoreClient.AllowDrops = true;
        }
    });
}

client.start();