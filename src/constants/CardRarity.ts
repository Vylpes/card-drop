import EmbedColours from "./EmbedColours";

export enum CardRarity {
    Unknown,
    Bronze,
    Silver,
    Gold,
    Manga,
    Legendary,
}

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
        case CardRarity.Manga:
            return "Manga";
        case CardRarity.Legendary:
            return "Legendary";
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
        case CardRarity.Manga:
            return EmbedColours.MangaCard;
        case CardRarity.Legendary:
            return EmbedColours.LegendaryCard;
    }
}