import AppLogger from "../../client/appLogger";
import { CoreClient } from "../../client/client";
import { CardRarity } from "../../constants/CardRarity";
import CardRarityChances from "../../constants/CardRarityChances";
import { DropResult } from "../../contracts/SeriesMetadata";

export default class GetCardsHelper {
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
}
