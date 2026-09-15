import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { DropResult } from "../../contracts/SeriesMetadata";
import { GetSacrificeAmount } from "../../constants/CardRarity";
import DropEmbedHelper from "./DropEmbedHelper";
import EmbedColours from "../../constants/EmbedColours";
import GetCardsHelper from "./GetCardsHelper";

export default class MultidropEmbedHelper {
    public static GenerateMultidropEmbed(drop: DropResult, quantityClaimed: number, imageFileName: string, cardsRemaining: number, claimedBy?: string, currency?: number): EmbedBuilder {
        const dropEmbed = DropEmbedHelper.GenerateDropEmbed(drop, quantityClaimed, imageFileName, claimedBy, currency);

        dropEmbed.setFooter({ text: `${dropEmbed.data.footer?.text} · ${cardsRemaining} Remaining`});

        return dropEmbed;
    }

    public static GenerateMultidropButtons(drop: DropResult, cardsRemaining: number, multidropId: string, disabled = false): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`multidrop keep ${drop.card.id} ${cardsRemaining} ${multidropId}`)
                    .setLabel("Keep")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId(`multidrop sacrifice ${drop.card.id} ${cardsRemaining} ${multidropId}`)
                    .setLabel(`Sacrifice (+${GetSacrificeAmount(drop.card.type)} 🪙)`)
                    .setStyle(ButtonStyle.Secondary));
    }

    public static GenerateSummaryEmbed(cardsKept: string[], cardsSacrificed: string[], currency: number): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle("Multidrop Summary")
            .setDescription("Your multidrop has finished!")
            .setColor(EmbedColours.Ok)
            .addFields([
                {
                    name: "Kept",
                    value: this.FormatCards(cardsKept),
                    inline: true,
                },
                {
                    name: "Sacrificed",
                    value: this.FormatCards(cardsSacrificed),
                    inline: true,
                },
                {
                    name: "New Balance",
                    value: `${currency} 🪙`,
                },
            ]);
    }

    private static FormatCards(cards: string[]): string {
        return cards.length > 0
            ? cards.map(cardNumber => {
                const card = GetCardsHelper.GetCardByCardNumber(cardNumber);

                return card
                    ? `• ${card.card.name} (${cardNumber})`
                    : `• ${cardNumber}`;
            }).join("\n")
            : "None";
    }
}
