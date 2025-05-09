import EmbedColours from "./EmbedColours";

export enum CardRarity {
    Unknown,
    Bronze,
    Silver,
    Gold,
    Manga,
    Legendary,
}

export const CardRarityChoices = [
    {
        name: "Bronze",
        value: "bronze",
    },
    {
        name: "Silver",
        value: "silver",
    },
    {
        name: "Gold",
        value: "gold",
    },
    {
        name: "Manga",
        value: "manga",
    },
    {
        name: "Legendary",
        value: "legendary",
    },
];

export function CardRarityToString(rarity: CardRarity): string {
    switch (rarity) {
    case CardRarity.Unknown:
        return "Unknown";
    case CardRarity.Bronze:
        return "Bronze";
    case CardRarity.Silver:
        return "Silver";
    case CardRarity.Gold:
        return "Gold";
    case CardRarity.Legendary:
        return "Legendary";
    case CardRarity.Manga:
        return "Manga";
    }
}

export function CardRarityToColour(rarity: CardRarity): number {
    switch (rarity) {
    case CardRarity.Unknown:
        return EmbedColours.Grey;
    case CardRarity.Bronze:
        return EmbedColours.BronzeCard;
    case CardRarity.Silver:
        return EmbedColours.SilverCard;
    case CardRarity.Gold:
        return EmbedColours.GoldCard;
    case CardRarity.Legendary:
        return EmbedColours.LegendaryCard;
    case CardRarity.Manga:
        return EmbedColours.MangaCard;
    }
}

export function CardRarityParse(rarity: string): CardRarity {
    switch (rarity.toLowerCase()) {
    case "bronze":
        return CardRarity.Bronze;
    case "silver":
        return CardRarity.Silver;
    case "gold":
        return CardRarity.Gold;
    case "legendary":
        return CardRarity.Legendary;
    case "manga":
        return CardRarity.Manga;
    default:
        return CardRarity.Unknown;
    }
}

export function GetSacrificeAmount(rarity: CardRarity): number {
    switch (rarity) {
    case CardRarity.Bronze:
        return 5;
    case CardRarity.Silver:
        return 10;
    case CardRarity.Gold:
        return 30;
    case CardRarity.Manga:
        return 40;
    case CardRarity.Legendary:
        return 100;
    default:
        return 0;
    }
}