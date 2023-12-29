import { CacheType, CommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { ExecException, exec } from "child_process";
import { CoreClient } from "../client/client";
import Config from "../database/entities/app/Config";
import CardMetadataFunction from "../Functions/CardMetadataFunction";

export default class Gdrivesync extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('gdrivesync')
            .setDescription('Sync google drive to the bot')
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const whitelistedUsers = process.env.GDRIVESYNC_WHITELIST!.split(',');

        if (!whitelistedUsers.find(x => x == interaction.user.id)) {
            await interaction.reply("Only whitelisted users can use this command.");
            return;
        }

        await interaction.reply('Syncing, this might take a while...');

        CoreClient.AllowDrops = false;

        exec(`rclone sync card-drop-gdrive: ${process.env.DATA_DIR}/cards`, async (error: ExecException | null) => {
            if (error) {
                await interaction.editReply(`Error while running sync command. Safe Mode has been activated. Code: ${error.code}`);
                await Config.SetValue('safemode', 'true');
            } else {
                await CardMetadataFunction.Execute();

                await interaction.editReply('Synced successfully.');

                CoreClient.AllowDrops = true;
                await Config.SetValue('safemode', 'false');
            }
        });
    }
}