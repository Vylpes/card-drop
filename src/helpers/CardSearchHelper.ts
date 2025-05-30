import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import Fuse from "fuse.js";
import {CoreClient} from "../client/client.js";
import Inventory from "../database/entities/app/Inventory.js";
import {readFileSync} from "fs";
import path from "path";
import AppLogger from "../client/appLogger.js";
import GetCardsHelper from "./DropHelpers/GetCardsHelper.js";
import DropEmbedHelper from "./DropHelpers/DropEmbedHelper.js";

interface ReturnedPage {
    embed: EmbedBuilder,
    row: ActionRowBuilder<ButtonBuilder>,
    attachments: AttachmentBuilder[],
    results: string[],
}

export default class CardSearchHelper {
    public static async GenerateSearchQuery(query: string, userid: string, pages: number): Promise<ReturnedPage | undefined> {
        AppLogger.LogSilly("CardSearchHelper/GenerateSearchQuery", `Parameters: query=${query}, userid=${userid}, pages=${pages}`);

        const fzf = new Fuse(CoreClient.Cards.flatMap(x => x.cards), { keys: ["name"] });
        const entries = fzf.search(query)
            .splice(0, pages);

        const entry = entries[0];
        const results = entries
            .flatMap(x => x.item.id);

        if (!entry) {
            AppLogger.LogVerbose("CardSearchHelper/GenerateSearchQuery", `Unable to find entry: ${query}`);

            return undefined;
        }

        const card = GetCardsHelper.GetCardByCardNumber(entry.item.id);

        if (!card) return undefined;

        const attachments = [];
        let imageFileName = "";

        if (!(card.card.path.startsWith("http://") || card.card.path.startsWith("https://"))) {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.card.path));
            imageFileName = card.card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            attachments.push(attachment);
        }

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(userid, card.card.id);
        const quantityClaimed = inventory?.Quantity ?? 0;

        const embed = DropEmbedHelper.GenerateDropEmbed(card, quantityClaimed, imageFileName);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`view 0 ${results.join(" ")}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`view 2 ${results.join(" ")}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pages == 1));

        return { embed, row, attachments, results };
    }

    public static async GenerateSearchPageFromQuery(results: string[], userid: string, page: number): Promise<ReturnedPage | undefined> {
        const currentPageId = results[page - 1];

        const card = GetCardsHelper.GetCardByCardNumber(currentPageId);

        if (!card) {
            AppLogger.LogError("CardSearchHelper/GenerateSearchPageFromQuery", `Unable to find card by id: ${currentPageId}.`);

            return undefined;
        }

        const attachments = [];
        let imageFileName = "";

        if (!(card.card.path.startsWith("http://") || card.card.path.startsWith("https://"))) {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.card.path));
            imageFileName = card.card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            attachments.push(attachment);
        }

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(userid, card.card.id);
        const quantityClaimed = inventory?.Quantity ?? 0;

        const embed = DropEmbedHelper.GenerateDropEmbed(card, quantityClaimed, imageFileName);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`view ${page - 1} ${results.join(" ")}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page - 1 == 0),
                new ButtonBuilder()
                    .setCustomId(`view ${page + 1} ${results.join(" ")}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == results.length));

        return { embed, row, attachments, results };
    }
}
