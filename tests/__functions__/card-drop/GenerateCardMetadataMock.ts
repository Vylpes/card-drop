import { CardMetadata } from "../../../src/contracts/SeriesMetadata";
import { CardRarity } from "../../../src/constants/CardRarity";

export default function GenerateCardMetadataMock(id: string, overrides?: Partial<CardMetadata>): CardMetadata {
    return {
        id,
        name: `Card ${id}`,
        type: CardRarity.Bronze,
        path: `path${id}`,
        ...overrides,
    };
}
