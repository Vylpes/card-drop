import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { DropResult } from "../../contracts/SeriesMetadata";
import { GetSacrificeAmount } from "../../constants/CardRarity";
import DropEmbedHelper from "./DropEmbedHelper";

export default class MultidropEmbedHelper {
    public static GenerateMultidropEmbed(drop: DropResult, quantityClaimed: number, imageFileName: string, cardsRemaining: number, claimedBy?: string, currency?: number): EmbedBuilder {
        const dropEmbed = DropEmbedHelper.GenerateDropEmbed(drop, quantityClaimed, imageFileName, claimedBy, currency);

        dropEmbed.setFooter({ text: `${dropEmbed.data.footer?.text} · ${cardsRemaining} Remaining`});

        return dropEmbed;
    }

    public static GenerateMultidropButtons(drop: DropResult, cardsRemaining: number, userId: string, disabled = false): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`multidrop keep ${drop.card.id} ${cardsRemaining} ${userId}`)
                    .setLabel("Keep")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId(`multidrop sacrifice ${drop.card.id} ${cardsRemaining} ${userId}`)
                    .setLabel(`Sacrifice (+${GetSacrificeAmount(drop.card.type)} 🪙)`)
                    .setStyle(ButtonStyle.Secondary));
    }
}
