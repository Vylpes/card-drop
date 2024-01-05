import { CardRarity } from "../constants/CardRarity";

export interface SeriesMetadata {
    id: number,
    name: string,
    cards: CardMetadata[],
}

export interface CardMetadata {
    id: string,
    name: string,
    type: CardRarity,
    path: string,
}

export interface DropResult {
    series: SeriesMetadata,
    card: CardMetadata,
}