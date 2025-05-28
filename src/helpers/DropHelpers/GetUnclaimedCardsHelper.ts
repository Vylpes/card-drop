import AppLogger from "../../client/appLogger";
import { CoreClient } from "../../client/client";
import { CardRarity } from "../../constants/CardRarity";
import CardRarityChances from "../../constants/CardRarityChances";
import { DropResult } from "../../contracts/SeriesMetadata";
import Inventory from "../../database/entities/app/Inventory";
import GetCardsHelper from "./GetCardsHelper";

export default class GetUnclaimedCardsHelper {
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

        return randomCard;
    }

    public static async GetRandomCardByRarityUnclaimed(rarity: CardRarity, userId: string): Promise<DropResult | undefined> {
        const claimedCards = await Inventory.FetchAllByUserId(userId);

        if (!claimedCards || claimedCards.length == 0) {
            // They don't have any cards, so safe to get any random card
            return GetCardsHelper.GetRandomCardByRarity(rarity);
        }

        const allCards = CoreClient.Cards
            .flatMap(x => x.cards)
            .filter(x => x.type == rarity)
            .filter(x => !claimedCards.find(y => y.CardNumber == x.id && y.Quantity > 0));

        if (!allCards || allCards.length == 0) {
            // There is no card left unclaimed, fallback to any card
            return GetCardsHelper.GetRandomCardByRarity(rarity);
        };

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const card = allCards[randomCardIndex];

        if (!card) {
            AppLogger.LogError("CardDropHelperMetadata/GetRandomCardByRarityUnclaimed", `Card not found in index, ${randomCardIndex} of ${allCards.length}, User Id: ${userId}, rarity: ${rarity}`);

            return undefined;
        }

        const series = CoreClient.Cards
            .find(x => x.cards.includes(card));

        if (!series) {
            AppLogger.LogError("CardDropHelperMetadata/GetRandomCardByRarityUnclaimed", `Series not found for card ${card.id}, User Id: ${userId}, rarity: ${rarity}`);

            return undefined;
        }

        return {
            series: series,
            card: card,
        };
    }
}
