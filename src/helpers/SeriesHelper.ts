import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import cloneDeep from "clone-deep";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarityToString } from "../constants/CardRarity";
import ImageHelper from "./ImageHelper";
import Inventory from "../database/entities/app/Inventory";

export default class SeriesHelper {
    public static async GenerateSeriesViewPage(seriesId: number, page: number, userId: string): Promise<{ embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder>, image: AttachmentBuilder } | null> {
        const itemsPerPage = 9;

        const series = cloneDeep(CoreClient.Cards)
            .find(x => x.id == seriesId);

        if (!series) {
            return null;
        }

        const totalPages = Math.ceil(series.cards.length / itemsPerPage);
        const totalCards = series.cards.length;

        if (page > totalPages) {
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

    public static async GenerateSeriesListPage(page: number, userId: string): Promise<{ embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> } | null> {
        const itemsPerPage = 15;

        const series = cloneDeep(CoreClient.Cards)
            .sort((a, b) => a.id - b.id);

        const totalPages = Math.ceil(series.length / itemsPerPage);

        if (page > totalPages) {
            return null;
        }

        const seriesOnPage = series.splice(page * itemsPerPage, itemsPerPage);

        const userInventory = await Inventory.FetchAllByUserId(userId);
        
        const description = seriesOnPage
            .map(x => {
                const uniqueClaims = userInventory.filter(inv => {
                    const cardIds = x.cards.map(c => c.id);
                    return cardIds.includes(inv.CardNumber);
                }).length;
                
                return `[${x.id}] ${x.name} (${uniqueClaims}/${x.cards.length})`;
            })
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
