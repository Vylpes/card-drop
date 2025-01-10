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

        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardUnclaimed", `Random card: ${randomCard?.card.id} ${randomCard?.card.name}`);

        return randomCard;
    }

    public static async GetRandomCardByRarityUnclaimed(rarity: CardRarity, userId: string): Promise<DropResult | undefined> {
        AppLogger.LogSilly("CardDropHelperMetadata/GetRandomCardByRarityUnclaimed", `Parameters: rarity=${rarity}, userId=${userId}`);

        const claimedCards = await Inventory.FetchAllByUserId(userId);

        if (!claimedCards) {
            // They don't have any cards, so safe to get any random card
            return GetCardsHelper.GetRandomCardByRarity(rarity);
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
}
