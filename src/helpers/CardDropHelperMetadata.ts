import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { CardRarity, CardRarityToColour, CardRarityToString } from "../constants/CardRarity";
import CardRarityChances from "../constants/CardRarityChances";
import { DropResult } from "../contracts/SeriesMetadata";
import { CoreClient } from "../client/client";

export default class CardDropHelperMetadata {
    public static GetRandomCard(): DropResult | undefined {
        const randomRarity = Math.random() * 100;

        let cardRarity: CardRarity;

        const bronzeChance = CardRarityChances.Bronze;
        const silverChance = bronzeChance + CardRarityChances.Silver;
        const goldChance = silverChance + CardRarityChances.Gold;
        const mangaChance = goldChance + CardRarityChances.Manga;

        if (randomRarity < bronzeChance) cardRarity = CardRarity.Bronze;
        else if (randomRarity < silverChance) cardRarity = CardRarity.Silver;
        else if (randomRarity < goldChance) cardRarity = CardRarity.Gold;
        else if (randomRarity < mangaChance) cardRarity = CardRarity.Manga;
        else cardRarity = CardRarity.Legendary;

        const randomCard = this.GetRandomCardByRarity(cardRarity);

        return randomCard;
    }

    public static GetRandomCardByRarity(rarity: CardRarity): DropResult | undefined {
        const allCards = CoreClient.Cards
            .flatMap(x => x.cards)
            .filter(x => x.type == rarity);

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const card = allCards[randomCardIndex];
        const series = CoreClient.Cards
            .find(x => x.cards.includes(card));

        if (!series) {
            return undefined;
        }

        return {
            series: series,
            card: card,
        };
    }

    public static GenerateDropEmbed(drop: DropResult, quantityClaimed: Number, imageFileName: string): EmbedBuilder {
        let description = "";
        description += `Series: ${drop.series.name}\n`;
        description += `Claimed: ${quantityClaimed}\n`;

        return new EmbedBuilder()
            .setTitle(drop.card.name)
            .setDescription(description)
            .setFooter({ text: CardRarityToString(drop.card.type) })
            .setColor(CardRarityToColour(drop.card.type))
            .setImage(`attachment://${imageFileName}`);
    }

    public static GenerateDropButtons(drop: DropResult, claimId: string, userId: string): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim ${drop.card.id} ${claimId} ${userId}`)
                    .setLabel("Claim")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`reroll`)
                    .setLabel("Reroll")
                    .setStyle(ButtonStyle.Secondary));
    }
}