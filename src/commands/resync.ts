import { CacheType, CommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import Config from "../database/entities/app/Config";
import CardMetadataFunction from "../Functions/CardMetadataFunction";

export default class Resync extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('resync')
            .setDescription('Resync the card database')
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const whitelistedUsers = process.env.GDRIVESYNC_WHITELIST!.split(',');

        if (!whitelistedUsers.find(x => x == interaction.user.id)) {
            await interaction.reply("Only whitelisted users can use this command.");
            return;
        }

        let result = await CardMetadataFunction.Execute(true);

        if (result) {
            if (await Config.GetValue('safemode') == "true") {
                await Config.SetValue('safemode', 'false');
                await interaction.reply("Resynced database and disabled safe mode.");

                return;
            }
            await interaction.reply("Resynced database.");
        } else {
            await interaction.reply("Resync failed, safe mode has been activated until successful resync.");
        }
    }
}