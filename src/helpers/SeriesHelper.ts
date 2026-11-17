import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import cloneDeep from "clone-deep";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarityToString } from "../constants/CardRarity";
import ImageHelper from "./ImageHelper";
import Inventory from "../database/entities/app/Inventory";

export default class SeriesHelper {
    /** Card numbers the user owns at least one of (Quantity > 0). */
    public static ClaimedCardIdsFromInventory(userInventory: Inventory[]): Set<string> {
        return new Set(
            userInventory
                .filter(inv => inv.Quantity > 0)
                .map(inv => inv.CardNumber));
    }

    /**
     * Per-series completion percent matching `/series list` (owned/total) lines:
     * owned = unique series cards present in claimed set; total = series.cards.length.
     * total = 0 → 0%.
     */
    public static SeriesCompletionPercent(
        seriesCards: { id: string }[],
        claimedCardIds: Set<string>,
    ): number {
        const total = seriesCards.length;
        if (total === 0) {
            return 0;
        }

        const owned = seriesCards.filter(c => claimedCardIds.has(c.id)).length;
        return Math.round(100 * owned / total);
    }

    /**
     * Catalog-wide completion for `/series list`: aggregate the same per-series
     * (owned/total) semantics across every series in CoreClient.Cards.
     * total = 0 → 0%.
     */
    public static CatalogCompletion(
        allSeries: { cards: { id: string }[] }[],
        claimedCardIds: Set<string>,
    ): { owned: number; total: number; percent: number } {
        let owned = 0;
        let total = 0;

        for (const series of allSeries) {
            total += series.cards.length;
            owned += series.cards.filter(c => claimedCardIds.has(c.id)).length;
        }

        const percent = total === 0 ? 0 : Math.round(100 * owned / total);
        return { owned, total, percent };
    }

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

        const userInventory = await Inventory.FetchAllByUserId(userId);
        const claimedCardIds = SeriesHelper.ClaimedCardIdsFromInventory(userInventory);
        const completionPercent = SeriesHelper.SeriesCompletionPercent(series.cards, claimedCardIds);

        const cardsOnPage = series.cards.splice(page * itemsPerPage, itemsPerPage);

        const description = cardsOnPage
            .map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)})`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setTitle(`${series.name} · ${completionPercent}% complete`)
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
        const claimedCardIds = SeriesHelper.ClaimedCardIdsFromInventory(userInventory);

        const allSeries = cloneDeep(CoreClient.Cards)
            .sort((a, b) => a.id - b.id);
        const catalog = SeriesHelper.CatalogCompletion(allSeries, claimedCardIds);

        let series = allSeries;

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
        const titleBase = unclaimedOnly ? "Series (Unclaimed)" : "Series";

        const embed = new EmbedBuilder()
            .setTitle(`${titleBase} · ${catalog.percent}% complete`)
            .setColor(EmbedColours.Ok)
            .setDescription(description)
            .setFooter({ text: `${catalog.owned}/${catalog.total} cards · ${totalSeries} series · Page ${page + 1} of ${totalPages}${filterSuffix}` });

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
