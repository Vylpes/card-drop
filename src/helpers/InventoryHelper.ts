import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import { CardRarity, CardRarityToString } from "../constants/CardRarity";
import cloneDeep from "clone-deep";
import AppLogger from "../client/appLogger";
import { createCanvas, loadImage } from "canvas";
import path from "path";

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
    row: ActionRowBuilder<ButtonBuilder>,
    image: AttachmentBuilder,
}


export default class InventoryHelper {
    public static async GenerateInventoryPage(username: string, userid: string, page: number): Promise<ReturnedInventoryPage> {
        AppLogger.LogSilly("Helpers/InventoryHelper", `Parameters: username=${username}, userid=${userid}, page=${page}`);

        const cardsPerPage = 9;

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
            AppLogger.LogError("Helpers/InventoryHelper", "Unable to find page");
            return Promise.reject("Unable to find page");
        }

        const embed = new EmbedBuilder()
            .setTitle(username)
            .setDescription(`**${currentPage.name} (${currentPage.seriesSubpage + 1})**\n${currentPage.cards.map(x => `[${x.id}] ${x.name} (${CardRarityToString(x.type)}) x${x.quantity}`).join("\n")}`)
            .setFooter({ text: `Page ${page + 1} of ${pages.length}` })
            .setColor(EmbedColours.Ok)
            .setImage("attachment://page.png");

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

        const buffer = await this.GenerateInventoryImage(currentPage);
        const image = new AttachmentBuilder(buffer, { name: "page.png" });

        return { embed, row, image };
    }

    private static async GenerateInventoryImage(page: InventoryPage): Promise<Buffer> {
        const gridWidth = 3;
        const gridHeight = Math.ceil(page.cards.length / gridWidth);

        const imageWidth = 526;
        const imageHeight = 712;
        
        const canvasWidth = imageWidth * gridWidth;
        const canvasHeight = imageHeight * gridHeight; 

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < page.cards.length; i++) {
            const card = page.cards[i];

            const image = await loadImage(path.join(process.env.DATA_DIR!, "cards", card.path));

            if (!image) {
                AppLogger.LogError("InventoryHelper/GenerateInventoryImage", `Failed to load image for card ${card.id}`);
                continue;
            }

            const x = i % gridWidth;
            const y = Math.floor(i / gridWidth);

            const imageX = imageWidth * x;
            const imageY = imageHeight * y;

            ctx.drawImage(image, imageX, imageY);
        }

        return canvas.toBuffer();
    }
}
