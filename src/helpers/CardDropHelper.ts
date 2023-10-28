import { CardRarity } from "../constants/CardRarity";
import CardRarityChances from "../constants/CardRarityChances";
import Card from "../database/entities/card/Card";
import Series from "../database/entities/card/Series";

export default class CardDropHelper {
    public static async GetRandomCard(): Promise<Card> {
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

        const allSeries = await Series.FetchAll(Series, [ "Cards", "Cards.Series" ]);
        const allSeriesWithCards = allSeries.filter(x => x.Cards.length > 0 && x.Cards.find(x => x.Rarity == cardRarity));

        const randomSeriesIndex = Math.floor(Math.random() * allSeriesWithCards.length);

        const randomSeries = allSeriesWithCards[randomSeriesIndex];

        const allCards = randomSeries.Cards.filter(x => x.Rarity == cardRarity && x.Path && x.FileName);

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const randomCard = allCards[randomCardIndex];

        return randomCard;
    }

    public static async GetRandomCardByRarity(rarity: CardRarity): Promise<Card> {
        const allCards = await Card.FetchAllByRarity(rarity, [ "Series" ]);

        const randomCardIndex = Math.floor(Math.random() * allCards.length);

        const card = allCards[randomCardIndex];

        return card;
    }
}