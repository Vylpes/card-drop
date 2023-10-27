import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { CardRarity, CardRarityToColour, CardRarityToString } from "../constants/CardRarity";
import Card from "../database/entities/card/Card";

export default class CardDropHelper {
    public static async GetRandomCard(): Promise<Card> {
        const randomRarity = Math.random() * 100;

        let cardRarity: CardRarity;

        const bronzeChance = 62;
        const silverChance = bronzeChance + 31;
        const goldChance = silverChance + 6.4;

        if (randomRarity < bronzeChance) cardRarity = CardRarity.Bronze;
        else if (randomRarity < silverChance) cardRarity = CardRarity.Silver;
        else if (randomRarity < goldChance) cardRarity = CardRarity.Gold;
        else cardRarity = CardRarity.Legendary;

        const randomCard = await this.GetRandomCardByRarity(cardRarity);

        return randomCard;
    }

    public static async GetRandomCardByRarity(rarity: CardRarity): Promise<Card> {
        const allCards = await Card.FetchAllByRarity(rarity, [ "Series" ]);

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const card = allCards[randomCardIndex];

        return card;
    }

    public static GenerateDropEmbed(card: Card, quantityClaimed: Number): EmbedBuilder {
        let description = "";
        description += `Series: ${card.Series.Name}\n`;
        description += `Claimed: ${quantityClaimed}\n`;

        return new EmbedBuilder()
            .setTitle(card.Name)
            .setDescription(description)
            .setFooter({ text: CardRarityToString(card.Rarity) })
            .setColor(CardRarityToColour(card.Rarity))
            .setImage(`attachment://${card.FileName}`);
    }

    public static GenerateDropButtons(card: Card, claimId: string, userId: string): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim ${card.CardNumber} ${claimId} ${userId}`)
                    .setLabel("Claim")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`reroll`)
                    .setLabel("Reroll")
                    .setStyle(ButtonStyle.Secondary));
    }
}