import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import EmbedColours from "../constants/EmbedColours";
import { Command } from "../type/command";

export default class About extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('about')
            .setDescription('About Bot');
    }

    public override async execute(interaction: CommandInteraction) {
        const fundingLink = process.env.ABOUT_FUNDING;
        const repoLink = process.env.ABOUT_REPO;

        const embed = new EmbedBuilder()
            .setColor(EmbedColours.Ok)
            .setTitle("About")
            .setDescription("Discord Bot made by Vylpes");

        embed.addFields([
            {
                name: "Version",
                value: process.env.BOT_VER!,
                inline: true,
            },
            {
                name: "Author",
                value: process.env.BOT_AUTHOR!,
                inline: true,
            },
        ]);

        const row = new ActionRowBuilder<ButtonBuilder>();

        if (repoLink) {
            row.addComponents(
                new ButtonBuilder()
                    .setURL(repoLink)
                    .setLabel("Repo")
                    .setStyle(ButtonStyle.Link));
        }

        if (fundingLink) {
            row.addComponents(
                new ButtonBuilder()
                    .setURL(fundingLink)
                    .setLabel("Funding")
                    .setStyle(ButtonStyle.Link));
        }

        await interaction.reply({ embeds: [ embed ], components: row.components.length > 0 ? [ row ] : [] });
    }
}