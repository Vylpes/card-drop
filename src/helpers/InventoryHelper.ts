import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarity, CardRarityToString } from "../constants/CardRarity";
import cloneDeep from "clone-deep";
import AppLogger from "../client/appLogger";

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
}

export default class InventoryHelper {
    public static async GenerateInventoryPage(username: string, userid: string, page: number): Promise<{ embed: EmbedBuilder, row: ActionRowBuilder<ButtonBuilder> }> {
        AppLogger.LogSilly("Helpers/InventoryHelper", `Parameters: username=${username}, userid=${userid}, page=${page}`);

        const cardsPerPage = 15;

        const inventory = await Inventory.FetchAllByUserId(userid);

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
            AppLogger.LogError("Helpers/InventoryHelper", "Unable to find page");
            return Promise.reject("Unable to find page");
        }

        const embed = new EmbedBuilder()
            .setTitle(username)
            .setDescription(`**${currentPage.name} (${currentPage.seriesSubpage + 1})**\n${currentPage.cards.map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)}) x${x.quantity}`).join("\n")}`)
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` })
            .setColor(EmbedColours.Ok);

        const row = new ActionRowBuilder<ButtonBuilder>()
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

        return { embed, row };
    }
}