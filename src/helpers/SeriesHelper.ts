import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import AppLogger from "../client/appLogger";
import cloneDeep from "clone-deep";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarityToString } from "../constants/CardRarity";
import ImageHelper from "./ImageHelper";

export default class SeriesHelper {
    public static async GenerateSeriesViewPage(seriesId: number, page: number, userId: string): Promise<{ embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder>, image: AttachmentBuilder } | null> {
        AppLogger.LogSilly("Helpers/SeriesHelper", `Parameters: seriesId=${seriesId}, page=${page}`);

        const itemsPerPage = 9;

        const series = cloneDeep(CoreClient.Cards)
            .find(x => x.id == seriesId);

        if (!series) {
            AppLogger.LogVerbose("Helpers/SeriesHelper", `Unable to find series: ${seriesId}`);
            return null;
        }

        const totalPages = Math.ceil(series.cards.length / itemsPerPage);
        const totalCards = series.cards.length;

        if (page > totalPages) {
            AppLogger.LogVerbose("Helpers/SeriesHelper", `Trying to find page greater than what exists for this series. Page: ${page} but there are only ${totalPages} pages`);
            return null;
        }

        const cardsOnPage = series.cards.splice(page * itemsPerPage, itemsPerPage);

        const description = cardsOnPage
            .map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)})`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setTitle(series.name)
            .setColor(EmbedColours.Ok)
            .setDescription(description)
            .setFooter({ text: `${series.id} · ${totalCards} cards · Page ${page + 1} of ${totalPages}` })
            .setImage("attachment://page.png");

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`series view ${seriesId} ${page - 1}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(`series view ${seriesId} ${page + 1}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == totalPages));

        const buffer = await ImageHelper.GenerateCardImageGrid(cardsOnPage.map(x => ({id: x.id, path: x.path})), userId);
        const image = new AttachmentBuilder(buffer, { name: "page.png" });

        return { embed, row, image };
    }

    public static GenerateSeriesListPage(page: number): { embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> } | null {
        AppLogger.LogSilly("Helpers/InventoryHelper", `Parameters: page=${page}`);

        const itemsPerPage = 15;

        const series = cloneDeep(CoreClient.Cards)
            .sort((a, b) => a.id - b.id);

        const totalPages = Math.ceil(series.length / itemsPerPage);

        if (page > totalPages) {
            AppLogger.LogVerbose("Helpers/SeriesHelper", `Trying to find page greater than what exists for this series. Page: ${page} but there are only ${totalPages} pages`);
            return null;
        }

        const seriesOnPage = series.splice(page * itemsPerPage, itemsPerPage);

        const description = seriesOnPage
            .map(x => `[${x.id}] ${x.name} (${x.cards.length} cards)`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setTitle("Series")
            .setColor(EmbedColours.Ok)
            .setDescription(description)
            .setFooter({ text: `${CoreClient.Cards.length} series · Page ${page + 1} of ${totalPages}` });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`series list ${page - 1}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(`series list ${page + 1}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == totalPages));

        return { embed, row };
    }
}
