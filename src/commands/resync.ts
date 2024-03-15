import { CacheType, CommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import Config from "../database/entities/app/Config";
import CardMetadataFunction from "../Functions/CardMetadataFunction";
import AppLogger from "../client/appLogger";

export default class Resync extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("resync")
            .setDescription("Resync the card database")
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const whitelistedUsers = process.env.BOT_ADMINS!.split(",");

        if (!whitelistedUsers.find(x => x == interaction.user.id)) {
            await interaction.reply("Only whitelisted users can use this command.");
            return;
        }

        AppLogger.LogInfo("Commands/Resync", "Resyncing database");

        const result = await CardMetadataFunction.Execute(true);

        if (result) {
            if (await Config.GetValue("safemode") == "true") {
                AppLogger.LogInfo("Commands/Resync", "Resync successful, safe mode disabled");

                await Config.SetValue("safemode", "false");
                await interaction.reply("Resynced database and disabled safe mode.");

                return;
            }
            await interaction.reply("Resynced database.");
        } else {
            AppLogger.LogWarn("Commands/Resync", "Resync failed, safe mode activated");

            await interaction.reply("Resync failed, safe mode has been activated until successful resync.");
        }
    }
}