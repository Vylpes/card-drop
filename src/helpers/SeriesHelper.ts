import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import cloneDeep from "clone-deep";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarityToString } from "../constants/CardRarity";
import ImageHelper from "./ImageHelper";
import Inventory from "../database/entities/app/Inventory";

export default class SeriesHelper {
    public static async GenerateSeriesViewPage(seriesId: number, page: number, userId: string, disableColourFilter: boolean = false): Promise<{ embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder>, image: AttachmentBuilder } | null> {

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
                    .setCustomId(`series view ${seriesId} ${page - 1} ${disableColourFilter ? 1 : 0}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(`series view ${seriesId} ${page + 1} ${disableColourFilter ? 1 : 0}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == totalPages));

        const buffer = await ImageHelper.GenerateCardImageGrid(cardsOnPage.map(x => ({id: x.id, path: x.path})), userId, disableColourFilter);
        const image = new AttachmentBuilder(buffer, { name: "page.png" });

        return { embed, row, image };
    }

    public static async GenerateSeriesListPage(page: number, userId: string, unclaimedOnly: boolean = false, returnPage: number = 0): Promise<{ embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> } | null> {
        const itemsPerPage = 15;

        const userInventory = await Inventory.FetchAllByUserId(userId);
        const claimedCardIds = new Set(
            userInventory
                .filter(inv => inv.Quantity > 0)
                .map(inv => inv.CardNumber));

        let series = cloneDeep(CoreClient.Cards)
            .sort((a, b) => a.id - b.id);

        if (unclaimedOnly) {
            series = series.filter(s => s.cards.some(c => !claimedCardIds.has(c.id)));
        }

        const totalSeries = series.length;
        const totalPages = Math.ceil(totalSeries / itemsPerPage);

        if (totalPages === 0 || page >= totalPages) {
            return null;
        }

        const seriesOnPage = series.splice(page * itemsPerPage, itemsPerPage);

        const description = seriesOnPage
            .map(x => {
                const uniqueClaims = x.cards.filter(c => claimedCardIds.has(c.id)).length;

                return `[${x.id}] ${x.name} (${uniqueClaims}/${x.cards.length})`;
            })
            .join("\n");

        const filterSuffix = unclaimedOnly ? " · Unclaimed" : "";

        const embed = new EmbedBuilder()
            .setTitle(unclaimedOnly ? "Series (Unclaimed)" : "Series")
            .setColor(EmbedColours.Ok)
            .setDescription(description)
            .setFooter({ text: `${totalSeries} series · Page ${page + 1} of ${totalPages}${filterSuffix}` });

        const flag = unclaimedOnly ? 1 : 0;
        const listCustomId = (targetPage: number) =>
            unclaimedOnly
                ? `series list ${targetPage} ${flag} ${returnPage}`
                : `series list ${targetPage} ${flag}`;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(listCustomId(page - 1))
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(listCustomId(page + 1))
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == totalPages),
                unclaimedOnly
                    ? new ButtonBuilder()
                        .setCustomId(`series list ${returnPage} 0`)
                        .setLabel("Back")
                        .setStyle(ButtonStyle.Secondary)
                    : new ButtonBuilder()
                        .setCustomId(`series list 0 1 ${page}`)
                        .setLabel("Unclaimed")
                        .setStyle(ButtonStyle.Secondary));

        return { embed, row };
    }
}
