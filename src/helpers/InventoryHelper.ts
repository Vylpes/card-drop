import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarity, CardRarityToString } from "../constants/CardRarity";
import cloneDeep from "clone-deep";
import AppLogger from "../client/appLogger";
import ImageHelper from "./ImageHelper";

interface InventoryPage {
    id: number,
    name: string,
    cards: InventoryPageCards[],
    seriesSubpage: number,
}

interface InventoryPageCards {
    id: string,
    name: string,
    type: CardRarity,
    quantity: number,
    path: string,
}

interface ReturnedInventoryPage {
    embed: EmbedBuilder,
    row1: ActionRowBuilder<ButtonBuilder>,
    row2: ActionRowBuilder<StringSelectMenuBuilder>,
    image: AttachmentBuilder,
}

export type InventorySortBy = "id" | "name" | "type";
type SortableCard = {
    id: string,
    name: string,
    type: CardRarity,
};
type UserInventoryItem = {
    CardNumber: string,
    Quantity: number,
};

export default class InventoryHelper {
    public static ParseSortBy(sortBy?: string): InventorySortBy {
        if (sortBy == "name" || sortBy == "type") {
            return sortBy;
        }

        return "id";
    }

    public static async GenerateInventoryPage(username: string, userid: string, page: number, sortBy: InventorySortBy = "id"): Promise<ReturnedInventoryPage | undefined> {
        AppLogger.LogSilly("Helpers/InventoryHelper", `Parameters: username=${username}, userid=${userid}, page=${page}, sortBy=${sortBy}`);

        const cardsPerPage = 9;

        const inventory = await Inventory.FetchAllByUserId(userid) as UserInventoryItem[];

        if (!inventory || inventory.length == 0) return undefined;

        const clientCards = cloneDeep(CoreClient.Cards);
        clientCards.sort((a, b) => a.id - b.id);

        const allSeriesClaimed = this.GetClaimedSeries(clientCards, inventory, sortBy);
        const pages = this.GeneratePages(allSeriesClaimed, inventory, cardsPerPage);
        const currentPage = pages[page];

        if (!currentPage) {
            return undefined;
        }

        const currentPageDescription = currentPage.cards
            .map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)}) x${x.quantity}`)
            .join("\n");
        const description = `**${currentPage.name} (${currentPage.seriesSubpage + 1})**\n${currentPageDescription}`;

        const embed = new EmbedBuilder()
            .setTitle(username)
            .setDescription(description)
            .setFooter({ text: `Page ${page + 1} of ${pages.length} · By ${sortBy.toUpperCase()}` })
            .setColor(EmbedColours.Ok)
            .setImage("attachment://page.png");

        const row1 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`inventory ${userid} ${page - 1} ${sortBy}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(`inventory ${userid} ${page + 1} ${sortBy}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == pages.length));

        const pageOptions = this.GetPageOptions(pages, currentPage, userid, sortBy);

        const row2 = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("inventory")
                    .setPlaceholder(`${currentPage.name} (${currentPage.seriesSubpage + 1})`)
                    .addOptions(pageOptions));

        const buffer = await ImageHelper.GenerateCardImageGrid(currentPage.cards.map(x => ({ id: x.id, path: x.path })));
        const image = new AttachmentBuilder(buffer, { name: "page.png" });

        return { embed, row1, row2, image };
    }

    private static GetClaimedSeries(clientCards: typeof CoreClient.Cards, inventory: UserInventoryItem[], sortBy: InventorySortBy): typeof CoreClient.Cards {
        return clientCards.filter(series => {
            series.cards = series.cards
                .filter(card => {
                    const inventoryItem = inventory.find(x => x.CardNumber == card.id);

                    return !!inventoryItem && inventoryItem.Quantity > 0;
                });

            series.cards.sort((a, b) => this.GetSortValue(a, b, sortBy));

            return series;
        });
    }

    private static GeneratePages(allSeriesClaimed: typeof CoreClient.Cards, inventory: UserInventoryItem[], cardsPerPage: number): InventoryPage[] {
        const pages: InventoryPage[] = [];

        for (const series of allSeriesClaimed) {
            for (let i = 0; i < series.cards.length; i+= cardsPerPage) {
                const cards = series.cards.slice(i, i + cardsPerPage);
                const pageCards = cards
                    .map(card => {
                        const item = inventory.find(x => x.CardNumber == card.id);

                        if (!item) {
                            return undefined;
                        }

                        return {
                            id: card.id,
                            name: card.name,
                            type: card.type,
                            quantity: item.Quantity,
                            path: card.path,
                        } as InventoryPageCards;
                    })
                    .filter((card): card is InventoryPageCards => !!card);

                pages.push({
                    id: series.id,
                    name: series.name,
                    cards: pageCards,
                    seriesSubpage: i / cardsPerPage,
                });
            }
        }

        return pages;
    }

    private static GetPageOptions(pages: InventoryPage[], currentPage: InventoryPage, userid: string, sortBy: InventorySortBy): StringSelectMenuOptionBuilder[] {
        let pageNum = 0;
        const maxLength = 25;

        const allPageOptions = pages.map((x, index) =>
            new StringSelectMenuOptionBuilder()
                .setLabel(`${x.name} (${x.seriesSubpage + 1})`.substring(0, 100))
                .setDescription(`Page ${pageNum + 1}`)
                .setDefault(index == pages.indexOf(currentPage))
                .setValue(`${userid} ${pageNum++} ${sortBy}`));

        const currentPageIndex = allPageOptions.findIndex(x => x.data.default);

        if (allPageOptions.length <= maxLength) {
            return allPageOptions;
        }

        let startIndex = currentPageIndex - Math.floor((maxLength - 1) / 2);
        let endIndexOffset = 0;

        if (startIndex < 0) {
            endIndexOffset = 0 - startIndex;
            startIndex = 0;
        }

        let endIndex = currentPageIndex + Math.floor((maxLength - 1) / 2) + endIndexOffset;

        if (endIndex + 1 > allPageOptions.length) {
            endIndex = allPageOptions.length;
        }

        const pageOptions: StringSelectMenuOptionBuilder[] = [];

        for (let i = startIndex; i < endIndex; i++) {
            pageOptions.push(allPageOptions[i]);
        }

        return pageOptions;
    }

    private static GetSortValue(a: SortableCard, b: SortableCard, sortBy: InventorySortBy): number {
        switch (sortBy) {
        case "name":
            return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
        case "type":
            return a.type - b.type || a.id.localeCompare(b.id);
        case "id":
        default:
            return a.id.localeCompare(b.id);
        }
    }
}
