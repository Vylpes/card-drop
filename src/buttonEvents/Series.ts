import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import AppLogger from "../client/appLogger";
import SeriesHelper from "../helpers/SeriesHelper";

export default class Series extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const subaction = interaction.customId.split(" ")[1];

        switch(subaction) {
        case "view":
            await this.ViewSeries(interaction);
            break;
        case "list":
            await this.ListSeries(interaction);
            break;
        default:
            AppLogger.LogWarn("Commands/Series", `Subaction doesn't exist: ${subaction}`);
            interaction.reply("Subaction doesn't exist.");
        }
    }

    private async ViewSeries(interaction: ButtonInteraction) {
        const seriesid = interaction.customId.split(" ")[2];
        const page = interaction.customId.split(" ")[3];

        const embed = SeriesHelper.GenerateSeriesViewPage(Number(seriesid), Number(page));

        await interaction.update({
            embeds: [ embed!.embed ],
            components: [ embed!.row ],
        });
    }

    private async ListSeries(interaction: ButtonInteraction) {
        const page = interaction.customId.split(" ")[2];

        const embed = SeriesHelper.GenerateSeriesListPage(Number(page));

        await interaction.update({
            embeds: [ embed!.embed ],
            components: [ embed!.row ],
        });
    }
}