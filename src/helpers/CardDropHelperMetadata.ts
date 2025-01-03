import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { CardRarity, CardRarityToColour, CardRarityToString, GetSacrificeAmount } from "../constants/CardRarity";
import CardRarityChances from "../constants/CardRarityChances";
import { DropResult } from "../contracts/SeriesMetadata";
import { CoreClient } from "../client/client";
import AppLogger from "../client/appLogger";
import CardConstants from "../constants/CardConstants";
import StringTools from "./StringTools";
import Inventory from "../database/entities/app/Inventory";

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

        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCard", `Random card: ${randomCard?.card.id} ${randomCard?.card.name}`);

        return randomCard;
    }

    public static GetRandomCardByRarity(rarity: CardRarity): DropResult | undefined {
        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardByRarity", `Parameters: rarity=${rarity}`);

        const allCards = CoreClient.Cards
            .flatMap(x => x.cards)
            .filter(x => x.type == rarity);

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const card = allCards[randomCardIndex];
        const series = CoreClient.Cards
            .find(x => x.cards.includes(card));

        if (!series) {
            AppLogger.LogWarn("CardDropHelperMetadata/GetRandomCardByRarity", `Series not found for card ${card.id}`);

            return undefined;
        }

        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardByRarity", `Random card: ${card.id} ${card.name}`);

        return {
            series: series,
            card: card,
        };
    }

    public static async GetRandomCardUnclaimed(userId: string): Promise<DropResult | undefined> {
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

        const randomCard = await this.GetRandomCardByRarityUnclaimed(cardRarity, userId);

        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardUnclaimed", `Random card: ${randomCard?.card.id} ${randomCard?.card.name}`);

        return randomCard;
    }

    public static async GetRandomCardByRarityUnclaimed(rarity: CardRarity, userId: string): Promise<DropResult | undefined> {
        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardByRarityUnclaimed", `Parameters: rarity=${rarity}, userId=${userId}`);

        const claimedCards = await Inventory.FetchAllByUserId(userId);

        if (!claimedCards) {
            // They don't have any cards, so safe to get any random card
            return this.GetRandomCardByRarity(rarity);
        }

        const allCards = CoreClient.Cards
            .flatMap(x => x.cards)
            .filter(x => x.type == rarity)
            .filter(x => !claimedCards.find(y => y.CardNumber == x.id));

        if (!allCards) return undefined;

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const card = allCards[randomCardIndex];
        const series = CoreClient.Cards
            .find(x => x.cards.includes(card));

        if (!series) {
            AppLogger.LogWarn("CardDropHelperMetadata/GetRandomCardByRarityUnclaimed", `Series not found for card ${card.id}`);

            return undefined;
        }

        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardByRarityUnclaimed", `Random card: ${card.id} ${card.name}`);

        return {
            series: series,
            card: card,
        };
    }

    public static GetCardByCardNumber(cardNumber: string): DropResult | undefined {
        AppLogger.LogSilly("CardDropHelperMetadata/GetCardByCardNumber", `Parameters: cardNumber=${cardNumber}`);

        const card = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id == cardNumber);

        const series = CoreClient.Cards
            .find(x => x.cards.find(y => y.id == card?.id));

        AppLogger.LogSilly("CardDropHelperMetadata/GetCardByCardNumber", `Card: ${card?.id} ${card?.name}`);
        AppLogger.LogSilly("CardDropHelperMetadata/GetCardByCardNumber", `Series: ${series?.id} ${series?.name}`);

        if (!card || !series) {
            AppLogger.LogVerbose("CardDropHelperMetadata/GetCardByCardNumber", `Unable to find card metadata: ${cardNumber}`);
            return undefined;
        }

        return { card, series };
    }

    public static GenerateDropEmbed(drop: DropResult, quantityClaimed: number, imageFileName: string, claimedBy?: string, currency?: number): EmbedBuilder {
        AppLogger.LogSilly("CardDropHelperMetadata/GenerateDropEmbed", `Parameters: drop=${drop.card.id}, quantityClaimed=${quantityClaimed}, imageFileName=${imageFileName}`);

        const description = drop.card.subseries ?? drop.series.name;
        let colour = CardRarityToColour(drop.card.type);

        if (drop.card.colour && StringTools.IsHexCode(drop.card.colour)) {
            const hexCode = Number("0x" + drop.card.colour);

            if (hexCode) {
                colour = hexCode;
            } else {
                AppLogger.LogWarn("CardDropHelperMetadata/GenerateDropEmbed", `Card's colour override is invalid: ${drop.card.id}, ${drop.card.colour}`);
            }
        } else if (drop.card.colour) {
            AppLogger.LogWarn("CardDropHelperMetadata/GenerateDropEmbed", `Card's colour override is invalid: ${drop.card.id}, ${drop.card.colour}`);
        }

        const embed = new EmbedBuilder()
            .setTitle(drop.card.name)
            .setDescription(description)
            .setFooter({ text: `${CardRarityToString(drop.card.type)} · ${drop.card.id}` })
            .setColor(colour)
            .setImage(`attachment://${imageFileName}`)
            .addFields([
                {
                    name: "Claimed",
                    value: `${quantityClaimed}`,
                    inline: true,
                }
            ]);

        if (claimedBy != null) {
            embed.addFields([
                {
                    name: "Claimed by",
                    value: claimedBy,
                    inline: true,
                }
            ]);
        }

        if (currency != null) {
            embed.addFields([
                {
                    name: "Currency",
                    value: `${currency}`,
                    inline: true,
                }
            ]);
        }

        return embed;
    }

    public static GenerateDropButtons(drop: DropResult, claimId: string, userId: string, disabled: boolean = false): ActionRowBuilder<ButtonBuilder> {
        AppLogger.LogSilly("CardDropHelperMetadata/GenerateDropButtons", `Parameters: drop=${drop.card.id}, claimId=${claimId}, userId=${userId}`);

        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim ${drop.card.id} ${claimId} ${userId}`)
                    .setLabel(`Claim (${CardConstants.ClaimCost} 🪙)`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("reroll")
                    .setLabel("Reroll")
                    .setStyle(ButtonStyle.Secondary));
    }

    public static GenerateMultidropEmbed(drop: DropResult, quantityClaimed: number, imageFileName: string, cardsRemaining: number, claimedBy?: string, currency?: number): EmbedBuilder {
        const dropEmbed = this.GenerateDropEmbed(drop, quantityClaimed, imageFileName, claimedBy, currency);

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
