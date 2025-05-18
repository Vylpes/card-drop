import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { CoreClient } from "../client/client";
import AppLogger from "../client/appLogger";
import SeriesHelper from "../helpers/SeriesHelper";

export default class Series extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("series")
            .setDescription("View details on a series")
            .addSubcommand(x =>
                x
                    .setName("view")
                    .setDescription("View a specifiic series by id")
                    .addStringOption(y =>
                        y
                            .setName("id")
                            .setDescription("The series id")
                            .setRequired(true)))
            .addSubcommand(x =>
                x
                    .setName("list")
                    .setDescription("List all series")) as SlashCommandBuilder;
    }

    public override async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        switch (interaction.options.getSubcommand()) {
        case "view":
            await this.ViewSeries(interaction);
            break;
        case "list":
            await this.ListSeries(interaction);
            break;
        default:
            AppLogger.LogWarn("Commands/Series", `Subcommand doesn't exist: ${interaction.options.getSubcommand()}`);
            await interaction.reply("Subcommand doesn't exist.");
        }
    }

    private async ViewSeries(interaction: CommandInteraction) {
        const id = interaction.options.get("id");

        AppLogger.LogSilly("Commands/Series/View", `Parameters: id=${id?.value}`);

        await interaction.deferReply();

        if (!id) return;

        const series = CoreClient.Cards.find(x => x.id == id.value);

        if (!series) {
            AppLogger.LogVerbose("Commands/Series/View", "Series not found.");

            await interaction.followUp("Series not found.");
            return;
        }

        try {
            const embed = await SeriesHelper.GenerateSeriesViewPage(series.id, 0, interaction.user.id);

            await interaction.followUp({
                embeds: [ embed!.embed ],
                components: [ embed!.row ],
                files: [ embed!.image ],
            });
        } catch (e) {
            await interaction.followUp("An error has occured generating the series grid.");
            AppLogger.CatchError("Series", e);
        }
    }

    private async ListSeries(interaction: CommandInteraction) {
        const embed = SeriesHelper.GenerateSeriesListPage(0);

        await interaction.reply({ embeds: [ embed!.embed ], components: [ embed!.row ]});
    }
}
