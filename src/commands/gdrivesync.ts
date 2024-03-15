import { CacheType, CommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { ExecException, exec } from "child_process";
import { CoreClient } from "../client/client";
import Config from "../database/entities/app/Config";
import CardMetadataFunction from "../Functions/CardMetadataFunction";
import AppLogger from "../client/appLogger";

export default class Gdrivesync extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("gdrivesync")
            .setDescription("Sync google drive to the bot")
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const whitelistedUsers = process.env.BOT_ADMINS!.split(",");

        if (!whitelistedUsers.find(x => x == interaction.user.id)) {
            await interaction.reply("Only whitelisted users can use this command.");
            return;
        }

        await interaction.reply({
            content: "Syncing, this might take a while...",
            ephemeral: true,
        });

        CoreClient.AllowDrops = false;

        AppLogger.LogInfo("Commands/GDriveSync", "Syncing google drive to the bot");

        exec(`rclone sync card-drop-gdrive: ${process.env.DATA_DIR}/cards`, async (error: ExecException | null) => {
            if (error) {
                AppLogger.LogError("Commands/GDriveSync", `Error while running sync command: ${error.code}, ${error.message}`);
                AppLogger.LogWarn("Commands/GDriveSync", "Safe mode activated");

                await interaction.editReply(`Error while running sync command. Safe Mode has been activated. Code: ${error.code}`);
                await Config.SetValue("safemode", "true");
            } else {
                const result = await CardMetadataFunction.Execute(true);

                if (result.IsSuccess) {
                    AppLogger.LogInfo("Commands/GDriveSync", "Synced successfully");

                    await interaction.editReply("Synced successfully.");

                    CoreClient.AllowDrops = true;
                    await Config.SetValue("safemode", "false");
                } else {
                    AppLogger.LogError("Commands/GDriveSync", `Error while running sync command: ${result.ErrorMessage}`);

                    await interaction.editReply(`Sync failed \`\`\`${result.ErrorMessage}\`\`\``);
                }
            }
        });
    }
}