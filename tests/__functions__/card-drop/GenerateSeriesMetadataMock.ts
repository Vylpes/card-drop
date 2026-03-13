import { SeriesMetadata, CardMetadata } from "../../../src/contracts/SeriesMetadata";

export default function GenerateSeriesMetadataMock(id: number, cards: CardMetadata[], overrides?: Partial<SeriesMetadata>): SeriesMetadata {
    return {
        id,
        name: `Series ${id}`,
        cards,
        ...overrides,
    };
}
