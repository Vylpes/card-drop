import EmbedColours from "./EmbedColours";

export enum CardRarity {
    Bronze,
    Silver,
    Gold,
    Legendary,
}

export function CardRarityToString(rarity: CardRarity): string {
    switch (rarity) {
        case CardRarity.Bronze:
            return "Bronze";
        case CardRarity.Silver:
            return "Silver";
        case CardRarity.Gold:
            return "Gold";
        case CardRarity.Legendary:
            return "Legendary";
    }
}

export function CardRarityToColour(rarity: CardRarity): number {
    switch (rarity) {
        case CardRarity.Bronze:
            return EmbedColours.BronzeCard;
        case CardRarity.Silver:
            return EmbedColours.SilverCard;
        case CardRarity.Gold:
            return EmbedColours.GoldCard;
        case CardRarity.Legendary:
            return EmbedColours.LegendaryCard;
    }
}