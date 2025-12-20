import AppLogger from "../../client/appLogger";
import { CoreClient } from "../../client/client";
import CardConstants from "../../constants/CardConstants";
import { CardRarity } from "../../constants/CardRarity";
import CardRarityChances from "../../constants/CardRarityChances";
import { DropResult } from "../../contracts/SeriesMetadata";
import EffectHelper from "../EffectHelper";
import GetUnclaimedCardsHelper from "./GetUnclaimedCardsHelper";

export default class GetCardsHelper {
    public static async FetchCard(userId: string): Promise<DropResult | undefined> {
        const hasChanceUpEffect = await EffectHelper.HasEffect(userId, "unclaimed");

        if (hasChanceUpEffect && Math.random() <= CardConstants.UnusedChanceUpChance) {
            return await GetUnclaimedCardsHelper.GetRandomCardUnclaimed(userId);
        }

        return await this.GetRandomCard(userId);
    }

    public static async GetRandomCard(userId?: string): Promise<DropResult | undefined> {
        let bronzeChance = CardRarityChances.Bronze;
        let silverChance = CardRarityChances.Silver;
        let goldChance = CardRarityChances.Gold;
        let mangaChance = CardRarityChances.Manga;
        let legendaryChance = 0.6;

        if (userId) {
            const hasGoldEffect = await EffectHelper.HasEffect(userId, "goldchanceup");
            const hasLegendaryEffect = await EffectHelper.HasEffect(userId, "legendarychanceup");
            const hasMangaEffect = await EffectHelper.HasEffect(userId, "mangachanceup");

            if (hasGoldEffect) {
                const boostedChance = goldChance * 2;
                const chanceToRemove = boostedChance - goldChance;
                const chancePerOther = chanceToRemove / 4;

                bronzeChance -= chancePerOther;
                silverChance -= chancePerOther;
                goldChance = boostedChance;
                mangaChance -= chancePerOther;
                legendaryChance -= chancePerOther;
            } else if (hasLegendaryEffect) {
                const boostedChance = legendaryChance * 2;
                const chanceToRemove = boostedChance - legendaryChance;
                const chancePerOther = chanceToRemove / 4;

                bronzeChance -= chancePerOther;
                silverChance -= chancePerOther;
                goldChance -= chancePerOther;
                mangaChance -= chancePerOther;
                legendaryChance = boostedChance;
            } else if (hasMangaEffect) {
                const boostedChance = mangaChance * 2;
                const chanceToRemove = boostedChance - mangaChance;
                const chancePerOther = chanceToRemove / 4;

                bronzeChance -= chancePerOther;
                silverChance -= chancePerOther;
                goldChance -= chancePerOther;
                mangaChance = boostedChance;
                legendaryChance -= chancePerOther;
            }
        }

        const randomRarity = Math.random() * 100;

        let cardRarity: CardRarity;

        const bronzeThreshold = bronzeChance;
        const silverThreshold = bronzeThreshold + silverChance;
        const goldThreshold = silverThreshold + goldChance;
        const mangaThreshold = goldThreshold + mangaChance;

        if (randomRarity < bronzeThreshold) cardRarity = CardRarity.Bronze;
        else if (randomRarity < silverThreshold) cardRarity = CardRarity.Silver;
        else if (randomRarity < goldThreshold) cardRarity = CardRarity.Gold;
        else if (randomRarity < mangaThreshold) cardRarity = CardRarity.Manga;
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
            AppLogger.LogError("CardDropHelperMetadata/GetRandomCardByRarity", `Series not found for card ${card.id}`);

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
            return undefined;
        }

        return { card, series };
    }
}
