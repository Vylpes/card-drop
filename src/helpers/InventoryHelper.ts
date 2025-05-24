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


export default class InventoryHelper {
    public static async GenerateInventoryPage(username: string, userid: string, page: number): Promise<ReturnedInventoryPage | undefined> {
        AppLogger.LogSilly("Helpers/InventoryHelper", `Parameters: username=${username}, userid=${userid}, page=${page}`);

        const cardsPerPage = 9;

        const inventory = await Inventory.FetchAllByUserId(userid);

        if (!inventory || inventory.length == 0) return undefined;

        const clientCards = cloneDeep(CoreClient.Cards);

        const allSeriesClaimed = clientCards
            .sort((a, b) => a.id - b.id)
            .filter(x => {
                x.cards = x.cards
                    .sort((a, b) => b.type - a.type)
                    .filter(y => inventory.find(z => z.CardNumber == y.id))
                    .filter(y => inventory.find(z => z.CardNumber == y.id)!.Quantity > 0);

                return x;
            });

        const pages: InventoryPage[] = [];

        for (const series of allSeriesClaimed) {
            const seriesCards = series.cards;

            for (let i = 0; i < seriesCards.length; i+= cardsPerPage) {
                const cards = series.cards.slice(i, i + cardsPerPage);
                const pageCards: InventoryPageCards[] = [];

                for (const card of cards) {
                    const item = inventory.find(x => x.CardNumber == card.id);

                    if (!item) {
                        continue;
                    }

                    pageCards.push({
                        id: card.id,
                        name: card.name,
                        type: card.type,
                        quantity: item.Quantity,
                        path: card.path,
                    });
                }

                pages.push({
                    id: series.id,
                    name: series.name,
                    cards: pageCards,
                    seriesSubpage: i / cardsPerPage,
                });
            }
        }

        const currentPage = pages[page];

        if (!currentPage) {
            return undefined;
        }

        const embed = new EmbedBuilder()
            .setTitle(username)
            .setDescription(`**${currentPage.name} (${currentPage.seriesSubpage + 1})**\n${currentPage.cards.map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)}) x${x.quantity}`).join("\n")}`)
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` })
            .setColor(EmbedColours.Ok)
            .setImage("attachment://page.png");

        const row1 = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`inventory ${userid} ${page - 1}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(`inventory ${userid} ${page + 1}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == pages.length));

        let pageNum = 0;

        const maxLength = 25; // Discord API limit

        const allPageOptions = pages.map(x =>
            new StringSelectMenuOptionBuilder()
                .setLabel(`${x.name} (${x.seriesSubpage + 1})`.substring(0, 100))
                .setDescription(`Page ${pageNum + 1}`)
                .setDefault(currentPage.id == x.id)
                .setValue(`${userid} ${pageNum++}`));

        const currentPageIndex = allPageOptions.indexOf(allPageOptions.find(x => x.data.default)!);

        let pageOptions: StringSelectMenuOptionBuilder[] = [];

        if (allPageOptions.length <= maxLength) {
            pageOptions = allPageOptions;
        } else {
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

            for (let i = startIndex; i < endIndex; i++) {
                pageOptions.push(allPageOptions[i]);
            }
        }

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
}
