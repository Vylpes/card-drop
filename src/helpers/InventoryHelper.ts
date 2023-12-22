import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import SeriesMetadata from "../contracts/SeriesMetadata";
import EmbedColours from "../constants/EmbedColours";
import { CardRarity, CardRarityToString } from "../constants/CardRarity";

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
        const cardsPerPage = 15;

        const inventory = await Inventory.FetchAllByUserId(userid);

        const allSeriesClaimed = CoreClient.Cards
            .sort((a, b) => a.id - b.id)
            .filter(x => {
                x.cards = x.cards
                    .sort((a, b) => b.type - a.type)
                    .filter(y => inventory.find(z => z.CardNumber == y.id));

                return x;
            });

        const pages: InventoryPage[] = [];

        for (let series of allSeriesClaimed) {
            const seriesCards = series.cards;

            for (let i = 0; i < seriesCards.length; i+= cardsPerPage) {
                const cards = series.cards.slice(i, i + cardsPerPage);
                const pageCards: InventoryPageCards[] = [];

                for (let card of cards) {
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
            console.error("Unable to find page");
            return Promise.reject("Unable to find page");
        }

        const embed = new EmbedBuilder()
            .setTitle(username)
            .setDescription(`**${currentPage.name} (${currentPage.seriesSubpage + 1})**\n${currentPage.cards.map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)}) x${x.quantity}`).join('\n')}`)
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