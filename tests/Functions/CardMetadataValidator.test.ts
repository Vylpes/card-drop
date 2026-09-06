import { CardRarity } from "../../src/constants/CardRarity";
import {
    isValidCardRarity,
    validateSeriesMetadataFile,
} from "../../src/Functions/CardMetadataValidator";

const filePath = "/data/cards/Series 1/1.json";

function validSeries(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        name: "Series 1",
        cards: [
            {
                id: "1000",
                name: "Card 1000",
                type: CardRarity.Bronze,
                path: "Series 1/BRONZE/1000.jpg",
            },
        ],
        ...overrides,
    };
}

function validCard(overrides: Record<string, unknown> = {}) {
    return {
        id: "1000",
        name: "Card 1000",
        type: CardRarity.Bronze,
        path: "Series 1/BRONZE/1000.jpg",
        ...overrides,
    };
}

describe("isValidCardRarity", () => {
    test.each([
        CardRarity.Unknown,
        CardRarity.Bronze,
        CardRarity.Silver,
        CardRarity.Gold,
        CardRarity.Manga,
        CardRarity.Legendary,
    ])("ACCEPTS numeric rarity %p", (rarity) => {
        expect(isValidCardRarity(rarity)).toBe(true);
    });

    test.each([
        "1",
        "bronze",
        null,
        undefined,
        true,
        1.5,
        NaN,
        6,
        -1,
        {},
        [],
    ])("REJECTS %p", (value) => {
        expect(isValidCardRarity(value)).toBe(false);
    });
});

describe("validateSeriesMetadataFile", () => {
    test("ACCEPTS valid numeric type", () => {
        const result = validateSeriesMetadataFile([validSeries()], filePath);

        expect(result).toHaveLength(1);
        expect(result[0].cards[0].type).toBe(CardRarity.Bronze);
        expect(result[0].cards[0].id).toBe("1000");
    });

    test("ACCEPTS optional subseries and colour strings", () => {
        const result = validateSeriesMetadataFile([
            validSeries({
                cards: [
                    validCard({
                        subseries: "Other",
                        colour: "#ffffff",
                    }),
                ],
            }),
        ], filePath);

        expect(result[0].cards[0].subseries).toBe("Other");
        expect(result[0].cards[0].colour).toBe("#ffffff");
    });

    test("REJECTS string type \"1\"", () => {
        expect(() => validateSeriesMetadataFile([
            validSeries({
                cards: [validCard({ type: "1" })],
            }),
        ], filePath)).toThrow(/card 1000: type must be an integer CardRarity/);
    });

    test("REJECTS missing type", () => {
        const card = validCard();
        delete (card as { type?: unknown }).type;

        expect(() => validateSeriesMetadataFile([
            validSeries({ cards: [card] }),
        ], filePath)).toThrow(/card 1000: type must be an integer CardRarity.*undefined/);
    });

    test("REJECTS null type", () => {
        expect(() => validateSeriesMetadataFile([
            validSeries({
                cards: [validCard({ type: null })],
            }),
        ], filePath)).toThrow(/card 1000: type must be an integer CardRarity.*null/);
    });

    test("REJECTS non-numeric garbage type", () => {
        expect(() => validateSeriesMetadataFile([
            validSeries({
                cards: [validCard({ type: "bronze" })],
            }),
        ], filePath)).toThrow(/card 1000: type must be an integer CardRarity.*"bronze"/);
    });

    test("REJECTS out-of-range type", () => {
        expect(() => validateSeriesMetadataFile([
            validSeries({
                cards: [validCard({ type: 99 })],
            }),
        ], filePath)).toThrow(/card 1000: type must be an integer CardRarity.*99/);
    });

    test("REJECTS non-array root", () => {
        expect(() => validateSeriesMetadataFile(validSeries(), filePath))
            .toThrow(/root value must be an array/);
    });

    test("COERCES numeric-string series id", () => {
        const result = validateSeriesMetadataFile([
            validSeries({ id: "28" }),
        ], filePath);

        expect(result[0].id).toBe(28);
    });

    test("REJECTS non-numeric series id", () => {
        expect(() => validateSeriesMetadataFile([
            validSeries({ id: "abc" }),
        ], filePath)).toThrow(/id must be an integer or numeric string.*"abc"/);
    });

    test("includes file path in error messages", () => {
        expect(() => validateSeriesMetadataFile([
            validSeries({
                cards: [validCard({ type: "1" })],
            }),
        ], filePath)).toThrow(filePath);
    });
});
