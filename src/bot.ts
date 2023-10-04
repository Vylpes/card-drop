import * as dotenv from "dotenv";
import { CoreClient } from "./client/client";
import { IntentsBitField } from "discord.js";
import Registry from "./registry";

dotenv.config();

const requiredConfigs: string[] = [
    "BOT_TOKEN",
    "BOT_VER",
    "BOT_AUTHOR",
    "BOT_OWNERID",
    "BOT_CLIENTID",
    "BOT_ENV",
    "DB_HOST",
    "DB_PORT",
    "DB_AUTH_USER",
    "DB_AUTH_PASS",
    "DB_SYNC",
    "DB_LOGGING",
    "CARD_FOLDER",
]

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

client.start();