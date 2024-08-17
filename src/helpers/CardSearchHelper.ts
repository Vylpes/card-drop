import {ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import Fuse from "fuse.js";
import {CoreClient} from "../client/client.js";
import CardDropHelperMetadata from "./CardDropHelperMetadata.js";
import Inventory from "../database/entities/app/Inventory.js";
import {readFileSync} from "fs";
import path from "path";
import AppLogger from "../client/appLogger.js";

interface ReturnedPage {
    embed: EmbedBuilder,
    row: ActionRowBuilder<ButtonBuilder>,
    attachment: AttachmentBuilder,
}

export default class CardSearchHelper {
    public static async GenerateSearchPage(query: string, userid: string, page: number): Promise<ReturnedPage | undefined> {
        const fzf = new Fuse(CoreClient.Cards.flatMap(x => x.cards), { keys: ["name"] });
        const entries = fzf.search(query);

        const entry = entries[page];

        if (!entry) return undefined;

        const card = CardDropHelperMetadata.GetCardByCardNumber(entry.item.id);

        if (!card) return undefined;

        let image: Buffer;
        const imageFileName = card.card.path.split("/").pop()!;

        try {
            image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.card.path));
        } catch {
            AppLogger.LogError("Commands/View", `Unable to fetch image for card ${card.card.id}.`);
            
            return undefined;
        }

        const attachment = new AttachmentBuilder(image, { name: imageFileName });
        
        const inventory = await Inventory.FetchOneByCardNumberAndUserId(userid, card.card.id);
        const quantityClaimed = inventory?.Quantity ?? 0;

        const embed = CardDropHelperMetadata.GenerateDropEmbed(card, quantityClaimed, imageFileName);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`view ${page - 1} ${query}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 0),
                new ButtonBuilder()
                    .setCustomId(`view ${page + 1} ${query}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page + 1 == entries.length));

        return { embed, row, attachment };
    }
}
